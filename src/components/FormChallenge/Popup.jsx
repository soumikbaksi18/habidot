import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';

const Popup = ({ isVisible, onClose }) => {
  return (
    <Modal transparent={true} visible={isVisible}>
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className="bg-white rounded-lg p-4 w-4/5">
          <Text className="text-center text-lg font-bold">Challenge Created!</Text>
          <Text className="text-center mt-2">You have successfully created a challenge.</Text>
          <TouchableOpacity
            onPress={onClose}
            className="bg-blue-500 rounded-lg mt-4 p-2 text-center"
          >
            <Text className="text-white text-center">OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default Popup;
