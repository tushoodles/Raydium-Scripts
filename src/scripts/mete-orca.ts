import { PublicKey } from "@solana/web3.js"
import { config } from "../config/env"
import DLMM from "@meteora-ag/dlmm";
import { connection } from "../Initialize-client/Initialize-client";

(async()=>{
    const POOLID = new PublicKey(config.CLMM_POOL_ID);
    const dlmmPool = await await DLMM.create(connection,POOLID);
    console.log("dlmmPool", dlmmPool);
})()