import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { WifeInfoScreenProps } from '../navigation/NavigationTypes';
import { COLORS, FONT_SIZES, SPACING, SHADOWS } from '../constants/colors';
import { getWifeInfo, getEvents, getDateNightStreak } from '../services/firestore';
import { WifeInfo, Event } from '../types';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import EventCard from '../components/Wife/EventCard';

const WifeInfoScreen: React.FC<WifeInfoScreenProps> = ({ navigation }) => {
  // Get safe area insets
  const insets = useSafeAreaInsets();

  // State variables
  const [wifeInfo, setWifeInfo] = useState<WifeInfo | null>(null);
  const [events, setEvents] = useState<(Event & { id: string })[]>([]);
  const [dateNightStreak, setDateNightStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Get current user from auth context
  const { currentUser } = useAuth();

  // Fetch data from Firestore
  const fetchData = async () => {
    if (!currentUser) return;

    try {
      // Fetch wife info
      const wifeInfoResult = await getWifeInfo(currentUser.uid);
      if (wifeInfoResult.success) {
        setWifeInfo(wifeInfoResult.data);
      }

      // Fetch events
      const eventsResult = await getEvents(currentUser.uid);
      if (eventsResult.success) {
        setEvents(eventsResult.data);
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

  // Calculate days until anniversary
  const calculateDaysUntilAnniversary = () => {
    if (!wifeInfo?.anniversaryDate) return null;

    const today = new Date();
    const anniversaryDate = wifeInfo.anniversaryDate.toDate();
    
    // Set anniversary to this year
    anniversaryDate.setFullYear(today.getFullYear());
    
    // If anniversary has already passed this year, set it to next year
    if (anniversaryDate < today) {
      anniversaryDate.setFullYear(today.getFullYear() + 1);
    }
    
    // Calculate the difference in days
    const diffTime = Math.abs(anniversaryDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Calculate days until next date night
  const calculateDaysUntilNextDateNight = () => {
    // For simplicity, assume date nights are every 7 days
    // In a real app, you would use the last date night date from Firestore
    return dateNightStreak > 0 ? 7 - (dateNightStreak % 7) : 7;
  };

  // Format anniversary date for display
  const formatAnniversaryDate = () => {
    if (!wifeInfo?.anniversaryDate) return '';
    
    const date = wifeInfo.anniversaryDate.toDate();
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
  };

  // Navigate to Profile screen
  const handleNavigateToProfile = () => {
    navigation.navigate('Profile');
  };

  // Sort events by date (closest first)
  const sortedEvents = [...events].sort((a, b) => {
    return a.date.toDate().getTime() - b.date.toDate().getTime();
  });

  // Filter upcoming events (after today)
  const upcomingEvents = sortedEvents.filter(event => {
    return event.date.toDate() > new Date();
  });

  // Get the next event (closest upcoming event)
  const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;

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
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Your Wife
            </Text>
            <Text style={styles.wifeName}>
              {wifeInfo?.nickname || wifeInfo?.firstName || 'Loading...'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleNavigateToProfile}
          >
            <Ionicons name="person-circle-outline" size={32} color={COLORS.darkGray} />
          </TouchableOpacity>
        </View>

        {/* Upcoming Dates Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Dates</Text>
          
          {/* Anniversary Card */}
          {wifeInfo?.anniversaryDate && (
            <Card style={styles.card}>
              <View style={styles.eventCardContent}>
                <View style={styles.eventIconContainer}>
                  <Ionicons name="heart" size={24} color={COLORS.white} />
                </View>
                <View style={styles.eventDetails}>
                  <Text style={styles.eventTitle}>Anniversary</Text>
                  <Text style={styles.eventDate}>{formatAnniversaryDate()}</Text>
                  <Text style={styles.countdown}>
                    {calculateDaysUntilAnniversary()} days left
                  </Text>
                </View>
              </View>
            </Card>
          )}
          
          {/* Next Date Night Card */}
          <Card style={styles.card}>
            <View style={styles.eventCardContent}>
              <View style={[styles.eventIconContainer, { backgroundColor: COLORS.primary }]}>
                <Ionicons name="calendar" size={24} color={COLORS.white} />
              </View>
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>Next Date Night</Text>
                <Text style={styles.countdown}>
                  {calculateDaysUntilNextDateNight()} days left
                </Text>
              </View>
            </View>
          </Card>
          
          {/* Next Event Card */}
          {nextEvent ? (
            <EventCard event={nextEvent} />
          ) : (
            <Card style={styles.card}>
              <View style={styles.emptyEventCard}>
                <Text style={styles.emptyEventText}>No upcoming events</Text>
                <Button
                  title="Add Event"
                  size="small"
                  onPress={() => {
                    // TODO: Navigate to add event screen or show modal
                    Alert.alert('Coming Soon', 'Add event functionality will be available soon!');
                  }}
                />
              </View>
            </Card>
          )}
          
          <Button
            title="Add Important Date"
            type="outline"
            icon={<Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />}
            onPress={() => {
              // TODO: Navigate to add event screen or show modal
              Alert.alert('Coming Soon', 'Add event functionality will be available soon!');
            }}
            style={styles.addButton}
          />
        </View>

        {/* Date Night Streak Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date Night Streak</Text>
          <Card style={styles.streakCard}>
            <View style={styles.streakContainer}>
              <View style={styles.streakIconContainer}>
                <Ionicons 
                  name={dateNightStreak > 0 ? "flame" : "flame-outline"} 
                  size={36} 
                  color={dateNightStreak > 0 ? COLORS.accent : COLORS.mediumGray} 
                />
              </View>
              <View style={styles.streakDetails}>
                <Text style={styles.streakCount}>{dateNightStreak}</Text>
                <Text style={styles.streakText}>
                  consecutive {dateNightStreak === 1 ? 'week' : 'weeks'}
                </Text>
              </View>
            </View>
            <Text style={styles.streakMessage}>
              {dateNightStreak === 0
                ? "Start your date night streak! Schedule your first date."
                : dateNightStreak < 3
                ? "Great start! Keep the momentum going."
                : "Impressive streak! Your relationship is thriving!"}
            </Text>
          </Card>
        </View>

        {/* Wife's Preferences Section (if available) */}
        {(wifeInfo?.favoriteColor || (wifeInfo?.hobbies && wifeInfo.hobbies.length > 0) || 
          (wifeInfo?.foodPreferences && wifeInfo.foodPreferences.length > 0)) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <Card style={styles.preferencesCard}>
              {wifeInfo?.favoriteColor && (
                <View style={styles.preferenceItem}>
                  <Text style={styles.preferenceLabel}>Favorite Color:</Text>
                  <Text style={styles.preferenceValue}>{wifeInfo.favoriteColor}</Text>
                </View>
              )}
              
              {wifeInfo?.hobbies && wifeInfo.hobbies.length > 0 && (
                <View style={styles.preferenceItem}>
                  <Text style={styles.preferenceLabel}>Hobbies:</Text>
                  <Text style={styles.preferenceValue}>
                    {wifeInfo.hobbies.join(', ')}
                  </Text>
                </View>
              )}
              
              {wifeInfo?.foodPreferences && wifeInfo.foodPreferences.length > 0 && (
                <View style={styles.preferenceItem}>
                  <Text style={styles.preferenceLabel}>Food Preferences:</Text>
                  <Text style={styles.preferenceValue}>
                    {wifeInfo.foodPreferences.join(', ')}
                  </Text>
                </View>
              )}
            </Card>
          </View>
        )}
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  greeting: {
    fontSize: FONT_SIZES.md,
    color: COLORS.darkGray,
  },
  wifeName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  profileButton: {
    padding: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
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
    backgroundColor: COLORS.accent,
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
  emptyEventCard: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  emptyEventText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.mediumGray,
    marginBottom: SPACING.md,
  },
  addButton: {
    marginTop: SPACING.xs,
  },
  streakCard: {
    backgroundColor: COLORS.white,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  streakIconContainer: {
    marginRight: SPACING.md,
  },
  streakDetails: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  streakCount: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginRight: SPACING.xs,
  },
  streakText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.mediumGray,
  },
  streakMessage: {
    fontSize: FONT_SIZES.sm,
    fontStyle: 'italic',
    color: COLORS.darkGray,
  },
  preferencesCard: {
    backgroundColor: COLORS.white,
  },
  preferenceItem: {
    marginBottom: SPACING.sm,
  },
  preferenceLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: SPACING.xs,
  },
  preferenceValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.darkGray,
  },
});

export default WifeInfoScreen;