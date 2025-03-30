import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Linking,
} from "react-native";
import styles from "../styles/styles";
import useUserDetails from "../hooks/useUserDetails";
import avatar from "../assets/images/avatar.png";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import x from "../assets/images/X.png";
import useNotificationDetails from "../hooks/useNotificationDetails";

const CustomDrawerContent = ({ notification }) => {
  const { userDetails, loading, error, fetchUserDetails } = useUserDetails();
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      fetchUserDetails();
      return () => {};
    }, [])
  );
  const {
    notifications,
    error: notificationError,
    unreadNotificationIds,
  } = useNotificationDetails({
    limit: 20,
    page: 1,
  });

  const profileImage = userDetails?.User?.ProfilePicture
    ? { uri: userDetails.User.ProfilePicture }
    : avatar;

  console.log("PROFILE IMAGE", profileImage);

  const shortenAddress = (address) => {
    if (!address) return "Wallet Address";
    return `${address.substring(0, 8)}............${address.substring(
      address.length - 6
    )}`;
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.navigate("SignIn");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 20 }}>
        <View className="flex-row">
          {/* avatar */}
          <View className="flex justify-center items-center">
            <View className="items-center justify-center bg-[#EDEDED] rounded-full h-14 w-14">
              <Image
                source={profileImage}
                className="rounded-full h-12 w-12 items-center justify-center"
              />
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text className={`text-sm text-[#2B303B] mt-2 ${styles.subtext}`}>
              {userDetails?.User?.UserName || "Username"}
            </Text>
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              className={`text-[#576175] text-xs`}
            >
              {shortenAddress(userDetails?.User?.WalletAddress)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.closeDrawer())}
          >
            <View className="p-2 rounded-full border-[#F7F7F7] mt-2">
              <Image source={x} />
            </View>
          </TouchableOpacity>
        </View>
        <View className="h-0.5 bg-[#EEEEEE] my-6" />
        <TouchableOpacity onPress={() => navigation.navigate("Notifications")}>
          <Text className="font-runs text-[20px] my-2 mb-4">Notifications</Text>
          {unreadNotificationIds.length > 0 && (
            <Text className="absolute top-3 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 mr-5 bg-red-500 rounded-full">
              {unreadNotificationIds.length}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("MyChallenge")}>
          <Text className="font-runs text-[20px] my-2 mb-4">My Challenges</Text>
        </TouchableOpacity>
        <View className="h-0.5 bg-[#EEEEEE] my-2" />
        <TouchableOpacity onPress={() => Linking.openURL("https://catoff.xyz")}>
          <Text className={`text-sm text-[#576175] my-2 ${styles.subtext}`}>
            Help
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Linking.openURL("https://forms.gle/rsy9Aw6LVGNVSGaa8")}
        >
          <Text className={`text-sm text-[#576175] my-2 ${styles.subtext}`}>
            Have a feedback?
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            Linking.openURL("https://www.catoff.xyz/TermsAndServices.html")
          }
        >
          <Text className={`text-sm text-[#576175] my-2 ${styles.subtext}`}>
            Terms & Conditions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            Linking.openURL("https://www.catoff.xyz/PrivacyPolicy.html")
          }
        >
          <Text className={`text-sm text-[#576175] my-2 ${styles.subtext}`}>
            Privacy Policy
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ padding: 20 }}>
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-[#EEEEEE] rounded-[28px] w-full h-[50px] flex items-center justify-center"
        >
          <Text className="font-bold">Logout</Text>
        </TouchableOpacity>
        <Text
          className={`text-xs text-[#576175] my-2 justify-center flex items-center ml-5`}
        >
          Catoff Gaming LLP, ©2024. All rights reserved
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default CustomDrawerContent;
