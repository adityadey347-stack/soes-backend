import mongoose from 'mongoose';

/**
 * Attempt Schema
 * Tracks exam attempts to prevent multiple submissions
 */
const attemptSchema = new mongoose.Schema(
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
        status: {
            type: String,
            enum: ['in-progress', 'completed'],
            default: 'in-progress',
        },
        startedAt: {
            type: Date,
            default: Date.now,
        },
        completedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure one attempt per student per exam
attemptSchema.index({ studentId: 1, examId: 1 }, { unique: true });

const Attempt = mongoose.model('Attempt', attemptSchema);

export default Attempt;
