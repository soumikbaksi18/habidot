import React, { useState } from "react";
import { View, TouchableOpacity, Text, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";

const CreateButton = () => {
  const [buttonScale] = useState(new Animated.Value(1));
  const [buttonOpacity] = useState(new Animated.Value(1));
  const [textOpacity] = useState(new Animated.Value(1));
  const navigation = useNavigation();

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 1.05,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleScrollChange = (scrollY) => {
    // Adjust opacity based on scroll value
    const newButtonOpacity = Math.max(1 - scrollY / 100, 0.3);
    const newTextOpacity = Math.max(1 - scrollY / 50, 0);

    Animated.timing(buttonOpacity, {
      toValue: newButtonOpacity,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.timing(textOpacity, {
      toValue: newTextOpacity,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const buttonStyle = {
    transform: [{ scale: buttonScale }],
    opacity: buttonOpacity,
    backgroundColor: "black",
    padding: 12,
    borderRadius: 50,
    alignItems: "center",
    flexDirection: "row",
  };

  const textStyle = {
    opacity: textOpacity,
    color: "white",
    fontSize: 16,
    paddingHorizontal: 10,
  };

  return (
    <View
      style={{
        position: "absolute",
        bottom: 16,
        right: 16,
        zIndex: 50,
        height: 80,
      }}
    >
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => navigation.navigate("CreateChallenge")}
      >
        <Animated.View style={buttonStyle}>
          <Animated.Text style={textStyle}>Create</Animated.Text>
          <Text style={{ color: "white", fontSize: 24, paddingRight: 10 }}>
            +
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

export default CreateButton;
