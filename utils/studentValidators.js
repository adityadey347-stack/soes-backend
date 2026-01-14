import { body } from 'express-validator';

/**
 * Validation Rules for Submitting Exam
 */
export const submitExamValidation = [
    body('answers')
        .isArray({ min: 1 })
        .withMessage('Answers must be a non-empty array'),

    body('answers.*.questionId')
        .notEmpty()
        .withMessage('Question ID is required')
        .isMongoId()
        .withMessage('Invalid question ID'),

    body('answers.*.selectedAnswer')
        .notEmpty()
        .withMessage('Selected answer is required')
        .isInt({ min: 0, max: 3 })
        .withMessage('Selected answer must be between 0 and 3'),

    body('timeTaken')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Time taken must be a positive number'),
];
