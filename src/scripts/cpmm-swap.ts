import {
  ApiV3PoolInfoStandardItemCpmm,
  CpmmKeys,
  CpmmRpcData,
  CurveCalculator,
} from "@raydium-io/raydium-sdk-v2";

import { initSdk } from "../Initialize-client/Initialize-client";
import { isValidCpmm } from "./cpmm-utils";
import { config } from "../config/env";
import { BN } from "@coral-xyz/anchor";
import { appendTransactionData } from "./save-transaction";

//Import ENV
const poolId = config.CPMM_POOL_ID;
const inputMint = config.MINT_TOKEN_A;
const SWAP_VALUE_FROM_POOL = config.SWAP_VALUE_FROM_POOL;
const inputAmount = new BN(SWAP_VALUE_FROM_POOL).mul(new BN(100));
(async () => {
  //Initialize Raydium Client
  const raydium = await initSdk();

  let poolInfo: ApiV3PoolInfoStandardItemCpmm;
  let poolKeys: CpmmKeys | undefined;
  let rpcData: CpmmRpcData;
  let data;

  if (raydium.cluster === "mainnet") {
    data = await raydium.api.fetchPoolById({ ids: poolId });
    poolInfo = data[0] as ApiV3PoolInfoStandardItemCpmm;
    if (!isValidCpmm(poolInfo.programId))
      throw new Error("target pool is not CPMM pool");
    rpcData = await raydium.cpmm.getRpcPoolInfo(poolInfo.id, true);
  } else {
    data = await raydium.cpmm.getPoolInfoFromRpc(poolId);
    poolInfo = data.poolInfo;
    poolKeys = data.poolKeys;
    rpcData = data.rpcData;
  }

  const baseIn = inputMint === poolInfo.mintA.address;

  //Calculate Expected SwapResult Output
  const swapResult = CurveCalculator.swap(
    inputAmount,
    baseIn ? rpcData.baseReserve : rpcData.quoteReserve,
    baseIn ? rpcData.quoteReserve : rpcData.baseReserve,
    rpcData.configInfo!.tradeFeeRate
  );

  //Create Swap Transaction
  const { execute } = await raydium.cpmm.swap({
    poolInfo: poolInfo,
    poolKeys: poolKeys,
    baseIn: baseIn,
    slippage: 0.05,
    swapResult: swapResult,
    inputAmount: inputAmount,
    config: {
      checkCreateATAOwner: true,
    },
    computeBudgetConfig: {
      units: 500000,
      microLamports: 500000,
    },
  });

  //Execute Swap Transaction
  const { txId } = await execute({ sendAndConfirm: true });
  console.log("txId...", txId);

  //append Txn Detail into JSON file
  appendTransactionData("cpmm-swap-transaction.json", {
    txId: txId,
    date: new Date().toISOString(),
  });

  console.log("CPMM SWAP EXECUTED SUCCESSFULLY...");
})();
