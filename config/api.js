import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { Types } from 'mongoose'; // if needed for ObjectId conversion
import {
    Team,
    Player,
    Tournament,
    Fixture,
    Scoreboard,
    Story,
    Gallery,
    League,
    Result,
    Table
} from './models.js';

const router = Router();

// Security Middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500
});
router.use(limiter);

// Helper Functions
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

const validateRequest = validations => [
    validations,
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        next();
    }
];

class ApiError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

// Modify createCrudController to accept an optional searchFields parameter.
const createCrudController = (Model, populateOptions = [], searchFields = []) => ({
    create: asyncHandler(async (req, res) => {
        const doc = await Model.create(req.body);
        res.status(201).json(doc);
    }),
    getAll: asyncHandler(async (req, res) => {
        const { limit, q, ...filter } = req.query;
        // If a search query is present and searchFields is defined, add a $or clause.
        if (q && searchFields.length > 0) {
            const regex = new RegExp(q.trim(), 'i');
            filter.$or = searchFields.map(field => ({ [field]: { $regex: regex } }));
        }
        const docs = await Model.find(filter)
            .sort({ _id: -1 }) // latest first
            .populate(populateOptions)
            .limit(limit ? parseInt(limit, 10) : 0);
        res.json({ count: docs.length, data: docs });
    }),
    getById: asyncHandler(async (req, res) => {
        const doc = await Model.findById(req.params.id).populate(populateOptions);
        if (!doc) throw new ApiError(`${Model.modelName} not found`, 404);
        res.json(doc);
    }),
    update: asyncHandler(async (req, res) => {
        const doc = await Model.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate(populateOptions);
        if (!doc) throw new ApiError(`${Model.modelName} not found`, 404);
        res.json(doc);
    }),
    delete: asyncHandler(async (req, res) => {
        const doc = await Model.findByIdAndDelete(req.params.id);
        if (!doc) throw new ApiError(`${Model.modelName} not found`, 404);
        res.status(204).send();
    })
});

// Initialize Controllers—note that for teams we enable search by name.
const teamController = createCrudController(Team, ['playerList'], ['name']);
const playerController = createCrudController(Player, [], ['fname', 'lname']);
const tournamentController = createCrudController(Tournament, ['teamList', 'fixtureList', 'resultList']);
const storyController = createCrudController(Story);
const galleryController = createCrudController(Gallery);
const leagueController = createCrudController(League, []);
const resultController = createCrudController(Result, ['fixture']);
const tableController = createCrudController(Table);
const fixtureController = createCrudController(Fixture, [
    { path: 'tournament', select: 'title _id' },
    'homeTeam',
    'awayTeam'
], ['status']);

// Define the populate options
const scoreboardPopulateOptions = [
    {
        path: 'fixture',
        populate: [
            { path: 'tournament', select: 'title logo _id' },
            {
                path: 'homeTeam',
                select: 'name logo _id',
                populate: { path: 'playerList', select: 'fname lname tournament.jersey_no _id' }
            },
            {
                path: 'awayTeam',
                select: 'name logo _id',
                populate: { path: 'playerList', select: 'fname lname tournament.jersey_no _id' }
            }
        ]
    },
    {
        // Updated select to include jersey_no inside tournament subdocument.
        path: 'homeLineup',
        select: 'fname lname tournament.jersey_no _id'
    },
    {
        path: 'awayLineup',
        select: 'fname lname tournament.jersey_no _id'
    },
    { path: 'events', populate: { path: 'player', select: 'fname lname _id' } }
];

// Create the default CRUD controller for Scoreboard.
const scoreboardController = createCrudController(Scoreboard, scoreboardPopulateOptions);

// Override the default update method to include the $push operator for events.
scoreboardController.update = asyncHandler(async (req, res) => {
    const update = {};
    if (req.body.score) update.score = req.body.score;
    if (req.body.timer) update.timer = req.body.timer;
    if (req.body.referee) update.referee = req.body.referee;
    if (req.body.fixture) update.fixture = req.body.fixture;
    if (req.body.lineup) update.lineup = req.body.lineup;
    if (req.body.stats) update.stats = req.body.stats;
    if (req.body.homeLineup) update.homeLineup = req.body.homeLineup;
    if (req.body.awayLineup) update.awayLineup = req.body.awayLineup;
    if (req.body.events) {
        update.$push = { events: { $each: req.body.events } };
    }
    const doc = await Scoreboard.findByIdAndUpdate(
        req.params.id,
        update,
        { new: true, runValidators: true }
    ).populate(scoreboardPopulateOptions);
    if (!doc) throw new ApiError('Scoreboard not found', 404);
    // Emit the updated scoreboard to connected clients
    if (global.io) global.io.emit('scoreUpdate', doc);
    res.json(doc);
});

