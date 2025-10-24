import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChange, getCurrentUser } from '../services/auth';

// Create the Auth Context
export const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  signOut: () => {},
});

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    checkUser();

    // Listen for auth state changes
    const subscription = onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Check for current user on mount
  const checkUser = async () => {
    try {
      const { user: currentUser } = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const handleSignOut = async () => {
    const { signOut } = require('../services/auth');
    await signOut();
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    loading,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;