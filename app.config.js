export default {
  expo: {
    name: "Cardinal",
    slug: "cardinal",
    scheme: "cardinal",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./src/assets/icons/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./src/assets/icons/icon.png",
      resizeMode: "contain",
      backgroundColor: "#6366F1"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.cardinal.app",
      infoPlist: {
        UIBackgroundModes: ["location", "fetch", "remote-notification"],
        NSLocationAlwaysAndWhenInUseUsageDescription: "Cardinal needs location access to remind you when you're near stores with gift cards.",
        NSLocationWhenInUseUsageDescription: "Cardinal needs location access to remind you when you're near stores with gift cards.",
        NSLocationAlwaysUsageDescription: "Cardinal needs background location access to send you timely reminders when you're near stores with gift cards, even when the app is closed."
      }
    },
    android: {
      package: "com.cardinal.app",
      adaptiveIcon: {
        foregroundImage: "./src/assets/icons/icon.png",
        backgroundColor: "#6366F1"
      },
      edgeToEdgeEnabled: true,
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "POST_NOTIFICATIONS"
      ]
    },
    web: {
      favicon: "./src/assets/icons/icon.png"
    },
    plugins: [
      [
        "react-native-google-mobile-ads",
        {
          androidAppId: "ca-app-pub-3940256099942544~3347511713", // Test ID
          iosAppId: "ca-app-pub-3940256099942544~1458002511", // Test ID
          skipAutoInit: false
        }
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Cardinal needs location access to remind you when you're near stores with gift cards.",
          locationAlwaysPermission: "Cardinal needs background location access to send you timely reminders when you're near stores with gift cards, even when the app is closed.",
          locationWhenInUsePermission: "Cardinal needs location access to remind you when you're near stores with gift cards.",
          isIosBackgroundLocationEnabled: true,
          isAndroidBackgroundLocationEnabled: true
        }
      ],
      [
        "expo-notifications",
        {
          icon: "./src/assets/icons/notification-icon.png",
          color: "#C41E3A",
          sounds: [],
          mode: "production"
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "eca8b061-41c3-45e5-beb8-4409d7853a8d"
      },
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      googleVisionApiKey: process.env.GOOGLE_VISION_API_KEY,
      googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY,
      admobIosBannerId: process.env.ADMOB_IOS_BANNER_ID || "ca-app-pub-3940256099942544/2934735716",
      admobAndroidBannerId: process.env.ADMOB_ANDROID_BANNER_ID || "ca-app-pub-3940256099942544/6300978111",
      iosPremiumProductId: process.env.IOS_PREMIUM_PRODUCT_ID,
      androidPremiumProductId: process.env.ANDROID_PREMIUM_PRODUCT_ID,
      maxFreeCards: process.env.MAX_FREE_CARDS || 15,
      supportEmail: process.env.SUPPORT_EMAIL,
      appEnv: process.env.APP_ENV || "development"
    }
  }
};