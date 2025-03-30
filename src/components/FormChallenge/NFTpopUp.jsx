import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import ShadowButton from "./ShadowButton";

const NFTpopUp = ({ isVisible, onClose, setChallenge, challenge,proceed }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionChange = (id) => {
    const value = id;
    let game;

    switch (value) {
      case "3":
        game = "Paw Patrol";
        break;
      case "4":
        game = "Voting-based";
        break;
      case "2":
        game = "Digital Proof";
        break;
      default:
        game = "Paw Patrol";
    }

    setSelectedOption(value);
    setChallenge((prevChallenge) => ({
      ...prevChallenge,
      gameType: value, // Set the gameType value
    }));
  };

  const options = [
    {
      id: "3",
      label: "Paw Patrol",
      description:
        "Outcomes are verified by a trusted third-party individual. Ideal for challenges that require objective assessment and transparent validation.",
    },
    {
      id: "4",
      label: "Voting-based",
      description:
        "Participants present their entry & the community votes to determine the best submission. Perfect for creative, social, and interactive challenges.",
    },
    // {
    //   id: "2",
    //   label: "Digital Proof",
    //   description:
    //     "Requires participants to provide verifiable digital evidence to prove their accomplishments. Participants may need to upload screenshots, videos, or login to specific apps.",
    // },
  ];

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.container}>
          <TouchableWithoutFeedback>
            <View style={styles.popup}>
              <Text style={styles.title}>Pick a Type</Text>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionContainer,
                    selectedOption === option.id && styles.selectedOption,
                  ]}
                  onPress={() => handleOptionChange(option.id)}
                >
                  <View style={styles.radioButton}>
                    {selectedOption === option.id && (
                      <View style={styles.radioButtonSelected} />
                    )}
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                    <Text style={styles.optionDescription}>
                      {option.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              <ShadowButton onPress={proceed} title="Proceed to Preview  ->" />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  popup: {
    width: "95%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 20,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    width: "100%",
  },
  selectedOption: {
    borderColor: "#95E48A",
    backgroundColor: "#E6FC8E",
  },
  radioButton: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  radioButtonSelected: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: "#000",
  },
  textContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  optionDescription: {
    fontSize: 14,
    color: "#666",
  },
});

export default NFTpopUp;
