import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema
 * Stores both Admin and Student users with role-based differentiation
 */
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true,
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email',
            ],
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false, // Don't return password by default in queries
        },
        role: {
            type: String,
            enum: ['admin', 'student'],
            default: 'student',
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

/**
 * Pre-save Middleware
 * Hash password before saving to database
 */
userSchema.pre('save', async function (next) {
    // Only hash password if it's modified or new
    if (!this.isModified('password')) {
        next();
    }

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Instance Method
 * Compare entered password with hashed password in database
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
