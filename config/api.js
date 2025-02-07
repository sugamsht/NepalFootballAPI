const express = require('express');
const router = express.Router();
const alert = require('alert');
const mongoose = require('mongoose');
const cors = require('cors');

const corsOptions = {
    origin: [
        'http://localhost:5000',
        process.env.FRONTEND_URL,
        process.env.Backend_URL
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
};

// Schemas
const fixtureSchema = new mongoose.Schema({
    tournament_title: { type: String, required: true },
    team1: { type: String, required: true },
    team2: { type: String, required: true },
    team1Object: [{ type: mongoose.Schema.Types.ObjectId, ref: 'teams' }],
    team2Object: [{ type: mongoose.Schema.Types.ObjectId, ref: 'teams' }],
    stadium: String,
    date: { type: String },
    time: String,
    fixname: [String]
});

const tournamentStatSchema = new mongoose.Schema({
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
    red_cards: { type: Number, default: 0 }
});

const playerSchema = new mongoose.Schema({
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    dob: { type: Date, default: Date.now },
    position: { type: String, required: true },
    tournament: [tournamentStatSchema]
});

const teamSchema = new mongoose.Schema({
    tournament_title: { type: String, required: true },
    name: { type: String, required: true },
    location: { type: String },
    logo: String,
    manager: { type: String },
    playerList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'players' }]
});

const resultSchema = new mongoose.Schema({
    tournament_title: { type: String, required: true },
    fixtureResult: { type: String, required: true },
    score: [Number],
    fouls: [Number],
    offsides: [Number],
    corners: [Number],
    shots: [Number]
});

const tournamentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    stadium: [{ type: String }],
    teamList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'teams' }],
    fixtureList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'fixtures' }],
    resultList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'results' }],
    tableList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'tables' }]
});

const scoreboardSchema = new mongoose.Schema({
    score1: { type: Number, required: true, default: 0 },
    score2: { type: Number, required: true, default: 0 },
    timer: { type: String, default: '1' },
    fixname: { type: String, required: true },
    fixObject: { type: mongoose.Schema.Types.ObjectId, ref: 'fixtures' },
    referee: { type: String },
    event: [{ type: String }],
    lineup: [{ type: String }]
});

const tableSchema = new mongoose.Schema({
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

// Admin Schemas
const storySchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    images: [String],
    createdAt: { type: Date, default: Date.now }
});

const gallerySchema = new mongoose.Schema({
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    caption: String,
    category: String,
    createdAt: { type: Date, default: Date.now }
});

const leagueSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    logo: { type: String }
});

// Register models
const Story = mongoose.model('Story', storySchema);
const Gallery = mongoose.model('Gallery', gallerySchema);
const League = mongoose.model('League', leagueSchema);
const fixtures = mongoose.model('fixtures', fixtureSchema);
const players = mongoose.model('players', playerSchema);
const teams = mongoose.model('teams', teamSchema);
const results = mongoose.model('results', resultSchema);
const tournaments = mongoose.model('tournaments', tournamentSchema);
const scoreboards = mongoose.model('scoreboards', scoreboardSchema);
const tables = mongoose.model('tables', tableSchema);
const tournamentStats = mongoose.model('tournamentStats', tournamentStatSchema);

// Helper function for async route handlers
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Admin Stories Endpoints
router.post('/admin/stories', cors(corsOptions), asyncHandler(async (req, res) => {
    const newStory = new Story({ ...req.body, createdAt: new Date() });
    const savedStory = await newStory.save();
    res.json({ success: true, data: savedStory });
}));

router.get('/admin/stories', cors(corsOptions), asyncHandler(async (req, res) => {
    const data = await Story.find({});
    res.json({ success: true, data });
}));

router.put('/admin/stories/:id', cors(corsOptions), asyncHandler(async (req, res) => {
    const updatedStory = await Story.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedStory)
        return res.status(404).json({ success: false, error: 'Story not found' });
    res.json({ success: true, data: updatedStory });
}));

router.delete('/admin/stories/:id', cors(corsOptions), asyncHandler(async (req, res) => {
    const deletedStory = await Story.findByIdAndDelete(req.params.id);
    if (!deletedStory)
        return res.status(404).json({ success: false, error: 'Story not found' });
    res.json({ success: true, data: deletedStory });
}));

// Admin Gallery Endpoints
router.post('/admin/gallery', cors(corsOptions), asyncHandler(async (req, res) => {
    const newGalleryItem = new Gallery({ ...req.body, createdAt: new Date() });
    const savedItem = await newGalleryItem.save();
    res.json({ success: true, data: savedItem });
}));

