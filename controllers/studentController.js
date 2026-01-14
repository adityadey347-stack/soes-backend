import mongoose from 'mongoose';
import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import Result from '../models/Result.js';
import Attempt from '../models/Attempt.js';

/**
 * @desc    Get all active exams (for students to view)
 * @route   GET /api/student/exams
 * @access  Private/Student
 */
export const getAvailableExams = async (req, res) => {
    try {
        const exams = await Exam.find({ isActive: true })
            .select('title description duration totalMarks passingMarks questionCount createdAt')
            .sort({ createdAt: -1 });

        const examsWithAttemptStatus = await Promise.all(
            exams.map(async (exam) => {
                const attempt = await Attempt.findOne({
                    studentId: req.user._id,
                    examId: exam._id,
                });

                return {
                    ...exam.toObject(),
                    hasAttempted: !!attempt,
                    attemptStatus: attempt ? attempt.status : null,
                };
            })
        );

        res.status(200).json({
            success: true,
            count: examsWithAttemptStatus.length,
            data: examsWithAttemptStatus,
        });
    } catch (error) {
        console.error('Get available exams error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching exams',
            error: error.message,
        });
    }
};

/**
 * @desc    Start an exam (get questions without correct answers)
 * @route   GET /api/student/exam/:examId/start
 * @access  Private/Student
 */
export const startExam = async (req, res) => {
    console.log('--- startExam Debug Start ---');
    try {
        const { examId } = req.params;
        console.log('examId:', examId);

        // 1. Basic Validation
        if (!mongoose.Types.ObjectId.isValid(examId)) {
            console.error('ERROR: Invalid examId format:', examId);
            return res.status(400).json({
                success: false,
                message: 'Invalid exam ID format',
            });
        }

        if (!req.user || !req.user._id) {
            console.error('ERROR: req.user missing');
            return res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
        }

        const studentId = req.user._id;
        console.log('studentId:', studentId);

        // 2. Fetch Exam and Questions
        const exam = await Exam.findById(examId);
        if (!exam) {
            console.error('ERROR: Exam not found');
            return res.status(404).json({
                success: false,
                message: 'Exam not found',
            });
        }

        if (!exam.isActive) {
            console.error('ERROR: Exam not active');
            return res.status(400).json({
                success: false,
                message: 'This exam is not currently active',
            });
        }

        const questions = await Question.find({ examId }).select(
            'questionText options marks'
        );

        if (!questions || questions.length === 0) {
            console.error('ERROR: No questions found');
            return res.status(400).json({
                success: false,
                message: 'This exam has no questions yet',
            });
        }

        // 3. Handle Attempt (Find or Create)
        let attempt = await Attempt.findOne({ studentId, examId });
        let isResumed = false;

        if (attempt) {
            isResumed = true;
            console.log('INFO: Resuming existing attempt:', attempt._id);
        } else {
            try {
                console.log('INFO: Creating new attempt...');
                attempt = await Attempt.create({
                    studentId,
                    examId,
                    status: 'in-progress',
                    startedAt: new Date(),
                });
                console.log('INFO: New attempt created:', attempt._id);
            } catch (createError) {
                if (createError.code === 11000) {
                    console.warn('WARN: Race condition detected, fetching existing attempt...');
                    attempt = await Attempt.findOne({ studentId, examId });
                    if (!attempt) {
                        throw new Error('Race condition occurred but attempt could not be retrieved');
                    }
                    isResumed = true;
                } else {
                    console.error('ERROR: Failed to create attempt:', createError.message);
                    throw createError;
                }
            }
        }

        // 4. Send Success Response
        console.log('INFO: Sending success response');
        return res.status(200).json({
            success: true,
            message: isResumed ? 'Exam started successfully (resumed)' : 'Exam started successfully',
            data: {
                exam: {
                    _id: exam._id,
                    title: exam.title,
                    description: exam.description,
                    duration: exam.duration,
                    totalMarks: exam.totalMarks,
                    questionCount: questions.length,
                },
                questions: questions.map((q, index) => ({
                    _id: q._id,
                    questionNumber: index + 1,
                    questionText: q.questionText,
                    options: q.options,
                    marks: q.marks,
                })),
                attemptId: attempt._id,
                startedAt: attempt.startedAt,
                attemptStatus: attempt.status,
            },
        });

    } catch (error) {
        console.error('--- startExam CRITICAL ERROR ---');
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error starting exam',
            error: error.message,
            stack: error.stack
        });
    }
};

