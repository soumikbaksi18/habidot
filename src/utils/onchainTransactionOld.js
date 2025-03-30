import {
  Connection,
  clusterApiUrl,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
  Transaction,
  Keypair,
} from "@solana/web3.js";
import base58 from "bs58";
import { transact } from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import { toByteArray } from "react-native-quick-base64";
import BN from "bn.js";
import * as idl from "../constants/idl.json";
import {
  bonkMintAddress,
  escrowAccountPublicKey,
  progId,
  sendMintAddress,
  usdcMintAddress,
} from "../constants/url.js";
const anchor = require("@coral-xyz/anchor");
const web3Constants = {
  programId: progId,
  USDC_MINT_ADDRESS: usdcMintAddress,
  BONK_MINT_ADDRESS: bonkMintAddress,
  SEND_MINT_ADDRESS: sendMintAddress,
  escrowAccountPublicKey: escrowAccountPublicKey,
  TOKEN_PROGRAM_ID: new PublicKey(
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
  ),
  READ_ONLY_PRIV_KEY: Keypair.fromSecretKey(
    base58.decode(
      "3j35gJena7bTxgsmWHUGwGd5fpdp24v8pSSGMDerXPqHQxM4Wdo5E5HcYEaGBZsP9tvXZQ3KJSSRGdLHzhMzmkyb"
    )
  ),
  minTxFees: 100000,
};

// Define the Escrow Account Public Key
const ESCROW_ACCOUNT_PUBLIC_KEY = new PublicKey(
  "CATsE5puERsktWHV7juHFJALEWfshhScz6rDuSWqtkqJ"
);
const APP_IDENTITY = {
  name: "Catoff Gaming",
  uri: "https://catoff.xyz",
  icon: "favicon.ico",
};

const parseToPrecision = (value, precision) => {
  return Math.floor(value * Math.pow(10, precision));
};
const tokenDecimals = {
  SOL: 9,
  USDT: 6,
};

export const sendTransactionNew = async (challenge) => {
  try {
    console.log("1: Initializing connection");
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const latestBlockhash = await connection.getLatestBlockhash();
    console.log("2: Latest blockhash retrieved", latestBlockhash);

    // Start the transaction using the transact method
    await transact(async (wallet) => {
      console.log("3🔴🔴🔴: Starting transaction");

      // Authorize the wallet session

      const authorizationResult = await wallet.authorize({
        cluster: "solana:devnet",
        identity: APP_IDENTITY,
      });
      console.log("4: Wallet authorized", authorizationResult);

      // Get the user's public key
      const authorizedPubkey = new PublicKey(
        toByteArray(authorizationResult.accounts[0].address)
      );

      if (!authorizedPubkey) {
        throw new Error("No public key found");
      }

      console.log(
        "5: Authorized public key created",
        authorizedPubkey.toString()
      );

      // Define the web3Participate object
      const web3Participate = {
        wallet: authorizedPubkey,
        connection: connection,
        playerId: new BN(0),
        challengeId: new BN(challenge.ChallengeID),
        amount: new BN(
          parseToPrecision(challenge.Wager, tokenDecimals[challenge.Currency])
        ),
        currency: challenge.Currency,
        onchainParticipateType: "joinChallenge",
      };

      console.log("6: web3Participate object created", web3Participate);

      const onChainResponse = await txWithBrowserWallet(web3Participate);
      console.log("7: Onchain Respose ", onChainResponse);
    });
  } catch (error) {
    console.error("Error initializing transaction:", error);
    return { success: false, error };
  }
};

export const txWithBrowserWallet = async (web3Participate) => {
  try {
    // Unpack data
    console.log("8.1: Unpacking data", web3Participate);
    const {
      wallet,
      connection,
      playerId,
      currency,
      challengeId,
      onchainParticipateType,
    } = web3Participate;

    // Get escrow and user token accounts
    const { escrowTokenAccount, userTokenAccount } = await tokenAccounts({
      connection,
      currency,
      escrowPublicKey: web3Constants.escrowAccountPublicKey,
      userPublicKey:
        currency === "SOL" ? web3Constants.escrowAccountPublicKey : wallet,
    });
    console.log("8.2: Token accounts retrieved", escrowTokenAccount);
    console.log("8.3: Token accounts retrieved user", userTokenAccount);
    console.log("WALLET FROM tx BRWOSER WALLET FUNCTION", wallet);
    console.log(
      "usePublicKey FROM tx BRWOSER WALLET FUNCTION",
      web3Constants.escrowAccountPublicKey
    );
    // Calling getTxObject to get the signed transaction
    const { data, error } = await getTxObject({
      ...web3Participate,
      userPublicKey: wallet,
      escrowTokenAccount,
      userTokenAccount,
    });
    console.log("8.4: Transaction object created", data, error);
    // Handle the case where getTxObject returns an error
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error in transaction:", error);
    throw new Error(`Transaction failed: ${error.message}`);
  }
};

