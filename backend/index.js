import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import adminRoute from "./routes/admin.route.js";

dotenv.config({});

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOrigin = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];

const corsOptions = {
    origin: (origin, callback) => {
        // allow server-to-server requests or matching origin
        if (!origin || corsOrigin.includes(origin) || corsOrigin.includes('*')) {
            callback(null, true);
        } else {
            callback(null, true); // Permissive in dev for smooth pair programming
        }
    },
    credentials: true
};

app.use(cors(corsOptions));

// Health check
app.get("/api/v1/health", (req, res) => {
    return res.status(200).json({
        status: "healthy",
        app: "HireNexa API",
        database: mongoose.connection.name || "unknown",
        timestamp: new Date().toISOString()
    });
});

// API routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/admin", adminRoute);

// Global 404 handler for API routes
app.use("/api/*", (req, res) => {
    return res.status(404).json({
        message: `Endpoint ${req.originalUrl} not found.`,
        success: false
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack || err.message || err);
    return res.status(err.status || 500).json({
        message: err.message || "Internal server error occurred.",
        success: false
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    connectDB();
    console.log(`HireNexa Server running at port ${PORT}`);
});
