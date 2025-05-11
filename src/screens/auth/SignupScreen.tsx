import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { SignupScreenProps } from '../../navigation/NavigationTypes';
import { COLORS, FONT_SIZES, SPACING } from '../../constants/colors';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  // State variables
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    firstName: '',
    email: '',
    password: '',
    confirmPassword: '',
    general: '',
  });

  // Get auth function from context
  const { register } = useAuth();

  // Validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(email);
  };

  // Validate form inputs
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      firstName: '',
      email: '',
      password: '',
      confirmPassword: '',
      general: '',
    };

    // Validate first name
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }

    // Validate email
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Validate password
    if (!password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle signup
  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await register(email, password, firstName);
      // Authentication will redirect to the appropriate screen based on isNewUser
      console.log("Registration successful - Firebase will handle redirection");
    } catch (error) {
      console.error('Signup error:', error);
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error instanceof Error) {
        // Format Firebase error messages
        if (error.message.includes('email-already-in-use')) {
          errorMessage = 'This email address is already in use';
        } else if (error.message.includes('invalid-email')) {
          errorMessage = 'Please enter a valid email address';
        } else if (error.message.includes('weak-password')) {
          errorMessage = 'Password is too weak. Please use a stronger password';
        }
      }
      
      setErrors({
        ...errors,
        general: errorMessage,
      });
      
      Alert.alert('Signup Failed', errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.darkGray} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.formContainer}>
          {errors.general ? (
            <Text style={styles.errorText}>{errors.general}</Text>
          ) : null}
          
          <Input
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter your first name"
            autoCapitalize="words"
            error={errors.firstName}
            icon={<Ionicons name="person-outline" size={20} color={COLORS.mediumGray} />}
          />
          
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
            icon={<Ionicons name="mail-outline" size={20} color={COLORS.mediumGray} />}
          />
          
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password"
            secureTextEntry={true}
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.password}
            icon={<Ionicons name="lock-closed-outline" size={20} color={COLORS.mediumGray} />}
          />
          
          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            secureTextEntry={true}
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.confirmPassword}
            icon={<Ionicons name="lock-closed-outline" size={20} color={COLORS.mediumGray} />}
          />
          
          <Button
            title="Create Account"
            onPress={handleSignup}
            loading={isLoading}
            disabled={isLoading}
            style={styles.signupButton}
          />
        </View>
        
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: SPACING.lg,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
    paddingTop: SPACING.md,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  formContainer: {
    marginBottom: SPACING.xl,
  },
  signupButton: {
    marginTop: SPACING.md,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.darkGray,
    marginRight: SPACING.xs,
  },
  loginText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
});

export default SignupScreen;