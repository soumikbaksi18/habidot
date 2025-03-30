import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import GameTransactionItem from "./GameTransactionItem";
import { ScrollView } from "react-native";
const GameTransactionTab = ({ activeTab, userTransaction, details }) => {
  const [sortedTransactions, setSortedTransactions] = useState([]);
  const [showMore, setShowMore] = useState(8);
  const transactionsPerLoad = 10;

  useEffect(() => {
    if (userTransaction && userTransaction.length > 0) {
      const sorted = [...userTransaction].sort(
        (a, b) => parseInt(b.StartDate) - parseInt(a.StartDate)
      );
      setSortedTransactions(sorted);
    }
  }, [userTransaction]);

  const currentTransactions = sortedTransactions.slice(0, showMore);

  const loadMore = () =>
    setShowMore((prev) =>
      Math.min(prev + transactionsPerLoad, sortedTransactions.length)
    );

  return (
    <ScrollView>
      {activeTab === "game" && (
        <View className="pb-4">
          {currentTransactions.map((transaction, index) => (
            <GameTransactionItem
              key={index}
              details={details}
              type={transaction.ParticipationType}
              amount={transaction.WagerStaked}
              date={transaction.Timestamp}
              description={transaction.Description}
              challengeName={transaction.ChallengeName}
              startDate={transaction.StartDate}
              endDate={transaction.EndDate}
              winner={transaction.Winners}
              rank={transaction.Rank}
              state={transaction.State}
            />
          ))}
          {showMore < sortedTransactions.length && (
            <View className="flex justify-center mt-4">
              <TouchableOpacity
                onPress={loadMore}
                className="flex-1 px-4 py-3 rounded-md bg-gray-200 mb-10"
              >
                <Text className="text-center font-bold">Load More</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default GameTransactionTab;
