export default {
  expo: {
    name: "Cardinal",
    slug: "cardinal",
    scheme: "cardinal",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    
    // App description for stores
    description: "Manage all your gift cards in one secure place",
    
    // Privacy and permissions
    privacy: "unlisted",
    
    splash: {
      image: "./assets/images/logo.png",
      resizeMode: "contain",
      backgroundColor: "#141414"
    },
    
    icon: "./assets/images/logo.png",
    
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.cardinalapp.cardinal",
      buildNumber: "1",
      infoPlist: {
        NSCameraUsageDescription: "Cardinal needs camera access to scan gift card barcodes and extract card details.",
        NSPhotoLibraryUsageDescription: "Cardinal needs photo library access to select gift card images for scanning."
      }
    },
    
    android: {
      package: "com.cardinalapp.cardinal",
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/images/logo.png",
        backgroundColor: "#141414"
      },
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
      // REMOVED: edgeToEdgeEnabled - this can cause crashes on some devices
    },
    
    plugins: [
      "expo-router",
      [
        "expo-camera",
        {
          "cameraPermission": "Cardinal needs camera access to scan gift card barcodes and extract card details."
        }
      ],
      [
        "expo-notifications",
        {
          "color": "#DC2626"
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "Cardinal needs photo library access to select gift card images for scanning."
        }
      ],
      // ADD: React Native Vision Camera plugin
      [
        "react-native-vision-camera",
        {
          "cameraPermissionText": "Cardinal needs camera access to scan gift card barcodes and extract card details.",
          "enableCodeScanner": false
        }
      ]
    ],
    
    extra: {
      googleVisionApiKey: process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY,
      eas: {
        projectId: "885ca7ac-2171-4351-858a-4297858bc021"
      }
    },
    
    updates: {
      fallbackToCacheTimeout: 0,
      url: "https://u.expo.dev/885ca7ac-2171-4351-858a-4297858bc021"
    },
    
    runtimeVersion: {
      policy: "appVersion"
    },
    
    // Asset optimization
    assetBundlePatterns: [
      "**/*"
    ]
  }
};