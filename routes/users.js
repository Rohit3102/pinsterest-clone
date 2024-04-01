const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect("mongodb://0.0.0.0/pin").then(()=>console.log("hyyy"));

const userModel = mongoose.Schema({
  username:String,
  fullname:String,
  email:{
    type: String,
    unique: true,
    required: [true, "Email Is Required"],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  contect:Number,
  password:{
    type: String,
    maxLength: [15, "password should not exceed more than 15 characters"],
    minLength: [5, "password should have atleast 5 characters"],
    match: [/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*_)(?!.*\W)(?!.* ).{6,15}$/
  ]
  },
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