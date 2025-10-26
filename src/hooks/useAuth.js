import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { signIn, signUp, signOut, resetPassword } from '../services/auth';

/**
 * Custom hook to access auth context and auth functions
 * @returns {Object} Auth state and functions
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // Auth functions
  const handleSignIn = async (email, password) => {
    return await signIn(email, password);
  };

  const handleSignUp = async (email, password, fullName) => {
    return await signUp(email, password, fullName);
  };

  const handleSignOut = async () => {
    return await signOut();
  };

  const handleResetPassword = async (email) => {
    return await resetPassword(email);
  };

  return {
    // Auth state
    user: context.user,
    session: context.session,
    loading: context.loading,
    isAuthenticated: !!context.user,

    // Auth functions
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
  };
};

export default useAuth;