router.get('/admin/gallery', cors(corsOptions), asyncHandler(async (req, res) => {
    const data = await Gallery.find({});
    res.json({ success: true, data });
}));

router.put('/admin/gallery/:id', cors(corsOptions), asyncHandler(async (req, res) => {
    const updatedItem = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedItem)
        return res.status(404).json({ success: false, error: 'Gallery item not found' });
    res.json({ success: true, data: updatedItem });
}));

router.delete('/admin/gallery/:id', cors(corsOptions), asyncHandler(async (req, res) => {
    const deletedItem = await Gallery.findByIdAndDelete(req.params.id);
    if (!deletedItem)
        return res.status(404).json({ success: false, error: 'Gallery item not found' });
    res.json({ success: true, data: deletedItem });
}));

// Admin Leagues Endpoints
router.post('/admin/leagues', cors(corsOptions), asyncHandler(async (req, res) => {
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    const newLeague = new League(req.body);
    const savedLeague = await newLeague.save();
    res.json({ success: true, data: savedLeague });
}));

router.get('/admin/leagues', cors(corsOptions), asyncHandler(async (req, res) => {
    const data = await League.find({});
    res.json({ success: true, data });
}));

router.put('/admin/leagues/:id', cors(corsOptions), asyncHandler(async (req, res) => {
    const updatedLeague = await League.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedLeague)
        return res.status(404).json({ success: false, error: 'League not found' });
    res.json({ success: true, data: updatedLeague });
}));

router.delete('/admin/leagues/:id', cors(corsOptions), asyncHandler(async (req, res) => {
    const deletedLeague = await League.findByIdAndDelete(req.params.id);
    if (!deletedLeague)
        return res.status(404).json({ success: false, error: 'League not found' });
    res.json({ success: true, data: deletedLeague });
}));

// Basic Route
router.get('/hello', (req, res) => res.json({ hello: 'bro' }));

// Tables Endpoints
router.post('/tables', cors(corsOptions), asyncHandler(async (req, res) => {
    const newTable = new tables({ tournament_title: req.body.tournament_title, team_name: req.body.team_name });
    await newTable.save();
    alert('Big Success' + newTable);
    res.redirect('/');
}));

router.get('/tables', cors(corsOptions), asyncHandler(async (req, res) => {
    const data = await tables.find({});
    res.json({ success: true, message: data });
}));

// Scoreboard Endpoints
router.post('/scoreboard', cors(corsOptions), asyncHandler(async (req, res) => {
    const data = await fixtures.findOne({ fixname: req.body.fixname });
    if (!data) {
        console.error('No document found with that fixname');
        return;
    }
    const fixId = data._id;
    const lineup = [req.body.line1, req.body.line2];
    console.log("Lineup received", lineup);
    const newScoreboard = new scoreboards({
        score1: req.body.score1,
        score2: req.body.score2,
        timer: req.body.timer,
        fixname: req.body.fixname,
        fixObject: fixId,
        referee: req.body.referee,
        lineup
    });
    await newScoreboard.save();
    alert('Big Success' + newScoreboard);
    res.redirect('/live');
}));

router.get('/scoreboard', cors(corsOptions), asyncHandler(async (req, res) => {
    const arrayOfResults = await scoreboards.find({}).sort({ _id: -1 }).limit(1)
        .populate('fixObject')
        .populate({
            path: 'fixObject',
            populate: { path: 'team1Object', populate: { path: 'playerList', model: 'players' } }
        })
        .populate({
            path: 'fixObject',
            populate: { path: 'team2Object', populate: { path: 'playerList', model: 'players' } }
        });
    res.json(arrayOfResults);
}));

