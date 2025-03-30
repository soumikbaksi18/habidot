
import { Modal, View, Text, TouchableOpacity, Image , StyleSheet } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard'; 
import CheckMark from "../../assets/images/CheckCircle.png"; // Update with your image path


interface PopupWithLinkProps {
  isVisible: boolean;
  onClose: () => void;
  shareLink: () => void;
  handleshareblinks: () => void;
  slug: string;
}

const SlugInvitePopUp: React.FC<PopupWithLinkProps> = ({ isVisible, onClose, shareLink, slug ,handleshareblinks}) => {
  if (!isVisible) return null;

  const copySlugToClipboard = () => {
    Clipboard.setString(slug);
    alert('SLUG copied to clipboard!');
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlay} onPress={onClose} />
        <View style={styles.popupContainer}>
          <Image source={CheckMark} style={styles.checkmark} />
          <View style={styles.textContainer}>
            <Text style={styles.title}>Challenge Created Successfully!</Text>
            <Text style={styles.subtitle}>You may now share it with your friends!</Text>
          </View>

          <View style={styles.slugContainer}>
            <Text style={styles.slugTitle}>Private Challenge SLUG</Text>
            <Text style={styles.slugDescription}>
              Share this SLUG to invite participants to your private challenge
            </Text>
            <View style={styles.slugCopyContainer}>
              <Text style={styles.slugText}>{slug}</Text>
              <TouchableOpacity style={styles.copyButton} onPress={copySlugToClipboard}>
                <Text style={styles.copyButtonText}>Copy SLUG</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.shareButton} onPress={shareLink}>
            <Text style={styles.buttonText}>Share Link</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.shareButton, styles.blinkButton]} onPress={handleshareblinks}>
            <Text style={styles.buttonText}>Share Blink</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};


export default SlugInvitePopUp;
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 10,
  },
  checkmark: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  slugContainer: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  slugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#006400',
  },
  slugDescription: {
    fontSize: 14,
    color: '#228B22',
    textAlign: 'center',
  },
  slugCopyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: '100%',
    marginTop: 10,
  },
  slugText: {
    fontSize: 34,
    fontFamily: 'monospace',
    color: 'black',
  },
  copyButton: {
    backgroundColor: '#E6FC8E',
    padding: 10,
    borderRadius: 8,
    shadowColor: 'rgba(0, 0, 0, 0.8)',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.5,
  },
  copyButtonText: {
    fontWeight: '600',
  },
  shareButton: {
    width: '100%',
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  blinkButton: {
    backgroundColor: '#E6FC8E',
  },
  buttonText: {
    fontWeight: '600',
  },
});
