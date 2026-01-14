console.log("SERVER FILE EXECUTING");
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import studentRoutes from './routes/student.js';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);

// Health check route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'SOES Backend API is running 🚀',
        version: '1.0.0',
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// Error Handler Middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

// Start server
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

export default connectDB;
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API URL: http://localhost:${PORT}`);
});
