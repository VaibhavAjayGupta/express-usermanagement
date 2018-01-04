const User = require('../models/user');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const bcrypt = require('bcrypt');
const passport = require('passport');


// Display user registration form
exports.user_registration_get = (req, res, next) => {
    res.render('register', { title: 'Registration' });
    return;
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
            res.render('register', { title: 'Registration', user: req.body, errors: errors.array() });
            return;
        }
        else {
            //  Data from form is valid.

            // Hash the password
            bcrypt.hash(req.body.password, 3).then(function (hash) {

                // Create a User object with hashed password.
                var user = new User(
                    {
                        username: req.body.username,
                        email: req.body.email,
                        password: hash
                    });
                // save user  
                user.save()
                    .then(() => {
                        req.flash('success','Registration completed successfully. You can login now.');
                        let redirectUrl = '/users/login/' + user.username;
                        res.redirect(redirectUrl);
                    })
                    .catch(error => {
                        // Return error for duplicate values
                        if (error.code === 11000) {
                            let regex = /index\:\ (?:.*\.)?\$?(?:([_a-z0-9]*)(?:_\d*)|([_a-z0-9]*))\s*dup key/i,
                                match = error.message.match(regex),
                                indexName = match[1] || match[2];
                            var errorMsg = { msg: indexName + ' already exist. Please use different ' + indexName };
                            res.render('register', { title: 'Registration', user: user, errors: new Array(errorMsg) });
                            return;
                        }
                        else
                            return next(error);
                    });

            });
        }
    }
];

// Passort serialize and Deserialize
passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

// Display user login form
exports.user_login_get = (req, res, next) => {
    res.render('login', { title: 'Login' });
};

// Display user login form with username
exports.user_login_get_username = (req, res, next) => {
    let user = {'username':req.params.username};
    res.render('login', { title: 'Login', user:user });
};

// Handle user login form
exports.user_login_post = (req, res, next) => {
    res.render('login', { title: 'Login' });
};

// Display user information
exports.user_detail = (req, res, next) => {
    res.render('register', { title: 'User Detail' });
};
