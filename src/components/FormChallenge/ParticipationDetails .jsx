// ParticipationDetails.js
import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import styles from './../../styles/styles'; // Adjust the path as needed

const ParticipationDetails = ({
  challenge,
  setChallenge,
  decreaseMin,
  increaseMin
}) => {
  return (
    <View>
      <Text className={`text-[#252A31] text-[16px] font-[500] ${styles.cardHeading}`}>
        Participation Details
      </Text>
      <View className="flex-row justify-between w-full items-center">
        <Text className={`text-[#252A31] text-[12px] font-[500] mt-2 w-[70%] ${styles.lable}`}>
          Minimum Participants
        </Text>
        <TouchableOpacity
          onPress={() => {
            if (
              challenge.participationType === "0" &&
              challenge.minParticipants > 2
            ) {
              decreaseMin("minParticipants");
            } else if (
              challenge.participationType === "1" &&
              challenge.minParticipants > 2
            ) {
              decreaseMin("minParticipants");
            } else if (
              challenge.participationType === "2" &&
              challenge.minParticipants > 1
            ) {
              decreaseMin("minParticipants");
            }
          }}
          className="bg-[#E8EDF1] rounded-[13px] w-[26px] h-[26px] flex items-center justify-center mt-2"
        >
          <Text>-</Text>
        </TouchableOpacity>
        <Text className="mt-2">{challenge.minParticipants}</Text>
        <TouchableOpacity
          onPress={() => {
            if (challenge.participationType === "0") {
              increaseMin("minParticipants");
            } else if (
              challenge.participationType === "1" &&
              challenge.minParticipants < 2
            ) {
              increaseMin("minParticipants");
            } else if (
              challenge.participationType === "2" &&
              challenge.minParticipants < 1
            ) {
              increaseMin("minParticipants");
            }
          }}
          className="bg-[#E8EDF1] rounded-[13px] w-[26px] h-[26px] flex items-center justify-center mt-2"
        >
          <Text>+</Text>
        </TouchableOpacity>
      </View>
      {/* Add more fields as needed */}
    </View>
  );
};

export default ParticipationDetails;
