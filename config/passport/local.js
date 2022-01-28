/* eslint-disable prettier/prettier */
/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;
const User = mongoose.model('User');

/**
 * Expose
 */

module.exports = new LocalStrategy(
  function (username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      console.log('User ' + username + ' attempted to log in.');
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (password !== user.password) { return done(null, false); }
      return done(null, user);
    });
  }
);
