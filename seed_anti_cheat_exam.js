import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/db.js';
import User from './models/User.js';
import Exam from './models/Exam.js';
import Question from './models/Question.js';

const seed = async () => {
    try {
        await connectDB();

        // Find or create test admin
        let admin = await User.findOne({ email: 'testadmin@example.com' });
        if (!admin) {
            admin = await User.create({
                name: 'Test Admin',
                email: 'testadmin@example.com',
                password: 'password123',
                role: 'admin'
            });
        }

        // Create Test Exam
        const exam = await Exam.create({
            title: 'Anti-Cheat Verification Exam',
            description: 'This exam is used to verify the anti-cheat features.',
            duration: 10,
            totalMarks: 10,
            passingMarks: 4,
            createdBy: admin._id,
            isActive: true,
            questionCount: 2
        });

        // Create Questions
        await Question.create([
            {
                examId: exam._id,
                questionText: 'What is the capital of France?',
                options: ['Paris', 'London', 'Berlin', 'Madrid'],
                correctAnswer: 0,
                marks: 5
            },
            {
                examId: exam._id,
                questionText: 'Which planet is known as the Red Planet?',
                options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
                correctAnswer: 1,
                marks: 5
            }
        ]);

        console.log('✅ Test exam and questions seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seed();
