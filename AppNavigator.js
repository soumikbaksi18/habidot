// AppNavigator.js
import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SignIn from "./src/screens/Signin";
import CreateChallenge from "./src/screens/CreateChallenge";
import Explore from "./src/screens/Explore";
import ChallengeDetail from "./src/screens/ChallengeDetail";
import MyChallenge from "./src/screens/MyChallenge";
import ChallengeList from "./src/screens/ChallengeList";
import UserDashboard from "./src/screens/UserDashboard";
import EditUserProfile from "./src/screens/EditUserProfile";
import Leaderboard from "./src/screens/LeaderBoard";
import { NativeWindStyleSheet } from "nativewind";
import { refreshServer } from "./src/utils/Apicalls";
import CustomDrawerContent from "./src/components/CustomDrawerContent";
import useUserDetails from "./src/hooks/useUserDetails";
import GameVoteDetailsScreen from "./src/screens/GameVoteDetailsScreen";
import FeedPublic from "./src/components/FeedPublic";
import NFTPreviw from "./src/components/FormChallenge/NFTPreviw";
import Notifications from "./src/screens/Notifications";
import FullScreenAnimated from "./src/components/FullScreenAnimated";
import * as Linking from "expo-linking";

import CatoffTransaction from "./src/screens/CatoffTransaction";

NativeWindStyleSheet.setOutput({
  default: "native",
});

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

function ExplorePageDrawer() {
  const { userDetails } = useUserDetails();
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerPosition: "left",
        headerShown: false,
        drawerStyle: { left: 0, width: "85%" },
      }}
      drawerContent={() => <CustomDrawerContent userDetails={userDetails} />}
    >
      <Drawer.Screen
        name="ExploreTab"
        component={Explore}
        options={{ headerShown: false, gestureEnabled: false }} // Disable gesture to go back
      />
    </Drawer.Navigator>
  );
}

function MainTabs({ navigator }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Explore") {
            iconName = focused ? "home" : "home";
          } else if (route.name === "Create Challenge") {
            iconName = focused ? "create" : "create";
          } else if (route.name === "vote") {
            iconName = focused ? "thumbs-up" : "thumbs-up-outline";
          } else if (route.name === "My Profile") {
            iconName = focused ? "person-circle" : "person-circle";
          } else if (route.name === "My Challenge") {
            iconName = focused ? "basketball" : "basketball";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#FEC93D",
        tabBarInactiveTintColor: "gray",
        tabBarLabelStyle: {
          color: "black",
        },
        tabBarStyle: {
          paddingBottom: 10,
          paddingTop: 10,
          height: 70,
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen
        name="Explore"
        options={{ unmountOnBlur: true, gestureEnabled: false }}
        component={ExplorePageDrawer}
      />
      <Tab.Screen
        name="vote"
        options={{ unmountOnBlur: true, gestureEnabled: false }}
        component={GameVoteDetailsScreen}
      />
      {/* <Tab.Screen name="Create Challenge" component={CreateChallenge} />
      <Tab.Screen name="My Challenge" component={MyChallenge} /> */}
      <Tab.Screen
        name="My Profile"
        component={UserDashboard}
        options={{ unmountOnBlur: true }}
      />
    </Tab.Navigator>
  );
}

function MainStack() {
  const authTok = async () => {
    const output = await refreshServer();

    if (!output.success) {
      // navigation.navigate("SignIn");
      // console.log("here we are")
    } else {
      const now = new Date();
      const accessTokenExpiry = new Date(now.getTime() + 24 * 60 * 1000); // 24 minutes
      const refreshTokenExpiry = new Date(
        now.getTime() + 80 * 24 * 60 * 60 * 1000
      ); // 80 days
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

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     console.log("here");
  //     authTok();
  //   }, 120000);
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChallengeDetail"
        component={ChallengeDetail}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChallengeList"
        component={ChallengeList}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Leaderboard"
        component={Leaderboard}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  // const linking = {
    const [initialRoute, setInitialRoute] = useState(null);
    const [loading, setLoading] = useState(true); // Track loading state.
  
    useEffect(() => {
      const checkAuthStatus = async () => {
        try {
          const authToken = await AsyncStorage.getItem("authToken");
          setInitialRoute(authToken ? "ExploreStack" : "SignIn");
        } catch (error) {
          console.error("Error checking auth token:", error);
        } finally {
          setLoading(false);
        }
      };
  
      checkAuthStatus();
    }, []);
  
    if (loading) {
      return null; // You can render a splash screen or loader here.
    }
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen
          name="SignIn"
          component={SignIn}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ unmountOnBlur: true, headerShown: false }}
        />
        <Stack.Screen
          name="CreateChallenge"
          component={CreateChallenge}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Leaderboard"
          component={Leaderboard}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ImagePreview"
          component={NFTPreviw}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Create Challenge"
          component={CreateChallenge}
          options={{ unmountOnBlur: true, headerShown: false }}
        />
        <Stack.Screen
          name="feedPublic"
          component={FeedPublic}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="fullscreen"
          component={FullScreenAnimated}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ExploreStack"
          component={MainTabs}
          options={{
            unmountOnBlur: true,
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="ChallengeDetail"
          component={ChallengeDetail}
          options={{ unmountOnBlur: true, headerShown: false }}
        />
        <Stack.Screen
          name="MyChallenge"
          component={MyChallenge}
          options={{ unmountOnBlur: true, headerShown: false }}
        />
        <Stack.Screen
          name="ChallengeList"
          component={ChallengeList}
          options={{ unmountOnBlur: true, headerShown: false }}
        />
        <Stack.Screen
          name="EditUserProfile"
          component={EditUserProfile}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Transaction"
          component={CatoffTransaction}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Notifications"
          component={Notifications}
          options={{ unmountOnBlur: true, headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
