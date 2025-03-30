import { useState, useEffect, useRef } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
const BackendURL = "https://mainnet-apiv2.catoff.xyz";
// const BackendURL = "https://stagingapi3.catoff.xyz";

const useWallets = () => {
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState("");
  const [isDropdownOpenWallet, setIsDropdownOpenWallet] = useState(false);
  const dropdownWalletRef = useRef(null);
  //   const getToken = () => { // kya chata h
  //     return (
  //       AsyncStorage.getItem("authToken") || AsyncStorage.getItem("refreshToken")
  //     );
  //   };

  useEffect(() => {
    const fetchWallets = async () => {
      const auth2 = await AsyncStorage.getItem("authToken");
      const headers = {
        Authorization: `Bearer ${auth2}`,
      };

      try {
        const response = await axios.get(`${BackendURL}/user/getWallets`, {
          headers,
        });
        if (response.status === 200) {
          setWallets(response.data.data);
          if (response.data.data.length > 0)
            setSelectedWallet(response.data.data[0].PublicKey);
        } else {
          console.error("Error fetching wallets", response.data);
        }
      } catch (error) {
        console.error("Error fetching wallets", error);
      }
    };

    fetchWallets();
  }, [BackendURL]);

  return {
    wallets,
    selectedWallet,
    setSelectedWallet,
    isDropdownOpenWallet,
    setIsDropdownOpenWallet,
    dropdownWalletRef,
  };
};

export default useWallets;
