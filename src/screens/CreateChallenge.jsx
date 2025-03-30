import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Clipboard,
} from "react-native";
import dayjs from "dayjs";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Image } from "react-native";
import card from "../assets/images/arrow.png";
import back from "../assets/images/back.png";
import truncateAndMaskWalletAddress from "../utils/truncatewalletaddress";
import { categories } from "../components/categories";
import {
  createChallengeAPI,
  getShareableLinkFromSlug,
} from "../utils/Apicalls";

import styles from "../styles/styles";
import credit from "../assets/images/credit.png";
import Bullet from "../assets/images/bullet.png";
// import Gray from "../assets/images/grey_credits.svg"
import info from "../assets/images/info.png";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";

import CreatedChallengeIcon from "../assets/images/3xCredit.png";
import Popup from "../components/Popup";
import ConfirmChallengePopup from "../components/ConfirmChallengePopup";
import useUserDetails from "../hooks/useUserDetails";
import CategoryList from "../components/Category/CategoryList";
import WagerDetails from "../components/FormChallenge/WagerDetails";
import ParticipationDetails from "../components/FormChallenge/ParticipationDetails ";
import ChallengeDetails from "../components/FormChallenge/ChallengeDetails";
import InviteToggle from "../components/FormChallenge/InviteToggle";
import ShadowButton from "../components/FormChallenge/ShadowButton";
import NFTpopUp from "../components/FormChallenge/NFTpopUp";
import ChallengePopup from "../components/FormChallenge/ChallengePopup.jsx";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { generateImage } from "../utils/genAi.js";
// import ChallengePopup from "../components/FormChallenge/ChallengePopUp";