router.post('/editScoreboard/', cors(corsOptions), asyncHandler(async (req, res) => {
    const { fixname, tournament_title } = req.body;
    let jersey_no, fname, lname, player_name = null;
    const name1 = req.body.playername1?.split(' ');
    const name2 = req.body.playername2?.split(' ');

    if (name1 && name1.length > 1) {
        jersey_no = parseInt(name1[0].replace(/\D+/g, ''), 10) || 0;
        fname = name1.slice(1, -1).join(' ') || " ";
        lname = name1.slice(-1)[0] || " ";
        player_name = `${fname} ${lname}`;
    }
    if (name2 && name2.length > 1) {
        jersey_no = parseInt(name2[0].replace(/\D+/g, ''), 10) || 0;
        fname = name2.slice(1, -1).join(' ') || " ";
        lname = name2.slice(-1)[0] || " ";
        player_name = `${fname} ${lname}`;
    }
    const eventtype = req.body.eventtype;
    const event = eventtype ? `${req.body.timer}' ${player_name} ${eventtype}` : null;
    if (!fixname) return res.status(400).json({ error: 'Bhayena hai bhayena' });
    const updateField = eventtype === 'goal' ? 'goals_scored' :
        eventtype === 'yellow' ? 'yellow_cards' :
            eventtype === 'red' ? 'red_cards' : null;
    const updateObject = {};
    if (updateField) {
        updateObject.$inc = { [`tournament.$[elem].${updateField}`]: 1 };
        await players.findOneAndUpdate(
            { 'tournament.jersey_no': jersey_no, fname, lname, 'tournament.tournament_title': tournament_title },
            updateObject,
            { new: true, arrayFilters: [{ 'elem.tournament_title': tournament_title }] }
        );
    }
    const scoreboardUpdate = { $set: { score1: req.body.score1, score2: req.body.score2, timer: req.body.timer } };
    if (req.body.lineup) scoreboardUpdate.$set.lineup = req.body.lineup;
    if (event) scoreboardUpdate.$push = { event };

    const savedResults = await scoreboards.findOneAndUpdate({ fixname }, scoreboardUpdate, { new: true }).sort({ _id: -1 });
    if (savedResults) console.log('Big Success', savedResults);
}));

// Fixtures Endpoints
router.post('/fixtures', cors(corsOptions), asyncHandler(async (req, res) => {
    const savedTeam1 = await teams.findOne({ name: req.body.team1 });
    const savedTeam2 = await teams.findOne({ name: req.body.team2 });
    const fixname = req.body.team1 + ' vs ' + req.body.team2;
    const dat = new Date(req.body.date).toDateString();
    const newFixture = new fixtures({
        tournament_title: req.body.tournament_title,
        team1: req.body.team1,
        team2: req.body.team2,
        stadium: req.body.stadium,
        date: dat,
        time: req.body.time,
        fixname,
        team1Object: savedTeam1._id,
        team2Object: savedTeam2._id
    });
    const savedFixture = await newFixture.save();
    alert('Big Success' + savedFixture);
    await tournaments.findOneAndUpdate(
        { title: req.body.tournament_title },
        { $push: { fixtureList: newFixture._id } },
        { new: true }
    );
}));

router.get('/fixtures', cors(corsOptions), asyncHandler(async (req, res) => {
    const resultsArr = await fixtures.find({}).exec();
    res.json(resultsArr);
}));

router.put('/fixtures/:id', cors(corsOptions), asyncHandler(async (req, res) => {
    const dat = new Date(req.body.date).toDateString();
    const updateData = {
        tournament_title: req.body.tournament_title,
        team1: req.body.team1,
        team2: req.body.team2,
        stadium: req.body.stadium,
        date: dat,
        time: req.body.time,
        fixname: req.body.fixname
    };
    const updatedFixture = await fixtures.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true, runValidators: true });
    if (!updatedFixture)
        return res.status(404).json({ success: false, message: 'Fixture not found.' });
    res.json({ success: true, message: 'Fixture updated successfully.', data: updatedFixture });
}));

router.delete('/fixtures/:id', cors(corsOptions), asyncHandler(async (req, res) => {
    const deletedFixture = await fixtures.findByIdAndDelete(req.params.id);
    if (!deletedFixture)
        return res.status(404).json({ success: false, message: 'Fixture not found.' });
    res.json({ success: true, message: 'Fixture deleted successfully.', data: deletedFixture });
}));

router.post('/editFixtures/', cors(corsOptions), asyncHandler(async (req, res) => {
    const dat = new Date(req.body.date).toDateString();
    const { fixname, postponed } = req.body;
    if (!fixname) return res.json({ error: 'No fixture name' });
    const query = postponed ? { fixname, date: dat } : { fixname };
    const update = { $set: { date: dat, time: req.body.time, stadium: req.body.stadium } };
    const savedFixture = await fixtures.findOneAndUpdate(query, update, { new: true });
    if (savedFixture) {
        alert('Big Success' + savedFixture);
    } else {
        alert('Enter Correct date of Postponed Fixture');
    }
}));

