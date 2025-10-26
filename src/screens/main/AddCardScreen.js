import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useGiftCards } from '../../hooks/useGiftCards';
import { uploadImage } from '../../services/storage';
import { scanGiftCard } from '../../services/ocr';
import Button from '../../components/common/Button';
import GiftCardForm from '../../components/cards/GiftCardForm';
import ErrorMessage from '../../components/common/ErrorMessage';
import { COLORS, FONTS, SPACING, RADIUS } from '../../utils/constants';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants';
import { supabase } from '../../services/supabase';

const AddCardScreen = ({ navigation }) => {
  const { addCard, canAddMore } = useGiftCards(false);

  // Form data state
  const [formData, setFormData] = useState({
    storeName: '',
    cardNumber: '',
    balance: '',
    currency: 'USD',
    expirationDate: '',
    notes: '',
    isOnline: false,
    storeAddress: '',
    imageUrl: null,
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [error, setError] = useState('');

  // Calculate bottom padding for tab bar
  const tabBarHeight = Platform.OS === 'ios' ? 95 : 82;
  const bottomPadding = tabBarHeight + SPACING.md;

  // Request camera permissions
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera permission is needed to scan your gift cards.'
      );
      return false;
    }
    return true;
  };

  // Request media library permissions
  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Photo library permission is needed to select images.'
      );
      return false;
    }
    return true;
  };

  // Scan gift card with OCR
  const handleScanCard = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 10],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);

        // Show scanning feedback
        setScanning(true);
        setError('');

        // Scan the card
        const { data: scannedData, error: scanError } = await scanGiftCard(uri);
        setScanning(false);

        if (scanError) {
          setError(scanError);
          return;
        }

        // Auto-fill form with scanned data
        if (scannedData) {
          setFormData((prev) => ({
            ...prev,
            storeName: scannedData.storeName || prev.storeName,
            cardNumber: scannedData.cardNumber || prev.cardNumber,
            balance: scannedData.balance || prev.balance,
          }));

          Alert.alert(
            '✅ Card Scanned!',
            'Information has been extracted. Please review and edit as needed.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Scan error:', error);
      setScanning(false);
      Alert.alert('Error', 'Failed to scan card. Please try again.');
    }
  };

  // Take photo without scanning
  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 10],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  // Pick image from gallery
  const handlePickImage = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 10],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Show image options
  const showImageOptions = () => {
    Alert.alert(
      'Add Card Photo',
      'Choose how you want to add a photo',
      [
        {
          text: '📷 Scan Card (OCR)',
          onPress: handleScanCard,
        },
        {
          text: '📸 Take Photo',
          onPress: handleTakePhoto,
        },
        {
          text: '🖼️ Choose from Library',
          onPress: handlePickImage,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // Remove image
  const handleRemoveImage = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setImageUri(null),
        },
      ]
    );
  };

  // Handle form submission
  const handleSubmit = async (cardData) => {
    setError('');

    // Check card limit
    if (!canAddMore) {
      setError(ERROR_MESSAGES.cardLimitReached);
      return;
    }

    setLoading(true);

    try {
      // Upload image if selected
      let imageUrl = null;
      if (imageUri) {
        setUploadingImage(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        const { url, error: uploadError } = await uploadImage(imageUri, user.id);
        setUploadingImage(false);

        if (uploadError) {
          throw new Error(`Failed to upload image: ${uploadError}`);
        }

        imageUrl = url;
      }

      // Add image URL to card data
      const finalCardData = {
        ...cardData,
        image_url: imageUrl,
      };

      // Add card to database
      const { error: addError } = await addCard(finalCardData);

      if (addError) {
        throw new Error(addError);
      }

      // Success!
      setLoading(false);
      Alert.alert(
        '✅ Success!',
        SUCCESS_MESSAGES.cardAdded,
        [
          {
            text: 'Add Another',
            onPress: resetForm,
          },
          {
            text: 'View Cards',
            onPress: () => navigation.navigate('Dashboard'),
          },
        ]
      );
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      storeName: '',
      cardNumber: '',
      balance: '',
      currency: 'USD',
      expirationDate: '',
      notes: '',
      isOnline: false,
      storeAddress: '',
      imageUrl: null,
    });
    setImageUri(null);
    setError('');
  };

  // Handle cancel
  const handleCancel = () => {
    const hasData = formData.storeName || formData.cardNumber || 
                    formData.balance || formData.notes || imageUri;

    if (hasData) {
      Alert.alert(
        'Discard Changes?',
        'Are you sure you want to discard this gift card?',
        [
          {
            text: 'Keep Editing',
            style: 'cancel',
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Add Gift Card</Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottomPadding }
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Card Limit Warning */}
          {!canAddMore && (
            <View style={styles.warningBanner}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>Card Limit Reached</Text>
                <Text style={styles.warningText}>
                  Upgrade to Premium for unlimited gift cards!
                </Text>
              </View>
            </View>
          )}

          {/* Image Section */}
          <View style={styles.imageSection}>
            <Text style={styles.sectionLabel}>Card Photo (Optional)</Text>
            
            {imageUri ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={handleRemoveImage}
                >
                  <Text style={styles.removeImageText}>✕</Text>
                </TouchableOpacity>
                
                {/* Re-scan button */}
                <TouchableOpacity
                  style={styles.rescanButton}
                  onPress={showImageOptions}
                >
                  <Text style={styles.rescanButtonText}>Change Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.imagePlaceholder}
                onPress={showImageOptions}
                activeOpacity={0.7}
              >
                <Text style={styles.imagePlaceholderIcon}>📷</Text>
                <Text style={styles.imagePlaceholderText}>
                  Scan or Upload Card Photo
                </Text>
                <Text style={styles.imagePlaceholderSubtext}>
                  Tap to scan with OCR or choose an image
                </Text>
              </TouchableOpacity>
            )}

            {/* Scanning indicator */}
            {scanning && (
              <View style={styles.scanningContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.scanningText}>
                  🔍 Scanning card... This may take a few seconds
                </Text>
              </View>
            )}

            {/* Uploading indicator */}
            {uploadingImage && (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.uploadingText}>Uploading image...</Text>
              </View>
            )}
          </View>

          {/* Error Message */}
          {error && (
            <ErrorMessage
              message={error}
              variant="error"
              onRetry={() => setError('')}
            />
          )}

          {/* Gift Card Form */}
          <GiftCardForm
            initialData={formData}
            onSubmit={handleSubmit}
            loading={loading}
            submitButtonText="Add Gift Card"
            onCancel={handleCancel}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  keyboardView: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  cancelButton: {
    padding: SPACING.sm,
  },

  cancelButtonText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.primary,
    fontWeight: FONTS.weights.semiBold,
  },

  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },

  headerSpacer: {
    width: 70,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: SPACING.md,
  },

  warningBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.expiringSoon,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    alignItems: 'center',
  },

  warningIcon: {
    fontSize: 28,
    marginRight: SPACING.sm,
  },

  warningContent: {
    flex: 1,
  },

  warningTitle: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.bold,
    color: COLORS.expiringSoonText,
    marginBottom: SPACING.xs / 2,
  },

  warningText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.expiringSoonText,
    fontWeight: FONTS.weights.medium,
  },

  imageSection: {
    marginBottom: SPACING.lg,
  },

  sectionLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },

  imagePreviewContainer: {
    position: 'relative',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },

  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
  },

  removeImageButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },

  removeImageText: {
    color: COLORS.background,
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    lineHeight: FONTS.sizes.xl,
  },

  rescanButton: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  rescanButtonText: {
    color: COLORS.background,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semiBold,
    textAlign: 'center',
  },

  imagePlaceholder: {
    height: 180,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },

  imagePlaceholderIcon: {
    fontSize: 56,
    marginBottom: SPACING.sm,
  },

  imagePlaceholderText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },

  imagePlaceholderSubtext: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },

  scanningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.primary + '15',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },

  scanningText: {
    marginLeft: SPACING.sm,
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weights.medium,
  },

  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
  },

  uploadingText: {
    marginLeft: SPACING.sm,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
});

export default AddCardScreen;