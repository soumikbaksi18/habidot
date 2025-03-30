import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const NotificationItem = ({
  heading,
  description,
  isNew,
  createdAt,
  type,
  challengeId,
  onMarkAsRead,
  id,
}) => {
  const navigation = useNavigation();

  const getNotificationImage = () => {
    const imageMap = {
      SIGNUP: require("../assets/images/Catoff-512.webp"),
      CHALLENGE_CREATED: require("../assets/notifications/join_challenge.webp"),
      CHALLENGE_JOINED_SELF: require("../assets/notifications/challenge_accepted.webp"),
      CHALLENGE_JOINED_PLAYER: require("../assets/notifications/challenge_accepted.webp"),
      CHALLENGE_JOINED_CREATOR: require("../assets/notifications/challenge_accepted.webp"),
      CHALLENGE_MAX_PARTICIPATION_REACHED_CREATOR: require("../assets/notifications/challenge_accepted.webp"),
      CHALLENGE_MAX_PARTICIPATION_REACHED_PLAYER: require("../assets/notifications/challenge_accepted.webp"),
      WITHDRAW_REQUEST: require("../assets/notifications/withdraw.webp"),
      WITHDRAW_SUCCESS: require("../assets/notifications/withdraw.webp"),
      WITHDRAW_FAILED: require("../assets/notifications/withdraw.webp"),
      DEPOSIT_REQUEST: require("../assets/notifications/withdraw.webp"),
      DEPOSIT_SUCCESS: require("../assets/notifications/withdraw.webp"),
      DEPOSIT_FAILED: require("../assets/notifications/withdraw.webp"),
      default: require("../assets/images/Catoff-512.webp"),
    };

    return imageMap[type] || imageMap.default;
  };

  const handleClick = () => {
    switch (type) {
        case 'SIGNUP':
            navigation.navigate('EditUserProfile');
            break;
        case 'CHALLENGE_CREATED':
        case 'CHALLENGE_JOINED_SELF':
        case 'CHALLENGE_JOINED_PLAYER':
        case 'CHALLENGE_JOINED_CREATOR':
        case 'CHALLENGE_MAX_PARTICIPATION_REACHED_CREATOR':
        case 'CHALLENGE_MAX_PARTICIPATION_REACHED_PLAYER':
        case 'CHALLENGE_CANCELLED_SELF':
        case 'CHALLENGE_CANCELLED_PLAYER':
        case 'CHALLENGE_STARTED_SELF':
        case 'CHALLENGE_STARTED_PLAYER':
        case 'CHALLENGE_ENDED_SELF':
        case 'CHALLENGE_ENDED_PLAYER':
        case 'CHALLENGE_SETTLED_WITH_NO_WINNER':
        case 'CHALLENGE_SETTLED_WITH_NO_WINNER_CREATOR':
        case 'CHALLENGE_SETTLED_WITH_WINNER_SELF':
        case 'CHALLENGE_SETTLED_WITH_WINNER_CREATOR':
        case 'CHALLENGE_SETTLED_WITH_WINNER':
            navigation.navigate('ChallengeDetail', { challenge: { ChallengeID: challengeId } });
            break;
        case 'WITHDRAW_REQUEST':
        case 'WITHDRAW_SUCCESS':
        case 'WITHDRAW_FAILED':
        case 'DEPOSIT_REQUEST':
        case 'DEPOSIT_SUCCESS':
        case 'DEPOSIT_FAILED':
            navigation.navigate('Profile');
            break;
        default:
            break;
    }
};

  const formatDate = (date) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  return (
    <TouchableOpacity
      className="flex-row items-center p-2 bg-white border border-gray-200 rounded-lg mb-2 shadow-sm"
      onPress={handleClick}
    >
      <Image
        className="w-10 h-10 rounded-full mr-3"
        source={getNotificationImage()}
      />
      <View className="flex-1 min-w-0">
        <View className="flex-row items-center mb-1">
          <Text className="text-base font-medium">{heading}</Text>
          {isNew && <Text className="text-red-500 ml-2 text-sm">●</Text>}
        </View>
        <Text className="text-gray-500">{description}</Text>
        <Text className="text-gray-400 text-xs mt-1">
          {formatDate(createdAt)}
        </Text>
      </View>
      {!isNew ? (
        <TouchableOpacity className="ml-2">
          <Image
            source={require("../assets/images/3dot.webp")}
            className="w-5 h-5"
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          className="ml-2 p-2 bg-gray-400 bg-opacity-50 rounded border border-gray-500"
          onPress={onMarkAsRead}
        >
          <Text>Done</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default NotificationItem;
