import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { ProfileScreenProps } from '../navigation/NavigationTypes';
import { COLORS, FONT_SIZES, SPACING } from '../constants/colors';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  // State variables
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [reminderDays, setReminderDays] = React.useState(2);

  // Get user data and logout function from auth context
  const { userData, logout } = useAuth();

  // Toggle notifications
  const toggleNotifications = () => {
    setNotificationsEnabled(prev => !prev);
    // TODO: Implement notification settings update in Firestore
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will automatically redirect to auth screens
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  // Confirm logout
  const confirmLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          onPress: handleLogout,
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.profileIcon}>
          <Ionicons name="person" size={60} color={COLORS.white} />
        </View>
        <Text style={styles.userName}>{userData?.firstName || 'User'}</Text>
        <Text style={styles.userEmail}>{userData?.email || ''}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        
        <Card style={styles.settingsCard}>
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => {
              // TODO: Navigate to edit profile screen
              Alert.alert('Coming Soon', 'This feature will be available soon!');
            }}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="person-outline" size={24} color={COLORS.darkGray} />
              <Text style={styles.settingText}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
          </TouchableOpacity>
          
          <View style={styles.separator} />
          
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => {
              // TODO: Navigate to wife info edit screen
              Alert.alert('Coming Soon', 'This feature will be available soon!');
            }}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="heart-outline" size={24} color={COLORS.darkGray} />
              <Text style={styles.settingText}>Edit Wife Information</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
          </TouchableOpacity>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Settings</Text>
        
        <Card style={styles.settingsCard}>
          <View style={styles.settingsItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={24} color={COLORS.darkGray} />
              <Text style={styles.settingText}>Enable Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primaryLight }}
              thumbColor={notificationsEnabled ? COLORS.primary : COLORS.mediumGray}
            />
          </View>
          
          <View style={styles.separator} />
          
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => {
              // TODO: Navigate to notification preferences screen
              Alert.alert('Coming Soon', 'This feature will be available soon!');
            }}
            disabled={!notificationsEnabled}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="time-outline" size={24} color={notificationsEnabled ? COLORS.darkGray : COLORS.mediumGray} />
              <Text style={[styles.settingText, !notificationsEnabled && styles.disabledText]}>
                Reminder Days
              </Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, !notificationsEnabled && styles.disabledText]}>
                {reminderDays} days before
              </Text>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={notificationsEnabled ? COLORS.mediumGray : COLORS.lightGray} 
              />
            </View>
          </TouchableOpacity>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        
        <Card style={styles.settingsCard}>
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => {
              // TODO: Navigate to help & support screen
              Alert.alert('Coming Soon', 'This feature will be available soon!');
            }}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="help-circle-outline" size={24} color={COLORS.darkGray} />
              <Text style={styles.settingText}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
          </TouchableOpacity>
          
          <View style={styles.separator} />
          
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => {
              // TODO: Navigate to privacy policy screen
              Alert.alert('Coming Soon', 'This feature will be available soon!');
            }}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="lock-closed-outline" size={24} color={COLORS.darkGray} />
              <Text style={styles.settingText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
          </TouchableOpacity>
          
          <View style={styles.separator} />
          
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => {
              // TODO: Navigate to terms & conditions screen
              Alert.alert('Coming Soon', 'This feature will be available soon!');
            }}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="document-text-outline" size={24} color={COLORS.darkGray} />
              <Text style={styles.settingText}>Terms & Conditions</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
          </TouchableOpacity>
        </Card>
      </View>

      <View style={styles.logoutSection}>
        <Button
          title="Log Out"
          onPress={confirmLogout}
          type="outline"
          style={styles.logoutButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  header: {
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  profileIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  userName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    opacity: 0.8,
  },
  section: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  settingsCard: {
    backgroundColor: COLORS.white,
    padding: 0,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.darkGray,
    marginLeft: SPACING.md,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.mediumGray,
    marginRight: SPACING.xs,
  },
  disabledText: {
    color: COLORS.mediumGray,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: SPACING.md,
  },
  logoutSection: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  logoutButton: {
    alignSelf: 'center',
    width: '80%',
  },
});

export default ProfileScreen;