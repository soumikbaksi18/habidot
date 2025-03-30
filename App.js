import { getRandomValues as expoCryptoGetRandomValues } from "expo-crypto"; // Polyfill for crypto.getRandomValues()
import { Buffer } from "buffer"; // Polyfill for Buffer

global.Buffer = Buffer; // Set global Buffer for crypto operations

// Polyfill for crypto object
class Crypto {
  getRandomValues = expoCryptoGetRandomValues;
}

const webCrypto = typeof crypto !== "undefined" ? crypto : new Crypto();

(() => {
  if (typeof crypto === "undefined") {
    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      enumerable: true,
      get: () => webCrypto,
    });
  }
})();

import React, { useEffect } from "react";
import AppNavigator from "./AppNavigator";
import { NativeWindStyleSheet } from "nativewind";
import { BuildType, OktoProvider } from "okto-sdk-react-native";
import { useFonts } from "expo-font";
import { Text, StatusBar, View, ActivityIndicator } from "react-native";

// Initialize Okto SDK API key
const OKTO_CLIENT_API = "475114e1-aaa0-460b-ae25-ab4f2bf71bac";

// Configure NativeWind style output
NativeWindStyleSheet.setOutput({
  default: "native",
});

export default function App() {
  const [fontsLoaded] = useFonts({
    TTRuns: require("./src/assets/fonts/font1.ttf"),
    InterBold: require("./src/assets/fonts/Inter-Bold.ttf"),
    InterLight: require("./src/assets/fonts/Inter-Light.ttf"),
    InterMedium: require("./src/assets/fonts/Inter-Medium.ttf"),
    Inter: require("./src/assets/fonts/Inter-Regular.ttf"),
    InterSemiBold: require("./src/assets/fonts/Inter-SemiBold.ttf"),
    TTRunsTrialMedium: require("./src/assets/fonts/TT Runs Trial Medium.ttf"),
    TTRunsTrialRegular: require("./src/assets/fonts/TT Runs Trial Regular.ttf"),
  });

  useEffect(() => {
    // Ensure StatusBar setup happens after component is mounted
    StatusBar.setBarStyle("dark-content", true);
  }, []);

  // Properly return the loading screen when fonts are not loaded
  if (!fontsLoaded) {
    return (
      <View className="flex-1 justify-center items-center my-36">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="text-lg font-semibold mt-2">Loading...</Text>
      </View>
    );
  }

  return (
    <>
      {/* Ensure StatusBar is set after app mount */}
      <StatusBar backgroundColor="transparent" barStyle="dark-content" />
      <OktoProvider apiKey={OKTO_CLIENT_API} buildType={BuildType.SANDBOX}>
        <AppNavigator />
      </OktoProvider>
    </>
  );
}