//other helper functions
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

const getAssociatedTokenAccount = async (
  connection,
  addr,
  tokenMintAddress
) => {
  const Accountaddress = new PublicKey(addr);
  const tokenList = await connection.getTokenAccountsByOwner(Accountaddress, {
    mint: new PublicKey(tokenMintAddress),
  });

  return tokenList.value[0] ? tokenList.value[0].pubkey : null;
};
if (typeof global.structuredClone === "undefined") {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}
const initWeb3 = async (connection, wallet) => {
  console.log("9.1: Initializing program, web3");
  const provider = new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
    commitment: "processed",
  });
  console.log("9.1.1: Provider initialized", web3Constants.programId);
  const program = new anchor.Program(idl, progId, provider);
  console.log("9.1.2: Program initialized", program);
  return { program };
};

const getTxObject = async (data) => {
  try {
    const {
      onchainParticipateType,
      connection,
      playerId,
      challengeId,
      amount,
      currency,
      userPublicKey,
      userTokenAccount,
      escrowTokenAccount,
    } = data;

    console.log("1: WALLET FROM GET TX FUNCTION", userPublicKey);

    // Initialize the program
    const { program } = await initWeb3(connection, userPublicKey);
    console.log("2: Program initialized", program);

    // Generate the instruction from the Anchor program
    // const participateInstruction = await program.methods
    //   .participate(currency, amount, challengeId, playerId, {
    //     [onchainParticipateType]: {},
    //   })
    //   .accounts({
    //     user: userPublicKey,
    //     userTokenAccount,
    //     escrowTokenAccount,
    //     escrowAccount: web3Constants.escrowAccountPublicKey,
    //     systemProgram: SystemProgram.programId,
    //     tokenProgram: web3Constants.TOKEN_PROGRAM_ID,
    //   })
    //   .instruction();

    // Initialize connection
    console.log("3: Initializing connection to devnet");
    console.log("3.1: Connection details", connection);

    // Retrieve the latest blockhash
    const latestBlockhash = await connection.getLatestBlockhash();
    console.log("4: Latest blockhash retrieved", latestBlockhash);

    // Start Mobile Wallet Adapter session to sign the transaction
    try {
      console.log("5: Starting transaction construction");

      // Generate the instruction from the Anchor program
      const participateInstruction = await program.methods
        .participate(currency, amount, challengeId, playerId, {
          [onchainParticipateType]: {},
        })
        .accounts({
          user: userPublicKey,
          userTokenAccount,
          escrowTokenAccount,
          escrowAccount: web3Constants.escrowAccountPublicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: web3Constants.TOKEN_PROGRAM_ID,
        })
        .instruction();

      console.log("6: Instruction created", participateInstruction);

      // Proceed to signing and creating the transaction
      const signedTransaction = await transact(async (wallet) => {
        console.log("7: Starting wallet authorization");
        const authorizationResult = await wallet.authorize({
          cluster: "solana:devnet",
          identity: APP_IDENTITY,
        });

        console.log("8: Wallet authorized", authorizationResult);

        const transaction = new Transaction({
          ...latestBlockhash,
          feePayer: authorizationResult.accounts[0].address,
        }).add(participateInstruction);

        console.log("9: Transaction created", transaction);

        // Sign the transaction
        const signedTransactions = await wallet.signTransactions({
          transactions: [transaction],
        });

        console.log("10: Transaction signed", signedTransactions[0]);

        return signedTransactions[0];
      });

      console.log("11: Signed transaction", signedTransaction);
      console.log("6: Transaction signed", signedTransaction);
      return { data: signedTransaction, error: null };
    } catch (error) {
      console.error("Error during transaction flow:", error);
    }
  } catch (error) {
    console.error("7: Web3 Transaction Build Failed:", error);
    return { data: null, error: `Web3 Transaction Build Failed: ${error}` };
  }
};
