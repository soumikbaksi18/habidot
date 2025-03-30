import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';

const IosHeader = ({navigation}) => {

  if (Platform.OS !== 'ios') {
    return null;
  }

  return (
    <View className="flex-row items-center bg-gray-100">
      <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
        <Text className="text-lg text-blue-500">{'<'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default IosHeader;