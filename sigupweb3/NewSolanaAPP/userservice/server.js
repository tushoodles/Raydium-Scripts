const express= require('express');
const bodyParser=require('body-parser');
const path = require('path');
const app= express();
const crypto = require('crypto');
const { type } = require('os');
const userschema = require("./models/UserSchema.js");
const { mongo, default: mongoose } = require('mongoose');
const producer= require("./Producer.js");



app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(express.static('public'));




async function  dbconnect(){
    mongoose.connect("mongodb://localhost:27017/Solanapplication").then(()=>{
        console.log("Data Base Connected");
    }).catch((error)=>{
        console.log("error", error);
    })
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const challengesStorage={};

const generateChallenge = () => crypto.randomBytes(32).toString('hex');

app.post('/request-challenge',(req,res)=>{
    const {publicKey} =req.body;
    try{
        console.log("publickey", publicKey, typeof publicKey);

        const challenge = generateChallenge();
        console.log("challenge generate from backend",challenge, typeof challenge);


        challengesStorage[publicKey]=challenge;

        res.json({challenge});

    }catch(error){
        console.log("errror in request-challenge",error);
    }
})

app.post("/verify-signature",async(req,res)=>{
    console.log("req body in verify-signature",req.body);

    if(!req.body.publicKey || !req.body.signaturearr || !req.body.challenge ){
        return res.status(400).json({message :`Public Key. Signature and Challenge Required`});
    }

    if(challengesStorage[req.body.publicKey] !== req.body.challenge){
        return res.status(400).json({ message: 'Invalid challenge' });
    }

    try{
        const verified = verifyChallengeSignature(req.body.publicKey, req.body.signaturearr, req.body.challenge);
        console.log("verified", verified.bool);
            const dataSchema= userschema({
                walletaddress:req.body.publicKey,
                challenge:req.body.challenge
            })

           console.log("dataSchema", dataSchema);

           const result=  await dataSchema.save();
           console.log("result", result);
           
          console.log(result ? "data Save Successfully" : " Data not save ")

      
    }catch(error){
        console.error('Error verifying signature:', error);
      res.status(500).json({ message: 'Internal server error' });
        
    }
})

app.post('/login-with-phantom',async(req,res)=>{

    const {publicKey,challenge }=req.body;
  
  //  const verification=verifyChallengeSignature(Publickey,signature, challenge);

    await producer({publicKey, challenge})
       
    

})

const verifyChallengeSignature=(Publickey, signature, challenge)=>{
        try{
            console.log(" Publickey type :",typeof Publickey)
            console.log(" signature type :",typeof signature)
            console.log("challenge type :", typeof challenge)
            const verify=crypto.createVerify('SHA256');
            verify.update(challenge);
            verify.end();

            const signatureBuffer = Buffer.from(signature, 'base64');

            //const isValid=verify.verify(Publickey,signatureBuffer);
            
            const isValid={
                bool:true,
            }

            return isValid;
        }catch(error){
            console.log("error");
        }
}






app.listen(3000,async()=>{
    await dbconnect();
    console.log("Server is Running");
})