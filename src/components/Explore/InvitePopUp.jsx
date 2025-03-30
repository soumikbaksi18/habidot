import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import CheckMark from "../../assets/images/CheckCircle.png";

interface PopupWithLinkProps {
  isVisible: boolean;
  onClose: () => void;
  shareLink: () => void;
  handleShareBlink: () => void;
}

const InvitePopUp: React.FC<PopupWithLinkProps> = ({
  isVisible,
  onClose,
  shareLink,
  handleShareBlink,
}) => {
  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose} // Allows closing the modal on Android back press
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.popupContainer}>
          <TouchableOpacity activeOpacity={1} style={styles.contentContainer}>
            <Image source={CheckMark} style={styles.checkmark} />
            <View style={styles.textContainer}>
              <Text style={styles.title}>Challenge Created Successfully!</Text>
              <Text style={styles.subtitle}>
                You may now share it with your friends!
              </Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.shareButton} onPress={shareLink}>
                <Text style={styles.buttonText}>Share Link</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shareButton, styles.blinkButton]}
                onPress={handleShareBlink}
              >
                <Text style={styles.buttonText}>Share Blink</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end", // Aligns the popup at the bottom
  },
  popupContainer: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  contentContainer: {
    alignItems: "center",
  },
  checkmark: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  subtitle: {
    textAlign: "center",
    color: "#555",
  },
  buttonContainer: {
    width: "100%",
    marginTop: 20,
  },
  shareButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    marginBottom: 10,
  },
  blinkButton: {
    backgroundColor: "#E6FC8E",
  },
  buttonText: {
    fontWeight: "600",
  },
});

export default InvitePopUp;
