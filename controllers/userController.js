const User = require('../models/user');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Passport modules 
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


// Display user registration form
exports.user_registration_get = (req, res, next) => {
    return res.render('register', { title: 'Registration' });
};

// Handle user registration form
exports.user_registration_post = [

    // Validate fields
    body('username').isLength({ min: 1 }).trim().withMessage('Username must be specified.')
        .isAlphanumeric().withMessage('Username has non-alphanumeric characters.'),
    body('email').isLength({ min: 1 }).trim().withMessage('Email must be specified.')
        .isEmail().withMessage('Must be an email.'),
    body('password', 'Password must be 8 characters long').isLength({ min: 8 }).trim(),
    body('confirmPassword', 'Passwords doesn\'t match').trim().custom((value, { req }) => value === req.body.password),

    // Sanitize fields
    sanitizeBody('*').trim().escape(),

    // Process request after validation and sanitization
    (req, res, next) => {

        // Extract the validation errors from a request 
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            delete req.body.password;
            delete req.body.confirmPassword;
            return res.render('register', { title: 'Registration', user: req.body, errors: errors.array() });
        }
        else {
            //  Data from form is valid.

            // Create a User object 
            var user = new User({
                    username: req.body.username,
                    email: req.body.email
                });

            // Hash and save the password
            user.hashPassword(req.body.password, (err) => {
                if (err)
                    return next(err);

                // save user to database
                user.save()
                    .then(() => {
                        req.flash('success', 'Registration completed successfully. You can login now.');
                        let redirectUrl = '/users/login/' + user.username;
                        return res.redirect(redirectUrl);
                    })
                    .catch(error => {
                        // Return error for duplicate values
                        if (error.code === 11000) {
                            let regex = /index\:\ (?:.*\.)?\$?(?:([_a-z0-9]*)(?:_\d*)|([_a-z0-9]*))\s*dup key/i,
                                match = error.message.match(regex),
                                indexName = match[1] || match[2];
                            var errorMsg = { msg: indexName + ' already exist. Please use different ' + indexName };
                            return res.render('register', { title: 'Registration', user: user, errors: new Array(errorMsg) });
                        }
                        else
                            return next(error);
                    });
            });
        }
    }
];

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
                    req.flash('danger', 'Incorrect  password');
                    return done(null, false);
                }
                return done(null, user);
            });
        });
    }
));

// Display user login form
exports.user_login_get = (req, res, next) => {
    return res.render('login', { title: 'Login' });
};

// Display user login form with username
exports.user_login_get_username = (req, res, next) => {
    let user = { 'username': req.params.username };
    return res.render('login', { title: 'Login', user: user });
};

// Handle user login form
exports.user_login_post = [
    passport.authenticate('local', {
        successRedirect: '/users/profile',
        failureRedirect: '/users/login',
        failureFlash: true
    })
];

// Display user information
exports.user_detail = (req, res, next) => {
    return res.render('register', { title: 'User Detail' });
};
