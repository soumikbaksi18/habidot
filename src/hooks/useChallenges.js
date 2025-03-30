/* eslint-disable */
// @ts-nocheck
import { useState, useEffect, useCallback } from "react";
import { getOngoingChallenges } from "../utils/Apicalls";

const useChallenges = (bodyParams) => {
  const [challenges, setChallenges] = useState([]);
  const [error, setError] = useState("");

  const fetchChallenges = useCallback(
    async (reset = false) => {
      try {
        const response = await getOngoingChallenges({
          status: "UPCOMING",
          limit: 10,
          offset: (bodyParams?.page ?? 0) * 10,
        });
        console.log("Challenges response:", response);

        if (response.data.length === 0 || response.data.length < 10) {
          bodyParams.setMoreChallengesButton(false);
        }

        if (response.success) {
          setChallenges((prevChallenges) => {
            return reset
              ? [...response.data]
              : [...prevChallenges, ...response.data];
          });
        }
      } catch (error) {
        console.error("Failed to fetch challenges:", error);
        setError("Failed to fetch challenges: " + error);
      }
    },
    [bodyParams?.page]
  );

  useEffect(() => {
    fetchChallenges();
  }, [bodyParams.page, fetchChallenges]);

  const refetchChallenges = useCallback(async () => {
    bodyParams.setPage(0);
    await fetchChallenges(true);
  }, [fetchChallenges, bodyParams]);

  return { challenges, error, refetchChallenges };
};

export default useChallenges;
