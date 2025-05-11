import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MenstrualPhase } from '../../types';
import { COLORS, FONT_SIZES, SPACING } from '../../constants/colors';
import Card from '../UI/Card';
import { Ionicons } from '@expo/vector-icons';

interface PhaseDetailsProps {
  phase: MenstrualPhase;
  daysIn?: number;
  daysUntil?: number;
  daysLate?: number;
  hasLoggedPeriod: boolean;
  isActivePeriod: boolean;
  isLate?: boolean;
}

const STANDARD_CYCLE_LENGTH = 28; // standard cycle length in days

const PhaseDetails: React.FC<PhaseDetailsProps> = ({
  phase,
  daysIn,
  daysUntil,
  daysLate,
  hasLoggedPeriod = false,
  isActivePeriod = false,
  isLate = false
}) => {
  // Get phase icon
  const getPhaseIcon = () => {
    // If no period has been logged yet
    if (!hasLoggedPeriod) {
      return <Ionicons name="add-circle" size={24} color={COLORS.primary} />;
    }
    
    // Late period
    if (isLate) {
      return <Ionicons name="alert-circle" size={24} color={COLORS.primary} />;
    }
    
    switch (phase) {
      case 'menstrual':
        return <Ionicons name="water" size={24} color={COLORS.primary} />;
      case 'follicular':
        return <Ionicons name="leaf" size={24} color={COLORS.primary} />;
      case 'ovulatory':
        return <Ionicons name="egg" size={24} color={COLORS.primary} />;
      case 'luteal':
        return <Ionicons name="moon" size={24} color={COLORS.primary} />;
      case 'late':
        return <Ionicons name="alert-circle" size={24} color={COLORS.primary} />;
      default:
        return <Ionicons name="fitness" size={24} color={COLORS.primary} />;
    }
  };

  // Generate phase description text
  const getPhaseDescription = () => {
    // If never logged a period
    if (!hasLoggedPeriod) {
      return "Track your menstrual cycle to get personalized insights and predictions. Start by logging your first period when it begins.";
    }
    
    // Late period
    if (isLate) {
      return `Your period is ${daysLate} ${daysLate === 1 ? 'day' : 'days'} late. This can happen due to various factors including stress, lifestyle changes, or pregnancy.`;
    }
    
    switch (phase) {
      case 'menstrual':
        return `Day ${daysIn !== undefined ? daysIn + 1 : '?'} of your period. This is when your uterine lining is shed through the vagina. This phase typically lasts 3-7 days.`;
      case 'follicular':
        return `Your body is preparing eggs for potential release. Estrogen levels rise, rebuilding the uterine lining. Energy, mood, and confidence tend to increase during this phase.`;
      case 'ovulatory':
        return `Ovulation occurs when an egg is released from the ovary. This is your most fertile time. You might notice changes in cervical fluid, a slight rise in body temperature, or mild pain on one side.`;
      case 'luteal':
        return `After ovulation, your body prepares for either pregnancy or menstruation. You might experience PMS symptoms like mood changes, breast tenderness, or bloating as this phase progresses.`;
      case 'late':
        return `Your period is ${daysLate} ${daysLate === 1 ? 'day' : 'days'} late. Consider taking a pregnancy test if you're sexually active, or consult a healthcare provider if you're concerned.`;
      default:
        return "Track your cycle regularly to see personalized insights and predictions about your menstrual health.";
    }
  };

  // Get phase-specific suggestions
  const getPhaseSuggestions = () => {
    // If never logged a period
    if (!hasLoggedPeriod) {
      return [
        "Have period products ready for when your cycle begins",
        "Consider using this app to track symptoms and moods",
        "Set reminders to log your period when it starts",
        "Plan ahead by learning about your cycle phases",
        "Prepare a period kit with essentials you might need"
      ];
    }
    
    // Late period
    if (isLate) {
      return [
        "Consider taking a pregnancy test if you're sexually active",
        "Remember that stress, illness, and lifestyle changes can affect cycle timing",
        "Stay hydrated and maintain regular exercise and sleep patterns",
        "Track any symptoms you're experiencing",
        "Consult with a healthcare provider if your period is significantly delayed"
      ];
    }
    
    switch (phase) {
      case 'menstrual':
        return [
          "Rest when needed and don't overexert yourself",
          "Stay hydrated and consume iron-rich foods",
          "Use a heating pad for cramp relief",
          "Gentle movement like walking or yoga may help with cramps",
          "Track your symptoms and flow levels"
        ];
      case 'follicular':
        return [
          "Good time for high-intensity workouts",
          "Focus on nutrient-dense foods",
          "Your energy is rising, good time for starting new projects",
          "Schedule important meetings when your confidence is high",
          "Socialize and connect with others"
        ];
      case 'ovulatory':
        return [
          "Use protection if you're not trying to conceive",
          "Channel your peak energy into challenging tasks",
          "Great time for important conversations and presentations",
          "Stay hydrated - you might notice changes in cervical fluid",
          "Track any ovulation symptoms like mild pain or spotting"
        ];
      case 'luteal':
        return [
          "Practice self-care as PMS symptoms may appear",
          "Gentle exercise like walking or yoga may help with mood",
          "Avoid caffeine and alcohol if they worsen symptoms",
          "Prioritize rest and wind down earlier in the evening",
          "Consider magnesium-rich foods to help with cramps and mood"
        ];
      case 'late':
        return [
          "Consider taking a pregnancy test",
          "Stress and lifestyle changes can affect cycle regularity",
          "Continue tracking any symptoms you experience",
          "Consult with a healthcare provider if concerned",
          "Maintain regular self-care routines"
        ];
      default:
        return [
          "Start tracking your period to build cycle awareness",
          "Note physical and emotional changes throughout the month",
          "Establish self-care routines that support your well-being",
          "Stay hydrated and maintain consistent sleep patterns",
          "Consider tracking other symptoms like energy levels and mood"
        ];
    }
  };

  const phaseTitle = () => {
    // If never logged a period
    if (!hasLoggedPeriod) {
      return "Get Started";
    }
    
    // Late period
    if (isLate) {
      return "Period Late";
    }
    
    switch (phase) {
      case 'menstrual':
        return "Menstrual Phase";
      case 'follicular':
        return "Follicular Phase";
      case 'ovulatory':
        return "Ovulation Phase";
      case 'luteal':
        return "Luteal Phase";
      case 'late':
        return "Period Late";
      default:
        return "Track Your Cycle";
    }
  };

  const suggestions = getPhaseSuggestions();

  return (
    <Card style={styles.container}>
      <View style={styles.titleContainer}>
        {getPhaseIcon()}
        <Text style={styles.title}>{phaseTitle()}</Text>
      </View>
      <Text style={styles.description}>{getPhaseDescription()}</Text>
      
      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>Suggestions:</Text>
        {suggestions.map((suggestion, index) => (
          <View key={index} style={styles.suggestionItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
    padding: SPACING.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginLeft: SPACING.sm,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.darkGray,
    marginBottom: SPACING.md,
  },
  suggestionsContainer: {
    marginTop: SPACING.sm,
  },
  suggestionsTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 6,
    marginRight: SPACING.sm,
  },
  suggestionText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.darkGray,
  },
});

export default PhaseDetails;