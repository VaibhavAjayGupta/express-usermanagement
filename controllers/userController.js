const User = require('../models/user');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const bcrypt = require('bcrypt');


// Display user registration form
exports.user_registration_get = (req, res, next) =>{
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
    body('password', 'Password must be 8 characters long').isLength({min:8}).trim(),
    body('confirmPassword', 'Passwords doesn\'t match').trim().custom((value, { req }) => value === req.body.password),

    // Sanitize fields
    sanitizeBody('*').trim().escape(),

    // Process request after validation and sanitization
    (req, res, next) => {

        // Extract the validation errors from a request 
        const errors = validationResult(req);
        

        // Hash the password
        bcrypt.hash(req.body.password, 3).then(function(hash) {
        
        // Create a User object with hashed password.
        var user = new User(
            { username: req.body.username,
              email: req.body.email,
              password: hash
             });
        
        
  
          if (!errors.isEmpty()) {
              // There are errors. Render form again with sanitized values/errors messages.
              res.render('register', { title: 'Registration', user: user, errors: errors.array()});
              return;
          }
          else {
                //  Data from form is valid.
                  user.save()
                  .then(()=> {
                      res.redirect('/users/login');
                    })
                  .catch(error => {
                    // Return error for duplicate values
                    if(error.code === 11000){
                        let regex = /index\:\ (?:.*\.)?\$?(?:([_a-z0-9]*)(?:_\d*)|([_a-z0-9]*))\s*dup key/i,      
                        match =  error.message.match(regex),  
                        indexName = match[1] || match[2];  
                        var errorMsg = { msg : indexName + ' already exist. Please use different ' + indexName };
                        res.render('register', { title: 'Registration', user: user, errors: new Array(errorMsg)});
                      }
                      else 
                        return next(error);
                  });
          }
        });
    }
];

// Display user login form
exports.user_login_get = (req, res, next) =>{
    res.render('login', { title: 'Login' });
};

// Handle user login form
exports.user_login_post = (req, res, next) =>{
    res.render('login', { title: 'Login' });
};

// Display user information
exports.user_detail = (req, res, next) =>{
    res.render('register', { title: 'User Detail' });
};