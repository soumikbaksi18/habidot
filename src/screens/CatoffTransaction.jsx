import React, { useState } from "react";
import GameTransactionTab from "../components/GameTransactionTab.jsx";
import Transaction from "../components/Transaction.jsx";
import useUserChallenges from "../hooks/useUserChallenge.js";
import {
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  StatusBar,
} from "react-native";

const CatoffTransaction = () => {
  const [activeTab, setActiveTab] = useState("transaction");
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };
  const { details, refetch, challenges } = useUserChallenges();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View className="mx-4 mt-2">
        <View className="bg-white py-2 px-2 rounded-lg flex flex-row items-center justify-center">
          <TouchableOpacity
            onPress={() => handleTabClick("transaction")}
            className={`flex-1 px-4 py-2 rounded-md ${
              activeTab === "transaction" ? "bg-gray-200" : "bg-white"
            } `}
          >
            <Text className="text-center">Transaction History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleTabClick("game")}
            className={`flex-1 px-4 py-2 rounded-md ${
              activeTab === "game" ? "bg-gray-200" : "bg-white"
            } `}
          >
            <Text className="text-center">Game History</Text>
          </TouchableOpacity>
        </View>

        <View className="w-full max-w-4xl">
          {activeTab === "game" ? (
            <GameTransactionTab
              activeTab={activeTab}
              userTransaction={challenges}
              details={details}
            />
          ) : (
            <Transaction activeTab={activeTab} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CatoffTransaction;
