var mongoose = require('mongoose');
const bcrypt = require('bcrypt');


var Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    username: { type: String, required: true, max: 100, unique: true },
    email: { type: String, required: true, max: 100, unique: true },
    password: { type: String, required: true }
  }
);

// Virtual for this user profile URL
UserSchema
  .virtual('url')
  .get(function () {
    return '/users/' + this._id
  });

UserSchema.methods.hashPassword = function (enteredPassword, cb) {
  bcrypt.hash(enteredPassword, 3).then((hash) =>{
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