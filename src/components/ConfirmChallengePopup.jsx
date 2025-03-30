import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet  , TouchableWithoutFeedback} from 'react-native';

const ConfirmChallengePopup = ({ isVisible , onClose, children }) => {
    if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
    >
               <TouchableWithoutFeedback onPress={onClose}>



      <View style={styles.overlay}>
      <TouchableWithoutFeedback>
        <View style={styles.container}>
          {children}

        </View>
        </TouchableWithoutFeedback>
      </View>
            </TouchableWithoutFeedback>

    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    alignItems: 'center',
  },

});

export default ConfirmChallengePopup;
