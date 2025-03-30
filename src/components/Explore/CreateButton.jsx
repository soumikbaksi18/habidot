import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const CreateButton = () => {
  const [buttonOpacity] = useState(new Animated.Value(1));
  const [textOpacity] = useState(new Animated.Value(1));
  const [isHovered, setIsHovered] = useState(false);
  const navigation = useNavigation();

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.y;
    const newButtonOpacity = Math.max(1 - scrollPosition / 100, 0.3);
    const newTextOpacity = Math.max(1 - scrollPosition / 50, 0);

    Animated.timing(buttonOpacity, {
      toValue: newButtonOpacity,
      duration: 200,
      useNativeDriver: true,
    }).start();

    Animated.timing(textOpacity, {
      toValue: newTextOpacity,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const buttonStyle = {
    opacity: isHovered ? 1 : buttonOpacity,
    transform: [{ scale: isHovered ? 1.05 : 1 }],
    backgroundColor: "black", // Set button background to black
  };

  const textStyle = {
    opacity: isHovered ? 1 : textOpacity,
  };

  return (
    <View style={styles.container}>
      <ScrollView onScroll={handleScroll} scrollEventThrottle={16}>
        {/* Content to scroll */}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("Create Challenge")} // Navigate to Create screen
          onPressIn={() => setIsHovered(true)}
          onPressOut={() => setIsHovered(false)}
        >
          <Animated.View style={[styles.button, buttonStyle]}>
            <Animated.Text style={[styles.text, textStyle]}>
              Create
            </Animated.Text>
            <Text style={styles.plusIcon}>+</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    top: 700,
    right: 20, // Position the button near the right edge
    zIndex: 100,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 50,
    backgroundColor: "black",
  },
  text: {
    color: "white",
    marginRight: 8,
    fontSize: 18,
  },
  plusIcon: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
  },
});

export default CreateButton;
