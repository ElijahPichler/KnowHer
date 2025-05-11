import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONT_SIZES, SPACING } from '../../constants/colors';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import { saveWifeInfo } from '../../services/firestore';
import { WifeInfo } from '../../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const OnboardingScreen: React.FC = () => {
  // Get safe area insets
  const insets = useSafeAreaInsets();

  // Get current user from auth context
  const { currentUser, userData, setIsNewUser } = useAuth();

  // State variables
  const [currentStep, setCurrentStep] = useState(1);
  const [wifeInfo, setWifeInfo] = useState<WifeInfo>({
    firstName: '',
    nickname: '',
    anniversaryDate: undefined,
    favoriteColor: '',
    hobbies: [],
    foodPreferences: [],
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    firstName: '',
    general: '',
  });

  // Format date for display
  const formatDate = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Validate form inputs for each step
  const validateStep = () => {
    let isValid = true;
    const newErrors = {
      firstName: '',
      general: '',
    };

    if (currentStep === 1) {
      // Validate wife's first name in step 1
      if (!wifeInfo.firstName.trim()) {
        newErrors.firstName = 'First name is required';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle date change in date picker
  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
      setWifeInfo({
        ...wifeInfo,
        anniversaryDate: Timestamp.fromDate(date),
      });
    }
  };

  // Handle next step button press
  const handleNextStep = () => {
    if (!validateStep()) return;
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  // Handle back button press
  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!currentUser) {
      setErrors({
        ...errors,
        general: 'You must be logged in to complete onboarding',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Save wife info to Firestore
      const result = await saveWifeInfo(currentUser.uid, wifeInfo);
      
      if (result.success) {
        // Mark user as no longer new (onboarding complete)
        // This will automatically trigger navigation to the main app
        setIsNewUser(false);
      } else {
        throw new Error('Failed to save wife information');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      setErrors({
        ...errors,
        general: 'Failed to save information. Please try again.',
      });
      Alert.alert('Error', 'Failed to save information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update wife info state
  const updateWifeInfo = (key: keyof WifeInfo, value: any) => {
    setWifeInfo({
      ...wifeInfo,
      [key]: value,
    });
  };

  // Handle hobby input (comma-separated list)
  const handleHobbiesInput = (text: string) => {
    const hobbiesArray = text.split(',').map(hobby => hobby.trim()).filter(Boolean);
    updateWifeInfo('hobbies', hobbiesArray);
  };

  // Handle food preferences input (comma-separated list)
  const handleFoodPreferencesInput = (text: string) => {
    const foodPreferencesArray = text.split(',').map(pref => pref.trim()).filter(Boolean);
    updateWifeInfo('foodPreferences', foodPreferencesArray);
  };

  // Total number of steps in onboarding
  const totalSteps = 3;

  // Render progress indicators
  const renderProgressIndicators = () => {
    const indicators = [];
    for (let i = 1; i <= totalSteps; i++) {
      indicators.push(
        <View
          key={i}
          style={[
            styles.progressIndicator,
            i === currentStep ? styles.activeProgressIndicator : {},
          ]}
        />
      );
    }
    return indicators;
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Let's Get Started</Text>
            <Text style={styles.stepDescription}>
              Please enter your wife's name to personalize your experience.
            </Text>
            
            <Input
              label="Wife's First Name (Required)"
              value={wifeInfo.firstName}
              onChangeText={(text) => updateWifeInfo('firstName', text)}
              placeholder="Enter her first name"
              autoCapitalize="words"
              error={errors.firstName}
              icon={<Ionicons name="person-outline" size={20} color={COLORS.mediumGray} />}
            />
            
            <Input
              label="Nickname (Optional)"
              value={wifeInfo.nickname || ''}
              onChangeText={(text) => updateWifeInfo('nickname', text)}
              placeholder="Enter a nickname if you use one"
              autoCapitalize="words"
            />
          </View>
        );
      
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Important Dates</Text>
            <Text style={styles.stepDescription}>
              When is your anniversary? We'll help you remember it.
            </Text>
            
            <View style={styles.datePickerContainer}>
              <Text style={styles.datePickerLabel}>Anniversary Date (Optional)</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.datePickerText}>
                  {selectedDate ? formatDate(selectedDate) : 'Select a date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>
        );
      
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Preferences & Favorites</Text>
            <Text style={styles.stepDescription}>
              Tell us a bit more about your wife's preferences to help personalize recommendations.
            </Text>
            
            <Input
              label="Favorite Color (Optional)"
              value={wifeInfo.favoriteColor || ''}
              onChangeText={(text) => updateWifeInfo('favoriteColor', text)}
              placeholder="E.g., Blue, Purple, etc."
            />
            
            <Input
              label="Hobbies (Optional)"
              value={wifeInfo.hobbies ? wifeInfo.hobbies.join(', ') : ''}
              onChangeText={handleHobbiesInput}
              placeholder="E.g., Reading, Hiking, etc. (separate with commas)"
              multiline
              numberOfLines={2}
            />
            
            <Input
              label="Food Preferences (Optional)"
              value={wifeInfo.foodPreferences ? wifeInfo.foodPreferences.join(', ') : ''}
              onChangeText={handleFoodPreferencesInput}
              placeholder="E.g., Italian, Chocolate, etc. (separate with commas)"
              multiline
              numberOfLines={2}
            />
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={[
      styles.container,
      {
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right
      }
    ]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.headerText}>
                Welcome, {userData?.firstName || 'User'}!
              </Text>
              <View style={styles.progressContainer}>
                {renderProgressIndicators()}
              </View>
            </View>

            {errors.general ? (
              <Text style={styles.errorText}>{errors.general}</Text>
            ) : null}

            {renderStepContent()}

            <View style={styles.buttonsContainer}>
              {currentStep > 1 ? (
                <Button
                  title="Back"
                  onPress={handleBackStep}
                  type="outline"
                  style={styles.backButton}
                />
              ) : (
                <View style={styles.emptyBackButton} />
              )}
              
              <Button
                title={currentStep === totalSteps ? 'Finish' : 'Next'}
                onPress={handleNextStep}
                loading={isLoading}
                disabled={isLoading}
                style={styles.nextButton}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center', // Center content vertically
  },
  contentContainer: {
    padding: SPACING.lg,
    marginVertical: SPACING.xl, // Add vertical margin for better centering
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  headerText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: SPACING.xs,
  },
  activeProgressIndicator: {
    backgroundColor: COLORS.primary,
    width: 12,
    height: 12,
  },
  stepContainer: {
    marginBottom: SPACING.xl,
    alignItems: 'center', // Center step content horizontally
  },
  stepTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.mediumGray,
    marginBottom: SPACING.lg,
    textAlign: 'center',
    maxWidth: '90%', // Prevent description from being too wide
  },
  datePickerContainer: {
    marginBottom: SPACING.md,
    width: '100%',
  },
  datePickerLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.darkGray,
    marginBottom: SPACING.xs,
    fontWeight: '500',
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
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  backButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  nextButton: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  emptyBackButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
});

export default OnboardingScreen;