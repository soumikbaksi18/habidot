// CategoryList.js
import React from "react";
import { View, ScrollView } from "react-native";
import ItemCard from "./ItemCard"; // Consider using .js for the file extension

const CategoryList = ({
  categories,
  setFormStep,
  handleRequest,
  setChallenge,
  setSelectedCategory,
}) => {
  // console.log("categories   ", categories);

  return (
    <ScrollView>
      <View className="flex-row mt-10 mx-4 flex-wrap justify-between">
        {categories.map((item, index) => (
          <ItemCard
            key={index}
            item={item}
            onPress={() => {
              setFormStep(2);
              // handleRequest("gameType", "0"); // default
              console.log(item.gameType);
              setSelectedCategory(item?.name);
              setChallenge((prevChallenge) => ({
                ...prevChallenge,
                gameType: item.gameType || "",
              }));
            }}
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default CategoryList;
