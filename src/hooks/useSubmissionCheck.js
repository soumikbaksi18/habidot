import { useState, useEffect } from 'react';
import { getSubmissions } from '../utils/Apicalls';

const useSubmissionCheck = (id) => {

    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    

    useEffect(() => {
        const fetchDetailsAndChallenges = async () => {
            try {
                 const userDetails = await getSubmissions(5);
                // console.log('User details response:', userDetails);

                if (userDetails.success) {
                    
                    setPerformance(userDetails.data);
                    console.log(userDetails)
                } else {
                    setError('Failed to fetch user details: ' + userDetails.message);
                    return;
                }
            } catch (error) {
                setError('Error fetching user details or challenges: ' + error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetailsAndChallenges();
    }, []);

   

    return { data , error, isLoading, };
};

export default useSubmissionCheck;
