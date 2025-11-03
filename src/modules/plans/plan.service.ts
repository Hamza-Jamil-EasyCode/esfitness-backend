import { Plan, PlanModel } from './models';
import { PlanType, PlanDuration, PlanStatus } from './plan.constants';

// Get all plans
const getAllPlans = async (): Promise<Plan[]> => {
    return await PlanModel.find({ isDeleted: false }).select('-__v');
};

// Get a plan by ID
const getPlanById = async (id: string): Promise<Plan | null> => {
    return await PlanModel.findOne({ _id: id, isDeleted: false });
};

// Get a plan by type and duration
const getPlanByTypeAndDuration = async (type: PlanType, duration: PlanDuration): Promise<Plan | null> => {
    return await PlanModel.findOne({ type, duration, isDeleted: false });
};

// Create a new plan
const createPlan = async (planData: Partial<Plan>): Promise<Plan> => {
    const plan = new PlanModel(planData);
    return await plan.save();
};

// Update a plan by ID
const updatePlan = async (id: string, updatedData: Partial<Plan>): Promise<Plan | null> => {
    return await PlanModel.findOneAndUpdate({ _id: id, isDeleted: false }, updatedData, { new: true });
};

// Soft delete a plan by ID
const deletePlan = async (id: string): Promise<boolean> => {
    const result = await PlanModel.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });
    return result !== null;
};

// Seed default plans
const seedDefaultPlans = async (): Promise<void> => {
    const defaultPlans = [
        {
            name: 'Basic Plan',
            type: PlanType.BASIC,
            description: 'Access to basic gym facilities',
            price: 29.99,
            currency: 'USD',
            duration: PlanDuration.MONTHLY,
            features: ['Gym access', 'Locker room access', 'Basic equipment'],
            status: PlanStatus.ACTIVE
        },
        {
            name: 'Standard Plan',
            type: PlanType.STANDARD,
            description: 'Access to gym facilities with group classes',
            price: 49.99,
            currency: 'USD',
            duration: PlanDuration.MONTHLY,
            features: ['Gym access', 'Locker room access', 'All equipment', 'Group classes', 'Personal trainer consultation'],
            status: PlanStatus.ACTIVE
        },
        {
            name: 'Premium Plan',
            type: PlanType.PREMIUM,
            description: 'Full access to all gym facilities and services',
            price: 79.99,
            currency: 'USD',
            duration: PlanDuration.MONTHLY,
            features: ['Gym access', 'Locker room access', 'All equipment', 'Group classes', 'Personal trainer sessions', 'Nutrition consultation', 'Premium amenities'],
            status: PlanStatus.ACTIVE
        }
    ];

    for (const planData of defaultPlans) {
        const existingPlan = await getPlanByTypeAndDuration(planData.type, planData.duration);
        if (!existingPlan) {
            await createPlan(planData);
        }
    }
};

export { getAllPlans, getPlanById, getPlanByTypeAndDuration, createPlan, updatePlan, deletePlan, seedDefaultPlans };
