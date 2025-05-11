// App color palette
export const COLORS = {
    // Primary colors
    primary: '#E57373', // Soft red
    primaryLight: '#FFB2B2',
    primaryDark: '#AF4448',
    
    // Secondary colors
    secondary: '#FFECB3', // Cream
    secondaryLight: '#FFF9E6',
    secondaryDark: '#E6D39F',
    
    // Accent colors
    accent: '#D4AF37', // Gold
    accentLight: '#F0E68C',
    accentDark: '#9E7C0C',
    
    // Functional colors
    success: '#66BB6A',
    error: '#F44336',
    warning: '#FFA726',
    info: '#29B6F6',
    
    // Neutrals
    white: '#FFFFFF',
    lightGray: '#F5F5F5',
    mediumGray: '#9E9E9E',
    darkGray: '#616161',
    black: '#212121',
    
    // Transparent colors
    transparent: 'transparent',
    semiTransparent: 'rgba(0, 0, 0, 0.5)',
    
    // Phase-specific colors (for period tracker)
    menstrual: '#E57373', // Red
    follicular: '#81C784', // Green
    ovulatory: '#64B5F6', // Blue
    luteal: '#BA68C8', // Purple
  };
  
  // Font sizes
  export const FONT_SIZES = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  };
  
  // Spacing
  export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  };
  
  // Border radius
  export const BORDER_RADIUS = {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    round: 999,
  };
  
  // Shadows
  export const SHADOWS = {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
  };