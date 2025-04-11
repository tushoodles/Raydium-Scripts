import { devConfigs } from "../Initialize-client/clmm-utils";
import { DEVNET_PROGRAM_ID } from "@raydium-io/raydium-sdk-v2";
import { initSdk } from "../Initialize-client/Initialize-client";
import { config } from "../config/env";
import Decimal from "decimal.js";
import { PublicKey } from "@solana/web3.js";
import { appendTransactionData } from "./save-transaction";


//ENV Values are Imported
const mintA = config.MINT_TOKEN_A;
const mintB = config.MINT_TOKEN_B;

(async () => {
  //Initialize raydium SDK
  const raydium = await initSdk();
  // Fetch Token Info
  const mint1 = await raydium.token.getTokenInfo(mintA);
  const mint2 = await raydium.token.getTokenInfo(mintB);

  //Create Pool transaction
  const { execute, transaction } = await raydium.clmm.createPool({
    programId: DEVNET_PROGRAM_ID.CLMM,
    mint1,
    mint2,
    ammConfig: {
      ...devConfigs[0],
      id: new PublicKey(devConfigs[0].id),
      fundOwner: "",
      description: "",
    },
    initialPrice: new Decimal(1),
    computeBudgetConfig: {
      units: 200000,
      microLamports: 200000,
    },
    txVersion: undefined,
  });

  // Execute Pool Transaction
  const { txId } = await execute({ sendAndConfirm: true });

  //Append Transaction into JSON file
  appendTransactionData("clmm-pool-transactions.json", {
    txnId: txId,
    data: new Date().toISOString(),
  });
})();
