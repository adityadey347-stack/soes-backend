import { body } from 'express-validator';

/**
 * Validation Rules for Creating Exam
 */
export const createExamValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Exam title is required')
        .isLength({ max: 100 })
        .withMessage('Title cannot exceed 100 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),

    body('duration')
        .notEmpty()
        .withMessage('Duration is required')
        .isInt({ min: 1 })
        .withMessage('Duration must be at least 1 minute'),

    body('totalMarks')
        .notEmpty()
        .withMessage('Total marks is required')
        .isInt({ min: 1 })
        .withMessage('Total marks must be at least 1'),

    body('passingMarks')
        .notEmpty()
        .withMessage('Passing marks is required')
        .isInt({ min: 0 })
        .withMessage('Passing marks must be a positive number'),
];

/**
 * Validation Rules for Adding Questions
 */
export const addQuestionsValidation = [
    body('questions')
        .isArray({ min: 1 })
        .withMessage('Questions must be a non-empty array'),

    body('questions.*.questionText')
        .trim()
        .notEmpty()
        .withMessage('Question text is required'),

    body('questions.*.options')
        .isArray({ min: 4, max: 4 })
        .withMessage('Exactly 4 options are required'),

    body('questions.*.correctAnswer')
        .notEmpty()
        .withMessage('Correct answer is required')
        .isInt({ min: 0, max: 3 })
        .withMessage('Correct answer must be between 0 and 3'),

    body('questions.*.marks')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Marks must be at least 1'),
];
