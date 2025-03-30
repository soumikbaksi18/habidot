import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

const ShadowButton = ({ onPress, title }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.text}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 20,
    width: "100%",
  },
  button: {
    backgroundColor: "transparent",
    padding: 15,
    width: "100%",
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderBottomWidth: 3,
    // elevation: 2, // For Android shadow effect
  },
  text: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ShadowButton;
