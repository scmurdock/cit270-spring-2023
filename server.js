const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const port = 3000;

app.use(bodyParser.json()); //allow JSON (Javascript Object Notation) requests

app.listen(port,()=>{
    console.log("Listening on port: "+port);
});

app.get('/',(req,res)=>{
    // res.redirect(301,'https://google.com');
    res.send("Welcome to my Node Server");
})

app.post('/login',(req,res)=>{
    const loginBody = req.body;
    const userName = loginBody.userName;
    const password = loginBody.password;
    if (password==="P@ssw0rd"){
        //this happens if the password is correct
        res.send("Welcome "+userName);
    } else {
        //this happens if the password is not correct
        res.status(401);//unauthorized
        res.send("Incorrect password");
    }
  
});