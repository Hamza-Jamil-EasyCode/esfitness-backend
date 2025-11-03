import mongoose, { Schema, Document } from 'mongoose';
import { PlanType, PlanStatus, PlanDuration } from '../plan.constants';

interface Plan extends Document {
    name: string;
    type: PlanType;
    description: string;
    price: number;
    currency: string;
    duration: PlanDuration;
    features: string[];
    status: PlanStatus;
    stripeProductId?: string;
    stripePriceId?: string;
    isDeleted: boolean;
    deletedAt?: Date;
}

const PlanSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        type: { type: String, enum: Object.values(PlanType), required: true, unique: true },
        description: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        currency: { type: String, default: 'USD', uppercase: true },
        duration: { type: String, enum: Object.values(PlanDuration), default: PlanDuration.MONTHLY },
        features: [{ type: String }],
        status: { type: String, enum: Object.values(PlanStatus), default: PlanStatus.ACTIVE },
        stripeProductId: { type: String },
        stripePriceId: { type: String },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date, default: null }
    },
    { timestamps: true }
);

// Compound index for type and duration to ensure unique plans per type per duration
PlanSchema.index({ type: 1, duration: 1 }, { unique: true });

const PlanModel = mongoose.model<Plan>('Plan', PlanSchema);

export { PlanModel, Plan };
