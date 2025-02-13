// api.js
const express = require('express');
const router = express.Router();
const cors = require('cors');

const {
    Story,
    Gallery,
    League,
    Fixture,
    Player,
    Team,
    Result,
    Tournament,
    Scoreboard,
    Table
} = require('./models');

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

// Apply CORS globally on this router
router.use(cors(corsOptions));

// Helper for async route handlers
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

/* === ADMIN STORIES ENDPOINTS === */
router.post('/admin/stories', asyncHandler(async (req, res) => {
    const newStory = new Story({ ...req.body, createdAt: new Date() });
    const savedStory = await newStory.save();
    res.json({ success: true, data: savedStory });
}));

router.get('/admin/stories', asyncHandler(async (req, res) => {
    const data = await Story.find({});
    res.json({ success: true, data });
}));

router.put('/admin/stories/:id', asyncHandler(async (req, res) => {
    const updatedStory = await Story.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedStory)
        return res.status(404).json({ success: false, error: 'Story not found' });
    res.json({ success: true, data: updatedStory });
}));

router.delete('/admin/stories/:id', asyncHandler(async (req, res) => {
    const deletedStory = await Story.findByIdAndDelete(req.params.id);
    if (!deletedStory)
        return res.status(404).json({ success: false, error: 'Story not found' });
    res.json({ success: true, data: deletedStory });
}));

/* === ADMIN GALLERY ENDPOINTS === */
router.post('/admin/gallery', asyncHandler(async (req, res) => {
    const newGalleryItem = new Gallery({ ...req.body, createdAt: new Date() });
    const savedItem = await newGalleryItem.save();
    res.json({ success: true, data: savedItem });
}));

router.get('/admin/gallery', asyncHandler(async (req, res) => {
    const data = await Gallery.find({});
    res.json({ success: true, data });
}));

router.put('/admin/gallery/:id', asyncHandler(async (req, res) => {
    const updatedItem = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedItem)
        return res.status(404).json({ success: false, error: 'Gallery item not found' });
    res.json({ success: true, data: updatedItem });
}));

router.delete('/admin/gallery/:id', asyncHandler(async (req, res) => {
    const deletedItem = await Gallery.findByIdAndDelete(req.params.id);
    if (!deletedItem)
        return res.status(404).json({ success: false, error: 'Gallery item not found' });
    res.json({ success: true, data: deletedItem });
}));

/* === ADMIN LEAGUES ENDPOINTS === */
router.post('/admin/leagues', asyncHandler(async (req, res) => {
    const newLeague = new League(req.body);
    const savedLeague = await newLeague.save();
    res.json({ success: true, data: savedLeague });
}));

router.get('/admin/leagues', asyncHandler(async (req, res) => {
    const data = await League.find({});
    res.json({ success: true, data });
}));

router.put('/admin/leagues/:id', asyncHandler(async (req, res) => {
    const updatedLeague = await League.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedLeague)
        return res.status(404).json({ success: false, error: 'League not found' });
    res.json({ success: true, data: updatedLeague });
}));

router.delete('/admin/leagues/:id', asyncHandler(async (req, res) => {
    const deletedLeague = await League.findByIdAndDelete(req.params.id);
    if (!deletedLeague)
        return res.status(404).json({ success: false, error: 'League not found' });
    res.json({ success: true, data: deletedLeague });
}));

/* === BASIC ROUTE === */
router.get('/hello', (req, res) => res.json({ hello: 'bro' }));

/* === TABLES ENDPOINTS === */
router.post('/tables', asyncHandler(async (req, res) => {
    const newTable = new Table({ tournament_title: req.body.tournament_title, team_name: req.body.team_name });
    await newTable.save();
    res.json({ success: true, data: newTable });
}));

router.get('/tables', asyncHandler(async (req, res) => {
    const query = {};
    if (req.query.tournament_title) {
        query.tournament_title = req.query.tournament_title;
    }
    const data = await Table.find(query);
    res.json({ success: true, message: data });
}));


/* === SCOREBOARD ENDPOINTS === */
router.post('/scoreboard', asyncHandler(async (req, res) => {
    const fixtureData = await Fixture.findOne({ fixname: req.body.fixname });
    if (!fixtureData) return res.status(404).json({ error: 'Fixture not found' });
    const fixId = fixtureData._id;
    const lineup = [req.body.line1, req.body.line2].filter(Boolean);
    const newScoreboard = new Scoreboard({
        score1: req.body.score1,
        score2: req.body.score2,
        timer: req.body.timer,
        fixname: req.body.fixname,
        fixObject: fixId,
        referee: req.body.referee,
        lineup
    });
    await newScoreboard.save();
    res.json({ success: true, data: newScoreboard });
}));

