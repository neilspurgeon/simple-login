var express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    db = require("./models"),
    session = require("express-session");

app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: 'super secret',
  resave: false,
  saveUninitialized: true
}));

var path = require("path");
var views = path.join(process.cwd(), "views");

// if user isn't logged in, route to login
// middleware
app.use("/", function (req, res, next) {
	//res.send("working");
  req.login = function (user) {
    req.session.userId = user._id;
  };
  req.currentUser = function (cb) {
     db.User.
      findOne({
          _id: req.session.userId
      },

      function (err, user) {
        req.user = user;
        cb(null, user);
      });
  };

  // clears the session
  req.logout = function () {
    req.session.userId = null;
    req.user = null;
  };

  next(); 
});

// SIGN UP 
// =====================================

// signup get
app.get("/signup", function (req, res) {
  var signUpPath = path.join(views, "signup.html");
  res.sendFile(signUpPath);
});

// LOGIN
// =====================================
// login post
app.post("/login", function (req, res) {
  var user = req.body.user;

  db.User
    .authenticate(user.email, user.password,
    function (err, user) {
          // note here the super step
          req.login(user);
          // We need to create this route
          res.redirect("/profile"); // redirect to user profile
      });
});

// login get
app.get("/login",  function(req, res) {
	var loginPath = path.join(views, "login.html");
	res.sendFile(loginPath);
});

// PROFILE / USERS
// =====================================
// user profile
app.get("/profile", function (req, res) {
	// var profilePath = path.join(views, "login.html");
	// res.sendFile(profilePath);
  req.currentUser(function (err, user) {
        res.send(user);
        $("body").append(user._id);
   });
});

//signup post
app.post("/users", function (req, res) {
	var user = req.body.user;

	db.User
		.createSecure (user.email, user.password,
		function (err, user) {
			console.log(user);
			req.login(user);
			res.redirect("/profile");
    });
});

// logout
app.get("/logout", function (req, res) {
	req.currentUser(function (err, user) {
	      res.logout(user);
	 });
});

app.get("/", function(req, res) {
	var session = req.session.userId;
	console.log(req.session);
	if (session) {
		res.redirect("/profile");
	}
	res.redirect("/login");
});

app.listen(3000, function () {
  console.log("SERVER RUNNING");
});
