/* eslint-disable */
// @ts-nocheck
import { useState, useEffect, useCallback } from "react";
import { getOngoingChallengesVote } from "../utils/Apicalls";

const useVoteChallenges = (initialOffset = 0, initialLimit = 5) => {
  const [challenges, setChallenges] = useState([]);
  const [error, setError] = useState("");
  const [offset, setOffset] = useState(initialOffset);
  const [limit, setLimit] = useState(initialLimit);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await getOngoingChallengesVote({
        gameType: 4,
        offset,
        limit,
      });
      if (response.data.length < limit) {
        setHasMore(false);
      }
      setChallenges((prevChallenges) => [...prevChallenges, ...response.data]);
    } catch (error) {
      console.error("Failed to fetch challenges:", error);
      setError("Failed to fetch challenges: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [offset, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchMoreChallenges = () => {
    if (hasMore) {
      setOffset((prevOffset) => prevOffset + limit);
    }
  };

  return { challenges, error, fetchMoreChallenges, hasMore, loading };
};

export default useVoteChallenges;
