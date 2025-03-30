import axios from "axios";
// const BackendURL = "https://stagingapi3.catoff.xyz";
const BackendURL = "https://mainnet-apiv2.catoff.xyz";
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImlhdCI6MTcxMzc4NDY0NCwiZXhwIjoxNzEzODAyNjQ0fQ.1-zJItQuna0IL8ADW7GsdZGDrbzdjQqP7ONEUWBnsew";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { err } from "react-native-svg";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
// import { getTxObjectForDeeplink, initDummyWeb3, tokenAccounts ,parseToPrecision,tokenDecimals} from "./web3.js";
import { ONCHAIN_PARTICIPATE_TYPE, VERIFIED_CURRENCY } from "./enums";
// import { ExecuteRawTransaction } from "okto-sdk-react";

const { Program, AnchorProvider, Wallet } = require("@coral-xyz/anchor");
const {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
} = require("@solana/web3.js");
const idl = require("../constants/idl.json");

const {
  bonkMintAddress,
  escrowAccountPublicKey,
  progId,
  sendMintAddress,
  usdcMintAddress,
} = require("../constants/url");

import base58 from "bs58";
import BigNumber from "bignumber.js";
import { Alert } from "react-native";
const debugLog = (step, data) => {
  console.log(`DEBUG [${step}]:`, data);
};
const web3Constants = {
  programId: progId,
  USDC_MINT_ADDRESS: usdcMintAddress,
  BONK_MINT_ADDRESS: bonkMintAddress,
  SEND_MINT_ADDRESS: sendMintAddress,
  escrowAccountPublicKey: escrowAccountPublicKey,
  TOKEN_PROGRAM_ID: new PublicKey(
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
  ),
  READ_ONLY_PRIV_KEY: (() => {
    debugLog("Creating READ_ONLY_PRIV_KEY", "Started");
    try {
      const privateKeyString =
        "3j35gJena7bTxgsmWHUGwGd5fpdp24v8pSSGMDerXPqHQxM4Wdo5E5HcYEaGBZsP9tvXZQ3KJSSRGdLHzhMzmkyb";
      debugLog("Private Key String", privateKeyString);

      const decodedKey = base58.decode(privateKeyString);
      debugLog("Decoded Key Length", decodedKey.length);

      // Ensure proper Uint8Array conversion
      const keyUint8Array = Uint8Array.from(decodedKey);
      debugLog("Uint8Array Length", keyUint8Array.length);

      const keypair = Keypair.fromSecretKey(keyUint8Array);
      debugLog("Keypair Created", {
        publicKey: keypair.publicKey.toString(),
      });

      return keypair;
    } catch (error) {
      debugLog("Error in READ_ONLY_PRIV_KEY", error);
      console.error("Error creating keypair:", error);
      return Keypair.generate();
    }
  })(),
  minTxFees: 100000,
};

const tokenDecimals = {
  SOL: 9,
  USDC: 6,
  BONK: 5,
  SEND: 6,
};

// import BigNumber from 'bignumber.js';

const parseToPrecision = (amount, decimals) => {
  if (!amount || isNaN(amount)) {
    throw new TypeError("Invalid amount provided");
  }
  if (decimals == null || isNaN(decimals)) {
    throw new TypeError("Invalid decimals provided");
  }

  // BigNumber with alternate operations
  const amountFormatted = new BigNumber(amount);
  const multiplier = new BigNumber(10).pow(decimals);
  const result = amountFormatted.times(multiplier).toString(); // Alternate method for multiplication

  return result;
};

const initWeb3 = async (connection, wallet) => {
  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: "processed",
  });
  const program = new Program(idl, web3Constants.programId, provider);
  return { program };
};

const initDummyWeb3 = async (network_name) => {
  console.log(network_name);
  const connectionUrl =
    network_name === "SOLANA"
      ? "https://api.mainnet-beta.solana.com"
      : "https://api.devnet.solana.com";

  console.log("🌐 Connecting to Solana network at URL:", connectionUrl);

  const connection = new Connection(connectionUrl, "confirmed");
  console.log("connection ", connection);
  const provider = new AnchorProvider(
    connection,
    {},
    {
      preflightCommitment: "processed",
    }
  );
  console.log("Provider", provider);
  const program = new Program(idl, web3Constants.programId, provider);
  // console.log(program)

  console.log(program);
  return { program, connection };
};

const getAssociatedTokenAccount = async (
  connection,
  addr,
  tokenMintAddress
) => {
  const Accountaddress = new PublicKey(addr);
  const tokenList = await connection.getTokenAccountsByOwner(Accountaddress, {
    mint: new PublicKey(tokenMintAddress),
  });
  return tokenList.value[0]?.pubkey || null;
};

const tokenAccounts = async (data) => {
  const { connection, currency, escrowPublicKey, userPublicKey } = data;
  let TOKEN_MINT_ADDRESS;
  switch (currency) {
    case "USDC":
      TOKEN_MINT_ADDRESS = web3Constants.USDC_MINT_ADDRESS;
      break;
    case "SOL":
      TOKEN_MINT_ADDRESS = web3Constants.USDC_MINT_ADDRESS;
      break;
    case "BONK":
      TOKEN_MINT_ADDRESS = web3Constants.BONK_MINT_ADDRESS;
      break;
    case "SEND":
      TOKEN_MINT_ADDRESS = web3Constants.SEND_MINT_ADDRESS;
      break;
    default:
      break;
  }

  const escrowTokenAccount = await getAssociatedTokenAccount(
    connection,
    escrowPublicKey,
    TOKEN_MINT_ADDRESS
  );
  if (!escrowTokenAccount) {
    throw new Error(
      "Failed to get or create associated token account for escrow."
    );
  }

  const userTokenAccount = await getAssociatedTokenAccount(
    connection,
    userPublicKey,
    TOKEN_MINT_ADDRESS
  );
  if (!userTokenAccount) {
    throw new Error("Failed to get associated token account for user.");
  }

  return { escrowTokenAccount, userTokenAccount };
};

