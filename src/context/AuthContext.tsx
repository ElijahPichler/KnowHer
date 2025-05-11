import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { User } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  isLoading: boolean;
  isNewUser: boolean;
  setIsNewUser: (value: boolean) => void;
  register: (email: string, password: string, firstName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserData(userDoc.data() as User);
            
            // Check if the user has completed onboarding
            const wifeInfoDocRef = doc(db, 'users', user.uid, 'wifeInfo', 'profile');
            const wifeInfoDoc = await getDoc(wifeInfoDocRef);
            
            // If wifeInfo doesn't exist, this is a new user who needs onboarding
            setIsNewUser(!wifeInfoDoc.exists());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
        setIsNewUser(false);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (email: string, password: string, firstName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user document in Firestore
      const userData: User = {
        id: user.uid,
        email: user.email || email,
        firstName,
        createdAt: Timestamp.now()
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      setUserData(userData);
      
      // Flag this as a new user for onboarding
      setIsNewUser(true);
    } catch (error) {
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // Check if user document exists
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      // Check if wifeInfo exists
      const wifeInfoDocRef = doc(db, 'users', user.uid, 'wifeInfo', 'profile');
      const wifeInfoDoc = await getDoc(wifeInfoDocRef);
      
      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        const userData: User = {
          id: user.uid,
          email: user.email || '',
          firstName: user.displayName?.split(' ')[0] || 'User',
          createdAt: Timestamp.now()
        };
        
        await setDoc(userDocRef, userData);
        setUserData(userData);
        
        // New user needs onboarding
        setIsNewUser(true);
      } else {
        // Set isNewUser based on whether wifeInfo exists
        setIsNewUser(!wifeInfoDoc.exists());
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };
  

  const value = {
    currentUser,
    userData,
    isLoading,
    isNewUser,
    setIsNewUser,
    register,
    login,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};