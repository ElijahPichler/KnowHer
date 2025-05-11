import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { DateNightScreenProps } from '../navigation/NavigationTypes';
import { COLORS, FONT_SIZES, SPACING, SHADOWS } from '../constants/colors';
import { getDateNights, logDateNight, getDateNightStreak } from '../services/firestore';
import { DateNight, DateIdea } from '../types';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import DateIdeaComponent from '../components/DateNight/DateIdea';

// Mock date ideas (would normally come from a database or API)
const mockDateIdeas: DateIdea[] = [
  {
    id: '1',
    title: 'Romantic Dinner',
    description: 'Take your wife to her favorite restaurant for a special meal together.',
    category: 'romantic',
    estimatedCost: '$$',
    imageUrl: undefined,
  },
  {
    id: '2',
    title: 'Movie Night',
    description: 'Choose a movie you both enjoy and create a cozy home theater experience.',
    category: 'relaxation',
    estimatedCost: '$',
    imageUrl: undefined,
  },
  {
    id: '3',
    title: 'Outdoor Adventure',
    description: 'Go hiking, biking, or walking in a scenic park or nature trail.',
    category: 'adventure',
    estimatedCost: '$',
    imageUrl: undefined,
  },
  {
    id: '4',
    title: 'Art Gallery or Museum',
    description: 'Explore local culture and art at a museum or gallery exhibition.',
    category: 'cultural',
    estimatedCost: '$',
    imageUrl: undefined,
  },
  {
    id: '5',
    title: 'Cooking Class',
    description: 'Learn to cook a new dish together in a fun and interactive cooking class.',
    category: 'food',
    estimatedCost: '$$',
    imageUrl: undefined,
  },
];

const DateNightScreen: React.FC<DateNightScreenProps> = () => {
  // Get safe area insets
  const insets = useSafeAreaInsets();

  // State variables
  const [dateNights, setDateNights] = useState<(DateNight & { id: string })[]>([]);
  const [dateNightStreak, setDateNightStreak] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');
  const [activityType, setActivityType] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Get current user from auth context
  const { currentUser } = useAuth();

  // Fetch data from Firestore
  const fetchData = async () => {
    if (!currentUser) return;

    try {
      // Fetch date nights
      const dateNightsResult = await getDateNights(currentUser.uid);
      if (dateNightsResult.success) {
        setDateNights(dateNightsResult.data);
      }

      // Fetch date night streak
      const streakResult = await getDateNightStreak(currentUser.uid);
      if (streakResult.success) {
        setDateNightStreak(streakResult.streak);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [currentUser])
  );

  // Handle date change in date picker
  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  // Calculate days until next date night
  const calculateDaysUntilNextDateNight = () => {
    if (dateNights.length === 0) {
      return 0; // No date nights yet
    }

    // Get the most recent date night
    const latestDateNight = dateNights[0]; // Assuming dateNights is sorted desc by date
    const latestDate = latestDateNight.date.toDate();
    
    // Calculate target date (7 days after the latest date night)
    const targetDate = new Date(latestDate);
    targetDate.setDate(targetDate.getDate() + 7);
    
    // Calculate days until target date
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  // Handle log date night submission
  const handleSubmitDateNight = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to log a date night.');
      return;
    }

    setIsLoading(true);
    try {
      const newDateNight: DateNight = {
        date: Timestamp.fromDate(selectedDate),
        notes: notes.trim(),
        activity: activityType.trim(),
      };

      const result = await logDateNight(currentUser.uid, newDateNight);
      
      if (result.success) {
        setModalVisible(false);
        // Reset form fields
        setSelectedDate(new Date());
        setNotes('');
        setActivityType('');
        
        // Refresh data
        fetchData();
        
        Alert.alert('Success', 'Date night logged successfully!');
      } else {
        throw new Error('Failed to log date night');
      }
    } catch (error) {
      console.error('Error logging date night:', error);
      Alert.alert('Error', 'Failed to log date night. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View 
      style={[
        styles.container, 
        { 
          // Apply safe area insets
          paddingTop: insets.top > 0 ? insets.top : SPACING.lg,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right
        }
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Date Night Tracker Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date Night Tracker</Text>
          
          <Card style={styles.trackerCard}>
            <View style={styles.trackerContent}>
              <View style={styles.trackerInfo}>
                <Text style={styles.trackerLabel}>
                  {dateNightStreak > 0
                    ? 'Your current streak'
                    : 'Start your streak'}
                </Text>
                <View style={styles.streakContainer}>
                  <Text style={styles.streakCount}>{dateNightStreak}</Text>
                  <Text style={styles.streakText}>
                    {dateNightStreak === 1 ? 'week' : 'weeks'}
                  </Text>
                </View>
                
                <Text style={styles.nextDateText}>
                  {calculateDaysUntilNextDateNight() > 0
                    ? `${calculateDaysUntilNextDateNight()} days until your next date night`
                    : 'Time for another date night!'}
                </Text>
              </View>
              
              <Button
                title="Log Date Night"
                onPress={() => setModalVisible(true)}
                style={styles.logButton}
              />
            </View>
          </Card>
        </View>

        {/* Date Ideas Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date Ideas</Text>
          <Text style={styles.sectionDescription}>
            Here are some suggestions to make your next date night special.
          </Text>
          
          <View style={styles.searchBarDisabled}>
            <Ionicons name="search" size={20} color={COLORS.mediumGray} />
            <Text style={styles.searchPlaceholder}>
              Search for nearby food and events (coming soon)
            </Text>
          </View>
          
          {mockDateIdeas.map(idea => (
            <DateIdeaComponent key={idea.id} dateIdea={idea} />
          ))}
        </View>
      </ScrollView>

      {/* Log Date Night Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={[
            styles.modalContent,
            {
              // Apply safe area insets to modal content
              marginBottom: insets.bottom > 0 ? insets.bottom : SPACING.lg
            }
          ]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Date Night</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={COLORS.darkGray} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Date</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.datePickerText}>
                  {selectedDate.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Activity Type (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={activityType}
                onChangeText={setActivityType}
                placeholder="E.g., Dinner, Movie, Walk, etc."
                placeholderTextColor={COLORS.mediumGray}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textAreaInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any notes about your date night"
                placeholderTextColor={COLORS.mediumGray}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            
            <Button
              title="Save"
              onPress={handleSubmitDateNight}
              loading={isLoading}
              disabled={isLoading}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  scrollContainer: {
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: SPACING.xs,
  },
  sectionDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.mediumGray,
    marginBottom: SPACING.md,
  },
  trackerCard: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
  },
  trackerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackerInfo: {
    flex: 1,
  },
  trackerLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.mediumGray,
    marginBottom: SPACING.xs,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.xs,
  },
  streakCount: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: SPACING.xs,
  },
  streakText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.darkGray,
  },
  nextDateText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.darkGray,
  },
  logButton: {
    width: 120,
  },
  searchBarDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  searchPlaceholder: {
    marginLeft: SPACING.sm,
    color: COLORS.mediumGray,
    fontSize: FONT_SIZES.sm,
  },
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
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  formLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.darkGray,
    marginBottom: SPACING.xs,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  datePickerText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.darkGray,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.darkGray,
  },
  textAreaInput: {
    height: 100,
    textAlignVertical: 'top',
  },
});

export default DateNightScreen;