router.get('/scoreboard', asyncHandler(async (req, res) => {
    const latestScoreboard = await Scoreboard.find({})
        .sort({ _id: -1 })
        .limit(1)
        .populate('fixObject')
        .populate({
            path: 'fixObject',
            populate: { path: 'team1Object', populate: { path: 'playerList', model: 'Player' } }
        })
        .populate({
            path: 'fixObject',
            populate: { path: 'team2Object', populate: { path: 'playerList', model: 'Player' } }
        });
    res.json(latestScoreboard);
}));

router.post('/editScoreboard', asyncHandler(async (req, res) => {
    const { fixname, tournament_title } = req.body;
    let jersey_no, fname, lname, player_name;
    const name1 = req.body.playername1?.split(' ');
    const name2 = req.body.playername2?.split(' ');

    if (name1 && name1.length > 1) {
        jersey_no = parseInt(name1[0].replace(/\D+/g, ''), 10) || 0;
        fname = name1.slice(1, -1).join(' ') || "";
        lname = name1.slice(-1)[0] || "";
        player_name = `${fname} ${lname}`;
    } else if (name2 && name2.length > 1) {
        jersey_no = parseInt(name2[0].replace(/\D+/g, ''), 10) || 0;
        fname = name2.slice(1, -1).join(' ') || "";
        lname = name2.slice(-1)[0] || "";
        player_name = `${fname} ${lname}`;
    }
    const eventtype = req.body.eventtype;
    const event = eventtype ? `${req.body.timer}' ${player_name} ${eventtype}` : null;
    if (!fixname) return res.status(400).json({ error: 'Fixture name is required' });

    const updateField = eventtype === 'goal' ? 'goals_scored' :
        eventtype === 'yellow' ? 'yellow_cards' :
            eventtype === 'red' ? 'red_cards' : null;
    if (updateField) {
        await Player.findOneAndUpdate(
            { 'tournament.jersey_no': jersey_no, fname, lname, 'tournament.tournament_title': tournament_title },
            { $inc: { [`tournament.$[elem].${updateField}`]: 1 } },
            { new: true, arrayFilters: [{ 'elem.tournament_title': tournament_title }] }
        );
    }

    const scoreboardUpdate = { $set: { score1: req.body.score1, score2: req.body.score2, timer: req.body.timer } };
    if (req.body.lineup) scoreboardUpdate.$set.lineup = req.body.lineup;
    if (event) scoreboardUpdate.$push = { event };

    const updatedScoreboard = await Scoreboard.findOneAndUpdate({ fixname }, scoreboardUpdate, { new: true });
    if (updatedScoreboard) {
        res.json({ success: true, data: updatedScoreboard });
    } else {
        res.status(404).json({ error: 'Scoreboard not found' });
    }
}));

/* === FIXTURES ENDPOINTS === */
router.post('/fixtures', asyncHandler(async (req, res) => {
    const team1Doc = await Team.findOne({ name: req.body.team1 });
    const team2Doc = await Team.findOne({ name: req.body.team2 });
    if (!team1Doc || !team2Doc) return res.status(404).json({ error: 'One or both teams not found' });
    const fixname = `${req.body.team1} vs ${req.body.team2}`;
    const dateFormatted = new Date(req.body.date).toDateString();
    const newFixture = new Fixture({
        tournament_title: req.body.tournament_title,
        team1: req.body.team1,
        team2: req.body.team2,
        stadium: req.body.stadium,
        date: dateFormatted,
        time: req.body.time,
        fixname,
        team1Object: team1Doc._id,
        team2Object: team2Doc._id
    });
    const savedFixture = await newFixture.save();
    await Tournament.findOneAndUpdate(
        { title: req.body.tournament_title },
        { $push: { fixtureList: newFixture._id } },
        { new: true }
    );
    res.json({ success: true, data: savedFixture });
}));

router.get('/fixtures', asyncHandler(async (req, res) => {
    const fixturesList = await Fixture.find({}).exec();
    res.json(fixturesList);
}));

