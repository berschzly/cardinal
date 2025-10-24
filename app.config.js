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
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "src/assets/icons/icon.png",
        backgroundColor: "#6366F1"
      },
      edgeToEdgeEnabled: true
    },
    web: {
      favicon: "src/assets/icons/icon.png"
    },
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      googleVisionApiKey: process.env.GOOGLE_VISION_API_KEY,
      googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY,
      admobIosBannerId: process.env.ADMOB_IOS_BANNER_ID,
      admobAndroidBannerId: process.env.ADMOB_ANDROID_BANNER_ID,
      iosPremiumProductId: process.env.IOS_PREMIUM_PRODUCT_ID,
      androidPremiumProductId: process.env.ANDROID_PREMIUM_PRODUCT_ID,
      maxFreeCards: process.env.MAX_FREE_CARDS,
      supportEmail: process.env.SUPPORT_EMAIL,
      appEnv: process.env.APP_ENV
    }
  }
};