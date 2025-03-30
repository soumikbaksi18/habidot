import { useState } from 'react';
import { postUpdateCoverHex } from '../utils/Apicalls';


const useUpdateCoverHex = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const updateCoverHex = async (coverHexCode) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await postUpdateCoverHex(coverHexCode);
      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || "Update failed");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { updateCoverHex, loading, error, success };
};

export default useUpdateCoverHex;