router.put('/fixtures/:id', asyncHandler(async (req, res) => {
    const dateFormatted = new Date(req.body.date).toDateString();
    const updateData = {
        tournament_title: req.body.tournament_title,
        team1: req.body.team1,
        team2: req.body.team2,
        stadium: req.body.stadium,
        date: dateFormatted,
        time: req.body.time,
        fixname: req.body.fixname
    };
    const updatedFixture = await Fixture.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true, runValidators: true });
    if (!updatedFixture)
        return res.status(404).json({ success: false, message: 'Fixture not found.' });
    res.json({ success: true, message: 'Fixture updated successfully.', data: updatedFixture });
}));

router.delete('/fixtures/:id', asyncHandler(async (req, res) => {
    const deletedFixture = await Fixture.findByIdAndDelete(req.params.id);
    if (!deletedFixture)
        return res.status(404).json({ success: false, message: 'Fixture not found.' });
    res.json({ success: true, message: 'Fixture deleted successfully.', data: deletedFixture });
}));

router.post('/editFixtures', asyncHandler(async (req, res) => {
    const dateFormatted = new Date(req.body.date).toDateString();
    const { fixname, postponed } = req.body;
    if (!fixname) return res.status(400).json({ error: 'Fixture name is required' });
    const query = postponed ? { fixname, date: dateFormatted } : { fixname };
    const update = { $set: { date: dateFormatted, time: req.body.time, stadium: req.body.stadium } };
    const updatedFixture = await Fixture.findOneAndUpdate(query, update, { new: true });
    if (updatedFixture) {
        res.json({ success: true, data: updatedFixture });
    } else {
        res.status(400).json({ error: 'Enter correct date of postponed fixture' });
    }
}));

/* === PLAYERS ENDPOINTS === */
router.post('/players', asyncHandler(async (req, res) => {
    const { team_name, fname, lname, dob, position, tournament_title, jersey_no } = req.body;
    let playerDoc = await Player.findOne({ fname, lname, position });
    if (playerDoc) {
        playerDoc.tournament.push({ tournament_title, team_name, jersey_no });
        await playerDoc.save();
        res.json({ success: true, message: 'Player already exists. Tournament added.', data: playerDoc });
    } else {
        playerDoc = new Player({ fname, lname, dob, position });
        playerDoc.tournament.push({ tournament_title, team_name, jersey_no });
        await playerDoc.save();
        await Team.findOneAndUpdate({ name: team_name }, { $push: { playerList: playerDoc._id } }, { new: true });
        res.json({ success: true, data: playerDoc });
    }
}));

router.get('/players/:id', asyncHandler(async (req, res) => {
    const player = await Player.findById(req.params.id);
    if (!player) {
        return res.status(404).json({ success: false, message: 'Player not found' });
    }
    res.json({ success: true, data: player });
}));

router.delete('/players/:id', asyncHandler(async (req, res) => {
    const deletedPlayer = await Player.findByIdAndRemove(req.params.id);
    if (!deletedPlayer)
        return res.status(404).json({ message: 'Player not found' });
    res.json({ success: true, message: 'Player deleted successfully' });
}));

router.put('/players/:id', asyncHandler(async (req, res) => {
    const updatedPlayer = await Player.findByIdAndUpdate(
        req.params.id,
        { $set: { fname: req.body.fname, lname: req.body.lname, dob: req.body.dob, position: req.body.position } },
        { new: true, runValidators: true }
    );
    if (!updatedPlayer)
        return res.status(404).json({ message: 'Player not found' });
    res.json(updatedPlayer);
}));

router.get('/players', asyncHandler(async (req, res) => {
    const playersList = await Player.find({});
    res.json(playersList);
}));

/* === TOURNAMENTS ENDPOINTS === */
router.post('/tournaments', asyncHandler(async (req, res) => {
    const newTournament = new Tournament({
        title: req.body.title,
        stadium: req.body.stadium,
        teamList: req.body.teams,
        fixtureList: req.body.fixtures,
        resultList: req.body.results
    });
    const savedTournament = await newTournament.save();
    res.json({ success: true, data: savedTournament });
}));

