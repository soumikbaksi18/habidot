import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Popup from "../components/Popup";
import { launchImageLibrary } from "react-native-image-picker";
import ColorPicker from "react-native-wheel-color-picker";
import useUserDetails from "../hooks/useUserDetails";
import useUpdateUserDetails from "../hooks/useEditUserDetails.js";
import useUpdateCoverHex from "../hooks/useColorPicker.js";
import useUploadImage from "../hooks/useImageUpload.js";
import placeholder from "../assets/images/placeholder.png";
import Pencil from "../assets/images/pencil.png";

const EditUserProfile = ({ navigation }) => {
  const { userDetails, loading, error } = useUserDetails();
  const {
    updateCoverHex,
    loading: updatingCoverHex,
    error: updateCoverHexError,
    success: coverHexSuccess,
  } = useUpdateCoverHex();
  const {
    uploadImage,
    loading: uploadingImage,
    error: uploadError,
    success: uploadSuccess,
  } = useUploadImage();
  const {
    updateUserDetails,
    loading: updating,
    error: updateError,
    success,
  } = useUpdateUserDetails();

  const [name, setName] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [coverHexCode, setCoverHexCode] = useState(
    userDetails?.User.CoverHexCode || "#5FD7D5"
  );
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tempColor, setTempColor] = useState(coverHexCode);
  const [profileImageUri, setProfileImageUri] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  useEffect(() => {
    if (userDetails) {
      setName(userDetails.User.UserName);
      setAboutMe(userDetails.User.Bio);
      setCoverHexCode(userDetails.User.CoverHexCode || "#5FD7D5");
      setProfileImageUri(userDetails.User.ProfilePicture || placeholder);
    }
  }, [userDetails]);

  const handleClosePopup = () => {
    setIsPopupVisible(false);
    navigation.navigate("My Profile");
  };

  const pickImage = async () => {
    try {
      const response = await new Promise((resolve, reject) => {
        launchImageLibrary({ mediaType: "mixed" }, (response) => {
          if (!response.didCancel && !response.error) {
            resolve(response);
          } else {
            reject(response.error || "Image picker error");
          }
        });
      });

      if (response.assets && response.assets.length > 0) {
        const source = { uri: response.assets[0].uri };
        setProfileImageUri(source.uri);

        const uriParts = source.uri.split(".");
        const fileType = uriParts[uriParts.length - 1];
        const file = {
          uri: source.uri,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        };

        await uploadImage(file);
      } else {
        Alert.alert("No image selected", "Please select an image to upload.");
      }
    } catch (error) {
      if (error !== "Image picker error") {
        console.error("Image picking error:", error);
        Alert.alert(
          "Image picking error",
          "An error occurred while picking the image. Please try again."
        );
      }
    }
  };

  const handleConfirm = async () => {
    const updatedDetails = {
      UserName: name,
      Bio: aboutMe,
    };

    await updateUserDetails(updatedDetails);
    setIsPopupVisible(true);
  };

  const handleCoverHexConfirm = async () => {
    setCoverHexCode(tempColor);
    await updateCoverHex(tempColor);
    setShowColorPicker(false);
  };

  const handleCancel = () => {
    navigation.navigate("My Profile");
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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView className="flex flex-col font-inter w-screen">
        <View
          className="flex h-40 items-center p-4"
          style={{ backgroundColor: coverHexCode }}
        >
          <TouchableOpacity
            className="absolute rounded-full bottom-4 right-2"
            onPress={() => setShowColorPicker(true)}
          >
            <Image className="w-9 h-9" source={Pencil} />
          </TouchableOpacity>
          <View className="absolute flex items-center mt-24">
            {profileImageUri && (
              <Image
                className="w-28 rounded-lg h-28"
                source={{ uri: profileImageUri }}
              />
            )}
            <TouchableOpacity
              className="absolute rounded-full -bottom-2 -right-2"
              onPress={pickImage}
            >
              <Image className="w-9 h-9" source={Pencil} />
            </TouchableOpacity>
          </View>
        </View>

        {showColorPicker && (
          <View className="w-full px-4 mt-20">
            <Text className="text-xs font-semibold my-3">COVER HEX CODE</Text>
            <ColorPicker
              color={tempColor}
              onColorChange={setTempColor}
              thumbSize={40}
              sliderSize={40}
              noSnap={true}
              row={false}
              swatchesLast={true}
              swatches={true}
              discrete={false}
            />
            <TouchableOpacity
              onPress={handleCoverHexConfirm}
              className="flex flex-row justify-center items-center py-3 px-5 mt-4 bg-black border border-gray-300 rounded-full"
            >
              <Text className="font-inter font-bold text-[14px] text-white">
                Confirm Color
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="w-full px-4 mt-20">
          <Text className="text-xs font-semibold my-3">NAME</Text>
          <TextInput
            className="border font-normal border-gray-300 rounded-lg py-3 px-5"
            value={name}
            onChangeText={setName}
          />

          <Text className="text-xs font-semibold my-3">Email</Text>
          <Text className="border font-normal py-3 px-5 border-gray-300 rounded-lg">
            {userDetails.User?.Email}
          </Text>

          <Text className="text-xs font-semibold my-3">ABOUT ME</Text>
          <TextInput
            className="border font-normal border-gray-300 rounded-lg py-3 px-5 h-20 text-justify"
            multiline
            value={aboutMe}
            onChangeText={setAboutMe}
          />
        </View>
      </ScrollView>
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
          bottom: 0,
          width: "100%",
        }}
      >
        <View className="flex flex-row mb-4 justify-center items-start px-2 gap-2 w-[344px] h-[48px]">
          <TouchableOpacity
            onPress={handleCancel}
            className="flex flex-row justify-center items-center py-[14px] px-[24px] w-[160px] h-[48px] border border-gray-300 rounded-full"
          >
            <Text className="h-[25px] font-inter font-bold text-[14px] text-gray-900">
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleConfirm}
            className="flex flex-row justify-center items-center py-[14px] px-[24px] w-[160px] h-[48px] bg-black border border-gray-300 rounded-full flex-grow"
          >
            <Text className="h-[25px] font-inter font-bold text-[14px] text-white">
              {updating ? "Updating..." : "Confirm"}
            </Text>
          </TouchableOpacity>
        </View>

        <Popup isVisible={isPopupVisible} onClose={handleClosePopup}>
          <>
            <View className="bg-[#00cc00] rounded-full p-3 mt-10">
              {success && <MaterialIcons name="done" size={60} color="white" />}
              {updateError && (
                <MaterialIcons name="cancel" size={60} color="red" />
              )}
            </View>
            <Text className="mt-6 mb-2 font-bold text-bold">
              {success
                ? "User details updated successfully!"
                : `Error: ${updateError}`}
            </Text>
            <View className="w-full">
              <TouchableOpacity
                className="py-3 m-4 border flex items-center border-gray-300 rounded-full mb-8 mt-4"
                onPress={handleClosePopup}
              >
                <Text className="text-black">Okay</Text>
              </TouchableOpacity>
            </View>
          </>
        </Popup>
      </View>
    </SafeAreaView>
  );
};

export default EditUserProfile;
