import { useState, useEffect } from 'react';
import { getUserDetailsMobile } from '../utils/Apicalls';

const useUserDetails = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    const fetchUserDetails = async () => {
      try {
        const response = await getUserDetailsMobile();
        if (response.success) {
          setUserDetails(response.data);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
    fetchUserDetails();
  }, []);

  return { userDetails, loading, error , fetchUserDetails};
};

export default useUserDetails;
