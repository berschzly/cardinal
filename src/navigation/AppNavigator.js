import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import AuthNavigator from './AuthNavigator';
import Loading from '../components/common/Loading';

/**
 * App Navigator
 * Root navigation component
 * - Shows AuthNavigator if user is not authenticated
 * - Shows MainNavigator if user is authenticated
 * - Shows loading screen while checking auth state
 */
const AppNavigator = () => {
  const { user, loading } = useAuth();

  // Show loading screen while checking authentication
  if (loading) {
    return <Loading fullScreen text="Loading..." />;
  }

  return (
    <NavigationContainer>
      {user ? (
        // TODO: Replace with MainNavigator in Phase 5
        <Loading fullScreen text="Authenticated! MainNavigator coming in Phase 5..." />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;