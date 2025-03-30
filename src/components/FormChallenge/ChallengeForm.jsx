import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import ChallengeDetails from './ChallengeDetails';
import ParticipationDetails from './ParticipationDetails';
import WagerDetails from './WagerDetails';
import Popup from './Popup';

const ChallengeForm = () => {
  const [challenge, setChallenge] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const handleCreateNow = () => {
    // Logic to handle form submission
  };

  const handleClosePopup = () => {
    setIsPopupVisible(false);
  };

  return (
    <ScrollView className="flex flex-col mx-3">
      <ChallengeDetails
        challenge={challenge}
        setChallenge={setChallenge}
        formErrors={formErrors}
      />
      <ParticipationDetails
        challenge={challenge}
        setChallenge={setChallenge}
        formErrors={formErrors}
      />
      <WagerDetails
        challenge={challenge}
        setChallenge={setChallenge}
        formErrors={formErrors}
      />
      <TouchableOpacity
        onPress={() => {
          const isValid = validateForm();
          if (isValid) {
            setFormErrors({});
            handleCreateNow();
            setIsPopupVisible(true);
          }
        }}
        className="bg-[#FEC93D] rounded-[28px] w-full h-[56px] flex items-center justify-center mt-6"
      >
        <Text className="font-bold">Publish Challenge</Text>
      </TouchableOpacity>
      <Popup isVisible={isPopupVisible} onClose={handleClosePopup} />
    </ScrollView>
  );
};

export default ChallengeForm;
