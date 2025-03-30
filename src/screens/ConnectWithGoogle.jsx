import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { serverGoogleAuth } from "../utils/Apicalls";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
} from "react-native";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useOkto } from "okto-sdk-react-native";
import ActivityRow from "../components/ActivityRow";
import Popup from "../components/Popup";
import Arrowright from "react-native-vector-icons/AntDesign";
import Apple1 from "react-native-vector-icons/AntDesign";
import Google from "../assets/images/google.png";
import okto from "../assets/images/okto.svg";
import wallet from "../assets/images/Wallet.png";
import { refreshServer } from "../utils/Apicalls";
import heart from "../assets/images/heart.png";
import eye from "../assets/images/eye.png";
import lock from "../assets/images/lock.png";
import AppleHealthKit from 'react-native-health';
export default function ConnectWithGoogle({ navigation }) {
  const { authenticate } = useOkto();
  const [isLoading, setIsLoading] = useState(false);
  const [popupContent, setPopupContent] = useState("");
  const [walletPopupContent, setWalletPopupContent] = useState("");
  const [popupVisible, setPopupVisible] = useState(false);
  const [walletPopupVisible, setWallletPopupVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [contemail, setContmail] = useState(true);

  const healthKitOptions = {
    permissions: {
      read: [
        AppleHealthKit.Constants.Permissions.StepCount,
        AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
        AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
        AppleHealthKit.Constants.Permissions.BasalEnergyBurned
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
  
  

  const handleGetStarted = () => {
    setContmail(true);
    setPopupContent(
      <View className="flex h-[120px] items-center justify-center">
        <Text className="font-bold text-center my-3">
          Log In to your account{" "}
        </Text>
        <Text className="font-inter mx-2 font-normal text-xs text-gray-700 text-center">
          Welcome to Catoff! Where every dare, duel, and global pool brings a
          new adventure!
        </Text>
      </View>
    );
    setPopupVisible(true);
  };

  const handleConnectWallet = () => {
    setContmail(true);
    setWallletPopupVisible(true);
  };

  const handleAlreadyUser = () => {
    setContmail(true);
    setPopupContent(
      <View className="flex h-[120px] items-center justify-center">
        <Text className="  font-bold text-center my-3">
          Log In to your account
        </Text>
        <Text className="font-inter font-normal text-xs text-center text-gray-700">
          Welcome back! Use Catoff to bet against your friends and make real
          wagers.
        </Text>
      </View>
    );
    setPopupVisible(true);
  };

  const handleContinueWithEmail = () => {
    setContmail(false);
    setPopupContent(
      <View className="flex gap-4 h-[280px] leading-5  items-center justify-center">
        <Text className="font-bold text-center ">Enter your email address</Text>

        <Text className="font-inter font-normal  my-2 text-xs text-gray-700 text-center">
          *Coming soon* We will use this to create your account, and give you
          access to Catoff.
        </Text>

        <TextInput
          className="flex text-center justify-center items-center w-[328px] h-[48px] border border-gray-300 rounded-[32px]"
          onChangeText={(newText) => setEmail(newText)}
          defaultValue={email}
          placeholder="Enter your email"
        />
        <TouchableOpacity
          className="flex  flex-row justify-center items-center  w-[328px] h-[48px] bg-black rounded-[32px]"
          onPress={() => {
            // Add your logic here to handle email input and continue
            console.log("Email:", email);
            // Close the popup
            setPopupVisible(false);
            setContmail(true);
          }}
        >
          <Text className="text-white">Continue</Text>
          <Arrowright name="arrowright" size={16} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  useEffect(() => {
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

  useEffect(() => {
    const updateToken = async () => {
      const output = await refreshServer();
      console.log(output);
      if (!output.success) {
        navigation.navigate("SignIn");
      } else {
        const now = new Date();
        const accessTokenExpiry = new Date(now.getTime() + 24 * 60 * 1000); // 24 minutes
        const refreshTokenExpiry = new Date(
          now.getTime() + 80 * 24 * 60 * 60 * 1000
        );
        await AsyncStorage.setItem("authToken", output.data.access_token);
        await AsyncStorage.setItem(
          "authTokenExpiry",
          accessTokenExpiry.toISOString()
        );
        await AsyncStorage.setItem("refreshToken", output.data.refresh_token);
        await AsyncStorage.setItem(
          "refreshTokenExpiry",
          refreshTokenExpiry.toISOString()
        );
      }
    };

    const checkAuthStatus = async () => {
      try {
        const authToken = await AsyncStorage.getItem("refreshTokenExpiry");
        const now = new Date();
        const exp = new Date(authToken);
        if (now.getTime() < exp.getTime()) {
          updateToken();
          navigation.navigate("ExploreTab");
        } else {
          navigation.navigate("ConnectWithGoogle");
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      }
    };
    checkAuthStatus();
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
      await AsyncStorage.setItem(
        "refreshTokenExpiry",
        refreshTokenExpiry.toISOString()
      );
      const auth = await AsyncStorage.getItem("authToken");
      console.log("🏆😣Auth token", auth);

      navigation.navigate("ExploreTab");
      //navigation.navigate("MainTabs");
    }
  };

  const handleOktoPress = () => {};

  const activities = [
    [
      { name: "teps  ", color: "text-[#B4C05E]" },
      { name: "Sports  ", color: "text-[#000000]" },
      { name: "Walking  ", color: "text-[#B4C05E]" },
      { name: "Running  ", color: "text-[#B4C05E]" },
    ],
    [
      { name: "ming ", color: "text-[#B4C05E]" },
      { name: "Travel & Outdoors  ", color: "text-[#000000]" },
      { name: "Hiking  ", color: "text-[#B4C05E]" },
    ],
    [
      { name: "etch  ", color: "text-[#B4C05E]" },
      { name: "Workouts  ", color: "text-[#000000]" },
      { name: "Calories  ", color: "text-[#B4C05E]" },
      { name: "Burned  ", color: "text-[#B4C05E]" },
    ],
    [
      { name: "iwim  ", color: "text-[#B4C05E]" },
      { name: "Adventures  ", color: "text-[#000000]" },
      { name: "Trail Run  ", color: "text-[#B4C05E]" },
      { name: "Exploration  ", color: "text-[#B4C05E]" },
    ],
    [
      { name: "ram   ", color: "text-[#B4C05E]" },
      { name: "Social  ", color: "text-[#000000]" },
      { name: "Twitter Likes  ", color: "text-[#B4C05E]" },
      { name: "Reach  ", color: "text-[#B4C05E]" },
    ],
    [
      { name: "ends ", color: "text-[#B4C05E]" },
      { name: "Place real challenges  ", color: "text-[#000000]" },
      { name: "Money  ", color: "text-[#B4C05E]" },
      { name: "Exploration  ", color: "text-[#B4C05E]" },
    ],
    [
      { name: "HIB  ", color: "text-[#B4C05E]" },
      { name: "Make real wagers!  ", color: "text-[#000000]" },
      { name: "SOL  ", color: "text-[#B4C05E]" },
      { name: "USDT  ", color: "text-[#B4C05E]" },
    ],
  ];

  return (
    <View className="flex-1 items-center justify-center bg-[#E1F076]">
      <View className="w-full h-[60%] -z-1 flex items-center justify-end ">
        {activities.map((activity, index) => (
          <ActivityRow key={index} activities={activity} />
        ))}
      </View>
      <View className="w-full h-[40%] flex items-center justify-center gap-[12px]">
        <TouchableOpacity
          className="w-[85%] h-[56px] rounded-[28px] flex items-center justify-center bg-white"
          onPress={handleGetStarted}
        >
          <View className="flex-row items-center">
            <Image source={Google} className="w-4 h-4 mr-2"></Image>
            <Text className="text-center mr-2 font-semibold text-base text-gray-800">
              Continue with Google
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          className="w-[85%] h-[56px] rounded-[28px] flex items-center justify-center bg-white"
          onPress={handleConnectWallet}
        >
          <View className="flex-row items-center">
            <Image source={wallet} className="w-4 h-4 mr-2"></Image>
            <Text className="text-center mr-2 font-semibold text-base text-gray-800">
              Connect Wallet
            </Text>
          </View>
        </TouchableOpacity>
        {/* <TouchableOpacity
          onPress={handleAlreadyUser}
          className="w-[85%] h-[56px] mb-5 rounded-[28px] flex items-center justify-center bg-[#EAF49F]"
        >
          <Text className="text-center mr-2  font-semibold text-sm text-gray-800">
            Have an account? Log In
          </Text>
        </TouchableOpacity> */}
        <Text className="w-[328px] h-[20px] text-center text-[8px] px-4 text-[#4B5462] ">
          By proceeding, you agree to our{" "}
          <Text className="underline">terms & conditions</Text>, and{" "}
          <Text className="underline">privacy policy</Text>.
        </Text>
      </View>

      <Popup isVisible={popupVisible} onClose={() => setPopupVisible(false)}>
        <View className="flex flex-col justify-center items-center   w-[344px]   rounded-t-[24px]">
          {popupContent}
          {contemail && (
            <View className="gap-3 mb-10 ">
              <TouchableOpacity
                className="flex flex-row justify-center items-center Text-2 w-[328px] h-[48px] border border-gray-300 rounded-[32px]"
                onPress={handleSignIn}
              >
                <Image source={Google} className="w-5 h-5 " />
                <Text className="text-black"> Continue with Google</Text>
              </TouchableOpacity>
              <View className="flex-row items-center justify-center px-4 py-2">
                <Text className="text-[#9C9C9C] text-[10px] font-sans mr-2">
                  Secure sign-up facilitated by our trusted partner
                </Text>
                <View className="flex-row items-center">
                  <Image source={okto} className="w-4 h-4 mr-1" />
                  <TouchableOpacity onPress={handleOktoPress}>
                    <Text className="text-[#9C9C9C] text-[10px] font-sans underline">
                      Okto
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </Popup>

      <Popup
        isVisible={walletPopupVisible}
        onClose={() => setWallletPopupVisible(false)}
      >
        <View className="flex flex-col justify-center items-center   w-[344px]   rounded-t-[24px]">
          <View className="flex h-[200px] items-center pt-4">
            <Text className="font-bold text-center">
              Login with Your Wallet{" "}
            </Text>
            <View className="mt-4">
              <View className="flex flex-row px-4 py-2 justify-between items-center w-full">
                <Image source={eye} className="w-4 h-4" />
                <Text className="font-sans text-[#545454] text-[12px]">
                  View only permissions. We will never do anything without your
                  approval.
                </Text>
              </View>
              <View className="flex flex-row px-4 py-2 justify-start items-center w-full">
                <Image source={lock} className="w-4 h-4 mr-6" />
                <Text className="font-sans text-[#545454] text-[12px]">
                  Audited Smart Contracts
                </Text>
              </View>
              <View className="flex flex-row px-4 py-2 justify-start items-center w-full">
                <Image source={heart} className="w-4 h-4 mr-6" />
                <Text className="font-sans text-[#545454] text-[12px]">
                  Trusted by 2,118 Customers
                </Text>
              </View>
            </View>
          </View>
          
        </View>
      </Popup>

      {/* <View className="flex-1">
        {isLoading ? (
          <View>
            <Text>Trying to login...</Text>
          </View
        ) : (
          <GoogleSigninButton onPress={handleSignIn}  />
        )}
      </View> */}
    </View>
  );
}
