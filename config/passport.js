const User = require('../models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Passort serialize and Deserialize
passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

// Passport local strategy
passport.use(new LocalStrategy({
    passReqToCallback: true // pass request to the callback
},
    function (req, username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                req.flash('danger', 'Incorrect username or password');
                return done(null, false);
            }
            user.checkPassword(password, function (err, result) {
                if (err)
                    return next(err);
                if (!result) {
                    req.flash('danger', 'Incorrect  username or password');
                    return done(null, false);
                }
                return done(null, user);
            });
        }).select("+password"); // for returning password which is hidden by defualt
    }
));

// Authenticate request i.e is user loggedin
exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('danger', 'To access please login first.');
    res.redirect('/users/login');
  };

  // Check if user is not logged in
  exports.notLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/users/');
  };