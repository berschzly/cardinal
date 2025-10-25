import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Animated,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OnboardingSlide from '../../components/onboarding/OnboardingSlide';
import PermissionPrompt from '../../components/notifications/PermissionPrompt';
import Button from '../../components/common/Button';
import { setOnboardingComplete } from '../../utils/helpers';
import {
  requestLocationPermission,
  requestNotificationPermission,
} from '../../utils/permissions';
import { COLORS, FONTS, SPACING, RADIUS, ONBOARDING } from '../../utils/constants';

const { width } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPermissions, setShowPermissions] = useState(false);
  const [requestingPermission, setRequestingPermission] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < ONBOARDING.slides.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = async () => {
    await setOnboardingComplete();
    // Show permission request instead of going to login
    setShowPermissions(true);
  };

  const handleAllowLocation = async () => {
    setRequestingPermission(true);

    // Request location permission
    const location = await requestLocationPermission();

    // Request notification permission
    const notifications = await requestNotificationPermission();

    setRequestingPermission(false);

    if (location.granted && notifications.granted) {
      Alert.alert(
        'All Set! 🎉',
        "You'll receive reminders when you're near stores with gift cards.",
        [{ text: 'OK', onPress: () => navigation.replace('Login') }]
      );
    } else if (location.granted || notifications.granted) {
      Alert.alert(
        'Partial Access',
        'Some permissions were granted. You can change this later in Settings.',
        [{ text: 'OK', onPress: () => navigation.replace('Login') }]
      );
    } else {
      Alert.alert(
        'Permissions Denied',
        "You can still use the app, but you won't receive location reminders. You can enable this later in Settings.",
        [{ text: 'OK', onPress: () => navigation.replace('Login') }]
      );
    }
  };

  const handleSkipPermissions = () => {
    Alert.alert(
      'Skip Permissions?',
      "You can enable location reminders later in Settings. You'll still be able to use all other features.",
      [
        {
          text: 'Go Back',
          style: 'cancel',
        },
        {
          text: 'Skip',
          onPress: () => navigation.replace('Login'),
        },
      ]
    );
  };

  const handleSkip = async () => {
    await setOnboardingComplete();
    navigation.replace('Login');
  };

  if (showPermissions) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionsContainer}>
          <PermissionPrompt
            icon="📍"
            title="Enable Location Services"
            description="We'll notify you when you're near a store where you have a gift card. Your location is only used for reminders and is never shared."
            onAllow={handleAllowLocation}
            onSkip={handleSkipPermissions}
            loading={requestingPermission}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <View style={styles.slidesContainer}>
        <FlatList
          ref={slidesRef}
          data={ONBOARDING.slides}
          renderItem={({ item }) => (
            <OnboardingSlide
              icon={item.icon}
              title={item.title}
              description={item.description}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id.toString()}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={32}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
        />
      </View>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {ONBOARDING.slides.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 24, 10],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                },
              ]}
              key={i.toString()}
            />
          );
        })}
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomContainer}>
        <Button
          title={
            currentIndex === ONBOARDING.slides.length - 1
              ? 'Get Started'
              : 'Next'
          }
          onPress={scrollTo}
          style={styles.nextButton}
        />

        {currentIndex === ONBOARDING.slides.length - 1 && (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
          >
            <Text style={styles.loginButtonText}>
              Already have an account? <Text style={styles.loginLink}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },

  skipButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },

  skipButtonText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
  },

  slidesContainer: {
    flex: 1,
  },

  pagination: {
    flexDirection: 'row',
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },

  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.xs / 2,
  },

  bottomContainer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.lg,
  },

  nextButton: {
    marginBottom: SPACING.md,
  },

  loginButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },

  loginButtonText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
  },

  loginLink: {
    color: COLORS.primary,
    fontWeight: FONTS.weights.semiBold,
  },

  permissionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WelcomeScreen;