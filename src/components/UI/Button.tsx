import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, BORDER_RADIUS, FONT_SIZES, SPACING } from '../../constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  type = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  // Determine button style based on type
  const getButtonStyle = (): ViewStyle => {
    switch (type) {
      case 'primary':
        return {
          backgroundColor: disabled ? COLORS.mediumGray : COLORS.primary,
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? COLORS.lightGray : COLORS.secondary,
        };
      case 'outline':
        return {
          backgroundColor: COLORS.transparent,
          borderWidth: 1,
          borderColor: disabled ? COLORS.mediumGray : COLORS.primary,
        };
      case 'text':
        return {
          backgroundColor: COLORS.transparent,
        };
      default:
        return {
          backgroundColor: disabled ? COLORS.mediumGray : COLORS.primary,
        };
    }
  };

  // Determine text color based on type
  const getTextColor = (): string => {
    switch (type) {
      case 'primary':
        return COLORS.white;
      case 'secondary':
        return COLORS.black;
      case 'outline':
      case 'text':
        return disabled ? COLORS.mediumGray : COLORS.primary;
      default:
        return COLORS.white;
    }
  };

  // Determine button size
  const getButtonSize = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: SPACING.xs,
          paddingHorizontal: SPACING.sm,
          borderRadius: BORDER_RADIUS.sm,
        };
      case 'medium':
        return {
          paddingVertical: SPACING.sm,
          paddingHorizontal: SPACING.md,
          borderRadius: BORDER_RADIUS.md,
        };
      case 'large':
        return {
          paddingVertical: SPACING.md,
          paddingHorizontal: SPACING.lg,
          borderRadius: BORDER_RADIUS.md,
        };
      default:
        return {
          paddingVertical: SPACING.sm,
          paddingHorizontal: SPACING.md,
          borderRadius: BORDER_RADIUS.md,
        };
    }
  };

  // Determine text size
  const getTextSize = (): number => {
    switch (size) {
      case 'small':
        return FONT_SIZES.sm;
      case 'medium':
        return FONT_SIZES.md;
      case 'large':
        return FONT_SIZES.lg;
      default:
        return FONT_SIZES.md;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        getButtonSize(),
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              styles.text,
              { color: getTextColor(), fontSize: getTextSize() },
              icon && styles.textWithIcon,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  textWithIcon: {
    marginLeft: SPACING.xs,
  },
});

export default Button;