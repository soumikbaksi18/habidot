import { View, Text, ScrollView } from "react-native";
import React from "react";
import useUserTransaction from "../hooks/useUserTransaction";
import moment from "moment";
import Feather from "react-native-vector-icons/Feather";
import useUserChallenges from "../hooks/useUserChallenge";

const Transaction = () => {
  const {
    userTransaction,
    loading: transactionLoading,
    error: transactionError,
  } = useUserTransaction();
  const { challenges } = useUserChallenges();
  console.log();
  console.log(challenges[0]);
  return (
    <ScrollView className={"flex flex-col"}>
      {userTransaction && (
        <View className="py-4">
          {userTransaction
            .sort((a, b) => parseInt(b.TxID) - parseInt(a.TxID))
            .map((transaction, index) => {
              const isParticipation =
                transaction.Description.toLowerCase().includes("participation");
              const isRefund =
                transaction.Description.toLowerCase().includes("refund");
              const isWithdrawal =
                transaction.Description.toLowerCase().includes("withdraw");
              const isDeposit =
                transaction.Description.toLowerCase().includes("deposit");

              let transactionColor;
              if (isParticipation) {
                transactionColor = "#C44545";
              } else if (isRefund) {
                transactionColor = "#29B45F";
              } else if (isWithdrawal) {
                transactionColor = "#008080"; // Custom color for Withdraw
              } else if (isDeposit) {
                transactionColor = "#FFA500"; // Custom color for Deposit
              } else {
                transactionColor = "#000000"; // Default color
              }

              if (isDeposit || isWithdrawal) {
                const formattedDate = moment(
                  parseInt(transaction.Timestamp) * 1000
                ).format("DD MMM YY"); // Adjusted for milliseconds
              } else {
                const formattedDate = moment(
                  parseInt(transaction.Timestamp)
                ).format("DD MMM YY");
              }
              const transactionIcon =
                isParticipation || isWithdrawal
                  ? "arrow-up-right"
                  : "arrow-down-right";

              return (
                <React.Fragment key={index}>
                  <View
                    style={{
                      padding: 10,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginVertical: 5,
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text
                        style={{
                          backgroundColor: transactionColor,
                          padding: 10,
                          borderRadius: 100,
                        }}
                      >
                        <Feather
                          name={transactionIcon}
                          size={24}
                          color="white"
                        />
                      </Text>
                      <Text style={{ fontSize: 14, marginLeft: 10 }}>
                        <Text className="font-bold">
                          {transaction.CreditAmount} credits
                        </Text>
                        <Text className="text-[#76747C]">
                          {" "}
                          {isParticipation
                            ? "used"
                            : isRefund
                            ? "refund"
                            : isWithdrawal
                            ? "Off-ramp"
                            : "deposited"}{" "}
                        </Text>
                      </Text>
                    </View>
                    <Text className="text-gray-700 text-sm mr-2">
                      {(isDeposit || isWithdrawal) &&
                        moment(parseInt(transaction.Timestamp) * 1000).format(
                          "DD MMM YY"
                        )}
                      {!isWithdrawal &&
                        !isDeposit &&
                        moment(parseInt(transaction.Timestamp)).format(
                          "DD MMM YY"
                        )}
                    </Text>
                  </View>
                  <View className=" py-[0.9] bg-[#ebebeb] w-full my-2" />
                </React.Fragment>
              );
            })}
        </View>
      )}
    </ScrollView>
  );
};

export default Transaction;