// Teams Routes
router.route('/teams')
    .get(teamController.getAll)
    .post(
        validateRequest([body('name').notEmpty()]),
        teamController.create
    );

router.route('/teams/:id')
    .get(teamController.getById)
    .put(teamController.update)
    .delete(teamController.delete);

// Players Routes
router.route('/players')
    .get(playerController.getAll)
    .post(
        validateRequest([
            body('fname').notEmpty(),
            body('lname').notEmpty(),
            body('dob').isISO8601(),
            body('position').isIn(['GK', 'DF', 'MF', 'FW'])
        ]),
        asyncHandler(async (req, res) => {
            const { tournament_title, team_name, jersey_no, ...rest } = req.body;
            if (tournament_title && team_name && jersey_no) {
                // Query tournament to get its title
                const tournamentDoc = await Tournament.findById(tournament_title);
                const titleText = tournamentDoc ? tournamentDoc.title : tournament_title;
                rest.tournament = [{ tournament_title: titleText, team_name, jersey_no }];
            }
            const player = await Player.create(rest);
            res.status(201).json(player);
        })
    );

router.route('/players/:id')
    .get(playerController.getById)
    .put(playerController.update)
    .delete(playerController.delete);

// Tournaments Routes
router.route('/tournaments')
    .get(tournamentController.getAll)
    .post(
        validateRequest([body('title').notEmpty()]),
        tournamentController.create
    );

router.route('/tournaments/:id')
    .get(tournamentController.getById)
    .put(tournamentController.update)
    .delete(tournamentController.delete);

// Fixtures Routes
// Define non-parameterized routes first
router.route('/fixtures')
    .get(fixtureController.getAll)
    .post(
        validateRequest([
            body('tournament').isMongoId(),
            body('homeTeam').isMongoId(),
            body('awayTeam').isMongoId(),
            body('stadium').notEmpty(),
            body('time').notEmpty()
        ]),
        fixtureController.create
    );

// Upcoming Fixtures by Team ID
router.get(
    '/fixtures/upcoming',
    validateRequest([
        query('team')
            .isMongoId()
            .withMessage('A valid team id is required')
    ]),
    asyncHandler(async (req, res) => {
        const teamId = req.query.team;
        const now = new Date();
        const fixtures = await Fixture.find({
            $and: [
                { status: { $ne: "Completed" } },
                { $or: [{ homeTeam: teamId }, { awayTeam: teamId }] },
                { matchDate: { $gte: now } }
            ]
        })
            .populate([
                { path: 'tournament', select: 'title _id' },
                'homeTeam',
                'awayTeam'
            ])
            .sort({ matchDate: 1 });

        res.json({ count: fixtures.length, data: fixtures });
    })
);


router.get(
    '/fixtures/h2h',
    validateRequest([
        query('team')
            .customSanitizer(value => (Array.isArray(value) ? value : [value]))
            .isArray({ min: 1, max: 2 })
            .withMessage('One or two team names required'),
        query('team.*').notEmpty().trim()
    ]),
    asyncHandler(async (req, res) => {
        const teams = req.query.team.map(t =>
            t.trim().toLowerCase().replace(/\s+/g, ' ')
        );

        const buildNameCondition = (field) => ({
            $eq: [
                { $trim: { input: { $toLower: `$${field}.name` } } },
                teams[0]
            ]
        });

        const matchStage = teams.length === 1 ? {
            status: 'Completed',
            $expr: {
                $or: [
                    buildNameCondition('homeTeam'),
                    buildNameCondition('awayTeam')
                ]
            }
        } : {
            status: 'Completed',
            $expr: {
                $or: [
                    {
                        $and: [
                            buildNameCondition('homeTeam'),
                            {
                                $eq: [
                                    { $trim: { input: { $toLower: "$awayTeam.name" } } },
                                    teams[1]
                                ]
                            }
                        ]
                    },
                    {
                        $and: [
                            {
                                $eq: [
                                    { $trim: { input: { $toLower: "$homeTeam.name" } } },
                                    teams[1]
                                ]
                            },
                            buildNameCondition('awayTeam')
                        ]
                    }
                ]
            }
        };

        const fixtures = await Fixture.aggregate([
            { $lookup: { from: 'teams', localField: 'homeTeam', foreignField: '_id', as: 'homeTeam' } },
            { $unwind: '$homeTeam' },
            { $lookup: { from: 'teams', localField: 'awayTeam', foreignField: '_id', as: 'awayTeam' } },
            { $unwind: '$awayTeam' },
            { $lookup: { from: 'tournaments', localField: 'tournament', foreignField: '_id', as: 'tournament' } },
            { $unwind: '$tournament' },
            { $match: matchStage },
            {
                $project: {
                    'homeTeam.playerList': 0,
                    'awayTeam.playerList': 0,
                    '__v': 0,
                    'createdAt': 0,
                    'updatedAt': 0
                }
            },
            { $sort: { matchDate: -1 } }
        ]);

        res.json({
            teams: req.query.team,
            totalMatches: fixtures.length,
            matches: fixtures.map(f => ({
                id: f._id, // fixture id included
                date: f.matchDate,
                tournament: f.tournament.title, // include tournament title
                teams: {
                    [f.homeTeam.name]: f.score.home,
                    [f.awayTeam.name]: f.score.away
                },
                venue: f.stadium
            }))
        });
    })
);

