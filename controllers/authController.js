// Authenticated request i.e user is loggedin
exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('danger', 'To access please login first.');
    return res.redirect('/users/login');
  };

// Check if user is logged in or not
exports.notLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next();
    }
    return res.redirect('/users/');
  };