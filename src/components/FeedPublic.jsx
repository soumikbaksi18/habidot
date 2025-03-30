import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Image,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import styles from "../styles/styles";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import {
  castVote,
  getVotes,
  submitClaim,
  uploadFileApi,
} from "../utils/Apicalls";
import upvote from "../assets/images/upvote.png";
import Ionicons from "react-native-vector-icons/Ionicons";
import { styled } from "nativewind";
import { useNavigation, useRoute } from "@react-navigation/native";
import moment from "moment";
import useValidateChallenge from "../hooks/useValidateChallenge";
import useUserDetails from "../hooks/useUserDetails";
import useUserProgress from "../hooks/useProgressData";

const FeedPublic = () => {
  // const { leaderboard }

  const route = useRoute();
  const { challenge } = route.params;
  console.log(challenge);
  const { userDetails, fetchUserDetails } = useUserDetails();
  const [isavalidator, setIsavalidator] = useState(false);

  const [type, setType] = useState(
    challenge?.GameType ?? challenge.Game?.GameType
  );
  useEffect(() => {
    if (userDetails && challenge) {
      setIsavalidator(
        userDetails.User.UserID === challenge.ChallengeCreator.UserID
      );
    }
  }, [userDetails, challenge]);
  const { leaderboard, isLoading } = useUserProgress(challenge.ChallengeID);
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
  const [invalidSubmissions, setInvalidSubmissions] = useState([]);

  const [selectedWinner, setSelectedWinner] = useState(null);
  const { data, error } = useValidateChallenge(
    challenge.id,
    invalidSubmissions
  );
  const [descriptionLines, setDescriptionLines] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const descriptionRef = useRef(null);
  const [votes, setVotes] = useState({});
  const [currentVote, setCurrentVote] = useState({});
  const navigation = useNavigation();

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };
  const fetchVotes = async () => {
    try {
      const response = await getVotes(challenge.ChallengeID);
      console.log("✨✨✨Request to getVotes", {
        ChallengeID: challenge.ChallengeID,
      });
      console.log("💀💀💀💀Response from getVotes", response);

      if (response.success) {
        const votesData = response.data.players.reduce((acc, player) => {
          if (player.Submission) {
            acc[player.PlayerID] = player.Submission.NumberOfVotes;
            console.log("acc[player.PlayerID]", acc[player.PlayerID]);
          } else {
            acc[player.PlayerID] = 0;
          }
          console.log("ACC", acc);
          return acc;
        }, {});

        setVotes(votesData);
        console.log("Vote Data", votesData);
      } else {
        console.error("Failed to fetch votes:", response.error);
      }
    } catch (error) {
      console.error("Error fetching votes:", error);
    }
  };

  useEffect(() => {
    fetchVotes();
  }, [challenge]);
  const handleVote = async (submissionId) => {
    console.log("Submission ID for ", submissionId);
    console.log("Challenge ID for ", challenge.ChallengeID);

    try {
      const currentVoteStatus = currentVote[submissionId];
      const newVote = currentVoteStatus === "upvote" ? 0 : "upvote";
      const voteValue = newVote === "upvote" ? 1 : 0;

      const requestBody = {
        ChallengeID: challenge.ChallengeID,
        SubmissionID: submissionId,
      };

      console.log("✅✅✅Request to castVote", requestBody);

      const response = await castVote(requestBody);

      console.log("🔥🔥🔥Response from castVote", response);

      if (response.success) {
        setVotes((prev) => ({
          ...prev,
          [submissionId]: voteValue,
        }));
        setCurrentVote((prev) => ({
          ...prev,
          [submissionId]: newVote,
        }));
        fetchVotes(); // Refetch votes after a successful vote
      } else {
        alert("Error : User Already Voted", error);
        console.error("RESPONSE", response);
      }
    } catch (error) {
      console.error("Failed to cast vote:", error);
      alert("Error: User Already Voted", error);
    }
  };

  const getVoteCount = (submissionId) => {
    return votes[submissionId] || 0;
  };
  const handleSelectWinner = (winnerId) => {
    setSelectedWinner(winnerId);
    handleValidateChallenge();
  };

  const handleValidateChallenge = async () => {
    if (selectedWinner === null) {
      Alert.alert(
        "No winner selected",
        "Please select a winner before validating."
      );
      return;
    }
    const invalidSubmissions = leaderboard
      .filter((item) => item.Player.id !== selectedWinner)
      .map((item) => item.Player.id);
    setInvalidSubmissions(invalidSubmissions);
    useValidateChallenge();
  };

  useEffect(() => {
    if (!isLoading && data) {
      Alert.alert("Success", "Challenge submissions validated successfully.");
    } else if (!isLoading && error) {
      Alert.alert("Error", "Failed to validate challenge submissions.");
      console.log("Error message:", error);
    }
  }, [isLoading, data, error]);
  const filteredLeaderboard = leaderboard.filter(
    (item) => item.Player?.Submission?.MediaUrls?.length > 0
  );

  const StyledSafeAreaView = styled(SafeAreaView);
  const StyledScrollView = styled(ScrollView);
  const StyledView = styled(View);
  const StyledTouchableOpacity = styled(TouchableOpacity);
  const StyledText = styled(Text);
  //   console.log(leaderboard[0].Player.Submission);

  const getParticipationTypeString = (participationType) => {
    switch (participationType) {
      case 0:
        return "Multiplayer";
      case 1:
        return "Versus a Player";
      case 2:
        return "Dare a Player";
      default:
        return "";
    }
  };

  const getCategoryString = (gameType) => {
    switch (gameType) {
      case 0:
      case 1:
        return "Fitness";
      case 2:
        return "Proof";
      case 3:
        return "Validator";
      default:
        return "";
    }
  };

  if (isLoading) {
    return (
      <>
        {isLoading && (
          <View style={style.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
      </>
    );
  }
  if (!filteredLeaderboard || filteredLeaderboard.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg font-bold text-gray-700">
          No Submission Yet or Game Yet To Start
        </Text>
      </View>
    );
  }

  // console.log(item.Player)
  return (
    <StyledSafeAreaView className="flex-1">
      {isavalidator && (
        <StyledView className="px-4">
          <StyledTouchableOpacity
            className="py-5"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </StyledTouchableOpacity>
          <StyledText className="text-gray-500">
            Ends on {moment(parseInt(challenge.EndDate)).format("DD MMM YY")}
          </StyledText>
          <StyledText className="text-2xl font-ttRunsTrialMedium  font-bold">
            {challenge.ChallengeName}
          </StyledText>
          <StyledView className="flex-row mt-2">
            <Text className="mr-3 text-xs bg-[#E5F0FF] px-2 py-1 uppercase">
              {getParticipationTypeString(challenge.Game?.ParticipationType) ||
                challenge?.ParticipationType}
            </Text>
            <Text className="mr-3 text-xs bg-[#FEF6E7] px-2 py-1 uppercase">
              {getCategoryString(challenge.Game?.GameType) ||
                challenge?.GameType}
            </Text>
          </StyledView>
        </StyledView>
      )}

      <StyledScrollView className="flex-1 mt-4 ">
        <View className=" ml-4">
          <Text className={`text-base font-medium mt-2 ${styles.subheading}`}>
            ABOUT THE CHALLENGE
          </Text>
          <Text
            ref={descriptionRef}
            numberOfLines={showFullDescription ? undefined : 3}
            ellipsizeMode="tail"
            className={`mt-2 text-base ${styles.paragraph}`}
          >
            {challenge.ChallengeDescription}
          </Text>
          {descriptionLines > 3 && (
            <TouchableOpacity onPress={toggleDescription}>
              <Text className="mt-1 text-base font-semibold underline underline-offset-8">
                {showFullDescription ? "Show Less" : "Read More"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View className="mt-3 ml-4">
          <Text className={`text-base font-medium ${styles.subheading}`}>
            USER SUBMISSIONS
          </Text>
        </View>
        {filteredLeaderboard.map((item, index) => (
          <StyledView key={index} className="my-4 px-4">
            <StyledView className="flex-row items-center justify-between mb-5">
              <StyledView className="flex-row items-center">
                <Image
                  source={{ uri: item.profilePicture }}
                  className="w-10 h-10 rounded-full mr-2"
                />
                <StyledView className="flex-col">
                  <StyledText className="font-bold">{item.username}</StyledText>
                  <StyledText className="text-gray-500">
                    <Text>Posted </Text>
                    <Text className="text-black font-bold">
                      {moment(
                        item.Player.updatedAt || item.Player.createdAt
                      ).fromNow()}
                    </Text>
                  </StyledText>
                </StyledView>
              </StyledView>
            </StyledView>

            <StyledView className="bg-gray-200 h-56 w-full mb-6 flex items-center justify-center">
              {item.Player?.Submission?.MediaUrls?.length > 0 ? (
                <Image
                  source={{
                    uri: `https://gateway.catoff.xyz/ipfs/${item.Player.Submission.MediaUrls[0]}`,
                  }}
                  className="h-full rounded-md w-full object-cover"
                />
              ) : (
                <StyledText className="text-gray-500">
                  Media not submitted yet
                </StyledText>
              )}
            </StyledView>

            {(type === "Voting" || type === 4) && item.Player.Submission && (
              <View className="flex-row items-center justify-between">
                <TouchableOpacity
                  className={`px-3 py-2 rounded-full flex-row items-center gap-1 border ${
                    currentVote[item.Player.Submission.ID] === "upvote"
                      ? "bg-blue-600 shadow-md border-transparent"
                      : "bg-white shadow-sm border-gray-300"
                  }`}
                  onPress={() => handleVote(item.Player.Submission.ID)}
                >
                  <View className="flex-row items-center">
                    <Image
                      source={upvote}
                      style={{
                        width: 22,
                        height: 22,
                        tintColor:
                          currentVote[item.Player.Submission.ID] === "upvote"
                            ? "white"
                            : "black",
                        marginRight: 3,
                      }}
                    />
                  </View>
                  <Text className="text-lg font-bold">
                    {getVoteCount(item.Player.PlayerID)}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {isavalidator && (type === "Validator" || type === 3) && (
              <StyledTouchableOpacity
                className="p-2 my-2 border border-neutral-200 rounded-full"
                onPress={() => handleSelectWinner(item.Player.id)}
              >
                <StyledText
                  className={`text-center p-1 ${
                    selectedWinner === item.Player.id
                      ? "text-gray-400"
                      : "text-black"
                  }`}
                >
                  {selectedWinner === item.Player.id
                    ? "Winner Selected"
                    : "Select Winner"}
                </StyledText>
              </StyledTouchableOpacity>
            )}
          </StyledView>
        ))}
      </StyledScrollView>
    </StyledSafeAreaView>
  );
};

export default FeedPublic;
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