router.get('/tournaments', asyncHandler(async (req, res) => {
    const data = await Tournament.find({})
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

router.get('/tournamentnames', asyncHandler(async (req, res) => {
    const data = await Tournament.find({}, 'title');
    res.json({ success: true, data });
}));

/* === TEAMS ENDPOINTS === */
router.post('/teams', asyncHandler(async (req, res) => {
    const newTeam = new Team({
        tournament_title: req.body.tournament_title,
        name: req.body.name,
        location: req.body.location,
        logo: req.body.logo,
        manager: req.body.manager,
        playerList: req.body.players
    });
    const savedTeam = await newTeam.save();
    await Tournament.findOneAndUpdate({ title: req.body.tournament_title }, { $push: { teamList: savedTeam._id } }, { new: true });

    const newTable = new Table({
        tournament_title: req.body.tournament_title,
        team_name: req.body.name
    });
    const savedTable = await newTable.save();
    await Tournament.findOneAndUpdate({ title: req.body.tournament_title }, { $push: { tableList: savedTable._id } }, { new: true });

    res.json({ success: true, data: { team: savedTeam, table: savedTable } });
}));

router.get('/teams', asyncHandler(async (req, res) => {
    let teamsList = await Team.find({}).sort({ points: -1, gd: -1 });
    teamsList = await Team.populate(teamsList, { path: 'playerList' });
    res.json(teamsList);
}));

router.put('/teams/:id', asyncHandler(async (req, res) => {
    const updateData = {
        tournament_title: req.body.tournament_title,
        name: req.body.name,
        location: req.body.location,
        logo: req.body.logo,
        manager: req.body.manager,
        playerList: req.body.playerList
    };
    const updatedTeam = await Team.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true, runValidators: true });
    if (!updatedTeam)
        return res.status(404).json({ success: false, message: 'Team not found.' });
    res.json({ success: true, message: 'Team updated successfully.', data: updatedTeam });
}));

router.delete('/teams/:id', asyncHandler(async (req, res) => {
    const deletedTeam = await Team.findByIdAndDelete(req.params.id);
    if (!deletedTeam)
        return res.status(404).json({ success: false, message: 'Team not found.' });
    res.json({ success: true, message: 'Team deleted successfully.', data: deletedTeam });
}));

/* === RESULTS ENDPOINTS === */
router.post('/results', asyncHandler(async (req, res) => {
    const fixtureResult = req.body.fixtureResult;
    const [team1, team2] = fixtureResult.split(' vs ');
    const [score1, score2] = req.body.score;
    const gd1 = score1 - score2;
    const gd2 = score2 - score1;

    if (score1 >= 0 && score2 >= 0) {
        await Promise.all([
            Table.findOneAndUpdate(
                { tournament_title: req.body.tournament_title, team_name: team1 },
                { $inc: { gd: gd1, gf: score1, ga: score2, played: 1 } },
                { new: true }
            ),
            Table.findOneAndUpdate(
                { tournament_title: req.body.tournament_title, team_name: team2 },
                { $inc: { gd: gd2, gf: score2, ga: score1, played: 1 } },
                { new: true }
            )
        ]);
        if (score1 > score2) {
            await Promise.all([
                Table.findOneAndUpdate(
                    { tournament_title: req.body.tournament_title, team_name: team1 },
                    { $inc: { win: 1, points: 3 } },
                    { new: true }
                ),
                Table.findOneAndUpdate(
                    { tournament_title: req.body.tournament_title, team_name: team2 },
                    { $inc: { lost: 1 } },
                    { new: true }
                )
            ]);
        } else if (score1 < score2) {
            await Promise.all([
                Table.findOneAndUpdate(
                    { tournament_title: req.body.tournament_title, team_name: team1 },
                    { $inc: { lost: 1 } },
                    { new: true }
                ),
                Table.findOneAndUpdate(
                    { tournament_title: req.body.tournament_title, team_name: team2 },
                    { $inc: { win: 1, points: 3 } },
                    { new: true }
                )
            ]);
        } else {
            await Promise.all([
                Table.findOneAndUpdate(
                    { tournament_title: req.body.tournament_title, team_name: team1 },
                    { $inc: { draw: 1, points: 1 } },
                    { new: true }
                ),
                Table.findOneAndUpdate(
                    { tournament_title: req.body.tournament_title, team_name: team2 },
                    { $inc: { draw: 1, points: 1 } },
                    { new: true }
                )
            ]);
        }
    } else {
        console.log("Match postponed");
    }

    const matchingFixture = await Fixture.findOne({ fixname: fixtureResult }).sort({ $natural: -1 });
    const resultDate = matchingFixture ? matchingFixture.date : new Date().toDateString();

    const newResult = new Result({
        tournament_title: req.body.tournament_title,
        fixtureResult,
        date: resultDate,
        score: req.body.score,
        fouls: req.body.fouls,
        offsides: req.body.offsides,
        corners: req.body.corners,
        shots: req.body.shots
    });
    const savedResult = await newResult.save();
    await Tournament.findOneAndUpdate(
        { title: req.body.tournament_title },
        { $push: { resultList: newResult._id } },
        { new: true }
    );
    res.json({ success: true, data: savedResult });
}));

router.get('/results', asyncHandler(async (req, res) => {
    const resultsList = await Result.find({});
    res.json(resultsList);
}));

router.get('/results/search', asyncHandler(async (req, res) => {
    const { team, team1, team2, fixname, date } = req.query;
    let query = {};
    if (fixname) query.fixtureResult = { $regex: fixname, $options: 'i' };
    if (date) query.date = date;
    if (team) {
        query.fixtureResult = { $regex: team, $options: 'i' };
    } else if (team1 || team2) {
        const conditions = [];
        if (team1) conditions.push({ fixtureResult: { $regex: team1, $options: 'i' } });
        if (team2) conditions.push({ fixtureResult: { $regex: team2, $options: 'i' } });
        query = Object.keys(query).length ? { $and: [query, ...conditions] } : { $and: conditions };
    }
    if (Object.keys(query).length === 0)
        return res.status(400).json({ success: false, message: 'No valid query parameter provided.' });

    const resultsFound = await Result.find(query);
    if (!resultsFound || resultsFound.length === 0)
        return res.status(404).json({ success: false, message: 'No results found matching that criteria.' });

    res.json({ success: true, data: resultsFound });
}));

router.get('/results/:id', asyncHandler(async (req, res) => {
    const resultItem = await Result.findById(req.params.id);
    if (!resultItem) return res.status(404).json({ success: false, message: 'Result not found.' });
    res.json({ success: true, data: resultItem });
}));

router.delete('/results/:id', asyncHandler(async (req, res) => {
    const deletedResult = await Result.findByIdAndDelete(req.params.id);
    if (!deletedResult)
        return res.status(404).json({ success: false, message: 'Result not found.' });
    res.json({ success: true, message: 'Result deleted successfully.', data: deletedResult });
}));

router.put('/results/:id', asyncHandler(async (req, res) => {
    const updatedResult = await Result.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!updatedResult)
        return res.status(404).json({ success: false, message: 'Result not found.' });
    res.json({ success: true, message: 'Result updated successfully.', data: updatedResult });
}));

