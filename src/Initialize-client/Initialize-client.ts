import { Raydium, TxVersion } from '@raydium-io/raydium-sdk-v2';
import { Connection, Keypair, clusterApiUrl } from '@solana/web3.js';
import bs58 from 'bs58';
import { config } from '../config/env';


const SECRET_KEY = config.SECRET_KEY;
export const owner: Keypair = Keypair.fromSecretKey(bs58.decode(SECRET_KEY));
export const connection =  new Connection(clusterApiUrl("devnet"), "confirmed");
export const txVersion = TxVersion.LEGACY;


const cluster = 'devnet';
let raydium: Raydium | undefined;

export const initSdk = async(params ?: {loadToken?:boolean})=>{
    if(raydium) return raydium
    console.log(`Connecting to ${connection.rpcEndpoint} in ${cluster}`)

    raydium = await Raydium.load({
        owner,
        connection,
        cluster,
        disableFeatureCheck:true,
        disableLoadToken:!params?.loadToken,
        blockhashCommitment:'finalized',
    })
    return raydium;
}
  