// Then define the parameterized fixture routes
router.route('/fixtures/:id')
    .get(fixtureController.getById)
    .put(fixtureController.update)
    .delete(fixtureController.delete);

// Finalize match and transfer stats/events from scoreboard to fixture
router.patch('/fixtures/:id/complete', asyncHandler(async (req, res) => {
    const scoreboard = await Scoreboard.findOne({ fixture: req.params.id });
    if (!scoreboard) {
        return res.status(404).json({ message: "Scoreboard not found" });
    }

    const fixture = await Fixture.findByIdAndUpdate(
        req.params.id,
        {
            score: scoreboard.score,
            stats: scoreboard.stats,
            events: scoreboard.events,
            status: "Completed"
        },
        { new: true }
    );
    res.json(fixture);
}));


// Scoreboard Routes
// Use scoreboardController for all scoreboard routes.
router.route('/scoreboard')
    .get((req, res, next) => {
        if (!req.query.limit) {
            req.query.limit = "1";
        }
        next();
    }, scoreboardController.getAll)
    .post(
        validateRequest([body('fixture').isMongoId()]),
        scoreboardController.create
    );

router.route('/scoreboard/:id')
    .get(scoreboardController.getById)
    .patch(
        validateRequest([
            body('score').optional().isObject(),
            body('timer').optional().isString(),
            body('referee').optional().isString(),
            body('fixture').optional().isString(),
            body('lineup').optional().isString(),
            body('stats').optional().isObject(),
            body('events').optional().isArray(),
            body('homeLineup').optional().isArray(),
            body('awayLineup').optional().isArray()
        ]),
        // This calls our overridden update that uses $push for events.
        scoreboardController.update
    )
    .delete(scoreboardController.delete);

// Results Routes
router.route('/results')
    .get(resultController.getAll)
    .post(
        validateRequest([
            body('fixture').isMongoId(),
            body('score.home').isInt(),
            body('score.away').isInt()
        ]),
        resultController.create
    );

router.route('/results/:id')
    .get(resultController.getById)
    .put(resultController.update)
    .delete(resultController.delete);

// League Table Routes
router.route('/tables')
    .get(tableController.getAll)
    .post(
        validateRequest([
            body('tournament').isMongoId(),
            body('team').isMongoId()
        ]),
        tableController.create
    );

router.route('/tables/:id')
    .get(tableController.getById)
    .put(tableController.update)
    .delete(tableController.delete);

// Content Management Routes (Stories)
router.route('/stories')
    .get(storyController.getAll)
    .post(
        validateRequest([body('title').notEmpty()]),
        storyController.create
    );

router.route('/stories/:id')
    .get(storyController.getById)
    .put(storyController.update)
    .delete(storyController.delete);

// Content Management Routes (Gallery)
router.route('/gallery')
    .get(galleryController.getAll)
    .post(
        validateRequest([body('title').notEmpty()]),
        galleryController.create
    );

router.route('/gallery/:id')
    .get(galleryController.getById)
    .put(galleryController.update)
    .delete(galleryController.delete);

// League Management Routes
router.route('/leagues')
    .get(leagueController.getAll)
    .post(
        validateRequest([body('name').notEmpty()]),
        leagueController.create
    );

router.route('/leagues/:id')
    .get(leagueController.getById)
    .put(leagueController.update)
    .delete(leagueController.delete);

// Error Handling Middleware
router.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' ? 'Server Error' : err.message;

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            errors: Object.values(err.errors).map(e => ({ msg: e.message }))
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            errors: [{ msg: 'Invalid ID format' }]
        });
    }

    if (err.name === 'MongoServerError' && err.code === 11000) {
        return res.status(400).json({
            errors: [{ msg: 'Duplicate field value' }]
        });
    }

    res.status(statusCode).json({ error: message });
});

export default router;
