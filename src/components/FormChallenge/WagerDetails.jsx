// WagerDetails.js
import React, { useRef, useState } from "react";
import { Text, TextInput, View, Image, TouchableOpacity } from "react-native";
import styless from "./../../styles/styles";
import SolImage from "../../assets/tokens/Solana.png";
import BonkImage from "../../assets/tokens/Bonk.png";
import USDCImage from "../../assets/tokens/USDC.png";
import useSolPrice from "../../hooks/useSolPrice";
import dropdown from "../../assets/images/dropdown.png";
import useWallets from "../../hooks/useWallets";
import { FlatList } from "react-native-gesture-handler";
import Ionicons from "react-native-vector-icons/Ionicons";
const WagerDetails = ({
  wagerAmount,
  setWagerAmount,
  wagerAmountError,
  userDetails,
  truncateAndMaskWalletAddress,
  credit,
  info,
  setWagerAmountError,
  challenge,
  setChallenge,
}) => {
  const { solPrice, convertCreditsToUSDT, convertCreditsToSOL } = useSolPrice();
  const [selectedToken, setSelectedToken] = useState({
    value: "SOL",
    label: "SOL",
    disabled: false,
    imgSrc: SolImage,
  });
  const {
    wallets,
    selectedWallet,
    setSelectedWallet,
    isDropdownOpenWallet,
    setIsDropdownOpenWallet,
    dropdownWalletRef,
  } = useWallets();

  console.log(wallets);

  const options = [
    { value: "SOL", label: "SOL", disabled: false, imgSrc: SolImage },
    { value: "USDC", label: "USDC", disabled: true, imgSrc: USDCImage },
    { value: "BONK", label: "BONK", disabled: true, imgSrc: BonkImage },
  ];
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const numericWagerAmount = parseFloat(wagerAmount) || 0;
  let convertedWagerAmount;
  const wagerInUSDT = convertCreditsToUSDT(numericWagerAmount);
  if (selectedToken.value === "SOL") {
    convertedWagerAmount = convertCreditsToSOL(numericWagerAmount);
  } else if (selectedToken.value === "CREDITS") {
    convertedWagerAmount = convertCreditsToUSDT(numericWagerAmount);
  } else {
    convertedWagerAmount = numericWagerAmount;
  }
  const dropdownRef = useRef(null);
  const formattedConvertedWagerAmount =
    convertedWagerAmount !== null
      ? parseFloat(convertedWagerAmount).toFixed(2)
      : "0.00";

  return (
    <View className="mt-4">
      <Text
        className={`text-[#252A31] text-base font-medium ${styless.cardHeading}`}
      >
        Participation Details
      </Text>
      {/* <View className="flex-row justify-between w-full items-center mt-2">
        <Text
          className={`text-[#252A31] text-xs font-medium w-7/10 ${styless.lable}`}
        >
          Minimum Participants
        </Text>
        <TouchableOpacity
          onPress={() => {
            if (challenge.minParticipants > 1) {
              setChallenge((prevChallenge) => ({
                ...prevChallenge,
                minParticipants: prevChallenge.minParticipants - 1,
              }));
            }
          }}
          className="bg-[#E8EDF1] rounded-full w-6 h-6 flex items-center justify-center"
        >
          <Text>-</Text>
        </TouchableOpacity>
        <Text>{challenge.minParticipants}</Text>
        <TouchableOpacity
          onPress={() => {
            if (challenge.minParticipants < challenge.maxParticipants) {
              setChallenge((prevChallenge) => ({
                ...prevChallenge,
                minParticipants: prevChallenge.minParticipants + 1,
              }));
            }
          }}
          className="bg-[#E8EDF1] rounded-full w-6 h-6 flex items-center justify-center"
        >
          <Text>+</Text>
        </TouchableOpacity>
      </View> */}

      <View className="flex-row justify-between w-full items-center mt-1">
        {/* Maximum Participants for Group Challenge */}
        {challenge.participationType === "2" && (
          <View className="flex flex-row justify-between w-full items-center mt-2">
            <Text className="text-[#252A31] text-[12px] font-[500]">
              Maximum Participants
            </Text>
            <View className="flex">
              <Text className="mt-2 mx-2">50 +</Text>
              {/* Fixed for versus a friend */}
            </View>
          </View>
        )}

        {/* Participation Details for Versus a Friend */}
        {challenge.participationType === "1" && (
          <View className="flex flex-row justify-between w-full items-center mt-2">
            <Text className="text-[#252A31] text-[12px] font-[500]">
              Maximum Participants
            </Text>
            <View className="flex">
              <Text className="mt-2 mx-2">2</Text>
              {/* Fixed for versus a friend */}
            </View>
          </View>
        )}

        {/* Participation Details for Dare a Friend */}
        {challenge.participationType === "0" && (
          <View className="flex flex-row justify-between w-full items-center mt-2">
            <Text className="text-[#252A31] text-[12px] font-[500]">
              Maximum Participants
            </Text>
            <View className="flex">
              <Text className="mt-2 mx-2">1</Text>
              {/* Fixed for dare based */}
            </View>
          </View>
        )}
      </View>
      <View className="h-1 w-full my-4 bg-[#F3F3F3]"></View>

      <Text
        className={`text-[#252A31] text-base font-medium ${styless.cardHeading}`}
      >
        Wager Details
      </Text>
      <View className="w-full mb-4">
        <Text className="text-[#252A31] text-xs font-medium mb-2">
          Wager Amount
        </Text>
        <View className="flex-row items-center border border-[#C9DE88B2] rounded px-2 h-12 relative">
          <View className="flex-row items-center flex-1">
            <TextInput
              placeholder="0.00"
              className="w-14 p-0"
              keyboardType="numeric"
              value={String(challenge.Wager)}
              onChangeText={(val) => {
                setWagerAmount(val);
                setChallenge((prevChallenge) => ({
                  ...prevChallenge,
                  Wager: val,
                }));
              }}
            />
            <Text className=" bg-gradient-to-r from-[#4343FF] via-[#EC55FF] to-[#FFD939] bg-clip-text">
              {formattedConvertedWagerAmount
                ? `($${formattedConvertedWagerAmount})`
                : "($0.00)"}
            </Text>
          </View>
          <View ref={dropdownRef} className="relative  ml-auto">
            <TouchableOpacity
              className="box-border flex flex-row justify-center items-center px-8 py-1  h-8 bg-white border border-gray-300 rounded-sm text-sm"
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <Image source={selectedToken.imgSrc} className="w-5 h-5 mr-2" />
              <Text>{selectedToken.label}</Text>

              <Image source={dropdown} className="ml-2" />
            </TouchableOpacity>

            {isDropdownOpen && (
              <View className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-sm shadow-lg z-10">
                {options.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    className={`flex-row items-center px-2 py-1 ${
                      option.disabled ? "opacity-50" : ""
                    }`}
                    disabled={option.disabled}
                    onPress={() => {
                      if (!option.disabled) {
                        setSelectedToken(option);
                        setChallenge((prevChallenge) => ({
                          ...prevChallenge,
                          Currency: option?.value,
                        }));
                        setIsDropdownOpen(false);
                      }
                    }}
                  >
                    <Image source={option.imgSrc} className="w-5 h-5 mr-2" />
                    <Text>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
      {wagerAmountError && (
        <Text className="text-red-400 mb-2 text-right mt-1">
          {wagerAmountError}
        </Text>
      )}
      <Text
        className={`text-[#252A31] text-base font-medium ${styless.cardHeading}`}
      >
        Connected Wallet
      </Text>

      <View className="relative w-full mb-8">
        <View className="border text-left flex flex-row border-[#C9DE88B2] rounded-[4px] px-3 py-2 w-full">
          <Text numberOfLines={1} ellipsizeMode="tail">
            {selectedWallet.slice(0, 15)}...
          </Text>
          <View ref={dropdownWalletRef} className="relative ml-auto">
            <TouchableOpacity
              className="box-border flex flex-row justify-center items-center px-8 py-1 h-8 bg-white border border-gray-300 rounded-sm text-sm"
              onPress={() => setIsDropdownOpenWallet(!isDropdownOpenWallet)}
            >
              <Ionicons name="wallet-outline" size={20} />
              <Text className="ml-2">{selectedWallet.slice(0, 6)}...</Text>
              <Image source={dropdown} className="ml-2" />
            </TouchableOpacity>

            {isDropdownOpenWallet && (
              <View
                className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-sm shadow-lg z-10"
                style={{ zIndex: 999, marginBottom: 10 }}
              >
                <FlatList
                  data={wallets}
                  keyExtractor={(item) => item.PublicKey}
                  className="py-2"
                  renderItem={({ item: wallet }) => (
                    <TouchableOpacity
                      className="flex flex-row items-center px-4 py-2 w-full text-left"
                      onPress={() => {
                        setSelectedWallet(wallet.PublicKey);
                        setIsDropdownOpenWallet(false);
                      }}
                    >
                      <Ionicons name="wallet-outline" size={20} />
                      <Text>{wallet?.PublicKey?.slice(0, 8)}...</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default WagerDetails;
