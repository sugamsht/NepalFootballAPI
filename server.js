// server.js
import express from 'express';
import { createServer } from 'http';
import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js'; // Adjust path if needed
import passport from './config/passport.js'; // Import configured passport
import configureExpress from './config/express.js';
import routes from './config/routes.js';// Import your routes
import cors from 'cors'; // Import cors

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const MONGODB_URI = process.env.MONGODB_URL;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5000'; // Replace with your frontend URL

mongoose.set('strictQuery', true);
process.setMaxListeners(20); // Review if this is necessary

const app = express();
const server = createServer(app);

const corsOptions = {
  origin: FRONTEND_URL, // Use an array of allowed origins in production
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Include OPTIONS
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Credentials'], // Include Credentials
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions)); // Use CORS middleware
app.options('*', cors(corsOptions)); // Handle preflight requests

// Serve static files from the 'public' directory
app.use(express.static(join(__dirname, 'public')));

const connectDB = async () => {
  try {
    const options = {
      keepAlive: true,
      maxPoolSize: 10,  // Adjust based on your needs
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000, // Adjust based on your needs
    };

    mongoose.connect(MONGODB_URI, options);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1); // Exit process on db connection failure
  }
};

const loadModels = async () => {
  try {
    const modelsPath = join(__dirname, 'app/models');
    const files = fs.readdirSync(modelsPath).filter(file => file.endsWith('.js'));

    for (const file of files) {
      try {
        const module = await import(pathToFileURL(join(modelsPath, file)).href);
        if (module.default && typeof module.default === 'function') {
          module.default();
        }
      } catch (error) {
        logger.error(`Error loading model ${file}:`, error);
      }
    }
  } catch (err) {
    logger.error("Error reading models directory:", err);
    process.exit(1);
  }
};


const initializeApp = async () => {
  try {
    await connectDB();
    await loadModels();

    configureExpress(app, passport); // Pass passport instance

    app.use(routes); // Use your routes (AFTER configureExpress)

    if (NODE_ENV !== 'test') {
      server.listen(PORT, () => {
        logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
      });
    }

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);

  } catch (error) {
    logger.error('Application initialization failed:', error);
    process.exit(1);
  }
};

const gracefulShutdown = () => {
  logger.info('Shutting down gracefully...');

  server.close(async () => {
    logger.info('Server closed');
    try {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');
      process.exit(0);
    } catch (error) {
      logger.error('Error closing MongoDB connection:', error);
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error('Force shutdown after timeout');
    process.exit(1);
  }, 10000); // 10-second timeout
};

initializeApp();

export { app, server };