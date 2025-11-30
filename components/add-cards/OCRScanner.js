import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { parseGiftCardText } from '../../lib/ocr';
import Constants from 'expo-constants';

const GOOGLE_CLOUD_VISION_API_KEY = 
  Constants.expoConfig?.extra?.googleVisionApiKey;

export default function OCRScanner({ onScanComplete, onClose }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const cameraRef = useRef(null);

  async function requestPermission() {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to scan cards');
    }
  }

  if (hasPermission === null) {
    requestPermission();
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="camera" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.loadingText}>Requesting camera access...</Text>
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Ionicons name="camera-off" size={64} color="#DC2626" />
          </View>
          <Text style={styles.errorTitle}>Camera Access Required</Text>
          <Text style={styles.errorMessage}>
            Cardinal needs camera access to scan your gift cards
          </Text>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={requestPermission}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Enter Manually</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  async function takePicture() {
    if (!cameraRef.current || processing) return;

    setProcessing(true);
    setProgress(0);

    try {
      setProgress(10);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        base64: true,
        skipProcessing: false,
      });

      console.log('Photo captured:', photo.uri);
      setProgress(30);

      if (GOOGLE_CLOUD_VISION_API_KEY === 'YOUR_API_KEY_HERE') {
        Alert.alert(
          'API Key Required',
          'Please add your Google Cloud Vision API key to use OCR scanning.',
          [{ text: 'Manual Entry', onPress: onClose }]
        );
        setProcessing(false);
        return;
      }

      setProgress(40);
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_VISION_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                image: {
                  content: photo.base64,
                },
                features: [
                  {
                    type: 'TEXT_DETECTION',
                    maxResults: 1,
                  },
                ],
                imageContext: {
                  languageHints: ['en'],
                },
              },
            ],
          }),
        }
      );

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
      }

      const result = await response.json();
      console.log('Vision API Response:', result);

      setProgress(85);

      if (result.responses && 
          result.responses[0].textAnnotations && 
          result.responses[0].textAnnotations.length > 0) {
        
        const detectedText = result.responses[0].textAnnotations[0].description;
        console.log('OCR Text:', detectedText);
        
        const parsedData = parseGiftCardText(detectedText);
        console.log('Parsed Data:', parsedData);
        
        setProgress(100);

        setTimeout(() => {
          onScanComplete(parsedData);
        }, 300);

      } else {
        throw new Error('No text detected in image');
      }

    } catch (error) {
      console.error('OCR error:', error);
      
      let errorMessage = 'Could not read the card. Please try again or enter manually.';
      
      if (error.message.includes('API key')) {
        errorMessage = 'Invalid API key. Please check your configuration.';
      } else if (error.message.includes('No text detected')) {
        errorMessage = 'No text found. Make sure the card is well-lit and in focus.';
      } else if (error.message.includes('quota')) {
        errorMessage = 'API quota exceeded. Please try again later or enter manually.';
      }
      
      Alert.alert(
        'Scan Failed',
        errorMessage,
        [
          { text: 'Retry', onPress: () => setProcessing(false) },
          { text: 'Manual Entry', onPress: onClose },
        ]
      );
      setProcessing(false);
    }
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      >
        <View style={styles.overlay}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
              disabled={processing}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Scan Gift Card</Text>
            </View>
            <View style={styles.placeholder} />
          </View>

          {/* Center Frame Area */}
          <View style={styles.centerArea}>
            {/* Scan Frame */}
            <View style={styles.scanFrame}>
              {/* Corner Indicators */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {/* Processing State */}
              {processing && (
                <View style={styles.processingOverlay}>
                  <View style={styles.processingContent}>
                    <View style={styles.spinnerContainer}>
                      <ActivityIndicator size="large" color="#DC2626" />
                    </View>
                    <Text style={styles.processingTitle}>
                      {progress < 30 ? 'Capturing Image' :
                       progress < 70 ? 'Reading Card' :
                       progress < 90 ? 'Extracting Details' :
                       'Almost Done'}
                    </Text>
                    <View style={styles.progressBarContainer}>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                      </View>
                      <Text style={styles.progressText}>{progress}%</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Instructions */}
            {!processing && (
              <View style={styles.instructionsContainer}>
                <View style={styles.instructionCard}>
                  <Ionicons name="scan" size={24} color="#DC2626" />
                  <Text style={styles.instructionsText}>
                    Position card within frame
                  </Text>
                </View>
                <View style={styles.tipsContainer}>
                  <View style={styles.tipItem}>
                    <Ionicons name="sunny" size={16} color="#9CA3AF" />
                    <Text style={styles.tipText}>Ensure good lighting</Text>
                  </View>
                  <View style={styles.tipItem}>
                    <Ionicons name="crop" size={16} color="#9CA3AF" />
                    <Text style={styles.tipText}>Keep text in focus</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomBar}>
            {/* Info Badge */}
            {!processing && (
              <View style={styles.infoBadge}>
                <Ionicons name="sparkles" size={16} color="#F59E0B" />
                <Text style={styles.infoBadgeText}>AI-powered scanning</Text>
              </View>
            )}

            {/* Capture Button */}
            <View style={styles.captureContainer}>
              <TouchableOpacity
                style={[styles.captureButton, processing && styles.captureButtonDisabled]}
                onPress={takePicture}
                disabled={processing}
                activeOpacity={0.8}
              >
                {processing ? (
                  <View style={styles.captureButtonProcessing}>
                    <ActivityIndicator color="#141414" size="small" />
                  </View>
                ) : (
                  <>
                    <View style={styles.captureButtonInner} />
                    <View style={styles.captureButtonRing} />
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Manual Entry Button */}
            {!processing && (
              <TouchableOpacity 
                style={styles.manualButton}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Ionicons name="create-outline" size={20} color="#9CA3AF" />
                <Text style={styles.manualButtonText}>Enter Manually</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 44,
  },

  // Center Area
  centerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  scanFrame: {
    width: '100%',
    aspectRatio: 1.586, // Credit card ratio
    maxWidth: 340,
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },

  // Corner Indicators
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#DC2626',
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#DC2626',
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#DC2626',
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#DC2626',
    borderBottomRightRadius: 16,
  },

  // Processing Overlay
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  processingContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  spinnerContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1F1F1F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  processingTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#DC2626',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },

  // Instructions
  instructionsContainer: {
    marginTop: 32,
    width: '100%',
    maxWidth: 340,
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  instructionsText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  tipsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  tipItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 20, 20, 0.6)',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  tipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    flex: 1,
  },

  // Bottom Bar
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignItems: 'center',
    gap: 20,
  },

  // Info Badge
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  infoBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F59E0B',
  },

  // Capture Button
  captureContainer: {
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
  },
  captureButtonRing: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  captureButtonProcessing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Manual Entry Button
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  manualButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#9CA3AF',
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorIcon: {
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#DC2626',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#DC2626',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#DC2626',
  },
});