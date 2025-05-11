import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { COLORS, BORDER_RADIUS, SHADOWS, SPACING } from '../../constants/colors';

interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle;
  cardStyle?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
  shadow?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: number;
  backgroundColor?: string;
  padding?: number;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  cardStyle,
  onPress,
  disabled = false,
  shadow = 'medium',
  borderRadius = BORDER_RADIUS.md,
  backgroundColor = COLORS.white,
  padding = SPACING.md,
  ...props
}) => {
  // Get shadow style based on shadow prop
  const getShadowStyle = () => {
    switch (shadow) {
      case 'none':
        return {};
      case 'small':
        return SHADOWS.small;
      case 'medium':
        return SHADOWS.medium;
      case 'large':
        return SHADOWS.large;
      default:
        return SHADOWS.medium;
    }
  };

  // Common card styles
  const cardStyles = [
    styles.card,
    getShadowStyle(),
    {
      borderRadius,
      backgroundColor,
      padding,
    },
    cardStyle,
  ];

  // If onPress is provided, wrap the card with TouchableOpacity
  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={disabled}
        {...props}
      >
        <View style={cardStyles}>{children}</View>
      </TouchableOpacity>
    );
  }

  // Otherwise, just return the card as a View
  return (
    <View style={[styles.container, style]}>
      <View style={cardStyles}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  card: {
    overflow: 'hidden',
  },
});

export default Card;