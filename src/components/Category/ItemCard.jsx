// ItemCard.js
import React from "react";
import { TouchableOpacity, View, Image, Text } from "react-native";

const ItemCard = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      className={`flex w-[30%] ${
        item.disabled ? "opacity-50" : "opacity-100"
      } items-center justify-center mx-[1.5%] h-[118px] mb-[20px]`}
      onPress={onPress}
      disabled={item.disabled}
    >
      <View className="flex w-[105px] items-center justify-center h-[90px] bg-[#F6F6F2] rounded-[8px]">
        <Image source={item.image} className="h-[60px] w-[60px]" />
        {item.disabled && (
          <Text className="text-red-500 text-[8px]">Coming Soon</Text>
        )}
      </View>
      <Text
        className="mt-2"
        style={{
          fontFamily: "Inter",
          fontSize: 12,
          fontWeight: "500",
          lineHeight: 16,
          textAlign: "center",
        }}
        numberOfLines={2}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};

export default ItemCard;
