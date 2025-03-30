import { useState, useEffect } from "react";
import { fetchSolPrice } from "../utils/Apicalls";

const useSolPrice = () => {
  const [solPrice, setSolPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); 
      try {
        const solData = await fetchSolPrice(); 
        setSolPrice(solData?.data?.priceInUsd); 
        setError(null); 
      } catch (error) {
        console.error("Error fetching Sol price:", error);
        setError("Failed to fetch SOL price");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const convertCreditsToUSDT = (credits) => {
    if (!solPrice) return null;
    return ((credits / 1000) * solPrice).toFixed(6);
  };
  const convertCreditsToSOL = (credits) => {
    if (!solPrice) return null;
    return credits * solPrice;
  };

  return {
    solPrice,
    loading,
    error,
    convertCreditsToUSDT,
    convertCreditsToSOL,
  };
};

export default useSolPrice;
