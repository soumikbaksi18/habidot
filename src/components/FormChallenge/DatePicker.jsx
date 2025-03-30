import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const DatePicker = ({ label, date, setDate, showDatePicker, setShowDatePicker }) => {
  return (
    <View>
      <Text className="text-[#252A31] text-[12px] font-[500] mt-2">{label}</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <TextInput
          placeholder={label}
          value={date.toLocaleDateString()}
          editable={false}
          className="border-[1px] border-[#BAC7D5] rounded-[4px] my-2 mx-0 h-12 p-2"
        />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            setDate(selectedDate || date);
          }}
        />
      )}
    </View>
  );
};

export default DatePicker;
