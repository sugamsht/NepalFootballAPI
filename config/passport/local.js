import { Strategy as LocalStrategy } from 'passport-local';
import User from '../../app/models/user.js';
import { compare } from 'bcrypt'; // Use async bcrypt.compare

export default new LocalStrategy(
  async function (username, password, done) { // Make the strategy callback async
    try {
      const user = await User.findOne({ username }); // Use await
      console.log('User ' + username + ' attempted to log in.');

      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      const passwordMatch = await compare(password, user.password); // Await the comparison

      if (!passwordMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user);
    } catch (err) {
      return done(err); // Handle errors
    }
  }
);