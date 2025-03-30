import { useState, useEffect } from 'react';
import { validate } from '../utils/Apicalls';

const useValidateChallenge = (challengeID, invalidSubmissions) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validatefn = async () => {
      try {
        const response = await validate(challengeID, invalidSubmissions);

        if (response.success) {
          setData(response.data);
        } else {
          setError('Failed to validatefn challenge: ' + response.message);
        }
      } catch (error) {
        setError('Error validating challenge: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (challengeID && invalidSubmissions) {
      validatefn();
    }
  }, [challengeID, invalidSubmissions]);

  return { data, error, isLoading };
};

export default useValidateChallenge;