const txFeesChecker = async (data) => {
  try {
    const { connection, userPublicKey } = data;
    const balance = await connection.getBalance(userPublicKey);
    if (balance < web3Constants.minTxFees) {
      throw new Error(
        `Insufficient SOL balance to cover transaction fees, balance is ${balance} Lamports`
      );
    }
    return { error: null };
  } catch (error) {
    console.error(`transaction fees checker failed: ${error}`);
    return { error: `transaction fees checker failed: ${error}` };
  }
};

const getTxObject = async (data) => {
  try {
    const {
      onchainParticipateType,
      wallet,
      connection,
      playerId,
      challengeId,
      amount,
      currency,
      userPublicKey,
      userTokenAccount,
      escrowTokenAccount,
    } = data;

    const { program } = await initWeb3(connection, wallet);

    // Convert amount to BN and ensure proper PublicKey objects
    const transaction = await program.methods
      .participate(currency, new BN(amount), challengeId, playerId, {
        [onchainParticipateType]: {},
      })
      .accounts({
        user: new PublicKey(userPublicKey),
        userTokenAccount: new PublicKey(userTokenAccount),
        escrowTokenAccount: new PublicKey(escrowTokenAccount),
        escrowAccount: web3Constants.escrowAccountPublicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: web3Constants.TOKEN_PROGRAM_ID,
      })
      .transaction();

    transaction.feePayer = wallet.publicKey;
    transaction.recentBlockhash = (
      await program.provider.connection.getLatestBlockhash()
    ).blockhash;

    const signedTransaction = await wallet.signTransaction(transaction);
    return { data: signedTransaction, error: null };
  } catch (error) {
    console.error(`Web3 Transaction Build Failed: ${error}`);
    return {
      data: null,
      error: `Web3 Transaction Build Failed: ${error.message || error}`,
    };
  }
};

const getTxObjectForDeeplink = async (data) => {
  debugLog("getTxObjectForDeeplink Input", {
    onchainParticipateType: data.onchainParticipateType,
    walletAddr: data.walletAddr,
    playerId: data.playerId,
    challengeId: data.challengeId,
    amount: data.amount,
    currency: data.currency,
  });

  try {
    const {
      onchainParticipateType,
      walletAddr,
      playerId,
      challengeId,
      amount,
      currency,
      userTokenAccount,
      escrowTokenAccount,
      program,
    } = data;

    // Validate and convert inputs
    debugLog("Converting wallet address", walletAddr);
    const userPublicKey = new PublicKey(walletAddr);
    debugLog("CCnverted Public 🔥", userPublicKey);

    debugLog("Converting token accounts", {
      userTokenAccount,
      escrowTokenAccount,
    });

    const userTokenAccountPubkey = new PublicKey(userTokenAccount);
    const escrowTokenAccountPubkey = new PublicKey(escrowTokenAccount);

    debugLog("Converting amount", amount);
    const amountBN = new BN(amount, 16);

    debugLog("Building transaction", {
      currency,
      amountBN: amountBN.toString(),
      challengeId,
      playerId,
    });

    const transaction = await program.methods
      .participate(currency, amountBN, challengeId, playerId, {
        [onchainParticipateType]: {},
      })
      .accounts({
        user: userPublicKey,
        userTokenAccount: userTokenAccountPubkey,
        escrowTokenAccount: escrowTokenAccountPubkey,
        escrowAccount: web3Constants.escrowAccountPublicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: web3Constants.TOKEN_PROGRAM_ID,
      })
      .transaction();

    debugLog("Transaction built successfully", {
      feePayer: walletAddr,
    });

    transaction.feePayer = userPublicKey;
    transaction.recentBlockhash = (
      await program.provider.connection.getLatestBlockhash()
    ).blockhash;

    debugLog("Transaction prepared", {
      blockhash: transaction.recentBlockhash,
    });

    return { data: transaction, error: null };
  } catch (error) {
    debugLog("Transaction Error", {
      message: error.message,
      stack: error.stack,
    });
    console.error(
      `Web3 Transaction Build with deeplink wallet Failed: ${error}`
    );
    return {
      data: null,
      error: `Web3 Transaction Build with deeplink wallet Failed: ${
        error.message || error
      }`,
    };
  }
};
const validateTransactionData = (data) => {
  const requiredFields = [
    "onchainParticipateType",
    "walletAddr",
    "playerId",
    "challengeId",
    "amount",
    "currency",
    "userTokenAccount",
    "escrowTokenAccount",
    "program",
  ];

  const missingFields = requiredFields.filter((field) => !data[field]);

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  // Validate data types
  if (typeof data.amount !== "number" && typeof data.amount !== "string") {
    throw new Error(`Invalid amount type: ${typeof data.amount}`);
  }

  if (typeof data.walletAddr !== "string") {
    throw new Error(`Invalid wallet address type: ${typeof data.walletAddr}`);
  }

  return true;
};

