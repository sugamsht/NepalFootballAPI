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

  let fixtureSchema = new mongoose.Schema({
    team1: { type: String, required: true },
    team2: { type: String, required: true },
    stadium: String,
    date: { type: Date, default: Date.now },
    time: String,
    fixname: String,
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
    played: { type: Number, default: 0 },
    win: { type: Number, default: 0 },
    lost: { type: Number, default: 0 },
    draw: { type: Number, default: 0 },
    gd: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    playerList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'players' }]
  });

  let resultSchema = new mongoose.Schema({
    fixtureResult: { type: String, required: true },
    score: [Number],
    fouls: [Number],
    offsides: [Number],
    corners: [Number],
    shots: [Number]
  });


  //Models
  let fixtures = mongoose.model('fixtures', fixtureSchema);
  let players = mongoose.model('players', playerSchema);
  let teams = mongoose.model('teams', teamSchema);
  let results = mongoose.model('results', resultSchema);



  app.get('/', home.index);

  //Routes
  app.get('/api/hello', function (req, res) {
    res.json({ hello: 'bro' });
  });

  //Get All data
  
  //fixtures post and get
  app.post('/api/fixtures', function (req, res) {
    var fixname = req.body.team1 + ' vs ' + req.body.team2;
    let newFixture = new fixtures({
      team1: req.body.team1,
      team2: req.body.team2,
      stadium: req.body.stadium,
      date: req.body.date,
      time: req.body.time,
      fixname: fixname
    });
    newFixture.save((error, savedStat) => {
      if (!error && savedStat) {
        alert('Big Success'+savedStat)
        //reset form
        res.redirect('/');
        //res.json(savedStat);
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
        alert('Big Success'+savedPlayer)
        //reset form
        res.redirect('/');
        //res.json(savedPlayer);
      }
    });
    teams.findOneAndUpdate({ name: req.body.team_name }, { $push: { playerList: newPlayer._id } }, { new: true }, (error, savedTeam) => {
      if (!error && savedTeam) {
        //alert('Big Success')
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
        alert('Big Success'+savedTeam)
        //reset form
        res.redirect('/');
        //res.json(savedTeam);
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
    ).sort([['points', -1]])
  });

  //results halne
  app.post('/api/results', function (req, res) {
    var fixtureResult = req.body.fixtureResult;
    //split fixtureResult
    var result = fixtureResult.split(' vs ');
    var team1 = result[0];
    var team2 = result[1];
    var score1 = req.body.score[0];
    var score2 = req.body.score[1];
    teams.findOneAndUpdate({ name: team1 }, { $inc: { played: 1 } }, { new: true }, (error, savedStat) => { })
    teams.findOneAndUpdate({ name: team2 }, { $inc: { played: 1 } }, { new: true }, (error, savedStat) => { })
    if (score1 > score2) {
      //increase win in stats
      teams.findOneAndUpdate({ name: team1 }, { $inc: { win: 1, points: 3 } }, { new: true }, (error, savedStat) => {
        if (!error && savedStat) {
          console.log(team1 +' win')
        }
      })
      teams.findOneAndUpdate({ name: team2 }, { $inc: { lost: 1 } }, { new: true }, (error, savedStat) => {
        if (!error && savedStat) {
          console.log(team2 +' lost')
        }
      })
    } else if (score1 < score2) {
      teams.findOneAndUpdate({ name: team1 }, { $inc: { lost: 1 } }, { new: true }, (error, savedStat) => {
        if (!error && savedStat) {
          console.log(team1+' lost')
        }
      })
      teams.findOneAndUpdate({ name: team2 }, { $inc: { win: 1, points: 3 } }, { new: true }, (error, savedStat) => {
        if (!error && savedStat) {
          console.log(team2+' win')
        }
      })
    } else {
      teams.findOneAndUpdate({ name: team1 }, { $inc: { draw: 1, points: 1 } }, { new: true }, (error, savedStat) => {
        if (!error && savedStat) {
          console.log(team1+' draw')
        }
      })
      teams.findOneAndUpdate({ name: team2 }, { $inc: { draw: 1, points: 1 } }, { new: true }, (error, savedStat) => {
        if (!error && savedStat) {
          console.log(team2+' draw')
        }
      })
    }
    let newResult = new results({
      fixtureResult: fixtureResult,
      score: req.body.score,
      fouls: req.body.foul,
      offsides: req.body.offside,
      corners: req.body.corner,
      shots: req.body.shots
    });
    newResult.save((error, savedResult) => {
      if (!error && savedResult) {
        alert('Big Success'+savedResult)
        //reset form
        res.redirect('/');
        //res.json(savedResult);
      }
    });
  })


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
