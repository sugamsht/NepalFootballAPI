/* eslint-disable prettier/prettier */
'use strict';

/**
 * Module dependencies.
 */

const home = require('../app/controllers/home');
const mongoose = require('mongoose');
var cors = require('cors');
const alert = require('alert');

var corsOptions = {
  origin: 'http://localhost:5000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

/**
 * Expose
 */

module.exports = function (app) {

  //Schemas
  let statSchema = new mongoose.Schema({
    team_name: { type: String, required: true },
    played: Number,
    win: Number,
    lost: Number,
    draw: Number,
    gd: Number,
    points: Number
  });

  let fixtureSchema = new mongoose.Schema({
    team1: { type: String, required: true },
    team2: { type: String, required: true },
    stadium: String,
    date: { type: Date, default: Date.now },
    time: String
  });

  let playerSchema = new mongoose.Schema({
    team_name: { type: String, required: true },
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    dob: { type: Date, default: Date.now },
    position: { type: String, required: true },
    jersey_no: { type: Number }
  });

  let teamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String },
    manager: { type: String },
    playerList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'players' }]
  });

  let resultSchema = new mongoose.Schema({
    team_name: { type: String, required: true },
    played: Number,
    win: Number,
    lost: Number,
    draw: Number,
    gd: Number,
    points: Number
  });


  //Models
  let Stats = mongoose.model('Stats', statSchema);
  let fixtures = mongoose.model('fixtures', fixtureSchema);
  let players = mongoose.model('players', playerSchema);
  let teams = mongoose.model('teams', teamSchema);



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
    ).sort([['points', -1]])
  });

  app.post('/api/test', function (req, res) {
    var win = parseInt(req.body.win);
    var draw = parseInt(req.body.draw);
    var points = (win * 3) + draw;
    var lost = parseInt(req.body.lost);
    var played = win + draw + lost;
    let newStat = new Stats({
      team_name: req.body.team_name,
      played: played,
      win: win || 0,
      lost: lost || 0,
      draw: draw || 0,
      gd: req.body.gd || 0,
      points: points || 0
    });
    newStat.save((error, savedStat) => {
      if (!error && savedStat) {
        alert('Sucess')
        //reset form
        res.redirect('/');
        // res.json(savedStat);
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

  //players halne
  app.post('/api/players', function (req, res) {
    let newPlayer = new players({
      team_name: req.body.team_name,
      fname: req.body.fname,
      lname: req.body.lname,
      dob: req.body.dob,
      position: req.body.position,
      jersey_no: req.body.jersey_no
    });
    newPlayer.save((error, savedPlayer) => {
      if (!error && savedPlayer) {
        res.json(savedPlayer);
      }
    });
    teams.findOneAndUpdate({ name: req.body.team_name }, { $push: { playerList: newPlayer._id } }, { new: true }, (error, savedTeam) => {
      if (!error && savedTeam) {
        alert('Big Sucess')
      }
    })
  })

  //players get
  app.get('/api/players', cors(corsOptions), function (req, res) {
    players.find({},
      (error, arrayOfResults) => {
        if (!error && arrayOfResults) {
          return res.json(arrayOfResults)
        }
      }
    )
  });


  //teams halne
  app.post('/api/teams', function (req, res) {
    let newTeam = new teams({
      name: req.body.name,
      location: req.body.location,
      manager: req.body.manager,
      playerList: req.body.players
    });
    newTeam.save((error, savedTeam) => {
      if (!error && savedTeam) {
        res.json(savedTeam);
      }
    });
  })

  //teams get
  app.get('/api/teams', cors(corsOptions), function (req, res) {
    teams.find({},
      (error, arrayOfResults) => {
        teams.populate(arrayOfResults, { path: 'playerList' }, (err, populated) => {
          if (!error && populated) {
            return res.json(populated)
          }
        })
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
