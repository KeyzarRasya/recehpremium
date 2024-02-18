const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    firstName:String,
    lastName:String,
    password:String,
    email:String,
    token:{
        type:Number,
        default:0,
        min:0
    }
})

const Model = mongoose.model("User", userSchema);

module.exports = Model;