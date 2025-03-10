const express = require('express');
const app = express();
const userModel = require('./models/user');
const brypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const path = require('path');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/create', (req, res) => {
    let { username, password, email, age } = req.body;

    brypt.genSalt(10, (err, salt) => {
        brypt.hash(password, salt, async (err, hash) => {
            let createduser = await userModel.create({
                username,
                password: hash,
                email,
                age
            });

            let token = jwt.sign({email},"shhh");
            res.cookie('token',token);

            res.send(createduser);
        });
    });

});

app.get('/logout', (req, res) => {
    res.cookie("token", "");
    res.redirect("/");
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login',async (req, res) => {
    let user = await userModel.findOne({email:req.body.email});

    if(!user){
        return res.send("Something went wrong");
    }
    brypt.compare(req.body.password,user.password,(err,result)=>{
        if(result){ 
            let token = jwt.sign({email: user.email},"shhh");
            res.cookie('token',token);
            res.send("You can login now");
        }
        else res.send('you cant login')
    });

});

app.listen(3000);