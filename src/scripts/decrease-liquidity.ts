import {
  ApiV3PoolInfoStandardItemCpmm,
  CpmmKeys,
  CpmmRpcData,
  DEV_LOCK_CPMM_AUTH,
  DEV_LOCK_CPMM_PROGRAM,
} from "@raydium-io/raydium-sdk-v2";
import { initSdk } from "../Initialize-client/Initialize-client";
import { isValidCpmm } from "./cpmm-utils";
import { config } from "../config/env";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

const POOL_ID = config.CPMM_POOL_ID;

(async () => {
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

//   const { execute } = await raydium.cpmm.lockLp({
//     programId: DEV_LOCK_CPMM_PROGRAM,
//     authProgram: DEV_LOCK_CPMM_AUTH,
//     poolKeys: poolkey,
//     poolInfo: poolInfo,
//     lpAmount: new BN(123456), // some dummy amount, even small
//     txVersion: undefined,
//     computeBudgetConfig: {
//       units: 300000,
//       microLamports: 300000,
//     },
//   });

//   const { txId } = await execute({ sendAndConfirm: true });
//   console.log("Lock tx sent:", txId);

    const { execute, transaction } = await raydium.cpmm.harvestLockLp({
      programId: DEV_LOCK_CPMM_PROGRAM,
      authProgram: DEV_LOCK_CPMM_AUTH,
      poolKeys: poolkey,
      poolInfo: poolInfo,
      nftMint: new PublicKey("Hzbgu56BSeuTH1fDuz32nafVUzfVXgNxQYbsCAAVQZ7m"),
      lpFeeAmount: new BN(1),
      txVersion: undefined,
      computeBudgetConfig: {
        units: 300000,
        microLamports: 300000,
      },
    });

    console.log("transaction:...", transaction);

    const { txId } = await execute({ sendAndConfirm: true });
  console.log("txId....", txId);
})();
