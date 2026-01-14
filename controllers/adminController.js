import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import Result from '../models/Result.js';
import Attempt from '../models/Attempt.js';

/**
 * @desc    Create a new exam
 * @route   POST /api/admin/exam/create
 * @access  Private/Admin
 */
export const createExam = async (req, res) => {
    try {
        const { title, description, duration, totalMarks, passingMarks } = req.body;

        // Create exam with admin's ID
        const exam = await Exam.create({
            title,
            description,
            duration,
            totalMarks,
            passingMarks,
            createdBy: req.user._id,
        });

        res.status(201).json({
            success: true,
            message: 'Exam created successfully',
            data: exam,
        });
    } catch (error) {
        console.error('Create exam error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating exam',
            error: error.message,
        });
    }
};

/**
 * @desc    Add questions to an exam
 * @route   POST /api/admin/exam/:examId/questions
 * @access  Private/Admin
 */
export const addQuestions = async (req, res) => {
    try {
        const { examId } = req.params;
        const { questions } = req.body; // Array of questions

        // Verify exam exists
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found',
            });
        }

        // Validate that questions is an array
        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an array of questions',
            });
        }

        // Add examId to each question
        const questionsWithExamId = questions.map(q => ({
            ...q,
            examId,
        }));

        // Insert questions
        const createdQuestions = await Question.insertMany(questionsWithExamId);

        // Update exam's question count
        exam.questionCount = await Question.countDocuments({ examId });
        await exam.save();

        res.status(201).json({
            success: true,
            message: `${createdQuestions.length} questions added successfully`,
            data: {
                exam,
                questionsAdded: createdQuestions.length,
                totalQuestions: exam.questionCount,
            },
        });
    } catch (error) {
        console.error('Add questions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error adding questions',
            error: error.message,
        });
    }
};

/**
 * @desc    Get all exams
 * @route   GET /api/admin/exams
 * @access  Private/Admin
 */
export const getAllExams = async (req, res) => {
    try {
        const exams = await Exam.find()
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: exams.length,
            data: exams,
        });
    } catch (error) {
        console.error('Get all exams error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching exams',
            error: error.message,
        });
    }
};

/**
 * @desc    Get a single exam with questions
 * @route   GET /api/admin/exam/:examId
 * @access  Private/Admin
 */
export const getExamById = async (req, res) => {
    try {
        const { examId } = req.params;

        const exam = await Exam.findById(examId).populate('createdBy', 'name email');

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found',
            });
        }

        // Get all questions for this exam
        const questions = await Question.find({ examId });

        res.status(200).json({
            success: true,
            data: {
                exam,
                questions,
            },
        });
    } catch (error) {
        console.error('Get exam by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching exam',
            error: error.message,
        });
    }
};

/**
 * @desc    Get all results (all students, all exams)
 * @route   GET /api/admin/results
 * @access  Private/Admin
 */
export const getAllResults = async (req, res) => {
    try {
        const results = await Result.find()
            .populate('studentId', 'name email')
            .populate('examId', 'title totalMarks')
            .sort({ submittedAt: -1 });

        res.status(200).json({
            success: true,
            count: results.length,
            data: results,
        });
    } catch (error) {
        console.error('Get all results error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching results',
            error: error.message,
        });
    }
};

/**
 * @desc    Get results for a specific exam
 * @route   GET /api/admin/exam/:examId/results
 * @access  Private/Admin
 */
export const getExamResults = async (req, res) => {
    try {
        const { examId } = req.params;

        // Verify exam exists
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found',
            });
        }

        const results = await Result.find({ examId })
            .populate('studentId', 'name email')
            .sort({ score: -1 }); // Sort by highest score

        res.status(200).json({
            success: true,
            exam: {
                title: exam.title,
                totalMarks: exam.totalMarks,
            },
            count: results.length,
            data: results,
        });
    } catch (error) {
        console.error('Get exam results error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching exam results',
            error: error.message,
        });
    }
};

/**
 * @desc    Delete an exam and its questions
 * @route   DELETE /api/admin/exam/:examId
 * @access  Private/Admin
 */
export const deleteExam = async (req, res) => {
    try {
        const { examId } = req.params;

        const exam = await Exam.findById(examId);

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found',
            });
        }

        // Delete all questions associated with this exam
        await Question.deleteMany({ examId });

        // Delete all attempts for this exam
        await Attempt.deleteMany({ examId });

        // Delete all results for this exam
        await Result.deleteMany({ examId });

        // Delete the exam
        await Exam.findByIdAndDelete(examId);

        res.status(200).json({
            success: true,
            message: 'Exam and associated data deleted successfully',
        });
    } catch (error) {
        console.error('Delete exam error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting exam',
            error: error.message,
        });
    }
};

/**
 * @desc    Update exam details
 * @route   PUT /api/admin/exam/:examId
 * @access  Private/Admin
 */
export const updateExam = async (req, res) => {
    try {
        const { examId } = req.params;
        const { title, description, duration, totalMarks, passingMarks, isActive } = req.body;

        const exam = await Exam.findById(examId);

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found',
            });
        }

        // Update fields
        if (title) exam.title = title;
        if (description !== undefined) exam.description = description;
        if (duration) exam.duration = duration;
        if (totalMarks) exam.totalMarks = totalMarks;
        if (passingMarks) exam.passingMarks = passingMarks;
        if (isActive !== undefined) exam.isActive = isActive;

        await exam.save();

        res.status(200).json({
            success: true,
            message: 'Exam updated successfully',
            data: exam,
        });
    } catch (error) {
        console.error('Update exam error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating exam',
            error: error.message,
        });
    }
};

/**
 * @desc    Delete a question
 * @route   DELETE /api/admin/question/:questionId
 * @access  Private/Admin
 */
export const deleteQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;

        const question = await Question.findById(questionId);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found',
            });
        }

        const examId = question.examId;

        await Question.findByIdAndDelete(questionId);

        // Update exam's question count
        const exam = await Exam.findById(examId);
        if (exam) {
            exam.questionCount = await Question.countDocuments({ examId });
            await exam.save();
        }

        res.status(200).json({
            success: true,
            message: 'Question deleted successfully',
        });
    } catch (error) {
        console.error('Delete question error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting question',
            error: error.message,
        });
    }
};
