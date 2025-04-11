import {
  ApiV3PoolInfoConcentratedItem,
  ApiV3PoolInfoStandardItemCpmm,
  CpmmKeys,
  Percent,
} from "@raydium-io/raydium-sdk-v2";

import { initSdk } from "../Initialize-client/Initialize-client";
import { config } from "../config/env";
import { isValidCpmm } from "./cpmm-utils";
import Decimal from "decimal.js";
import { BN } from "@coral-xyz/anchor";
import { appendTransactionData } from "./save-transaction";

//Import ENV
const POOL_ID = config.CPMM_POOL_ID;
const ADD_LIQUIDITY = config.ADD_LIQUIDITY_VALUE;

(async () => {
  //Initialize Raydium Client
  const raydium = await initSdk();
  let poolInfo: ApiV3PoolInfoStandardItemCpmm;
  let poolkey: CpmmKeys | undefined;
  const poolId = POOL_ID;

  if (raydium.cluster === "mainnet") {
    const result = await raydium.api.fetchPoolById({ ids: poolId });
    poolInfo = result[0] as ApiV3PoolInfoStandardItemCpmm;
    if (!isValidCpmm(poolInfo.programId))
      throw new Error("target pool is not CPMM pool");
  } else {
    const result = await raydium.cpmm.getPoolInfoFromRpc(poolId);
    poolInfo = result.poolInfo;
    poolkey = result.poolKeys;
  }

  //Create Transaction of "ADD LIQUIDITY"
  const { execute, transaction } = await raydium.cpmm.addLiquidity({
    poolInfo: poolInfo,
    poolKeys: poolkey,
    inputAmount: new BN(
      new Decimal(ADD_LIQUIDITY).mul(10 ** poolInfo.mintA.decimals).toFixed(0)
    ),
    baseIn: true,
    slippage: new Percent(3, 10),
    computeBudgetConfig: {
      units: 200000,
      microLamports: 200000,
    },
  });
  //Execute Transaction of "ADD LIQUIDITY"
  const { txId } = await execute({ sendAndConfirm: true });
  console.log("txId.....", txId);


  //Append Add Liquidity Transaction on JSON file 
  appendTransactionData("cpmm-add-liquidity.json", {
    txId: txId,
    date: new Date().toISOString(),
  });

  console.log("ADD LIQUIDITY SUCCESSFULLY ADDEDD...");
})();
