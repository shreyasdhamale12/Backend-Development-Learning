const express = require('express');
const app = express();
const userModel = require('./models/user');
const postModel = require('./models/post');

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/create', async(req, res) => {
    let user = await userModel.create({
        username: 'John Doe',
        email: 'john@gmail.com',
        age: 25
    });
    res.send(user);
});

app.get('/post/create', async(req, res) => {
    let post = await postModel.create({
        postdata: 'This is a post data',
        user: "67c91e249af528ebc7487e57"
    });

    let user = await userModel.findOne({_id: "67c91e249af528ebc7487e57"});
    user.posts.push(post._id);
    await user.save();

    res.send({post, user});
});

app.listen(3000);