const User = require('../models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const utils = require('./utils.js');

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
                req.flash('danger', 'Incorrect username or password.');
                return done(null, false);
            }
            user.checkPassword(password, function (err, result) {
                if (err)
                    return next(err);
                if (!result) {
                    req.flash('danger', 'Incorrect  username or password.');
                    return done(null, false);
                }
                return done(null, user);
            });
        }).select("+password"); // for returning password which is hidden by defualt
    }
));

// Passport facebook strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    passReqToCallback: true,
    callbackURL: "http://localhost:3000/users/auth/facebook/callback",
    profileFields: ['id', 'emails', 'name']
},
    function (req, accessToken, refreshToken, profile, done) {
        if (!req.user) { // If user in not looged in
            // find the user with specific facebook id in database
            User.findOne({ 'facebook.id': profile.id }, function (err, user) {
                if (err)
                    return done(err);

                if (user) { // if user with fb id found

                    let updatedEmail = user.email || profile.emails[0].value;
                    let updatedDisplayName = user.displayName || (profile.name.givenName || "") + " " + (profile.name.middleName || "") + " " + (profile.name.familyName || "");
                    let updatedUsername = user.username || "facebookuser-" + profile.id;
                    let updatedUser = {
                        'facebook.accessToken': accessToken,
                        email: updatedEmail,
                        displayName: updatedDisplayName,
                        username: updatedUsername
                    };

                    // Check if details are required to be updated
                    if ((typeof user.facebook != undefined) && (typeof user.facebook.accessToken != undefined) && (typeof user.email != undefined) && user.facebook.accessToken === accessToken && user.email === updatedEmail) {
                        return done(null, user);
                    } else {
                        let options = { runValidators: true, upsert: true };
                        user.update({ $set: updatedUser }, options, function (err, result) {
                            if (err) {
                                if (err.code === 11000) {
                                    let indexName = utils.indexName(err);
                                    let errMsg = utils.capitalize(indexName) + ' already linked to another account. Please login with that account or click forgot password.'
                                    req.flash('danger', errMsg);
                                    return done(null, false);
                                }
                                else {
                                    return done(err);
                                }
                            }
                            user.facebook.accessToken = accessToken;
                            user.email = updatedEmail;
                            user.displayName = updatedDisplayName;
                            user.username = updatedUsername;
                            return done(null, user);
                        });
                    }

                }
                else { // if user with fb id not found
                    let newUser = new User(
                        {
                            'facebook.id': profile.id,
                            'facebook.accessToken': accessToken,
                            email: profile.emails[0].value,
                            displayName: (profile.name.givenName || "") + " " + (profile.name.middleName || "") + " " + (profile.name.familyName || ""),
                            username: "facebookuser-" + profile.id
                        });

                    // save our new user to the database
                    newUser.save(function (err) {
                        if (err) {
                            if (err.code === 11000) {
                                let indexName = utils.indexName(err);
                                let errMsg = utils.capitalize(indexName) + ' already linked to another account. Please login with that account or click forgot password.'
                                req.flash('danger', errMsg);
                                return done(null, false);
                            }
                            else {
                                return done(err);
                            }
                        }

                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }
            });

        }
        else {// If user is logged in this is called using connect to facebook not login

            let user = req.user; // pull the user out of the session

            // update the current users facebook credentials
            user.facebook.id = profile.id;
            user.facebook.accessToken = accessToken;
            user.facebook.email = profile.emails[0].value;
            user.displayName = user.displayName || (profile.name.givenName || "") + " " + (profile.name.middleName || "") + " " + (profile.name.familyName || "");

            // save the user
            user.save(function (err) {
                if (err) {
                    return done(err);
                }
                // Successfull return the created user
                return done(null, user);
            });

        }
    }
));

// Passport Google strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    passReqToCallback: true,
    callbackURL: "http://localhost:3000/users/auth/google/callback",
    scope: ['profile email']

},
    function (req, accessToken, refreshToken, profile, done) {
        if (!req.user) { // If user in not looged in
            // try to find the user based on their google id
            User.findOne({ 'google.id': profile.id }, function (err, user) {
                if (err)
                    return done(err);

                if (user) {
                    // if a user is found, log them in
                    let updatedEmail = user.email || profile.emails[0].value;
                    let updatedDisplayName = user.displayName || profile.displayName;
                    let updatedUsername = user.username || "googleuser-" + profile.id;
                    let updatedUser = {
                        'google.accessToken': accessToken,
                        email: updatedEmail,
                        displayName: updatedDisplayName,
                        username: updatedUsername
                    };

                    // Check if details are required to be updated
                    if ((typeof user.google != undefined) && (typeof user.google.accessToken != undefined) && (typeof user.email != undefined) && user.google.accessToken === accessToken && user.email === updatedEmail) {
                        return done(null, user);
                    } else {
                        let options = { runValidators: true, upsert: true };
                        user.update({ $set: updatedUser }, options, function (err, result) {
                            if (err) {
                                if (err.code === 11000) {
                                    let indexName = utils.indexName(err);
                                    let errMsg = utils.capitalize(indexName) + ' already linked to another account. Please login with that account or click forgot password.'
                                    req.flash('danger', errMsg);
                                    return done(null, false);
                                }
                                else {
                                    return done(err);
                                }
                            }
                            user.google.accessToken = accessToken;
                            user.email = updatedEmail;
                            user.displayName = updatedDisplayName;
                            user.username = updatedUsername;
                            return done(null, user);
                        });
                    }
                } else {
                    // if the user with given google id isn't in our database, create a new user
                    let newUser = new User(
                        {
                            'google.id': profile.id,
                            'google.accessToken': accessToken,
                            email: profile.emails[0].value,
                            displayName: profile.displayName,
                            username: "googleuser-" + profile.id
                        });

                    // save our new user to the database
                    newUser.save(function (err) {
                        if (err) {
                            if (err.code === 11000) {
                                let indexName = utils.indexName(err);
                                let errMsg = utils.capitalize(indexName) + ' already linked to another account. Please login with that account or click forgot password.'
                                req.flash('danger', errMsg);
                                return done(null, false);
                            }
                            else {
                                return done(err);
                            }
                        }


                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }
            });

        } else { //If user is logged in this is called using connect to google not login

            let user = req.user; // pull the user out of the session

            // update the current users facebook credentials
            user.google.id = profile.id;
            user.google.accessToken = accessToken;
            user.google.email = profile.emails[0].value;
            user.displayName = user.displayName || profile.displayName;
            // save the user
            user.save(function (err) {
                if (err)
                    return done(err);
                return done(null, user);
            });
        }
    }
));