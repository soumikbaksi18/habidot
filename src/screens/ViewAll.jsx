import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl,TouchableOpacity } from "react-native";
import ChallengeCard from "../components/ChallengeCard";
import useChallenges from "../hooks/useChallenges";
import styles from "../styles/styles";

const ViewAll = ({ navigation }) => {
  const [moreChallengesButton, setMoreChallengesButton] = useState(true);
  const [page, setPage] = useState(0);

  const { challenges, error } = useChallenges({
    page: page,
    setMoreChallengesButton: setMoreChallengesButton,
  });
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshing(false);
  }, []);
  return (
    <View className="flex-1">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View
          className={`${styles.marginX} flex flex-row mt-8 justify-between`}
        >
          <Text className={`${styles.subheading}`}>All Challenges</Text>
        </View>
        <View>
          {challenges.length > 0 ? (
            <>
              {challenges.map((challenge) => (
                <ChallengeCard
                  challenge={challenge}
                  key={challenge?.ChallengeID}
                  navigation={navigation}
                />
              ))}
              {moreChallengesButton ? (
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
              ) : null}
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
};

export default ViewAll;
