import { PublicKey } from "@solana/web3.js";

const BackendURL = "https://mainnet-apiv2.catoff.xyz";
// const BackendURL = "https://stagingapi3.catoff.xyz";
const progId = new PublicKey("CATsuZkMmitPNX2KFF5g9Z7qJpJgE6AYcuwBybDKKVK3");
const usdcMintAddress = new PublicKey(
  "usdcjuyqxVrSMiXtn6oDbETAwhJLs6Q5ZxZ2qLqXg9i"
);
const bonkMintAddress = new PublicKey(
  "bonkMLw9Gyn4F3dqwxaHgcqLQxvchiYLfjDjEVXCEMf"
);
const sendMintAddress = new PublicKey(
  "send5CvJLQjEAASQjXfa1thdnDJkeMxXefZB3AMj1iF"
);
const escrowAccountPublicKey = new PublicKey(
  "CATsE5puERsktWHV7juHFJALEWfshhScz6rDuSWqtkqJ"
);

export {
  BackendURL,
  progId,
  usdcMintAddress,
  sendMintAddress,
  bonkMintAddress,
  escrowAccountPublicKey,
};
