import { useState, useCallback } from "react";
import axios from "axios";
import { withDrawApi } from "../utils/Apicalls";
import { err } from "react-native-svg";

const useWithdraw = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const withDraw = useCallback(async (amount) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await withDrawApi(amount);
      console.log(response);
      setSuccess(response.success);
      setMessage(response.message);
      return response;
    } catch (error) {
      setError(error.message);
      if (error.response && error.response.data) {
        setMessage(error.response.data.message); // Use error response message
      } else {
        setMessage(error.message); // Fallback error message
      }
      return error.message;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { withDraw, isLoading, error, success, message };
};

export default useWithdraw;
