import React, { useState, useEffect } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
  Modal,
  Button,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from "@react-native-picker/picker";
import styles from "./../../styles/styles";
import DescriptionGenerator from "./DescriptionGenerator";
import InviteToggle from "./InviteToggle";
import DropDownPicker from "react-native-dropdown-picker";

const ChallengeDetails = ({
  setIsPrivate,
  challenge,
  showEndTimePicker,
  setChallenge,
  handleRequest,
  validateChallengeName,
  setChallengeNameError,
  formErrors,
  showStartDatePicker,
  setShowStartDatePicker,
  setShowEndDatePicker,
  showEndDatePicker,
  showStartTimePicker,
  setShowEndTimePicker,
  setShowStartTimePicker,
  startDate,
  setStartDate,
  startTime,
  setStartTime,
  endDate,
  setEndDate,
  endTime,
  setEndTime,
  onChangeStartDate,
  onChangeStartTime,
  onChangeEndDate,
  onChangeEndTime,
  selectedCategory,
}) => {
  const [inputValue, setInputValue] = useState(String(challenge.Target) || "");

  useEffect(() => {
    if (selectedCategory === "Fitness") {
      handleRequest("Target", inputValue);
      setChallenge({ ...challenge, Target: inputValue });
    }
  }, [inputValue]);
  const [description, setDescription] = useState("");
  const RenderChallengeTypeFields = () => {
    const [val, setVal] = useState(0);
    return (
      <View className="z-40">
        <Text
          className={`text-[#252A31] text-[12px] font-[500] mt-2 ${styles.lable}`}
        >
          Target To Win
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderColor: "#BAC7D5",
            borderWidth: 1,
            borderRadius: 4,
            // paddingHorizontal: 8,
            marginVertical: 8,
            height: 48,
          }}
        >
          {/* Display Target Value */}
          {selectedCategory === "Fitness" ? (
            <TextInput
              style={{ flex: 1, marginRight: 10 }}
              className="text-sm pl-2"
              placeholder={"100"}
              keyboardType="numeric"
              onChangeText={(val) => {
                const parsedValue =
                  val && !isNaN(val) ? Math.abs(parseInt(val, 10)) : "";
                setInputValue(parsedValue.toString());
              }}
              value={inputValue}
              editable={selectedCategory === "Fitness"}
            />
          ) : (
            <Text style={{ flex: 1, marginRight: 10 }} className="text-xs">
              ℹ️ Maximum Value Wins
            </Text>
          )}

          {/* Use DropDownPicker for Fitness Challenges */}
          {selectedCategory === "Fitness" ? (
            <View style={{ flex: 1 }} className="pl-5 ">
              <DropDownPicker
                open={fitnessOpen}
                value={fitnessValue}
                items={fitnessItems}
                setOpen={setFitnessOpen}
                setValue={(val) => {
                  setFitnessValue(val);
                  setChallenge({ ...challenge, gameType: val });
                }}
                setItems={setFitnessItems}
                style={localStyles.dropdownStyle2}
                dropDownContainerStyle={localStyles.dropdownContainerStyle}
                listMode="SCROLLVIEW" // Prevent any interaction issues
                className={" "}
                nestedScrollEnabled={true}
              />
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <TextInput
                style={{ color: "gray" }}
                className="w-[120px] text-gray-400 outline-none border-none"
                placeholder={challenge.Unit || "Enter Unit"}
              >
                {/* {challenge.Unit || "Enter Unit"} */}
              </TextInput>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderDateTimePicker = (isStart) => {
    if (Platform.OS === "ios") {
      return (
        <>
          {isStart && showStartDatePicker && (
            <DateTimePickerModal
              isVisible={showStartDatePicker}
              mode="date"
              display="spinner"
              date={startDate}
              onConfirm={(date) => {
                setShowStartDatePicker(false);
                onChangeStartDate(null, date);
              }}
              onCancel={() => setShowStartDatePicker(false)}
            />
          )}
          {isStart && showStartTimePicker && (
            <DateTimePickerModal
              isVisible={showStartTimePicker}
              mode="time"
              display="spinner"
              date={startTime}
              onConfirm={(time) => {
                setShowStartTimePicker(false);
                onChangeStartTime(null, time);
              }}
              onCancel={() => setShowStartTimePicker(false)}
            />
          )}
          {!isStart && showEndDatePicker && (
            <DateTimePickerModal
              isVisible={showEndDatePicker}
              mode="date"
              display="spinner"
              date={endDate}
              onConfirm={(date) => {
                setShowEndDatePicker(false);
                onChangeEndDate(null, date);
              }}
              onCancel={() => setShowEndDatePicker(false)}
            />
          )}
          {!isStart && showEndTimePicker && (
            <DateTimePickerModal
              isVisible={showEndTimePicker}
              mode="time"
              display="spinner"
              date={endTime}
              onConfirm={(time) => {
                setShowEndTimePicker(false);
                onChangeEndTime(null, time);
              }}
              onCancel={() => setShowEndTimePicker(false)}
            />
          )}
        </>
      );
    } else {
      // For Android: Display the picker directly
      return (
        <>
          {isStart && showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={onChangeStartDate}
            />
          )}
          {isStart && showStartTimePicker && (
            <DateTimePicker
              value={startTime}
              mode="time"
              display="default"
              onChange={onChangeStartTime}
            />
          )}
          {!isStart && showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={onChangeEndDate}
            />
          )}
          {!isStart && showEndTimePicker && (
            <DateTimePicker
              value={endTime}
              mode="time"
              display="default"
              onChange={onChangeEndTime}
            />
          )}
        </>
      );
    }
  };

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(challenge.participationType);
  const [items, setItems] = useState([
    { label: "Multiplayer", value: "2" },
    { label: "Versus your friend", value: "1" },
    { label: "Dare your friend", value: "0" },
  ]);

  // New states for Fitness Game Type
  const [fitnessOpen, setFitnessOpen] = useState(false);
  const [fitnessValue, setFitnessValue] = useState(challenge.gameType);
  const [fitnessItems, setFitnessItems] = useState([
    { label: "Calories", value: "1" },
    { label: "Steps", value: "0" },
  ]);

  // New states for Calorie Target
  const [calorieTarget, setCalorieTarget] = useState(challenge.Target || "100");

  const RenderChallengeTypePicker = () => {
    if (Platform.OS === "ios") {
      return (
        <DropDownPicker
          open={open}
          value={value}
          items={items}
          setOpen={setOpen}
          setValue={(val) => {
            setValue(val);
            handleRequest("participationType", val);
          }}
          setItems={setItems}
          style={localStyles.dropdownStyle}
          dropDownContainerStyle={localStyles.dropdownContainerStyle}
          placeholder="Select Challenge Type"
          className={
            "border-[1px] border-[#BAC7D5] rounded-[4px] my-2 mx-0 h-12 p-2"
          }
          listMode="SCROLLVIEW"
        />
      );
    } else {
      return (
        <View style={localStyles.pickerContainer}>
          <Picker
            selectedValue={challenge.participationType}
            onValueChange={(itemValue) =>
              handleRequest("participationType", itemValue)
            }
            style={localStyles.picker}
          >
            <Picker.Item label="Multiplayer" value="2" />
            <Picker.Item label="Versus your friend" value="1" />
            <Picker.Item label="Dare your friend" value="0" />
          </Picker>
        </View>
      );
    }
  };

  return (
    <View>
      <Text
        className={`text-[#252A31] mt-5 font-[600] ${styles.cardHeading} text-[23px] `}
      >
        Challenge Details
      </Text>
      <Text className={`text-[12px] text-[#9F9F9F] ${styles.lable}`}>
        Fill in the details for your challenge.
      </Text>
      <InviteToggle setIsPrivate={setIsPrivate} />
      <Text
        className={`text-[#252A31] text-[12px] font-[500] mt-4 ${styles.lable}`}
      >
        Challenge Name
      </Text>
      <TextInput
        placeholder="Enter name"
        label="Challenge Name"
        onChangeText={(newValue) => {
          setChallenge({ ...challenge, ChallengeName: newValue });
          handleRequest("challengeName", newValue);
          const error = validateChallengeName(newValue);
          setChallengeNameError(error);
        }}
        className="border-[1px] border-[#BAC7D5] rounded-[4px] my-2 mx-0 h-12 p-2"
        value={challenge.ChallengeName}
      />
      {formErrors["challengeName"] && (
        <Text className="text-red-400 mb-2">{formErrors["challengeName"]}</Text>
      )}
      {/* <DescriptionGenerator challenge={challenge} setChallenge={setChallenge} /> */}

      <Text
        className={`text-[#252A31] text-[12px] font-[500] mt-2 ${styles.lable}`}
      >
        Challenge Type
      </Text>
      <RenderChallengeTypePicker />
      <RenderChallengeTypeFields />

      <View className="flex-row z-0 justify-between">
        <View className="w-[45%]">
          <Text
            className={`text-[#252A31] text-[12px] font-[500] mt-2 ${styles.lable}`}
          >
            Start Date
          </Text>
          <TouchableOpacity
            onPress={() => {
              console.log("Start Date Picker pressed");
              setShowStartDatePicker(true);
            }}
          >
            <Text style={localStyles.inputStyle} className="py-4">
              {startDate ? startDate.toLocaleDateString() : "Select Start Date"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              console.log("Start Time Picker pressed");
              setShowStartTimePicker(true);
            }}
          >
            <Text style={localStyles.inputStyle} className="py-4">
              {startTime
                ? startTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Select Start Time"}
            </Text>
          </TouchableOpacity>
          {renderDateTimePicker(true)}
          {formErrors["startDateTime"] && (
            <Text className="text-red-400 mb-2">
              {formErrors["startDateTime"]}
            </Text>
          )}
        </View>

        <View className="w-[45%]">
          <Text
            className={`text-[#252A31] text-[12px] font-[500] mt-2 ${styles.lable}`}
          >
            End Date
          </Text>
          <TouchableOpacity
            onPress={() => {
              console.log("End Date Picker pressed");
              setShowEndDatePicker(true);
            }}
          >
            <Text style={localStyles.inputStyle} className="py-4">
              {endDate ? endDate.toLocaleDateString() : "Select End Date"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              console.log("End Time Picker pressed");
              setShowEndTimePicker(true);
            }}
          >
            <Text style={localStyles.inputStyle} className="py-4">
              {endTime
                ? endTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Select End Time"}
            </Text>
          </TouchableOpacity>
          {renderDateTimePicker(false)}
          {formErrors["endDateTime"] && (
            <Text className="text-red-400 mb-2">
              {formErrors["endDateTime"]}
            </Text>
          )}
        </View>
      </View>

      {/* <View style={styles.container}>
      <Button title="Show Date Picker" onPress={showDatePicker} />
        <Text style={styles.selectedDateText}>
          Selected Date: {selectedDate.toLocaleDateString()}{" "}
          {selectedDate.toLocaleTimeString()}
        </Text>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime" // Change to "date" or "time" if needed
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />
      </View> */}
    </View>
  );
};

export default ChallengeDetails;

const localStyles = StyleSheet.create({
  pickerContainer: {
    borderColor: "#BAC7D5",
    borderWidth: 1,
    borderRadius: 4,
    overflow: "hidden",
    height: 48,
    justifyContent: "center",
    marginTop: 8,
  },
  picker: {
    color: "#252A31",
    fontSize: 12,
    fontWeight: "500",
  },
  dropdownStyle: {
    borderColor: "#BAC7D5",
    borderWidth: 1,
    borderRadius: 4,
    height: 48,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  dropdownStyle2: {
    backgroundColor: "none",
    borderColor: "transparent",
    borderWidth: 0,
  },
  dropdownContainerStyle: {
    backgroundColor: "#ffffff",
    borderColor: "transparent",
    borderWidth: 0,
    paddingRight: 20,
  },
  dropdownContainerStyle: {
    borderColor: "#BAC7D5",
  },
  dropdownContainerStyle: {
    borderColor: "#BAC7D5",
  },
  inputStyle: {
    borderColor: "#BAC7D5",
    borderWidth: 1,
    borderRadius: 4,
    height: 48,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalCloseButton: {
    alignItems: "center",
    marginTop: 20,
  },
  modalCloseButtonText: {
    color: "#007AFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
