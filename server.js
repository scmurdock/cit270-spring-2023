const express = require('express');
// To interpret the data sent by the user we must include the library:
const bodyParser = require('body-parser');
const fs = require('fs')
const https = require('https');
const Redis = require('redis');
const { createHash } = require('node:crypto');

const app = express();

const port = 3000;

const redisClient = Redis.createClient({url:'redis://127.0.0.1:6379'});
//to use the body parser in the server, we must add the code below:

app.use(bodyParser.json()); //allow JSON (Javascript Object Notation) requests

app.listen(port,()=>{
    redisClient.connect();//the API Server is trying to connect with Redis
    console.log("Listening on port: "+port);
});

// https.createServer({
//     key: fs.readFileSync('/etc/letsencrypt/archive/seanmurdock.cit270.com/privkey1.pem'),//this is a private key
//     cert: fs.readFileSync('/etc/letsencrypt/archive/seanmurdock.cit270.com/cert1.pem'),//this is the certificate chain
//     ca: fs.readFileSync('/etc/letsencrypt/archive/seanmurdock.cit270.com/chain1.pem')//this is the certificate chain
//   }, app).listen(port, () => {
//     redisClient.connect();//the API Server is trying to connect with Redis
//     console.log('Listening...')
//   });

app.get('/',(req,res)=>{
    // res.redirect(301,'https://google.com');
    res.send("Welcome to my Node Server");
})

//To allow the user to send their username and password
//We must create a POST endpoint in the server.js file
app.post('/login',async (req,res)=>{
    const userName = req.body.userName;
    const password = req.body.password;
    const redisPassword = await redisClient.hmGet('users',userName);
    if(userName!=null && password ==redisPassword){
        res.send("Welcome: "+userName);        
    } else{
        res.status(401);
        res.send("Unauthorized");
    }

})


app.post('/signup',async(req,res)=>{
    const loginBody = req.body;
    const userName = loginBody.userName;
    const password = loginBody.password;
    const hashedPassword = password==null? null : createHash('sha3-256').update(password).digest('hex');

    if(userName!=null && password!=null){
        await redisClient.hSet('hashedpasswords',userName,hashedPassword);
        res.send("Added user: "+userName);

    } else{
        res.status(400);
        res.send("Null userName or password -- user not added.")
    }

    
});

app.post('/login',async (req,res)=>{
    const loginBody = req.body;
    const userName = loginBody.userName;
    const password = loginBody.password;//we need to hash the password the user gave us
    const hashedPassword = password==null? null : createHash('sha3-256').update(password).digest('hex');
    console.log("Hashed Password: "+hashedPassword);
    const redisPassword = password==null ? null : await redisClient.hGet('hashedpasswords',userName);
    console.log("Redis Password for: "+userName+": "+redisPassword);
    if (password!=null && hashedPassword===redisPassword){
        //this happens if the password is correct
        res.send("Welcome "+userName);
    } else {
        //this happens if the password is not correct
        res.status(401);//unauthorized
        res.send("Incorrect password");
    }
 
}

);