// Add this where you call getTxObjectForDeeplink
const initiateTransaction = async (transactionData) => {
  try {
    debugLog("Transaction Initiation", "Started");
    validateTransactionData(transactionData);

    const result = await getTxObjectForDeeplink(transactionData);

    if (result.error) {
      debugLog("Transaction Failed", result.error);
      throw new Error(result.error);
    }

    debugLog("Transaction Success", "Transaction object created");
    return result;
  } catch (error) {
    debugLog("Transaction Error", error);
    throw error;
  }
};

const oktoSanityChecks = async (data) => {
  try {
    const { portFolio, wager, currency } = data;
    const solToken = portFolio.tokens.find(
      (token) => token.token_name === "SOL_DEVNET" || token.token_name === "SOL"
    );

    if (!solToken) {
      throw new Error("SOL token not found in the portfolio.");
    }

    if (currency === "SOL") {
      const solBalance = parseFloat(solToken.quantity);
      const requiredBalance = 0.0001 + wager;
      if (solBalance < requiredBalance) {
        throw new Error(
          "Insufficient SOL balance to cover transaction fees and wager."
        );
      }
    } else {
      const solBalance = parseFloat(solToken.quantity);
      const requiredSOLBalance = web3Constants.minTxFees;
      if (solBalance < requiredSOLBalance) {
        throw new Error("Insufficient SOL balance to cover transaction fees.");
      }

      const SPLToken = portFolio.tokens.find(
        (token) => token.token_name === currency
      );
      if (!SPLToken) {
        throw new Error(`${currency} token not found in the portfolio.`);
      }

      const tokenBalance = parseFloat(SPLToken.quantity);
      const requiredTokenBalance = wager;
      if (tokenBalance < requiredTokenBalance) {
        throw new Error(`Insufficient ${currency} balance to cover the wager.`);
      }
    }

    return { error: null };
  } catch (error) {
    console.error(`Okto checks failed: ${error}`);
    return { error: error.message };
  }
};

const getToken = async () => {
  return await AsyncStorage.getItem("authToken");
};
//API CALLS FLOW
//GOOGLE AUTH FLOW ON THE LOGIN PAGE
const redirectGoogleAuth = async () => {
  try {
    window.location.href = `${BackendURL}/auth/googleAuth`;
  } catch (error) {}
};

const serverGoogleAuth = async (code) => {
  let body = JSON.stringify({
    code: code,
  });
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const response = await axios.post(
      `${BackendURL}/auth/googleAuth/login`,
      body,
      config
    );
    return response.data;
  } catch (error) {
    return error.message;
  }
};

