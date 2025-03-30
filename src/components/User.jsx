import card from "../assets/images/arrow.png";
import {
    View,
    Text,
    Image,
  } from "react-native";


const Item = ({ item, image }) => (
   
    <View className="flex-row justify-between items-center px-3 py-3 w-full">
      <View className="flex-col items-centerjustify-center w-[10%]">
        <Image source={image} className="w-[40px] h-[40px] rounded-full" />
      </View>

      <View className="flex-col items-start justify-start w-[60%]">
        <Text className="text-[14px] font-bold">{item?.username}</Text>
        <View className="flex-row justify-between items-center">
          <Text className="text-[12px] ">{item.value} | </Text>
        </View>
      </View>
      <View className="flex-col items-center justify-center w-[20%]">
      <Text className="text-[16px] font-bold">{item.value}</Text>
      </View>
    </View>
  );

export default Item