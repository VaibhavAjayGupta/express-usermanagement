var mongoose = require('mongoose');
const bcrypt = require('bcrypt');


var Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    username: { type: String, max: 100, unique: true, required: true },
    email: { type: String, max: 100, unique: true, required: true },
    password: { type: String, select: false }, // "select:false" for hiding the password in all user find requests
    displayName: { type: String, max: 100 },
    facebook: {
      id: String,
      accessToken: String,
      email: String
    },
    twitter: {
      id: String,
      token: String,
      email: String
    },
    google: {
      id: String,
      token: String,
      email: String
    }
  }
);

// Virtual for this user profile URL
UserSchema
  .virtual('url')
  .get(function () {
    return '/users/' + this._id;
  });

UserSchema.methods.hashPassword = function (enteredPassword, cb) {
  bcrypt.hash(enteredPassword, 3).then((hash) => {
    this.password = hash;
    return cb(null);
  }).catch(error => {
    return cb(error);
  });
};

UserSchema.methods.checkPassword = function (enteredPassword, cb) {
  bcrypt.compare(enteredPassword, this.password).then((res) => {
    return cb(null, res); // res==true for success
  }).catch(error => {
    return cb(error);
  });
};



//Export model
module.exports = mongoose.model('User', UserSchema);