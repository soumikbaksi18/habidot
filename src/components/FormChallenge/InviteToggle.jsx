import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import CustomSwitch from "./CustomSwitch";

const InviteToggle = ({setIsPrivate}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => {
    setIsEnabled(previousState => !previousState);
    onToggleSwitch(!isEnabled); // Ensure the switch toggles and logs correctly
  };
  const onToggleSwitch = (newState) => {
    console.log("Switch is now: ", newState ? "On" : "Off");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
      Invite only challenge
      </Text>
      <CustomSwitch setIsPrivate ={setIsPrivate} active={isEnabled} onToggle={toggleSwitch} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 5,
    paddingBottom: 5,
    
  },
  text: {
    color: '#4a5568', // A gray color
    fontWeight: 'bold',
    fontSize:17,
    marginRight: 10, // Space between text and switch
  },
});

export default InviteToggle;
