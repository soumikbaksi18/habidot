import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ImagePreviewScreen from "./NFTPreviw";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DescriptionGenerator from "./DescriptionGenerator";
import FullScreenButton from "./FullScreenButton";
import SolImage from "../../assets/tokens/Solana.png";
import BonkImage from "../../assets/tokens/Bonk.png";
import USDCImage from "../../assets/tokens/USDC.png";
const ChallengePopup = ({
  visible,
  onClose,
  challenge,
  publish,
  setChallenge,
}) => {
  const options = [
    { value: "SOL", label: "SOL", disabled: false, imgSrc: SolImage },
    { value: "USDC", label: "USDC", disabled: true, imgSrc: USDCImage },
    { value: "BONK", label: "BONK", disabled: true, imgSrc: BonkImage },
  ];
  const navigation = useNavigation();
  const [openVis, setOpenVis] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    return `${day} ${month}`;
  };
  const selectedOption = options.find(
    (option) => option.value === challenge.Currency
  );

  const imgSrc = selectedOption ? selectedOption.imgSrc : null;

  const startDateFormatted = formatDate(challenge.StartDate);
  const endDateFormatted = formatDate(challenge.EndDate);
  if (openVis) {
    return (
      <ImagePreviewScreen
        image="https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        setOpenVis={setOpenVis}
        openVis={openVis}
        startDateFormatted={startDateFormatted}
        endDateFormatted={endDateFormatted}
        challenge={challenge}
        setChallenge={setChallenge}
      />
    );
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.container}>
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: challenge?.Media
                  ? challenge?.Media
                  : "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
              }}
              style={styles.challengeImage}
            />
            <FullScreenButton setOpenVis={setOpenVis} />
          </View>
          <View
            style={{
              padding: 20,
            }}
          >
            <View style={styles.challengeHeader}>
              <Text style={styles.challengeTitle}>
                {challenge.ChallengeName}
              </Text>
              <Text style={styles.challengeDates}>
                From {startDateFormatted} to {endDateFormatted}
              </Text>
            </View>

            <View style={styles.challengeDetails}>
              <View style={styles.creditsRow}>
                <View style={styles.creditsItem}>
                  <Image
                    source={require("../../assets/images/gray.png")}
                    style={styles.icon}
                  />
                  <View style={styles.creditsTextContainer}>
                    <Text style={styles.creditsLabel}>To participate</Text>
                    <Text style={styles.creditsAmount}>
                      {challenge?.Wager} {challenge?.Currency}
                    </Text>
                  </View>
                </View>

                <View style={styles.creditsItem}>
                  <Image source={imgSrc} style={styles.icon} />
                  <View style={styles.creditsTextContainer}>
                    <Text style={styles.creditsLabel}>Winner Gets</Text>
                    <Text style={styles.creditsAmount}>
                      {challenge?.Wager * challenge.maxParticipants}{" "}
                      {challenge?.Currency}
                    </Text>
                  </View>
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.descriptionText}>Challenge Details</Text>
                <DescriptionGenerator
                  challenge={challenge}
                  setChallenge={setChallenge}
                />
              </View>
              <ScrollView style={styles.detailsContainer}>
                <Text style={styles.detailsText}>
                  {challenge.ChallengeDescription}
                </Text>
              </ScrollView>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignContent: "center",
                  alignItems: "center",
                  paddingRight: 30,
                }}
              >
                <Ionicons name="information-circle" size={30} color="gray" />
                <Text style={styles.previewText}>
                  This challenge is in preview. Publish it for others to see or
                  join.
                </Text>
              </View>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity style={styles.goBackButton} onPress={onClose}>
                <Text style={styles.buttonText}>Go Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.publishButton} onPress={publish}>
                <Text style={styles.buttonText}>Publish Challenge</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  descriptionText: {
    fontSize: 18,
    marginBottom: 10,
  },
  container: {
    backgroundColor: "white",
    borderRadius: 20,
    // padding: 10,
    width: "100%",
    maxHeight: "90%",
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  category: {
    fontSize: 20,
    fontWeight: "bold",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    backgroundColor: "#e0f7e9",
    borderRadius: 15,
  },
  retryText: {
    marginLeft: 5,
    color: "black",
    fontSize: 14,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 15,
    width: "auto",
  },
  challengeImage: {
    width: "100%",
    height: 200,
    borderRadius: 15,
  },
  challengeHeader: {
    marginBottom: 20,
  },
  challengeTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  challengeDates: {
    fontSize: 14,
    color: "gray",
  },
  challengeDetails: {
    marginBottom: 20,
  },
  creditsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    // alignItems: "center",
    gap: 100,
    marginBottom: 10,
  },
  creditsItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  creditsLabel: {
    fontSize: 14,
    color: "gray",
  },
  creditsTextContainer: {
    marginLeft: 5,
  },
  nftLabel: {
    position: "absolute",
    left: "60%",
    top: "25%",
    zIndex: 1,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  nftText: {
    marginLeft: 5,
    color: "white",
    fontSize: 14,
  },
  icon: {
    width: 20,
    height: 20,
  },
  creditsAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  detailsContainer: {
    maxHeight: 100,
    marginBottom: 10,
    overflow: "scroll",
  },
  detailsText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
  },
  previewText: {
    fontSize: 12,
    color: "gray",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    // paddingBottom: 100,
  },
  goBackButton: {
    flex: 1,
    marginRight: 5,
    padding: 15,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  publishButton: {
    flex: 2,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginLeft: 5,
    padding: 15,
    backgroundColor: "#E6FC8E",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ChallengePopup;
