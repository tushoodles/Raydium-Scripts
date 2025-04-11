import *  as dotenv from 'dotenv'
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config =  {
    SECRET_KEY:process.env.SECRET_KEY || ' ',
    MINT_TOKEN_A:process.env.MINT_TOKEN_A || ' ',
    MINT_TOKEN_B:process.env.MINT_TOKEN_B || ' ',
    AMM_MARKET_ID:process.env.AMM_MARKET_ID || ' ',
    AMM_POOL_ID:process.env.AMM_POOL_ID || ' ',
    CPMM_POOL_ID:process.env.CPMM_POOL_ID || ' ',
    CLMM_POOL_ID:process.env.CLMM_POOL_ID || ' ',
    CLUSETR:process.env.CLUSTER || 'mainnet',
    ADD_LIQUIDITY_VALUE:process.env.ADD_LIQUIDITY_VALUE || '3',
    SWAP_VALUE_FROM_POOL:process.env.SWAP_VALUE_FROM_POOL || '1',
    TOKEN_TOTAL_SUPPLY:process.env.TOKEN_TOTAL_SUPPLY || '1000',
    ANOTHER_TOKEN:process.env.ANOTHER_TOKEN || ' ',
    DECIMAL:process.env.DECIMAL || 0,
}