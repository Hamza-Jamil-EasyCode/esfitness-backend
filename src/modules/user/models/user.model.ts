import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '../user.constants';

interface User extends Document {
    name: string;
    email: string;
    password?: string; // Optional for third-party logins.
    contact?: string;
    role: UserRole; // User role.
    isVerified: boolean;
    isActive: boolean;
    isDeleted: boolean;
    deletedAt?: Date;
    stripeCustomerId?: string; // Stripe customer ID
    defaultCardId?: string; // Default Stripe payment method ID (card only)
}

// Add instance method for password comparison
declare module 'mongoose' {
    interface Document {
        matchPassword?(enteredPassword: string): Promise<boolean>;
    }
}

const UserSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, index: true },
        password: {
            type: String
        },
        contact: { type: String },
        role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
        isVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: false },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date, default: null },
        stripeCustomerId: { type: String }, // Stripe customer ID
        defaultCardId: { type: String } // Default Stripe payment method ID (card only)
    },
    { timestamps: true }
);

UserSchema.methods.matchPassword = async function (enteredPassword: string) {
    if (!enteredPassword || !this.password) {
        throw new Error('Missing data for password comparison');
    }
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt before saving
UserSchema.pre('save', async function (next: (err?: any) => void) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(String(this.password), salt);
    next();
});

// Encrypt password on update hooks
const hashPasswordOnUpdate = async function (this: any, next: (err?: any) => void) {
    const data = this.getUpdate();
    if (data && data.password) {
        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(String(data.password), salt);
        this.setUpdate(data);
    }
    next();
};

UserSchema.pre('updateOne', hashPasswordOnUpdate);
UserSchema.pre('findOneAndUpdate', hashPasswordOnUpdate);

const UserModel = mongoose.model<User>('User', UserSchema);

export { UserModel, User, UserRole };
