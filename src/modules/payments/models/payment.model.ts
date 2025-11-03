import mongoose, { Schema, Document } from 'mongoose';
import { PaymentStatus, PaymentType } from '../payment.constants';

interface Payment extends Document {
    userId: mongoose.Types.ObjectId;
    subscriptionId?: mongoose.Types.ObjectId | null | string;
    stripePaymentIntentId: string;
    stripeChargeId?: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    paymentType: PaymentType;
    description?: string;
    metadata?: Record<string, unknown>;
    failureReason?: string;
    refundedAmount?: number;
    processedAt?: Date;
    isDeleted: boolean;
    deletedAt?: Date;
}

const PaymentSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
        stripePaymentIntentId: { type: String, required: true, unique: true },
        stripeChargeId: { type: String },
        amount: { type: Number, required: true, min: 0 },
        currency: { type: String, required: true, uppercase: true, default: 'USD' },
        status: { type: String, enum: Object.values(PaymentStatus), required: true },
        paymentType: { type: String, enum: Object.values(PaymentType), required: true },
        description: { type: String },
        metadata: { type: Schema.Types.Mixed },
        failureReason: { type: String },
        refundedAmount: { type: Number, min: 0, default: 0 },
        processedAt: { type: Date },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date, default: null }
    },
    { timestamps: true }
);

// Indexes for efficient queries
PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ stripePaymentIntentId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ subscriptionId: 1 });
PaymentSchema.index({ createdAt: -1 });

const PaymentModel = mongoose.model<Payment>('Payment', PaymentSchema);

export { PaymentModel, Payment };
