import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { signIn, signUp, signOut, resetPassword } from '../services/auth';
import { checkPremiumStatus } from '../services/database';

/**
 * Custom hook to access auth context and auth functions
 * @returns {Object} Auth state and functions
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  const [isPremium, setIsPremium] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [checkingSubscription, setCheckingSubscription] = useState(false);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // Check premium status when user changes
  useEffect(() => {
    if (context.user) {
      checkSubscription();
    } else {
      setIsPremium(false);
      setSubscriptionStatus(null);
    }
  }, [context.user]);

  // Check subscription status
  const checkSubscription = async () => {
    setCheckingSubscription(true);
    const { isPremium: premium, subscriptionStatus: status } = await checkPremiumStatus();
    setIsPremium(premium);
    setSubscriptionStatus(status);
    setCheckingSubscription(false);
  };

  // Auth functions
  const handleSignIn = async (email, password) => {
    const result = await signIn(email, password);
    if (!result.error) {
      await checkSubscription();
    }
    return result;
  };

  const handleSignUp = async (email, password, fullName) => {
    return await signUp(email, password, fullName);
  };

  const handleSignOut = async () => {
    setIsPremium(false);
    setSubscriptionStatus(null);
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

    // Subscription state
    isPremium,
    subscriptionStatus,
    checkingSubscription,

    // Auth functions
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    refreshSubscription: checkSubscription,
  };
};

export default useAuth;