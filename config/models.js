// models.js
const mongoose = require('mongoose');

// Fixtures Schema
const fixtureSchema = new mongoose.Schema({
    tournament_title: { type: String, required: true },
    team1: { type: String, required: true },
    team2: { type: String, required: true },
    team1Object: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    team2Object: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    stadium: String,
    date: String,
    time: String,
    fixname: [String]
});

// Tournament Stat Schema
const tournamentStatSchema = new mongoose.Schema({
    tournament_title: String,
    team_name: String,
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

// Player Schema
const playerSchema = new mongoose.Schema({
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    dob: { type: Date, default: Date.now },
    position: { type: String, required: true },
    tournament: [tournamentStatSchema]
});

// Team Schema
const teamSchema = new mongoose.Schema({
    tournament_title: { type: String, required: true },
    name: { type: String, required: true },
    location: String,
    logo: String,
    manager: String,
    playerList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }]
});

// Result Schema
const resultSchema = new mongoose.Schema({
    tournament_title: { type: String, required: true },
    fixtureResult: { type: String, required: true },
    date: String,
    score: [Number],
    fouls: [Number],
    offsides: [Number],
    corners: [Number],
    shots: [Number]
});

// Tournament Schema
const tournamentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    stadium: [String],
    teamList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    fixtureList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Fixture' }],
    resultList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Result' }],
    tableList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Table' }]
});

// Scoreboard Schema
const scoreboardSchema = new mongoose.Schema({
    score1: { type: Number, required: true, default: 0 },
    score2: { type: Number, required: true, default: 0 },
    timer: { type: String, default: '1' },
    fixname: { type: String, required: true },
    fixObject: { type: mongoose.Schema.Types.ObjectId, ref: 'Fixture' },
    referee: String,
    event: [String],
    lineup: [String]
});

// Table Schema
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
    logo: String
});

// Export models
module.exports = {
    Story: mongoose.model('Story', storySchema),
    Gallery: mongoose.model('Gallery', gallerySchema),
    League: mongoose.model('League', leagueSchema),
    Fixture: mongoose.model('Fixture', fixtureSchema),
    Player: mongoose.model('Player', playerSchema),
    Team: mongoose.model('Team', teamSchema),
    Result: mongoose.model('Result', resultSchema),
    Tournament: mongoose.model('Tournament', tournamentSchema),
    Scoreboard: mongoose.model('Scoreboard', scoreboardSchema),
    Table: mongoose.model('Table', tableSchema),
    TournamentStat: mongoose.model('TournamentStat', tournamentStatSchema)
};
