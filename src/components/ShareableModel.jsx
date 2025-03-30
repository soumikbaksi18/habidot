import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Clipboard,
  StyleSheet,
} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Popup from "./Popup";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

const ShareableModal = ({ isOpen, onRequestClose, shareUrl }) => {
  const title = "Check this out!";
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    Clipboard.setString(shareUrl); // For copying to clipboard in React Native
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset copy status after 2 seconds
  };

  const handleOpenLink = (url) => {
    Linking.openURL(url);
  };

  return (
    <Popup isVisible={isOpen} onClose={onRequestClose}>
      <View style={styles.modal}>
        <TouchableOpacity
          onPress={()=>{
            console.log('fe')
            onRequestClose();
          }}
          className="absolute top-3 right-3"
        >
          <AntDesign name="close" size={24} />
        </TouchableOpacity>

        <Text className="text-xl font-semibold mb-2">{shareUrl}</Text>

        <TouchableOpacity
          onPress={handleCopyLink}
          className="flex-row items-center p-3 bg-gray-800 rounded-full mb-4"
        >
          {copied ? (
            <AntDesign name="checkcircle" size={24} color={"white"} />
          ) : (
            <AntDesign name="copy1" size={24} color={"white"} />
          )}
          <Text className="ml-2 text-white">
            {copied ? "Link Copied!" : "Copy Link"}
          </Text>
        </TouchableOpacity>

        <View className="flex-row flex-wrap justify-center gap-3 mb-4">
          <TouchableOpacity
            onPress={() =>
              handleOpenLink(
                `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`
              )
            }
          >
            <AntDesign name="facebook-square" size={30} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              handleOpenLink(
                `https://twitter.com/intent/tweet?url=${shareUrl}&text=${title}`
              )
            }
          >
            <AntDesign name="twitter" size={30} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              handleOpenLink(`https://wa.me/?text=${title} ${shareUrl}`)
            }
          >
            <FontAwesome5Icon name="whatsapp" size={28} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              handleOpenLink(
                `https://t.me/share/url?url=${shareUrl}&text=${title}`
              )
            }
          >
            <FontAwesome5Icon name="telegram" size={28} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              handleOpenLink(`https://www.instagram.com/?url=${shareUrl}`)
            }
          >
            <AntDesign name="instagram" size={30} />
          </TouchableOpacity>
        </View>
      </View>
    </Popup>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "95%",
    maxWidth: 600,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
});

export default ShareableModal;
