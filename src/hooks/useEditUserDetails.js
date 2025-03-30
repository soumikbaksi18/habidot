import { useState } from 'react';
import { postUserUpdate } from '../utils/Apicalls';

const useUpdateUserDetails = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const updateUserDetails = async (userDetails) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await postUserUpdate(userDetails);
      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { updateUserDetails, loading, error, success };
};

export default useUpdateUserDetails;
