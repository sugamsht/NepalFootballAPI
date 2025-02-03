const express = require('express');
const router = express.Router();
const alert = require('alert');
const mongoose = require('mongoose');
var cors = require('cors');

const corsOptions = {
    origin: [
        'http://localhost:5000',
        process.env.FRONTEND_URL,
        process.env.Backend_URL
    ],
    credentials: true, // Allow credentials
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    optionsSuccessStatus: 200
};

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
    fixname: [String],
});

let tournamentStatSchema = new mongoose.Schema({
    tournament_title: { type: String },
    team_name: { type: String },
    jersey_no: { type: Number, default: 0 },
    match_played: { type: Number, default: 0 },
    goals_scored: { type: Number, default: 0 },
    own_goals: { type: Number, default: 0 },
    goals_conceded: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    clean_sheets: { type: Number, default: 0 },
    yellow_cards: { type: Number, default: 0 },
    red_cards: { type: Number, default: 0 },
});


let playerSchema = new mongoose.Schema({
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    dob: { type: Date, default: Date.now },
    position: { type: String, required: true },
    tournament: [tournamentStatSchema],
});


let teamSchema = new mongoose.Schema({
    tournament_title: { type: String, required: true },
    name: { type: String, required: true },
    location: { type: String },
    logo: String,
    manager: { type: String },
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
    resultList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'results' }],
    tableList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'tables' }]
});

let scoreboardSchema = new mongoose.Schema({
    score1: { type: Number, required: true, default: 0 },
    score2: { type: Number, required: true, default: 0 },
    timer: { type: String, default: '1' },
    fixname: { type: String, required: true },
    fixObject: { type: mongoose.Schema.Types.ObjectId, ref: 'fixtures' },
    referee: { type: String },
    event: [{ type: String }],
    lineup: [{ type: String }],
});

let tableSchema = new mongoose.Schema({
    tournament_title: { type: String, required: true },
    team_name: { type: String, required: true },
    played: { type: Number, default: 0 },
    win: { type: Number, default: 0 },
    lost: { type: Number, default: 0 },
    draw: { type: Number, default: 0 },
    gf: { type: Number, default: 0 },
    ga: { type: Number, default: 0 },
    gd: { type: Number, default: 0 },
    points: { type: Number, default: 0 }
});

//Admin controls
const storySchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    images: [String],
    createdAt: { type: Date, default: Date.now }
});

const gallerySchema = new mongoose.Schema({
    title: String,
    imageUrl: { type: String, required: true },
    caption: String,
    category: String,
    createdAt: { type: Date, default: Date.now }
});

const leagueSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    logo: { type: String },
});

// Register models
const Story = mongoose.model('Story', storySchema);
const Gallery = mongoose.model('Gallery', gallerySchema);
const League = mongoose.model('League', leagueSchema);

// Admin Stories Endpoints
router.post('/admin/stories', cors(corsOptions), function (req, res) {
    const newStory = new Story({
        title: req.body.title,
        content: req.body.content,
        images: req.body.images,
        createdAt: new Date()
    });

    newStory.save(function (err, savedStory) {
        if (err) {
            res.status(500).json({ success: false, error: err });
        } else {
            res.json({ success: true, data: savedStory });
        }
    });
});

router.get('/admin/stories', cors(corsOptions), function (req, res) {
    Story.find({}, function (err, data) {
        if (err) {
            res.status(500).json({ success: false, error: err });
        } else {
            res.json({ success: true, data: data });
        }
    });
});

// Update Story
router.put('/admin/stories/:id', cors(corsOptions), function (req, res) {
    const { id } = req.params;

    Story.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true },
        function (err, updatedStory) {
            if (err) {
                res.status(500).json({ success: false, error: err });
            } else if (!updatedStory) {
                res.status(404).json({ success: false, error: 'Story not found' });
            } else {
                res.json({ success: true, data: updatedStory });
            }
        }
    );
});

// Delete Story
router.delete('/admin/stories/:id', cors(corsOptions), function (req, res) {
    const { id } = req.params;

    Story.findByIdAndDelete(id, function (err, deletedStory) {
        if (err) {
            res.status(500).json({ success: false, error: err });
        } else if (!deletedStory) {
            res.status(404).json({ success: false, error: 'Story not found' });
        } else {
            res.json({ success: true, data: deletedStory });
        }
    });
});


