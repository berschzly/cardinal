// Add new card screen - Performance optimized with ConfirmationModal

import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  KeyboardAvoidingView,
  StatusBar,
  Animated,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { createCard, getUserSettings, getCards } from '../../lib/supabase';
import { 
  validateCardData, 
  sanitizeCardData,
  isValidCardName,
  isValidBalance,
  isValidCardNumber,
  isValidPin,
  formatValidationErrors,
} from '../../utils/validation';
import { handleAsync } from '../../utils/errorHandling';
import { scheduleExpirationReminder, scheduleUsageReminder } from '../../lib/notifications';
import OCRScanner from '../../components/add-cards/OCRScanner';
import ConfirmationModal from '../../components/common/ConfirmationModal';

import {
  FormInput,
  Button,
  LoadingState,
  DatePickerInput,
} from '../../components/common';
import { formatCardNumberInput, stripCardNumberFormatting } from '../../utils/formatter';
import { LoadingScreen } from '../../components/common';

// Move constants outside component
const PREMIUM_FEATURES = [
  { icon: 'infinite', title: 'Unlimited Cards' },
  { icon: 'location', title: 'Location Alerts' },
  { icon: 'color-palette', title: 'Custom Themes' },
  { icon: 'flash', title: 'Priority Support' },
];

// Memoized components
const ScanCardButton = memo(({ onPress }) => (
  <TouchableOpacity
    style={styles.scanCard}
    onPress={onPress}
    activeOpacity={0.9}
  >
    <LinearGradient
      colors={['#3A1515', '#2A1515', '#DC2626']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.scanGradient}
    >
      <View style={styles.scanIconContainer}>
        <Ionicons name="camera" size={28} color="#FFFFFF" />
      </View>
      <View style={styles.scanTextContainer}>
        <Text style={styles.scanTitle}>Scan with Camera</Text>
        <Text style={styles.scanSubtitle}>
          AI extracts card details instantly
        </Text>
      </View>
      <View style={styles.scanArrowContainer}>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
      </View>
    </LinearGradient>
  </TouchableOpacity>
));

const PremiumFeaturesList = memo(() => (
  <View style={styles.premiumFeatures}>
    {PREMIUM_FEATURES.map((feature) => (
      <View key={feature.icon} style={styles.premiumFeatureItem}>
        <View style={styles.premiumFeatureIcon}>
          <Ionicons name={feature.icon} size={18} color="#9CA3AF" />
        </View>
        <Text style={styles.premiumFeatureTitle}>{feature.title}</Text>
        <Ionicons name="checkmark-circle" size={18} color="#10B981" />
      </View>
    ))}
  </View>
));

const WarningCard = memo(({ cardCount, onPress }) => (
  <TouchableOpacity 
    style={styles.warningCard}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.warningContent}>
      <Ionicons name="alert-circle" size={24} color="#F59E0B" />
      <View style={styles.warningTextContainer}>
        <Text style={styles.warningTitle}>Almost at your limit</Text>
        <Text style={styles.warningText}>
          {Math.max(10 - cardCount, 0)} cards remaining • Tap to upgrade
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </View>
  </TouchableOpacity>
));

const ErrorBanner = memo(({ error, onDismiss }) => (
  <View style={styles.errorBanner}>
    <View style={styles.errorBannerContent}>
      <Ionicons name="warning" size={20} color="#FFFFFF" />
      <Text style={styles.errorBannerText}>{error}</Text>
    </View>
    <TouchableOpacity 
      onPress={onDismiss}
      accessible={true}
      accessibilityLabel="Dismiss error"
      accessibilityRole="button"
    >
      <Ionicons name="close" size={20} color="#FFFFFF" />
    </TouchableOpacity>
  </View>
));

const InfoCard = memo(() => (
  <View style={styles.infoCard}>
    <View style={styles.infoIconContainer}>
      <Ionicons name="information-circle" size={24} color="#DC2626" />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoTitle}>Pro Tip</Text>
      <Text style={styles.infoText}>
        Only the card name is required. Add as much or as little detail as you want.
      </Text>
    </View>
  </View>
));

