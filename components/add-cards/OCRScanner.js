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
import Colors from '../../constants/Colors';
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
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Requesting camera access...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No access to camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function takePicture() {
    if (!cameraRef.current || processing) return;

    setProcessing(true);
    setProgress(0);

    try {
      // Capture photo with higher quality and base64
      setProgress(10);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9, // Higher quality for better OCR
        base64: true,
        skipProcessing: false,
      });

      console.log('Photo captured:', photo.uri);
      setProgress(30);

      // Check API key
      if (GOOGLE_CLOUD_VISION_API_KEY === 'YOUR_API_KEY_HERE') {
        Alert.alert(
          'API Key Required',
          'Please add your Google Cloud Vision API key to use OCR scanning.',
          [{ text: 'Manual Entry', onPress: onClose }]
        );
        setProcessing(false);
        return;
      }

      // Call Google Cloud Vision API
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
                  // Optimize for English text
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

      // Extract text from response
      if (result.responses && 
          result.responses[0].textAnnotations && 
          result.responses[0].textAnnotations.length > 0) {
        
        const detectedText = result.responses[0].textAnnotations[0].description;
        console.log('OCR Text:', detectedText);
        
        // Parse the text
        const parsedData = parseGiftCardText(detectedText);
        console.log('Parsed Data:', parsedData);
        
        setProgress(100);

        // Small delay so user sees 100%
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
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Scan Frame */}
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            
            {processing && (
              <View style={styles.processingOverlay}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.processingText}>
                  {progress < 30 ? 'Capturing...' :
                   progress < 70 ? 'Reading card...' :
                   progress < 90 ? 'Processing...' :
                   'Almost done...'}
                </Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
              </View>
            )}
          </View>

          {/* Bottom Bar */}
          <View style={styles.bottomBar}>
            <Text style={styles.instructions}>
              {processing 
                ? 'Processing image...' 
                : 'Position card within frame\nMake sure text is clear and well-lit'}
            </Text>
            <TouchableOpacity
              style={[styles.captureButton, processing && styles.captureButtonDisabled]}
              onPress={takePicture}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color={Colors.text} size="small" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.manualButton}
              onPress={onClose}
              disabled={processing}
            >
              <Text style={styles.manualButtonText}>Enter Manually</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  topBar: {
    padding: 20,
    paddingTop: 60,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '600',
  },
  scanFrame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 40,
    marginVertical: 60,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: Colors.primary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  processingOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  processingText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  progressBar: {
    width: 200,
    height: 4,
    backgroundColor: Colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  bottomBar: {
    padding: 40,
    alignItems: 'center',
  },
  instructions: {
    color: Colors.text,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.text,
    marginBottom: 16,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.text,
  },
  manualButton: {
    paddingVertical: 8,
  },
  manualButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginTop: 16,
  },
  errorText: {
    color: Colors.error,
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});