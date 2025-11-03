import mongoose, { Schema, Document } from 'mongoose';
import { SubscriptionStatus, BillingCycle } from '../subscription.constants';

interface Subscription extends Document {
    userId: mongoose.Types.ObjectId;
    planId: mongoose.Types.ObjectId;
    stripeSubscriptionId: string;
    stripeCustomerId: string;
    status: SubscriptionStatus;
    billingCycle: BillingCycle;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    canceledAt?: Date;
    cancelAtPeriodEnd: boolean;
    trialStart?: Date;
    trialEnd?: Date;
    metadata?: Record<string, any>;
    isDeleted: boolean;
    deletedAt?: Date;
}

const SubscriptionSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        planId: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
        stripeSubscriptionId: { type: String, required: true, unique: true },
        stripeCustomerId: { type: String, required: true },
        status: { type: String, enum: Object.values(SubscriptionStatus), required: true },
        billingCycle: { type: String, enum: Object.values(BillingCycle), required: true },
        currentPeriodStart: { type: Date, required: true },
        currentPeriodEnd: { type: Date, required: true },
        canceledAt: { type: Date },
        cancelAtPeriodEnd: { type: Boolean, default: false },
        trialStart: { type: Date },
        trialEnd: { type: Date },
        metadata: { type: Schema.Types.Mixed },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date, default: null }
    },
    { timestamps: true }
);

// Index for efficient queries
SubscriptionSchema.index({ userId: 1 });
SubscriptionSchema.index({ stripeSubscriptionId: 1 });
SubscriptionSchema.index({ status: 1 });

const SubscriptionModel = mongoose.model<Subscription>('Subscription', SubscriptionSchema);

export { SubscriptionModel, Subscription };
