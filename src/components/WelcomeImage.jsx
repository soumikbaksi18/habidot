import React from "react";
import { StyleSheet, Text, View, Image, ImageBackground, Dimensions } from "react-native";
import icon from "../assets/images/heros.png"; // Ensure this path is correct

const { width, height } = Dimensions.get("window");

const WelcomeImage = () => {
  return (
    <ImageBackground source={icon} style={styles.background}>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to Catoff!</Text>
          <Text style={styles.subtitle}>
            The ultimate P2P challenge wagering dApp. Compete in dares, duels, &
            pools or place side-bets. Don't forget to add funds to start!
          </Text>
        </View>
        {/* Uncomment and adjust path if you want to add another image */}
        {/* <Image
          source={require("./path/to/your/cat-image.png")}
          style={styles.catImage}
        /> */}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: width, // Set width to screen width
    height: height, // Set height to screen height
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    maxWidth: "90%",
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#333",
  },
  catImage: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
});

export default WelcomeImage;
