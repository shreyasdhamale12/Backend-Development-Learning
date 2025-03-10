const express = require('express');
const app = express()

const userModel = require('./userModel')

app.get('/', (req,res) => {
    res.send("hey")
})

app.get('/create', async(req,res) => {
    let userCreated = await userModel.create({
        name: "Shreyas1",
        email: "shreyas1@gmail.com",
        username: "shreyas1"
    })
     res.send(userCreated);
})

app.get('/update', async(req,res) => {
    let updated = await userModel.findOneAndUpdate({username:"shreyas"},{name:"Pintu"},{new:true})
    res.send(updated);
})

app.get('/read', async(req,res) => {
    let read = await userModel.find();
    res.send(read);
})

app.get('/delete', async(req,res) => {
    let deleted = await userModel.findOneAndDelete({username:"shreyas"});
    res.send(deleted);
})



app.listen(3000)