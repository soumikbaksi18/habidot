import React, { useState, useRef, useEffect } from "react";
import bs58 from "bs58";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  Share,
  Modal,
  Dimensions,
  Linking,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import {
  sendTransaction,
  sendTransactionNew,
} from "../utils/onchainTransaction";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useSolPrice from "../hooks/useSolPrice";
import chalengeBackgrond from "../assets/images/challenge_background.png";
import firstPlace from "../assets/images/first_place.png";
import credit from "../assets/images/credit.png";
import money from "../assets/images/money.png";
import full from "../assets/images/full.png";
import bullet from "../assets/images/bullet.png";
import avatar1 from "../assets/images/avatar1.png";
import avatar2 from "../assets/images/avatar2.png";
import avatar from "../assets/images/avatar.png";
import styles from "../styles/styles";
import JoinChallengeIcon from "../assets/images/3xCredit.png";
import SlideToConfirm from "../components/SlideToConfirm";
import ProgressBar from "react-native-progress/Bar";
import Popup from "../components/Popup";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import useUserDetails from "../hooks/useUserDetails";
import useUserChallenges from "../hooks/useUserChallenge";
import {
  joinChallengeAPI,
  joinChallengeWithTokensUsingDeeplink,
  joinChallengeWithTokensUsingOkto,
} from "../utils/Apicalls";
import back from "../assets/images/back.png";
// import share from "../assets/images/share.png";

import { getShareableChallengeLink } from "../utils/Apicalls";
import useChallengeById from "../hooks/useChallengeById";
import ShadowButton from "../components/FormChallenge/ShadowButton";
import Animated from "react-native-reanimated";

import InvitePopUp from "../components/Explore/InvitePopUp";
import SlugInvitePopUp from "../components/Explore/SlugInvitePopUp";

