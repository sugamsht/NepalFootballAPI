const express = require('express');
const router = express.Router();
const alert = require('alert');
const mongoose = require('mongoose');
var cors = require('cors');

var corsOptions = {
    origin: 'http://localhost:5000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

//Schemas
let fixtureSchema = new mongoose.Schema({
    tournament_title1: { type: String, required: true },
    team1: { type: String, required: true },
    team2: { type: String, required: true },
    stadium: String,
    date: { type: String },
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
    tournament_title2: { type: String, required: true },
    name: { type: String, required: true },
    location: { type: String },
    logo: String,
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
    tournament_title3: { type: String, required: true },
    fixtureResult: { type: String, required: true },
    score: [Number],
    fouls: [Number],
    offsides: [Number],
    corners: [Number],
    shots: [Number]
});

let tournamentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    stadium: [{ type: String }],
    teamList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'teams' }],
    fixtureList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'fixtures' }],
    resultList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'results' }]
});


//Models
let fixtures = mongoose.model('fixtures', fixtureSchema);
let players = mongoose.model('players', playerSchema);
let teams = mongoose.model('teams', teamSchema);
let results = mongoose.model('results', resultSchema);
let tournaments = mongoose.model('tournaments', tournamentSchema);


//Routes
router.get('/hello', function (req, res) {
    res.json({ hello: 'bro' });
});

//Get All data

//fixtures post and get
router.post('/fixtures', function (req, res) {
    var fixname = req.body.team1 + ' vs ' + req.body.team2;
    var dat = new Date(req.body.date).toDateString();
    let newFixture = new fixtures({
        tournament_title1: req.body.tournament_title1,
        team1: req.body.team1,
        team2: req.body.team2,
        stadium: req.body.stadium,
        date: dat,
        time: req.body.time,
        fixname: fixname
    });
    newFixture.save((error, savedStat) => {
        if (!error && savedStat) {
            alert('Big Success' + savedStat)
            //reset form
            res.redirect('/');
            //res.json(savedStat);
        }
    });
    tournaments.findOneAndUpdate({ title: req.body.tournament_title1 }, { $push: { fixtureList: newFixture._id } }, { new: true }, (error, savedTeam) => {
        if (!error && savedTeam) {
            //alert('Big Success')
        }
    })
})

router.get('/fixtures', cors(corsOptions), function (req, res) {
    fixtures.find({},
        (error, arrayOfResults) => {
            if (!error && arrayOfResults) {
                return res.json(arrayOfResults)
            }
        }
    )
});

//put method for fixtures
router.post('/editFixtures/', function (req, res) {
    console.log(req.body);
    var fixname = req.body.fixname;
    var dat = new Date(req.body.date).toDateString();
    if (!fixname) {
        return res.json({ error: 'No fixture name' })
    }
    fixtures.findOneAndUpdate({ fixname: fixname }, { $set: { date: dat, time: req.body.time, stadium: req.body.stadium } }, { new: true }, (error, savedFixture) => {
        if (!error && savedFixture) {
            alert('Big Success' + savedFixture)
            //reset form
            res.redirect('/');
        }
    });
})

