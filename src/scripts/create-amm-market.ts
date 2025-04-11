import { PublicKey } from "@solana/web3.js";
import { config } from "../config/env";
import {
  connection,
  initSdk,
  txVersion,
} from "../Initialize-client/Initialize-client";
import { DEVNET_PROGRAM_ID } from "@raydium-io/raydium-sdk-v2";
import { appendTransactionData } from "./save-transaction";

const TOKEN_A = config.MINT_TOKEN_A;
const TOKEN_B = config.MINT_TOKEN_B;

(async () => {
  const raydium = await initSdk();

  //fetch Token Info
  const tokenAinfo = await raydium.token.getTokenInfo(TOKEN_A);
  const tokenBinfo = await raydium.token.getTokenInfo(TOKEN_B);

  //Create TOken Transaction
  const { execute, extInfo, transactions } = await raydium.marketV2.create({
    baseInfo: {
      mint: new PublicKey(TOKEN_A),
      decimals: tokenAinfo.decimals,
    },
    quoteInfo: {
      mint: new PublicKey(TOKEN_B),
      decimals: tokenBinfo.decimals,
    },
    lotSize: 1,
    tickSize: 0.01,
    dexProgramId: DEVNET_PROGRAM_ID.OPENBOOK_MARKET,
    txVersion,
  });

  //Fetch Latest Block Transaction
  const latestBlockhash = await connection.getLatestBlockhash();
  transactions.forEach((item) => {
    item.recentBlockhash = latestBlockhash.blockhash;
  });

  //Execute Transaction Sequentially
  const txnId = await execute({ sequentially: true });

  //Append Transaction into JSON file
  appendTransactionData("amm-market- market-transactions.json", {
    txnId: txnId,
    extInfo: extInfo,
    transactions: transactions,
  });

  console.log("AMM-Market-Created Successfully:...........");
})();
