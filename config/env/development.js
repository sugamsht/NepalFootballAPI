// config.js (ES Module format)

export const db = process.env.MONGODB_URL || 'mongodb://localhost/my_app_development';

// Or, if you want to export multiple things:

// export const db = process.env.MONGODB_URL || 'mongodb://localhost/my_app_development';
// export const someOtherConfig = 'some value';

// Or, for a default export (only one default export per module):

// export default {
//   db: process.env.MONGODB_URL || 'mongodb://localhost/my_app_development'
// };