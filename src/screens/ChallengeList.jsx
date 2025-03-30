import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import ChallengeCard from "../components/ChallengeCard";
import useChallenges from "../hooks/useChallenges";
import styles from "../styles/styles";

const ChallengeList = () => {
  const [moreChallengesButton, setMoreChallengesButton] = useState(true);
  const [page, setPage] = useState(0);

  const { challenges, error } = useChallenges({
    page: page,
    setMoreChallengesButton: setMoreChallengesButton,
  });
  const navigation = useNavigation();
  const route = useRoute();
  const { participationType, status } = route.params;

  // Filter challenges based on participationType
  const filteredChallenges = challenges.filter((challenge) => {
    return challenge.Game.ParticipationType === participationType;
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView className="flex flex-col w-screen">
        <View className="mx-4">
          <Text className={`mt-4 ${styles.heading}`}>
            {participationType === 0
              ? "Dare A Friend"
              : participationType === 1
              ? "Versus A Friend"
              : "Multiplayer"}
          </Text>
        </View>
        <View>
          {filteredChallenges.length > 0 ? (
            <>
              {filteredChallenges.map((challenge) => (
                <ChallengeCard
                  challenge={challenge}
                  key={challenge?.ChallengeID}
                  navigation={navigation}
                />
              ))}
              {moreChallengesButton && (
                <TouchableOpacity
                  className="border bg-blue-400 rounded-xl mx-4 p-4 mb-4 flex justify-center items-center"
                  onPress={() => {
                    setPage(page + 1);
                  }}
                >
                  <Text className="font-semibold text-white">
                    Show More Challenges 🔥
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View className="flex justify-center items-center my-4">
              <Text className="text-center font-semibold text-gray-500 text-lg">
                No Challenges Available
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChallengeList;
