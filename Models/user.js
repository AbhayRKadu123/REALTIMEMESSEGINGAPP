require('dotenv').config();

const mongoose = require('mongoose');
const { type } = require('os');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
mongoose.connect(process.env.mongourl)
  .then(() => console.log('Connected!'));
const User = new Schema({
email:{type:String},
createdAt: { type: Date, default: Date.now }
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);


