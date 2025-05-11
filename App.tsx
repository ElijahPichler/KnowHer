import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation';
// Import firebase directly here to ensure it's initialized first
import './src/services/firebase';

export default function App() {
  // Optional: Add a useEffect to verify Firebase initialization
  useEffect(() => {
    console.log('Firebase initialization check in App.js');
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}