import {
  ApiV3PoolInfoConcentratedItem,
  ClmmKeys,
} from "@raydium-io/raydium-sdk-v2";
import { initSdk } from "../Initialize-client/Initialize-client";
import { config } from "../config/env";
import { isValidClmm } from "../Initialize-client/clmm-utils";

(async () => {
  const raydium = await initSdk();

  let poolInfo: ApiV3PoolInfoConcentratedItem;
  const poolId = config.CLMM_POOL_ID;
  let poolKeys: ClmmKeys | undefined;

  if (raydium.cluster === "mainnet") {
    const result = await raydium.api.fetchPoolById({ ids: poolId });
    poolInfo = result[0] as ApiV3PoolInfoConcentratedItem;
    if (!isValidClmm(poolInfo.programId))
      throw new Error("target pool is not CLMM pool");
  } else {
    const result = await raydium.clmm.getPoolInfoFromRpc(poolId);
    poolInfo = result.poolInfo;
    poolKeys = result.poolKeys;
  }

  // ✅ FIXED: Use correct CLMM program ID
  const allposition = await raydium.clmm.getOwnerPositionInfo({
    programId: config.CLMM_POOL_ID,
  });

  const position = allposition.find((p) => p.poolId.toBase58() === poolInfo.id);
  if (!position)
    throw new Error(`User has no position in pool: ${poolInfo.id}`);

  const { execute, transaction } = await raydium.clmm.closePosition({
    poolInfo: poolInfo,
    poolKeys: poolKeys,
    ownerPosition: position,
    txVersion: 1,
    computeBudgetConfig: {
      units: 100000,
      microLamports: 100000,
    },
  });

  // ✅ Execute transaction
  const { txId } = await execute({ sendAndConfirm: true });
  console.log("Closed CLMM position. Tx ID:", txId);
  
})();
