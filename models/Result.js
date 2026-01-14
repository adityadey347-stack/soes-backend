import mongoose from 'mongoose';

/**
 * Result Schema
 * Stores student exam results and answers
 */
const resultSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        examId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exam',
            required: true,
        },
        score: {
            type: Number,
            required: true,
            min: 0,
        },
        totalMarks: {
            type: Number,
            required: true,
        },
        percentage: {
            type: Number,
            required: true,
        },
        passed: {
            type: Boolean,
            required: true,
        },
        answers: [
            {
                questionId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Question',
                },
                selectedAnswer: {
                    type: Number,
                    min: 0,
                    max: 3,
                },
                isCorrect: {
                    type: Boolean,
                },
                marksObtained: {
                    type: Number,
                    default: 0,
                },
            },
        ],
        timeTaken: {
            type: Number, // in seconds
        },
        submittedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for unique student-exam combination
resultSchema.index({ studentId: 1, examId: 1 });

const Result = mongoose.model('Result', resultSchema);

export default Result;
