import {
  AmmV4Keys,
  AmmV5Keys,
  ApiV3PoolInfoStandardItem,
} from "@raydium-io/raydium-sdk-v2";
import { config } from "../config/env";
import { initSdk, txVersion } from "../Initialize-client/Initialize-client";
import { isValidAmm } from "./clmm-utils";
import { BN } from "bn.js";
import { appendTransactionData } from "./save-transaction";

//ENV Values are Imported
const POOL_ID = config.AMM_POOL_ID;
const mintIn = config.MINT_TOKEN_A;
const mintOut = config.MINT_TOKEN_B;

(async () => {
  //Initialize Raydium SDK
  const raydium = await initSdk();

  let poolkey: AmmV4Keys | AmmV5Keys | undefined;
  let poolInfo: ApiV3PoolInfoStandardItem;
  let rpcData;

  if (raydium.cluster === "mainnet") {
    const data = await raydium.api.fetchPoolById({ ids: POOL_ID });
    poolInfo = data[0] as ApiV3PoolInfoStandardItem;
    if (!isValidAmm(poolInfo.programId))
      throw new Error("Target pool is not AMM pool");

    poolkey = await raydium.liquidity.getAmmPoolKeys(POOL_ID);
    rpcData = await raydium.liquidity.getRpcPoolInfo(POOL_ID);
  } else {
    const data = await raydium.liquidity.getPoolInfoFromRpc({
      poolId: POOL_ID,
    });
    poolInfo = data.poolInfo;
    poolkey = data.poolKeys;
    rpcData = data.poolRpcData;
  }

  const [baseReserve, quoteReserve, status] = [
    rpcData.baseReserve,
    rpcData.quoteReserve,
    rpcData.status.toNumber(),
  ];
  //Compute Output Amount
  const out = await raydium.liquidity.computeAmountOut({
    poolInfo: {
      ...poolInfo,
      baseReserve,
      quoteReserve,
      status,
      version: 4,
    },
    amountIn: new BN(10),
    mintIn,
    mintOut,
    slippage: 0.01,
  });

  console.log("Calculated output amount:", out.amountOut.toString());

  //Create Swap Transaction
  const { execute } = await raydium.liquidity.swap({
    poolInfo: poolInfo,
    poolKeys: poolkey,
    amountIn: new BN(10),
    amountOut: out.minAmountOut,
    inputMint: mintIn,
    fixedSide: "in",
    txVersion,
    computeBudgetConfig: {
      units: 100000,
      microLamports: 100000,
    },
  });
  //Execute Swap Transaction
  const { txId } = await execute({ sendAndConfirm: true });
  console.log("✅ Swap executed! Tx ID:", txId);

  //Append Transaction into JSON file
  await appendTransactionData("Amm-swap-transaction.json", {
    txId: txId,
    Date: new Date().toISOString(),
  });
})();
