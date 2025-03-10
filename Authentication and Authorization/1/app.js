const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.get('/', (req, res) => {
    const token = jwt.sign({email:"shreyas@gmail.com"},"secret");
    res.cookie("token",token);
    res.send("hello")   
})

app.get('/read', (req, res) => {
    console.log(req.cookies.token);
});

app.get('/verify', (req, res) => {
    let data = jwt.verify(req.cookies.token, "secret");
    console.log(data);
    
});

app.listen(3000);