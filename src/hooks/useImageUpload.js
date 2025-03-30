import { useState } from 'react';
import { postUploadImage } from '../utils/Apicalls';

const useUploadImage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState(null); // Add state to store the response data

  const uploadImage = async (file) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await postUploadImage(formData);
      if (response.success) {
        setSuccess(true);
        setData(response.data); // Store the response data
      } else {
        setError(response.message || "Upload failed");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { uploadImage, loading, error, success, data };
};

export default useUploadImage;
