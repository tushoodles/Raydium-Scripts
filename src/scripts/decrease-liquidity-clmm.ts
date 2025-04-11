import {
  ApiV3PoolInfoConcentratedItem,
  ClmmKeys,
} from "@raydium-io/raydium-sdk-v2";
import { initSdk } from "../Initialize-client/Initialize-client";
import { isValidClmm } from "../Initialize-client/clmm-utils";
import { BN } from "bn.js";

(async () => {
  const raydium = await initSdk();

  let poolInfo: ApiV3PoolInfoConcentratedItem;
  const poolId = "Erysov5DXzW1iZmJTHTZ7Ssy2B4HJRY4sKsWAxa9bUpW";
  let poolKeys: ClmmKeys | undefined;
  let data;

  if (raydium.cluster === "mainnet") {
    data = await raydium.api.fetchPoolById({ ids: poolId });
    poolInfo = data[0] as ApiV3PoolInfoConcentratedItem;
    if (!isValidClmm(poolInfo.programId))
      throw new Error("target pool is not CLMM pool");
  } else {
    data = await raydium.clmm.getPoolInfoFromRpc(poolId);
    poolInfo = data.poolInfo;
    poolKeys = data.poolKeys;
  }

  const allposition = await raydium.clmm.getOwnerPositionInfo({
    programId: poolInfo.programId,
  });

  const position = allposition.find((p) => p.poolId.toBase58() === poolInfo.id);
  if (!position)
    throw new Error(`user do not have position in pool: ${poolInfo.id}`);

  const { execute, transaction } = await raydium.clmm.decreaseLiquidity({
    poolInfo: poolInfo,
    poolKeys: poolKeys,
    ownerPosition: position,
    ownerInfo: {
      useSOLBalance: true,
    },
    liquidity: position?.liquidity,
    amountMinA: new BN(10000000),
    amountMinB: new BN(10000000),
    txVersion: undefined,
  });

  const { txId } = await execute({ sendAndConfirm: true });
  console.log("txId:....", txId);
})();
