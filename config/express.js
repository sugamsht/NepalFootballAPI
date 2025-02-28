import express from 'express';
import session from 'express-session';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import helmet from 'helmet';
import MongoStore from 'connect-mongo';
import flash from 'connect-flash';
import winston from 'winston';
import helpers from 'view-helpers';
import { join } from 'path';
import dotenv from 'dotenv';
import { createRequire } from 'module';  // Added for JSON import

dotenv.config();

// Replace the static import with createRequire
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const configureExpress = (app, passport) => {
  const env = process.env.NODE_ENV || 'development';

  app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://code.jquery.com",
            "https://cdnjs.cloudflare.com",
            "https://stackpath.bootstrapcdn.com"
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://stackpath.bootstrapcdn.com",
            "https://fonts.googleapis.com"
          ],
          imgSrc: ["'self'", "data:"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          connectSrc: ["'self'"],
        },
      },
    })
  );

  app.use(compression({ threshold: 0 }));
  app.use(express.static(new URL('../public', import.meta.url).pathname));

  // Create a custom Winston logger with colorful, simple console logs
  const consoleFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(
      ({ timestamp, level, message }) => `${timestamp} ${level}: ${message.trim()}`
    )
  );

  const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  );

  const logger = winston.createLogger({
    level: 'info',
    transports: [
      new winston.transports.Console({ format: consoleFormat }),
      new winston.transports.File({ filename: 'logs/combined.log', format: fileFormat }),
    ],
  });

  // Use a simple morgan format and send output to our Winston logger
  if (env !== 'test') {
    app.use(
      morgan(env === 'production' ? 'combined' : 'tiny', {
        stream: { write: (message) => logger.info(message) },
      })
    );
  }

  app.set('views', join(process.cwd(), 'app', 'views'));
  app.set('view engine', 'pug');

  app.use((req, res, next) => {
    res.locals = {
      pkg,
      env,
      currentYear: new Date().getFullYear(),
      baseUrl: req.baseUrl,
    };
    next();
  });

  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(express.json({ limit: '10kb' }));
  app.use(methodOverride((req) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      const method = req.body._method;
      delete req.body._method;
      return method;
    }
  }));

  app.use(cookieParser());
  app.use(
    session({
      name: 'sessionId',
      secret: process.env.SESSION_SECRET || pkg.name,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URL,
        collectionName: 'sessions',
        ttl: 24 * 60 * 60,
        autoRemove: 'interval',
        autoRemoveInterval: 10 * 60,
      }),
      cookie: {
        secure: env === 'production',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());
  app.use(helpers(pkg.name));

  // Error handling middleware logs errors using our custom logger
  app.use((err, _req, res, _next) => {
    logger.error(err.stack);
    res.status(500).render('500', {
      error: err,
      message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred.',
    });
  });

  return app;
};

export default configureExpress;