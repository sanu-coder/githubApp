

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const { createAppAuth } = require("@octokit/auth-app");
const { MongoClient, ObjectId } = require('mongodb');
const cookieParser = require('cookie-parser');
const request = require('request');
const fs = require('fs');
const config = require('./config.json');
const store = require("store2");

var  corsOptions  = {
    origin: 'http://127.0.0.1:4200',
    credentials: true,
    maxAge: '1728000'
    // this item is set specifically for cross-domain purposes 
}


app.use(express.json());
app.use(cors());
app.use(cookieParser());

const pem = fs.readFileSync('./token.pem', 'utf8');


const client = new MongoClient(
    config.dbServer, 
    { 
        useNewUrlParser: true, 
        useUnifiedTopology: true 
    }
);


client.connect(async(err) => {
    const collection = client.db("githubApp").collection("github");
    dbConn= client.db("githubApp");
});


async function createJWT(installationId) {
    console.log(installationId);
    const auth = createAppAuth({
      appId: 188789,
      privateKey: pem,
      clientId: config.clientId,
      clientSecret: config.clientSecret
    });
    console.log("auth");
    console.log(auth);


    const  response  = await auth({ 
        type: 'app' 
    });
    return response;
}

app.post('/github', async(req, res) => {
    try{
        // const userToken = 'abcd';
        // res.cookie('token',userToken);
        // store.set('token', userToken); 
        // console.log(store.get('token'));
        const installationId = req.body.installation.id;
        const username = req.body.installation.account.login;
        const { token } = await createJWT(installationId);
        console.log(token);
        const item =  await dbConn.collection("github").insertOne({ 
            username : username , 
            token : token
        });
        res.send({
            result : "success",
        })
    }
    catch(error){
        console.log(error);
    } 
})

// app.get('/github', async(req,res)=>{
//     try{
//         const token = 'abcd';
//         res.cookie('token',token);
//         store.set('token', token); 
//         store.set('token', "7878372873487237"); 
//         console.log(store.get('token'));
//         res.send({
//             result : 'success',
//         })
//     }
//     catch(error){
//         console.log(error);
//     }
// });


app.listen(3200,()=>{
    console.log("Server started");
})