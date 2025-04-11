import {
  createAssociatedTokenAccount,
  createMint,
  createMintToInstruction,
  getAccount,
  getMint,
} from "@solana/spl-token";
import { connection } from "../Initialize-client/Initialize-client";
import { config } from "../config/env";
import * as bs58 from "bs58";
import {
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { appendTransactionData } from "./save-transaction";

const privatekey = config.SECRET_KEY;
const secretKey = bs58.default.decode(privatekey);
const wallet = Keypair.fromSecretKey(secretKey);
const TOTAL_SUPPLY = config.TOKEN_TOTAL_SUPPLY;

(async () => {
  //mintAddress
  const mint = await createMint(connection, wallet, wallet.publicKey, null, 9);

  const mintInfo = await getMint(connection, mint);

  //ATA Account
  const ATAaccount = await createAssociatedTokenAccount(
    connection,
    wallet,
    new PublicKey(mint.toBase58()),
    wallet.publicKey
  );

  const ATAaccountInfo = await getAccount(connection, ATAaccount);

  const transactions = new Transaction().add(
    createMintToInstruction(
      mint,
      ATAaccountInfo.address,
      wallet.publicKey,
      BigInt(TOTAL_SUPPLY) * BigInt(10) ** BigInt(config.DECIMAL)
    )
  );

  const TxnId = await sendAndConfirmTransaction(connection, transactions, [
    wallet,
  ]);
  console.log("Transaction Succesfully:.......", TxnId);

  const data = {
    ...mintInfo,
    ...ATAaccountInfo,
    TxnId,
  };

  appendTransactionData("mint-token.json", data);
  console.log("MINT TOKEN SUCCESSFULLY:..........");
})();
