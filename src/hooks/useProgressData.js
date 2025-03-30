import { useState, useEffect } from 'react';
import { getChallengeDashboard, getLeaderboard } from '../utils/Apicalls';

const useUserProgress = (id) => {
    const [performance, setPerformance] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [leaderboard, setLeaderboard] = useState([]);

    const fetchDetailsAndChallenges = async () => {
        try {
            console.log("Fetching user details...");
            const userDetails = await getChallengeDashboard(id);
            console.log("============================================");
            console.log('User details response:', userDetails);

            if (userDetails.success) {
                setPerformance(userDetails.data);
                // console.log("User Detail🎟️😶‍🌫️😣😫🤔❌", userDetails.data);
            } else {
                setError('Failed to fetch user details: ' + userDetails.message);
                return;
            }

            console.log("Fetching user challenges...");
            const board = await getLeaderboard(id);
            console.log('User challenges response:', board);

            if (board.success) {
                setLeaderboard(board.data);
                console.log("board is b=here", board);
            } else {
                setError('Failed to fetch user challenges: ' + board.message);
            }
        } catch (error) {
            setError('Error fetching user details or challenges: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDetailsAndChallenges();

        const intervalId = setInterval(() => {
            fetchDetailsAndChallenges();
        }, 100000000); // 10 seconds

        return () => clearInterval(intervalId); 
    }, [id]); 

    return { performance, leaderboard, error, isLoading ,fetchDetailsAndChallenges };
};

export default useUserProgress;
