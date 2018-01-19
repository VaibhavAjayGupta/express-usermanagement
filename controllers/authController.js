// Authenticate request i.e is user loggedin
exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('danger', 'To access please login first.');
    return res.redirect('/users/login');
  };

// Check if user is not logged in
exports.notLoggedIn = (req, res, next) => {
  console.log(req.user);
    if (!req.isAuthenticated()) {
      return next();
    }
    return res.redirect('/users/');
  };