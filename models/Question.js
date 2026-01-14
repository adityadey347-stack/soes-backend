import mongoose from 'mongoose';

/**
 * Question Schema
 * Stores MCQ questions for each exam
 */
const questionSchema = new mongoose.Schema(
    {
        examId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exam',
            required: [true, 'Question must belong to an exam'],
        },
        questionText: {
            type: String,
            required: [true, 'Please provide question text'],
            trim: true,
        },
        options: {
            type: [String],
            required: [true, 'Please provide options'],
            validate: {
                validator: function (arr) {
                    return arr.length === 4;
                },
                message: 'Must provide exactly 4 options',
            },
        },
        correctAnswer: {
            type: Number,
            required: [true, 'Please provide correct answer index'],
            min: [0, 'Answer index must be between 0 and 3'],
            max: [3, 'Answer index must be between 0 and 3'],
        },
        marks: {
            type: Number,
            required: [true, 'Please provide marks for this question'],
            min: [1, 'Marks must be at least 1'],
            default: 1,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
questionSchema.index({ examId: 1 });

const Question = mongoose.model('Question', questionSchema);

export default Question;
