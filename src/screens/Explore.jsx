import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  BackHandler,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ChallengeCard from "../components/ChallengeCard";
import challenge1 from "../assets/images/challenge1.png";
import challenge2 from "../assets/images/challenge2.png";
import challenge3 from "../assets/images/challenge3.png";
import create from "../assets/images/create.png";
import numpad from "../assets/images/numpad.png";
import live from "../assets/images/live.png";
import credit from "../assets/images/credit.png";
import hamburger from "../assets/images/hamburger.png";
import useChallenges from "../hooks/useChallenges";
import styles from "../styles/styles";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getUserWalletAPI } from "../utils/Apicalls";
import { getShareableLinkFromSlug, getChallengeById } from "../utils/Apicalls";
import useUserDetails from "../hooks/useUserDetails";
import icon from "../assets/images/banner-1.webp";
import CreateButton from "../components/CreateButton";

const Explore = () => {
  const [moreChallengesButton, setMoreChallengesButton] = useState(true);
  const [page, setPage] = useState(0);

  const { challenges, error, refetchChallenges } = useChallenges({
    page: page,
    setMoreChallengesButton: setMoreChallengesButton,
    setPage: setPage,
  });
  const [invitationCode, setInvitationCode] = useState("");
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const { userDetails, loading, fetchUserDetails } = useUserDetails();

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true;
      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [])
  );

  useEffect(() => {
    const logAsyncStorageData = async () => {
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        const allData = await AsyncStorage.multiGet(allKeys);
        allData.forEach((entry) => {
          console.log(`🗝️ Key: ${entry[0]} | 📦 Value: ${entry[1]}`);
        });
      } catch (error) {
        console.error("❌ Error fetching AsyncStorage data", error);
      }
    };

    logAsyncStorageData();
  }, []);

  const handleInputChange = async (value) => {
    setInvitationCode(value);
    if (value?.length === 6) {
      try {
        const response = await getShareableLinkFromSlug(value);
        if (response?.data?.Link) {
          const challengeID = response.data.Link.split("/").pop();
          const challengeResponse = await getChallengeById(challengeID);
          if (challengeResponse?.data) {
            navigation.navigate("ChallengeDetail", {
              challenge: challengeResponse.data,
            });
            setInvitationCode("");
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchChallenges();
    await getUserWalletAPI();
    setRefreshing(false);
  }, [refetchChallenges]);

  useFocusEffect(
    useCallback(() => {
      fetchUserDetails();
      return () => {};
    }, [])
  );

  const sortedChallenges = challenges.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <CreateButton />
      <View
        className="flex-row justify-between items-center mx-6"
        style={{ marginTop: 10, paddingTop: 10 }}
      >
        <Text className={`${styles.challengeTitle}`}>CATOFF</Text>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <View className="p-2 rounded-full border-[#F7F7F7]">
              <Image source={hamburger} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        className="flex flex-col w-screen"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="h-40 mx-4 mt-4 mb-4 rounded-lg flex relative">
          <Image
            source={icon}
            style={{
              height: "100%",
              width: "100%",
              borderRadius: 10,
            }}
          />
        </View>

        <View className={`mx-4 flex flex-row bg-[#e9e9e9] rounded-md`}>
          <Image source={numpad} className={`my-auto ml-4`} />
          <TextInput
            placeholder="Enter Invitation Link"
            className={`py-4 px-2`}
            value={invitationCode}
            onChangeText={(e) => handleInputChange(e.target.value)}
          />
        </View>

        <View className={`flex flex-row mx-4 my-4 justify-between`}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ChallengeList", { participationType: 0 })
            }
            style={{ flex: 1, marginRight: 5 }}
          >
            <View>
              <View
                className={`bg-[#e9e9e9] px-4 py-4 flex-col rounded-xl items-center mb-1`}
              >
                <Image className={`w-20`} source={challenge1} />
              </View>
              <Text
                className={`text-stone-900 mx-auto text-[12px] mt-2 font-interMedium`}
              >
                Dare A Friend
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ChallengeList", { participationType: 1 })
            }
            style={{ flex: 1, marginHorizontal: 5 }}
          >
            <View>
              <View
                className={`bg-[#e9e9e9] px-4 py-4 flex-col rounded-xl items-center mb-1`}
              >
                <Image className={`w-20`} source={challenge2} />
              </View>
              <Text
                className={`text-stone-900 text-[12px] mt-2 font-interMedium mx-auto`}
              >
                Versus Friend
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ChallengeList", { participationType: 2 })
            }
            style={{ flex: 1, marginLeft: 5 }}
          >
            <View>
              <View
                className={`bg-[#e9e9e9] px-4 py-4 flex-col rounded-xl items-center mb-1`}
              >
                <Image className={`w-20`} source={challenge3} />
              </View>
              <Text
                className={`text-stone-900 mx-auto text-[12px] mt-2 font-interMedium`}
              >
                Multiplayer
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className={`mx-4`}>
          <TouchableOpacity
            onPress={() => navigation.navigate("ChallengeList")}
          >
            <View className={`flex flex-row justify-between`}>
              <View className={`flex-1 mr-2`}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Sidebet")}
                >
                  <View
                    className={`bg-[#e9e9e9] py-5 px-4 flex flex-row rounded-xl items-center mb-1`}
                  >
                    <Text
                      className={`text-stone-900 text-start ${styles.subtext} leading-[21px]`}
                    >
                      My Sidebets
                    </Text>
                    <Image className={`mr-4`} source={create} />
                  </View>
                </TouchableOpacity>
              </View>
              <View className={`flex-1 ml-2`}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("MyChallenge")}
                >
                  <View
                    className={`bg-[#e9e9e9] py-5 px-4 flex flex-row rounded-xl items-center mb-1`}
                  >
                    <Text
                      className={`text-stone-900 text-start ${styles.subtext}  leading-[21px]`}
                    >
                      My Live {"\n"}Challenges
                    </Text>
                    <Image className={`mr-4`} source={live} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View
          className={`${styles.marginX} flex flex-row mt-8 justify-between`}
        >
          <Text className={`${styles.subheading}`}>TRENDING NOW</Text>
        </View>
        <View>
          {sortedChallenges.length > 0 ? (
            <>
              {sortedChallenges.map((challenge) => (
                <ChallengeCard
                  challenge={challenge}
                  key={challenge?.ChallengeID}
                  navigation={navigation}
                />
              ))}
              {moreChallengesButton ? (
                <TouchableOpacity
                  className="border bg-blue-400 rounded-xl mx-4 p-4 my-4 flex justify-center items-center"
                  onPress={() => {
                    setPage(page + 1);
                  }}
                >
                  <Text className="font-semibold text-white">
                    Show More Challenges 🔥
                  </Text>
                </TouchableOpacity>
              ) : null}
            </>
          ) : (
            <View className="flex justify-center items-center my-4">
              <Text className="text-center font-semibold text-gray-500 text-lg">
                No More Challenges Present!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Explore;
