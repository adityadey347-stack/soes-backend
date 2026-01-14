import express from 'express';
import {
    getAvailableExams,
    startExam,
    submitExam,
    getMyResults,
    getResultById,
    checkAttempt,
} from '../controllers/studentController.js';
import { submitExamValidation } from '../utils/studentValidators.js';
import { validate } from '../utils/validators.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

// All routes are protected and only accessible by students
router.use(protect);
router.use(authorize('student'));

/**
 * @route   GET /api/student/exams
 * @desc    Get all available exams
 * @access  Private/Student
 */
router.get('/exams', getAvailableExams);

/**
 * @route   GET /api/student/exam/:examId/start
 * @desc    Start an exam (get questions)
 * @access  Private/Student
 */
router.get('/exam/:examId/start', startExam);

/**
 * @route   POST /api/student/exam/:examId/submit
 * @desc    Submit exam answers
 * @access  Private/Student
 */
router.post('/exam/:examId/submit', submitExamValidation, validate, submitExam);

/**
 * @route   GET /api/student/results
 * @desc    Get student's own results
 * @access  Private/Student
 */
router.get('/results', getMyResults);

/**
 * @route   GET /api/student/result/:resultId
 * @desc    Get detailed result by ID
 * @access  Private/Student
 */
router.get('/result/:resultId', getResultById);

/**
 * @route   GET /api/student/check-attempt/:examId
 * @desc    Check if student has attempted an exam
 * @access  Private/Student
 */
router.get('/check-attempt/:examId', checkAttempt);

export default router;
