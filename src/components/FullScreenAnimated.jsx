import React from "react";
import { StyleSheet } from "react-native";
import { Button } from "react-native-elements";
import Animated from "react-native-reanimated";
import { View } from "react-native";
import back from "../assets/images/back.png";
// import share from "../assets/images/share.png";
import chalengeBackgrond from "../assets/images/challenge_background.png";
import { TouchableOpacity, Image, StatusBar, SafeAreaView } from "react-native";

function FullScreenAnimated({ navigation, route }) {
  const { media } = route.params;

  const handleShareClick = async () => {
    try {
      const result = await Share.share({
        message: shareableLink,
        url: shareableLink,
        title: "Share the challenge with your friends and family!",
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleGoBack}>
            <Image source={back} style={styles.icon} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleShareClick}>
            <View style={styles.shareButton}>
              {/* <Image source={share} style={styles.icon} /> */}
            </View>
          </TouchableOpacity>
        </View>

        <Animated.Image
          source={media ? { uri: media } : chalengeBackgrond}
          style={{ width: "100%", height: 500 }}
          sharedTransitionTag="tag"
        />
      </View>
    </SafeAreaView>
  );
}

export default FullScreenAnimated;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    width: "100%",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    width: "100%",
    position: "absolute",
    top: 0,
    zIndex: 1,
  },
  icon: {
    width: 40,
    height: 40,
  },
  shareButton: {
    padding: 10,

    borderWidth: 1,
  },
  mediaImage: {
    width: "100%",
  },
});