/**
 * @desc    Submit exam answers
 * @route   POST /api/student/exam/:examId/submit
 * @access  Private/Student
 */
export const submitExam = async (req, res) => {
    try {
        const { examId } = req.params;
        const { answers, timeTaken } = req.body;

        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found',
            });
        }

        const attempt = await Attempt.findOne({
            studentId: req.user._id,
            examId,
        });

        if (!attempt) {
            return res.status(400).json({
                success: false,
                message: 'No active attempt found for this exam',
            });
        }

        if (attempt.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'This exam has already been submitted',
            });
        }

        if (!Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                message: 'Answers must be an array',
            });
        }

        const questions = await Question.find({ examId });

        let score = 0;
        const evaluatedAnswers = [];

        for (const answer of answers) {
            const question = questions.find(
                (q) => q._id.toString() === answer.questionId
            );

            if (question) {
                const isCorrect = question.correctAnswer === answer.selectedAnswer;
                const marksObtained = isCorrect ? question.marks : 0;
                score += marksObtained;

                evaluatedAnswers.push({
                    questionId: question._id,
                    selectedAnswer: answer.selectedAnswer,
                    isCorrect,
                    marksObtained,
                });
            }
        }

        const percentage = (score / exam.totalMarks) * 100;
        const passed = score >= exam.passingMarks;

        const result = await Result.create({
            studentId: req.user._id,
            examId,
            score,
            totalMarks: exam.totalMarks,
            percentage: parseFloat(percentage.toFixed(2)),
            passed,
            answers: evaluatedAnswers,
            timeTaken,
        });

        attempt.status = 'completed';
        attempt.completedAt = new Date();
        await attempt.save();

        res.status(201).json({
            success: true,
            message: 'Exam submitted successfully',
            data: {
                score,
                totalMarks: exam.totalMarks,
                percentage: parseFloat(percentage.toFixed(2)),
                passed,
                passingMarks: exam.passingMarks,
                resultId: result._id,
            },
        });
    } catch (error) {
        console.error('Submit exam error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error submitting exam',
            error: error.message,
        });
    }
};

/**
 * @desc    Get student's own results
 * @route   GET /api/student/results
 * @access  Private/Student
 */
export const getMyResults = async (req, res) => {
    try {
        const results = await Result.find({ studentId: req.user._id })
            .populate('examId', 'title totalMarks passingMarks')
            .sort({ submittedAt: -1 });

        res.status(200).json({
            success: true,
            count: results.length,
            data: results,
        });
    } catch (error) {
        console.error('Get my results error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching results',
            error: error.message,
        });
    }
};

/**
 * @desc    Get detailed result for a specific exam
 * @route   GET /api/student/result/:resultId
 * @access  Private/Student
 */
export const getResultById = async (req, res) => {
    try {
        const { resultId } = req.params;

        const result = await Result.findById(resultId)
            .populate('examId', 'title totalMarks passingMarks')
            .populate('answers.questionId', 'questionText options correctAnswer');

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Result not found',
            });
        }

        if (result.studentId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            });
        }

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('Get result by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching result',
            error: error.message,
        });
    }
};

/**
 * @desc    Check if student has attempted an exam
 * @route   GET /api/student/check-attempt/:examId
 * @access  Private/Student
 */
export const checkAttempt = async (req, res) => {
    try {
        const { examId } = req.params;

        const attempt = await Attempt.findOne({
            studentId: req.user._id,
            examId,
        });

        res.status(200).json({
            success: true,
            data: {
                hasAttempted: !!attempt,
                attemptStatus: attempt ? attempt.status : null,
                startedAt: attempt ? attempt.startedAt : null,
            },
        });
    } catch (error) {
        console.error('Check attempt error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error checking attempt',
            error: error.message,
        });
    }
};
