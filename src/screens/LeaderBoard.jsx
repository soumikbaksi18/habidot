import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Image,
  RefreshControl,
  TouchableOpacity,
  Text,
} from "react-native";
import Feed from "../components/Feed";
import LinearGradient from "react-native-linear-gradient";
import { styled } from "nativewind";
import WinningBoard from "../components/WinningBoard";
import back from "../assets/images/back.png";
import useUserProgress from "../hooks/useProgressData";
import Progress from "../components/Progress";
import useUserDetails from "../hooks/useUserDetails";
const Leaderboard = ({ route, navigation }) => {
  const { challenge } = route.params;
  // console.log("Challenge BODY ✨ ", challenge);
  const { userDetails, fetchUserDetails } = useUserDetails();
  const [isavalidator, setIsavalidator] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    if (userDetails && challenge) {
      setIsavalidator(
        userDetails.User.UserID === challenge.ChallengeCreator.UserID
      );
    }
  }, [userDetails, challenge]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserDetails();
    await fetchDetailsAndChallenges();
    setRefreshing(false);
  }, [fetchUserDetails, fetchDetailsAndChallenges]);
  const calculateTotalParticipants = () => {
    const playersJoined =
      challenge?.Players?.length || challenge?.ParticipantsJoined || 0;

    switch (challenge?.Game?.ParticipationType) {
      case 0:
        return 1;
      case 1:
        return 2;
      case 2:
        if (playersJoined < 50) return 50;
        if (playersJoined >= 50 && playersJoined < 70) return 70;
        if (playersJoined >= 70 && playersJoined < 150) return 150;
        return 300;
      default:
        return challenge?.MaxParticipants;
    }
  };
  const totalParticipants = calculateTotalParticipants();
  const StyledSafeAreaView = styled(SafeAreaView);
  const StyledScrollView = styled(ScrollView);
  const StyledView = styled(View);
  const StyledTouchableOpacity = styled(TouchableOpacity);
  const [tab, setTab] = useState(0);
  const { leaderboard, error, performance, fetchDetailsAndChallenges } =
    useUserProgress(challenge.ChallengeID);
  let leaderboardValue = null;
  if (
    leaderboard &&
    leaderboard.length > 0 &&
    leaderboard[0].value !== undefined
  ) {
    leaderboardValue = leaderboard[0].value;
    // console.log("Leaderboard data --> ", leaderboard);
  } else {
    // console.log("Leaderboard data is unavailable or malformed.");
  }
  // console.log("challenge data --> ", challenge);
  // console.log("Performance data --> ", performance);

  const color = tab !== 1 ? "white" : "#FDFFB1";
  const [file, setFile] = useState(null);
  // console.log("Performance passed here", performance);

  // Function to pick an image from
  //the device's media library
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      // If permission is denied, show an alert
      Alert.alert(
        "Permission Denied",
        `Sorry, we need camera  
               roll permission to upload images.`
      );
    } else {
      // Launch the image library and get
      // the selected image
      const result = await ImagePicker.launchImageLibraryAsync();

      if (!result.cancelled) {
        setFile(result.uri);
        setError(null);
      }
    }
  };
  const totalPrizePool = challenge?.Wager
    ? totalParticipants * (challenge?.Wager || 0)
    : (challenge?.WagerStaked || 0) * totalParticipants;
  return (
    <>
      <StyledSafeAreaView className="h-full w-full">
        <LinearGradient
          colors={[color, "white"]}
          style={{ flex: 1, height: "10%" }}
        >
          {(tab != 2 || !isavalidator) && (
            <StyledView className="absolute z-10 top-[8px]">
              <View className="w-[92%] mx-2 rounded-[8px] flex-row mt-5">
                <View className="w-[5%] h-[24px] flex-col justify-center">
                  <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image source={back} className="h-[20px]" />
                  </TouchableOpacity>
                </View>
                <View className="w-[95%] flex-col items-center justify-center">
                  <Text className="font-runs text-[14px]">
                    {challenge.ChallengeName}
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-[10px]">Created by</Text>
                    <Text className="text-[10px] font-bold ml-1">
                      {challenge?.ChallengeCreator?.UserName}
                    </Text>
                  </View>
                </View>
                <View className="w-[10%] h-[24px]" />
              </View>
              <StyledView className="w-[90%] bg-white mx-2 rounded-[8px] my-2 px-1 flex-row border border-[#EEEEEE] justify-between">
                <StyledTouchableOpacity
                  className={`flex-1 h-[24px] my-1 items-center justify-center ${
                    tab === 0 ? "bg-[#EEEEEE] rounded-[4px]" : ""
                  }`}
                  onPress={() => setTab(0)}
                >
                  <Text>Progress</Text>
                </StyledTouchableOpacity>
                <StyledTouchableOpacity
                  className={`flex-1 h-[24px] my-1 items-center justify-center ${
                    tab === 1 ? "bg-[#EEEEEE] rounded-[4px]" : ""
                  }`}
                  onPress={() => setTab(1)}
                >
                  <Text>Leaderboard</Text>
                </StyledTouchableOpacity>
                {challenge.Game?.GameType != 0 &&
                  challenge?.GameType != "Steps" &&
                  challenge?.Game?.GameType != 1 &&
                  challenge?.GameType != "Calories" && (
                    <StyledTouchableOpacity
                      className={`flex-1 h-[24px] my-1 items-center justify-center ${
                        tab === 2 ? "bg-[#EEEEEE] rounded-[4px]" : ""
                      }`}
                      onPress={() => setTab(2)}
                    >
                      <Text>Feed</Text>
                    </StyledTouchableOpacity>
                  )}
              </StyledView>
            </StyledView>
          )}

          <StyledScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {performance && tab === 0 && (
              <Progress
              totalPrizePool={totalPrizePool}
                setTab={setTab}
                type={challenge?.GameType || challenge?.Game?.GameType}
                id={challenge.ChallengeID}
                image={challenge.ProfilePicture}
                value={performance.Value !== null ? 21 : 20}
                wager={challenge.Wager || challenge.WagerStaked}
                target={challenge.Target || 100}
                totalStaked={challenge.TotalWagerStaked || 0}
                state={challenge.State}
                leaderboard={leaderboard}
                isavalidator={isavalidator}
                fetchUserDetails={fetchUserDetails}
                Currency={challenge?.Currency}
              />
            )}
            {performance && tab === 2 && (
              <Feed
                id={challenge.ChallengeID}
                leaderboard={leaderboard}
                challenge={challenge}
                performance={performance}
                isavalidator={isavalidator}
                type={challenge?.GameType || challenge.Game?.GameType}
              />
            )}
          </StyledScrollView>

          {tab === 1 && (
            <WinningBoard
              game={performance.ParticipationType}
              leaderboard={leaderboard}
            />
          )}
        </LinearGradient>
      </StyledSafeAreaView>
    </>
  );
};

export default Leaderboard;
