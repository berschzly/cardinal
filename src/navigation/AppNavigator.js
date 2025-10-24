import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
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
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;