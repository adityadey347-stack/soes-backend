import express from 'express';
import {
    register,
    login,
    getProfile,
    updateProfile,
    deleteAccount,
} from '../controllers/authController.js';
import {
    registerValidation,
    loginValidation,
    validate,
} from '../utils/validators.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Admin or Student)
 * @access  Public
 */
router.post('/register', registerValidation, validate, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get JWT token
 * @access  Public
 */
router.post('/login', loginValidation, validate, login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get logged-in user's profile
 * @access  Private (requires JWT token)
 */
router.get('/profile', protect, getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update logged-in user's profile
 * @access  Private (requires JWT token)
 */
router.put('/profile', protect, updateProfile);

/**
 * @route   DELETE /api/auth/profile
 * @desc    Delete logged-in user's account
 * @access  Private (requires JWT token)
 */
router.delete('/profile', protect, deleteAccount);

export default router;
