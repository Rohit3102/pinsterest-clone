const mongoose = require('mongoose');

const postModel = mongoose.Schema({
  postImage: String,
  title: String,
  description: String,
  user: [{
    type: mongoose.Schema.ObjectId,
    ref: "user"
  }],
  
});


module.exports = mongoose.model("post", postModel)