const refreshServer = async (code) => {
  const auth = await AsyncStorage.getItem("refreshToken");
  const auth2 = await AsyncStorage.getItem("authToken");
  console.log(auth);
  console.log(auth2);
  let headers = {
    Authorization: `Bearer ${auth}`,
  };

  try {
    const response = await axios.post(
      `${BackendURL}/auth/refresh`,
      {},
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.message;
  }
};
const getOngoingChallengesVote = async ({
  status,
  gameType,
  offset,
  limit,
}) => {
  const auth = await AsyncStorage.getItem("authToken");
  const headers = {
    Authorization: `Bearer ${auth}`,
  };
  const body = {
    status,
    gameType,
    offset,
    limit,
  };
  try {
    const response = await axios.post(`${BackendURL}/challenge/filter`, body, {
      headers,
    });
    return response.data;
  } catch (error) {
    return error;
  }
};
// ACCOUNT FETCHING SCREEN
const authenticateAPI = async () => {
  const auth = await AsyncStorage.getItem("authToken");
  let headers = {
    Authorization: `Bearer ${auth}`,
  };
  try {
    const response = await axios.post(
      `${BackendURL}/oktoProxy/authPinCreate`,
      {},
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.message;
  }
};

//first time user flow

const setPinAPI = async () => {
  const auth = await AsyncStorage.getItem("authToken");
  let headers = {
    Authorization: `Bearer ${auth}`,
  };
  try {
    const response = await axios.post(
      `${BackendURL}/oktoProxy/set_pin`,
      {},
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.message;
  }
};

const createWallet = async () => {
  const auth = await AsyncStorage.getItem("authToken");
  let headers = {
    Authorization: `Bearer ${auth}`,
  };
  try {
    const response = await axios.post(
      `${BackendURL}/oktoProxy/create_wallet`,
      {},
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.message;
  }
};

const fetchSolPrice = async () => {
  const auth = await AsyncStorage.getItem("authToken");
  const headers = {
    Authorization: `Bearer ${auth}`,
    Accept: "application/json",
  };

  try {
    const response = await axios.get(`${BackendURL}/price/sol`, { headers });
    return response.data;
  } catch (error) {
    console.error("Error fetching Sol price:", error);
    throw error;
  }
};

//logging in flow

const getRefreshTokenAPI = async () => {
  const auth = await AsyncStorage.getItem("authToken");
  let headers = {
    Authorization: `Bearer ${auth}`,
  };
  try {
    const response = await axios.post(
      `${BackendURL}/oktoProxy/refreshToken`,
      {},
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.message;
  }
};

const getUserWalletAPI = async () => {
  const auth = await AsyncStorage.getItem("authToken");
  let headers = {
    Authorization: `Bearer ${auth}`,
  };

  try {
    const response = await axios.get(`${BackendURL}/oktoProxy/wallets`, {
      headers,
    });
    return response.data;
  } catch (error) {
    return error.message;
  }
};

//EXPLORE PAGE

const getChallenges = async (challengeID) => {
  const auth = await AsyncStorage.getItem("authToken");
  let headers = {
    Authorization: `Bearer ${auth}`,
  };
  try {
    const response = await axios.get(
      `${BackendURL}/challenge/dashboard/${challengeID}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.message;
  }
};
const getChallengesById = async (challengeID) => {
  const auth = await AsyncStorage.getItem("authToken");
  let headers = {
    Authorization: `Bearer ${auth}`,
  };
  try {
    const response = await axios.get(`${BackendURL}/challenge/${challengeID}`, {
      headers,
    });
    return response.data;
  } catch (error) {
    return error.message;
  }
};

const getOngoingChallenges = async (body) => {
  const auth = await AsyncStorage.getItem("authToken");
  let headers = {
    Authorization: `Bearer ${auth}`,
  };

  try {
    const response = await axios.post(`${BackendURL}/challenge/filter`, body, {
      headers,
    });
    return response.data;
  } catch (error) {
    return error.message;
  }
};

const searchChallengeAPI = async (search, page, limit) => {
  const auth = await AsyncStorage.getItem("authToken");
  let headers = {
    Authorization: `Bearer ${auth}`,
  };

  try {
    const response = await axios.get(
      `${BackendURL}/challenge/challenges/search/${search}?page=${page}&limit=${limit}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.message;
  }
};

//CREATE CHALLENGE PAGE

const createChallengeAPI = async (challengeDetails) => {
  const auth = await AsyncStorage.getItem("authToken");
  const headers = {
    Authorization: `Bearer ${auth}`,
  };

  try {
    const response = await axios.post(
      `${BackendURL}/challenge`,
      challengeDetails,
      { headers }
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      return {
        success: false,
        status: error.response.status,
        message: error.response.data.message || "An error occurred",
        data: error.response.data,
      };
    } else if (error.request) {
      return {
        success: false,
        message:
          "No response from server. Please check your network connection.",
        data: null,
      };
    } else {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }
};

//CHALLENGE DETAILS PAGE

//CHALLENGE JOIN FLOW4

const joinChallengeAPI = async (challengeName) => {
  const auth = await AsyncStorage.getItem("authToken");
  let headers = {
    Authorization: `Bearer ${auth}`,
  };

  let body = {
    ChallengeID: parseInt(challengeName),
  };

  try {
    const response = await axios.post(`${BackendURL}/player`, body, {
      headers,
    });
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

//user dashboard page

const getUserChallenges = async () => {
  const auth = await AsyncStorage.getItem("authToken");
  let headers = {
    Authorization: `Bearer ${auth}`,
  };
  try {
    const response = await axios.get(
      `${BackendURL}/userBoard/dashboard/userCurrentTable`,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.message;
  }
};
const getUserCreatedChallenges = async () => {
  const auth = await AsyncStorage.getItem("authToken");
  let headers = {
    Authorization: `Bearer ${auth}`,
  };
  try {
    const response = await axios.get(
      `${BackendURL}/userBoard/dashboard/userChallenges`,
      { headers }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    return error.message;
  }
};

const getUserDetails = async () => {
  const auth = await AsyncStorage.getItem("authToken");
  let headers = {
    Authorization: `Bearer ${auth}`,
  };
  try {
    const response = await axios.get(
      `${BackendURL}/userBoard/dashboard/userDetails`,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.message;
  }
};

const getUserTransaction = async () => {
  const auth = await AsyncStorage.getItem("authToken");
  let headers = {
    Authorization: `Bearer ${auth}`,
    accept: "application/json",
  };

  try {
    const response = await axios.get(
      `${BackendURL}/userBoard/dashboard/userTransaction`,
      { headers }
    );

    if (response.status === 200) {
      return response.data; // Return the transaction details on success
    } else {
      return { success: false, message: "Failed to fetch transaction details" };
    }
  } catch (error) {
    // Log the error and return a failure message
    console.error("API Error:", error);
    return { success: false, message: error.message };
  }
};

const postUpdateCoverHex = async (coverHexCode) => {
  const auth = await AsyncStorage.getItem("authToken");
  let headers = {
    Authorization: `Bearer ${auth}`,
    "Content-Type": "application/json",
  };

  const body = {
    coverHexCode,
  };

  try {
    const response = await axios.post(
      `${BackendURL}/user/update-cover-hex`,
      body,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: error.message };
  }
};
const postUploadImage = async (formData) => {
  try {
    // Retrieve the authorization token from AsyncStorage
    const auth = await AsyncStorage.getItem("authToken");

    // Set headers including authorization and content type
    const headers = {
      Authorization: `Bearer ${auth}`,
      "Content-Type": "multipart/form-data",
    };

    // Make the POST request using axios
    const response = await axios.post(
      `${BackendURL}/user/upload-image`, // Ensure BackendURL is correctly defined
      formData,
      { headers }
    );

    return response.data; // Assuming the response.data follows the specified schema
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: error.message }; // Handle error response
  }
};
const postUserUpdate = async (userDetails) => {
  const auth = await AsyncStorage.getItem("authToken");
  let headers = {
    Authorization: `Bearer ${auth}`,
    "Content-Type": "application/json",
  };

  const body = {
    name: userDetails.UserName, // or another value if different from UserName
    bio: userDetails.Bio,
    tag: userDetails.Tag,
  };

  try {
    const response = await axios.post(`${BackendURL}/user/update`, body, {
      headers,
    });
    return response.data;
  } catch (error) {
    return error.message;
  }
};

const getUserDetailsMobile = async () => {
  const auth = await AsyncStorage.getItem("authToken");
  let headers = {
    Authorization: `Bearer ${auth}`,
  };
  try {
    const response = await axios.get(
      `${BackendURL}/userBoard/dashboard/userDetailsMobile`,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.message;
  }
};

//CHALLENGE PROGRESS PAGE

const getChallengeDashboard = async (challengeID) => {
  const auth = await AsyncStorage.getItem("authToken");
  let headers = {
    Authorization: `Bearer ${auth}`,
  };
  try {
    const response = await axios.get(
      `${BackendURL}/challenge/dashboard/${challengeID}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.message;
  }
};
const getChallengeById = async (challengeID) => {
  const auth = await AsyncStorage.getItem("authToken");
  let headers = {
    Authorization: `Bearer ${auth}`,
  };
  try {
    const response = await axios.get(`${BackendURL}/challenge/${challengeID}`, {
      headers,
    });
    return response.data;
  } catch (error) {
    return error.message;
  }
};

const getLeaderboard = async (challengeID) => {
  const auth = await AsyncStorage.getItem("authToken");
  let headers = {
    Authorization: `Bearer ${auth}`,
  };
  try {
    const response = await axios.get(
      `${BackendURL}/challenge/leaderboard/${challengeID}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.message;
  }
};

const withDrawApi = async (amount) => {
  const auth = await AsyncStorage.getItem("authToken");
  console.log(auth);
  let headers = {
    Authorization: `Bearer ${auth}`,
  };
  let body = {
    amount: parseInt(amount),
    currency: "SOL",
  };

  try {
    const response = await axios.post(`${BackendURL}/user/withdraw`, body, {
      headers,
    });
    console.log(response);
    return response.data;
  } catch (error) {
    console.log(error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
      return error.response.data; // Return the response body data from the error
    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log("Error", error.message);
    }
    console.log(error.config);
    return { success: false, message: error.message }; // Fallback error response
  }
};

// const uploadFileApi = async (file) => {
//  const auth = await AsyncStorage.getItem('authToken');

//   let headers = {
//     Authorization: `Bearer ${auth}`,
//     'Content-Type': 'multipart/form-data',
//   }
//   const formData = new FormData()
//   formData.append('file', file)

//   try {
//     const response = await axios.post(
//       `https://ipfs.catoff.xyz/upload`,
//       formData,
//       { headers }
//     )
//     return response.data
//   } catch (error) {
//     return error.message
//   }
// }

const getShareableChallengeLink = async (challengeID) => {
  const auth = await AsyncStorage.getItem("authToken");
  let headers = {
    Authorization: `Bearer ${auth}`,
  };
  try {
    const response = await axios.get(
      `${BackendURL}/challenge/share/${challengeID}`,
      { headers }
    );
    return response.data.data.Link;
  } catch (error) {
    return error.message;
  }
};

// get sharable link from slug
const getShareableLinkFromSlug = async (slug) => {
  try {
    const response = await axios.get(`${BackendURL}/challenge/share/${slug}`, {
      headers: {
        accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    return error;
  }
};

const getReclaimProof = async (challengeID) => {
  const auth = await AsyncStorage.getItem("authToken");
  let headers = {
    Authorization: `Bearer ${auth}`,
  };

  let body = {
    AppName: "TWITTER_ANALYTICS_VIEWS",
    ChallengeID: parseInt(challengeID),
  };

  try {
    const response = await axios.post(`${BackendURL}/reclaim/sign`, body, {
      headers,
    });
    return response.data;
  } catch (error) {
    return error.message;
  }
};

const getSubmissions = async (challengeID) => {
  const auth = await AsyncStorage.getItem("authToken");
  let headers = {
    Authorization: `Bearer ${auth}`,
  };
  try {
    const response = await axios.get(
      `${BackendURL}/player/submissions/${challengeID}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.message;
  }
};

const uploadFileApi = async (file) => {
  const auth = await AsyncStorage.getItem("authToken");
  let headers = {
    Authorization: `Bearer ${auth}`,
    "Content-Type": "multipart/form-data",
    "x-api-key":
      "b4a801ccf04d7ba4580145c7a62d7aceafc8319f0c8d7daeb9a970f722ebcfb8",
  };
  const formData = new FormData();
  formData.append("file", { uri: file, name: "image.jpg", type: "image/jpeg" });

  try {
    console.log("hi from ipfs");
    const response = await axios.post(
      `https://ipfs.catoff.xyz/upload`,
      formData,
      { headers }
    );
    console.log("upload image value  api ", response.data);
    return response.data;
  } catch (error) {
    console.error("Upload error:", error.response.data);
    return null;
  }
};

const submitClaim = async (challengeID, value, Url) => {
  console.log(challengeID);
  console.log(value);
  console.log(Url);
  const auth = await AsyncStorage.getItem("authToken");
  let headers = {
    Authorization: `Bearer ${auth}`,
  };
  let body = {
    ChallengeID: parseInt(challengeID),
    Value: parseInt(value),
    Urls: [Url],
  };
  console.log("Request body Submit Claim:", body);
  try {
    const response = await axios.post(`${BackendURL}/player/submission`, body, {
      headers,
    });
    console.log("Response data after making submission:", response.data);
    return response.data;
  } catch (error) {
    console.error("Submission error:", error.response.data);
    return null;
  }
};

const validate = async (challengeID, invalid) => {
  const auth = await AsyncStorage.getItem("authToken");
  let headers = {
    Authorization: `Bearer ${auth}`,
  };
  let body = {
    InvalidSubmissions: invalid,
  };
  try {
    const response = await axios.post(
      `${BackendURL}/challenge/validate/${challengeID}`,
      body,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.message;
  }
};

const getMysubmit = async (challengeID) => {
  const auth = await AsyncStorage.getItem("authToken");
  let headers = {
    Authorization: `Bearer ${auth}`,
  };
  try {
    const response = await axios.get(
      `${BackendURL}/player/submission/${challengeID}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.message;
  }
};
const getVotes = async (challengeId) => {
  const auth = await AsyncStorage.getItem("authToken");
  const headers = {
    Authorization: `Bearer ${auth}`,
  };

  try {
    const response = await axios.get(
      `${BackendURL}/player/submissions/vote/${challengeId}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

const notification = async ({ challengeId, limit, page, includeRead }) => {
  const auth = await AsyncStorage.getItem("authToken");
  let headers = {
    Authorization: `Bearer ${auth}`,
    "Content-Type": "application/json",
  };

  let queryParams = {
    limit: limit,
    page: page,
    includeRead: includeRead,
    user: true,
  };
  try {
    const response = await axios.get(`${BackendURL}/notification`, {
      headers: headers,
      params: queryParams,
    });

    return response.data;
  } catch (error) {
    return error;
  }
};

const notificationRead = async ({ id }) => {
  const auth = await AsyncStorage.getItem("authToken");
  let headers = {
    Authorization: `Bearer ${auth}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.post(
      `${BackendURL}/notification/read`,
      {
        ids: id,
      },
      {
        headers: headers,
      }
    );

    console.log("Notification marked as read", response.data);
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read", error);
    return error;
  }
};

const castVote = async ({ ChallengeID, SubmissionID }) => {
  const auth = await AsyncStorage.getItem("authToken");
  const headers = {
    Authorization: `Bearer ${auth}`,
  };

  const body = {
    ChallengeID,
    SubmissionID,
  };

  try {
    const response = await axios.post(
      `${BackendURL}/player/submission/vote`,
      body,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error casting vote:",
      error.response ? error.response.data : error.message
    );
    return error.response ? error.response.data : error;
  }
};

const joinChallengeWithTokenAPI = async (challenge, connection, wallet) => {
  const token = await AsyncStorage.getItem("authToken");
  console.log(token);
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const body = {
    ChallengeID: challenge.ChallengeID,
  };

  const web3Participate = {
    wallet,
    connection,
    playerId: new BN(0),
    challengeId: new BN(challenge.ChallengeID),
    amount:
      challenge.Currency === "SOL"
        ? new BN(challenge.Wager * 10 ** 9)
        : new BN(challenge.Wager),
    currency: challenge.Currency,
    onchainParticipateType: "joinChallenge",
  };

  try {
    const response = await axios.post(`${BackendURL}/player`, body, {
      headers,
    });
    const onChainResponse = await txWithBrowserWallet(web3Participate);
    return { apiData: response.data, onChainResponse };
  } catch (error) {
    let onChainResponse = null;
    let apiData = {
      success: false,
      message: "",
    };
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.message);
      if (error.response) {
        // Server responded with a status code outside 2xx range
        console.error("Response data:", error.response.data);
        const responseData = error.response.data;
        const errorMessage = responseData.message;

        if (errorMessage.includes("player already joined")) {
          console.log("Player already joined");
          apiData.success == true;
          console.log("2: ", apiData);

          const playerInfoJson = errorMessage.match(/\[.*\]/)[0];
          const playerInfo = JSON.parse(playerInfoJson);
          const playerId = playerInfo[0].PlayerID;

          console.log(
            `Player already joined with PlayerID ${playerId}. Retrying transaction...`
          );

          onChainResponse = await txWithBrowserWallet(web3Participate);
        } else {
          console.error("Error creating player:", errorMessage);
        }
      } else if (error.request) {
        // Request was made but no response was received
        console.error("Request data:", error.request);
      } else {
        // Something happened in setting up the request
        console.error("Error message:", error.message);
      }
    } else {
      // Non-Axios error
      console.error("Error:", error);
    }
    apiData.message == error.response.message;
    console.log("1: ", apiData);

    return { apiData, onChainResponse };
  }
};

const VERIFIED_CURRENCY_FORMATE = {
  CREDITS: "CREDITS",
  USDC: "USDC",
  SOL: "SOL_DEVNET",
  SOL_DEVNET: "SOL_DEVNET",
  BONK: "BONK",
  SEND: "SEND",
};

const joinChallengeWithTokensUsingOkto = async (
  challenge,
  wallet,
  portfolio
) => {
  const token = await AsyncStorage.getItem("authToken");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const verifiedCurrency = Object.keys(VERIFIED_CURRENCY_FORMATE).find(
    (key) => key === challenge.Currency
  );

  console.log("verifiedCurrency", verifiedCurrency);
  if (!verifiedCurrency) {
    Alert.alert("Error", "Challenge currency is not a verified currency.");
    return null;
  }

  const matchedToken = portfolio.tokens.find(
    (token) => token.token_name === VERIFIED_CURRENCY_FORMATE[verifiedCurrency]
  );

  if (!matchedToken) {
    Alert.alert("Insufficient Funds", "Not enough tokens for this challenge.");
    return { status: "NOT_SUFFICIENT" };
  }

  const matchedQuantity = parseFloat(matchedToken.quantity);
  console.log("Matched Token Quantity:", matchedQuantity);

  if (matchedQuantity < challenge.Wager) {
    Alert.alert(
      "Insufficient Funds",
      `You have ${matchedQuantity}, but ${challenge.Wager} is required.`
    );
    return { status: "NOT_SUFFICIENT" };
  }

  const body = { ChallengeID: challenge.ChallengeID };
  const currencyToUse =
    challenge.Currency === VERIFIED_CURRENCY_FORMATE.SOL_DEVNET
      ? VERIFIED_CURRENCY_FORMATE.SOL_DEVNET
      : challenge.Currency;

  const web3Participate = {
    walletAddr: new PublicKey(wallet),
    playerId: new BN(0),
    challengeId: new BN(challenge.ChallengeID),
    amount: new BN(
      parseToPrecision(challenge.Wager, tokenDecimals[currencyToUse])
    ),
    currency: currencyToUse,
    portFolio: portfolio,
    wager: challenge.Wager,
    onchainParticipateType: ONCHAIN_PARTICIPATE_TYPE.JOIN_CHALLENGE,
    network_name: "SOLANA", // TODO: remove SOL_DEVNET for mainnet
  };

  try {
    const response = await axios.post(`${BackendURL}/player`, body, {
      headers,
    });
    console.log(response.data);
    console.log("Preparing to execute on-chain transaction...");
    const onChainResponse = await txWithOkto(web3Participate);
    console.log("ONCHAIN RESPONSE🔴", onChainResponse);
    console.log("ONCHAIN RESPONSE🔴", onChainResponse);
    console.log("apidata🔴", response.data);

    return { apidata: response.data, onChainResponse };
  } catch (error) {
    let onChainResponse = null;

    if (axios.isAxiosError(error) && error.response) {
      const errorMessage = error.response.data.message;

      if (errorMessage.includes("player already joined")) {
        const playerInfoJson = errorMessage.match(/\[.*\]/)[0];
        const playerInfo = JSON.parse(playerInfoJson);
        const playerId = playerInfo[0].PlayerID;

        console.log(`Retrying transaction for PlayerID ${playerId}...`);
        onChainResponse = await txWithOkto(web3Participate);
      }
    }

    Alert.alert("Transaction Error", error.message);
    return { apidata: error.response?.data, onChainResponse };
  }
};
const oktoGetTxObject = async (data) => {
  try {
    const {
      walletAddr,
      playerId,
      challengeId,
      amount,
      currency,
      onchainParticipateType,
      program,
      userTokenAccount,
      escrowTokenAccount,
    } = data;

    debugLog("Converting wallet address", walletAddr);
    const userPublicKey = new PublicKey(walletAddr);
    debugLog("Converted Public 🔥", userPublicKey);

    debugLog("Converting token accounts", {
      userTokenAccount,
      escrowTokenAccount,
    });

    const userTokenAccountPubkey = new PublicKey(userTokenAccount);
    const escrowTokenAccountPubkey = new PublicKey(escrowTokenAccount);

    debugLog("Converting amount", amount);
    const amountBN = new BN(amount, 16);

    debugLog("Building transaction", {
      currency,
      amountBN: amountBN.toString(),
      challengeId,
      playerId,
    });

    let transaction = new Transaction();
    transaction.feePayer = userPublicKey;

    const { blockhash } =
      await program.provider.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    const instruction = await program.methods
      .participate(currency, amountBN, challengeId, playerId, {
        [onchainParticipateType]: {},
      })
      .accounts({
        user: userPublicKey,
        userTokenAccount: userTokenAccountPubkey,
        escrowTokenAccount: escrowTokenAccountPubkey,
        escrowAccount: web3Constants.escrowAccountPublicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: web3Constants.TOKEN_PROGRAM_ID,
      })
      .instruction();

    transaction.add(instruction);

    if (!transaction) {
      console.error("❌ Error: transactionInstruction is undefined or empty");
      return { data: null, error: "Transaction instruction is empty" };
    }

    console.log("✅ transactionInstruction created successfully:", transaction);

    const requestData = {
      network_name: "SOLANA", // TODO: remove SOL_DEVNET for mainnet
      transaction: {
        instructions: [transaction],
        signers: [walletAddr.toBase58()],
      },
    };

    console.log("🔍 Final requestData before return:", requestData);

    return { data: requestData, error: null };
  } catch (error) {
    console.error(`Web3 Transaction Build Failed: ${error}`);
    return { data: null, error: `Web3 Transaction Build Failed: ${error}` };
  }
};

const joinChallengeWithTokensUsingDeeplink = async (challenge, wallet) => {
  const token = await AsyncStorage.getItem("authToken");
  console.log(token);
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const body = {
    ChallengeID: challenge.ChallengeID,
  };

  const web3Participate = {
    walletAddr: new PublicKey(wallet),
    playerId: new BN(0),
    challengeId: new BN(challenge.ChallengeID),
    amount: new BN(
      parseToPrecision(challenge.Wager, tokenDecimals[challenge.Currency])
    ),
    currency: challenge.Currency,
    wager: challenge.Wager,
    onchainParticipateType: "joinChallenge",
  };
  console.log(web3Participate);

  try {
    const response = await axios.post(`${BackendURL}/player`, body, {
      headers,
    });
    const onChainResponse = await txWithDeeplinkWallet(web3Participate);

    const apidata = await response.data;
    return { apidata, onChainResponse };
  } catch (error) {
    console.log(error.response.data);
    let onChainResponse = null;
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.message);
      if (error.response) {
        // Server responded with a status code outside 2xx range
        console.error("Response data:", error.response.data);
        const responseData = error.response.data;
        const errorMessage = responseData.message;

        if (errorMessage.includes("player already joined")) {
          console.log("Player already joined");

          const playerInfoJson = errorMessage.match(/\[.*\]/)[0];
          const playerInfo = JSON.parse(playerInfoJson);
          const playerId = playerInfo[0].PlayerID;

          console.log(
            `Player already joined with PlayerID ${playerId}. Retrying transaction...`
          );

          onChainResponse = await txWithDeeplinkWallet(web3Participate);
        } else {
          console.error("Error creating player:", errorMessage);
        }
      } else if (error.request) {
        // Request was made but no response was received
        console.error("Request data:", error.request);
      } else {
        // Something happened in setting up the request
        console.error("Error message:", error.message);
      }
    } else {
      // Non-Axios error
      console.error("Error:", error);
    }
    const apidata = await error.response.data;
    return { apidata, onChainResponse };
  }
};
export const txWithOkto = async (web3Participate) => {
  try {
    console.log(web3Participate);
    const { walletAddr, currency, portFolio, wager, network_name } =
      web3Participate; // Add network_name here

    const { error: oktoSanityCheckErr } = await oktoSanityChecks({
      portFolio,
      wager,
      currency,
    });
    if (oktoSanityCheckErr) throw oktoSanityCheckErr;

    const { program, connection } = await initDummyWeb3(network_name);
    console.log("program");
    console.log("connection");
    const { escrowTokenAccount, userTokenAccount } = await tokenAccounts({
      connection,
      currency,
      escrowPublicKey: web3Constants.escrowAccountPublicKey,
      userPublicKey:
        currency === VERIFIED_CURRENCY.SOL || network_name === "SOLANA" // TODO: remove SOL_DEVNET for mainnet
          ? web3Constants.escrowAccountPublicKey
          : walletAddr,
    });

    console.log("escrowTokenAccount");
    console.log("userTokenAccount");
    console.log("web3Participate ", web3Participate);
    console.log("program ", program);
    console.log("userTokenAccount ", userTokenAccount);
    console.log("escrowTokenAccount ", escrowTokenAccount);

    const { data: requestData, error: oktoGetTxObjectErr } =
      await oktoGetTxObject({
        ...web3Participate,
        program,
        userTokenAccount,
        escrowTokenAccount,
      });
    if (oktoGetTxObjectErr) throw oktoGetTxObjectErr;

    return requestData;
  } catch (error) {
    console.error("Error in Okto transaction building:", error.message);
    throw new Error(`Okto transaction building failed: ${error.message}`);
  }
};
export const txWithDeeplinkWallet = async (web3Participate) => {
  try {
    // unpack data
    console.log("vicky");
    const { walletAddr, currency } = web3Participate;
    console.log("vicky");

    const { program, connection } = await initDummyWeb3();
    console.log("vicky");

    // verify balance
    // const { error: txFeesCheckerError } = await txFeesChecker({
    //   connection,
    //   userPublicKey: walletAddr,
    // });

    // if (txFeesCheckerError) throw txFeesCheckerError;
    console.log(program);
    console.log(connection);
    // get escrow
    const { escrowTokenAccount, userTokenAccount } = await tokenAccounts({
      connection,
      currency,
      escrowPublicKey: web3Constants.escrowAccountPublicKey,
      userPublicKey:
        currency === VERIFIED_CURRENCY.SOL
          ? web3Constants.escrowAccountPublicKey
          : walletAddr,
    });

    console.log("escrowTokenAccount ", escrowTokenAccount);
    console.log("userTokenAccount ", userTokenAccount);
    const { data: signedTransaction, error: getTxObjectErr } =
      await getTxObjectForDeeplink({
        ...web3Participate,
        program,
        escrowTokenAccount,
        userTokenAccount,
      });

    if (getTxObjectErr) throw getTxObjectErr;

    return signedTransaction;
  } catch (error) {
    console.error("Error in transaction:", error);
    throw new Error(`Transaction failed: ${error}`);
  }
};

const addTxHashForJoinChallenge = async (signature, ChallengeID) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("User is not authenticated.");
    }
    await axios.post(
      `${BackendURL}/player/addTxnHash`,
      {
        txnId: signature,
        ChallengeID: ChallengeID,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Transaction hash and ChallengeID sent to backend");
    return { error: null };
  } catch (error) {
    console.error(
      "Error while calling put: user/place-sidebet API:",
      error.response?.data || error.message
    );
    return { error };
  }
};

const logout = async () => {};
export {
  redirectGoogleAuth,
  authenticateAPI,
  setPinAPI,
  getRefreshTokenAPI,
  createWallet,
  getUserWalletAPI,
  getChallenges,
  getChallengeById,
  getOngoingChallenges,
  getChallengeDashboard,
  getLeaderboard,
  searchChallengeAPI,
  joinChallengeAPI,
  getUserChallenges,
  getUserDetails,
  getUserDetailsMobile,
  logout,
  getVotes,
  withDrawApi,
  postUserUpdate,
  postUpdateCoverHex,
  getShareableChallengeLink,
  getShareableLinkFromSlug,
  createChallengeAPI,
  getReclaimProof,
  postUploadImage,
  uploadFileApi,
  getUserTransaction,
  getSubmissions,
  validate,
  submitClaim,
  getMysubmit,
  serverGoogleAuth,
  refreshServer,
  fetchSolPrice,
  notification,
  notificationRead,
  castVote,
  getUserCreatedChallenges,
  getChallengesById,
  getOngoingChallengesVote,
  joinChallengeWithTokenAPI,
  joinChallengeWithTokensUsingOkto,
  joinChallengeWithTokensUsingDeeplink,
  addTxHashForJoinChallenge,
};