//players halne
router.post('/players', function (req, res) {
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
            alert('Big Success' + savedPlayer)
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
router.get('/players', cors(corsOptions), function (req, res) {
    players.find({},
        (error, arrayOfResults) => {
            if (!error && arrayOfResults) {
                return res.json(arrayOfResults)
            }
        }
    )
});


//Tournament post and get
router.post('/tournaments', function (req, res) {
    let newTournament = new tournaments({
        title: req.body.title,
        stadium: req.body.stadium,
        teams: req.body.teams,
        fixtureList: req.body.fixtures,
        results: req.body.results
    });
    newTournament.save((error, savedtournament) => {
        if (!error && savedtournament) {
            alert('Big Success' + savedtournament)
            //reset form
            res.redirect('/');
        }
    });
});

router.get('/tournaments', cors(corsOptions), function (req, res) {
    tournaments.find({},
        (error, arrayOfResults) => {
            tournaments.populate(arrayOfResults, { path: 'resultList' },  (error, populatedResults) => {
                if (!error && populatedResults) {
                    res.json(populatedResults)
                }
            })
            // .populate(arrayOfResults, { path: 'fixtureList' },  (error, populatedResults) => {
            //     if (!error && populatedResults) {
            //         return res.json(populatedResults)
            //     }
            // })
        }
    )
    // tournaments.find({})
    //     .populate('resultList')
    //     // .populate('fixtureList')
        
});

//teams halne
router.post('/teams', function (req, res) {
    let newTeam = new teams({
        tournament_title2: req.body.tournament_title2,
        name: req.body.name,
        location: req.body.location,
        logo: req.body.logo,
        manager: req.body.manager,
        playerList: req.body.players
    });
    newTeam.save((error, savedTeam) => {
        if (!error && savedTeam) {
            alert('Big Success' + savedTeam)
            //reset form
            res.redirect('/');
            //res.json(savedTeam);
        }
    });
    tournaments.findOneAndUpdate({ title: req.body.tournament_title2 }, { $push: { teamList: newTeam._id } }, { new: true }, (error, savedTeam) => {
        if (!error && savedTeam) {
            //alert('Big Success')
        }
    })
})

//teams get
router.get('/teams', cors(corsOptions), function (req, res) {
    teams.find({},
        (error, arrayOfResults) => {
            teams.populate(arrayOfResults, { path: 'playerList' }, (err, populated) => {
                if (!error && populated) {
                    return res.json(populated)
                }
            })
        }
    ).sort([['points', -1], ['gd', -1]])
});

//results halne
router.post('/results', function (req, res) {
    
    var fixtureResult = req.body.fixtureResult;
    //split fixtureResult
    var result = fixtureResult.split(' vs ');
    var team1 = result[0];
    var team2 = result[1];
    var score1 = req.body.score[0];
    var score2 = req.body.score[1];
    //goal difference
    var gd1 = score1 - score2;
    var gd2 = score2 - score1;
    teams.findOneAndUpdate({ name: team1 }, { $inc: { gd: gd1 } }, { new: true }, (error, savedTeam1) => { })
    teams.findOneAndUpdate({ name: team2 }, { $inc: { gd: gd2 } }, { new: true }, (error, savedTeam1) => { })
    teams.findOneAndUpdate({ name: team1 }, { $inc: { played: 1 } }, { new: true }, (error, savedStat) => { })
    teams.findOneAndUpdate({ name: team2 }, { $inc: { played: 1 } }, { new: true }, (error, savedStat) => { })
    if (score1 > score2) {
        //increase win in stats
        teams.findOneAndUpdate({ name: team1 }, { $inc: { win: 1, points: 3 } }, { new: true }, (error, savedStat) => {
            if (!error && savedStat) {
            }
        })
        teams.findOneAndUpdate({ name: team2 }, { $inc: { lost: 1 } }, { new: true }, (error, savedStat) => {
            if (!error && savedStat) {
            }
        })
    } else if (score1 < score2) {
        teams.findOneAndUpdate({ name: team1 }, { $inc: { lost: 1 } }, { new: true }, (error, savedStat) => {
            if (!error && savedStat) {
            }
        })
        teams.findOneAndUpdate({ name: team2 }, { $inc: { win: 1, points: 3 } }, { new: true }, (error, savedStat) => {
            if (!error && savedStat) {
            }
        })
    } else {
        teams.findOneAndUpdate({ name: team1 }, { $inc: { draw: 1, points: 1 } }, { new: true }, (error, savedStat) => {
            if (!error && savedStat) {
            }
        })
        teams.findOneAndUpdate({ name: team2 }, { $inc: { draw: 1, points: 1 } }, { new: true }, (error, savedStat) => {
            if (!error && savedStat) {
            }
        })
    }
    let newResult = new results({
        tournament_title3: req.body.tournament_title3,
        fixtureResult: fixtureResult,
        score: req.body.score,
        fouls: req.body.fouls,
        offsides: req.body.offsides,
        corners: req.body.corners,
        shots: req.body.shots
    });
    newResult.save((error, savedResult) => {
        if (!error && savedResult) {
            alert('Big Success' + savedResult)
            //reset form
            res.redirect('/');
            //res.json(savedResult);
        }
    });
    tournaments.findOneAndUpdate({ title: req.body.tournament_title3 }, { $push: { resultList: newResult._id } }, { new: true }, (error, savedTeam) => {
        if (!error && savedTeam) {
            //alert('Big Success')
        }
    })
})

//results get
router.get('/results', cors(corsOptions), function (req, res) {
    results.find({},
        (error, arrayOfResults) => {
            if (!error && arrayOfResults) {
                return res.json(arrayOfResults)
            }
        }
    )
});

//edit result
router.post('/editResults/', function (req, res) {
    console.log(req.body);
    var fixtureResult = req.body.fixtureResult;
    if (!fixtureResult) {
        return res.json({ error: 'Bhayena hai bhayena' })
    }
    results.findOneAndUpdate({ fixtureResult: fixtureResult },
        {
            $set: {
                //score: req.body.score,
                fouls: req.body.fouls,
                offsides: req.body.offsides,
                corners: req.body.corners,
                shots: req.body.shots
            }
        }, { new: true }, (error, savedResults) => {
            if (!error && savedResults) {
                alert('Big Success' + savedResults)
                //reset form
                res.redirect('/');
            }
        });
})


module.exports = router;