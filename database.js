const express = require('express')
const app = express()
const mongoose = require('mongoose')

mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://hiteshverma3666:Bhiwani123@mychatapp.wbuvked.mongodb.net/partnerProject?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true}, 
    (err) => {
        if(err){
            console.log("Connection Failed", err)
        }
        else{
            console.log("Connection Success");
        }
    }
)

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
})

const User = new mongoose.model("users_datas", userSchema);

app.listen(5010, () => {
    console.log("Listening to MongoDB on port 5010")
})

module.exports = User;