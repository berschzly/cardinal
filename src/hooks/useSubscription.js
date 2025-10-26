import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { checkSubscription } from '../services/subscription';

/**
 * Hook to manage subscription status
 * Returns premium status and subscription info
 */
export const useSubscription = () => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!user) {
        setIsPremium(false);
        setSubscriptionStatus(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { isPremium: premium, status, error: checkError } = await checkSubscription();

        if (checkError) {
          throw new Error(checkError);
        }

        setIsPremium(premium || false);
        setSubscriptionStatus(status);
      } catch (err) {
        console.error('Error checking subscription:', err);
        setError(err.message);
        setIsPremium(false);
        setSubscriptionStatus(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [user]);

  // Refresh subscription status
  const refresh = async () => {
    if (!user) return;

    try {
      const { isPremium: premium, status, error: checkError } = await checkSubscription();

      if (checkError) {
        throw new Error(checkError);
      }

      setIsPremium(premium || false);
      setSubscriptionStatus(status);
      setError(null);
    } catch (err) {
      console.error('Error refreshing subscription:', err);
      setError(err.message);
    }
  };

  return {
    isPremium,
    loading,
    subscriptionStatus,
    error,
    refresh,
  };
};

export default useSubscription;