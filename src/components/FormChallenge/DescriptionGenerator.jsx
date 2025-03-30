import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import generate from "../../assets/images/generate.png";
import { generateDescription, generateImage } from "../../utils/genAi";

export default function DescriptionGenerator({ setChallenge, challenge }) {
  const [loading, setLoading] = useState(false);

  const NftDesc = async (prompt) => {
    setLoading(true);
    try {
      if (!prompt) {
        Alert.alert(
          "Challenge Name Required",
          "Please give a challenge name!",
          [
            {
              text: "OK",
            },
          ],
          {
            cancelable: true,
          }
        );
        setLoading(false);
        return;
      }
      // const response = await generateImage({ prompt });
      const responseDes = await generateDescription({
        prompt,
        participation_type: null,
        result_type: null,
        additional_info: null,
      });

      setChallenge((prevChallenge) => ({
        ...prevChallenge,
        ChallengeDescription: responseDes,
        // Media: response,
      }));
    } catch (error) {
      console.error("Error in NftImage:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => NftDesc(challenge.ChallengeName)}
          disabled={loading}
        >
          <View style={styles.row}>
            <Image source={generate} style={styles.icon} />
            <Text style={styles.buttonText}>
              {loading ? "Generating..." : "Re-Generate"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      {loading ? <ActivityIndicator size="large" color="#E6FC8E" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff", // Change background color as needed
  },
  label: {
    color: "#252A31",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#E6FC8E",
    borderRadius: 8,
    width: "100%",
    padding: 5,
    alignItems: "center",
    // justifyContent: "center",
    elevation: 2, // Add shadow for Android
    shadowColor: "#000", // Add shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 14,
    height: 14,
    margin: 4, // Spacing between the icon and text
  },
  buttonText: {
    color: "#000", // Adjust color for better contrast
    fontSize: 14,
    fontWeight: "bold",
  },
});
