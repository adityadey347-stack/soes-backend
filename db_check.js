import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/db.js';
import Exam from './models/Exam.js';

const check = async () => {
    try {
        await connectDB();
        const exams = await Exam.find({});
        console.log('--- EXAMS IN DB ---');
        console.log(JSON.stringify(exams, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Check failed:', error);
        process.exit(1);
    }
};

check();
