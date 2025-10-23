import { supabase } from './supabase';

// ====================================
// AUTHENTICATION SERVICE
// ====================================
// Handles all authentication-related operations

/**
 * Sign up a new user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} fullName - User's full name (optional)
 * @returns {Promise<{user, session, error}>}
 */
export const signUp = async (email, password, fullName = '') => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    return { user: data.user, session: data.session, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    return { user: null, session: null, error: error.message };
  }
};

/**
 * Sign in an existing user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<{user, session, error}>}
 */
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { user: data.user, session: data.session, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { user: null, session: null, error: error.message };
  }
};

/**
 * Sign out the current user
 * @returns {Promise<{error}>}
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: error.message };
  }
};

/**
 * Send password reset email
 * @param {string} email - User's email
 * @returns {Promise<{error}>}
 */
export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'cardinal://reset-password', // Deep link for mobile app
    });

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error('Reset password error:', error);
    return { error: error.message };
  }
};

/**
 * Update user password
 * @param {string} newPassword - New password
 * @returns {Promise<{error}>}
 */
export const updatePassword = async (newPassword) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error('Update password error:', error);
    return { error: error.message };
  }
};

/**
 * Get current user session
 * @returns {Promise<{session, error}>}
 */
export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    return { session: data.session, error: null };
  } catch (error) {
    console.error('Get session error:', error);
    return { session: null, error: error.message };
  }
};

/**
 * Get current user
 * @returns {Promise<{user, error}>}
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) throw error;

    return { user: data.user, error: null };
  } catch (error) {
    console.error('Get current user error:', error);
    return { user: null, error: error.message };
  }
};

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
export const isAuthenticated = async () => {
  try {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  } catch (error) {
    console.error('Check authentication error:', error);
    return false;
  }
};

/**
 * Listen to auth state changes
 * @param {Function} callback - Callback function to handle auth state changes
 * @returns {Object} Subscription object with unsubscribe method
 */
export const onAuthStateChange = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      callback(event, session);
    }
  );

  return subscription;
};

/**
 * Refresh the current session
 * @returns {Promise<{session, error}>}
 */
export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) throw error;

    return { session: data.session, error: null };
  } catch (error) {
    console.error('Refresh session error:', error);
    return { session: null, error: error.message };
  }
};

export default {
  signUp,
  signIn,
  signOut,
  resetPassword,
  updatePassword,
  getSession,
  getCurrentUser,
  isAuthenticated,
  onAuthStateChange,
  refreshSession,
};