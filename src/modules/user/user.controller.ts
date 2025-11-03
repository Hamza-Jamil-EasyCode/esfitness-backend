import { Request, Response } from 'express';
import * as UserService from './user.service';
import CustomError from '../../utils/custom-error';
import { formatResponse, sendSocketEvent } from '../../utils/helpers';
import { sendEmail } from '../../utils/email-sender';
import { resetPasswordTemplate } from '../../static/email-templates';
import { UserRole } from './user.constants';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from './user.messages';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../../config/default';

const signup = async (req: Request, res: Response) => {
    const { ...userData } = req.body;
    const newUser = await UserService.createUser({ ...userData, role: UserRole.USER, isVerified: false });
    // Generate verification token (same logic as forgot password)
    const verificationToken = await UserService.generateAuthToken(newUser, '15m');
    const emailSent = await sendEmail(
        newUser.email,
        'Verify your email',
        `<p>Please verify your email by clicking <a href='${config.clientUrl}/verify-email?token=${verificationToken}'>here</a>.</p>`
    );
    if (!emailSent) {
        throw new CustomError(ERROR_MESSAGES.EMAIL_SEND_FAILURE, 500);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, __v, ...userWithoutSensitiveData } = newUser.toObject();
    res.status(201).json(formatResponse(true, SUCCESS_MESSAGES.SIGNUP_SUCCESS, userWithoutSensitiveData));
};

const getUsers = async (req: Request, res: Response) => {
    const users = await UserService.getAllUsers();
    res.status(200).json(formatResponse(true, SUCCESS_MESSAGES.USERS_RETRIEVED, users));
};

const getUserById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const currentUser = req.user as JwtPayload;
    // Only Admin/Super Admin can get any user, others can only get themselves
    if (![UserRole.ADMIN].includes(currentUser.role) && currentUser.id !== id) {
        throw new CustomError(ERROR_MESSAGES.USER_NOT_AUTHORIZED_UPDATE, 403);
    }
    const user = await UserService.getUserById(id);
    if (!user) {
        throw new CustomError(ERROR_MESSAGES.USER_ID_NOT_FOUND(id), 404);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, __v, ...userWithoutSensitiveData } = user.toObject();
    res.status(200).json(formatResponse(true, SUCCESS_MESSAGES.USER_RETRIEVED, userWithoutSensitiveData));
};

const createUser = async (req: Request, res: Response) => {
    const { ...userData } = req.body;
    const newUser = await UserService.createUser({ ...userData });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, __v, ...userWithoutSensitiveData } = newUser.toObject();
    res.status(201).json(formatResponse(true, SUCCESS_MESSAGES.USER_CREATED, userWithoutSensitiveData));
};

const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { ...updatedData } = req.body;
    const currentUser = req.user as JwtPayload;
    // Only Admin/Super Admin can update any user, others can only update themselves
    if (![UserRole.ADMIN].includes(currentUser.role) && currentUser.id !== id) {
        throw new CustomError(ERROR_MESSAGES.USER_NOT_AUTHORIZED_UPDATE, 403);
    }
    const updatedUser = await UserService.updateUser(id, { ...updatedData });
    if (!updatedUser) {
        throw new CustomError(ERROR_MESSAGES.USER_ID_NOT_FOUND(id), 404);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, __v, ...userWithoutSensitiveData } = updatedUser.toObject();
    res.status(200).json(formatResponse(true, SUCCESS_MESSAGES.USER_UPDATED, userWithoutSensitiveData));
};

const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const currentUser = req.user as JwtPayload;
    // Only Admin/Super Admin can delete any user, others can only delete themselves
    if (![UserRole.ADMIN].includes(currentUser.role) && currentUser.id !== id) {
        throw new CustomError(ERROR_MESSAGES.USER_NOT_AUTHORIZED_DELETE, 403);
    }
    const deleted = await UserService.deleteUser(id);
    if (!deleted) {
        throw new CustomError(ERROR_MESSAGES.USER_ID_NOT_FOUND(id), 404);
    }
    res.status(200).json(formatResponse(true, SUCCESS_MESSAGES.USER_DELETED));
};

const signin = async (req: Request, res: Response) => {
    const { email, password, googleId, facebookId } = req.body;
    const user = await UserService.validateUserCredentials(email, password, googleId, facebookId);
    if (!user) {
        throw new CustomError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }
    const token = await UserService.generateAuthToken(user, '7d');
    res.status(200).json(formatResponse(true, SUCCESS_MESSAGES.SIGNIN_SUCCESSFUL, { token }));
};

const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await UserService.getUserByEmail(email);
    if (!user) {
        throw new CustomError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }
    const resetToken = await UserService.generateAuthToken(user, '15m');
    const emailSent = await sendEmail(user.email, 'Password Reset', resetPasswordTemplate(resetToken));
    if (!emailSent) {
        throw new CustomError(ERROR_MESSAGES.PASSWORD_RESET_EMAIL_FAILURE, 500);
    }
    res.status(200).json(formatResponse(true, SUCCESS_MESSAGES.PASSWORD_RESET_LINK_SENT, { resetToken }));
};

const resetPassword = async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    const success = await UserService.resetUserPassword(token, newPassword);
    if (!success) {
        throw new CustomError(ERROR_MESSAGES.INVALID_TOKEN, 400);
    }
    res.status(200).json(formatResponse(true, SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS));
};

const sendSocketData = async (req: Request, res: Response) => {
    const { eventName, payload } = req.body;
    const isEventSent = await sendSocketEvent(eventName, payload);

    if (!isEventSent) {
        throw new CustomError(ERROR_MESSAGES.SOCKET_EVENT_FAILURE, 500);
    }
    res.status(200).json(formatResponse(true, SUCCESS_MESSAGES.EVENT_SENT));
};

const verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.query;
    const decoded = jwt.verify(token as string, config.jwtSecret!) as JwtPayload;
    const user = await UserService.updateUser(decoded.id, { isVerified: true });
    if (!user) {
        throw new CustomError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }
    res.status(200).json(formatResponse(true, SUCCESS_MESSAGES.EMAIL_VERIFICATION_SUCCESS));
};

export { getUsers, getUserById, createUser, updateUser, deleteUser, signin, forgotPassword, resetPassword, sendSocketData, signup, verifyEmail };
