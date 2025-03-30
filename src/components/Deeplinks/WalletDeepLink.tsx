import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import { Buffer } from "buffer";
global.Buffer = global.Buffer || Buffer;

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
} from "react-native";
import nacl from "tweetnacl";
import bs58 from "bs58";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { buildUrlPhantom, buildUrlSolflare } from "./buildUrl";
import { DEEP_LINK_FUNCTIONS, LOCALSTORAGE_ITEMS, VIEW_TYPE } from "../../utils/enums";
import * as Linking from "expo-linking";
import { decryptPayload, encryptPayload } from "./helperFunctions";
import { PublicKey } from "@solana/web3.js";
import axios from "axios";
import { BackendURL } from "../../constants/url";
import { useNavigation } from "@react-navigation/native";
import LoadingPopup from "./LoadingPopup";
import { Image } from "react-native";

const WalletDeepLink = ({ setWalletLoggedIn, show, setModalVisible }) => {
  const navigation = useNavigation();
  const loadSession = async () => (await AsyncStorage.getItem("session")) || "";
  const onConnectRedirectLink = Linking.createURL("onConnect");
  // const { setLoggedIn, checkLoginStatus } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [phantomWalletPublicKey, setPhantomWalletPublicKey] = useState(null);
  const [showWalletList, setShowWalletList] = useState(false);
  const popupRef = useRef(null);
  const [logs, setLogs] = useState<string[]>([]);

  const [deepLink, setDeepLink] = useState("");
  const [sharedSecret, setSharedSecret] = useState<Uint8Array>();
  const [session, setSession] = useState<string>();
  const addLog = useCallback(
    (log: string) => setLogs((logs) => [...logs, "> " + log]),
    []
  );
  const clearLog = useCallback(() => setLogs(() => []), []);
  useEffect(() => {
    const initializeKeyPair = async () => {
      try {
        const keyPair = await getOrCreateDappKeyPair();
        console.log("Dapp Key Pair:", keyPair);
      } catch (error) {
        console.error("Error initializing Dapp Key Pair:", error);
      }
    };
    initializeKeyPair();
  }, []);
  const loadSharedSecret = async () => {
    const storedSharedSecret = await AsyncStorage.getItem(
      LOCALSTORAGE_ITEMS.SHARED_SECRET
    );
    console.log("vicky ", storedSharedSecret);
    return storedSharedSecret
      ? Uint8Array.from(JSON.parse(storedSharedSecret))
      : null;
  };

  // Load session from AsyncStorage
  // const loadSession = () => AsyncStorage.getItem("session") || "";
  const getOrCreateDappKeyPair = async () => {
    try {
      const storedDappKeyPair = await AsyncStorage.getItem(
        LOCALSTORAGE_ITEMS.DAPP_KEY_PAIR
      );
      if (storedDappKeyPair) {
        const parsedKeyPair = JSON.parse(storedDappKeyPair);
        return {
          publicKey: new Uint8Array(parsedKeyPair.publicKey),
          secretKey: new Uint8Array(parsedKeyPair.secretKey),
        };
      } else {
        const newKeyPair = nacl.box.keyPair();
        await AsyncStorage.setItem(
          LOCALSTORAGE_ITEMS.DAPP_KEY_PAIR,
          JSON.stringify({
            publicKey: Array.from(newKeyPair.publicKey),
            secretKey: Array.from(newKeyPair.secretKey),
          })
        );
        return newKeyPair;
      }
    } catch (error) {
      console.error("Failed to get or create Dapp Key Pair:", error);
      throw error;
    }
  };

  useEffect(() => {
    const initializeDeeplinks = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) handleDeepLink({ url: initialUrl });
    };

    initializeDeeplinks();
    const listener = Linking.addEventListener("url", handleDeepLink);

    return () => {
      listener.remove();
    };
  }, []);
  const useUniversalLinks = false;
  const buildUrl = (path: string, params: URLSearchParams) =>
    `${useUniversalLinks ? "https://phantom.app/ul/" : "phantom://"
    }v1/${path}?${params.toString()}`;
  const handleDeepLink = ({ url }) => {
    setDeepLink(url);
  };
  // BackendURL
  const getVerificationMessage = async () => {
    try {
      const walletAddress = await AsyncStorage.getItem(
        LOCALSTORAGE_ITEMS.WALLET_ADDRESS
      );
      const response = await axios.get(
        `${BackendURL}/auth/wallet/verificationMessage/${walletAddress}`
      );
      if (response.data.success) {
        console.log("Verification message received:", response.data.data);
        return response.data.data;
      } else {
        console.log("Failed to get verification message");
        // setErrorMessage("Failed to get verification message");
        return null;
      }
    } catch (error) {
      console.log("Error fetching verification message", error);
      //setErrorMessage("Error fetching verification message");
      return null;
    }
  };
  const signMessage = async (walletapp: string) => {
    const session = await loadSession();
    console.log(session);
    const dappKeyPair = await getOrCreateDappKeyPair();
    console.log(dappKeyPair);

    const sharedSecret = await loadSharedSecret();
    console.log(sharedSecret);
    if (!session || !sharedSecret) return;

    const walletAddress = await AsyncStorage.getItem(
      LOCALSTORAGE_ITEMS.WALLET_ADDRESS
    );
    if (!walletAddress) {
      alert("No wallet address found in AsyncStorage.");
      return;
    }

    try {
      // Fetch the verification message
      const message = await getVerificationMessage();
      await AsyncStorage.setItem(
        LOCALSTORAGE_ITEMS.VERIFICATION_MESSAGE,
        message
      );
      if (!message) return;

      const payload = {
        session,
        message: bs58.encode(new Uint8Array(Buffer.from(message))),
      };

      const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);
      const params = new URLSearchParams({
        dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
        nonce: bs58.encode(nonce),
        redirect_link: "catoff://onSign",
        payload: bs58.encode(encryptedPayload),
      });

      if (walletapp == "phantom") {
        const url = buildUrlPhantom(DEEP_LINK_FUNCTIONS.SIGN_MESSAGE, params);
        Linking.openURL(url);
      } else {
        const url = buildUrlSolflare(DEEP_LINK_FUNCTIONS.SIGN_MESSAGE, params);
        Linking.openURL(url);
      }
    } catch (error) {
      console.error("Failed to sign message:", error);
    }
  };

  useEffect(() => {
    if (!deepLink) return;

    const handleDeepLink = async () => {
      try {
        const dappKeyPair = await getOrCreateDappKeyPair();
        const url = new URL(deepLink);
        const params = url.searchParams;

        if (params.get("errorCode")) {
          const error = Object.fromEntries([...params]);
          const message = error?.errorMessage ?? JSON.stringify(error, null, 2);
          Alert.alert("Wallet Connection Error", message);
          return;
        }

        console.log(url);
        console.log("params");

        if (/onConnect/.test(url.pathname || url.host)) {
          const phantomEncryptionKey = params.get(
            "phantom_encryption_public_key"
          );
          const data = params.get("data");
          const nonce = params.get("nonce");
          console.log(phantomEncryptionKey);
          console.log(data);
          console.log(nonce);
          if (!phantomEncryptionKey || !data || !nonce) {
            addLog("Missing required parameters for connection.");
            return;
          }

          const sharedSecretDapp = nacl.box.before(
            bs58.decode(phantomEncryptionKey),
            dappKeyPair.secretKey
          );
          // cons
          await AsyncStorage.setItem(
            LOCALSTORAGE_ITEMS.SHARED_SECRET,
            JSON.stringify(Array.from(sharedSecretDapp))
          );
          console.log("vicky.........");

          const connectData = decryptPayload(data, nonce, sharedSecretDapp);
          await AsyncStorage.setItem(
            LOCALSTORAGE_ITEMS.SESSION,
            connectData.session
          );
          await AsyncStorage.setItem(
            "publicKey",
            connectData.public_key.toString()
          );
          await AsyncStorage.setItem(
            LOCALSTORAGE_ITEMS.WALLET_ADDRESS,
            connectData.public_key.toString()
          );
          setSharedSecret(sharedSecretDapp);

          setSession(connectData.session);
          setPhantomWalletPublicKey(new PublicKey(connectData.public_key));
          const walletapp = params.has("phantom_encryption_public_key")
            ? "phantom"
            : "solflare";
          console.log("walletapp ", walletapp);
          await signMessage(walletapp);
        }

        if (/onSign/.test(url.pathname || url.host)) {
          await handleSign(params);
        }
      } catch (error) {
        setLoading(false);
        console.error("Error handling deep link:", error);
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      }
    };

    handleDeepLink();
  }, [deepLink]);
  const loginUser = async (message, signature, publicKey) => {
    try {
      const payload = {
        message: message,
        signature: signature,
        publickey: publicKey,
      };

      console.log("Sending payload to API:", payload);

      const response = await axios.post(
        "https://mainnet-apiv2.catoff.xyz/auth/wallet/login",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response:", response.data);

      if (response.data.success) {
        await AsyncStorage.setItem("VIEW_TYPE", VIEW_TYPE.DEEP_LINK_VIEW)
        await AsyncStorage.setItem(
          "authToken",
          response.data.data.access_token
        );
        await AsyncStorage.setItem(
          "refreshToken",
          response.data.data.refresh_token
        );
        setLoading(false);
        // @ts-ignore
        navigation.navigate("ExploreStack");
        return response.data.data;
      } else {
        setLoading(false);
        throw new Error("Login failed");
      }
    } catch (error) {
      setLoading(false);
      console.error("API request failed:", error);

      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error status:", error.response.status);
        console.error("Error headers:", error.response.headers);
      } else if (error.request) {
        console.error("Error request details:", error.request);
      } else {
        console.error("Error message:", error.message);
      }

      throw error;
    }
  };
  const handleSign = async (params: URLSearchParams) => {
    try {
      const sharedSecret = await loadSharedSecret();
      const data = params.get("data");
      const nonce = params.get("nonce");

      if (!data || !nonce || !sharedSecret) {
        console.error("Missing parameters in the URL for signing.");
        return;
      }

      const signData = decryptPayload(data, nonce, sharedSecret);
      console.log("Decrypted Signed Data:", signData);

      const storedWalletAddress = await AsyncStorage.getItem(
        LOCALSTORAGE_ITEMS.WALLET_ADDRESS
      );
      const message = await AsyncStorage.getItem(
        LOCALSTORAGE_ITEMS.VERIFICATION_MESSAGE
      );

      if (storedWalletAddress && message && signData) {
        // const walletAddress = new PublicKey(storedWalletAddress);
        await loginUser(message, signData.signature, storedWalletAddress);
      } else {
        alert("No wallet address found in localStorage.");
      }
    } catch (error) {
      console.error("Failed to handle signing:", error);
    }
  };
  const connect = async (walletApp) => {
    try {
      setLoading(true);
      setModalVisible(false);
      console.log(onConnectRedirectLink);
      const dappKeyPair = await getOrCreateDappKeyPair();
      const params = new URLSearchParams({
        dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
        cluster: "mainnet-beta",
        app_url: "https://game.catoff.xyz",
        redirect_link: "catoff://onConnect",
      });
      console.log(params.toString());
      const url = buildUrl("connect", params);
      Linking.openURL(url);
    } catch (error) {
      console.error("Connection error:", error);
      Alert.alert("Connection Error", "Failed to connect to wallet");
    }
  };

  return (
    <View style={styles.container}>
      <LoadingPopup visible={loading} />
      <Modal
        visible={show}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <View style={styles.indicator} />
                <Text style={styles.modalTitle}>Detected Wallets</Text>
                <Text style={styles.modalSubtitle}>
                  Choose your preferred wallet
                </Text>

                <TouchableOpacity
                  style={styles.walletOption}
                  onPress={() => connect("phantom")}
                  activeOpacity={0.7}
                >
                  <Image
                    source={require("../../assets/wallet/Phantom-Icon_App_60x60.png")}
                    style={styles.walletLogo}
                  />
                  <Text style={styles.walletText}>Phantom</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.walletOption, styles.disabledOption]}
                  disabled
                  activeOpacity={0.7}
                >
                  <Image
                    source={require("../../assets/wallet/solflare.png")}
                    style={styles.walletLogo}
                  />
                  <View>
                    <Text style={styles.walletText}>Solflare</Text>
                    <Text style={styles.comingSoon}>Coming soon</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  walletLogo: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    maxHeight: "60%", // Ensure content height doesn't exceed 60% of the screen
  },
  indicator: {
    width: 40,
    height: 4,
    backgroundColor: "#CCC",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#6B6B6B",
    marginBottom: 16,
    textAlign: "center",
  },
  walletOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    marginVertical: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  walletText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  comingSoon: {
    fontSize: 12,
    color: "red",
    marginLeft: 5,
  },
  disabledOption: {
    opacity: 0.6,
  },
});

export default WalletDeepLink;
