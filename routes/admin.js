import express from 'express';
import {
    createExam,
    addQuestions,
    getAllExams,
    getExamById,
    getAllResults,
    getExamResults,
    deleteExam,
    updateExam,
    deleteQuestion,
} from '../controllers/adminController.js';
import {
    createExamValidation,
    addQuestionsValidation,
} from '../utils/examValidators.js';
import { validate } from '../utils/validators.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

// All routes are protected and only accessible by admins
// Apply protect and authorize middleware to all routes
router.use(protect);
router.use(authorize('admin'));

/**
 * @route   POST /api/admin/exam/create
 * @desc    Create a new exam
 * @access  Private/Admin
 */
router.post('/exam/create', createExamValidation, validate, createExam);

/**
 * @route   POST /api/admin/exam/:examId/questions
 * @desc    Add questions to an exam
 * @access  Private/Admin
 */
router.post('/exam/:examId/questions', addQuestionsValidation, validate, addQuestions);

/**
 * @route   GET /api/admin/exams
 * @desc    Get all exams
 * @access  Private/Admin
 */
router.get('/exams', getAllExams);

/**
 * @route   GET /api/admin/exam/:examId
 * @desc    Get a single exam with questions
 * @access  Private/Admin
 */
router.get('/exam/:examId', getExamById);

/**
 * @route   PUT /api/admin/exam/:examId
 * @desc    Update exam details
 * @access  Private/Admin
 */
router.put('/exam/:examId', updateExam);

/**
 * @route   DELETE /api/admin/exam/:examId
 * @desc    Delete an exam
 * @access  Private/Admin
 */
router.delete('/exam/:examId', deleteExam);

/**
 * @route   GET /api/admin/results
 * @desc    Get all student results
 * @access  Private/Admin
 */
router.get('/results', getAllResults);

/**
 * @route   GET /api/admin/exam/:examId/results
 * @desc    Get results for a specific exam
 * @access  Private/Admin
 */
router.get('/exam/:examId/results', getExamResults);

/**
 * @route   DELETE /api/admin/question/:questionId
 * @desc    Delete a question
 * @access  Private/Admin
 */
router.delete('/question/:questionId', deleteQuestion);

export default router;
