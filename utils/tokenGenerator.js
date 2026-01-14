import jwt from 'jsonwebtoken';

/**
 * Generate JWT Token
 * @param {String} userId - User's MongoDB _id
 * @returns {String} - JWT token
 */
export const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '24h',
    });
};

/**
 * Verify JWT Token
 * @param {String} token - JWT token to verify
 * @returns {Object} - Decoded token payload
 */
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid token');
    }
};
