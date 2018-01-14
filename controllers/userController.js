const User = require('../models/user');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const passport = require('passport');
const passportAuth = require('../config/passport.js');

// Display user registration form
exports.user_registration_get = [
    passportAuth.notLoggedIn,
    (req, res, next) => {
        return res.render('register', { title: 'Registration' });
    }
];

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

// Display user login form
exports.user_login_get = [
    passportAuth.notLoggedIn,
    (req, res, next) => {
        return res.render('login', { title: 'Login' });
    }
];

// Display user login form with username
exports.user_login_get_username = [
    passportAuth.notLoggedIn,
    (req, res, next) => {
        let user = { 'username': req.params.username };
        return res.render('login', { title: 'Login', user: user });
    }
];

// Handle user login form
exports.user_login_post = [
    passport.authenticate('local', {
        successRedirect: '/users/',
        failureRedirect: '/users/login',
        failureFlash: true
    })
];

// Display user information
exports.user_get = [
    passportAuth.isAuthenticated,
    (req, res, next) => {
        return res.render('user', { title: 'User Detail', user: req.user });
    }
];


