var express = require('express');
var router = express.Router();

const userModel = require('./users');
const postModel = require('./post')
const upload = require('./multer')
const localStrategy = require('passport-local');
const passport = require('passport');
// passport.use(new localStrategy(userModel.authenticate()));
passport.use(userModel.createStrategy());
const {sendMail} = require('../utils/sendmail');
const { render } = require('ejs');


router.get('/', function (req, res, next) {
  res.render('index', { admin: req.user });
});

router.get('/signin', function (req, res, next) {
  res.render('signin', { admin: req.user });
});

router.post('/register', async function (req, res, next) {
  try {
    let userdata = await new userModel({
      username: req.body.username,
      fullname: req.body.fullname,
      email: req.body.email,
      contect: req.body.contect,
      secret: req.body.secret,
    });
    userModel.register(userdata, req.body.password)
      .then(function () {
        passport.authenticate("local")(req, res, function () {
          res.redirect('/feed')
        })
      });
  } catch (error) {
    res.send(error)
  }
});

router.get('/login', function (req, res, next) {
  res.render('login', { admin: req.user });
});

router.post('/login', passport.authenticate("local", {
  failureRedirect: '/login',
  successRedirect: '/feed',
}), function (req, res, next) { });

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err) }
    res.redirect('/')
  })
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  };
  res.redirect('/login');
};

router.get('/profile', isLoggedIn, async function (req, res, next) {
  try {
    // const user = await userModel.findOne({ username: req.session.passport.user }).populate("posts")
    const post = await userModel.findOne(req.user).populate("posts")
    res.render('profile', { admin: req.user, user:post });
  } 
  catch (error) {
    res.send(error);
  };
});

router.post('/upload', upload.single('image'), isLoggedIn, async function (req, res, next) {
  try {
    // const user = await userModel.findOne({ email: req.session.passport.user });
    const user = await userModel.findOne(req.user)
    user.profileImage = req.file.filename;
    await user.save()
    res.redirect('/profile')
  } catch (error) { 
    console.log(error)
    res.send(error)
  }
});

router.get('/updateprofile/:id', isLoggedIn, async function (req, res, next) {
  try {
    const profile = await userModel.findOne({_id:req.params.id})
    res.render('updateprofile', { admin: req.user, profile });
  } catch (error) {
    res.send(error)
    console.log(error);
  }
});

router.post('/updateprofile/:id', isLoggedIn, upload.single('image'), async function (req, res, next) {
  try {
    const profile = await userModel.findByIdAndUpdate(req.params.id, req.body)
    await profile.save();
    res.redirect('/profile');
  } catch (error) {
    res.send(error)
  }
})

router.get('/addpost', isLoggedIn, function (req, res, next) {
  res.render('addpost', { admin: req.user });
});

router.post('/createpost', isLoggedIn, upload.single("postImage"), async function (req, res, next) {
  try {
    const user = await userModel.findOne(req.user)
    // const user = await userModel.findOne({ email: req.session.passport.user });
    const media = new postModel({
      postImage: req.file.filename,
      title: req.body.title,
      description: req.body.description,
      user: user._id
    });
    console.log(media);
    user.posts.push(media._id);
    await media.save();
    await user.save()
    res.redirect('/profile')
  } catch (error) {
    res.send(error)
  }
});

router.get('/show/posts', isLoggedIn, async function (req, res, next) {
  try {
    // const user = await userModel.findOne({ username: req.session.passport.user }).populate("posts")
    const user = await userModel.findOne(req.user).populate("posts")
    res.render('show', { admin: req.user, user: user });
  } catch (error) {
    res.send(error);
  }
});

router.get('/feed', isLoggedIn, async function (req, res, next) {
  try {
    const user = await userModel.findOne( req.user)
    const posts = await postModel.find().populate("user")
    res.render('feed', { user, posts, admin: req.user });
  } catch (error) {
  }
});

router.get('/delete/:id', isLoggedIn, async function (req, res, next) {
  try {
    await postModel.findByIdAndDelete(req.params.id);
    res.redirect('/show/posts');
  } catch (error) {
    res.send(error);
  };
});

router.get('/updatepost/:id', isLoggedIn, async function (req, res, next) {
  try {
    const post = await postModel.findOne({_id: req.params.id})
    res.render('updatepost', { admin: req.user, data:post });
  } catch (error) {
    res.send(error)
    console.log(error);
  }
});

router.post('/updatepost/:id', isLoggedIn, upload.single('image'), async function (req, res, next) {
  try {
    const currentPost = await postModel.findById(req.params.id,)
    const post = await postModel.findByIdAndUpdate(req.params.id, {
      postImage: req.file.filename ,
      title: req.body.title ? req.body.title : currentPost.title,
      description: req.body.description ? req.body.description : currentPost.description,
    });
    await post.save();
    res.redirect('/show/posts')
  } catch (error) {
    res.send(error)
  }
});


router.post('/sendmail', async function(req, res, next){
  try {
    const user = await userModel.findOne({email: req.body.email});
    if(!user)
    return res.send("user not found! <a href='/forget' >try again <a/>");
  sendMail(user.email, user, res, req)
  } catch (error) {
    res.send(error)
    console.log(error);
  }
});

router.get('/verify', function(req, res, next) {
  res.render('verify');
});

router.get('/forget', function(req, res, next) {
  res.render('forget', {admin: req.user});
});

router.post('/forget/:id', async function(req, res, next){
  try {
    const user = await userModel.findById( req.params.id );
    if (!user)
        return res.send("User not found! <a href='/forget'>Try Again</a>.");
        if (user.token == req.body.token) {
          user.token = -1;
          await user.setPassword(req.body.newpassword);
          await user.save();
          res.redirect("/login");
          console.log(req.body.token);
      } else {
          user.token = -1;
          await user.save();
          res.send("Invalid Token! <a href='/forget'>Try Again<a/>");
      };
  } catch (error) {
    res.send(error);
  };
});

router.get('/reset', function(req, res, next) {
  res.render('reset', {admin:req.user});
});

router.post('/reset', async function(req, res, next){
  try {
    await req.user.changePassword(
        req.body.oldpassword,
        req.body.newpassword
    );
    await req.user.save();
    res.redirect("/profile");
} catch (error) {
    res.send(error);
}
});


router.get('/details/:id', async function(req, res,  next){
 try {
  const user = await userModel.findById(req.user)
  const posts = await postModel.findById(req.params.id).populate('user')
  res.render("details", {posts, user, admin: req.user })
  console.log(user);
 } catch (error) {
  res.send(error)
 }
})

module.exports = router;