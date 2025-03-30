import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  SafeAreaView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import ChallengeCard from "../components/ChallengeCard";
import useUserChallenges from "../hooks/useUserChallenge";
import styles from "../styles/styles";
import back from "../assets/images/back.png";

const MyChallenge = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const initialCategory = route.params?.activeCategory || "all";
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const {
    challenges,
    details,
    error,
    isLoading,
    refetchChallenges,
    createdChallenges,
  } = useUserChallenges();
  const [refreshing, setRefreshing] = useState(false);

  const filterChallenges = (mainCategory, subCategory) => {
    let value = [];

    if (mainCategory === "joined") {
      value = challenges;
    } else if (mainCategory === "created") {
      value = createdChallenges;
    } else {
      const combined = [...challenges, ...createdChallenges];
      const uniqueChallengesMap = new Map();

      combined.forEach((challenge) => {
        uniqueChallengesMap.set(challenge.ChallengeID, challenge);
      });

      value = Array.from(uniqueChallengesMap.values());
    }

    if (subCategory === "active") {
      return value.filter(
        (challenge) =>
          challenge.State === "UPCOMING" || challenge.State === "ONGOING"
      );
    } else if (subCategory === "past") {
      return value.filter(
        (challenge) =>
          challenge.State === "COMPLETED" || challenge.State === "CANCELLED"
      );
    }

    return value;
  };

  useEffect(() => {
    if (route.params?.activeCategory) {
      setActiveCategory(route.params.activeCategory);
    }
  }, [route.params?.activeCategory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchChallenges();
    setRefreshing(false);
  }, [refetchChallenges]);

  const activeChallenges = filterChallenges(activeCategory, "active");
  const pastChallenges = filterChallenges(activeCategory, "past");

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <>
          <View className="flex-row justify-between items-center mx-6">
            {/* <Text className={`${styles.challengeTitle}`}>My Challenges</Text> */}
            <TouchableOpacity>
              <View className="p-2 rounded-full border-[#F7F7F7]">
                {/* Placeholder for future share icon */}
              </View>
            </TouchableOpacity>
          </View>
          <ScrollView
            className="flex flex-col w-screen"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View className="flex flex-row mt-4">
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image source={back} className="h-[26px] w-[26px] mx-4 mr-24" />
              </TouchableOpacity>
              <Text className={`${styles.challengeTitle}`}>My Challenges</Text>
              <TouchableOpacity>
                {/* Placeholder for future button */}
              </TouchableOpacity>
            </View>
            <View className="mx-4">
              <View
                className="bg-white py-2 rounded-lg"
                style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                  marginTop: 10,
                  marginBottom: 10,
                }}
              >
                <TouchableOpacity onPress={() => setActiveCategory("all")}>
                  <Text
                    className="px-4 py-2 rounded-md"
                    style={{
                      backgroundColor:
                        activeCategory === "all" ? "#E0E0E0" : "white",
                    }}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveCategory("joined")}>
                  <Text
                    className="px-4 py-2 rounded-md"
                    style={{
                      backgroundColor:
                        activeCategory === "joined" ? "#E0E0E0" : "white",
                    }}
                  >
                    Joined by Me
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveCategory("created")}>
                  <Text
                    className="px-4 py-2 rounded-md"
                    style={{
                      backgroundColor:
                        activeCategory === "created" ? "#E0E0E0" : "white",
                    }}
                  >
                    Created by Me
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View>
              <Text className="mx-4 mt-4">Live Now</Text>
              {activeChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.ChallengeID}
                  challenge={challenge}
                  navigation={navigation}
                />
              ))}
            </View>
            <View>
              <Text className="mx-4 mt-6">Past Challenges</Text>
              {pastChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.ChallengeID}
                  challenge={challenge}
                  navigation={navigation}
                />
              ))}
            </View>
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};

export default MyChallenge;
