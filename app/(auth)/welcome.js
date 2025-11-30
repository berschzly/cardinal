import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Welcome() {
  const router = useRouter();
  const scrollViewRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);

  const onboardingPages = [
    {
      title: "Never lose a gift card again",
      subtitle: "Store all your gift cards in one place. Scan, organize, and use them effortlessly whenever you need them.",
      illustration: 'cards'
    },
    {
      title: "Smart notifications keep you informed",
      subtitle: "Get alerts before cards expire and when you're near stores where you have gift cards to use.",
      illustration: 'notifications'
    },
    {
      title: "Scan and pay in seconds",
      subtitle: "Access your gift card barcodes instantly at checkout. No more digging through your wallet or forgetting cards at home.",
      illustration: 'scan'
    }
  ];

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentPage(page);
  };

  const scrollToPage = (pageIndex) => {
    scrollViewRef.current?.scrollTo({
      x: pageIndex * SCREEN_WIDTH,
      animated: true
    });
  };

  const renderIllustration = (type) => {
    switch (type) {
      case 'cards':
        return <CardsIllustration />;
      case 'notifications':
        return <NotificationsIllustration />;
      case 'scan':
        return <ScanIllustration />;
      default:
        return <CardsIllustration />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Status Bar Configuration */}
      <StatusBar barStyle="light-content" backgroundColor="#141414ff" />
      
      {/* Scrollable Pages */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {onboardingPages.map((page, index) => (
          <View key={index} style={styles.page}>
            {/* Illustration */}
            <View style={styles.illustrationContainer}>
              {renderIllustration(page.illustration)}
            </View>

            {/* Main heading */}
            <Text style={styles.title}>{page.title}</Text>

            {/* Subheading */}
            <Text style={styles.subtitle}>{page.subtitle}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {onboardingPages.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => scrollToPage(index)}
            style={[
              styles.dot,
              currentPage === index ? styles.dotActive : styles.dotInactive
            ]}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(auth)/sign-up')}
        >
          <Text style={styles.primaryButtonText}>Get started</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
          <Text style={styles.linkText}>
            I already have an account. <Text style={styles.linkBold}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Gift Cards Illustration Component
function CardsIllustration() {
  return (
    <View style={styles.illustrationWrapper}>
      {/* Phone mockup */}
      <View style={styles.phone}>
        <View style={styles.phoneNotch} />
        <View style={styles.phoneContent}>
          {/* Header */}
          <View style={styles.phoneHeader}>
            <View style={styles.headerTitle} />
            <View style={styles.headerIcon} />
          </View>
          
          {/* Gift Card Stack */}
          <View style={styles.cardStack}>
            <View style={[styles.giftCard, styles.giftCard1]}>
              <View style={styles.cardLogo} />
              <View style={styles.cardAmount} />
            </View>
            <View style={[styles.giftCard, styles.giftCard2]}>
              <View style={styles.cardLogo} />
              <View style={styles.cardAmount} />
            </View>
            <View style={[styles.giftCard, styles.giftCard3]}>
              <View style={styles.cardLogo} />
              <View style={styles.cardAmount} />
            </View>
          </View>
        </View>
      </View>
      
      {/* Floating gift card icons */}
      <View style={[styles.floatingCard, styles.floatingCard1]}>
        <Text style={styles.cardEmoji}>🎁</Text>
      </View>
      <View style={[styles.floatingCard, styles.floatingCard2]}>
        <Text style={styles.cardEmoji}>💳</Text>
      </View>
    </View>
  );
}

// Notifications Illustration Component
function NotificationsIllustration() {
  return (
    <View style={styles.illustrationWrapper}>
      {/* Phone mockup */}
      <View style={styles.phone}>
        <View style={styles.phoneNotch} />
        <View style={styles.phoneContent}>
          {/* Notification Cards */}
          <View style={styles.notificationCard}>
            <View style={styles.notifIcon}>
              <Text style={styles.notifEmoji}>📍</Text>
            </View>
            <View style={styles.notifContent}>
              <View style={styles.notifTitle} />
              <View style={styles.notifText} />
            </View>
          </View>
          
          <View style={[styles.notificationCard, { marginTop: 16 }]}>
            <View style={styles.notifIcon}>
              <Text style={styles.notifEmoji}>⏰</Text>
            </View>
            <View style={styles.notifContent}>
              <View style={styles.notifTitle} />
              <View style={styles.notifText} />
            </View>
          </View>
        </View>
      </View>
      
      {/* Floating notification badges */}
      <View style={[styles.badge, styles.badge1]}>
        <Text style={styles.badgeText}>!</Text>
      </View>
      <View style={[styles.badge, styles.badge2]}>
        <Text style={styles.badgeText}>3</Text>
      </View>
    </View>
  );
}

// Scan Illustration Component
function ScanIllustration() {
  return (
    <View style={styles.illustrationWrapper}>
      {/* Phone mockup */}
      <View style={styles.phone}>
        <View style={styles.phoneNotch} />
        <View style={styles.phoneContent}>
          {/* Barcode Display */}
          <View style={styles.barcodeContainer}>
            <View style={styles.barcodeHeader} />
            <View style={styles.barcode}>
              <View style={[styles.barcodeLine, { width: 2 }]} />
              <View style={[styles.barcodeLine, { width: 1 }]} />
              <View style={[styles.barcodeLine, { width: 3 }]} />
              <View style={[styles.barcodeLine, { width: 1 }]} />
              <View style={[styles.barcodeLine, { width: 2 }]} />
              <View style={[styles.barcodeLine, { width: 1 }]} />
              <View style={[styles.barcodeLine, { width: 2 }]} />
              <View style={[styles.barcodeLine, { width: 3 }]} />
              <View style={[styles.barcodeLine, { width: 1 }]} />
              <View style={[styles.barcodeLine, { width: 2 }]} />
            </View>
            <View style={styles.barcodeNumber} />
          </View>
          
          {/* Balance display */}
          <View style={styles.balanceDisplay}>
            <View style={styles.balanceLabel} />
            <View style={styles.balanceAmount} />
          </View>
        </View>
      </View>
      
      {/* Scan animation effect */}
      <View style={styles.scanLine} />
      
      {/* Floating icons */}
      <View style={[styles.scanIcon, styles.scanIcon1]}>
        <Text style={styles.scanEmoji}>📱</Text>
      </View>
      <View style={[styles.scanIcon, styles.scanIcon2]}>
        <Text style={styles.scanEmoji}>✓</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#141414ff',
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  illustrationContainer: {
    width: '100%',
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
  },
  illustrationWrapper: {
    width: 340,
    height: 300,
    position: 'relative',
  },
  
  // Phone Base Styles
  phone: {
    position: 'absolute',
    top: -20,
    left: '50%',
    marginLeft: -85,
    width: 170,
    height: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#1A1A1A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  phoneNotch: {
    width: 60,
    height: 16,
    backgroundColor: '#0A0A0A',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignSelf: 'center',
  },
  phoneContent: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8F8F8',
  },

  // Cards Illustration Styles
  phoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    width: 70,
    height: 10,
    backgroundColor: '#CCCCCC',
    borderRadius: 5,
  },
  headerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DC2626',
  },
  cardStack: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  giftCard: {
    width: 130,
    height: 60,
    borderRadius: 10,
    padding: 10,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  giftCard1: {
    backgroundColor: '#DC2626',
  },
  giftCard2: {
    backgroundColor: '#EF4444',
  },
  giftCard3: {
    backgroundColor: '#F87171',
  },
  cardLogo: {
    width: 35,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 5,
  },
  cardAmount: {
    width: 45,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  floatingCard: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#B91C1C',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  floatingCard1: {
    top: 50,
    left: 10,
  },
  floatingCard2: {
    bottom: 20,
    right: 10,
  },
  cardEmoji: {
    fontSize: 24,
  },

  // Notifications Illustration Styles
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifEmoji: {
    fontSize: 20,
  },
  notifContent: {
    flex: 1,
    gap: 8,
  },
  notifTitle: {
    width: '85%',
    height: 8,
    backgroundColor: '#DC2626',
    borderRadius: 4,
  },
  notifText: {
    width: '100%',
    height: 6,
    backgroundColor: '#D1D5DB',
    borderRadius: 3,
  },
  badge: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#B91C1C',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  badge1: {
    top: 60,
    right: 20,
  },
  badge2: {
    bottom: 40,
    left: 20,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  // Scan Illustration Styles
  barcodeContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  barcodeHeader: {
    width: 70,
    height: 8,
    backgroundColor: '#D1D5DB',
    borderRadius: 4,
    marginBottom: 16,
  },
  barcode: {
    flexDirection: 'row',
    gap: 2,
    height: 50,
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  barcodeLine: {
    backgroundColor: '#000000',
    height: '100%',
  },
  barcodeNumber: {
    width: 80,
    height: 6,
    backgroundColor: '#D1D5DB',
    borderRadius: 3,
  },
  balanceDisplay: {
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  balanceLabel: {
    width: 50,
    height: 6,
    backgroundColor: '#DC2626',
    borderRadius: 3,
    marginBottom: 10,
  },
  balanceAmount: {
    width: 60,
    height: 10,
    backgroundColor: '#DC2626',
    borderRadius: 5,
  },
  scanLine: {
    position: 'absolute',
    top: 170,
    left: 95,
    right: 95,
    height: 2.5,
    backgroundColor: '#DC2626',
    opacity: 0.8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  scanIcon: {
    position: 'absolute',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  scanIcon1: {
    top: 50,
    left: 20,
  },
  scanIcon2: {
    bottom: 30,
    right: 20,
  },
  scanEmoji: {
    fontSize: 22,
  },

  // Text Styles
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 40,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 30,
    marginTop: 16,
  },

  // Pagination Styles
  pagination: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginVertical: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotInactive: {
    backgroundColor: '#374151',
  },
  dotActive: {
    backgroundColor: '#DC2626',
  },

  // Button Styles
  buttons: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  primaryButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 18,
    borderRadius: 28,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  linkBold: {
    color: '#DC2626',
    fontWeight: '600',
  },
});