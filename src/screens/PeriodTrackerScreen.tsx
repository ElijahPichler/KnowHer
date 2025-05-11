import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PeriodTracker from '../components/PeriodTracker/PeriodTracker';

const PeriodTrackerScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[
      styles.container,
      {
        // We don't add padding here since the PeriodTracker component handles its own insets
        flex: 1
      }
    ]}>
      <PeriodTracker />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFEDEB', // Soft pink background matching the cycle tracker
  },
});

export default PeriodTrackerScreen;