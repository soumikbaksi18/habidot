import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import Confetti from "react-native-confetti";
import Trophy from "../assets/images/Trophy.png";
import styles from "../styles/styles";
import Popup from "../components/Popup";

const JoinedChallenge = ({ navigation }) => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [havewon, setHavewon] = useState(false);
  const confettiRef = useRef(null);

  const won = () => {
    setIsPopupVisible(true);
  };

  const handleClosePopup = () => {
    setIsPopupVisible(false);
    setHavewon(false);
  };

  useEffect(() => {
    if (isPopupVisible && confettiRef.current) {
      confettiRef.current.startConfetti();
    } else if (confettiRef.current) {
      confettiRef.current.stopConfetti();
    }
  }, [isPopupVisible]);

  return (
    <ScrollView className="flex flex-col w-screen">
      <TouchableOpacity
        className="px-10 py-3 bg-[#FEC93D] rounded-full"
        onPress={won}
      >
        <Text className="text-lg font-semibold">trigger a u won condition</Text>
      </TouchableOpacity>

      {/* Popup for confirming join */}
      {!havewon && (
        <Popup isVisible={isPopupVisible} onClose={handleClosePopup}>
          <>
            <Confetti ref={confettiRef} />

            <View className=" p-3">
              <Image source={Trophy} size={60} />
            </View>
            <Text className=" mt- mb-2  text-[17px] font-bold">
              Congratulation On Winning!
            </Text>
            <Text className="font-inter font-normal text-xs mx-4 first-letter: leading-5 text-center text-gray-700">
           Pool will be transferred to your account soon.
            </Text>

            <View className="w-full">
              <TouchableOpacity
                className=" py-3 m-4 border  flex items-center border-gray-300 rounded-full my-8"
                onPress={handleClosePopup}
              >
                <Text className="text-black">Okay</Text>
              </TouchableOpacity>
            </View>
          </>
        </Popup>
      )}
    </ScrollView>
  );
};

export default JoinedChallenge;
