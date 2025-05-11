import { 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs,
    Timestamp,
    orderBy,
    limit
  } from 'firebase/firestore';
  import { db } from './firebase';
  
  // Types
  import { WifeInfo, Event, DateNight, PeriodLog } from '../types';
  
  // Wife Info Functions
  export const saveWifeInfo = async (userId: string, wifeInfo: WifeInfo) => {
    try {
      await setDoc(doc(db, 'users', userId, 'wifeInfo', 'profile'), wifeInfo);
      return { success: true };
    } catch (error) {
      console.error('Error saving wife info: ', error);
      return { success: false, error };
    }
  };
  
  export const getWifeInfo = async (userId: string) => {
    try {
      const docRef = doc(db, 'users', userId, 'wifeInfo', 'profile');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { success: true, data: docSnap.data() as WifeInfo };
      } else {
        return { success: false, error: 'No wife info found' };
      }
    } catch (error) {
      console.error('Error getting wife info: ', error);
      return { success: false, error };
    }
  };
  
  // Events Functions
  export const addEvent = async (userId: string, event: Event) => {
    try {
      const eventsRef = collection(db, 'users', userId, 'events');
      const docRef = await addDoc(eventsRef, {
        ...event,
        createdAt: Timestamp.now()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding event: ', error);
      return { success: false, error };
    }
  };
  
  export const getEvents = async (userId: string) => {
    try {
      const eventsRef = collection(db, 'users', userId, 'events');
      const q = query(eventsRef, orderBy('date', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const events: Array<Event & { id: string }> = [];
      querySnapshot.forEach((doc) => {
        events.push({ id: doc.id, ...doc.data() as Event });
      });
      
      return { success: true, data: events };
    } catch (error) {
      console.error('Error getting events: ', error);
      return { success: false, error };
    }
  };
  
  // Date Night Functions
  export const logDateNight = async (userId: string, dateNight: DateNight) => {
    try {
      const dateNightsRef = collection(db, 'users', userId, 'dateNights');
      const docRef = await addDoc(dateNightsRef, {
        ...dateNight,
        createdAt: Timestamp.now()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error logging date night: ', error);
      return { success: false, error };
    }
  };
  
  export const getDateNights = async (userId: string) => {
    try {
      const dateNightsRef = collection(db, 'users', userId, 'dateNights');
      const q = query(dateNightsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const dateNights: Array<DateNight & { id: string }> = [];
      querySnapshot.forEach((doc) => {
        dateNights.push({ id: doc.id, ...doc.data() as DateNight });
      });
      
      return { success: true, data: dateNights };
    } catch (error) {
      console.error('Error getting date nights: ', error);
      return { success: false, error };
    }
  };
  
  export const getDateNightStreak = async (userId: string) => {
    try {
      const dateNightsRef = collection(db, 'users', userId, 'dateNights');
      const q = query(dateNightsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const dateNights: DateNight[] = [];
      querySnapshot.forEach((doc) => {
        dateNights.push(doc.data() as DateNight);
      });
      
      // Calculate streak based on weekly date nights
      // This is a simplified version - you would want more robust logic
      let streak = 0;
      const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
      
      if (dateNights.length === 0) return { success: true, streak: 0 };
      
      const now = new Date();
      let lastDate = dateNights[0].date.toDate();
      
      // Check if the most recent date night is within the last week
      if (now.getTime() - lastDate.getTime() > oneWeekMs) {
        return { success: true, streak: 0 };
      }
      
      streak = 1;
      
      for (let i = 1; i < dateNights.length; i++) {
        const currentDate = dateNights[i].date.toDate();
        const timeDiff = lastDate.getTime() - currentDate.getTime();
        
        // If this date night was 1-2 weeks before the last one, increment streak
        if (timeDiff <= 2 * oneWeekMs && timeDiff >= 0.5 * oneWeekMs) {
          streak++;
          lastDate = currentDate;
        } else {
          break;
        }
      }
      
      return { success: true, streak };
    } catch (error) {
      console.error('Error calculating date night streak: ', error);
      return { success: false, error };
    }
  };
  
  // Period Tracking Functions
  // Period Tracking Functions
// Period Tracking Functions
export const logPeriod = async (userId: string, periodLog: PeriodLog) => {
  try {
    // Create a clean object without undefined values
    const cleanPeriodLog: any = {
      startDate: periodLog.startDate,
      // Explicitly set endDate to null when starting a period
      endDate: null,
      createdAt: Timestamp.now()
    };
    
    // Only add properties that are defined
    if (periodLog.flow) cleanPeriodLog.flow = periodLog.flow;
    if (periodLog.symptoms && periodLog.symptoms.length > 0) cleanPeriodLog.symptoms = periodLog.symptoms;
    if (periodLog.notes) cleanPeriodLog.notes = periodLog.notes;
    
    const periodsRef = collection(db, `users/${userId}/periods`);
    const docRef = await addDoc(periodsRef, cleanPeriodLog);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error logging period:', error);
    return { success: false, error };
  }
};
export const updatePeriodEndDate = async (userId: string, periodId: string, endDate: Timestamp, notes?: string) => {
  try {
    const periodRef = doc(db, `users/${userId}/periods`, periodId);
    
    const updateData: any = {
      endDate: endDate
    };
    
    // Only add notes if they exist
    if (notes) {
      updateData.notes = notes;
    }
    
    await updateDoc(periodRef, updateData);
    return { success: true };
  } catch (error) {
    console.error('Error updating period end date:', error);
    return { success: false, error };
  }
};

export const getActivePeriod = async (userId: string) => {
  try {
    const periodsRef = collection(db, `users/${userId}/periods`);
    
    // Use a simpler query that doesn't require a composite index
    const q = query(
      periodsRef,
      orderBy('startDate', 'desc'),
      limit(10)  // Get the 10 most recent periods
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { success: true, activePeriod: null };
    }
    
    // Filter in JavaScript instead of in the query
    const periods = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as PeriodLog
    }));
    
    // Find the most recent period without an end date
    const activePeriod = periods.find(period => period.endDate === null);
    
    return { 
      success: true, 
      activePeriod: activePeriod || null 
    };
  } catch (error) {
    console.error('Error getting active period:', error);
    return { success: false, error };
  }
};
  
export const getPeriodLogs = async (userId: string) => {
  try {
    const periodsRef = collection(db, `users/${userId}/periods`);
    
    // Simple query that doesn't require a composite index
    const q = query(periodsRef, orderBy('startDate', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const periodLogs: Array<PeriodLog & { id: string }> = [];
    querySnapshot.forEach((doc) => {
      periodLogs.push({ id: doc.id, ...doc.data() as PeriodLog });
    });
    
    return { success: true, data: periodLogs };
  } catch (error) {
    console.error('Error getting period logs:', error);
    return { success: false, error };
  }
};
  
export const getCurrentPhase = async (userId: string) => {
  try {
    const periodsRef = collection(db, `users/${userId}/periods`);
    
    // Get recent periods without complex where queries
    const q = query(
      periodsRef,
      orderBy('startDate', 'desc'),
      limit(10)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { 
        success: true, 
        phase: 'unknown', 
        message: 'No period data available' 
      };
    }
    
    const periodLogs = querySnapshot.docs.map(doc => doc.data() as PeriodLog);
    
    // Find active period in JavaScript instead of in the query
    const activePeriod = periodLogs.find(period => period.endDate === null);
    const now = new Date();
    
    // If there's an active period
    if (activePeriod) {
      const startDate = activePeriod.startDate.toDate();
      
      // If period started within the last 7 days, user is in menstrual phase
      const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceStart <= 7) {
        return { 
          success: true, 
          phase: 'menstrual', 
          daysIn: daysSinceStart 
        };
      }
    }
    
    // Calculate average cycle length
    let avgCycleLength = 28; // Default
    if (periodLogs.length >= 2) {
      let totalDays = 0;
      let cycles = 0;
      
      for (let i = 0; i < periodLogs.length - 1; i++) {
        const daysBetween = Math.floor(
          (periodLogs[i].startDate.toDate().getTime() - periodLogs[i + 1].startDate.toDate().getTime()) 
          / (1000 * 60 * 60 * 24)
        );
        if (daysBetween > 0 && daysBetween < 45) { // Sanity check
          totalDays += daysBetween;
          cycles++;
        }
      }
      
      if (cycles > 0) {
        avgCycleLength = Math.round(totalDays / cycles);
      }
    }
    
    // Calculate days since most recent period started
    const latestPeriod = periodLogs[0];
    const latestPeriodStart = latestPeriod.startDate.toDate();
    
    // If the latest period has an end date, use that for calculations
    let periodEndDate = latestPeriodStart;
    let menstrualPhaseDuration = 5; // Default
    
    if (latestPeriod.endDate) {
      periodEndDate = latestPeriod.endDate.toDate();
      // Calculate actual menstrual phase duration
      menstrualPhaseDuration = Math.ceil(
        (periodEndDate.getTime() - latestPeriodStart.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // Minimum of 3 days, maximum of 7 days for menstrual phase
      menstrualPhaseDuration = Math.max(3, Math.min(7, menstrualPhaseDuration));
    }
    
    const daysSincePeriodEnded = Math.floor(
      (now.getTime() - periodEndDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Calculate days since period started for total cycle day count
    const daysSincePeriodStarted = Math.floor(
      (now.getTime() - latestPeriodStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Calculate days until next period
    const daysUntilNextPeriod = Math.max(0, avgCycleLength - daysSincePeriodStarted);
    
    // Determine cycle phase based on days since period ended
    if (daysSincePeriodEnded < 0) {
      // Still in menstrual phase (period not ended yet)
      return { 
        success: true, 
        phase: 'menstrual', 
        daysIn: daysSincePeriodStarted 
      };
    } else if (daysSincePeriodEnded <= 8) {
      // Follicular phase (days 6-13, following menstrual phase)
      return { 
        success: true, 
        phase: 'follicular', 
        daysIn: daysSincePeriodEnded,
        daysUntil: daysUntilNextPeriod
      };
    } else if (daysSincePeriodEnded <= 14) {
      // Ovulatory phase (around day 14 of cycle)
      return { 
        success: true, 
        phase: 'ovulatory', 
        daysIn: daysSincePeriodEnded, 
        daysUntil: daysUntilNextPeriod
      };
    } else if (daysSincePeriodStarted <= avgCycleLength) {
      // Luteal phase (after ovulation, before next period)
      const daysUntil = avgCycleLength - daysSincePeriodStarted;
      return { 
        success: true, 
        phase: 'luteal', 
        daysIn: daysSincePeriodEnded,
        daysUntil: daysUntil > 0 ? daysUntil : 1 // At least 1 day until period if in late luteal phase
      };
    } else {
      // Late (beyond expected cycle length)
      return { 
        success: true, 
        phase: 'late', 
        daysLate: daysSincePeriodStarted - avgCycleLength 
      };
    }
  } catch (error) {
    console.error('Error calculating current phase:', error);
    return { success: false, error };
  }
};