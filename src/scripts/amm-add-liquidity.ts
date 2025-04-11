import {
  AmmV4Keys,
  AmmV5Keys,
  ApiV3PoolInfoStandardItem,
  Percent,
  TokenAmount,
  toToken,
} from "@raydium-io/raydium-sdk-v2";
import { config } from "../config/env";
import { initSdk, txVersion } from "../Initialize-client/Initialize-client";
import Decimal from "decimal.js";
import { appendTransactionData } from "./save-transaction";

const POOL_ID = config.AMM_POOL_ID;

(async () => {
  try {
    //Initialize raydium client
    const raydium = await initSdk();
    const poolId = POOL_ID;

    let poolkey: AmmV4Keys | AmmV5Keys | undefined;
    let poolInfo: ApiV3PoolInfoStandardItem;
    let data = null;

    if (raydium.cluster === "mainnet") {
      const result = await raydium.api.fetchPoolById({ ids: poolId });
      poolInfo = result[0] as ApiV3PoolInfoStandardItem;
    } else {
      const result = await raydium.liquidity.getPoolInfoFromRpc({
        poolId: poolId,
      });
      poolkey = result.poolKeys;
      poolInfo = result.poolInfo;
    }

    const inputAmountB = "20";

    //Compute Output-Amount on Input-Amount
    const matchAmount = await raydium.liquidity.computePairAmount({
      poolInfo: poolInfo,
      amount: inputAmountB,
      baseIn: false,
      slippage: new Percent(5, 100),
    });

    console.log(
      "matchAmount:..........",
      matchAmount.maxAnotherAmount.toExact()
    );

    //Create Transaction of Add-Liquidity
    const { execute, transaction } = await raydium.liquidity.addLiquidity({
      poolInfo: poolInfo,
      poolKeys: poolkey,
      amountInB: new TokenAmount(
        toToken(poolInfo.mintB),
        new Decimal(inputAmountB).mul(10 ** poolInfo.mintB.decimals).toFixed(0)
      ),
      amountInA: new TokenAmount(
        toToken(poolInfo.mintA),
        new Decimal(matchAmount.maxAnotherAmount.toExact())
          .mul(10 ** poolInfo.mintA.decimals)
          .toFixed(0)
      ),
      otherAmountMin: matchAmount.minAnotherAmount,
      fixedSide: "b",
      txVersion,
      computeBudgetConfig: {
        units: 200000,
        microLamports: 200000,
      },
    });

    //Execute Liquidity Transaction
    const { txId } = await execute({ sendAndConfirm: true });


    //Append Transaction into JSON file
    appendTransactionData("liquidity-transactions.json", {
      txnId: txId,
      url: `https://explorer.solana.com/tx/${txId}?cluster=devnet`,
      timeStamp: new Date().toISOString(),
    });

    console.log("ADD LIQUIDITY SUCCESSFULLY.......", txId);
  } catch (err) {
    console.error("❌ Error occurred while adding liquidity:", err);
  }
})();