/* === TEAM DETAILS ENDPOINTS === */
router.get('/teams/:id', asyncHandler(async (req, res) => {
    const team = await Team.findById(req.params.id).populate('playerList');
    if (!team)
        return res.status(404).json({ success: false, message: 'Team not found.' });
    res.json({ success: true, data: team });
}));

router.get('/teams/search/:teamName', asyncHandler(async (req, res) => {
    const teamName = req.params.teamName;
    const team = await Team.find({ name: teamName }).populate('playerList');
    if (!team || team.length === 0)
        return res.status(404).json({ success: false, message: 'Team not found.' });
    res.json({ success: true, data: team });
}));

router.get('/fixtures/search', asyncHandler(async (req, res) => {
    const { team, team1, team2 } = req.query;
    if (team) {
        const fixturesFound = await Fixture.find({
            $or: [{ team1: team }, { team2: team }]
        }).populate('team1Object team2Object');
        if (!fixturesFound || fixturesFound.length === 0)
            return res.status(404).json({ success: false, message: 'No fixtures found matching that team name.' });
        return res.json({ success: true, data: fixturesFound });
    } else if (team1 || team2) {
        const query = {};
        if (team1) query.team1 = { $regex: team1, $options: 'i' };
        if (team2) query.team2 = { $regex: team2, $options: 'i' };
        const fixturesFound = await Fixture.find(query).populate('team1Object team2Object');
        if (!fixturesFound || fixturesFound.length === 0)
            return res.status(404).json({ success: false, message: 'No fixtures found.' });
        return res.json({ success: true, data: fixturesFound });
    } else {
        return res.status(400).json({ success: false, message: 'No valid query parameter provided.' });
    }
}));

router.get('/fixtures/:id', asyncHandler(async (req, res) => {
    const fixtureItem = await Fixture.findById(req.params.id)
        .populate('team1Object team2Object');
    if (!fixtureItem)
        return res.status(404).json({ success: false, message: 'Fixture not found.' });
    res.json({ success: true, data: fixtureItem });
}));

module.exports = router;
