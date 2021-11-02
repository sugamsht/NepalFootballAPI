/* eslint-disable prettier/prettier */
'use strict';


/**
 * Module dependencies.
 */

const home = require('../app/controllers/home');
const mongoose = require('mongoose');
var cors = require('cors');

var corsOptions = {
  origin: 'http://localhost:5000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

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

  let fixtureSchema = new mongoose.Schema({
    team1: { type: String, required: true },
    team2: { type: String, required: true },
    stadium: String,
    date: { type: Date, default: Date.now },
    time: String
  });

  let Stats = mongoose.model('Stats', statSchema);
  let fixtures = mongoose.model('fixtures', fixtureSchema);

  app.get('/', home.index);

  //Routes
  app.get('/api/hello', function (req, res) {
    res.json({ hello: 'bro' });
  });

  //Get All data
  app.get('/api/test', cors(corsOptions), function (req, res) {
    Stats.find({},
      (error, arrayOfResults) => {
        if (!error && arrayOfResults) {
          return res.json(arrayOfResults)
        }
      }
    ).sort('team_position')
  });

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

  //fixtures post and get
  app.post('/api/fixtures', function (req, res) {
    let newFixture = new fixtures({
      team1: req.body.team1,
      team2: req.body.team2,
      stadium: req.body.stadium,
      date: req.body.date,
      time: req.body.time,
    });
    newFixture.save((error, savedStat) => {
      if (!error && savedStat) {
        res.json(savedStat);
      }
    });
  })

  app.get('/api/fixtures', cors(corsOptions), function (req, res) {
    fixtures.find({},
      (error, arrayOfResults) => {
        if (!error && arrayOfResults) {
          return res.json(arrayOfResults)
        }
      }
    )
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
