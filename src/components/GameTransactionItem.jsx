import upArrowIcon from "../assets/images/up.webp";
import downArrowIcon from "../assets/images/down.webp";
import moment from "moment";
import { View, Text, Image } from "react-native";

const GameTransactionItem = ({
  type,
  amount,
  date,
  description,
  challengeName,
  startDate,
  endDate,
  winner,
  rank,
  state,
  details,
}) => {
  const formattedDate = moment(parseInt(startDate)).format("DD MMM YY");
  const formattedStartDate = moment(parseInt(startDate)).format("DD MMM YY");
  const formattedEndDate = moment(parseInt(endDate)).format("DD MMM YY");
  const isWinner = winner.some((val) => val?.PlayerID === details?.User?.ID);
  const transactionIcon = rank === 1 ? upArrowIcon : downArrowIcon;
  const rank1 = type === "1v1" ? rank : "0v1" ? "0v1 game" : rank;
  return (
    <View className="flex p-4 border-b border-gray-200">
      <View className="flex flex-row items-center mb-2">
        <Image source={transactionIcon} className="w-10 h-10 rounded-full" />
        <View className="flex flex-col ml-4">
          <Text className="text-gray-900  font-medium">{challengeName}</Text>
          <Text
            className={`text-xs text-left ${
              rank === 1 ? "text-green-500" : "text-red-500"
            }`}
          >
            Rank {rank}
          </Text>
        </View>
        <Text className="ml-auto text-gray-400  text-right">
          {formattedStartDate}
        </Text>
      </View>
    </View>
  );
};

export default GameTransactionItem;
