const express = require('express');
const app = express();
const userModel = require('./models/user');
const postModel = require('./models/post');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const upload = require('./config/multer');


app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/test', (req, res) => {
    res.render('test');
});

app.post('/upload',isLoggedin ,upload.single("image"),async (req, res) => {
     let user = await userModel.findOne({email:req.user.email});
      user.profilepic = req.file.filename;
      await user.save();
        res.redirect('/profile');
});

app.get('/profile/upload', (req, res) => {
    res.render('test');
});

app.get('/profile', isLoggedin ,async(req, res) => { 
    let user = await userModel.findOne({email:req.user.email});
    await user.populate('posts');
    res.render('profile',{user} );
});

app.get('/like/:id', isLoggedin, async(req, res) => {
    let post = await postModel.findOne({_id:req.params.id}).populate('user');
    
    if(post.likes.indexOf(req.user.userid) === -1){
        post.likes.push(req.user.userid);
    }else{
        post.likes.splice(post.likes.indexOf(req.user.userid),1);
    }    

    await post.save();
    res.redirect('/profile');
});

app.get('/edit/:id', isLoggedin, async(req, res) => {
    let post = await postModel.findOne({_id:req.params.id});
    res.render('edit',{post});
});

app.post('/update/:id', isLoggedin, async(req, res) => {
    let post = await postModel.findOneAndUpdate({_id:req.params.id},{content:req.body.content});
    res.redirect('/profile');
});

app.post('/post', isLoggedin ,async(req, res) => { 
    let user = await userModel.findOne({email:req.user.email});
    let {content} = req.body;

    let post = await postModel.create({
        user: user._id,
        content
    })
    user.posts.push(post._id);
    await user.save();
    res.redirect('/profile');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/register', async(req, res) => {
    let { username, name, age, email, password } = req.body;

    let user = await userModel.findOne({email});
    if(user){
        return res.send('User already exists');
    }

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async(err, hash) => {
            let user = userModel.create({
                username,
                name,
                age,
                email,
                password: hash
            });

            let token = jwt.sign({email:email,userid:user._id},"shh");
            res.cookie('token',token);
            res.send('User registered');
        });
    });
});

app.post('/login', async(req, res) => {
    let {email, password } = req.body;

    let user = await userModel.findOne({email});
    if(!user){
        return res.send('Something went wrong');
    }

    bcrypt.compare(password, user.password, (err, result) => {
        if(!result){
            return res.redirect('login');
        }else{
            let token = jwt.sign({email:email,userid:user._id},"shh");
            res.cookie('token',token);
            res.status(200).redirect('profile');
      }
    });
});

app.get('/logout', (req, res) => {
    res.cookie('token', '');
    res.render('login');
});

function isLoggedin(req, res, next){
    if(!req.cookies.token){
        return res.send("You are not logged in");
    }else{
        try {
            let data = jwt.verify(req.cookies.token, "shh");
            req.user = data;
            next();
        } catch (err) {
            return res.send("Invalid or expired token");
        }
    }
};

app.listen(3000);