import Clipboard from "@react-native-clipboard/clipboard";
import {
  DEEP_LINK_FUNCTIONS,
  LOCALSTORAGE_ITEMS,
  VERIFIED_CURRENCY,
  VIEW_TYPE,
} from "../utils/enums";
import { encryptPayload } from "../components/Deeplinks/helperFunctions";
import { buildUrl } from "../components/Deeplinks/buildUrl";
import { useOkto } from "okto-sdk-react-native";
Clipboard;
const { width, height } = Dimensions.get("window");
const ChallengeDetail = ({ route, navigation }) => {
  const [transactionSuccess, setTransactionSuccess] = useState(false);

  const { challenge: ch } = route.params;

  const ChallengeID = route.params?.ChallengeID;
  const share = route.params?.share;
  const isPrivate = route.params?.isPrivate;
  const slug = route.params?.slug;

  const { challenges: challenge } = useChallengeById(
    ch?.ChallengeID ?? ChallengeID
  );

  console.log("challenges ", challenge);
  const [sharePopUp, setSharePopUp] = useState(share ?? false);
  const [shareLinkPopup, setShareLinkPopUp] = useState(false);
  const handleShareLinkPopUp = () => {
    setShareLinkPopUp(false);
  };
  const { userDetails, error, fetchUserDetails } = useUserDetails();
  const { solPrice, convertCreditsToUSDT, convertCreditsToSOL } = useSolPrice();
  const [sliderState, setSliderState] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [descriptionLines, setDescriptionLines] = useState(0);
  const descriptionRef = useRef(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isErrorPopupVisible, setIsErrorPopupVisible] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const { challenges, isLoading } = useUserChallenges();
  // console.log("✨API CALL CHALLENGE OBJ", (challenge.GameType || challenge.Game.GameType === 3 || challenge.GameType || challenge.Game.GameType === "Validator"));
  // console.log("💯ROUTE CHALLANGE ", challenge.ChallengeCreator.UserID);
  const [isChallengeCreator, setIsChallengeCreator] = useState(
    challenge?.ChallengeCreator?.UserID || ""
  );
  const [active, setActive] = useState([]);
  const [loading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoadingIndicator, setIsLoadingIndicator] = useState(false);
  const [shareableLink, setShareableLink] = useState("");
  const {
    getWallets,
    getPortfolio,
    executeRawTransactionWithJobStatus,
    createWallet,
  } = useOkto();

  const [oktoWallet, setOktoWallet] = useState();

  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.measure((x, y, width, height) => {
        const lines = Math.ceil(height / 18);
        setDescriptionLines(lines);
      });
    }
  }, [challenge?.ChallengeDescription]);
  const calculateTotalParticipants = () => {
    const playersJoined =
      challenge?.Players?.length || challenge?.ParticipantsJoined || 0;

    switch (challenge?.Game?.ParticipationType) {
      case 0:
        return 1;
      case 1:
        return 2;
      case 2:
        if (playersJoined < 50) return 50;
        if (playersJoined >= 50 && playersJoined < 70) return 70;
        if (playersJoined >= 70 && playersJoined < 150) return 150;
        return 300;
      default:
        return challenge?.MaxParticipants;
    }
  };
  const [isFullScreenImageVisible, setIsFullScreenImageVisible] =
    useState(false);

  const totalParticipants = calculateTotalParticipants();

  const joinChal = async () => {
    try {
      setIsLoadingIndicator(true);
      console.log("Creating player in the backend first");
      const view = await AsyncStorage.getItem("VIEW_TYPE");

      console.log(view);
      if (view === VIEW_TYPE.OKTO_WALLET_VIEW) {
        const wallets = await getWallets();
        console.log(wallets);
        if (!wallets || wallets.wallets.length === 0) {
          console.log("No Okto wallets connected. Redirecting to login.");
          handleRelogin();
          return;
        }

        const solanaDevnetWallet = wallets.wallets.find(
          (wallet) => wallet.network_name === "SOLANA" // TODO: remove SOL_DEVNET for mainnet
        );

        if (!solanaDevnetWallet) {
          console.error("No SOLANA_DEVNET wallet found. Redirecting to login.");
          handleRelogin();
          return;
        }

        console.log("Using Okto Wallet:", solanaDevnetWallet);
        const portFolio = await getPortfolio();
        console.log("portFolio ", portFolio);

        const devnetResponse = await joinChallengeWithTokensUsingOkto(
          challenge,
          solanaDevnetWallet.address,
          portFolio
        );
        console.log("devnetResponse ", devnetResponse);
        if (devnetResponse.onChainResponse?.status === "SUCCESS") {
          navigation.navigate("Leaderboard", { challenge });
          console.log(
            "Transaction successful on SOLANA_DEVNET, halting further processing."
          );
          return { status: "SUCCESS", data: devnetResponse };
        }
        return challenge.Currency === VERIFIED_CURRENCY.CREDITS
          ? await joinChallengeAPI(challenge)
          : devnetResponse;
      } else if (view === VIEW_TYPE.DEEP_LINK_VIEW) {
        const dappKeyPair = await (async () => {
          const storedDappKeyPair = await AsyncStorage.getItem(
            LOCALSTORAGE_ITEMS.DAPP_KEY_PAIR
          );
          console.log("Stored Dapp KeyPair:", storedDappKeyPair); // Log stored keypair
          if (storedDappKeyPair) {
            const parsedKeyPair = JSON.parse(storedDappKeyPair);
            console.log("Parsed Dapp KeyPair:", parsedKeyPair); // Log parsed keypair
            return {
              publicKey: new Uint8Array(Object.values(parsedKeyPair.publicKey)),
              secretKey: new Uint8Array(Object.values(parsedKeyPair.secretKey)),
            };
          } else {
            const newKeyPair = nacl.box.keyPair();
            await AsyncStorage.setItem(
              LOCALSTORAGE_ITEMS.DAPP_KEY_PAIR,
              JSON.stringify({
                publicKey: Array.from(newKeyPair.publicKey),
                secretKey: Array.from(newKeyPair.secretKey),
              })
            );
            console.log("Generated new Dapp KeyPair:", newKeyPair);
            return newKeyPair;
          }
        })();

        const session = await AsyncStorage.getItem(LOCALSTORAGE_ITEMS.SESSION);
        const sharedSecretStr = await AsyncStorage.getItem(
          LOCALSTORAGE_ITEMS.SHARED_SECRET
        );
        const sharedSecret = sharedSecretStr
          ? new Uint8Array(JSON.parse(sharedSecretStr))
          : null;

        console.log("Session:", session); // Log session
        console.log("Shared Secret:", sharedSecret); // Log shared secret

        if (!session || !sharedSecret) {
          console.error(
            "Session or shared secret missing, redirecting to login."
          );
          return;
        }

        const walletAddress = await AsyncStorage.getItem(
          LOCALSTORAGE_ITEMS.WALLET_ADDRESS
        );
        console.log("Wallet Address:", walletAddress);
        if (!walletAddress) {
          console.error(
            "No wallet address found in localStorage. Redirecting to login."
          );
          return;
        }

        const { apidata, onChainResponse } =
          await joinChallengeWithTokensUsingDeeplink(challenge, walletAddress);
        console.log("OnChainResponse:", onChainResponse); // Log on-chain response

        // Serialize transaction with `requireAllSignatures` set to false
        const serializedTransaction = onChainResponse.serialize({
          requireAllSignatures: false,
        });
        console.log("Serialized Transaction:", serializedTransaction); // Log serialized transaction

        // Prepare payload before encryption
        const payload = {
          session,
          transaction: bs58.encode(serializedTransaction),
        };
        console.log("Payload before encryption:", payload); // Log payload before encryption

        const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);
        console.log("Nonce:", nonce); // Log nonce
        console.log("Encrypted Payload:", encryptedPayload); // Log encrypted payload

        const params = new URLSearchParams({
          dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
          nonce: bs58.encode(nonce),
          redirect_link: `catoff://challenge/${challenge.id}`, // Use challenge.id instead of param.id
          payload: bs58.encode(encryptedPayload),
        });

        console.log("Generated URL params:", params); // Log URL params

        const url = buildUrl(
          DEEP_LINK_FUNCTIONS.SIGN_AND_SEND_TRANSACTION,
          params
        );
        console.log("Deeplink URL:", url); // Log deeplink URL
        Linking.openURL(url);
        if (!apidata || !apidata.success) {
          setMessage("Transaction failed on-chain.");
          setIsErrorPopupVisible(true);
          return;
        } else {
          console.log(
            "Transaction was successful, player fully joined challenge"
          );
          setIsJoined(true);
          setIsPopupVisible(true);
          navigation.navigate("Leaderboard", { challenge });
        }
      }

      // Assuming joinChallengeWithTokensUsingDeeplink returns a success status
    } catch (error) {
      console.log(error);
      console.error("Error joining challenge:", error);
      setMessage("An error occurred while joining the challenge.", error);
      setIsErrorPopupVisible(true);
    } finally {
      setIsLoadingIndicator(false);
    }
  };

  function truncateText(div, maxLength) {
    if (div.length <= maxLength) return div;
    return div.substr(0, maxLength) + "...";
  }
  useEffect(() => {
    const activeChallenges = challenges.map((item) => item.ChallengeID);
    setActive(activeChallenges);
    console.log(
      "user has joined",
      !active.includes(parseInt(challenge?.ChallengeID))
    );
  }, [challenges]);

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };
  console.log(transactionSuccess);
  const handleJoinNow = async () => {
    try {
      setIsLoadingIndicator(true);
      setIsPopupVisible(true);
    } catch (error) {
      console.error("Error joining challenge:", error);
      setMessage(error.message);
      setIsErrorPopupVisible(true);
    } finally {
      setIsLoadingIndicator(false);
    }
  };

  const handleClosePopup = () => {
    setIsPopupVisible(false);
  };

  const handleCloseErrorPopup = () => {
    setIsErrorPopupVisible(false);
    setIsPopupVisible(false);
  };

  const handleConfirmJoin = async () => {
    await joinChal();
  };
  const handleSharePopUp = () => {
    setSharePopUp(!sharePopUp);
  };
  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("ExploreStack");
    }
  };

  const handleOpenFullScreen = () => {
    try {
      navigation.navigate("fullscreen", {
        media: challenge?.Media,
      });
    } catch (error) {
      console.error("Error navigating to fullscreen:", error);
      Alert.alert("Error", "Failed to open the fullscreen view.");
    }
  };

  const shareLink = () => {
    setSharePopUp(false);
    setShareLinkPopUp(true);

    if (slug) {
      const link = `https://game.catoff.xyz/challenge/${challenge?.ChallengeID}`;
      Clipboard.setString(link);

      // Show an alert confirming the link was copied
      Alert.alert("Link copied to clipboard!");

      // Optionally, if you want to open the link or share it, you can use Linking
      Linking.openURL(link);
    }
  };
  const handleCloseFullScreen = () => {
    setIsFullScreenImageVisible(false);
  };

  const handleShareClick = async () => {
    try {
      const result = await Share.share({
        message: shareableLink,
        url: shareableLink,
        title: "Share the challenge with your friends and family!",
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  // Utility function to get game type string from numeric type
  const getGameTypeString = (gameType) => {
    switch (gameType) {
      case 0:
        return "Step Based";
      case 1:
        return "Calorie Based";
      case 2:
        return "Proof Based";
      case 3:
        return "Validator Based";
      case 4:
        return "Voting Based";
      default:
        return "";
    }
  };

  const getParticipationTypeString = (participationType) => {
    switch (participationType) {
      case 0:
        return "Dare a Player";
      case 1:
        return "Versus a Player";
      case 2:
        return "Multiplayer";
      default:
        return "";
    }
  };

  const getCategoryString = (gameType) => {
    switch (gameType) {
      case 0:
      case 1:
        return "Fitness";
      case 2:
        return "Proof";
      case 3:
        return "Validator";
      case 4:
        return "Voting";
      default:
        return "";
    }
  };
  const numericWagerAmount = totalParticipants * challenge?.Wager || 0; // Check if the input is always a string
  let convertedWagerAmount;
  const wagerInUSDT = convertCreditsToUSDT(numericWagerAmount);

  if (challenge && challenge.Currency === "SOL") {
    convertedWagerAmount = convertCreditsToSOL(numericWagerAmount);
  } else if (challenge && challenge.Currency === "CREDITS") {
    convertedWagerAmount = wagerInUSDT;
  } else {
    convertedWagerAmount = numericWagerAmount;
  }

  const formattedConvertedWagerAmount = !isNaN(convertedWagerAmount)
    ? parseFloat(convertedWagerAmount).toFixed(2)
    : "0.00";
  // const totalParticipants = calculateTotalParticipants();
  const totalPrizePool = challenge?.Wager
    ? totalParticipants * (challenge?.Wager || 0)
    : (challenge?.WagerStaked || 0) * totalParticipants;

  // console.log("formatted amount", formattedConvertedWagerAmount);
  const isChallengeOver = ["COMPLETED", "CANCELLED", "NO_WINNER"].includes(
    challenge?.State
  );
  const handleShareBlink = () => {
    const baseUrl =
      "https://dial.to/devnet?action=solana-action%3Ahttps://join.catoff.xyz/api/actions/join-challenge";
    const fullUrl = `${baseUrl}?challengeID=${challenge?.ChallengeID}`;

    Linking.openURL(fullUrl).catch((err) =>
      console.error("An error occurred", err)
    );
  };
  const isProcessing = ["PROCESSING"].includes(challenge?.State);
  const isChallengeStarted =
    new Date() >= new Date(parseInt(challenge?.StartDate));
  const isMaxParticipantsReached =
    (challenge?.Players?.length || challenge?.ParticipantsJoined || 0) >=
    challenge?.MaxParticipants;

  const formatDateTime = (timestamp) => {
    const date = new Date(parseInt(timestamp));
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("en-GB", options);
  };

  const usdtValue = solPrice
    ? convertCreditsToUSDT(
        challenge?.Wager || challenge?.WagerStaked * challenge?.MaxParticipants
      )
    : null;

  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <View className="flex-1 relative ">
        <ScrollView className="flex-1 w-screen">
          <View className="relative h-60">
            <Animated.Image
              source={
                challenge?.Media ? { uri: challenge?.Media } : chalengeBackgrond
              }
              className="h-64 w-full"
              sharedTransitionTag={`tag-${challenge?.ChallengeID}`}
            />

            <View className="absolute top-2 left-0 right-0">
              <View className="flex-row justify-between items-center my-2 mx-2">
                <TouchableOpacity onPress={handleGoBack}>
                  <Image source={back} />
                </TouchableOpacity>

                <TouchableOpacity onPress={handleShareClick}>
                  <View className="p-2 rounded-full border-[#F7F7F7]">
                    {/* <Image source={share} /> */}
                  </View>
                </TouchableOpacity>
              </View>

              <View className="px-2 flex flex-row justify-between py-2 top-32">
                <View className="flex flex-row justify-between mt-1">
                  <Text className="mr-3 text-white bg-[#00000019] rounded-sm backdrop-blur-[76px] px-2 mt-1 text-xs uppercase leading-6">
                    {getParticipationTypeString(
                      challenge.Game?.ParticipationType
                    ) || challenge?.ParticipationType}
                  </Text>
                  <Text className="mr-3 text-white bg-[#00000019] rounded-sm backdrop-blur-[76px] px-2 mt-1 text-xs uppercase leading-6">
                    {getGameTypeString(challenge.Game.GameType)}
                  </Text>
                  <Text className="mr-3 text-white bg-[#00000019] rounded-sm backdrop-blur-[76px] px-2 mt-1 text-xs uppercase leading-6">
                    {getCategoryString(challenge.Game?.GameType) ||
                      challenge?.GameType}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleOpenFullScreen}
                  style={{ paddingRight: 8 }}
                >
                  <Image
                    source={full}
                    style={{
                      tintColor: "#fff",
                      backgroundColor: "#00000033",
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8,
                      borderBottomRightRadius: 8,
                      borderBottomLeftRadius: 8,
                      width: 32,
                      height: 32,
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View className="mx-4">
            <Text className={`text-3xl mt-8 ${styles.challengeTitle}`}>
              {challenge?.ChallengeName}
            </Text>
            <Text className={`text-xs text-[#576175] ${styles.subtext}`}>
              {isChallengeOver ? (
                <>End {formatDateTime(challenge?.EndDate)}</>
              ) : (
                <>From {formatDateTime(challenge?.StartDate)}</>
              )}
            </Text>
          </View>
          <View className="mx-2 mt-6 bg-[#EFEDFF] rounded-xl">
            <View className="px-4 py-4">
              <View className="flex flex-row justify-between">
                <View className="relative flex flex-row">
                  <View className="relative">
                    <Image
                      className="h-6 w-6 rounded-full object-cover absolute left-0 top-0"
                      source={avatar1}
                    />
                    <Image
                      className="h-6 w-6 rounded-full object-cover absolute left-4 top-0"
                      source={avatar2}
                    />
                    <Image
                      className="h-6 w-6 rounded-full object-cover absolute left-8 top-0"
                      source={avatar1}
                    />
                  </View>
                  <Text className="font-semibold ml-16 my-auto">
                    {challenge?.Players?.length ||
                      challenge?.ParticipantsJoined ||
                      0}{" "}
                    Players joined
                  </Text>
                </View>
                <Text className="my-auto font-semibold">
                  {totalParticipants} Total
                </Text>
              </View>

              <View style={{ width: "100%" }} className="py-2 mt-2">
                <ProgressBar
                  height={10}
                  borderRadius={7.5}
                  color="#917EEC"
                  progress={
                    (challenge?.Players?.length ||
                      challenge?.ParticipantsJoined ||
                      0) / totalParticipants
                  }
                  width={null}
                />
              </View>
              <View className=" mt-6">
                <Text className={`text-base font-medium ${styles.subheading}`}>
                  ABOUT THE CHALLENGE
                </Text>
                <Text
                  ref={descriptionRef}
                  numberOfLines={showFullDescription ? undefined : 3}
                  ellipsizeMode="tail"
                  className={`mt-2 text-base ${styles.paragraph}`}
                >
                  {challenge?.ChallengeDescription}
                </Text>
                {descriptionLines > 3 && (
                  <TouchableOpacity onPress={toggleDescription}>
                    <Text className="mt-1 text-base font-semibold underline underline-offset-8">
                      {showFullDescription ? "Show Less" : "Read More"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <View
                className={
                  "flex flex-row items-center justify-between w-full pt-2 pb-4 px-4 mt-4"
                }
              >
                {/* Left Side */}
                <View className={"flex flex-row items-center space-x-2"}>
                  <View className={"w-10 rounded-full"}>
                    <Image
                      source={avatar}
                      className={"w-10 h-10 rounded-full"}
                    />
                  </View>
                  <View className={"flex flex-col"}>
                    <Text className={"text-sm"}>Creator Name</Text>
                    <Text className={"text-sm font-semibold"}>
                      {truncateText(challenge?.ChallengeCreator?.UserName, 8)}
                    </Text>
                  </View>
                </View>

                {/* Right Side */}
                <View className={"flex flex-row items-center space-x-2"}>
                  <View className={"w-10 rounded-full"}>
                    <Image source={money} className={"w-10 h-10"} />
                  </View>
                  <View className={"flex flex-col"}>
                    <Text className={"text-sm"}>Win</Text>
                    <Text className={"text-sm font-semibold"}>
                      {totalPrizePool} {challenge?.Currency}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* <View className="mx-4 mt-6">
          <Text className={`text-base font-medium ${styles.subheading}`}>
            IMPORTANT NOTES
          </Text>
          <View className="flex flex-row mt-2">
            <View className="my-auto mr-2">
              <Image source={bullet} />
            </View>
            <Text className="my-auto text-base">Outdoor Challenge</Text>
          </View>
          <View className="flex flex-row mt-2">
            <View className="my-auto mr-2">
              <Image source={bullet} />
            </View>
            <Text className="my-auto text-base">
              Tracker Device should be on
            </Text>
          </View>
          <View className="flex flex-row mt-2">
            <View className="my-auto mr-2">
              <Image source={bullet} />
            </View>
            <Text className="my-auto text-base">
              Malpractices will not be encouraged
            </Text>
          </View>
        </View> */}

          <View className="mx-4 mt-10 mb-10 flex flex-col justify-between">
            <View className="flex flex-row px-2 pb-2 justify-between">
              <Text className="text-lg">Join With</Text>
              <Text className="text-lg font-semibold ">
                <Image className="my-auto mr-3" source={credit} />
                {"  "}
                {challenge.Wager || challenge.WagerStaked} {challenge.Currency}
              </Text>
            </View>
            {challenge.State === "CANCELLED" && (
              <TouchableOpacity
                className="px-10 text-center py-3 bg-black rounded-lg"
                disabled
              >
                <Text className="text-[16px] text-center font-semibold text-white">
                  Cancelled
                </Text>
              </TouchableOpacity>
            )}
            {isChallengeOver && challenge.State !== "CANCELLED" && (
              <TouchableOpacity
                className="px-10 py-3 bg-black rounded-lg"
                disabled
              >
                <Text className="text-[16px] font-semibold text-white">
                  Over
                </Text>
              </TouchableOpacity>
            )}
            {!isChallengeOver && userDetails && challenge && (
              <TouchableOpacity
                className="px-8 py-4 bg-black rounded-lg"
                onPress={() => {
                  // handleJoinNow();
                  if (
                    userDetails.User.UserID ===
                      challenge?.ChallengeCreator?.UserID &&
                    (challenge.Game?.GameType === 3 ||
                      challenge.Game?.GameType === "Validator")
                  ) {
                    navigation.navigate("Leaderboard", { challenge });
                  } else if (
                    isJoined ||
                    active.includes(parseInt(challenge.ChallengeID))
                  ) {
                    navigation.navigate("Leaderboard", { challenge });
                  } else {
                    handleJoinNow();
                  }
                }}
              >
                <Text className="text-[16px] text-center font-semibold text-white">
                  {userDetails.User.UserID ===
                    challenge?.ChallengeCreator?.UserID &&
                  (challenge.Game?.GameType === 3 ||
                    challenge.Game?.GameType === "Validator")
                    ? "VALIDATE"
                    : isJoined ||
                      active.includes(parseInt(challenge.ChallengeID))
                    ? "VIEW STATUS"
                    : "JOIN NOW"}
                </Text>
              </TouchableOpacity>
            )}

            <ShadowButton
              onPress={() => console.log("side bets")}
              title="Speculate"
            />
          </View>
          {/* {isFullScreenImageVisible && (
          <Modal
            transparent={true}
            visible={isFullScreenImageVisible}
            onRequestClose={handleCloseFullScreen}
          >
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.8)" }}
              onPress={handleCloseFullScreen}
            >
              <Animated.View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  transform: [{ scale }, { translateY }],
                  opacity,
                }}
              >
                <Image
                  source={
                    challenge.Media
                      ? { uri: challenge.Media }
                      : chalengeBackgrond
                  }
                  style={{ width, height, resizeMode: "contain" }}
                />
              </Animated.View>
            </TouchableOpacity>
          </Modal>
        )} */}
        </ScrollView>

        {/* Popup for confirming join */}
        <Popup isVisible={isPopupVisible} onClose={() => console.log("hellow")}>
          {!isJoined ? (
            <>
              <Image className="h-16 w-16 mt-8" source={JoinChallengeIcon} />
              <Text className="text-3xl my-4 font-bold ">
                {challenge.Wager} {challenge.Currency}
              </Text>
              <Text className="font-inter font-normal text-xs mx-4 leading-5 text-center text-gray-700">
                Put down your Pledge and compete against other players in this
                challenge.
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
                  onSlideConfirmed={async () => {
                    setIsLoadingIndicator(true);
                    await handleConfirmJoin();
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
              <View className="bg-[#00cc00] rounded-full p-3 mt-10">
                <MaterialIcons name="done" size={60} color="white" />
              </View>
              <Text className=" mt-6 mb-2  text-bolder">
                Challenge Joined Successfully!
              </Text>
              <Text className="font-inter font-normal text-xs mx-1 leading-5 text-center text-gray-700">
                Pledge has been deducted from your credits
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
          )}
        </Popup>
        {isErrorPopupVisible && (
          <Popup
            isVisible={isErrorPopupVisible}
            onClose={handleCloseErrorPopup}
          >
            <>
              <View className="bg-[#FFFFFF] rounded-full p-3 mt-10">
                <MaterialCommunityIcons
                  name="close-circle"
                  size={60}
                  color="red"
                />
              </View>
              <Text className=" mt-6 mb-2  text-bolder">
                Challenge Joining Status
              </Text>
              <Text className="font-inter font-normal text-xs mx-1 leading-5 text-center text-gray-700">
                {message}
              </Text>
              <View className="w-full">
                <TouchableOpacity
                  className=" py-3 m-4 border  flex items-center border-gray-300 rounded-full my-8"
                  onPress={() => handleCloseErrorPopup()}
                >
                  <Text className="text-black">Try Again</Text>
                </TouchableOpacity>
              </View>
            </>
          </Popup>
        )}

        <InvitePopUp
          isVisible={sharePopUp}
          onClose={handleSharePopUp}
          handleShareBlink={handleShareBlink}
          shareLink={shareLink}
        />
        {isPrivate ? (
          <SlugInvitePopUp
            isVisible={sharePopUp}
            onClose={handleSharePopUp}
            slug={slug}
            handleShareBlink={handleShareBlink}
            shareLink={shareLink}
          />
        ) : (
          <InvitePopUp
            isVisible={sharePopUp}
            onClose={handleSharePopUp}
            handleShareBlink={handleShareBlink}
            shareLink={shareLink}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default ChallengeDetail;
