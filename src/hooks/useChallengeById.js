import { useState, useEffect, useCallback } from "react";
import { getChallengesById, getOngoingChallenges } from "../utils/Apicalls";

const useChallengeById = (id) => {
    console.log(id)
  const [challenges, setChallenges] = useState([]);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      console.log("Fetching upcoming challenges...");
      const response = await getChallengesById(id);
      console.log("Challenges response:              ", response);
      setChallenges(response.data);
    } catch (error) {
      console.error("Failed to fetch challenges:", error);
      setError("Failed to fetch challenges: " + error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetchChallenges = useCallback(() => {
    fetchData();
  }, []);

  return { challenges, error, refetchChallenges };
};

export default useChallengeById;
