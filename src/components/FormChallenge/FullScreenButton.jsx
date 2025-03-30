import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons"; // Using Ionicons package
import MaterialIcons from "react-native-vector-icons/MaterialIcons"; // Using Ionicons package

const FullScreenButton = ({ setOpenVis }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => setOpenVis(true)}>
        <MaterialIcons name="fullscreen-exit" size={16} color="white" />
        <Text style={styles.text}>Full Screen</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 16,
    right: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "gray",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  text: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
  },
});

export default FullScreenButton;
