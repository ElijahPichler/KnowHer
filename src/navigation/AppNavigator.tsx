import React from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppStackParamList, TabParamList } from './NavigationTypes';
import { COLORS, SPACING } from '../constants/colors';

// Screens
import WifeInfoScreen from '../screens/WifeInfoScreen';
import DateNightScreen from '../screens/DateNightScreen';
import PeriodTrackerScreen from '../screens/PeriodTrackerScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const MainTabs: React.FC = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          
          if (route.name === 'PeriodTracker') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'WifeInfo') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'DateNight') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else {
            iconName = 'help-circle';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.mediumGray,
        tabBarStyle: {
          height: 60 + (insets.bottom > 0 ? insets.bottom - 5 : 10), // Adjust height for bottom safe area
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 5,
          borderTopColor: COLORS.lightGray,
          borderTopWidth: 1,
          elevation: 8,
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowColor: COLORS.black,
          shadowOffset: { width: 0, height: -2 },
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          paddingBottom: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="PeriodTracker" 
        component={PeriodTrackerScreen}
        options={{ tabBarLabel: 'Period' }}
      />
      <Tab.Screen 
        name="WifeInfo" 
        component={WifeInfoScreen}
        options={{ tabBarLabel: 'Wife Info' }}
      />
      <Tab.Screen 
        name="DateNight" 
        component={DateNightScreen}
        options={{ tabBarLabel: 'Date Night' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          headerShown: true,
          title: 'Profile',
          headerTintColor: COLORS.white,
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;