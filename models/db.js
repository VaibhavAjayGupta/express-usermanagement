const mongoose = require('mongoose');

//process.env.MONGODB_URI = mongodb://<dbuser>:<dbpassword>@<dbhost>/<dbname>

mongoose.connect(process.env.MONGODB_URI , {
  useMongoClient: true
});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = mongoose.connection;