// Admin Gallery Endpoints
router.post('/admin/gallery', cors(corsOptions), function (req, res) {
    const newGalleryItem = new Gallery({
        title: req.body.title,
        imageUrl: req.body.imageUrl,
        caption: req.body.caption,
        category: req.body.category,
        createdAt: new Date()
    });

    newGalleryItem.save(function (err, savedItem) {
        if (err) {
            res.status(500).json({ success: false, error: err });
        } else {
            res.json({ success: true, data: savedItem });
        }
    });
});

router.get('/admin/gallery', cors(corsOptions), function (req, res) {
    Gallery.find({}, function (err, data) {
        if (err) {
            res.status(500).json({ success: false, error: err });
        } else {
            res.json({ success: true, data: data });
        }
    });
});

// Update Gallery Item
router.put('/admin/gallery/:id', cors(corsOptions), function (req, res) {
    const { id } = req.params;

    Gallery.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true },
        function (err, updatedItem) {
            if (err) {
                res.status(500).json({ success: false, error: err });
            } else if (!updatedItem) {
                res.status(404).json({ success: false, error: 'Gallery item not found' });
            } else {
                res.json({ success: true, data: updatedItem });
            }
        }
    );
});

// Delete Gallery Item
router.delete('/admin/gallery/:id', cors(corsOptions), function (req, res) {
    const { id } = req.params;

    Gallery.findByIdAndDelete(id, function (err, deletedItem) {
        if (err) {
            res.status(500).json({ success: false, error: err });
        } else if (!deletedItem) {
            res.status(404).json({ success: false, error: 'Gallery item not found' });
        } else {
            res.json({ success: true, data: deletedItem });
        }
    });
});

// Admin Leagues Endpoints
router.post('/admin/leagues', cors(corsOptions), function (req, res) {
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    const newLeague = new League({
        title: req.body.title,
        description: req.body.description,
        logo: req.body.logo
    });

    newLeague.save(function (err, savedLeague) {
        if (err) {
            res.status(500).json({ success: false, error: err });
        } else {
            res.json({ success: true, data: savedLeague });
        }
    });
});

router.get('/admin/leagues', cors(corsOptions), function (req, res) {
    League.find({}, function (err, data) {
        if (err) {
            res.status(500).json({ success: false, error: err });
        } else {
            res.json({ success: true, data: data });
        }
    });
});

// Update League
router.put('/admin/leagues/:id', cors(corsOptions), function (req, res) {
    const { id } = req.params;

    League.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true },
        function (err, updatedLeague) {
            if (err) {
                res.status(500).json({ success: false, error: err });
            } else if (!updatedLeague) {
                res.status(404).json({ success: false, error: 'League not found' });
            } else {
                res.json({ success: true, data: updatedLeague });
            }
        }
    );
});

// Delete League
router.delete('/admin/leagues/:id', cors(corsOptions), function (req, res) {
    const { id } = req.params;

    League.findByIdAndDelete(id, function (err, deletedLeague) {
        if (err) {
            res.status(500).json({ success: false, error: err });
        } else if (!deletedLeague) {
            res.status(404).json({ success: false, error: 'League not found' });
        } else {
            res.json({ success: true, data: deletedLeague });
        }
    });
});



//Models
let fixtures = mongoose.model('fixtures', fixtureSchema);
let players = mongoose.model('players', playerSchema);
let teams = mongoose.model('teams', teamSchema);
let results = mongoose.model('results', resultSchema);
let tournaments = mongoose.model('tournaments', tournamentSchema);
let scoreboards = mongoose.model('scoreboards', scoreboardSchema);
let tables = mongoose.model('tables', tableSchema);
let tournamentStats = mongoose.model('tournamentStats', tournamentStatSchema);


//Routes
router.get('/hello', function (req, res) {
    res.json({ hello: 'bro' });
});

//Get All data

//post table data
router.post('/tables', cors(corsOptions), function (req, res) {
    let newTable = new tables({
        tournament_title: req.body.tournament_title,
        team_name: req.body.team_name
    });
    newTable.save(function (err, savedTable) {
        if (err) {
            alert(err);
        } else {
            alert('Big Success' + savedTable);
            res.redirect('/');
        }
    })
});

