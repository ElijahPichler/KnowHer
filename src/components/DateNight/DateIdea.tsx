import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DateIdea as DateIdeaType } from '../../types';
import { COLORS, FONT_SIZES, SPACING } from '../../constants/colors';
import Card from '../UI/Card';

interface DateIdeaProps {
  dateIdea: DateIdeaType;
  onPress?: () => void;
}

const DateIdea: React.FC<DateIdeaProps> = ({ dateIdea, onPress }) => {
  // Get an icon based on the category
  const getCategoryIcon = () => {
    switch (dateIdea.category) {
      case 'romantic':
        return 'heart';
      case 'adventure':
        return 'compass';
      case 'relaxation':
        return 'bed';
      case 'cultural':
        return 'book';
      case 'food':
        return 'restaurant';
      default:
        return 'calendar';
    }
  };

  // Get a color based on the category
  const getCategoryColor = () => {
    switch (dateIdea.category) {
      case 'romantic':
        return COLORS.primary;
      case 'adventure':
        return '#4CAF50'; // Green
      case 'relaxation':
        return '#2196F3'; // Blue
      case 'cultural':
        return '#9C27B0'; // Purple
      case 'food':
        return '#FF9800'; // Orange
      default:
        return COLORS.primary;
    }
  };

  // Format cost indicator
  const formatCost = (cost: string) => {
    switch (cost) {
      case '':
        return 'Low Cost';
      case '$':
        return 'Medium Cost';
      case '$':
        return 'High Cost';
      default:
        return 'Varies';
    }
  };

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.headerContainer}>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor() }]}>
          <Ionicons name={getCategoryIcon()} size={16} color={COLORS.white} />
          <Text style={styles.categoryText}>
            {dateIdea.category.charAt(0).toUpperCase() + dateIdea.category.slice(1)}
          </Text>
        </View>
        <Text style={styles.costText}>{formatCost(dateIdea.estimatedCost)}</Text>
      </View>
      
      <Text style={styles.title}>{dateIdea.title}</Text>
      <Text style={styles.description}>{dateIdea.description}</Text>
      
      {dateIdea.imageUrl && (
        <Image 
          source={{ uri: dateIdea.imageUrl }} 
          style={styles.image}
          resizeMode="cover"
        />
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  costText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.mediumGray,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: SPACING.sm,
  },
});

export default DateIdea;