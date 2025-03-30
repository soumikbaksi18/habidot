import React, { useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { generateImage } from "../../utils/genAi";

const ImagePreviewScreen = ({
  image,
  setOpenVis,
  openVis,
  challenge,
  startDateFormatted,
  endDateFormatted,
  setChallenge,
}) => {
  const [loading, setLoading] = useState(false);

  const NftImg = async (prompt) => {
    setLoading(true);
    try {
      const response = await generateImage({ prompt });

      setChallenge((prevChallenge) => ({
        ...prevChallenge,
        Media: response,
      }));
    } catch (error) {
      console.error("Error in NftImage:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={openVis}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setOpenVis(false)}
    >
      <View style={styles.container}>
        <View style={[styles.header, styles.transparentBackground]}>
          <TouchableOpacity onPress={() => setOpenVis(false)}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={[styles.nftLabel, styles.transparentBackground]}>
          <MaterialCommunityIcons name="certificate" size={24} color="gold" />
          <Text style={styles.nftText}>NFT</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="gold" style={styles.loader} />
        ) : (
          <Image
            source={{ uri: challenge.Media ? challenge.Media : image }}
            style={styles.fullImage}
          />
        )}

        <View style={[styles.footer, styles.transparentBackground]}>
          <TouchableOpacity
            style={styles.regenButton}
            onPress={() => NftImg(challenge.ChallengeName)}
            disabled={loading}
          >
            <Text style={styles.regenText}>
              {loading ? "Regenerating..." : "Regenerate"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 50,
    alignItems: "center",
    padding: 20,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
  },
  nftLabel: {
    position: "absolute",
    left: "40%",
    top: 100,
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  nftText: {
    marginLeft: 5,
    color: "gold",
    fontSize: 14,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  regenText: {
    color: "white",
    fontSize: 16,
  },
  regenButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  loader: {
    marginTop: "50%",
  },
  transparentBackground: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default ImagePreviewScreen;
