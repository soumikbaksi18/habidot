import { View, Text, Button } from "react-native";
const ActivityRow = ({ activities }) => {
    return (
      <View className="flex flex-row w-full items-center justify-between mt-[22px]">
        {activities.map((activity, index) => (
          <Text
            key={index}
            className={`text-[20px] font-runs ${activity.color} `}
          >
            {activity.name}
          </Text>
        ))}
      </View>
    );
  };

export default ActivityRow