import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { LoginScreenProps } from '../../navigation/NavigationTypes';
import { COLORS, FONT_SIZES, SPACING } from '../../constants/colors';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  // State variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: '',
  });

  // Get auth functions from context
  const { login, loginWithGoogle } = useAuth();

  // Validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(email);
  };

  // Validate form inputs
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      email: '',
      password: '',
      general: '',
    };

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

    setErrors(newErrors);
    return isValid;
  };

  // Handle login
  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login(email, password);
      // Navigation will automatically redirect to the main app
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Failed to login. Please try again.';
      
      if (error instanceof Error) {
        // Format Firebase error messages
        if (error.message.includes('user-not-found')) {
          errorMessage = 'No user found with this email address';
        } else if (error.message.includes('wrong-password')) {
          errorMessage = 'Incorrect password';
        } else if (error.message.includes('too-many-requests')) {
          errorMessage = 'Too many failed login attempts. Please try again later.';
        }
      }
      
      setErrors({
        ...errors,
        general: errorMessage,
      });
      
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      // Navigation will automatically redirect to the main app
    } catch (error) {
      console.error('Google sign-in error:', error);
      Alert.alert(
        'Google Sign-In Failed',
        'Unable to sign in with Google. Please try again.'
      );
    } finally {
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
        <View style={styles.logoContainer}>
          {/* Replace with your app logo */}
          <View style={styles.logo}>
            <Ionicons name="heart" size={60} color={COLORS.primary} />
          </View>
          <Text style={styles.appName}>Wife Companion</Text>
          <Text style={styles.tagline}>Strengthen your relationship</Text>
        </View>

        <View style={styles.formContainer}>
          {errors.general ? (
            <Text style={styles.errorText}>{errors.general}</Text>
          ) : null}
          
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
            placeholder="Enter your password"
            secureTextEntry={true}
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.password}
            icon={<Ionicons name="lock-closed-outline" size={20} color={COLORS.mediumGray} />}
          />
          
          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={() => {
              // TODO: Navigate to forgot password screen
              Alert.alert('Coming Soon', 'Forgot password functionality will be available soon!');
            }}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
          
          <Button
            title="Log In"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.loginButton}
          />
          
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>
          
          <Button
            title="Sign in with Google"
            onPress={handleGoogleSignIn}
            type="outline"
            loading={isLoading}
            disabled={isLoading}
            icon={<Ionicons name="logo-google" size={20} color={COLORS.primary} />}
          />
        </View>
        
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signupText}>Sign Up</Text>
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
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  appName: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  tagline: {
    fontSize: FONT_SIZES.md,
    color: COLORS.darkGray,
  },
  formContainer: {
    marginBottom: SPACING.xl,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.md,
  },
  forgotPasswordText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  loginButton: {
    marginTop: SPACING.md,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  dividerText: {
    paddingHorizontal: SPACING.md,
    color: COLORS.mediumGray,
    fontSize: FONT_SIZES.md,
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
  signupText: {
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

export default LoginScreen;