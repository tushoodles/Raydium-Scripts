import { PublicKey } from "@solana/web3.js";
import { config } from "../config/env";
import { initSdk, txVersion } from "../Initialize-client/Initialize-client";
import {
  DEVNET_PROGRAM_ID,
  MARKET_STATE_LAYOUT_V3,
} from "@raydium-io/raydium-sdk-v2";
import { BN } from "bn.js";
import { appendTransactionData } from "./save-transaction";

const MARKET_ID = config.AMM_MARKET_ID;

(async () => {
  //InitialIze Raydium
  const raydium = await initSdk();

  //Get Market Account Info
  const marketBufferInfo = await raydium.connection.getAccountInfo(
    new PublicKey(MARKET_ID)
  );
  
  const { baseMint, quoteMint } = MARKET_STATE_LAYOUT_V3.decode(
    marketBufferInfo!.data
  );

  //Get token Info on chain
  const baseMintInfo = await raydium.token.getTokenInfo(baseMint);
  const QouteMintinfo = await raydium.token.getTokenInfo(quoteMint);

  //Assign Base Amount Value
  const baseAmount = new BN(1_000_000_000);
  const QouteAmount = new BN(1_000_000_000);

  //Create Add Liquidity Transaction
  const { execute, extInfo } = await raydium.liquidity.createPoolV4({
    programId: DEVNET_PROGRAM_ID.AmmV4,
    marketInfo: {
      marketId: new PublicKey(MARKET_ID),
      programId: DEVNET_PROGRAM_ID.OPENBOOK_MARKET,
    },
    baseMintInfo: {
      mint: baseMint,
      decimals: baseMintInfo.decimals,
    },
    quoteMintInfo: {
      mint: quoteMint,
      decimals: baseMintInfo.decimals,
    },
    baseAmount: baseAmount,
    quoteAmount: QouteAmount,
    startTime: new BN(0),
    ownerInfo: {
      useSOLBalance: true,
    },
    associatedOnly: false,
    txVersion,
    feeDestinationId: DEVNET_PROGRAM_ID.FEE_DESTINATION_ID,
    computeBudgetConfig: {
      units: 500000,
      microLamports: 5000000,
    },
  });
  
  // Execute Transaction Successfully
  const { txnId }: any = await execute({ sendAndConfirm: true });
  console.log("POOL Created Successfully:.........", txnId);

  const transactionData = {
    ...txnId,
    date: new Date().toISOString(),
  };

  //Append Transaction into JSON file
  await appendTransactionData("amm-pool-transactions.json", transactionData);
  console.log("Transaction details saved successfully!");
})();
