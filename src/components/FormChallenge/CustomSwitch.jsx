import React, { useState, useRef } from "react";
import { View, TouchableOpacity, Animated, StyleSheet } from "react-native";

const CustomSwitch = ({ active = false, onToggle,setIsPrivate }) => {
  const [isActive, setIsActive] = useState(active);
  const animatedValue = useRef(new Animated.Value(active ? 1 : 0)).current;

  const handleToggle = () => {
    setIsPrivate(!isActive)
    setIsActive(!isActive);
    onToggle(!isActive);
    Animated.timing(animatedValue, {
      toValue: !isActive ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 25], // Adjust based on the size of your switch
  });

  return (
    <TouchableOpacity
      onPress={handleToggle}
      style={[
        styles.switchContainer,
        { backgroundColor: isActive ? "#E6FC8E" : "gray" }, // Dynamic background color
      ]}
    >
      <Animated.View style={[styles.switch, { transform: [{ translateX }] }]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  switchContainer: {
    width: 55, // Width of the outer container
    height: 28, // Height of the outer container
    borderRadius: 8, // Rounded corners for the outer container
    borderWidth: 1,
    borderColor: "#000000CC",
    padding: 2, // Padding around the switch to allow for movement
  },
  switch: {
    width: 23, // Width of the inner circle
    height: 23, // Height of the inner circle
    backgroundColor: "#000000CC", // Background color of the inner circle
    borderRadius: 4, // Rounded corners for the inner circle
  },
});

export default CustomSwitch;
