var express = require('express');
var router = express.Router();

// Require the controllers
const user_controller = require('../controllers/userController');


//// User Routes ////

//  Register user get route 
router.get('/register', user_controller.user_registration_get);

//  Register user post route 
router.post('/register', user_controller.user_registration_post);

// Login get route
router.get('/login', user_controller.user_login_get);

// Login get route with username
router.get('/login/:username', user_controller.user_login_get_username);

// Login post route
router.post(['/login','/login/:username'], user_controller.user_login_post);

//  GET users listing. 
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// GET request for one user. 
router.get('/:id', user_controller.user_detail);

///////////////////////////////////////////////////////////////////////////////

module.exports = router;
