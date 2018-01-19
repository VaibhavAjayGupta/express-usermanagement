var express = require('express');
var router = express.Router();

// Require the controllers
const user_controller = require('../controllers/userController');


//// User Routes ////

// Register user get route 
router.get('/register', user_controller.user_registration_get);

// Register user post route 
router.post('/register', user_controller.user_registration_post);

// Login get route
router.get('/login', user_controller.user_login_get);

// Login get route with username
router.get('/login/:username', user_controller.user_login_get_username);

// Login post route
router.post(['/login','/login/:username'], user_controller.user_login_post);

// Login with fb get route
router.get('/auth/facebook', user_controller.user_fblogin_get);

// Login with fb callback get route
router.get('/auth/facebook/callback',user_controller.user_fblogin_callback_get);

// Login with google get route
router.get('/auth/google', user_controller.user_googlelogin_get);

// Login with google callback get route
router.get('/auth/google/callback',user_controller.user_googlelogin_callback_get);

// User profile get route
router.get('/', user_controller.user_get);

// User logout get route
router.get('/logout', user_controller.user_logout_get);

///////////////////////////////////////////////////////////////////////////////

module.exports = router;
