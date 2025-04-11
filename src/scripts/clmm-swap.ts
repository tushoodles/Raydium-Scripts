import {
  ApiV3PoolInfoConcentratedItem,
  ClmmKeys,
  ComputeClmmPoolInfo,
  PoolUtils,
  ReturnTypeFetchMultiplePoolTickArrays,
} from "@raydium-io/raydium-sdk-v2";
import { initSdk } from "../Initialize-client/Initialize-client";
import { config } from "../config/env";
import { isValidClmm } from "../Initialize-client/clmm-utils";
import { BN } from "@coral-xyz/anchor";
import Decimal from "decimal.js";
import { appendTransactionData } from "./save-transaction";

//Import ENV values
const poolId = config.CLMM_POOL_ID;
const INPUT_TOKEN = config.MINT_TOKEN_A;
const inputAmount = new BN(100);

(async () => {
  //Initialize Raydium SDK
  const raydium = await initSdk();

  let poolInfo: ApiV3PoolInfoConcentratedItem;
  let poolKeys: ClmmKeys | undefined;
  let clmmPoolInfo: ComputeClmmPoolInfo;
  let tickCache: ReturnTypeFetchMultiplePoolTickArrays;

  if (raydium.cluster === "mainnet") {
    const data = await raydium.api.fetchPoolById({ ids: poolId });
    poolInfo = data[0] as ApiV3PoolInfoConcentratedItem;

    if (!isValidClmm(poolInfo.programId)) {
      throw new Error("Target pool is not a CLMM pool");
    }

    clmmPoolInfo = await PoolUtils.fetchComputeClmmInfo({
      connection: raydium.connection,
      poolInfo: poolInfo,
    });

    tickCache = await PoolUtils.fetchMultiplePoolTickArrays({
      connection: raydium.connection,
      poolKeys: [clmmPoolInfo],
    });
  } else {
    const data = await raydium.clmm.getPoolInfoFromRpc(poolId);
    poolInfo = data.poolInfo;
    poolKeys = data.poolKeys;
    clmmPoolInfo = data.computePoolInfo;
    tickCache = data.tickData;
  }

  // console.log("poolInfo:", poolInfo);
  // console.log("poolKeys:", poolKeys);
  // console.log("clmmPoolInfo:", clmmPoolInfo);
  // console.log("tickCache:", tickCache);

  const baseIn = INPUT_TOKEN === poolInfo.mintA.toString();

  //Compute Output Amount with Input Amount
  const { minAmountOut, remainingAccounts } =
    await PoolUtils.computeAmountOutFormat({
      poolInfo: clmmPoolInfo,
      tickArrayCache: tickCache[poolId],
      amountIn: inputAmount,
      tokenOut: poolInfo[baseIn ? "mintB" : "mintA"],
      slippage: 0.01,
      epochInfo: await raydium.fetchEpochInfo(),
    });

  //Create Swap Transaction
  const { execute } = await raydium.clmm.swap({
    poolInfo: poolInfo,
    poolKeys: poolKeys,
    inputMint: INPUT_TOKEN,
    amountIn: inputAmount,
    amountOutMin: minAmountOut.amount.raw,
    observationId: clmmPoolInfo.observationId,
    ownerInfo: {
      useSOLBalance: true,
    },
    txVersion: undefined,
    remainingAccounts: remainingAccounts,
    checkCreateATAOwner: true,
    computeBudgetConfig: {
      units: 200000,
      microLamports: 200000,
    },
  });

  // Execute On chain Transaction
  const { txId } = await execute({ sendAndConfirm: true });
  console.log("txId :......", txId);

  //Append transaction Detail into JSON file
  appendTransactionData("clmm-swap-transactions.json", {
    txId: txId,
    date: new Date().toISOString(),
  });
})();
