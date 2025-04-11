import {
  DEVNET_PROGRAM_ID,
  getCpmmPdaAmmConfigId,
  TxVersion,
} from "@raydium-io/raydium-sdk-v2";
import {
  initSdk,
  txVersion,
} from "../Initialize-client/Initialize-client";
import { config } from "../config/env";
import { BN } from "bn.js";
import { appendTransactionData } from "./save-transaction";


// Import TOKEN Address
const INPUT_TOKEN_A = config.MINT_TOKEN_A;
const INPUT_TOKEN_B = config.MINT_TOKEN_B;

(async () => {
  //Initialize Raydium Client
  const raydium = await initSdk();

  //get token Information
  const mintA = await raydium.token.getTokenInfo(INPUT_TOKEN_A);
  const mintB = await raydium.token.getTokenInfo(INPUT_TOKEN_B);

  const cpmmfeeconfigs = await raydium.api.getCpmmConfigs();

  if (raydium.cluster === "devnet") {
    cpmmfeeconfigs.forEach((config) => {
      config.id = getCpmmPdaAmmConfigId(
        DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM,
        config.index
      ).publicKey.toBase58();
    });
  }

  // //Create Transaction of "CPMM POOL"
  const { execute, extInfo, transaction } = await raydium.cpmm.createPool({
    programId: DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM,
    poolFeeAccount: DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_FEE_ACC,
    mintA,
    mintB,
    mintAAmount: new BN(100),
    mintBAmount: new BN(100),
    startTime: new BN(0),
    feeConfig: cpmmfeeconfigs[0],
    associatedOnly: false,
    ownerInfo: {
      useSOLBalance: true,
    },
    computeBudgetConfig: {
      units: 600000,
      microLamports: 600000,
    },
    txVersion: undefined,
  });

  //Execute "CPMM Pool" Create Transaction
  const { txId } = await execute({ sendAndConfirm: true });

  // Append Transaction Detail into JSON file
  appendTransactionData("cpmm-pool-transactions.json", {
    txId: txId,
    date: new Date().toISOString(),
  });

  console.log("CPMM SCHEDULE SUCCESSFULLY...");
})();
