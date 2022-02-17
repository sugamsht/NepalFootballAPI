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
    tournament_title: { type: String, required: true },
    team1: { type: String, required: true },
    team2: { type: String, required: true },
    team1Object: [{ type: mongoose.Schema.Types.ObjectId, ref: 'teams' }],
    team2Object: [{ type: mongoose.Schema.Types.ObjectId, ref: 'teams' }],
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
    tournament_title: { type: String, required: true },
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
    tournament_title: { type: String, required: true },
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

let scoreboardSchema = new mongoose.Schema({
    score1: { type: Number, required: true, default: 0 },
    score2: { type: Number, required: true, default: 0 },
    timer: { type: String },
    fixname: { type: String, required: true },
    fixObject: { type: mongoose.Schema.Types.ObjectId, ref: 'fixtures' },
    referee: { type: String }
});


//Models
let fixtures = mongoose.model('fixtures', fixtureSchema);
let players = mongoose.model('players', playerSchema);
let teams = mongoose.model('teams', teamSchema);
let results = mongoose.model('results', resultSchema);
let tournaments = mongoose.model('tournaments', tournamentSchema);
let scoreboards = mongoose.model('scoreboards', scoreboardSchema);


//Routes
router.get('/hello', function (req, res) {
    res.json({ hello: 'bro' });
});

//Get All data

//post and get scoreboard
 
router.post('/scoreboard', cors(corsOptions), function (req, res) {
    fixtures.findOne({ fixname: req.body.fixname }, function (err, data) {
        var fixId = data._id;
        let newScoreboard = new scoreboards({
            score1: req.body.score1,
            score2: req.body.score2,
            timer: req.body.timer,
            fixname: req.body.fixname,
            fixObject: fixId,
            referee: req.body.referee
        });
        console.log("yo ho haiii", data);
        newScoreboard.save(function (err, savedScoreboard) {
            if (err) {
                alert(err);
            } else {
                alert('Big Success' + savedScoreboard);
            }
        })
    })
});

router.get('/scoreboard', cors(corsOptions), function (req, res) {
    scoreboards.find({})
        .populate('fixObject')
        .populate({
            path : 'fixObject',
            populate : {
              path : 'team1Object'              
            }           
            })
        .populate({
            path : 'fixObject',
            populate : {
              path : 'team2Object'              
            }           
            })
        .exec((error, arrayOfResults) => {
            if (!error && arrayOfResults) {
                res.json(arrayOfResults)
            }
        })
});


//fixtures post and get
router.post('/fixtures', function (req, res) {
    teams.findOne({ name: req.body.team1 }, (error, savedTeam) => {
        var team1 = savedTeam._id;
        teams.findOne({ name: req.body.team2 }, (error, savedTeam) => {
            var fixname = req.body.team1 + ' vs ' + req.body.team2;
            var dat = new Date(req.body.date).toDateString();
            var team2 = savedTeam._id;
            let newFixture = new fixtures({
                tournament_title: req.body.tournament_title,
                team1: req.body.team1,
                team2: req.body.team2,
                stadium: req.body.stadium,
                date: dat,
                time: req.body.time,
                fixname: fixname,
                team1Object: team1,
                team2Object: team2
            });
            newFixture.save(function (err, savedFixture) {
                if (err) {
                    alert(err);
                } else {
                    alert('Big Success' + savedFixture)
                    res.redirect('/');
                }
            });
            tournaments.findOneAndUpdate({ title: req.body.tournament_title }, { $push: { fixtureList: newFixture._id } }, { new: true }, (error, savedTeam) => {
                if (!error && savedTeam) {
                    //alert('Big Success')
                }
                else {
                    console.log("Tournament ma post vayena", error);
                }
            })
        });
    });
})

router.get('/fixtures', cors(corsOptions), function (req, res) {
    fixtures.find({})
    // .populate('team1Object')
    // .populate('team2Object')
        .exec((error, arrayOfResults) => {
            if (!error && arrayOfResults) {
                res.json(arrayOfResults)
            }
        })
});

//put method for fixtures
router.post('/editFixtures/', function (req, res) {
    // console.log(req.body);
    var fixname = req.body.fixname;
    var dat = new Date(req.body.date).toDateString();
    var postponed = req.body.postponed;
    if (!fixname) {
        return res.json({ error: 'No fixture name' })
    }
    if (postponed) {
        fixtures.findOneAndUpdate({ fixname: fixname, date: dat }, { $set: { date: dat, time: req.body.time, stadium: req.body.stadium } }, { new: true }, (error, savedFixture) => {
            if (!error && savedFixture) {
                alert('Big Success' + savedFixture)
                //reset form
                res.redirect('/');
            }
            else {
                alert('Enter Correct date of Postponed Fixture');
                res.redirect('/');
            }
        });
    }
    else {
        fixtures.findOneAndUpdate({ fixname: fixname }, { $set: { date: dat, time: req.body.time, stadium: req.body.stadium } }, { new: true }, (error, savedFixture) => {
            if (!error && savedFixture) {
                alert('Big Success' + savedFixture)
                //reset form
                res.redirect('/');
            }
        });
    }

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
    tournaments.find({})
        .populate('resultList')
        .populate('teamList')
        .populate({
            path : 'fixtureList',
            populate : {
              path : 'team1Object'              
            }           
            })
        .populate({
            path : 'fixtureList',
            populate : {
              path : 'team2Object'              
            }           
            })
        .exec((error, arrayOfResults) => {
            if (!error && arrayOfResults) {
                res.json(arrayOfResults)
            }
        })
});

//teams halne
router.post('/teams', function (req, res) {
    let newTeam = new teams({
        tournament_title: req.body.tournament_title,
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
    tournaments.findOneAndUpdate({ title: req.body.tournament_title }, { $push: { teamList: newTeam._id } }, { new: true }, (error, savedTeam) => {
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

    //if score1 or score2 is less than 0
    if (score1 < 0 || score2 < 0) {
        console.log("Postponed vayo");
    }
    else {
        console.log("thick cha");
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
    }


    let newResult = new results({
        tournament_title: req.body.tournament_title,
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
    tournaments.findOneAndUpdate({ title: req.body.tournament_title }, { $push: { resultList: newResult._id } }, { new: true }, (error, savedTeam) => {
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
    // console.log(req.body);
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