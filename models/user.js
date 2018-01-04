var mongoose = require('mongoose');
const bcrypt = require('bcrypt');


var Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    username: { type: String, required: true, max: 100, unique: true },
    email: { type: String, required: true, max: 100, unique: true },
    password: { type: String, required: true },
  }
);

// Virtual for this user profile URL
UserSchema
  .virtual('url')
  .get(function () {
    return '/users/' + this._id
  });

UserSchema.methods.generatePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password).then((res) => {
    return cb(null, res); // res==true for success
  }).catch(error => {
    return cb(error);
  });
};

UserSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password).then((res) => {
    return cb(null, res); // res==true for success
  }).catch(error => {
    return cb(error);
  });
};



//Export model
module.exports = mongoose.model('User', UserSchema);