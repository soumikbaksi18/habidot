import React from 'react';
import { Modal, View, StyleSheet , TouchableWithoutFeedback } from 'react-native';

const Popup = ({ isVisible, children, onClose }) => {
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
    >
       <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} className="flex bg-[#879047] justify-center pb-[25px] px-[7px]">
          <TouchableWithoutFeedback>
            <View className="bg-white rounded-[20px] flex justify-center items-center">
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  popupContainer: {
    backgroundColor: 'white',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5
  }
});

export default Popup;
