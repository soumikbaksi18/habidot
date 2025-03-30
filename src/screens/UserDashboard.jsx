import React from "react";
import { useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Clipboard,
  Linking,
  SafeAreaView,
  StatusBar,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import useUserDetails from "../hooks/useUserDetails";
import useUserTransaction from "../hooks/useUserTransaction";
import avatar from "../assets/images/avatar.png";
import JoinChallengeIcon from "../assets/images/3xCredit.png";
import truncateText from "../utils/utils";
import Popup from "../components/Popup";
import useWithdraw from "../hooks/useWithdraw";
import SlideToConfirm from "../components/SlideToConfirm";
import { useFocusEffect } from "@react-navigation/native";
import ShareableModal from "../components/ShareableModel";
const UserDashboard = ({ navigation }) => {
  const [isOpenShareModal, setisOpenShareModal] = useState(false);
  const handlePopClose = () => {
    setisOpenShareModal(false);
  };
  const { userDetails, loading, error, fetchUserDetails } = useUserDetails();
  const {
    userTransaction,
    loading: transactionLoading,
    error: transactionError,
    fetchUserTransaction,
  } = useUserTransaction();
  const {
    withDraw,
    isLoading,
    error: withdrawError,
    message,
    success,
  } = useWithdraw(); // Destructure values from useWithdraw hook
  const [selectedWallet, setSelectedWallet] = useState("");
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    if (userDetails) {
      setSelectedWallet(userDetails.User.WalletAddress);
      if (
        !wallets.find((w) => w.PublicKey === userDetails.User.WalletAddress)
      ) {
        setWallets([{ PublicKey: userDetails.User.WalletAddress }, ...wallets]);
      }
    }
  }, [userDetails]);

  const [isOpen, setIsOpen] = useState(false);
  const [withDrawalConfirmation, setWithDrawalConfirmation] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddCreditsPopupVisible, setIsAddCreditsPopupVisible] =
    useState(false);
  const [sliderState, setSliderState] = useState(false);
  const [some, setSome] = useState(false);
  const [someslide, setSomeslide] = useState(false);
  const [all, setAll] = useState(false);
  const [amount, setAmount] = useState("");
  const [withdrawStatusVisible, setWithdrawStatusVisible] = useState(false);
  const [withdrawStatusMessage, setWithdrawStatusMessage] = useState("");
  const [isLoadingIndicator, setIsLoadingIndicator] = useState(false); // Slider loading state
  // const [loading, setLoading] = useState(false);

  const handleAddCredits = () => {
    setIsAddCreditsPopupVisible(true);
  };

  const handlewithdraw = () => {
    setIsPopupVisible(true);
  };
  //   const handleSlideConfirmed = () => {
  //     setIsLoadingIndicator(true);
  //     // Perform your confirmation logic here
  //     // Once done, set loading to false
  //     setTimeout(() => {
  //         setIsLoadingIndicator(false);
  //     }, 2000); // Example delay
  // };

  // Fetch user details on component mount
  useFocusEffect(
    useCallback(() => {
      // Fetch user details when the screen is focused
      fetchUserDetails();
      fetchUserTransaction();
      console.log(userTransaction);
      // Cleanup function (optional)
      return () => {
        // ... cleanup logic if needed
      };
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserDetails();
    setRefreshing(false);
  }, [fetchUserDetails]);

  useEffect(() => {
    if (success) {
      // setAmount(amount)
      console.log(success);
      setWithdrawStatusMessage(
        `Your Off-ramp of ${amount} credits is currently processing.`
      );
    } else if (withdrawError || message) {
      // setAmount(amount)
      console.log(withdrawError || message);
      setWithdrawStatusMessage(`Error: ${message}`);
    }
  }, [success, withdrawError, message]);

  const handlesome = () => {
    setSome(true);
    setAll(false);
  };

  const handleall = () => {
    setAmount(userDetails.User.Credits);
    setAll(true);
    setSome(false);
  };

  const handleCloseAddCreditsPopup = () => {
    setIsAddCreditsPopupVisible(false);
  };

  const handleClosePopup = async () => {
    setIsLoadingIndicator(true);

    console.log(`Withdrawing ${amount} credits`);
    await withDraw(amount);
    setIsPopupVisible(false);
    setAll(false);
    setSome(false);
    // setAmount("");
    setSomeslide(false);

    setWithdrawStatusVisible(true);
  };
  const handleClosePopupUI = async () => {
    // console.log(`Withdrawing ${amount} credits`);
    // await withDraw(amount);
    setIsPopupVisible(false);
    setAll(false);
    setSome(false);
    setAmount("");
    setSomeslide(false);
    setIsLoadingIndicator(false);
    // setWithdrawStatusVisible(true);
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.navigate("SignIn");
  };
  const handleAmountChange = (value) => {
    setAmount(value);
  };

  const incrementAmount = (increment) => {
    const currentAmount = parseFloat(amount) || 0;
    const newAmount = currentAmount + increment;
    setAmount(newAmount.toString());
  };

  const handleConfirmWithdrawal = async () => {
    // Logic for confirming the withdrawal

    console.log(`Withdrawing ${amount} credits`);
    setSomeslide(true);
  };

  const truncateAndMaskWalletAddress = (address) => {
    if (address) {
      if (address.length <= 10) return address;
      return `${address.slice(0, 5)}...........${address.slice(-6)}`;
    } else {
      return address;
    }
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    alert("Wallet address copied to clipboard!");
  };
  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView className="flex flex-col w-screen">
          <Text>Error: {error}</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const profileImage = userDetails?.User?.ProfilePicture
    ? { uri: userDetails.User.ProfilePicture }
    : avatar;

  console.log("profile image from User dash", profileImage);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        className="flex flex-col font-inter w-screen bg-white"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View
          className="flex h-40 items-center p-4"
          style={{
            backgroundColor: userDetails.User?.CoverHexCode || "#5FD7D5",
          }}
        >
          <View className="absolute flex  items-center mt-24">
            <Image
              className="w-28  rounded-lg h-28 bg-slate-200"
              source={profileImage}
            />
            <Text className="text-[10px] mt-2 text-gray-600">
              {userDetails.User.Email}
            </Text>
            <View className="flex flex-row items-center p-2">
              <Text className="text-xl font-bold text-center mr-2 h-[32px] text-gray-800">
                {truncateText(userDetails.User.UserName, 20)}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("EditUserProfile")}
              >
                <MaterialCommunityIcons size={35} name="pencil-circle" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <TouchableOpacity className="py-3 mx-5 mt-32 border font-inter flex items-center border-gray-200 rounded-full">
          <View className="flex flex-row items-center">
            <Text className="text-[#161616] text-sm px-6">
              {truncateAndMaskWalletAddress(userDetails.User.WalletAddress)}
            </Text>
            <TouchableOpacity
              onPress={() => copyToClipboard(userDetails.User.WalletAddress)}
            >
              <MaterialCommunityIcons
                size={20}
                color={"grey"}
                name="content-copy"
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        <View style={{ width: "100%", padding: 8 }}>
          <View
            style={{
              flexDirection: "column",
              padding: selectedWallet || isOpen ? 16 : 0,
              borderWidth: selectedWallet || isOpen ? 1 : 0,
              borderColor: "#E3E3E3",
              borderRadius: 20,
              gap: 8,
            }}
          >
            <TouchableOpacity
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderColor: "#E3E3E3",
                borderRadius: 28,
                width: "100%",
                backgroundColor: !selectedWallet ? "#EEEEEE" : "#FFF",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onPress={() => setIsOpen(!isOpen)}
            >
              {selectedWallet !== "" ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    width: "100%",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <AntDesign name="wallet" size={18} />
                    <Text
                      style={{
                        color: "#576175",
                        fontSize: 14,
                        fontWeight: "500",
                      }}
                    >
                      Account 1
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontStyle: "italic",
                        color: "#AEB4C1",
                      }}
                    >
                      {truncateAndMaskWalletAddress(selectedWallet)}
                    </Text>
                  </View>
                  <AntDesign
                    name="down"
                    style={{
                      color: "#576175",
                      transform: [{ rotate: isOpen ? "180deg" : "0deg" }],
                    }}
                  />
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  <AntDesign name="wallet" size={18} />
                  <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                    Connect Wallet
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {isOpen && (
              <ScrollView style={{ maxHeight: 200 }}>
                {wallets.map((wallet, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderBottomWidth: index === wallet.length - 1 ? 1 : 0,
                      borderBottomColor: "#E3E3E3",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                    onPress={() => {
                      handleWalletChange({
                        target: { value: wallet.PublicKey },
                      });
                      setIsOpen(false);
                    }}
                  >
                    <AntDesign name="wallet" size={18} />
                    <Text
                      style={{
                        color: "#576175",
                        fontSize: 14,
                        fontWeight: "500",
                      }}
                    >
                      Account {index + 1}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontStyle: "italic",
                        color: "#AEB4C1",
                      }}
                    >
                      {truncateAndMaskWalletAddress(wallet.PublicKey)}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={{
                    paddingVertical: 8,
                    borderColor: "#E3E3E3",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    borderWidth: 1,
                    borderRadius: 10,
                  }}
                  onPress={() => {
                    setIsOpen(false);
                  }}
                >
                  <AntDesign name="wallet" size={18} />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                    }}
                  >
                    Add Wallet
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
        <View className="flex flex-col items-start p-4 w-80 min-h-[80px] mt-8">
          <Text className="font-inter font-bold text-[12px] leading-[14.52px] tracking-[1px] text-[#1F1F1F] uppercase ">
            About Me
          </Text>
          <View className="flex flex-row items-center w-80 min-h-[80px]">
            <Text className="text-sm text-gray-700">
              {userDetails.User.Bio ||
                "Third Rule of the street, No one is interested in your feelings"}
            </Text>
          </View>
        </View>
        <View className="h-px py-1 bg-[#ebebeb] w-full my-2" />
        <View>
          <Text className="font-inter font-bold text-md leading-[14.52px] tracking-[1px] text-[#1F1F1F] uppercase p-4 text-center">
            CATOFF ANALYTICS
          </Text>
          <ScrollView
            horizontal={true}
            className="flex p-4 flex-row gap-4 w-full"
            style={{ overflowX: "scroll", flexDirection: "row" }}
          >
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("MyChallenge", { activeCategory: "joined" })
              }
              className="border border-gray-200 rounded-lg px-4 py-2 w-[170px]"
            >
              <View className="flex flex-row items-center">
                <Feather name="trending-up" size={18} color={"#EFBD42"} />
                <Text className="text-[10px] p-3 pl-2 text-gray-700">
                  Challenges Joined
                </Text>
              </View>
              <View className="flex flex-row mt-4 justify-between items-center">
                <Text className="text-4xl font-ttRunsTrialRegular text-gray-800">
                  {userDetails.PastChallenges}
                </Text>
                <AntDesign name="arrowright" size={18} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate("MyChallenge", {
                  activeCategory: "created",
                })
              }
              className="border w-[170px] border-gray-200 rounded-lg px-4 py-2"
            >
              <View className="flex flex-row items-center">
                <Feather name="trending-up" size={18} color={"#EFBD42"} />
                <Text className="text-[10px] p-3 pl-2 text-gray-700">
                  Active Challenges
                </Text>
              </View>
              <View className="flex flex-row mt-4 justify-between items-center">
                <Text className="text-4xl font-ttRunsTrialRegular text-gray-800">
                  {userDetails.CurrentActiveChallenges}
                </Text>
                <AntDesign name="arrowright" size={18} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("MyChallenge", {
                  activeCategory: "created",
                })
              }
              className="border w-[170px] border-gray-200 rounded-lg px-4 py-2 mr-6"
            >
              <View className="flex flex-row items-center">
                <Feather name="trending-up" size={18} color={"#EFBD42"} />
                <Text className="text-[10px] p-3 pl-2 text-gray-700">
                  SideWagers
                </Text>
              </View>
              <View className="flex flex-row mt-4 justify-between items-center">
                <Text className="text-4xl font-ttRunsTrialRegular text-gray-800">
                  {userDetails.sidewagers ?? 0}
                </Text>
                <AntDesign name="arrowright" size={18} />
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
        <View className="h-px py-1 bg-[#ebebeb] w-full my-2" />
        <View className="flex flex-col space-y-2 py-4">
          <Text className="font-interBold text-xl px-4">General</Text>
          <View className="flex flex-col pt-2">
            <TouchableOpacity
              className=" w-full pr-4 py-1 flex flex-row shadow-sm items-center justify-between border-b  border-b-slate-300 pb-6"
              onPress={() => {
                navigation.navigate("Transaction");
              }}
            >
              <View className="flex flex-col gap-1">
                <View className="flex flex-row gap-3 items-center">
                  <AntDesign name="piechart" size={20} />
                  <Text className="font-semibold text-xl">Catoff Logs</Text>
                </View>
                <Text className="pl-11">Catoff Trasaction History</Text>
              </View>
              <AntDesign name="right" />
            </TouchableOpacity>
          </View>
          <View className="flex flex-col">
            <TouchableOpacity
              className="w-full pr-4 py-1 flex flex-row shadow-sm items-center justify-between border-b  border-b-slate-300 pb-6"
              onPress={() => Linking.openURL("https://catoff.xyz")}
            >
              <View className="flex flex-col gap-1">
                <View className="flex flex-row gap-3 items-center">
                  <AntDesign name="infocirlceo" size={20} />
                  <Text className="font-bold text-lg">Help</Text>
                </View>
                <Text className="pl-11">Help Center and contact us</Text>
              </View>
              <AntDesign name="right" />
            </TouchableOpacity>
          </View>
          <View className="flex flex-col">
            <TouchableOpacity
              className="w-full pr-4 py-1 flex flex-row shadow-sm items-center justify-between border-b border-b-slate-300 pb-6"
              onPress={() => {
                setisOpenShareModal(true);
              }}
            >
              <View className="flex flex-col gap-1">
                <View className="flex flex-row gap-3 items-center">
                  <AntDesign name="contacts" size={20} />
                  <Text className="font-bold text-lg">Invite a friend</Text>
                </View>
                <Text
                  className="text-wrap pl-11"
                  style={{ width: "90%", flex: 1, flexWrap: "wrap" }}
                >
                  Refer and invite a friend and earn upto 100 credits.
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View className="h-px py-1 bg-[#ebebeb] w-full my-2" />
        <View className="flex flex-col p-4">
          <Text className="font-semibold text-lg">More Info</Text>
          <View className="flex flex-col space-y-2 pt-4 ">
            <TouchableOpacity
              onPress={() => Linking.openURL("https://catoff.xyz")}
            >
              <Text className="text-lg">FAQS</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL("https://www.catoff.xyz/catpaper")}
            >
              <Text className="text-lg">ABOUT US</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL("https://www.catoff.xyz/TermsAndServices.html")
              }
            >
              <Text className="text-lg">TERMS & CONDITIONS</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL("https://www.catoff.xyz/PrivacyPolicy.html")
              }
            >
              <Text className="text-lg">PRIVACY POLICY</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="h-px py-1 bg-[#ebebeb] w-full my-2" />
        <View className={`flex-1 justify-center items-center`}>
          <TouchableOpacity
            className={`w-[94%] border border-[#db5555] py-3 rounded-full mt-2 mb-2`}
            onPress={handleLogout}
          >
            <Text
              className={`text-center text-[#c44545] text-sm font-semibold`}
            >
              Logout
            </Text>
          </TouchableOpacity>

          <Text
            className={`text-center text-[#bdbdbd] text-[10px] font-normal mb-4 tracking-tight`}
          >
            Catoff Gaming LLC, ©2024. All rights reserved.
          </Text>
        </View>

        <Popup isVisible={isPopupVisible} onClose={handleClosePopupUI}>
          <>
            {!some && !all ? (
              <View className="flex flex-col min-h-[240px] items-start w-full">
                <Text className="my-7 ml-6 text-left text-lg leading-6 text-black">
                  Select your action
                </Text>
                <View className="w-full">
                  <TouchableOpacity
                    className="py-3 m-2 border flex items-center border-gray-300 rounded-full"
                    onPress={handlesome}
                  >
                    <View className="flex flex-row justify-between items-center px-6 w-full">
                      <Text className="text-black">Off-ramp credits</Text>
                      <AntDesign name="arrowright" size={18} />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="py-3 m-2 border flex items-center border-gray-300 rounded-full"
                    onPress={handleall}
                  >
                    <View className="flex flex-row justify-between items-center px-6 w-full">
                      <Text className="text-black">Off-ramp all credits</Text>
                      <AntDesign name="arrowright" size={18} />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            ) : some && !someslide ? (
              <View className="flex min-h-[350] flex-col items-center w-full">
                <Image className="h-16 w-16 mt-8" source={JoinChallengeIcon} />
                <TextInput
                  className="w-[262px] h-[44px] my-5 opacity-10 font-ttRunsTrialRegular font-bold text-[32px] leading-[44px] text-center text-[#1F1F1F]  "
                  value={amount.toString()}
                  onChangeText={handleAmountChange}
                  placeholder="Enter amount"
                  keyboardType="numeric"
                />
                <View className="flex flex-row mb-4 justify-center items-start gap-2 w-full">
                  <TouchableOpacity
                    className="py-2 px-4 border border-gray-200  rounded-lg"
                    onPress={() => incrementAmount(100)}
                  >
                    <Text className="text-black">+ 100</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="py-2 px-4 border border-gray-200  rounded-lg"
                    onPress={() => incrementAmount(500)}
                  >
                    <Text className="text-black">+ 500</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="py-2 px-4 border border-gray-200  rounded-lg"
                    onPress={() => incrementAmount(1000)}
                  >
                    <Text className="text-black">+ 1000</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  className="flex flex-row justify-center items-center p-2  my-4 w-[300px] h-[48px] bg-black rounded-[32px]"
                  onPress={handleConfirmWithdrawal}
                >
                  <Text className="text-white font-bold">
                    Continue to Off-ramp
                  </Text>
                </TouchableOpacity>
              </View>
            ) : someslide ? (
              <>
                <Image className="h-16 w-16 mt-8" source={JoinChallengeIcon} />
                <Text className="text-3xl my-4 font-ttRunsTrialMedium ">
                  {amount} Credits
                </Text>
                <Text className="font-inter font-normal text-xs mx-1 mb-4 leading-5 text-center text-gray-700">
                  Transfer to your crypto wallet.
                </Text>
                <View className="my-8 ">
                  <SlideToConfirm
                    unconfirmedTipText={"Slide to confirm"}
                    unconfirmedTipTextStyle={{
                      color: "black",
                      fontSize: 18,
                    }}
                    confirmedTipText={"Confirmed"}
                    confirmedTipTextStyle={{
                      color: "black",
                      fontSize: 18,
                    }}
                    state={sliderState}
                    loading={isLoadingIndicator}
                    onSlideConfirmed={() => {
                      setIsLoadingIndicator(true);
                      handleClosePopup();
                    }}
                    sliderStyle={{
                      justifyContent: "center",
                      width: 320,
                      height: 55,
                      borderRadius: 32,
                      overflow: "hidden",
                      backgroundColor: "transparent",
                    }}
                  />
                </View>
              </>
            ) : (
              <>
                <Image className="h-16 w-16 mt-8" source={JoinChallengeIcon} />
                <Text className="text-3xl my-4 font-ttRunsTrialMedium ">
                  {userDetails.User.Credits} Credits
                </Text>
                <Text className="font-inter font-normal text-xs mx-1 mb-4 leading-5 text-center text-gray-700">
                  Transfer to your crypto wallet.
                </Text>
                <View className="my-8 ">
                  <SlideToConfirm
                    unconfirmedTipText={"Slide to confirm"}
                    unconfirmedTipTextStyle={{
                      color: "black",
                      fontSize: 18,
                    }}
                    confirmedTipText={"Confirmed"}
                    confirmedTipTextStyle={{
                      color: "black",
                      fontSize: 18,
                    }}
                    state={sliderState}
                    loading={isLoadingIndicator}
                    onSlideConfirmed={() => {
                      setIsLoadingIndicator(true);
                      handleClosePopup();
                    }}
                    sliderStyle={{
                      justifyContent: "center",
                      width: 320,
                      height: 55,
                      borderRadius: 32,
                      overflow: "hidden",
                      backgroundColor: "transparent",
                    }}
                  />
                </View>
              </>
            )}
          </>
        </Popup>
        {withdrawStatusVisible && (
          <Popup
            visible={withdrawStatusVisible}
            onClose={() => setWithdrawStatusVisible(false)}
          >
            <>
              {!success ? (
                <>
                  <View className="bg-[#FFFFFF] rounded-full p-3 mt-10">
                    <MaterialCommunityIcons
                      name="close-circle"
                      size={60}
                      color="red"
                    />
                  </View>
                  <Text className=" mt-6 mb-2  text-bolder">
                    Off-ramp Status
                  </Text>
                  <Text className="font-inter font-normal text-xs mx-1 leading-5 text-center text-gray-700">
                    {withdrawStatusMessage}
                  </Text>
                  <View className="w-full">
                    <TouchableOpacity
                      className=" py-3 m-4 border  flex items-center border-gray-300 rounded-full my-8"
                      onPress={() => {
                        setWithdrawStatusVisible(false);
                        setAmount("");
                        setIsLoadingIndicator(false);
                      }}
                    >
                      <Text className="text-black">Close</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <View className="bg-[#ffffff] rounded-full  mt-10">
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={100}
                      color="green"
                    />
                    {/* 
          <MaterialCommunityIcons name="timer-sand" size={60} color="white" /> */}
                  </View>
                  <Text className=" mt-6 mb-2  text-bolder">
                    Off-ramp Successfull!
                  </Text>
                  <Text className="font-inter font-normal text-xs mx-1 leading-5 text-center text-gray-700">
                    Your Off-ramp of {amount} credits is completed.
                  </Text>
                  <View className="w-full">
                    <TouchableOpacity
                      className=" py-3 m-4 border  flex items-center border-gray-300 rounded-full my-8"
                      onPress={() => {
                        setWithdrawStatusVisible(false);
                        setWithDrawalConfirmation(true);
                        setIsLoadingIndicator(false);
                      }}
                    >
                      <Text className="text-black">Okay</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </>
          </Popup>
        )}

        {withDrawalConfirmation && (
          <Popup
            visible={withDrawalConfirmation}
            onClose={() => setWithDrawalConfirmation(false)}
          >
            <>
              <View className="bg-[#000000] rounded-full p-3 mt-10">
                {/* <MaterialCommunityIcons name="check-circle" size={60} color="green" /> */}
                <MaterialCommunityIcons
                  name="timer-sand"
                  size={60}
                  color="white"
                />
              </View>
              <Text className=" mt-6 mb-2  text-bolder">Off-ramp Status</Text>
              <Text className="font-inter font-normal text-xs mx-1 leading-5 text-center text-gray-700">
                {withdrawStatusMessage}
              </Text>
              <View className="w-full">
                <TouchableOpacity
                  className=" py-3 m-4 border  flex items-center border-gray-300 rounded-full my-8"
                  onPress={() => {
                    setWithDrawalConfirmation(false);
                    setAmount("");
                    setIsLoadingIndicator(false);
                  }}
                >
                  <Text className="text-black">Close</Text>
                </TouchableOpacity>
              </View>
            </>
          </Popup>
        )}
        <Popup
          isVisible={isAddCreditsPopupVisible}
          onClose={handleCloseAddCreditsPopup}
        >
          <View>
            <Text className="mt-6 mb-2 text-bolder self-center">
              Catoff Gaming is currently on Solana devnet
            </Text>
            <Text className="font-inter font-normal text-xs mx-1 leading-5 text-center text-gray-700">
              If you want to get more credits then drop a message on our
              telegram group
            </Text>
            <View className="w-[90%]">
              <TouchableOpacity
                className="py-3 m-4 border flex items-center border-gray-300 rounded-full my-8 min-w-full mx-2"
                onPress={async () => {
                  const telegramUrl = "https://t.me/+xoGcw5oJzI0wNWRh";
                  const supported = await Linking.canOpenURL(telegramUrl);

                  if (supported) {
                    await Linking.openURL(telegramUrl);
                  }
                  handleCloseAddCreditsPopup();
                }}
              >
                <Text className="text-black">Visit Our Telegram</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Popup>
        <ShareableModal
          isOpen={isOpenShareModal}
          onRequestClose={handlePopClose}
          shareUrl="https://catoff.xyz"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserDashboard;
