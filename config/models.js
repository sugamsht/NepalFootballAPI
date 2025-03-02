import { Schema, model } from 'mongoose';

// Match Statistics Sub-Schema
const MatchStatsSchema = new Schema({
    home: {
        shots: { type: Number, default: 0 },
        shots_on_target: { type: Number, default: 0 },
        possession: Number,
        corners: Number,
        fouls: Number,
        offsides: Number,
        yellowCards: Number,
        redCards: Number
    },
    away: {
        shots: { type: Number, default: 0 },
        shots_on_target: { type: Number, default: 0 },
        possession: Number,
        corners: Number,
        fouls: Number,
        offsides: Number,
        yellowCards: Number,
        redCards: Number
    }
});

// Match Events Sub-Schema
const MatchEventSchema = new Schema({
    minute: { type: Number, required: true },
    player: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
    type: {
        type: String,
        enum: ['Goal', 'YellowCard', 'RedCard', 'Substitution', 'Penalty'],
        required: true
    },
    team: { type: Schema.Types.ObjectId, ref: 'Team', required: true }
});

// Fixture Schema (Match)
const FixtureSchema = new Schema({
    tournament: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true },
    homeTeam: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    awayTeam: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    matchDate: { type: Date, required: true, index: true },
    stadium: { type: String, required: true },
    time: { type: String, required: true },
    status: {
        type: String,
        enum: ['Scheduled', 'Live', 'Completed', 'Postponed'],
        default: 'Scheduled'
    },
    score: {
        home: { type: Number, default: 0 },
        away: { type: Number, default: 0 }
    },
    stats: MatchStatsSchema,
    events: [MatchEventSchema]
}, { timestamps: true });

// Player Tournament Performance (Renamed to PlayerStatSchema)
const PlayerStatSchema = new Schema({
    tournament_title: { type: String, required: true },
    team_name: { type: String, required: true },
    jersey_no: { type: Number, required: true, min: 1, max: 99 },
    match_played: { type: Number, default: 0 },
    goals_scored: { type: Number, default: 0 },
    own_goals: { type: Number, default: 0 },
    goals_conceded: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    clean_sheets: { type: Number, default: 0 },
    yellow_cards: { type: Number, default: 0 },
    red_cards: { type: Number, default: 0 }
}, { _id: true });

// Player Schema
const PlayerSchema = new Schema({
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    dob: { type: Date, required: true },
    position: {
        type: String,
        required: true,
        enum: ['GK', 'DF', 'MF', 'FW']
    },
    // Array of embedded tournament performance subdocuments
    tournament: [PlayerStatSchema]
}, { timestamps: true });

// Virtual for full name
PlayerSchema.virtual('fullName').get(function () {
    return `${this.fname.trim()} ${this.lname.trim()}`;
});

// Virtual for calculating age from dob
PlayerSchema.virtual('age').get(function () {
    if (!this.dob) return null;
    const diffMs = Date.now() - this.dob.getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
});

// Ensure virtuals are included when converting to JSON or plain objects
PlayerSchema.set('toJSON', { virtuals: true });
PlayerSchema.set('toObject', { virtuals: true });

// Team Schema
const TeamSchema = new Schema({
    tournament_title: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    logo: String,
    manager: String,
    playerList: [{ type: Schema.Types.ObjectId, ref: 'Player' }]
}, { timestamps: true });

// Result Schema
const ResultSchema = new Schema({
    tournament: { type: Schema.Types.ObjectId, ref: 'Tournament' },
    fixture: { type: Schema.Types.ObjectId, ref: 'Fixture', required: true },
    score: {
        home: { type: Number, required: true },
        away: { type: Number, required: true }
    },
    stats: MatchStatsSchema
}, { timestamps: true });

// Tournament Schema
const TournamentSchema = new Schema({
    title: { type: String, required: true, unique: true, index: true },
    season: String,
    startDate: Date,
    endDate: Date,
    status: {
        type: String,
        enum: ['Upcoming', 'Ongoing', 'Completed'],
        default: 'Upcoming'
    },
    logo: { type: String, default: 'default.png' },
    teamList: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
    fixtureList: [{ type: Schema.Types.ObjectId, ref: 'Fixture' }],
    resultList: [{ type: Schema.Types.ObjectId, ref: 'Result' }]
}, { timestamps: true });

// Scoreboard Schema (Live match view)
const ScoreboardSchema = new Schema({
    score: {
        home: { type: Number, default: 0 },
        away: { type: Number, default: 0 }
    },
    timer: { type: String }, // e.g., "45+2"
    fixture: { type: Schema.Types.ObjectId, ref: 'Fixture', required: true },
    referee: String, // corrected spelling from "refree"
    stats: MatchStatsSchema,
    events: [MatchEventSchema],
    homeLineup: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
    awayLineup: [{ type: Schema.Types.ObjectId, ref: 'Player' }]
}, { timestamps: true });

// Table Schema (League standings)
const TableSchema = new Schema({
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
}, { timestamps: true });

// Story Schema (News or articles)
const StorySchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    images: [String]
}, { timestamps: true });

// Gallery Schema (Media gallery)
const GallerySchema = new Schema({
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    caption: String,
    category: {
        type: String,
        enum: ['Match', 'Training', 'Event', 'Other']
    }
}, { timestamps: true });

// League Schema
const LeagueSchema = new Schema({
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    logo: String,
    season: String,
}, { timestamps: true });

// Create Models
const Team = model('Team', TeamSchema);
const Player = model('Player', PlayerSchema);
const Tournament = model('Tournament', TournamentSchema);
const Fixture = model('Fixture', FixtureSchema);
const Scoreboard = model('Scoreboard', ScoreboardSchema);
const Story = model('Story', StorySchema);
const Gallery = model('Gallery', GallerySchema);
const League = model('League', LeagueSchema);
const Result = model('Result', ResultSchema);
const Table = model('Table', TableSchema);

export {
    Team, Player, Tournament, Fixture,
    Scoreboard, Story, Gallery, League, Result, Table
};
