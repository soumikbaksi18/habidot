import { useState, useEffect, useCallback } from "react";
import {
  getUserDetails,
  getUserChallenges,
  getUserDetailsMobile,
  getUserCreatedChallenges,
} from "../utils/Apicalls";
import moment from "moment";
import { getOngoingChallenges } from "../utils/Apicalls";
// import { getPortfolio } from 'rn-okto-sdk';

const useUserChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [createdChallenges, setCreatedChallenges] = useState([]);
  const [challengesAll, setChallengesAll] = useState([]);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        console.log("Fetching ongoing challenges...");
        const response = await getOngoingChallenges({ status: "UPCOMING" });
        console.log("Challenges response:", response);
        setChallengesAll(response.data);
      } catch (error) {
        setError("Failed to fetch challenges: " + error.message);
      }
    };

    fetchChallenges();
  }, []);

  const fetchDetailsAndChallenges = async () => {
    try {
      // getPortfolio((result, error) => {
      //     if (error) {
      //         setError('Failed to fetch portfolio data: ' + error.message);
      //         return;
      //     }

      //     console.log(result);
      //     console.log(error);
      //     const supportedTokens = JSON.parse(result);
      //     console.log(supportedTokens);
      // });

      console.log("Fetching user details...");
      const userDetails = await getUserDetailsMobile();
      console.log("User details response:", userDetails);

      if (userDetails.success) {
        setDetails(userDetails.data.User.UserID);
      } else {
        setError("Failed to fetch user details: " + userDetails.message);
        return;
      }

      console.log("Fetching user challenges...");
      const userChallenges = await getUserChallenges();
      // console.log("User challenges response:✅✅✅✅✅✅", userChallenges);

      if (userChallenges.success) {
        setChallenges(userChallenges.data);
      } else {
        setError("Failed to fetch user challenges: " + userChallenges.message);
      }
    } catch (error) {
      setError("Error fetching user details or challenges: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchChallengesCreated = async () => {
    try {
      // getPortfolio((result, error) => {
      //     if (error) {
      //         setError('Failed to fetch portfolio data: ' + error.message);
      //         return;
      //     }

      //     console.log(result);
      //     console.log(error);
      //     const supportedTokens = JSON.parse(result);
      //     console.log(supportedTokens);
      // });

      console.log("Fetching user details...");
      const userDetails = await getUserDetailsMobile();
      console.log("User details response:", userDetails);

      if (userDetails.success) {
        setDetails(userDetails.data.User.UserID);
      } else {
        setError("Failed to fetch user details: " + userDetails.message);
        return;
      }

      console.log("Fetching user challenges...");
      const userChallenges = await getUserCreatedChallenges();

      if (userChallenges.success) {
        setCreatedChallenges(userChallenges.data);
      } else {
        setError("Failed to fetch user challenges: " + userChallenges.message);
      }
    } catch (error) {
      setError("Error fetching user details or challenges: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallengesCreated();
    fetchDetailsAndChallenges();
  }, []);

  const refetchChallenges = useCallback(() => {
    fetchDetailsAndChallenges();
    fetchChallengesCreated();
  }, []);

  return {
    challenges,
    details,
    error,
    isLoading,
    refetchChallenges,
    createdChallenges,
  };
};

export default useUserChallenges;
