/**
 * Expose
 */

export const db = process.env.MONGODB_URL || 'mongodb://localhost/my_app_test';
export const facebook = {
  clientID: 'APP_ID',
  clientSecret: 'SECRET',
  callbackURL: 'http://localhost:3000/auth/facebook/callback',
  scope: ['email', 'user_about_me', 'user_friends']
};
export const google = {
  clientID: 'APP_ID',
  clientSecret: 'SECRET',
  callbackURL: 'http://localhost:3000/auth/google/callback',
  scope: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.google.com/m8/feeds'
  ]
};