// Players Endpoints
router.post('/players', cors(corsOptions), asyncHandler(async (req, res) => {
    let newPlayer = new players({
        team_name: req.body.team_name,
        fname: req.body.fname,
        lname: req.body.lname,
        dob: req.body.dob,
        position: req.body.position,
    });
    const existingPlayer = await players.findOne({ fname: req.body.fname, lname: req.body.lname, position: req.body.position });
    if (existingPlayer) {
        existingPlayer.tournament.push({
            tournament_title: req.body.tournament_title,
            team_name: req.body.team_name,
            jersey_no: req.body.jersey_no
        });
        await existingPlayer.save();
        alert('Player already exists');
    } else {
        newPlayer.tournament.push({
            tournament_title: req.body.tournament_title,
            team_name: req.body.team_name,
            jersey_no: req.body.jersey_no
        });
        await newPlayer.save();
        alert('Big Success' + newPlayer);
        await teams.findOneAndUpdate({ name: req.body.team_name }, { $push: { playerList: newPlayer._id } }, { new: true });
    }
}));

router.delete('/players/:id', cors(corsOptions), asyncHandler(async (req, res) => {
    const deletedPlayer = await players.findByIdAndRemove(req.params.id);
    if (!deletedPlayer)
        return res.status(404).send({ message: 'Player not found' });
    res.status(200).send({ message: 'Player deleted successfully' });
}));

router.put('/players/:id', cors(corsOptions), asyncHandler(async (req, res) => {
    const updatedPlayer = await players.findByIdAndUpdate(req.params.id, {
        $set: { fname: req.body.fname, lname: req.body.lname, dob: req.body.dob, position: req.body.position }
    }, { new: true, runValidators: true });
    if (!updatedPlayer)
        return res.status(404).send({ message: 'Player not found' });
    res.status(200).send(updatedPlayer);
}));

router.get('/players', cors(corsOptions), asyncHandler(async (req, res) => {
    const result = await players.find({});
    res.json(result);
}));

// Tournaments Endpoints
router.post('/tournaments', cors(corsOptions), asyncHandler(async (req, res) => {
    let newTournament = new tournaments({
        title: req.body.title,
        stadium: req.body.stadium,
        teams: req.body.teams,
        fixtureList: req.body.fixtures,
        results: req.body.results
    });
    const savedTournament = await newTournament.save();
    alert('Big Success' + savedTournament);
}));

router.get('/tournaments', cors(corsOptions), asyncHandler(async (req, res) => {
    const data = await tournaments.find({})
        .populate('resultList')
        .populate('teamList')
        .populate('tableList')
        .populate({
            path: 'fixtureList',
            populate: { path: 'team1Object' }
        })
        .populate({
            path: 'fixtureList',
            populate: { path: 'team2Object' }
        });
    res.json(data);
}));

router.get('/tournamentnames', cors(corsOptions), asyncHandler(async (req, res) => {
    const data = await tournaments.find({}, 'title');
    res.json({ success: true, data });
}));

// Teams Endpoints
router.post('/teams', cors(corsOptions), asyncHandler(async (req, res) => {
    let newTeam = new teams({
        tournament_title: req.body.tournament_title,
        name: req.body.name,
        location: req.body.location,
        logo: req.body.logo,
        manager: req.body.manager,
        playerList: req.body.players
    });
    const savedTeam = await newTeam.save();
    alert('Big Success' + savedTeam);
    await tournaments.findOneAndUpdate({ title: req.body.tournament_title }, { $push: { teamList: savedTeam._id } }, { new: true });

    let newTable = new tables({
        tournament_title: req.body.tournament_title,
        team_name: req.body.name
    });
    const savedTable = await newTable.save();
    alert('Big Success' + savedTable);
    await tournaments.findOneAndUpdate({ title: req.body.tournament_title }, { $push: { tableList: savedTable._id } }, { new: true });
}));

router.get('/teams', cors(corsOptions), asyncHandler(async (req, res) => {
    let arrayOfResults = await teams.find({}).sort([['points', -1], ['gd', -1]]);
    await teams.populate(arrayOfResults, { path: 'playerList' });
    res.json(arrayOfResults);
}));

router.put('/teams/:id', cors(corsOptions), asyncHandler(async (req, res) => {
    const updateData = {
        tournament_title: req.body.tournament_title,
        name: req.body.name,
        location: req.body.location,
        logo: req.body.logo,
        manager: req.body.manager,
        playerList: req.body.playerList
    };
    const updatedTeam = await teams.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true, runValidators: true });
    if (!updatedTeam)
        return res.status(404).json({ success: false, message: 'Team not found.' });
    res.json({ success: true, message: 'Team updated successfully.', data: updatedTeam });
}));

