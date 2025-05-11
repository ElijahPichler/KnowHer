import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, CalendarUtils } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { PeriodLog } from '../../types';
import { COLORS, FONT_SIZES, SPACING } from '../../constants/colors';
import Card from '../UI/Card';

interface PeriodCalendarProps {
  periodLogs: (PeriodLog & { id: string })[];
  visible: boolean;
  onToggleVisibility: () => void;
}

const PeriodCalendar: React.FC<PeriodCalendarProps> = ({
  periodLogs,
  visible,
  onToggleVisibility
}) => {
  const [markedDates, setMarkedDates] = useState<any>({});
  const [selectedMonthText, setSelectedMonthText] = useState<string>('');

  // Update calendar marked dates based on period logs
  const updateCalendarMarkedDates = useCallback((logs: (PeriodLog & { id: string })[]) => {
    const marked: any = {};
    
    logs.forEach(log => {
      const startDate = log.startDate.toDate();
      
      // Mark start date
      const startDateStr = CalendarUtils.getCalendarDateString(startDate);
      
      // If both start and end dates are the same day
      if (log.endDate && log.startDate.toDate().toDateString() === log.endDate.toDate().toDateString()) {
        marked[startDateStr] = {
          selected: true,
          startingDay: true,
          endingDay: true,
          color: COLORS.menstrual,
        };
        return;
      }
      
      // Mark start date
      marked[startDateStr] = {
        selected: true,
        startingDay: true,
        color: COLORS.menstrual,
      };
      
      // If there's an end date, mark the period between start and end
      if (log.endDate) {
        const endDate = log.endDate.toDate();
        const endDateStr = CalendarUtils.getCalendarDateString(endDate);
        
        marked[endDateStr] = {
          selected: true,
          endingDay: true,
          color: COLORS.menstrual,
        };
        
        // Mark all days in between
        const daysBetween = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        for (let i = 1; i < daysBetween; i++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          const dateStr = CalendarUtils.getCalendarDateString(date);
          
          marked[dateStr] = {
            selected: true,
            color: COLORS.menstrual,
          };
        }
      } else {
        // If there's no end date, mark up to today if the period is active
        const today = new Date();
        const diffTime = today.getTime() - startDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 0 && diffDays < 10) { // Only show up to 10 days for an active period
          for (let i = 1; i <= diffDays; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = CalendarUtils.getCalendarDateString(date);
            
            marked[dateStr] = {
              selected: true,
              color: COLORS.menstrual,
            };
          }
        }
      }
    });
    
    setMarkedDates(marked);
  }, []);

  // Update month text
  const handleMonthChange = (month: any) => {
    const date = new Date(month.year, month.month - 1, 1);
    const monthText = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    setSelectedMonthText(monthText);
  };

  // Update marked dates when periodLogs change
  useEffect(() => {
    updateCalendarMarkedDates(periodLogs);
    
    // Set initial month text
    const now = new Date();
    const monthText = now.toLocaleString('default', { month: 'long', year: 'numeric' });
    setSelectedMonthText(monthText);
  }, [periodLogs, updateCalendarMarkedDates]);

  if (!visible) {
    return (
      <TouchableOpacity 
        style={styles.toggleButton}
        onPress={onToggleVisibility}
      >
        <Text style={styles.toggleText}>Show Calendar</Text>
        <Ionicons name="chevron-down" size={20} color={COLORS.primary} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.toggleButton}
        onPress={onToggleVisibility}
      >
        <Text style={styles.toggleText}>Hide Calendar</Text>
        <Ionicons name="chevron-up" size={20} color={COLORS.primary} />
      </TouchableOpacity>
      
      <Card style={styles.calendarCard}>
        <View style={styles.calendarHeader}>
          <Text style={styles.calendarTitle}>{selectedMonthText}</Text>
        </View>
        
        <Calendar
          markingType="period"
          markedDates={markedDates}
          onMonthChange={handleMonthChange}
          theme={{
            selectedDayBackgroundColor: COLORS.primary,
            todayTextColor: COLORS.primary,
            arrowColor: COLORS.primary,
            monthTextColor: COLORS.darkGray,
            textMonthFontWeight: 'bold',
            textDayFontSize: 14,
            textMonthFontSize: 16,
          }}
        />
        
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: COLORS.menstrual }]} />
            <Text style={styles.legendText}>Period Days</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
            <Text style={styles.legendText}>Today</Text>
          </View>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.sm,
  },
  toggleText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '500',
    marginRight: SPACING.xs,
  },
  calendarCard: {
    padding: 0,
    overflow: 'hidden',
  },
  calendarHeader: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  calendarTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    padding: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: SPACING.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.xs,
  },
  legendText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.darkGray,
  },
});

export default PeriodCalendar;