router.get('/tables', cors(corsOptions), function (req, res) {
    tables.find({}, function (err, data) {
        if (err) {
            res.json({ success: false, message: err });
        } else {
            res.json({ success: true, message: data });
        }
    });
});


//post and get scoreboard

router.post('/scoreboard', cors(corsOptions), function (req, res) {
    fixtures.findOne({ fixname: req.body.fixname }, function (err, data) {
        if (err) {
            console.error(err);
            return;
        }
        if (!data) {
            console.error('No document found with that fixname');
            return;
        }
        var fixId = data._id;
        var lineup = [req.body.line1, req.body.liney2];
        console.log("yo lineup aako", lineup);
        let newScoreboard = new scoreboards({
            score1: req.body.score1,
            score2: req.body.score2,
            timer: req.body.timer,
            fixname: req.body.fixname,
            fixObject: fixId,
            referee: req.body.referee,
            lineup: lineup,
        });
        // console.log("yo ho haiii", data);
        newScoreboard.save(function (err, savedScoreboard) {
            if (err) {
                alert(err);
            } else {
                alert('Big Success' + savedScoreboard);
                res.redirect('/live');
            }
        })
    })
});

router.get('/scoreboard', cors(corsOptions), function (req, res) {
    scoreboards.find({}).sort({ _id: -1 }).limit(1)
        .populate('fixObject')
        .populate({
            path: 'fixObject',
            populate: {
                path: 'team1Object',
                populate: {
                    path: 'playerList',
                    model: 'players'
                }
            }
        })
        .populate({
            path: 'fixObject',
            populate: {
                path: 'team2Object',
                populate: {
                    path: 'playerList',
                    model: 'players'
                }
            }
        })
        .exec((error, arrayOfResults) => {
            if (error) {
                console.error("Error:", error);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                res.json(arrayOfResults);
            }
        });
});

router.post('/editScoreboard/', cors(corsOptions), function (req, res) {
    var fixname = req.body.fixname;
    var player_name = null;
    var fname, lname, jersey_no, tournament_title;

    var name1 = req.body.playername1?.split(' ');
    var name2 = req.body.playername2?.split(' ');

    tournament_title = req.body.tournament_title;
    console.log("yo tournament title", tournament_title);

    if (name1 && name1.length > 1) {
        jersey_no = parseInt(name1[0].replace(/\D+/g, ''), 10) || 0; // Extracts digits and converts to number
        fname = name1.slice(1, -1).join(' ') ?? " ";
        lname = name1.slice(-1)[0] ?? " ";
        player_name = fname + " " + lname;
    }

    if (name2 && name2.length > 1) {
        jersey_no = parseInt(name2[0].replace(/\D+/g, ''), 10) || 0; // Extracts digits and converts to number
        fname = name2.slice(1, -1).join(' ') ?? " ";
        lname = name2.slice(-1)[0] ?? " ";
        player_name = fname + " " + lname;
    }

    var eventtype = req.body.eventtype;

    var event = `${req.body.timer}' ${player_name} ${eventtype}`;

    if (!fixname) {
        return res.status(400).json({ error: 'Bhayena hai bhayena' });
    }

    const updateField = req.body.eventtype === 'goal' ? 'goals_scored' :
        req.body.eventtype === 'yellow' ? 'yellow_cards' :
            req.body.eventtype === 'red' ? 'red_cards' : null;

    if (!updateField) {
        return res.status(400).json({ error: 'Invalid eventtype' });
    }

    const updateObject = {
        $inc: {
            [`tournament.$[elem].${updateField}`]: 1
        }
    };

    updateObject.$inc[`tournament.$[elem].${updateField}`] = 1;

    players.findOneAndUpdate(
        { 'tournament.jersey_no': jersey_no, fname, lname, 'tournament.tournament_title': tournament_title },
        updateObject,
        { new: true, arrayFilters: [{ 'elem.tournament_title': tournament_title }] },
        (error, savedResults) => {
            if (!error && savedResults) {
                console.log('Player updated successfully:', savedResults);
                // reset form or additional logic
            } else {
                console.error('Error updating player:', error);
                console.log("Player not found:", { fname, lname, tournament_title });
            }
        }
    );

    scoreboards.findOneAndUpdate({ fixname: fixname },
        {
            $set: {
                score1: req.body.score1,
                score2: req.body.score2,
                timer: req.body.timer,
            },
            $push: {
                event: event
            }
        }, { new: true }, (error, savedResults) => {
            if (!error && savedResults) {
                console.log('Big Success', savedResults);
                // Additional logic or reset form
            } else {
                console.error('Error updating scoreboard:', error);
            }
        }).sort({ _id: -1 });


    //yo result ma pathauna
    let newResult = new results({
        tournament_title: req.body.tournament_title,
        fixtureResult: req.body.fixname,
        score: [req.body.score1, req.body.score2],
        fouls: req.body.fouls,
        offsides: req.body.offsides,
        corners: req.body.corners,
        shots: req.body.shots
    });
    newResult.save((error, savedResult) => {
        if (!error && savedResult) {
            alert('Big Success' + savedResult)
        }
    });
    tournaments.findOneAndUpdate({ title: req.body.tournament_title }, { $push: { resultList: newResult._id } }, { new: true }, (error, savedTeam) => {
        if (!error && savedTeam) {
            //alert('Big Success')
        }
    })
})


