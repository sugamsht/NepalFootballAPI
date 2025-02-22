import express from 'express';
import { login, live, settings } from '../app/controllers/home.js';
import { model } from 'mongoose';
import passport from 'passport';
import bcrypt from 'bcrypt';
import apiRouter from './api.js';

const router = express.Router();
const User = model('User');

// Middleware to check if user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Home page route
router.get('/', ensureAuthenticated, (req, res) => {
  res.render('home/index', {
    username: req.user ? req.user.username : null,
    isActive: (path) => req.originalUrl === path // Pass isActive function
  });
});

// Live page route
router.get('/live', ensureAuthenticated, (req, res) => {
  res.render('home/live', {
    username: req.user ? req.user.username : null,
    isActive: (path) => req.originalUrl === path // Pass isActive function
  });
});

// Route for the combined login/registration page (GET /login)
router.get('/login', login); // Your existing login controller

// API routes with CORS headers
router.use('/api', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5000');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
}, apiRouter);

// Registration route (POST /register)
router.post('/register', async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    const existingUser = await User.findOne({ username: req.body.username });

    if (existingUser) {
      console.log(existingUser, "Already exists");
      req.flash('error', 'Username already exists'); // Use flash messages for errors
      return res.redirect('/login'); // Redirect back to login/registration form
    }

    const newUser = await User.create({ username: req.body.username, password: hashedPassword });
    console.log("User registered successfully");

    req.login(newUser, (err) => { // Log in after successful registration
      if (err) return next(err);
      return res.redirect('/');
    });

  } catch (err) {
    console.error("Error during registration:", err);
    return next(err);
  }
});

// Login route (POST /login)
router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: true, // Enable flash messages for login errors
  successRedirect: '/' // Redirect to / after successful login
}));


// Logout route
router.post('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

// Settings route
router.get('/settings', ensureAuthenticated, settings);

// Centralized error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.message && (err.message.includes('not found') || err.message.includes('Cast to ObjectId failed'))) {
    return next(); // Pass 404 errors to the 404 handler
  }

  res.status(500).render('500', {
    error: err,  // Pass the error object itself
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred.'
  });
});

// 404 handler (must be defined AFTER all other routes)
router.use((req, res) => {
  res.status(404).render('404', {
    url: req.originalUrl,
    message: 'Not Found'
  });
});

export default router;