const CreateChallenge = ({ navigation }) => {
  const scrollViewRef = useRef(null);
  const [connectedWallet, setConnectedWallet] = useState("");
  const { userDetails, loading, error, fetchUserDetails } = useUserDetails();
  const [challengeNameError, setChallengeNameError] = useState();
  const [dateError, setDateError] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isPreviewPopupVisible, setIsPreviewPopupVisible] = useState(false);
  const [isPrivateState, setIsPrivateState] = useState(false);
  const [sharableSlug, setSharableSlug] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [loadingCreateChallengeRequest, setLoadingCreateChallengeRequest] =
    useState(false);

  const [isOk, setIsOk] = useState(false);
  function getGameId(participation, game) {
    const gameIdMap = {
      "00": 1, // 0v1 Steps
      "01": 2, // 0v1 Calories
      10: 3, // 1v1 Steps
      11: 4, // 1v1 Calories
      20: 5, // nvn Steps
      21: 6, // nvn Calories
      "02": 7,
      12: 8,
      13: 9,
      23: 10, // Single Validator Based Game (nvn)
      "03": 11, // Single Validator Based Game (1v1)
      "04": 12, //voting based dare game
      14: 13, //voting based (1v1)
      24: 14, //voting based multiplayer
    };
    //console.log("gameidmap",gameIdMap[`${participation}${game}`])
    return gameIdMap[`${participation}${game}`];
  }
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const [errorAi, setErrorAi] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [wagerAmount, setWagerAmount] = useState("");
  const [step, setStep] = useState(1);
  const [wagerAmountError, setWagerAmountError] = useState("");
  const [selectionIndex, setSelectionIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 1))
  );
  const [aiImage, setAiImage] = useState(null);
  const [aiDescription, setAiDescription] = useState("Loading...");
  console.log("endDate", startDate, endDate);
  const [challenge, setChallenge] = useState({
    ChallengeName: "",
    ChallengeDescription: "",
    StartDate: startDate,
    EndDate: endDate,
    GameID: 0,
    Wager: 0,
    Target: 100,
    ChallengeCreator: 0,
    participationType: "2",
    gameType: 0,
    Unit: "",
    minParticipants: 2,
    maxParticipants: 2,
    Media:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    winningUnit: 0,
    ChallengeCategory: "",
    Currency: "SOL",
    NFTMedia:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  });
  const generateDefaultDescription = (challenge, startDate, endDate) => {
    const gameTypeDescription = challenge.GameType
      ? `Prepare yourself for a thrilling ${challenge.GameType} challenge that will test your skills and determination.`
      : "An exciting opportunity to showcase your talents is here!";

    const participantInfo = challenge.MaxParticipants
      ? `This challenge is open to up to ${challenge.MaxParticipants} participants, making it a fierce competition where only the best will rise to the top.`
      : "Challenge yourself or gather your friends and rivals to see who truly has what it takes to win.";

    const formattedStartDate = dayjs(startDate).format("MMMM D, YYYY");
    const formattedEndDate = dayjs(endDate).format("MMMM D, YYYY");

    const dateInfo = `Mark your calendars! The challenge kicks off on ${formattedStartDate} and runs until ${formattedEndDate}.`;

    const sideBetsInfo = challenge.AllowSideBets
      ? "Feeling confident? Side bets are enabled, so you can raise the stakes and prove your dominance."
      : "This is a pure test of skill—no side bets allowed this time.";

    const encouragement =
      "Sharpen your strategies, bring your A-game, and get ready to compete in a contest like no other. Whether you're aiming for glory, rewards, or just to prove a point, this challenge is your battleground.";

    const callToAction =
      "Don't miss out on this opportunity to claim your spot among the elite. Join now and let the competition begin!";

    return `${
      challenge.ChallengeName || "The Ultimate Challenge"
    } has been created! ${gameTypeDescription} ${participantInfo} ${callToAction}`;
  };
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const [startTime, setStartTime] = useState(
    new Date(Date.now() + 10 * 60 * 1000)
  );
  const [isPopupWithLinkVisible, setIsPopupWithLinkVisible] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [sharableLink, setSharableLink] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingDesc, setLoadingDesc] = useState(false);
  const [endTime, setEndTime] = useState(new Date(Date.now() + 10 * 60 * 1000));
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [selectedUnit, setSelectedUnit] = useState("calories");
  const [inputValue, setInputValue] = useState("");

  const suffix = selectedUnit === "calories" ? "kcal" : "steps";

  const onChangeStartDate = (event, selectedDate) => {
    if (selectedDate) {
      const currentDate = new Date(selectedDate);
      setStartDate(currentDate);
      setShowStartDatePicker(false);

      // Update the start date with combined date and time
      const combinedStartDate = combineDateAndTime(currentDate, startTime);
      handleRequest("StartDate", combinedStartDate);

      // Check if the start date/time is equal to the end date/time
      validateDateRange(
        combinedStartDate,
        combineDateAndTime(endDate, endTime)
      );
    }
  };

  const onChangeStartTime = (event, selectedTime) => {
    if (selectedTime) {
      const currentTime = new Date(selectedTime);
      setStartTime(currentTime);
      setShowStartTimePicker(false);

      // Update the start date with combined date and time
      const combinedStartTime = combineDateAndTime(startDate, currentTime);
      handleRequest("StartDate", combinedStartTime);

      // Check if the start date/time is equal to the end date/time
      validateDateRange(
        combinedStartTime,
        combineDateAndTime(endDate, endTime)
      );
    }
  };

  const onChangeEndDate = (event, selectedDate) => {
    if (selectedDate) {
      const currentDate = new Date(selectedDate);
      setEndDate(currentDate);
      setShowEndDatePicker(false);

      // Update the end date with combined date and time
      const combinedEndDate = combineDateAndTime(currentDate, endTime);
      handleRequest("EndDate", combinedEndDate);

      // Check if the start date/time is equal to the end date/time
      validateDateRange(
        combineDateAndTime(startDate, startTime),
        combinedEndDate
      );
    }
  };

  const onChangeEndTime = (event, selectedTime) => {
    if (selectedTime) {
      const currentTime = new Date(selectedTime);
      setEndTime(currentTime);
      setShowEndTimePicker(false);

      // Update the end date with combined date and time
      const combinedEndTime = combineDateAndTime(endDate, currentTime);
      handleRequest("EndDate", combinedEndTime);

      // Check if the start date/time is equal to the end date/time
      validateDateRange(
        combineDateAndTime(startDate, startTime),
        combinedEndTime
      );
    }
  };

  // Function to validate the date range and update errors accordingly
  const validateDateRange = (startDateTime, endDateTime) => {
    if (startDateTime.getTime() === endDateTime.getTime()) {
      setFormErrors((prev) => ({
        ...prev,
        dateError: "Start and end dates cannot be the same.",
      }));
    } else if (startDateTime > endDateTime) {
      setFormErrors((prev) => ({
        ...prev,
        dateError: "Start date cannot be after the end date.",
      }));
    } else {
      setFormErrors((prev) => ({ ...prev, dateError: "" }));
    }
  };

  // Utility function to combine date and time
  const combineDateAndTime = (date, time) => {
    const combined = new Date(date);
    combined.setHours(time.getHours());
    combined.setMinutes(time.getMinutes());
    combined.setSeconds(0);
    combined.setMilliseconds(0);
    return combined;
  };

  const getCustomChallengeDescription = (itemId) => {
    console.log(itemId);
    for (const category of categories) {
      const foundItem = category.items.find((item) => item.gameType === itemId);
      if (foundItem) {
        console.log("found = ", foundItem);
        return foundItem.description;
      }
    }
    return "Join this challenge and showcase your skills!";
  };
  const NFTDesc = async (prompt) => {
    try {
      setLoadingDesc(true);
      const responseDes = await generateDescription({
        prompt,
        participation_type: null,
        result_type: null,
        additional_info: null,
      });
      console.log(responseDes);
      handleRequest("ChallengeDescription", responseDes);
      return responseDes;
    } catch (error) {
      setErrorAi(true);
      console.error("Error in NftImage:", error);
      return null;
    } finally {
      setErrorAi(false);
      setLoadingDesc(false);
    }
  };
  const NftImage = async (prompt) => {
    try {
      setLoadingAi(true);
      const response = await generateImage({ prompt });

      if (response) {
        // If the response is valid, proceed to set the image and update Media
        setAiImage(response);
        console.log(response);
        handleRequest("Media", response);
      } else {
        // If response is not valid, log a message and skip Media update
        console.warn("NFT image not produced, skipping Media update.");
      }

      // Uncomment if you want to generate a description as well
      // const responseDes = await generateDescription({
      //   prompt,
      //   participation_type: null,
      //   result_type: null,
      //   additional_info: null,
      // });
      // console.log(responseDes);
    } catch (error) {
      setErrorAi(true);
      console.error("Error in NftImage:", error);
    } finally {
      setErrorAi(false);
      setLoadingAi(false);
    }
  };

  //validate fields
  const validateChallengeName = (name) => {
    if (!name || name.length < 1) {
      return "Challenge name cannot be empty.";
    }
    return "";
  };
  //create request
  const validateForm = () => {
    let isValid = true;
    const errors = {};

    // Challenge Name validation
    if (!challenge.ChallengeName) {
      errors["challengeName"] = "Challenge Name is required";
      isValid = false;
    }

    // Challenge Type validation (assuming challenge.participationType is set properly)
    if (!challenge.participationType) {
      errors["participationType"] = "Challenge Type is required";
      isValid = false;
    }

    // Start Date and Time validation
    if (!startDate || !startTime) {
      errors["startDateTime"] = "Start Date and Time are required";
      isValid = false;
    } else {
      const startDateTime = combineDateAndTime(startDate, startTime).getTime();
      const currentDateTime = new Date().getTime();
      if (startDateTime <= currentDateTime) {
        errors["startDateTime"] =
          "Start Date and Time should be after current time";
        isValid = false;
      }
    }

    // End Date and Time validation
    if (!endDate || !endTime) {
      errors["endDateTime"] = "End Date and Time are required";
      isValid = false;
    } else {
      const endDateTime = combineDateAndTime(endDate, endTime).getTime();
      const startDateTime = combineDateAndTime(startDate, startTime).getTime();
      if (endDateTime <= startDateTime) {
        errors["endDateTime"] =
          "End Date and Time should be after Start Date and Time";
        isValid = false;
      }
    }

    // Minimum Participants validation
    // if (!challenge.minParticipants || challenge.minParticipants < 1) {
    //   errors["minParticipants"] = "Minimum Participants must be at least 1";
    //   isValid = false;
    // }

    // // Maximum Participants validation
    // if (
    //   !challenge.maxParticipants ||
    //   challenge.maxParticipants < challenge.minParticipants
    // ) {
    //   errors["maxParticipants"] =
    //     "Maximum Participants must be greater than Minimum Participants";
    //   isValid = false;
    // }

    // Join with validation
    console.log(wagerAmount);
    if (!wagerAmount || isNaN(parseFloat(wagerAmount))) {
      errors.wagerAmount = "Join With Required";
      isValid = false;
    }
    setWagerAmountError(errors.wagerAmount || "");

    setFormErrors(errors);
    return isValid;
  };

  const [isPopupVisibleChallengeVisible, setIsPopupVisibleChallengeVisible] =
    useState(false);
  const handleCreateNow = async () => {
    setLoadingCreateChallengeRequest(true);
    setStep(0);
    const isValid = validateForm();

    let adjustedMaxParticipants = challenge.maxParticipants;
    if (challenge.participationType === "1") {
      adjustedMaxParticipants = 2;
    } else if (challenge.participationType === "0") {
      adjustedMaxParticipants = 1;
    }
    if (!isValid) {
      setLoadingCreateChallengeRequest(false);
      console.log("Form validation failed, please check the fields.");
      return;
    }

    console.log(challenge.gameType);
    const gameID = getGameId(challenge.participationType, challenge.gameType);
    console.log(gameID);
    // const customDescription = getCustomChallengeDescription(challenge.gameType);
    // console.log(customDescription);
    let request = {
      ChallengeName: challenge.ChallengeName,
      ChallengeDescription: challenge.ChallengeDescription,
      StartDate: combineDateAndTime(startDate, startTime).getTime(),
      EndDate: combineDateAndTime(endDate, endTime).getTime(),
      GameID: gameID ? gameID : challenge.GameID,
      MaxParticipants: adjustedMaxParticipants,
      Wager: parseFloat(wagerAmount) ?? 0,
      Target: parseInt(challenge.Target, 10) || 100,
      AllowSideBets: false,
      Unit: challenge.Unit,
      IsPrivate: isPrivate,
      ChallengeCategory: selectedCategory,
      Currency: challenge.Currency ?? "SOL",
      Media: challenge.Media,
      NFTMedia: challenge.Media,
      // Slug: "challenge-slug"
    };

    setChallenge(request);
    console.log("REQUEST✨", request);

    try {
      const output = await createChallengeAPI(request);
      console.log("output =  ", output);

      if (output) {
        if (isPrivate) {
          setSharableLink(output.data.Slug);
          setIsPopupWithLinkVisible(true);
        }
        if (challenge.participationType != "0") {
          handleOk();
        }

        // If the challenge is dare-based, proceed to join the creator
        if (challenge.participationType === "0") {
          console.log(
            "Dare-based challenge detected. Creator joining...cHALLENGE BODY",
            output
          );
          console.log("OUTPUT DATA", output.data);

          //wallet addition

          // if (!wallet.publicKey) {
          //   console.error("No wallet public key available.");
          //   return;
          // }
          // await handleJoinNow(output.data, output.data.Currency);
        }
        console.log("output.data.Slug ", output.data.Slug);
        navigation.navigate("ChallengeDetail", {
          ChallengeID: output.data.ChallengeID,
          share: true,
          isPrivate: isPrivate,
          slug: output.data.Slug,
        });
      }
      setIsPopupVisibleChallengeVisible(false);
      setIsPopupVisible(false);
    } catch (error) {
      console.log("Error creating challenge:", error);
      console.error("Error creating challenge:", error);
    }
  };
  const handleClosePreviewPopup = () => {
    setIsPreviewPopupVisible(false);
  };
  const handleOpenPreviewPopup = () => {
    setIsPopupVisible(false);
    setIsPopupVisibleChallengeVisible(true);
  };
  //min-max
  const handleRequest = (field, value) => {
    console.log(field, " : ", value);
    console.log(challenge);
    setChallenge((prevChallenge) => {
      let newChallenge = { ...prevChallenge, [field]: value };

      if (field === "participationType" && value === "2") {
        newChallenge.minParticipants = Math.max(
          newChallenge.minParticipants,
          2
        );
        newChallenge.maxParticipants = Math.max(
          newChallenge.maxParticipants,
          2
        );
      } else if (field === "participationType" && value === "1") {
        // multiplayer
        newChallenge.minParticipants = 2;
        newChallenge.minParticipants = Math.max(
          newChallenge.minParticipants,
          2
        );
        newChallenge.maxParticipants = 2;
        newChallenge.maxParticipants = Math.max(
          newChallenge.maxParticipants,
          2
        );
      } else if (field === "participationType" && value === "0") {
        newChallenge.minParticipants = 1;
        newChallenge.minParticipants = Math.max(
          newChallenge.minParticipants,
          1
        );
        newChallenge.maxParticipants = 1;
        newChallenge.maxParticipants = Math.max(
          newChallenge.maxParticipants,
          1
        );
      }

      return newChallenge;
    });
  };
  //popup-request
  const handleClosePopup = () => {
    setIsPopupVisible(false);
    // setIsPopupVisibleChallengeVisible(true);
    // setIsOk(false);
    // navigation.navigate("Explore");
  };
  const handleCloseChallengePopup = () => {
    setIsPopupVisibleChallengeVisible(false);
    // setIsPopupVisible(true);
    // setIsOk(false);
    // navigation.navigate("Explore");
  };
  const handleOk = () => {
    setIsPopupVisibleChallengeVisible(false);
    setIsPopupVisible(false);
    setIsOk(false);
    setFormStep(1);
    setWagerAmount(0);
    setChallenge({
      ChallengeName: "",
      ChallengeDescription: "",
      StartDate: 0,
      EndDate: 0,
      GameID: 0,
      Wager: 0,
      Target: 100,
      ChallengeCreator: 0,
      participationType: "0",
      gameType: 0,
      Unit: "",
      minParticipants: 2,
      maxParticipants: 2,
      Media: "",
      winningUnit: "",
      ChallengeCategory: "",
      Currency: "",
      NFTMedia: "",
    });
    setIsPreviewPopupVisible(false);
    setLoadingCreateChallengeRequest(false);
    setIsPrivateState(false);
    // navigation.navigate("Explore");
  };
  return (
    <SafeAreaView className="h-full w-full bg-white">
      <View className="h-[40px] flex flex-row  bg-white">
        {/* back button placement */}
        <TouchableOpacity
          className="w-[10%] flex items-center justify-center"
          onPress={() => {
            if (formStep > 1) {
              if (
                formStep === 3 &&
                selectionIndex !== null &&
                categories[selectionIndex].name === "Custom Challenge"
              ) {
                console.log("Navigating back by two steps");
                setFormStep(formStep - 2);
              } else {
                setChallenge({
                  ChallengeName: "",
                  ChallengeDescription: "",
                  StartDate: startDate,
                  EndDate: endDate,
                  GameID: 0,
                  Wager: 0,
                  Target: 100,
                  Unit: "",
                  ChallengeCreator: 0,
                  participationType: "0",
                  gameType: 0,
                  minParticipants: 2,
                  maxParticipants: 2,
                  Media: "",
                  winningUnit: "",
                  ChallengeCategory: "",
                  Currency: "",
                  NFTMedia: "",
                });
                console.log("Navigating back by one step");
                setFormStep(formStep - 1);
              }
            } else if (formStep === 1) {
              navigation.navigate("Explore");
            }
          }}
        >
          {formStep >= 1 && (
            <Image source={back} className="h-[26px] w-[26px]" />
          )}
        </TouchableOpacity>

        {/* progress bars */}

        <View className="w-[90%] flex flex-row gap-[1.5%] items-center justify-center">
          <View
            className={`w-[31%] bg-[#A3C426]  h-[4px] rounded-[8px]`}
          ></View>
          <View
            className={`w-[31%] bg-[${
              formStep >= 2 ? "#A3C426" : "#f9f8f6"
            }] h-[4px] rounded-[8px]`}
          ></View>
          <View
            className={`w-[31%] bg-[${
              formStep >= 3 ? "#A3C426" : "#f9f8f6"
            }] h-[4px] rounded-[8px]`}
          ></View>
        </View>
      </View>
      {/* Form Headers */}
      <View className=" flex justify-center px-3 ">
        {/* {formStep === 1 && (
          <>
            <Text className="font-runs text-[20px]"> Select the category</Text>
            <Text className="text-[12px] text-[#9F9F9F] px-1 mt-1">
              {" "}
              Pick one to get started or create your own.
            </Text>
          </>
        )} */}
        {formStep === 1 && (
          <>
            <Text numberOfLines={1} className="font-runs text-[20px]">
              Choose a Category
            </Text>
            <Text className="text-[12px] text-[#9F9F9F] px-1 mt-1">
              {" "}
              Pick one & fill in the additional details to create a challenge.
            </Text>
          </>
        )}
        {formStep === 2 && (
          <>
            {/* <Text className="font-runs text-[20px]"> You’re almost done</Text>
            <Text className="text-[12px] text-[#9F9F9F] px-1 mt-1">
              {" "}
              Fill these details and take your challenge live.{" "}
            </Text> */}
          </>
        )}
      </View>

      {formStep === 1 && (
        <ScrollView>
          {formStep === 1 && (
            <CategoryList
              categories={categories}
              setSelectedCategory={setSelectedCategory}
              // selectionIndex={selectionIndex}
              setFormStep={setFormStep}
              handleRequest={handleRequest}
              setChallenge={setChallenge}
            />
          )}
        </ScrollView>
      )}

      {/*Sub-Category Cards */}
      {formStep === 2 && (
        <ScrollView className="flex flex-col mx-3">
          <ChallengeDetails
            setIsPrivate={setIsPrivate}
            setShowEndTimePicker={setShowEndTimePicker}
            showEndTimePicker={showEndTimePicker}
            challenge={challenge}
            selectedCategory={selectedCategory}
            setChallenge={setChallenge}
            handleRequest={handleRequest}
            validateChallengeName={validateChallengeName}
            setChallengeNameError={setWagerAmountError}
            formErrors={formErrors}
            showStartDatePicker={showStartDatePicker}
            setShowEndDatePicker={setShowEndDatePicker}
            setShowStartDatePicker={setShowStartDatePicker}
            showStartTimePicker={showStartTimePicker}
            setShowStartTimePicker={setShowStartTimePicker}
            startDate={startDate}
            showEndDatePicker={showEndDatePicker}
            setStartDate={setStartDate}
            startTime={startTime}
            // showEndTimePicker={showEndTimePicker}
            setStartTime={setStartTime}
            endDate={endDate}
            setEndDate={setEndDate}
            endTime={endTime}
            setEndTime={setEndTime}
            onChangeStartDate={onChangeStartDate}
            onChangeStartTime={onChangeStartTime}
            onChangeEndDate={onChangeEndDate}
            onChangeEndTime={onChangeEndTime}
          />
          <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
              <WagerDetails
                wagerAmount={wagerAmount}
                setWagerAmount={setWagerAmount}
                wagerAmountError={wagerAmountError}
                userDetails={userDetails}
                setWagerAmountError={setWagerAmountError}
                truncateAndMaskWalletAddress={truncateAndMaskWalletAddress}
                credit={credit}
                info={info}
                setChallenge={setChallenge}
                challenge={challenge}
              />
            </View>
          </GestureHandlerRootView>
          {/* <Popup /> */}

          <ShadowButton
            onPress={async () => {
              const isValid = validateForm();
              if (isValid) {
                setFormErrors({});

                if (selectedCategory === "Fitness") {
                  setIsPopupVisibleChallengeVisible(true);
                } else {
                  setIsPopupVisible(true);
                }
                await NftImage(challenge.ChallengeName);

                const prompt = `Challenge: ${challenge.ChallengeName}, Game Type: ${challenge.gameType}, Max Participants: ${challenge.maxParticipants}`;

                try {
                  const aiDescription = await NFTDesc(prompt);

                  if (aiDescription) {
                    setChallenge((prevChallenge) => ({
                      ...prevChallenge,
                      ChallengeDescription: aiDescription,
                    }));
                  } else {
                    const defaultDescription = generateDefaultDescription(
                      challenge,
                      startDate,
                      endDate
                    );
                    console.log(defaultDescription);
                    setChallenge((prevChallenge) => ({
                      ...prevChallenge,
                      ChallengeDescription: defaultDescription,
                    }));
                    console.log(
                      "Challenge Description set from default generator"
                    );
                  }
                } catch (error) {
                  console.error("Error fetching description:", error);
                }
                if (step !== 2) {
                  if (selectedCategory === "Fitness") {
                    console.log("Fitness category detected, setting step to 2");
                    setStep(2);
                  } else {
                    console.log(
                      "Non-Fitness category detected, keeping current step"
                    );
                  }
                }

                console.log("Step value after update:", step);
              } else {
                // Scroll to top if form has errors
                // scrollViewRef.current.scrollTo({ y: 0, animated: true });
                console.log("SCROLL TO UP hona chaiye");
              }
            }}
            title="Continue"
          >
            <Text className="font-bold">Publish Challenge</Text>
          </ShadowButton>

          {isPopupVisible && (
            <NFTpopUp
              isVisible={isPopupVisible}
              onClose={handleClosePopup}
              proceed={handleOpenPreviewPopup}
              challenge={challenge}
              setChallenge={setChallenge}
            />
          )}
          <ChallengePopup
            visible={isPopupVisibleChallengeVisible}
            onClose={handleCloseChallengePopup}
            publish={async () => {
              await handleCreateNow();
              handleOk();
            }}
            challenge={challenge}
            setChallenge={setChallenge}
          />
          {/* <Popup isVisible={isPopupVisible} onClose={handleClosePopup}>
            {!isOk ? (
              <>
                <View className="bg-[#00cc00] rounded-full p-3 mt-10">
                  <MaterialIcons name="done" size={60} color="white" />
                </View>
                <Text className=" mt-6 mb-2  text-bolder">
                  Challenge Created Successfully!
                </Text>
                {!isPrivateState && <Text className="font-inter font-normal text-xs mx-1 leading-5 text-center text-gray-700">
                  Fees has been deducted from your credits
                </Text>}
                {isPrivateState && sharableSlug && (
        <>
          <Text className="font-normal text-xs mx-6 leading-5 text-center text-gray-700">
            🚨 Save this Code or this Pvt challenge can get lost🍃 for forever♾️
          </Text>
          <View                     className=" py-3 mt-4 mx-4 border  flex items-center bg-black border-gray-300 rounded-full "
>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <Text className="ml-10" style={{ color: 'white' }}>Shareable Slug:</Text>
        <Text style={{ textDecorationLine: 'underline', color: 'white', marginLeft: 5 }}>{sharableSlug}</Text>
        <TouchableOpacity
          style={{ flex: 1, flexDirection: 'row', marginLeft:8  }}
          onPress={handleCopyLink}
        >
          {isCopied ? (
            <MaterialIcons name="check" size={20} color="green" />
          ) : (
            <MaterialIcons name="content-copy" size={20} color="white" />
          )}
          <Text style={{ color: 'white', marginLeft: 5 }}>{isCopied ? 'Copied' : 'Copy'}</Text>
        </TouchableOpacity>
      </View>
    </View>
        </>
      )}
                <View className="w-full">
                  <TouchableOpacity
                    className=" py-3 m-4 border  flex items-center border-gray-300 rounded-full mb-8"
                    onPress={handleOk}
                  >
                    <Text className="text-black">Okay</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Image
                  className="h-24 w-24 mt-10 "
                  source={CreatedChallengeIcon}
                />
                <Text className="text-xl my-2  font-bold ">
                  {" "}
                  {userDetails.User.Credits} Credits
                </Text>
                <Text className="font-inter font-normal text-xs mx-1 mb-8 text-center text-gray-700">
                  Available in your wallet now.
                </Text>
                <View className="flex flex-row mb-10 justify-center items-start px-2 gap-2 w-[344px] h-[48px]">
                  <TouchableOpacity
                    className="flex flex-row justify-center items-center py-[24px] px-[24px]  w-[160px] h-[48px] bg-black border border-gray-300 rounded-full flex-grow"
                    onPress={handleClosePopup}
                  >
                    <Text className=" h-[25px] font-inter font-semibold text-[14px]  text-white ">
                      Add Credits
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex flex-row justify-center items-center py-[24px] px-[24px]  w-[160px] h-[48px] bg-white border border-gray-300 rounded-full "
                    onPress={handleClosePopup}
                  >
                    <Text className=" h-[25px] font-inter font-semibold text-[14px] text-gray-900 ">
                      Okay
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Popup> */}
        </ScrollView>
      )}

      {/* Challenge Detail Form */}
      {formStep === 3 && <View></View>}
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  pickerContainer: {
    borderColor: "#BAC7D5",
    borderWidth: 1,
    borderRadius: 4,
    overflow: "hidden",
    height: 48,
    justifyContent: "center",
    marginTop: 8,
  },
  picker: {
    color: "#252A31",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default CreateChallenge;