router.delete('/teams/:id', cors(corsOptions), asyncHandler(async (req, res) => {
    const deletedTeam = await teams.findByIdAndDelete(req.params.id);
    if (!deletedTeam)
        return res.status(404).json({ success: false, message: 'Team not found.' });
    res.json({ success: true, message: 'Team deleted successfully.', data: deletedTeam });
}));

// Results Endpoints
router.post('/results', cors(corsOptions), asyncHandler(async (req, res) => {
    const fixtureResult = req.body.fixtureResult;
    const [team1, team2] = fixtureResult.split(' vs ');
    const [score1, score2] = req.body.score;
    const gd1 = score1 - score2;
    const gd2 = score2 - score1;
    if (score1 >= 0 && score2 >= 0) {
        await Promise.all([
            tables.findOneAndUpdate({ tournament_title: req.body.tournament_title, team_name: team1 }, { $inc: { gd: gd1, gf: score1, ga: score2, played: 1 } }, { new: true }),
            tables.findOneAndUpdate({ tournament_title: req.body.tournament_title, team_name: team2 }, { $inc: { gd: gd2, gf: score2, ga: score1, played: 1 } }, { new: true })
        ]);
        if (score1 > score2) {
            await Promise.all([
                tables.findOneAndUpdate({ tournament_title: req.body.tournament_title, team_name: team1 }, { $inc: { win: 1, points: 3 } }, { new: true }),
                tables.findOneAndUpdate({ tournament_title: req.body.tournament_title, team_name: team2 }, { $inc: { lost: 1 } }, { new: true })
            ]);
        } else if (score1 < score2) {
            await Promise.all([
                tables.findOneAndUpdate({ tournament_title: req.body.tournament_title, team_name: team1 }, { $inc: { lost: 1 } }, { new: true }),
                tables.findOneAndUpdate({ tournament_title: req.body.tournament_title, team_name: team2 }, { $inc: { win: 1, points: 3 } }, { new: true })
            ]);
        } else {
            await Promise.all([
                tables.findOneAndUpdate({ tournament_title: req.body.tournament_title, team_name: team1 }, { $inc: { draw: 1, points: 1 } }, { new: true }),
                tables.findOneAndUpdate({ tournament_title: req.body.tournament_title, team_name: team2 }, { $inc: { draw: 1, points: 1 } }, { new: true })
            ]);
        }
    } else {
        console.log("Postponed vayo");
    }
    let newResult = new results({
        tournament_title: req.body.tournament_title,
        fixtureResult,
        score: req.body.score,
        fouls: req.body.fouls,
        offsides: req.body.offsides,
        corners: req.body.corners,
        shots: req.body.shots
    });
    const savedResult = await newResult.save();
    alert('Big Success' + savedResult);
    await tournaments.findOneAndUpdate({ title: req.body.tournament_title }, { $push: { resultList: newResult._id } }, { new: true });
}));

router.get('/results', cors(corsOptions), asyncHandler(async (req, res) => {
    const arrayOfResults = await results.find({});
    res.json(arrayOfResults);
}));

router.delete('/results/:id', cors(corsOptions), asyncHandler(async (req, res) => {
    const deletedResult = await results.findByIdAndDelete(req.params.id);
    if (!deletedResult)
        return res.status(404).json({ success: false, message: 'Result not found.' });
    res.json({ success: true, message: 'Result deleted successfully.', data: deletedResult });
}));

router.put('/results/:id', cors(corsOptions), asyncHandler(async (req, res) => {
    const updatedResult = await results.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!updatedResult)
        return res.status(404).json({ success: false, message: 'Result not found.' });
    res.json({ success: true, message: 'Result updated successfully.', data: updatedResult });
}));

router.post('/editResults/', cors(corsOptions), asyncHandler(async (req, res) => {
    const { fixtureResult } = req.body;
    if (!fixtureResult) return res.json({ error: 'Bhayena hai bhayena' });
    const savedResults = await results.findOneAndUpdate({ fixtureResult }, {
        $set: { fouls: req.body.fouls, offsides: req.body.offsides, corners: req.body.corners, shots: req.body.shots }
    }, { new: true });
    if (savedResults) {
        alert('Big Success' + savedResults);
    }
}));

module.exports = router;