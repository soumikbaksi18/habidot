import React, { useRef, useEffect } from "react";
import { View, Text, Modal, Animated, Image, StyleSheet } from "react-native";

const LoadingPopup = ({ visible }) => {
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loopAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(animation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    loopAnimation();
  }, [animation]);

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 10], // Adjust the range for more or less wave effect
  });

  return (
    <Modal transparent={true} animationType="fade" visible={visible}>
      <View style={styles.modalBackground}>
        <View style={styles.popupContainer}>
          <Animated.Image
            source={require("../../assets/wallet/Phantom-Icon_App_512x512.png")} // Replace with your image path
            style={[styles.logo, { transform: [{ translateY }] }]}
            resizeMode="contain"
          />
          <Text style={styles.connectingText}>Connecting...</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  popupContainer: {
    width: 200,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  connectingText: {
    fontSize: 20,
    marginVertical: 10,
    color: "black",
  },
});

export default LoadingPopup;
