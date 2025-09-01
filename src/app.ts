// src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes";
import { notFoundHandler } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";

// Session management (custom, without cookies or express-session)
import { sessionActivity } from "./middlewares/sessionActivity"; 
import { requireToken } from "./middlewares/requireToken"; // Custom token validation

const app = express();
app.use(morgan("dev"));
// Use custom session token middleware (no express-session)
app.use(sessionActivity);  // Track session activity on each request

// Middleware to parse request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// Security middleware
app.use(helmet());

// HTTP request logging


// API Routes
app.use("/api", routes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
