import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/db.js';
import User from './models/User.js';

const create = async () => {
    try {
        await connectDB();
        // Check if user exists
        const existingUser = await User.findOne({ email: 'test@student.com' });
        if (existingUser) {
            console.log('Test student already exists.');
            process.exit(0);
        }

        const user = await User.create({
            name: 'Test Student',
            email: 'test@student.com',
            password: 'password123', // User model should handle hashing
            role: 'student'
        });
        console.log('Test student created:', user.email);
        process.exit(0);
    } catch (error) {
        console.error('Creation failed:', error);
        process.exit(1);
    }
};

create();
