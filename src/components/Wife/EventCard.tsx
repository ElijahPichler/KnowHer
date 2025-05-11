import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../../types';
import { COLORS, FONT_SIZES, SPACING } from '../../constants/colors';
import Card from '../UI/Card';

interface EventCardProps {
  event: Event & { id: string };
  onPress?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  // Calculate days until the event
  const calculateDaysUntil = () => {
    const today = new Date();
    const eventDate = event.date.toDate();
    
    // Calculate the difference in days
    const diffTime = Math.abs(eventDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Format event date for display
  const formatEventDate = () => {
    const date = event.date.toDate();
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Choose an icon based on the event title or description
  const getEventIcon = () => {
    const title = event.title.toLowerCase();
    
    if (title.includes('birthday')) {
      return 'gift-outline';
    } else if (title.includes('anniversary')) {
      return 'heart';
    } else if (title.includes('date')) {
      return 'calendar';
    } else {
      return 'star-outline';
    }
  };

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.eventCardContent}>
        <View style={styles.eventIconContainer}>
          <Ionicons name={getEventIcon()} size={24} color={COLORS.white} />
        </View>
        <View style={styles.eventDetails}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDate}>{formatEventDate()}</Text>
          <Text style={styles.countdown}>
            {calculateDaysUntil()} days left
          </Text>
        </View>
      </View>
      {event.description && (
        <Text style={styles.description}>{event.description}</Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.sm,
  },
  eventCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  eventDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.mediumGray,
    marginBottom: SPACING.xs,
  },
  countdown: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.darkGray,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
});

export default EventCard;