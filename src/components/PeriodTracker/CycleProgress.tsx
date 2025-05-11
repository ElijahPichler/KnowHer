import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Path,
  G,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop
} from 'react-native-svg';
import { MenstrualPhase } from '../../types';

interface CycleProgressProps {
  currentPhase: MenstrualPhase;
  daysIntoCycle?: number;
  totalCycleDays: number;
  hasLoggedPeriod: boolean;
  isLate?: boolean;
  daysLate?: number;
}

// Phase configuration with colors
const phaseConfig = {
  menstrual: {
    name: 'MENSTRUATION',
    color: '#FF8A65', // Coral/peach color
    gradient: ['#FF8A65', '#FF7043']
  },
  follicular: {
    name: 'FOLLICULAR',
    color: '#FFAB91', // Lighter peach
    gradient: ['#FFAB91', '#FF9E80']
  },
  ovulatory: {
    name: 'OVULATION',
    color: '#FFCCBC', // Very light peach
    gradient: ['#FFCCBC', '#FFB74D']
  },
  luteal: {
    name: 'LUTEAL',
    color: '#FFAB91', // Lighter peach
    gradient: ['#FFAB91', '#FF9E80']
  },
  late: {
    name: 'LATE',
    color: '#F44336', // Red
    gradient: ['#F44336', '#D32F2F']
  },
  unknown: {
    name: 'GETTING STARTED',
    color: '#E0E0E0', // Light gray
    gradient: ['#E0E0E0', '#BDBDBD']
  }
};

const CIRCLE_SIZE = 200; // 200px diameter
const STROKE_WIDTH = 20; // 20px thick ring
const CENTER = CIRCLE_SIZE / 2;
const RADIUS = CENTER - STROKE_WIDTH / 2;

const CycleProgress: React.FC<CycleProgressProps> = ({
  currentPhase = 'unknown',
  daysIntoCycle = 0,
  totalCycleDays = 28,
  hasLoggedPeriod = false,
  isLate = false,
  daysLate = 0
}) => {
  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (currentPhase === 'unknown' && !hasLoggedPeriod) {
      return 0; // No progress if no periods logged yet
    }
    
    if (isLate) {
      return 100; // Full circle if late
    }
    
    return Math.min(100, (daysIntoCycle / totalCycleDays) * 100);
  };
  
  const progressPercentage = getProgressPercentage();
  
  // Calculate the circumference of the circle
  const circumference = 2 * Math.PI * RADIUS;
  
  // Calculate the stroke-dasharray and stroke-dashoffset
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;
  
  // Get color for current phase
  const getPhaseColors = () => {
    const phase = isLate ? 'late' : currentPhase;
    return phaseConfig[phase]?.gradient || phaseConfig.unknown.gradient;
  };
  
  const phaseColors = getPhaseColors();
  const phaseName = isLate ? 'LATE' : phaseConfig[currentPhase]?.name || 'GETTING STARTED';
  
  // Get text to display in the center
  const getCenterText = () => {
    if (!hasLoggedPeriod) {
      return "Start\nTracking";
    }
    
    if (isLate) {
      return `${daysLate} ${daysLate === 1 ? 'Day' : 'Days'}\nLate`;
    }
    
    return `Day ${daysIntoCycle + 1}\nof ${totalCycleDays}`;
  };
  
  const centerText = getCenterText();
  const [topLine, bottomLine] = centerText.split('\n');

  return (
    <View style={styles.container}>
      {/* Phase name display above circle */}
      <Text style={styles.phaseName}>{phaseName}</Text>
      
      <View style={styles.circleContainer}>
        <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}>
          <Defs>
            <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={phaseColors[0]} stopOpacity="1" />
              <Stop offset="100%" stopColor={phaseColors[1]} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          
          {/* Background circle */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke="#E0E0E0"
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          
          {/* Progress circle */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke="url(#progressGradient)"
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(-90, ${CENTER}, ${CENTER})`}
          />
          
          {/* Center text */}
          <SvgText
            x={CENTER}
            y={CENTER - 10}
            textAnchor="middle"
            fontWeight="bold"
            fontSize="24"
            fill="#757575"
          >
            {topLine}
          </SvgText>
          <SvgText
            x={CENTER}
            y={CENTER + 15}
            textAnchor="middle"
            fontSize="16"
            fill="#757575"
          >
            {bottomLine}
          </SvgText>
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEDEB',
    padding: 16,
  },
  phaseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#757575',
    marginBottom: 8,
  },
  circleContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  }
});

export default CycleProgress;