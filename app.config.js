export default {
  expo: {
    name: "cardinal",
    slug: "cardinal",
    scheme: "cardinal",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true
    },
    plugins: [
      "expo-router"
    ],
    extra: {
      googleVisionApiKey: process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY
    }
  }
};