//fixtures post and get
router.post('/fixtures', cors(corsOptions), function (req, res) {
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
router.post('/editFixtures/', cors(corsOptions), function (req, res) {
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
router.post('/players', cors(corsOptions), function (req, res) {
    let newPlayer = new players({
        team_name: req.body.team_name,
        fname: req.body.fname,
        lname: req.body.lname,
        dob: req.body.dob,
        position: req.body.position,
    });

    players.findOne({ fname: req.body.fname, lname: req.body.lname, position: req.body.position }, (error, savedPlayer) => {
        if (!error && savedPlayer) {
            // alert('Player already exists')
            // res.redirect('/');
            //push to tournament
            savedPlayer.tournament.push({
                tournament_title: req.body.tournament_title,
                team_name: req.body.team_name,
                jersey_no: req.body.jersey_no,
                match_played: 0,
                goals_scored: 0,
                own_goals: 0,
                goals_conceded: 0,
                assists: 0,
                clean_sheets: 0,
                yellow_cards: 0,
                red_cards: 0,
            })
            savedPlayer.save((error, savedPlayer) => {
                if (!error && savedPlayer) {
                    alert('Big Success' + savedPlayer)
                }
            });
        }
        else {
            newPlayer.tournament.push({
                tournament_title: req.body.tournament_title,
                team_name: req.body.team_name,
                jersey_no: req.body.jersey_no,
                match_played: 0,
                goals_scored: 0,
                own_goals: 0,
                goals_conceded: 0,
                assists: 0,
                clean_sheets: 0,
                yellow_cards: 0,
                red_cards: 0,
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
        }
    });

})

//players delete
router.delete('/players/:id', cors(corsOptions), function (req, res) {
    players.findByIdAndRemove(req.params.id, (error, deletedPlayer) => {
        if (error) {
            res.status(500).send(error);
        } else if (!deletedPlayer) {
            res.status(404).send({ message: 'Player not found' });
        } else {
            res.status(200).send({ message: 'Player deleted successfully' });
        }
    });
});

//players update
router.put('/players/:id', cors(corsOptions), function (req, res) {
    players.findOneAndUpdate(
        { _id: req.params.id, "tournament.tournament_title": req.body.tournament_title },
        {
            $set: {
                "tournament.$.jersey_no": req.body.jersey_no,
                fname: req.body.fname,
                lname: req.body.lname,
                position: req.body.position
            }
        },
        { new: true, useFindAndModify: false },
        (error, updatedPlayer) => {
            if (error) {
                res.status(500).send(error);
            } else if (!updatedPlayer) {
                res.status(404).send({ message: 'Player not found' });
            } else {
                res.status(200).send(updatedPlayer);
            }
        }
    );
});

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
router.post('/tournaments', cors(corsOptions), function (req, res) {
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
        .populate('tableList')
        .populate({
            path: 'fixtureList',
            populate: {
                path: 'team1Object'
            }
        })
        .populate({
            path: 'fixtureList',
            populate: {
                path: 'team2Object'
            }
        })
        .exec((error, arrayOfResults) => {
            if (!error && arrayOfResults) {
                res.json(arrayOfResults)
            }
        })

});

//teams halne
router.post('/teams', cors(corsOptions), function (req, res) {
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
            // res.redirect('/');
            //res.json(savedTeam);
        }
    });

    tournaments.findOneAndUpdate({ title: req.body.tournament_title }, { $push: { teamList: newTeam._id } }, { new: true }, (error, savedTeam) => {
        if (!error && savedTeam) {
            //alert('Big Success')
        }
    })

    let newTable = new tables({
        tournament_title: req.body.tournament_title,
        team_name: req.body.name
    });
    newTable.save((error, savedTable) => {
        if (!error && savedTable) {
            alert('Big Success' + savedTable)
            //reset form
            res.redirect('/');
            //res.json(savedTeam);
        }
    });

    tournaments.findOneAndUpdate({ title: req.body.tournament_title }, { $push: { tableList: newTable._id } }, { new: true }, (error, savedTable) => {
        if (error) {
            alert('Big vye ka', error)
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
    )
        .sort([['points', -1], ['gd', -1]])
});

//results halne
router.post('/results', cors(corsOptions), function (req, res) {
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
        tables.findOneAndUpdate({ tournament_title: req.body.tournament_title, team_name: team1 }, { $inc: { gd: gd1 } }, { new: true }, (error, savedTeam1) => { if (error) { res.json(error) } })
        tables.findOneAndUpdate({ tournament_title: req.body.tournament_title, team_name: team2 }, { $inc: { gd: gd2 } }, { new: true }, (error, savedTeam1) => { if (error) { res.json(error) } })
        tables.findOneAndUpdate({ tournament_title: req.body.tournament_title, team_name: team1 }, { $inc: { gf: score1 } }, { new: true }, (error, savedTeam1) => { if (error) { res.json(error) } })
        tables.findOneAndUpdate({ tournament_title: req.body.tournament_title, team_name: team2 }, { $inc: { gf: score2 } }, { new: true }, (error, savedTeam1) => { if (error) { res.json(error) } })
        tables.findOneAndUpdate({ tournament_title: req.body.tournament_title, team_name: team1 }, { $inc: { ga: score2 } }, { new: true }, (error, savedTeam1) => { if (error) { res.json(error) } })
        tables.findOneAndUpdate({ tournament_title: req.body.tournament_title, team_name: team2 }, { $inc: { ga: score1 } }, { new: true }, (error, savedTeam1) => { if (error) { res.json(error) } })
        tables.findOneAndUpdate({ tournament_title: req.body.tournament_title, team_name: team1 }, { $inc: { played: 1 } }, { new: true }, (error, savedStat) => { if (error) { res.json(error) } })
        tables.findOneAndUpdate({ tournament_title: req.body.tournament_title, team_name: team2 }, { $inc: { played: 1 } }, { new: true }, (error, savedStat) => { if (error) { res.json(error) } })
        if (score1 > score2) {
            //increase win in stats
            tables.findOneAndUpdate({ tournament_title: req.body.tournament_title, team_name: team1 }, { $inc: { win: 1, points: 3 } }, { new: true }, (error, savedStat) => {
                if (error) { res.json(error) }
            })
            tables.findOneAndUpdate({ tournament_title: req.body.tournament_title, team_name: team2 }, { $inc: { lost: 1 } }, { new: true }, (error, savedStat) => {
                if (error) { res.json(error) }
            })
        } else if (score1 < score2) {
            tables.findOneAndUpdate({ tournament_title: req.body.tournament_title, team_name: team1 }, { $inc: { lost: 1 } }, { new: true }, (error, savedStat) => {
                if (error) { res.json(error) }
            })
            tables.findOneAndUpdate({ tournament_title: req.body.tournament_title, team_name: team2 }, { $inc: { win: 1, points: 3 } }, { new: true }, (error, savedStat) => {
                if (error) { res.json(error) }
            })
        } else {
            tables.findOneAndUpdate({ tournament_title: req.body.tournament_title, team_name: team1 }, { $inc: { draw: 1, points: 1 } }, { new: true }, (error, savedStat) => {
                if (error) { res.json(error) }
            })
            tables.findOneAndUpdate({ tournament_title: req.body.tournament_title, team_name: team2 }, { $inc: { draw: 1, points: 1 } }, { new: true }, (error, savedStat) => {
                if (error) { res.json(error) }
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
router.post('/editResults/', cors(corsOptions), function (req, res) {
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