export default function AddCard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Form state
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [balance, setBalance] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [pin, setPin] = useState('');
  const [notes, setNotes] = useState('');
  const [expirationDate, setExpirationDate] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  
  // Validation
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // Premium state
  const [cardCount, setCardCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [error, setError] = useState(null);

  // Confirmation modals
  const [showValidationError, setShowValidationError] = useState(false);
  const [validationErrorMessage, setValidationErrorMessage] = useState('');
  const [showSaveError, setShowSaveError] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState('');
  const [showScanComplete, setShowScanComplete] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Pan Responder for modal gesture
  const panResponderConfig = useMemo(() => {
    const translateY = new Animated.Value(1000);
    const backdropOpacity = new Animated.Value(0);

    return {
      panResponder: PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dy) > 5;
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
            const opacity = Math.max(0, 1 - gestureState.dy / 500);
            backdropOpacity.setValue(opacity);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 150 || gestureState.vy > 0.5) {
            Animated.parallel([
              Animated.timing(translateY, {
                toValue: 1000,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
            ]).start(() => {
              setShowPremiumModal(false);
              translateY.setValue(0);
              backdropOpacity.setValue(1);
            });
          } else {
            Animated.parallel([
              Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
              }),
              Animated.timing(backdropOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start();
          }
        },
      }),
      translateY,
      backdropOpacity,
    };
  }, []);

  useEffect(() => {
    checkCardLimit();
  }, []);

  useEffect(() => {
    if (showPremiumModal) {
      Animated.parallel([
        Animated.spring(panResponderConfig.translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(panResponderConfig.backdropOpacity, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      panResponderConfig.translateY.setValue(1000);
      panResponderConfig.backdropOpacity.setValue(0);
    }
  }, [showPremiumModal]);

  const checkCardLimit = useCallback(async () => {
    const [cardsResult, settingsResult] = await Promise.allSettled([
      handleAsync(() => getCards(), { showDefaultError: false }),
      handleAsync(() => getUserSettings(), { showDefaultError: false })
    ]);

    if (cardsResult.status === 'fulfilled' && !cardsResult.value.error) {
      setCardCount(cardsResult.value.data?.length || 0);
    }
    
    if (settingsResult.status === 'fulfilled' && !settingsResult.value.error) {
      setIsPremium(settingsResult.value.data?.is_premium || false);
    }
    
    if (cardsResult.status === 'rejected' || settingsResult.status === 'rejected') {
      setError('Unable to check card limit. You can still add cards.');
    }
    
    setInitialLoading(false);
  }, []);

  const validateField = useCallback((field, value) => {
    let validation = { isValid: true, error: null };
    switch (field) {
      case 'name': validation = isValidCardName(value); break;
      case 'balance': validation = isValidBalance(value); break;
      case 'card_number': validation = isValidCardNumber(value); break;
      case 'pin': validation = isValidPin(value); break;
    }
    setFieldErrors(prev => ({
      ...prev,
      [field]: validation.isValid ? null : validation.error,
    }));
  }, []);

  const handleFieldChange = useCallback((field, value, setter) => {
    setter(value);
    if (touched[field]) validateField(field, value);
  }, [touched, validateField]);

  const handleFieldBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const clearForm = useCallback(() => {
    setName('');
    setBrand('');
    setBalance('');
    setCardNumber('');
    setPin('');
    setNotes('');
    setExpirationDate(null);
    setFieldErrors({});
    setTouched({});
  }, []);

  const handleSaveCard = useCallback(async () => {
    setTouched({ name: true, balance: true, card_number: true, pin: true });

    if (!isPremium && cardCount >= 10) {
      console.log('🚫 Card limit reached, showing modal');
      setShowPremiumModal(true);
      return;
    }

    const cardData = {
      name, 
      brand, 
      balance,
      card_number: stripCardNumberFormatting(cardNumber),
      pin, 
      notes,
      expiration_date: expirationDate ? formatDateForInput(expirationDate) : null,
    };

    const validation = validateCardData(cardData);
    if (!validation.isValid) {
      setValidationErrorMessage(formatValidationErrors(validation.errors));
      setShowValidationError(true);
      return;
    }

    setLoading(true);
    setError(null);
    
    const result = await handleAsync(
      () => createCard(sanitizeCardData(cardData)),
      { showDefaultError: false }
    );
    
    setLoading(false);

    if (result.error) {
      setError(result.error);
      setSaveErrorMessage(result.error);
      setShowSaveError(true);
      return;
    }

    try {
      if (result.data?.id) {
        const cardForNotification = {
          id: result.data.id,
          brand: result.data.brand || name,
          balance: parseFloat(result.data.balance) || 0,
          expirationDate: result.data.expiration_date,
        };
        if (result.data.expiration_date) {
          await scheduleExpirationReminder(cardForNotification);
        } else {
          await scheduleUsageReminder(cardForNotification, 30);
        }
      }
    } catch (notificationError) {
      console.error('⚠️ Notification scheduling failed:', notificationError);
    }

    setCardCount(prev => prev + 1);
    clearForm();
    setShowSaveSuccess(true);
  }, [isPremium, cardCount, name, brand, balance, cardNumber, pin, notes, expirationDate, clearForm]);

  const handleScanComplete = useCallback((ocrData) => {
    setShowScanner(false);
    if (ocrData.brand) setBrand(ocrData.brand);
    if (ocrData.cardNumber) {
      setCardNumber(ocrData.cardNumber);
      validateField('card_number', ocrData.cardNumber);
    }
    if (ocrData.balance) {
      setBalance(ocrData.balance.toString());
      validateField('balance', ocrData.balance.toString());
    }
    if (ocrData.pin) {
      setPin(ocrData.pin);
      validateField('pin', ocrData.pin);
    }
    if (ocrData.expirationDate) {
      setExpirationDate(new Date(ocrData.expirationDate));
    }
    setShowScanComplete(true);
  }, [validateField]);

  const progressPercentage = useMemo(() => 
    Math.min((cardCount / 10) * 100, 100),
    [cardCount]
  );

  const slotsRemaining = useMemo(() => 
    Math.max(10 - cardCount, 0),
    [cardCount]
  );

  const showWarning = useMemo(() => 
    !isPremium && cardCount >= 8,
    [isPremium, cardCount]
  );

  const handleDismissError = useCallback(() => setError(null), []);
  const handleShowPremiumModal = useCallback(() => {
    console.log('🎯 Opening premium modal');
    setShowPremiumModal(true);
  }, []);
  const handleClosePremiumModal = useCallback(() => setShowPremiumModal(false), []);
  const handleShowScanner = useCallback(() => setShowScanner(true), []);
  const handleCloseScanner = useCallback(() => setShowScanner(false), []);

  const handleUpgradePress = useCallback(() => {
    Alert.alert('Premium Coming Soon', 'Premium subscriptions will be available after launch.');
    setShowPremiumModal(false);
  }, []);

  const handleAddAnother = useCallback(() => {
    setShowSaveSuccess(false);
  }, []);

  const handleViewCards = useCallback(() => {
    setShowSaveSuccess(false);
    router.push('/(tabs)');
  }, [router]);

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#141414" />
        <LoadingScreen message="Preparing form..." icon="create" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#141414" />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Page Header */}
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>Add Card</Text>
            <Text style={styles.pageSubtitle}>
              {isPremium 
                ? 'Unlimited cards with Premium' 
                : `${cardCount} of 10 cards used`}
            </Text>
            
            {!isPremium && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${progressPercentage}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {slotsRemaining} slots remaining
                </Text>
              </View>
            )}
          </View>

          {error && (
            <ErrorBanner error={error} onDismiss={handleDismissError} />
          )}
          
          {showWarning && (
            <WarningCard cardCount={cardCount} onPress={handleShowPremiumModal} />
          )}

          <ScanCardButton onPress={handleShowScanner} />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or enter manually</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Card Details</Text>
            
            <FormInput
              label="Card Name"
              value={name}
              onChangeText={(val) => handleFieldChange('name', val, setName)}
              onBlur={() => handleFieldBlur('name')}
              error={fieldErrors.name}
              touched={touched.name}
              required
              placeholder="e.g., Target Gift Card"
              maxLength={100}
            />

            <FormInput
              label="Brand"
              value={brand}
              onChangeText={setBrand}
              placeholder="e.g., Target, Amazon, Starbucks"
              maxLength={50}
              helperText="We'll use this to style your card"
            />

            <FormInput
              label="Current Balance"
              value={balance}
              onChangeText={(val) => handleFieldChange('balance', val, setBalance)}
              onBlur={() => handleFieldBlur('balance')}
              error={fieldErrors.balance}
              touched={touched.balance}
              placeholder="0.00"
              keyboardType="decimal-pad"
              helperText="Track your remaining value"
            />
          </View>

          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Security Info</Text>
              <View style={styles.securityBadge}>
                <Ionicons name="lock-closed" size={12} color="#10B981" />
                <Text style={styles.securityBadgeText}>Encrypted</Text>
              </View>
            </View>

            <FormInput
              label="Card Number"
              value={cardNumber}
              onChangeText={(val) => {
                const formatted = formatCardNumberInput(val);
                handleFieldChange('card_number', formatted, setCardNumber);
              }}
              onBlur={() => handleFieldBlur('card_number')}
              error={fieldErrors.card_number}
              touched={touched.card_number}
              placeholder="1234 5678 9012 3456"
              helperText="Used to generate your scannable barcode"
              maxLength={35}
              keyboardType="default"
              autoCapitalize="characters"
            />

            <FormInput
              label="PIN"
              value={pin}
              onChangeText={(val) => handleFieldChange('pin', val, setPin)}
              onBlur={() => handleFieldBlur('pin')}
              error={fieldErrors.pin}
              touched={touched.pin}
              placeholder="4-8 digits"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={8}
              helperText="Your PIN is securely encrypted"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Additional Info</Text>
            
            <DatePickerInput
              label="Expiration Date"
              value={expirationDate}
              onChange={setExpirationDate}
              helperText="We'll remind you before it expires"
              placeholder="Select Date (Optional)"
            />

            <FormInput
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes about this card..."
              multiline
              numberOfLines={4}
              maxLength={1000}
              helperText="Gift occasion, restrictions, etc."
            />
          </View>

          <View style={styles.saveButtonContainer}>
            <Button onPress={handleSaveCard} loading={loading}>
              Save Card
            </Button>
          </View>

          <InfoCard />

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Scanner Modal */}
      {showScanner && (
        <Modal visible={showScanner} animationType="slide" presentationStyle="fullScreen">
          <OCRScanner
            onScanComplete={handleScanComplete}
            onClose={handleCloseScanner}
          />
        </Modal>
      )}

      {/* Validation Error Modal */}
      <ConfirmationModal
        visible={showValidationError}
        onClose={() => setShowValidationError(false)}
        onConfirm={() => setShowValidationError(false)}
        title="Please Fix These Errors"
        message={validationErrorMessage}
        confirmText="OK"
        cancelText=""
        icon="alert-circle"
        iconColor="#F59E0B"
      />

      {/* Save Error Modal */}
      <ConfirmationModal
        visible={showSaveError}
        onClose={() => setShowSaveError(false)}
        onConfirm={handleSaveCard}
        title="Save Failed"
        message={saveErrorMessage}
        confirmText="Retry"
        cancelText="Cancel"
        icon="close-circle"
        iconColor="#DC2626"
        loading={loading}
      />

      {/* Scan Complete Modal */}
      <ConfirmationModal
        visible={showScanComplete}
        onClose={() => setShowScanComplete(false)}
        onConfirm={() => setShowScanComplete(false)}
        title="Scan Complete"
        message="Review and edit the details below"
        confirmText="OK"
        cancelText=""
        icon="checkmark-circle"
        iconColor="#10B981"
      />

      {/* Save Success Modal */}
      <ConfirmationModal
        visible={showSaveSuccess}
        onClose={handleAddAnother}
        onConfirm={handleViewCards}
        title="Success!"
        message="Card added successfully"
        confirmText="View Cards"
        cancelText="Add Another"
        icon="checkmark-circle"
        iconColor="#10B981"
      />

      {/* Premium Modal */}
      {showPremiumModal && (
        <Modal
          visible={showPremiumModal}
          transparent={true}
          animationType="slide"
          onRequestClose={handleClosePremiumModal}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            justifyContent: 'flex-end',
          }}>
            <TouchableOpacity 
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={handleClosePremiumModal}
            />
            
            <View style={{
              backgroundColor: '#1F1F1F',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderTopWidth: 2,
              borderLeftWidth: 2,
              borderRightWidth: 2,
              borderColor: '#2A2A2A',
              maxHeight: '85%',
            }}>
              <ScrollView 
                showsVerticalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
              >
                <View style={styles.dragHandleContainer}>
                  <View style={styles.dragHandle} />
                </View>

                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={handleClosePremiumModal}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={22} color="#9CA3AF" />
                </TouchableOpacity>

                <View style={styles.premiumBadge}>
                  <Ionicons name="star" size={12} color="#141414" />
                  <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                </View>

                <Text style={styles.modalTitle}>Unlock Unlimited</Text>
                <Text style={styles.modalDescription}>
                  Upgrade for unlimited cards and exclusive features.
                </Text>

                <PremiumFeaturesList />

                <View style={styles.premiumPricing}>
                  <TouchableOpacity style={styles.pricingOption}>
                    <Text style={styles.pricingLabel}>Monthly</Text>
                    <View style={styles.pricingAmount}>
                      <Text style={styles.priceNumber}>$4.99</Text>
                      <Text style={styles.pricePeriod}>/mo</Text>
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={[styles.pricingOption, styles.pricingOptionBest]}>
                    <View style={styles.bestValueBadge}>
                      <Text style={styles.bestValueText}>SAVE $10</Text>
                    </View>
                    <Text style={styles.pricingLabel}>Yearly</Text>
                    <View style={styles.pricingAmount}>
                      <Text style={styles.priceNumber}>$49.99</Text>
                      <Text style={styles.pricePeriod}>/yr</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={styles.upgradeButton}
                  onPress={handleUpgradePress}
                  activeOpacity={0.7}
                >
                  <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.laterButton}
                  onPress={handleClosePremiumModal}
                  activeOpacity={0.7}
                >
                  <Text style={styles.laterButtonText}>Maybe Later</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

function formatDateForInput(date) {
  return date.toISOString().split('T')[0];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },

  // Page Header
  pageHeader: {
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: 16,
  },

  // Progress Bar
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#1F1F1F',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#DC2626',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },

  // Error Banner
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DC2626',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  errorBannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 20,
  },

  // Warning Card
  warningCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F59E0B40',
    marginBottom: 24,
    overflow: 'hidden',
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
  },

  // Scan Card
  scanCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  scanGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    minHeight: 80,
  },
  scanIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  scanTextContainer: {
    flex: 1,
  },
  scanTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  scanSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scanArrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2A2A2A',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginHorizontal: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Form Sections
  formSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10B98120',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B98140',
  },
  securityBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },

  // Save Button
  saveButtonContainer: {
    marginBottom: 24,
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#2A2A2A',
    marginBottom: 24,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DC262620',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    lineHeight: 20,
  },

  bottomSpacer: {
    height: 40,
  },

  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  modalContainer: {
    backgroundColor: '#1F1F1F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#2A2A2A',
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalScrollView: {
    flex: 1,
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingTop: 8,
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 8,
    right: 24,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#141414',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: 16,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#141414',
    letterSpacing: 0.5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  modalDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: 24,
    lineHeight: 20,
  },

  // Premium Features
  premiumFeatures: {
    marginBottom: 24,
    gap: 10,
  },
  premiumFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  premiumFeatureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1F1F1F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  premiumFeatureTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Pricing
  premiumPricing: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  pricingOption: {
    flex: 1,
    backgroundColor: '#141414',
    borderRadius: 10,
    padding: 14,
    borderWidth: 2,
    borderColor: '#2A2A2A',
    position: 'relative',
  },
  pricingOptionBest: {
    borderColor: '#10B981',
    backgroundColor: '#10B98110',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -6,
    right: 10,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bestValueText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#141414',
    letterSpacing: 0.3,
  },
  pricingLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 6,
  },
  pricingAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pricePeriod: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 2,
  },

  // Buttons
  upgradeButton: {
    height: 52,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  laterButton: {
    height: 44,
    backgroundColor: 'transparent',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  laterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
});