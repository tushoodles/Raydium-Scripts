import {
  ApiV3PoolInfoConcentratedItem,
  ClmmKeys,
  PoolUtils,
  TickUtils,
} from "@raydium-io/raydium-sdk-v2";
import { initSdk } from "../Initialize-client/Initialize-client";
import { config } from "../config/env";
import { isValidClmm } from "../Initialize-client/clmm-utils";
import Decimal from "decimal.js";
import { BN } from "bn.js";
import { appendTransactionData } from "./save-transaction";

(async () => {
  //Initialize raydium SDK
  const raydium = await initSdk();

  let poolInfo: ApiV3PoolInfoConcentratedItem;
  const poolId = config.CLMM_POOL_ID;
  let poolKeys: ClmmKeys | undefined;

  if (raydium.cluster === "mainnet") {
    const result = await raydium.api.fetchPoolById({ ids: poolId });
    const data = await raydium.api.fetchPoolById({ ids: poolId });
    poolInfo = data[0] as ApiV3PoolInfoConcentratedItem;
    if (!isValidClmm(poolInfo.programId))
      throw new Error("target pool is not CLMM pool");
  } else {
    const result = await raydium.clmm.getPoolInfoFromRpc(poolId);
    poolInfo = result.poolInfo;
    poolKeys = result.poolKeys;
  }

  const poolprice = await raydium.clmm.getRpcClmmPoolInfo({ poolId: poolId });

  const price = new Decimal("1.0000000787920276");

  const startprice = price.mul(0.95); // 5% below
  const endprice = price.mul(1.05);
  const currentPoolPrice = new Decimal(poolprice.currentPrice); // or whatever the correct key is
  console.log(
    "startprice , end price",
    startprice,
    endprice.plus(currentPoolPrice)
  );
  // const [startprice, endprice] = [0.000001, 100000];

  const { tick: lowerTick } = await TickUtils.getPriceAndTick({
    poolInfo,
    price: new Decimal(startprice),
    baseIn: true,
  });

  // console.log("lowerTick", lowerTick);

  const { tick: upperTick } = await TickUtils.getPriceAndTick({
    poolInfo,
    price: new Decimal(endprice.plus(currentPoolPrice)),
    baseIn: true,
  });

  // console.log("lowerTick", upperTick);
  const inputAmount = new Decimal(0.01)
    .mul(10 ** poolInfo.mintA.decimals)
    .toFixed(0);

  const result = await PoolUtils.getLiquidityAmountOutFromAmountIn({
    poolInfo,
    inputA: true,
    tickLower: Math.min(lowerTick, upperTick),
    tickUpper: Math.max(lowerTick, upperTick),
    amount: new BN(inputAmount),
    slippage: 0,
    add: true,
    epochInfo: await raydium.fetchEpochInfo(),
    amountHasFee: true,
  });

  const { execute } = await raydium.clmm.openPositionFromBase({
    poolInfo: poolInfo,
    poolKeys: poolKeys,
    tickLower: lowerTick,
    tickUpper: upperTick,
    base: "MintA",
    ownerInfo: {
      useSOLBalance: true,
    },
    baseAmount: new BN(
      new Decimal(0.01).mul(10 ** poolInfo.mintA.decimals).toFixed(0)
    ),
    otherAmountMax: result.amountSlippageB.amount,
    txVersion: undefined,
    computeBudgetConfig: {
      units: 6000000,
      microLamports: 1000000,
    },
  });

  const { txId } = await execute({ sendAndConfirm: true });
  console.log("txId:...........", txId);

  appendTransactionData("clmm-add-position.json", {
    txId: txId,
    date: new Date().toISOString(),
  });
  console.log("Txn Successfully Executed..........");
})();
