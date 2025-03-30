import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  RefreshControl,
  BackHandler,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView
} from "react-native";
import ChallengeCard from "../components/ChallengeCard";
import credit from "../assets/images/credit.png";
import styles from "../styles/styles";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getUserWalletAPI } from "../utils/Apicalls";
import useUserDetails from "../hooks/useUserDetails";
import useVoteChallenges from "../hooks/useVoteChallenges";

const GameVoteDetailsScreen = () => {
  const navigation = useNavigation();
  const { challenges, error, fetchMoreChallenges, hasMore, loading } =
    useVoteChallenges();
  const [refreshing, setRefreshing] = useState(false);
  const { userDetails, fetchUserDetails } = useUserDetails();

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true;

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getUserWalletAPI();
    // Optionally reset the challenges list and offset if needed
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserDetails();
      return () => {};
    }, [])
  );

  const sortedChallenges = [...challenges].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    if (
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20 &&
      hasMore &&
      !loading
    ) {
      fetchMoreChallenges();
    }
  };

  return (
    <>
     <SafeAreaView>


      <View className="flex-row justify-between items-center mt-4 mx-6">
        <Text className={`${styles.challengeTitle}`}>CATOFF</Text>
        <View className="flex-row items-center">
          {/* <View className="p-2 rounded-md border-[#F7F7F7]">
            <View className="flex-row items-center">
              <Text className={`mr-2 ${styles.subtext}`}>
                {userDetails?.User.Credits}
              </Text>
              <Image source={credit} />
            </View>
          </View> */}
        </View>
      </View>

      <ScrollView
        className="flex flex-col w-screen"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View>
          {sortedChallenges.map((challenge, index) => (
            <ChallengeCard
              key={`${challenge.ChallengeID}-${index}`}
              challenge={challenge}
              navigation={navigation}
            />
          ))}
        </View>
        {loading && (
          <View style={style.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={style.loadingText}>Loading more challenges...</Text>
          </View>
        )}
      </ScrollView>
     </SafeAreaView>

    </>
  );
};

export default GameVoteDetailsScreen;

const style = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#000",
  },
});
