import React from "react";
import { Image, View, Text, TouchableOpacity } from "react-native";
import create from "../assets/images/create.png";
import styles from "../styles/styles";
import dumbell from "../assets/images/dumbell 2.png";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { useRoute } from "@react-navigation/native";
import { categories } from "./categories";

const ChallengeCard = ({ challenge, navigation }) => {
  const route = useRoute();
  const paramName = route.name;
  // console.log(paramName)
  const ChallengeName = challenge.ChallengeName
    ? challenge.ChallengeName
    : "Unnamed Challenge";
  const ChallengeDescription = challenge.ChallengeDescription
    ? challenge.ChallengeDescription
    : "No description available";
  const MaxParticipants =
    challenge.MaxParticipants !== undefined ? challenge.MaxParticipants : 0;
  const State = challenge.State ? challenge.State : "Unknown State";
  const Wager =
    challenge.Wager || challenge.WagerStaked
      ? challenge.Wager || challenge.WagerStaked
      : "N/A";
  const Winner = challenge.Winner ? challenge.Winner : "N/A";

  const calculateTotalParticipants = () => {
    const playersJoined =
      challenge?.Players?.length || challenge?.ParticipantsJoined || 0;

    switch (
      challenge.Game?.ParticipationType
        ? challenge.Game?.ParticipationType
        : challenge.ParticipationType
    ) {
      case 0:
      case "0v1":
        return 1;
      case 1:
      case "1v1":
        return 2;
      case 2:
      case "nvn":
        if (playersJoined < 50) return 50;
        if (playersJoined >= 50 && playersJoined < 70) return 70;
        if (playersJoined >= 70 && playersJoined < 150) return 150;
        return 300;
      default:
        return "1";
    }
  };

  const Game = challenge.Game ? challenge.Game : {};
  const totalParticipants = calculateTotalParticipants();
  const progress =
    ((challenge?.Players?.length || challenge?.ParticipantsJoined || 0) /
      totalParticipants) *
    100;
  const ChallengeCreator = challenge.ChallengeCreator
    ? challenge.ChallengeCreator
    : { UserName: "Unknown" };
  //  console.log("ChallengeCreator ",ChallengeCreator)
  // Calculate the total prize pool
  const totalPrizePool = totalParticipants * Wager;

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + "...";
  };

  const getStateColor = (state) => {
    switch (state) {
      case "UPCOMING":
        return "#3498db"; // Blue
      case "ONGOING":
        return "#27ae60"; // Green
      case "PROCESSING":
        return "#f39c12"; // Orange
      case "PAYINGOUT":
        return "#8e44ad"; // Purple
      case "COMPLETED":
        return "#2ecc71"; // Light Green
      case "CANCELLED":
        return "#e74c3c"; // Red
      case "NO_WINNER":
        return "#95a5a6"; // Gray
      default:
        return "#7f8c8d"; // Default Gray
    }
  };
  const getCategoryIcon = (categoryName) => {
    const category = categories.find((cat) => cat.name === categoryName);
    console.log("Category name received: ", categoryName);
    console.log("Category found: ", category);
    return category ? category.image : null;
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          paramName === "vote"
            ? navigation.navigate("feedPublic", { challenge })
            : navigation.navigate("ChallengeDetail", { challenge });
        }}
      >
        <View className={`${styles.marginX}`}>
          <View className={`mt-4 rounded-xl border border-neutral-200`}>
            <View className={`flex flex-row p-4 justify-between`}>
              <View className={`text w-2/3`}>
                <Text
                  style={{ color: getStateColor(State) }}
                  className={styles.lable}
                >
                  {State}
                </Text>
                <Text className={`${styles.cardHeading} mt-1`}>
                  {truncateText(`${ChallengeName}`, 35)}
                </Text>
                <Text className={`${styles.paragraph} mt-2 text-neutral-400`}>
                  {truncateText(ChallengeDescription, 60)}
                </Text>
              </View>

              <View className="flex items-center justify-center">
                <AnimatedCircularProgress
                  size={70}
                  width={2}
                  fill={progress}
                  tintColor="#2D3986"
                  backgroundColor="#D4D3E4"
                  rotation={0}
                  lineCap="round"
                  style={{ alignItems: "center", justifyContent: "center" }}
                >
                  {() => (
                    <Image
                      source={getCategoryIcon(challenge?.Category)}
                      style={{ width: 50, height: 50 }}
                    />
                  )}
                </AnimatedCircularProgress>
                <Text className={`${styles.caption} mx-auto mt-2`}>
                  {challenge?.Players?.length ||
                  challenge?.Players?.length === 0
                    ? challenge.Players.length
                    : challenge?.ParticipantsJoined || 0}{" "}
                  / {totalParticipants} Joined
                </Text>
              </View>
            </View>
            <View className={`border-t border-neutral-200 mx-4 mb-4`}></View>
            <View className={`flex flex-row mx-4 pb-4 justify-between`}>
              <View>
                <Text className={`${styles.caption2} text-[#BAB8CB] mb-1`}>
                  Minimum Wager
                </Text>
                <Text className={`${styles.subtext}`}>
                  {`${challenge?.Wager || challenge?.WagerStaked || "0"} ${
                    challenge?.Currency
                  }`}
                </Text>
              </View>
              <View>
                <Text className={`${styles.caption2} text-[#BAB8CB] mb-1`}>
                  Winning Amount
                </Text>
                <Text className={`${styles.subtext}`}>
                  {`${totalPrizePool} ${challenge.Currency}`}
                </Text>
              </View>
              <View>
                <Text className={`${styles.caption2} text-[#BAB8CB] mb-1`}>
                  Creator
                </Text>
                <Text className={`${styles.subtext}`}>
                  {truncateText(`${ChallengeCreator?.UserName}`, 8)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </>
  );
};

export default ChallengeCard;
