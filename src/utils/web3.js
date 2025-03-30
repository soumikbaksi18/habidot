const { Program, AnchorProvider, Wallet } = require("@coral-xyz/anchor");
const { Connection, Keypair, PublicKey, SystemProgram } = require("@solana/web3.js");
const idl = require("../constants/idl.json");
// const { ExecuteRawTransaction } = require("okto-sdk-react");
// const base58 = require("bs58");
// const BigNumber = require("bignumber.js");
import bs58 from 'bs58';
import BigNumber from "bignumber.js";
const {
  bonkMintAddress,
  escrowAccountPublicKey,
  progId,
  sendMintAddress,
  usdcMintAddress,
} = require("../constants/url");

const web3Constants = {
  programId: progId,
  USDC_MINT_ADDRESS: usdcMintAddress,
  BONK_MINT_ADDRESS: bonkMintAddress,
  SEND_MINT_ADDRESS: sendMintAddress,
  escrowAccountPublicKey: escrowAccountPublicKey,
  TOKEN_PROGRAM_ID: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
  READ_ONLY_PRIV_KEY: Keypair.fromSecretKey(
    bs58.decode(
      "3j35gJena7bTxgsmWHUGwGd5fpdp24v8pSSGMDerXPqHQxM4Wdo5E5HcYEaGBZsP9tvXZQ3KJSSRGdLHzhMzmkyb"
    )
  ),
  minTxFees: 100000,
};

const tokenDecimals = {
  SOL: 9,
  USDC: 6,
  BONK: 5,
  SEND: 6,
};

const parseToPrecision = (amount, decimals) => {
  const amountFormatted = new BigNumber(amount);
  const multiplier = new BigNumber(Math.pow(10, decimals));
  return amountFormatted.multipliedBy(multiplier).toString();
};

const initWeb3 = async (connection, wallet) => {
  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: "processed",
  });
  const program = new Program(idl, web3Constants.programId, provider);
  return { program };
};

const initDummyWeb3 = async (network_name) => {
  console.log(network_name)
  const connectionUrl =
    network_name === "SOLANA"
      ? "https://api.mainnet-beta.solana.com"
      : "https://api.devnet.solana.com";

  console.log("🌐 Connecting to Solana network at URL:", connectionUrl);

  const connection = new Connection(connectionUrl, "confirmed");
  console.log("connection " , connection)
  const provider = new AnchorProvider(connection, {}, {
    preflightCommitment: "processed",
  });
  console.log(provider)
  const program = new Program(idl, web3Constants.programId, provider);
  // console.log(program)

  console.log(program)
  return { program, connection };
};

const getAssociatedTokenAccount = async (connection, addr, tokenMintAddress) => {
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
    const transaction = await program.methods
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
      .transaction();

    transaction.feePayer = wallet.publicKey;
    transaction.recentBlockhash = (
      await program.provider.connection.getLatestBlockhash()
    ).blockhash;
    const signedTransaction = await wallet.signTransaction(transaction);
    return { data: signedTransaction, error: null };
  } catch (error) {
    console.error(`Web3 Transaction Build Failed: ${error}`);
    return { data: null, error: `Web3 Transaction Build Failed: ${error}` };
  }
};

const getTxObjectForDeeplink = async (data) => {
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
    const transaction = await program.methods
      .participate(currency, amount, challengeId, playerId, {
        [onchainParticipateType]: {},
      })
      .accounts({
        user: walletAddr,
        userTokenAccount,
        escrowTokenAccount,
        escrowAccount: web3Constants.escrowAccountPublicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: web3Constants.TOKEN_PROGRAM_ID,
      })
      .transaction();

    transaction.feePayer = walletAddr;
    transaction.recentBlockhash = (
      await program.provider.connection.getLatestBlockhash()
    ).blockhash;
    return { data: transaction, error: null };
  } catch (error) {
    console.error(
      `Web3 Transaction Build with deeplink wallet Failed: ${error}`
    );
    return {
      data: null,
      error: `Web3 Transaction Build with deeplink wallet Failed: ${error}`,
    };
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
    const transactionInstruction = await program.methods
      .participate(currency, amount, challengeId, playerId, {
        [onchainParticipateType]: {},
      })
      .accounts({
        user: walletAddr,
        userTokenAccount,
        escrowTokenAccount,
        escrowAccount: web3Constants.escrowAccountPublicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: web3Constants.TOKEN_PROGRAM_ID,
      })
      .instruction();
    return {
      data: {
        userPublicKey: walletAddr.toString(),
        transaction: {
          recentBlockhash: null,
          instructions: [transactionInstruction],
        },
      },
      error: null,
    };
  } catch (error) {
    console.error(`Okto Transaction Object creation failed: ${error}`);
    return { data: null, error: `Okto Transaction Object creation failed: ${error}` };
  }
};

module.exports = {
  initWeb3,
  initDummyWeb3,
  getAssociatedTokenAccount,
  tokenAccounts,
  txFeesChecker,
  parseToPrecision,
  getTxObject,
  getTxObjectForDeeplink,
  oktoSanityChecks,
  oktoGetTxObject,
};
