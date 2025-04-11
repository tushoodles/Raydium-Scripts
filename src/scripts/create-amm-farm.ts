import { ApiV3PoolInfoStandardItem } from "@raydium-io/raydium-sdk-v2";
import { initSdk } from "../Initialize-client/Initialize-client";
import { config } from "../config/env";

const MYOTOKEN = config.MINT_TOKEN_A;
const POOL_ID = config.AMM_POOL_ID;

(async () => {
  const raydium =await initSdk();

  const poolInfo = (
    await raydium.api.fetchPoolById({
      ids: "6UmmUiYoBjSrhakAobJw8BvkmJtDVxaeBtbt7rxWo1mg",
    })
  )[0] as ApiV3PoolInfoStandardItem;
  if (!poolInfo) throw new Error("pool not found");

  console.log("PoolInfo...",poolInfo)
  const rewardMint = await raydium.token.getTokenInfo(MYOTOKEN);
  console.log("reward Mint", rewardMint)
//   const currentChainTime = await raydium.currentBlockChainTime();
//   const openTime = Math.floor(currentChainTime / 1000); // in seconds
//   const endTime = openTime + 60 * 60 * 24 * 7;
})();
