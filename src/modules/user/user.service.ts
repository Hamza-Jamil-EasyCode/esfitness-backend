import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import type { StringValue } from 'ms';

import CustomError from '../../utils/custom-error';
import config from '../../config/default';
import { User, UserModel } from './models';

// Get all users
const getAllUsers = async (): Promise<User[]> => {
    return await UserModel.find().select('-__v -password'); //selecting all fields except __v and password
};

// Get a user by ID
const getUserById = async (id: string): Promise<User | null> => {
    return await UserModel.findById(id);
};

// Get a user by Email
const getUserByEmail = async (email: string): Promise<any> => {
    return await UserModel.findOne({ email }).lean(false);
};

// Create a new user
const createUser = async (userData: Partial<User>): Promise<User> => {
    // No manual password hashing, handled by model hooks
    const user = new UserModel(userData);
    return await user.save();
};

// Update a user by ID
const updateUser = async (id: string, updatedData: Partial<User>): Promise<User | null> => {
    // No manual password hashing, handled by model hooks
    return await UserModel.findByIdAndUpdate(id, updatedData, { new: true });
};

// Delete a user by ID
const deleteUser = async (id: string): Promise<boolean> => {
    const result = await UserModel.findByIdAndDelete(id);
    return result !== null;
};

// Validate user credentials (email/password or third-party)
const validateUserCredentials = async (email: string, password?: string): Promise<User | null> => {
    const user = await getUserByEmail(email);
    if (!user) return null;
    if (password && user.password && user.matchPassword) {
        if (await user.matchPassword(password)) return user;
    }
    return null;
};

// Generate password reset token
const generateResetToken = async (email: string): Promise<string> => {
    const user = await UserModel.findOne({ email });
    if (!user) throw new CustomError(`User not found`, 404);
    return jwt.sign({ id: user.id }, config.jwtSecret!, { expiresIn: '15m' });
};

const generateAuthToken = (user: User, expiryTime: StringValue = '15m'): string => {
    const payload: { id: string; role?: string } = { id: String(user._id) };
    if (user.role) payload.role = user.role;
    return jwt.sign(payload, config.jwtSecret!, { expiresIn: expiryTime });
};

// Reset user password
const resetUserPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
        const decoded = jwt.verify(token, config.jwtSecret!) as JwtPayload;
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const user = await UserModel.findByIdAndUpdate(decoded.id as string, {
            password: hashedPassword
        });
        return user !== null;
    } catch {
        return false;
    }
};

export { getAllUsers, getUserById, getUserByEmail, createUser, updateUser, deleteUser, validateUserCredentials, generateResetToken, generateAuthToken, resetUserPassword };
