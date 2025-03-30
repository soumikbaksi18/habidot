import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { submitClaim, uploadFileApi } from "../utils/Apicalls";
import pirate from "../assets/images/pirate.png";
import feed from "../assets/images/feed.webp";
import Solana from "../assets/tokens/Solana.png";
import ranking from "../assets/images/Ranking.png";
import line from "../assets/images/Line 10.png";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import viewFeed from "../assets/images/viewFeed.png";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import ProgressBar from "react-native-progress/Bar";
import AntDesign from "react-native-vector-icons/AntDesign";
import useUserDetails from "../hooks/useUserDetails";
const Progress = ({
  totalPrizePool,
  setTab,
  type,
  id,
  value,
  wager,
  prize,
  image,
  target,
  totalStaked,
  isavalidator,
  state,
  leaderboard,
  Currency
}) => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [amount, setAmount] = useState(0);
  // const [isavalidator , setIsavalidator] = useState(false);
  const [noofsubmission, setNoofsubmission] = useState(0);
  const [hash, setHash] = useState("");
  const [submissionValid, setSubmissionValid] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { userDetails, loading, error } = useUserDetails();
  const [userID, setUserID] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userSubmissions, setUserSubmissions] = useState([]);
  useEffect(() => {
    console.log("leaderboard     ", leaderboard);
    if (leaderboard?.length > 0 && userID !== null) {
      const userSubmissions = leaderboard.filter((player, index) => {
        console.log(`Index: ${index}`);
        console.log("Player Object:", player);

        const { User, Submission } = player.Player;
        console.log("User Object:", User);
        console.log("UserID:", User.UserID);
        console.log("Current UserID:", userID);

        const isMatch = User.UserID === userID;
        console.log("Is Match:", isMatch);
        console.log("Submission:", Submission);
        const hasSubmission = Boolean(Submission);
        console.log("Has Submission:", hasSubmission);

        return isMatch && hasSubmission;
      });

      const hasSubmitted = userSubmissions.length > 0;
      console.log("USER HAS SUBMITTED??", hasSubmitted);

      setSubmissionValid(hasSubmitted);
      console.log("User Submissions:", userSubmissions);
      setNoofsubmission(userSubmissions.length);
      setUserSubmissions(userSubmissions); // Store the submissions
    } else {
      setSubmissionValid(false);
      setNoofsubmission(0);
      setUserSubmissions([]); // Clear the submissions
    }
  }, [leaderboard, userID]);

  useEffect(() => {
    if (!loading && !error && userDetails) {
      const fetchedUserID = userDetails.User?.UserID;
      // console.log("Fetched User ID:", fetchedUserID);
      setUserID(fetchedUserID);
      setIsLoading(false); // Set isLoading to false after fetching user details
    }
  }, [userDetails, loading, error]);

  const handleUploadMedia = async () => {
    launchImageLibrary({ mediaType: "mixed" }, async (response) => {
      if (!response.didCancel && !response.error) {
        const file = response.assets[0];
        const fileSizeInMB = file.fileSize / (1024 * 1024);

        if (fileSizeInMB > 2) {
          Alert.alert("File size error", "File size should not exceed 2 MB.");
          return;
        }

        const source = { uri: file.uri };
        console.log("upload img === ", source);
        setUploadedImage(source.uri);
        console.log("Uploaded Image URI:", source.uri);

        const output = await uploadFileApi(source.uri);
        // console.log("Upload output:", output);
        if (output && output.Hash) {
          setHash(output.Hash);
          // console.log("Hash value:", output.Hash);
          await makeSubmission(output.Hash);
        } else {
          console.log("Failed to upload image or get hash.");
        }
      } else {
        console.log(
          "Image selection cancelled or error occurred:",
          response.error
        );
      }
    });
  };

  const makeSubmission = async (hashValue) => {
    console.log("ID:", id);
    console.log("Amount:", amount);
    console.log("Hash:", hashValue);
    const submit = await submitClaim(id, amount, hashValue);
    if (submit.success) {
      console.log("Submission successful.");
    } else {
      console.log("Submission failed.");
      console.log("Error message:", submit);
    }
  };

  return (
    <View>
      <View className="justify-center items-center mt-36">
        <Image source={pirate} />
      </View>

      <View className="flex-row flex mt-8 justify-center align-center">
        <View className="mx-auto">
          <View className="flex-row items-center gap-2">
            <Image source={Solana} />

            <View>
              <Text className="opacity-50 text-xs"> Joined With</Text>
              <Text className="font-bold"> {wager} {Currency}</Text>
            </View>
          </View>
        </View>
        <Image source={line} />
        <View className="mx-auto">
          <View className="flex-row items-center gap-2">
            <Image source={ranking} />
            <View>
              <Text className="opacity-50 text-xs">Top Performer Achieves</Text>
              <Text className="font-bold color-[#EFBD42]">
                {totalPrizePool} {Currency}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {state === "UPCOMING" && (
        <View className="justify-center items-center mt-36">
          <Text>The challenge is yet to start</Text>
        </View>
      )}

      {state === "ONGOING" && (
        <>
          {(type === 0 || type === "Steps") && (
            <>
              <View className="mx-8 mt-8">
                <View className="flex-row justify-between">
                  <Text>{value} Steps</Text>
                  <Text>of {target}</Text>
                </View>

                <View className="py-2 mt-1">
                  <ProgressBar
                    height={10}
                    borderRadius={7.5}
                    color={"rgba(254, 201, 61, 1)"}
                    progress={value / target}
                    width={null}
                  />
                </View>
              </View>
            </>
          )}
          {(type === 1 || type === "Calories") && (
            <>
              <View className="mx-8 mt-8">
                <View className="flex-row justify-between">
                  <Text>{value} Calorie</Text>
                  <Text>of {target}</Text>
                </View>

                <View className="py-2 mt-1">
                  <ProgressBar
                    height={10}
                    borderRadius={7.5}
                    color={"rgba(254, 201, 61, 1)"}
                    progress={value / target}
                    width={null}
                  />
                </View>
              </View>
            </>
          )}
          {(type === 2 || type === "Proof") && (
            <>
              <View className="flex-row gap-[20px] items-center justify-center">
                <Text>Proofs</Text>
                <TouchableOpacity className="w-[150px] h-[48px] bg-black rounded-[32px] flex items-center justify-center">
                  <Text className="text-white font-bold text-[14px] ">
                    Validate
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          {(type === 3 || type === "Validator") && !submissionValid ? (
            <>
              {!isavalidator && (
                <>
                  <View className="flex-row justify-evenly mt-8 items-center">
                    <Text className="text-[#1E1E1E] text-[14px] font-[400]">
                      Add Quantity
                    </Text>
                    <View className="flex-row gap-4">
                      <TouchableOpacity
                        onPress={() => {
                          if (amount > 1) {
                            setAmount(amount - 1);
                          }
                        }}
                        className="bg-[#E8EDF1] rounded-[13px] w-[26px] h-[26px] flex items-center justify-center mt-2"
                      >
                        <Text>-</Text>
                      </TouchableOpacity>
                      <Text className="mt-2">{amount}</Text>
                      <TouchableOpacity
                        onPress={() => {
                          setAmount(amount + 1);
                        }}
                        className="bg-[#E8EDF1] rounded-[13px] w-[26px] h-[26px] flex items-center justify-center mt-2"
                      >
                        <Text>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={handleUploadMedia}
                    className="mt-6 flex-row justify-center w-full"
                  >
                    {uploadedImage ? (
                      <Image
                        source={{ uri: uploadedImage }}
                        style={{ width: 200, height: 200, borderRadius: 10 }}
                      />
                    ) : (
                      <View className="rounded-md overflow-hidden">
                        <View
                          style={{
                            borderStyle: "dashed",
                            borderWidth: 2,
                            borderRadius: 106,
                            borderColor: "#e0e0e0",
                          }}
                          className="flex-row w-full  px-[15%] py-[4%] justify-center"
                        >
                          <Text className="text-center  font-inter font-[500 text-black ">
                            Upload your proof{" "}
                            <FontAwesome5
                              name="file-upload"
                              size={16}
                              color="black"
                            />
                          </Text>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity className="items-center mt-8">
                    <Image source={viewFeed} />
                  </TouchableOpacity>
                </>
              )}

              {isavalidator && (
                <>
                  <View className="flex items-center my-8 font-inter justify-center">
                    <Text>You are a non-participating validator</Text>
                  </View>
                  <View className="flex-row justify-evenly mt-8 items-center">
                    <View className="flex flex-row px-2">
                      <Image className="my-auto mr-3" source={Solana} />
                      <View>
                        <Text className="text-xs text-[#576175]">Entries</Text>
                        <Text className="text-lg font-semibold ">
                          {noofsubmission} Uploaded
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      className="px-7 py-4 bg-black rounded-full"
                      onPress={() => setTab(2)}
                    >
                      <Text className="text-sm flex items-center justify-center font-semibold text-white">
                        Validate
                        <Text className="ml-2">
                          {" "}
                          <AntDesign name="arrowright" size={15} />
                        </Text>
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    className="items-center mt-8"
                    onPress={() => setTab(2)}
                  >
                    <Image source={viewFeed} />
                  </TouchableOpacity>
                </>
              )}
            </>
          ) : null}
          {(type === "Voting" || type === 4) && (
            <>
              {isLoading ? (
                <View className="flex-1 justify-center items-center my-36">
                  <ActivityIndicator size="large" color="#0000ff" />
                  {/* <Text className="text-lg font-semibold mt-2">Loading...</Text> */}
                </View>
              ) : !submissionValid ? (
                <View className="mt-6 bg-gray-100 rounded-lg shadow-md w-full px-4 py-6">
                  <TouchableOpacity
                    onPress={handleUploadMedia}
                    className={`border-dashed border-2 rounded-lg p-4 ${
                      uploadedImage
                        ? "bg-green-200 border-green-400"
                        : "border-gray-300"
                    }`}
                  >
                    {uploadedImage ? (
                      <Image
                        source={{ uri: uploadedImage }}
                        style={{ width: "100%", height: 200, borderRadius: 10 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text className="text-center font-medium text-gray-700 mb-15 ">
                        Upload your proof
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="flex-1 justify-center items-center px-4 py-6">
                  <Text className="text-lg font-semibold text-green-600 shadow-md mb-4">
                    You have already submitted.
                  </Text>
                  <Image
                    source={{
                      uri: `https://gateway.catoff.xyz/ipfs/${userSubmissions[0]?.Player?.Submission?.MediaUrls[0]}`,
                    }}
                    style={{
                      width: "100%",
                      height: 200,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: "#e0e0e0",
                      marginTop: 10,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.8,
                      shadowRadius: 3,
                    }}
                    resizeMode="cover"
                    accessibilityLabel="User submission image"
                  />
                </View>
              )}
            </>
          )}
        </>
      )}
      {(type === 3 || type === "Validator") && submissionValid && (
        <View className="justify-center items-center ">
          <Text>You have already submitted.</Text>
        </View>
      )}

      {state === "COMPLETED" && (
        <View className="justify-center items-center ">
          <Text>Challenge finished</Text>
        </View>
      )}

      {(type === "Voting" || type === 4) && (
        <TouchableOpacity
          onPress={() => setTab(2)}
          style={{
            marginTop: 3,
            marginBottom: 20,
            // justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={feed}
            style={{
              width: "100%",
              resizeMode: "contain",
              alignSelf: "center",
            }}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Progress;
