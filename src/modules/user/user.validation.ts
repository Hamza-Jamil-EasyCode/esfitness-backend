import { z } from 'zod';
import { UserRole } from './user.constants';

const userRoleEnum = z.nativeEnum(UserRole);

const createUserSchema = z.object({
    body: z
        .object({
            name: z.string().min(1, 'Name is required'),
            email: z.string().email('Invalid email address'),
            password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
            googleId: z.string().optional(),
            facebookId: z.string().optional(),
            role: userRoleEnum.optional()
        })
        .refine((data) => data.password || data.googleId || data.facebookId, {
            message: 'Password, Google ID, or Facebook ID is required',
            path: ['password']
        })
});

const updateUserSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        email: z.string().email('Invalid email address').optional(),
        password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
        googleId: z.string().optional(),
        facebookId: z.string().optional(),
        role: userRoleEnum.optional()
    })
});

const updateAccountSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        email: z.string().email('Invalid email address').optional(),
        password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
        googleId: z.string().optional(),
        facebookId: z.string().optional()
    })
});

const getUserByIdSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'User ID is required')
    })
});

const deleteUserSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'User ID is required')
    })
});

const signinSchema = z.object({
    body: z
        .object({
            email: z.string().email('Invalid email address'),
            password: z.string().optional(),
            googleId: z.string().optional(),
            facebookId: z.string().optional()
        })
        .refine((data) => data.password || data.googleId || data.facebookId, {
            message: 'Password, Google ID, or Facebook ID is required',
            path: ['password']
        })
});

const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address')
    })
});

const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string().min(1, 'Token is required'),
        newPassword: z.string().min(6, 'New password must be at least 6 characters long')
    })
});

const verifyEmailSchema = z.object({
    query: z.object({
        token: z.string().min(1, 'Verification token is required')
    })
});

const socketDataSchema = z.object({
    body: z.object({
        eventName: z.string().min(1, 'Event name is required'),
        payload: z.any()
    })
});

export { createUserSchema, updateUserSchema, getUserByIdSchema, deleteUserSchema, signinSchema, forgotPasswordSchema, resetPasswordSchema, socketDataSchema, verifyEmailSchema, updateAccountSchema };
