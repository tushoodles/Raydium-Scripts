import { appendTransactionData } from "./save-transaction";

import {
  ApiV3PoolInfoConcentratedItem,
  ClmmKeys,
  PoolUtils,
} from "@raydium-io/raydium-sdk-v2";
import { config } from "../config/env";
import { initSdk } from "../Initialize-client/Initialize-client";
import { isValidClmm } from "../Initialize-client/clmm-utils";
import Decimal from "decimal.js";
import { BN } from "bn.js";

//Import Require Value
const POOL_ID = config.CLMM_POOL_ID;
const inputAmount = config.ADD_LIQUIDITY_VALUE;
const slippage = 0.05;

(async () => {
  // raydium Initialization
  const raydium = await initSdk();

  let poolInfo: ApiV3PoolInfoConcentratedItem;
  let poolkey: ClmmKeys | undefined;
  let data;
  if (raydium.cluster === "mainnet") {
    data = await raydium.api.fetchPoolById({ ids: POOL_ID });
    poolInfo = data[0] as ApiV3PoolInfoConcentratedItem;
    if (!isValidClmm(poolInfo.programId))
      throw new Error("target pool is not CLMM pool");
  } else {
    data = await raydium.clmm.getPoolInfoFromRpc(POOL_ID);
    poolInfo = data.poolInfo;
    poolkey = data.poolKeys;
  }

  //get All position
  const allPosition = await raydium.clmm.getOwnerPositionInfo({
    programId: poolInfo.programId,
  });

  //get my position
  const position = allPosition.find((p) => p.poolId.toBase58() === poolInfo.id);

  if (!position)
    throw new Error(`user do not have position in pool: ${poolInfo.id}`);

  //Calculate Max Amount from Input AMount in Postion
  const maxAmount = await PoolUtils.getLiquidityAmountOutFromAmountIn({
    poolInfo: poolInfo,
    inputA: true,
    tickLower: Math.min(position.tickUpper, position.tickLower),
    tickUpper: Math.max(position.tickUpper, position.tickLower),
    amount: new BN(
      new Decimal(inputAmount || "0")
        .mul(10 ** poolInfo.mintA.decimals)
        .toFixed(0)
    ),
    slippage: slippage,
    add: true,
    epochInfo: await raydium.fetchEpochInfo(),
    amountHasFee: true,
  });

  //Create Add Liquidity transaction
  const { execute } = await raydium.clmm.increasePositionFromLiquidity({
    poolInfo: poolInfo,
    poolKeys: poolkey,
    ownerPosition: position,
    ownerInfo: {
      useSOLBalance: true,
    },
    liquidity: maxAmount.liquidity,
    amountMaxA: new BN(
      new Decimal(inputAmount).mul(10 ** poolInfo.mintA.decimals).toFixed(0)
    ),
    amountMaxB: new BN(
      new Decimal(maxAmount.amountSlippageB.amount.toString()).toFixed(0)
    ),
    checkCreateATAOwner: true,
    txVersion: undefined,
  });

  //Execute Add Liquidity Transaction
  const { txId } = await execute({ sendAndConfirm: true });

  //Append Txn into Json file
  appendTransactionData("clmm-add-liquidity.json", {
    txId: txId,
    date: new Date().toISOString(),
  });
})();
