export default {
  expo: {
    name: "Cardinal",
    slug: "cardinal",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "src/assets/icons/icon.png",
      resizeMode: "contain",
      backgroundColor: "#6366F1"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.cardinal.app"
    },
    android: {
      package: "com.cardinal.app",
      adaptiveIcon: {
        foregroundImage: "src/assets/icons/icon.png",
        backgroundColor: "#6366F1"
      },
      edgeToEdgeEnabled: true
    },
    web: {
      favicon: "src/assets/icons/icon.png"
    },
    plugins: [
      [
        "react-native-google-mobile-ads",
        {
          // Replace these with your actual AdMob App IDs from Google AdMob Console
          // Get these from: https://apps.admob.com/
          androidAppId: process.env.ADMOB_ANDROID_APP_ID || "ca-app-pub-3940256099942544~3347511713", // Test ID
          iosAppId: process.env.ADMOB_IOS_APP_ID || "ca-app-pub-3940256099942544~1458002511", // Test ID
        }
      ]
    ],
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      googleVisionApiKey: process.env.GOOGLE_VISION_API_KEY,
      googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY,
      admobIosBannerId: process.env.ADMOB_IOS_BANNER_ID || "ca-app-pub-3940256099942544/2934735716", // Test Banner ID
      admobAndroidBannerId: process.env.ADMOB_ANDROID_BANNER_ID || "ca-app-pub-3940256099942544/6300978111", // Test Banner ID
      iosPremiumProductId: process.env.IOS_PREMIUM_PRODUCT_ID,
      androidPremiumProductId: process.env.ANDROID_PREMIUM_PRODUCT_ID,
      maxFreeCards: process.env.MAX_FREE_CARDS || 15,
      supportEmail: process.env.SUPPORT_EMAIL,
      appEnv: process.env.APP_ENV || "development"
    }
  }
};