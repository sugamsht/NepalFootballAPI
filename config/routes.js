/* eslint-disable prettier/prettier */
'use strict';

/**
 * Module dependencies.
 */

const home = require('../app/controllers/home');
const mongoose = require('mongoose');

const passport = require('passport');
const User = mongoose.model('User');

const bcrypt = require('bcrypt');
/**
 * Expose
 */

module.exports = function (app) {

  app.route('/').get(ensureAuthenticated, (req, res) => {
    res.render('home/index', { username: req.user.username });
  });

  app.route('/live').get(ensureAuthenticated, (req, res) => {
    res.render('home/live', { username: req.user.username });
  });

  app.get('/js/menu.js', (req, res) => {
    res.render('js/menu', { apiUrl: process.env.Backend_URL });
  });

  // app.get('/', home.index)

  app.get('/login', home.login);

  app.get('/live', home.live)

  // Replace with:
  const apiRouter = require('./api');
  app.use('/api', (req, res, next) => {
    // Set CORS headers specifically for API routes
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5000');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  }, apiRouter);


  //register
  // app.route('/login').post(
  //   (req, res, next) => {
  //     // const password = req.body.password;
  //     const password = bcrypt.hashSync(req.body.password, 12);
  //     User.findOne({ username: req.body.username }, function (err, user) {
  //       if (err) {
  //         next(err);
  //       } else if (user) {
  //         console.log(user, "Already exists");
  //         res.redirect('/');
  //       } else {
  //         User.create({ username: req.body.username, password: password }, (err, doc) => {
  //           if (err) {
  //             // res.redirect('/');
  //             console.log(err);
  //           } else {
  //             console.log("Done")
  //           }
  //         });
  //       }
  //     });
  //   },
  //   passport.authenticate('local', { failureRedirect: '/' }),
  //   (req, res, next) => {
  //     res.redirect('/login');
  //   }
  // );

  app.route('/login').post(passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/');
  });

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  }

  // app.post('/logout', function (req, res) {
  //   req.logout();
  //   res.redirect('/login');
  // });

  app.post('/logout', function (req, res, next) {
    req.logout(function (err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

  app.get('/settings', ensureAuthenticated, home.settings);

  /**
 * Error handling
 */

  app.use(function (err, req, res, next) {
    // treat as 404
    if (
      err.message &&
      (~err.message.indexOf('not found') ||
        ~err.message.indexOf('Cast to ObjectId failed'))
    ) {
      return next();
    }
    console.error(err.stack);
    // error page
    res.status(500).render('500', { error: err.stack });
  });

  // assume 404 since no middleware responded
  app.use(function (req, res) {
    res.status(404).render('404', {
      url: req.originalUrl,
      error: 'Not found'
    });
  });
};
