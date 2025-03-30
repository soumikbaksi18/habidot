import {
  Connection,
  clusterApiUrl,
  PublicKey,
  SystemProgram,
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
  USDC: 6,
  BONK: 5,
  SEND: 9,
};

if (typeof global.structuredClone === "undefined") {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

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
      const amount = new BN(
        parseToPrecision(challenge.Wager, tokenDecimals[challenge.Currency])
      );
      console.log("6: Amount created", amount);
      // Define the web3Participate object
      const web3Participate = {
        wallet: authorizedPubkey,
        connection: connection,
        playerId: new BN(0),
        challengeId: new BN(challenge.ChallengeID),
        amount: amount,
        currency: challenge.Currency,
        onchainParticipateType: "joinChallenge",
      };

      console.log("6: web3Participate object created", web3Participate);

      try {
        // Unpack data
        console.log("8.1: Unpacking data", web3Participate);
        const {
          wallet: userPublicKey,
          connection,
          playerId,
          currency,
          challengeId,
          amount,
          onchainParticipateType,
        } = web3Participate;

        // Get escrow and user token accounts
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
            throw new Error(`Unsupported currency: ${currency}`);
        }

        let userTokenAccount = null;
        let escrowTokenAccount = null;

        if (currency == "SOL") {
          const escrowPublicKey = web3Constants.escrowAccountPublicKey;
          const userPubKey = userPublicKey;

          const getAssociatedTokenAccount = async (
            connection,
            addr,
            tokenMintAddress
          ) => {
            const Accountaddress = new PublicKey(addr);
            const tokenList = await connection.getTokenAccountsByOwner(
              Accountaddress,
              {
                mint: new PublicKey(tokenMintAddress),
              }
            );

            return tokenList.value[0] ? tokenList.value[0].pubkey : null;
          };

          escrowTokenAccount = await getAssociatedTokenAccount(
            connection,
            escrowPublicKey,
            TOKEN_MINT_ADDRESS
          );

          if (!escrowTokenAccount) {
            throw new Error(
              "Failed to get or create associated token account for escrow."
            );
          }

          userTokenAccount = await getAssociatedTokenAccount(
            connection,
            userPubKey,
            TOKEN_MINT_ADDRESS
          );

          if (!userTokenAccount) {
            throw new Error("Failed to get associated token account for user.");
          } else {
            console.log("hello userTokenAccount", userTokenAccount);
          }

          console.log(
            "8.2: Token accounts retrieved",
            escrowTokenAccount.toString()
          );
          console.log(
            "8.3: Token accounts retrieved user",
            userTokenAccount.toString()
          );
        }

        // Initialize the program
        console.log("9.1: Initializing program, web3");
        const provider = new anchor.AnchorProvider(
          connection,
          {
            publicKey: userPublicKey,
            signTransaction: wallet.signTransaction,
            signAllTransactions: wallet.signAllTransactions,
          },
          {
            preflightCommitment: "confirmed",
            commitment: "processed",
          }
        );
        console.log("9.1.1: Provider initialized", web3Constants.programId);
        const program = new anchor.Program(idl, progId, provider);
        console.log("9.1.2: Program initialized", program);

        let transaction;

        if (currency === "SOL") {
          // For SOL transfers
          // const transferInstruction = SystemProgram.transfer({
          //   fromPubkey: userPublicKey,
          //   toPubkey: web3Constants.escrowAccountPublicKey,
          //   lamports: amount.toNumber(),
          // });

          // transaction = new Transaction({
          //   ...latestBlockhash,
          //   feePayer: authorizedPubkey,
          // }).add(transferInstruction);

          // console.log("Transaction created:", transaction);
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

          // Build the transaction
          transaction = new Transaction({
            ...latestBlockhash,
            feePayer: authorizedPubkey,
          }).add(participateInstruction);

          console.log("Transaction created:", transaction);
        } else {
          // For SPL Token transfers using the Anchor program
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

          // Build the transaction
          transaction = new Transaction({
            ...latestBlockhash,
            feePayer: authorizedPubkey,
          }).add(participateInstruction);

          console.log("Transaction created:", transaction);
        }

        // Sign the transaction
        const signedTransactions = await wallet.signTransactions({
          transactions: [transaction],
        });

        console.log("10: Transaction signed", signedTransactions[0]);

        const signedTransaction = signedTransactions[0];

        console.log("11: Signed transaction", signedTransaction);

        // Send the transaction to the network
        const signature = await connection.sendRawTransaction(
          signedTransaction.serialize()
        );

        console.log("Transaction signature:", signature);

        const confirmation = await connection.confirmTransaction(signature);

        console.log("Transaction confirmation:", confirmation);
      } catch (error) {
        console.error("Error in transaction:", error);
        throw new Error(`Transaction failed: ${error.message}`);
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error initializing transaction:", error);
    return { success: false, error };
  }
};
