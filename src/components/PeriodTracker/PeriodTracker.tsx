import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  Modal,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONT_SIZES, SPACING } from '../../constants/colors';
import { 
  getPeriodLogs, 
  logPeriod, 
  getCurrentPhase, 
  getActivePeriod,
  updatePeriodEndDate
} from '../../services/firestore';
import { PeriodLog, MenstrualPhase } from '../../types';

// Import our custom components
import CycleProgress from './CycleProgress';
import PhaseDetails from './PhaseDetails';
import PeriodCalendar from './PeriodCalendar';
import Button from '../UI/Button';
import Card from '../UI/Card';

// Flow options for period start/end
type FlowIntensity = 'light' | 'medium' | 'heavy';

const STANDARD_CYCLE_LENGTH = 28; // standard cycle length in days

const PeriodTracker: React.FC = () => {
  // State variables
  const [periodLogs, setPeriodLogs] = useState<(PeriodLog & { id: string })[]>([]);
  const [currentPhaseData, setCurrentPhaseData] = useState<{
    phase: MenstrualPhase;
    daysIn?: number;
    daysUntil?: number;
    daysLate?: number;
  }>({ phase: 'unknown' });
  const [activePeriod, setActivePeriod] = useState<(PeriodLog & { id: string }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  
  // State for period flow modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<FlowIntensity>('medium');
  const [periodNotes, setPeriodNotes] = useState('');
  const [isEndingPeriod, setIsEndingPeriod] = useState(false);
  
  // Additional state to track if user has ever logged a period
  const [hasLoggedPeriod, setHasLoggedPeriod] = useState(false);
  const [isLate, setIsLate] = useState(false);
  const [daysLate, setDaysLate] = useState(0);

  const insets = useSafeAreaInsets();

  // Get current user from auth context
  const { currentUser } = useAuth();

  // Fetch data from Firestore
  const fetchData = useCallback(async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      
      // Fetch period logs
      const periodLogsResult = await getPeriodLogs(currentUser.uid);
      if (periodLogsResult.success) {
        setPeriodLogs(periodLogsResult.data);
        setHasLoggedPeriod(periodLogsResult.data.length > 0);
      }

      // Fetch current phase
      const phaseResult = await getCurrentPhase(currentUser.uid);
      if (phaseResult.success) {
        setCurrentPhaseData({
          phase: phaseResult.phase as MenstrualPhase,
          daysIn: phaseResult.daysIn,
          daysUntil: phaseResult.daysUntil,
          daysLate: phaseResult.daysLate,
        });
        
        // Set late status
        if (phaseResult.daysLate !== undefined && phaseResult.daysLate > 0) {
          setIsLate(true);
          setDaysLate(phaseResult.daysLate);
        } else {
          setIsLate(false);
          setDaysLate(0);
        }
      }

      // Fetch active period
      const activePeriodResult = await getActivePeriod(currentUser.uid);
      if (activePeriodResult.success) {
        setActivePeriod(activePeriodResult.activePeriod);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [currentUser]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // Handle period button press
  const handlePeriodButtonPress = () => {
    if (activePeriod) {
      // If there's an active period, we're going to end it
      setIsEndingPeriod(true);
      setModalVisible(true);
    } else {
      // If there's no active period, we're going to start a new one
      setIsEndingPeriod(false);
      setModalVisible(true);
    }
    
    // Reset modal values
    setSelectedFlow('medium');
    setPeriodNotes('');
  };

  // Handle period flow selection
  const handleFlowSelection = (flow: FlowIntensity) => {
    setSelectedFlow(flow);
  };

  // Submit period data
  const handleSubmitPeriod = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to track periods.');
      return;
    }

    try {
      setIsLoading(true);
      
      if (isEndingPeriod && activePeriod) {
        // End the current period
        await updatePeriodEndDate(
          currentUser.uid, 
          activePeriod.id, 
          Timestamp.fromDate(new Date()),
          periodNotes.trim() || undefined
        );
        
        Alert.alert('Success', 'Period ended successfully!');
      } else {
        // Start a new period
        const newPeriodLog: PeriodLog = {
          startDate: Timestamp.fromDate(new Date()),
          endDate: null,
          flow: selectedFlow,
          symptoms: [],
          notes: periodNotes.trim() || undefined
        };

        const result = await logPeriod(currentUser.uid, newPeriodLog);
        
        if (!result.success) {
          throw new Error('Failed to log period');
        }
        
        setHasLoggedPeriod(true);
        Alert.alert('Success', 'Period started successfully!');
      }
      
      // Close modal and refresh data
      setModalVisible(false);
      fetchData();
    } catch (error) {
      console.error('Error tracking period:', error);
      Alert.alert('Error', 'Failed to log period data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get appropriate button text based on whether there's an active period
  const getButtonText = () => {
    if (!hasLoggedPeriod) {
      return 'Start Cycle';
    }
    return activePeriod ? 'End Cycle' : 'Start Cycle';
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContainer,
        {
          paddingTop: insets.top > 0 ? insets.top : SPACING.md,
          paddingBottom: insets.bottom > 0 ? insets.bottom : SPACING.md,
          paddingLeft: insets.left + SPACING.md,
          paddingRight: insets.right + SPACING.md,
        }
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Ionicons name="fitness-outline" size={28} color={COLORS.primary} style={styles.headerIcon} />
        <Text style={styles.headerTitle}>Cycle Tracker</Text>
      </View>
      
      {/* Circular Cycle Visualization */}
      <CycleProgress 
        currentPhase={currentPhaseData.phase}
        daysIntoCycle={currentPhaseData.daysIn || 0}
        totalCycleDays={STANDARD_CYCLE_LENGTH}
        hasLoggedPeriod={hasLoggedPeriod}
        isLate={isLate}
        daysLate={daysLate}
      />
      
      {/* Period Tracking Button */}
      <View style={styles.buttonContainer}>
        <Button
          title={getButtonText()}
          onPress={handlePeriodButtonPress}
          style={styles.trackingButton}
          loading={isLoading}
        />
      </View>
      
      {/* Phase Details with Suggestions */}
      <PhaseDetails 
        phase={currentPhaseData.phase}
        daysIn={currentPhaseData.daysIn}
        daysUntil={currentPhaseData.daysUntil}
        daysLate={currentPhaseData.daysLate}
        hasLoggedPeriod={hasLoggedPeriod}
        isActivePeriod={activePeriod !== null}
        isLate={isLate}
      />
      
      {/* Calendar */}
      <PeriodCalendar 
        periodLogs={periodLogs}
        visible={showCalendar}
        onToggleVisibility={() => setShowCalendar(!showCalendar)}
      />
      
      {/* Period Flow Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEndingPeriod ? 'End Cycle' : 'Start Cycle'}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.darkGray} />
              </TouchableOpacity>
            </View>
            
            {!isEndingPeriod && (
              <View style={styles.flowContainer}>
                <Text style={styles.flowLabel}>Select Flow Intensity:</Text>
                <View style={styles.flowOptions}>
                  <TouchableOpacity
                    style={[
                      styles.flowOption,
                      selectedFlow === 'light' && styles.selectedFlowOption
                    ]}
                    onPress={() => handleFlowSelection('light')}
                  >
                    <Text 
                      style={[
                        styles.flowText,
                        selectedFlow === 'light' && styles.selectedFlowText
                      ]}
                    >
                      Light
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.flowOption,
                      selectedFlow === 'medium' && styles.selectedFlowOption
                    ]}
                    onPress={() => handleFlowSelection('medium')}
                  >
                    <Text 
                      style={[
                        styles.flowText,
                        selectedFlow === 'medium' && styles.selectedFlowText
                      ]}
                    >
                      Medium
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.flowOption,
                      selectedFlow === 'heavy' && styles.selectedFlowOption
                    ]}
                    onPress={() => handleFlowSelection('heavy')}
                  >
                    <Text 
                      style={[
                        styles.flowText,
                        selectedFlow === 'heavy' && styles.selectedFlowText
                      ]}
                    >
                      Heavy
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Notes (Optional):</Text>
              <TextInput
                style={styles.notesInput}
                value={periodNotes}
                onChangeText={setPeriodNotes}
                placeholder="Add any notes about your period..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            
            <Button
              title={isEndingPeriod ? 'End Cycle' : 'Start Cycle'}
              onPress={handleSubmitPeriod}
              loading={isLoading}
              style={styles.submitButton}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#FFEDEB', // Soft pink background matching the cycle tracker
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  headerIcon: {
    marginRight: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  buttonContainer: {
    marginVertical: SPACING.md,
  },
  trackingButton: {
    alignSelf: 'center',
    width: '80%',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  flowContainer: {
    marginBottom: SPACING.md,
  },
  flowLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  flowOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flowOption: {
    flex: 1,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    marginHorizontal: SPACING.xs,
    alignItems: 'center',
  },
  selectedFlowOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  flowText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.darkGray,
  },
  selectedFlowText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  notesContainer: {
    marginBottom: SPACING.lg,
  },
  notesLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: SPACING.sm,
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: SPACING.sm,
  },
});

export default PeriodTracker;