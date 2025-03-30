import { useState, useEffect } from 'react';
import { getUserTransaction } from '../utils/Apicalls';

const useUserTransaction = () => {
  const [userTransaction, setUserTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserTransaction = async () => {
    try {
      const response = await getUserTransaction();
      if (response.success) {
        setUserTransaction(response.data);
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
    fetchUserTransaction();
  }, []);

  return { userTransaction, loading, error, fetchUserTransaction };
};

export default useUserTransaction;
