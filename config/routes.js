'use strict';

/**
 * Module dependencies.
 */

const home = require('../app/controllers/home');
const mongoose = require('mongoose');

/**
 * Expose
 */

module.exports = function (app) {

  let statSchema = new mongoose.Schema({
    team_name: { type: String, required: true },
    team_position: Number,
    win: Number,
    lost: Number,
    draw: Number
  });

  let Stats = mongoose.model('Stats', statSchema);

  app.get('/', home.index);

  //Routes
  app.get('/api/hello', function (req, res) {
    res.json({ hello: 'bro' });
  });

  // app.get('/api/lata', function (req, res) {
  //   res.json({ team1: 'team2', 1: 2 });
  // });

  app.post('/api/test', function (req, res) {
    let newStat = new Stats({
      team_name: req.body.team_name,
      team_position: req.body.team_position,
      win: req.body.win || 0,
      lost: req.body.lost || 0,
      draw: req.body.draw || 0
    });
    newStat.save((error, savedStat) => {
      if (!error && savedStat) {
        res.json(savedStat);
      }
    });
  });

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
