import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getRandomValues as expoCryptoGetRandomValues } from "expo-crypto";
import { Buffer } from "buffer";
global.Buffer = Buffer;
import {
  transact,
  Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import { PublicKey } from "@solana/web3.js";
import base58 from "bs58";
import axios from "axios";
import Wallet from "../assets/images/wallet.png";
import { useOkto } from "okto-sdk-react-native";

import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
} from "react-native";
import AppleHealthKit from "react-native-health";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import ActivityRow from "../components/ActivityRow";
import Popup from "../components/Popup";
import Arrowright from "react-native-vector-icons/AntDesign";
import Google from "../assets/images/google.png";
import { refreshServer, serverGoogleAuth } from "../utils/Apicalls";
import { activities } from "../constants/activities";
import { BlurView } from "expo-blur";
import WalletDeepLink from "../components/Deeplinks/WalletDeepLink";
import { VIEW_TYPE } from "../utils/enums";

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

export default function SignIn({ navigation }) {
  const { authenticate } = useOkto();
  const [isLoading, setIsLoading] = useState(false);
  const [popupContent, setPopupContent] = useState("");
  const [popupVisible, setPopupVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [contemail, setContmail] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [walletPublicKey, setWalletPublicKey] = useState(null);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const healthKitOptions = {
    permissions: {
      read: [
        AppleHealthKit.Constants.Permissions.StepCount,
        AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
        AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
        AppleHealthKit.Constants.Permissions.BasalEnergyBurned,
      ],
      write: [],
    },
  };

  const requestAppleHealthPermissions = () => {
    AppleHealthKit.initHealthKit(healthKitOptions, (err, results) => {
      if (err) {
        console.log("Error initializing HealthKit: ", err);
        return;
      }

      console.log("HealthKit initialized:", results);
    });
  };
  const handleContinueWithWalletSend = () => {
    setPopupVisible(false);
    setModalVisible(true); // Show the modal when the wallet button is clicked
  };
  const storeWalletPublicKey = async (publicKey) => {
    try {
      await AsyncStorage.setItem("walletPublicKey", publicKey);
      console.log("Wallet public key stored:", publicKey);
    } catch (error) {
      console.error("Error storing wallet public key:", error);
    }
  };

  const getWalletPublicKey = async () => {
    try {
      const publicKey = await AsyncStorage.getItem("walletPublicKey");
      if (publicKey !== null) {
        console.log("Wallet public key found:", publicKey);
        setWalletPublicKey(publicKey);
        navigation.navigate("ExploreStack");
      } else {
        console.log("No wallet public key found, showing login options.");
        // setPopupVisible(true);
      }
    } catch (error) {
      console.error("Error retrieving wallet public key:", error);
    }
  };

  const handleGetStarted = () => {
    setContmail(true);
    setPopupContent(
      <View className="flex h-30 items-center justify-center">
        <Text className="font-bold text-center my-3">
          Make / Login in Catoff
        </Text>
        <Text className="text-xs text-gray-700 text-center">
          Join over 20,000 people using Catoff to speculate against your friends
          and make real pledges.
        </Text>
      </View>
    );
    setPopupVisible(true);
  };

  const APP_IDENTITY = {
    name: "Catoff Gaming",
    uri: "https://catoff.xyz",
    icon: "favicon.ico",
  };

  const handleContinueWithWallet = async () => {
    setErrorMessage("");
    setPopupContent();
    // <View className="flex items-center justify-center h-70">
    //   <Text className="font-bold mt-2">
    //     Connecting to your wallet and signing the message...
    //   </Text>
    // </View>

    try {
      const transactionResult = await transact(async (wallet) => {
        const authorizationResult = await wallet.authorize({
          cluster: "solana:devnet",
          identity: APP_IDENTITY,
        });

        const publicKey = new PublicKey(
          Buffer.from(authorizationResult.accounts[0].address, "base64")
        );

        await storeWalletPublicKey(publicKey.toString());

        const message = await getVerificationMessage(publicKey.toString());
        console.log("Verification message retrieved:🔥", message);
        var finalMessage = message;
        console.log("FINALLLLLL🥳", finalMessage);

        console.log("AFteer setting verification message", verificationMessage);

        const messageBuffer = new Uint8Array(
          message.split("").map((char) => char.charCodeAt(0))
        );
        console.log("MESSAGE BUFFER", messageBuffer);

        const signedPayloads = await wallet.signMessages({
          addresses: [authorizationResult.accounts[0].address],
          payloads: [messageBuffer],
        });

        return { signedPayloads, publicKey, message };
      });

      const { signedPayloads, publicKey, message } = transactionResult;
      console.log(
        "signedPayloads, publicKey, message🍬",
        signedPayloads,
        publicKey,
        message
      );
      await AsyncStorage.setItem("publicKey", publicKey.toString());
      if (
        !signedPayloads ||
        !Array.isArray(signedPayloads) ||
        signedPayloads.length === 0
      ) {
        throw new Error("Signed payloads are empty or invalid.");
      }

      const signatureBase58 = base58.encode(signedPayloads[0]);

      console.log("Signed message in base58 format:", signatureBase58);

      const loginResponse = await loginUser(
        message,
        signatureBase58,
        publicKey.toString()
      );

      // Handle successful login
      console.log("SUCCESSFUL LOGIN");
      handleLoginSuccess(loginResponse);

      setPopupContent();
      // <View className="flex items-center justify-center h-70">
      //   <Text className="text-green-600 text-center">
      //     Message signed and logged in successfully!
      //   </Text>
      // </View>
    } catch (error) {
      console.error("Error signing the message or logging in:", error);

      if (error.response) {
        console.error("Error Response Data:", error.response.data);
        console.error("Error Status Code:", error.response.status);
        console.error("Error Headers:", error.response.headers);
      } else if (error.request) {
        console.error("Error Request Details:", error.request);
      } else {
        console.error("Error Message:", error.message);
      }

      setErrorMessage(error.message || "An unknown error occurred.");
    }
  };

  const loginUser = async (message, signature, publicKey) => {
    try {
      const payload = {
        message: message,
        signature: signature,
        publickey: publicKey,
      };

      console.log("Sending payload to API:", payload);

      const response = await axios.post(
        "https://mainnet-apiv2.catoff.xyz/auth/wallet/login",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response:", response.data);

      if (response.data.success) {
        await AsyncStorage.setItem(
          "authToken",
          response.data.data.access_token
        );
        await AsyncStorage.setItem(
          "refreshToken",
          response.data.data.refresh_token
        );
        return response.data.data;
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("API request failed:", error);

      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error status:", error.response.status);
        console.error("Error headers:", error.response.headers);
      } else if (error.request) {
        console.error("Error request details:", error.request);
      } else {
        console.error("Error message:", error.message);
      }

      throw error;
    }
  };

  const handleLoginSuccess = (loginData) => {
    navigation.navigate("ExploreStack");
  };
  const handleCloseModal = () => {
    setModalVisible(false); // Close the modal
  };
  const getVerificationMessage = async (walletAddress) => {
    try {
      const response = await axios.get(
        `https://mainnet-apiv2.catoff.xyz/auth/wallet/verificationMessage/${walletAddress}`
      );

      if (response.data.success) {
        const fullMessageeee = response;
        const fullMessage = response.data.data;

        console.log("entuire response", response);
        console.log("RESPONSE.DATA", response.data);

        console.log("Full verification message:", fullMessage);
        console.log("FOOLLLL", fullMessage.replace(/\n/g, " "));
        // setVerificationMessage(fullMessage.replace(/\n/g, " "));
        // return fullMessage.replace(/\n/g, " ");
        return fullMessage;
      } else {
        throw new Error("Failed to get verification message");
      }
    } catch (error) {
      throw new Error("Failed to get verification message");
    }
  };

  useEffect(() => {
    getWalletPublicKey();

    GoogleSignin.configure({
      scopes: [
        "email",
        "profile",
        "https://www.googleapis.com/auth/fitness.activity.read",
      ],
      offlineAccess: true,
      webClientId:
        "660342546596-e97jdcl69tgiu722n7lmroc5u0iivgfu.apps.googleusercontent.com",
      forceCodeForRefreshToken: true,
    });
  }, []);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log(userInfo.serverAuthCode);
      const { idToken } = userInfo;
      const accessToken = await GoogleSignin.getTokens();
      console.log(accessToken);
      console.log(idToken);
      // Navigate to user profile upon successful sign-in
      if (idToken) {
        handleAuthenticationProcess(userInfo.serverAuthCode);
        authenticate(idToken, (result, error) => {
          if (error) {
            console.log("here");
            return;
          }
          if (result) {
            console.log("no error");
          }
        });
      }
      requestAppleHealthPermissions();
    } catch (error) {
      console.log("GAuth Error", error);
      setIsLoading(false);
    }
  };

  const handleAuthenticationProcess = async (code) => {
    console.log("here");
    const tokens = await serverGoogleAuth(code);

    console.log("😶‍🌫️serverAuthCode", tokens);
    if (tokens.success) {
      const now = new Date();
      const accessTokenExpiry = new Date(now.getTime() + 24 * 60 * 1000); // 24 minutes
      const refreshTokenExpiry = new Date(
        now.getTime() + 80 * 24 * 60 * 60 * 1000
      ); // 80 days
      await AsyncStorage.setItem("authToken", tokens.data.access_token);
      await AsyncStorage.setItem(
        "authTokenExpiry",
        accessTokenExpiry.toISOString()
      );
      await AsyncStorage.setItem("refreshToken", tokens.data.refresh_token);
      await AsyncStorage.setItem("VIEW_TYPE", VIEW_TYPE.OKTO_WALLET_VIEW);
      await AsyncStorage.setItem(
        "refreshTokenExpiry",
        refreshTokenExpiry.toISOString()
      );
      const auth = await AsyncStorage.getItem("authToken");
      console.log("🏆😣Auth token", auth);

      navigation.navigate("Explore");
      //navigation.navigate("MainTabs");
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-[#E1F076]">
      <View className="w-full h-[60%] flex items-center justify-end">
        {activities.map((activity, index) => (
          <ActivityRow key={index} activities={activity} />
        ))}
      </View>
      <View className="w-full h-[40%] flex items-center justify-center gap-3">
        <TouchableOpacity
          className="w-[85%] h-[56px] rounded-full flex items-center justify-center bg-white"
          onPress={handleGetStarted}
        >
          <View className="flex-row items-center">
            <Text className="text-center mr-2 font-semibold text-base text-gray-800">
              Let’s get started
            </Text>
            <Arrowright name="arrowright" size={16} color="#1F1F1F" />
          </View>
        </TouchableOpacity>
        <Text className="w-[328px] h-[20px] text-center text-xs px-4 text-[#4B5462]">
          By proceeding, you agree to our{" "}
          <Text className="underline">terms & conditions</Text>, and{" "}
          <Text className="underline">privacy policy</Text>.
        </Text>
      </View>

      <Popup isVisible={popupVisible} onClose={() => setPopupVisible(false)}>
        <View className="flex flex-col justify-center items-center w-[344px] rounded-t-3xl">
          {popupContent}
          {/* {errorMessage && (
            <Text className="text-red-600 text-center mt-2">
              {errorMessage}
            </Text>
          )} */}
          {/* {walletPublicKey && (
                <Text className="text-green-600 text-center">
                  Wallet connected: {walletPublicKey}
                </Text>
              )}
              {verificationMessage && (
                <Text className="text-blue-600 text-center">
                  Verification message: {verificationMessage}
                </Text>
              )} */}
          {contemail && (
            <View className="gap-3 mb-10 mt-4">
              <TouchableOpacity
                className="flex-row justify-center items-center w-[328px] h-[48px] border border-gray-300 rounded-full"
                onPress={handleContinueWithWalletSend}
              >
                <Image source={Wallet} className="w-5 h-5 mr-2" />
                <Text className="text-black"> Continue with Wallet</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row justify-center items-center w-[328px] h-[48px] border border-gray-300 rounded-full"
                onPress={handleSignIn}
              >
                <Image source={Google} className="w-5 h-5" />
                <Text className="text-black"> Continue with Google</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Popup>
      <WalletDeepLink show={modalVisible} setModalVisible={setModalVisible} />
    </View>
  );
}
