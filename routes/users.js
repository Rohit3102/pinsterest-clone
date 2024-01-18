const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect("mongodb://0.0.0.0/pin").then(()=>console.log("hyyy"));

const userModel = mongoose.Schema({
  username:String,
  fullname:String,
  email:String,
  contect:Number,
  password:String,
  profileImage:String,
  token:{
    type: Number,
    default: -1
  },
  boards:{
    type: Array,
    default: []
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "post"
  }]
});

userModel.plugin(plm, {usernameField: 'email'});
// userModel.plugin(plm)
module.exports = mongoose.model("user", userModel)