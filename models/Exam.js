import mongoose from 'mongoose';

/**
 * Exam Schema
 * Stores exam information created by admins
 */
const examSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide exam title'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        duration: {
            type: Number,
            required: [true, 'Please provide exam duration in minutes'],
            min: [1, 'Duration must be at least 1 minute'],
        },
        totalMarks: {
            type: Number,
            required: [true, 'Please provide total marks'],
            min: [1, 'Total marks must be at least 1'],
        },
        passingMarks: {
            type: Number,
            required: [true, 'Please provide passing marks'],
            validate: {
                validator: function (value) {
                    return value <= this.totalMarks;
                },
                message: 'Passing marks cannot exceed total marks',
            },
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        questionCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Virtual populate questions
examSchema.virtual('questions', {
    ref: 'Question',
    localField: '_id',
    foreignField: 'examId',
});

// Enable virtual fields in JSON
examSchema.set('toJSON', { virtuals: true });
examSchema.set('toObject', { virtuals: true });

const Exam = mongoose.model('Exam', examSchema);

export default Exam;
