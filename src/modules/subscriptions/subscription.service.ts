import Stripe from 'stripe';
import { Subscription, SubscriptionModel } from './models';
import { SubscriptionStatus, BillingCycle } from './subscription.constants';
import { PlanModel } from '../plans/models';
import { UserModel } from '../user/models';
import CustomError from '../../utils/custom-error';
import config from '../../config/default';

// Lazy initialize Stripe only when needed
let stripe: Stripe | null = null;

const getStripeInstance = (): Stripe => {
    if (!stripe) {
        if (!config.stripeSecretKey) {
            throw new CustomError('Stripe secret key not configured', 500);
        }
        stripe = new Stripe(config.stripeSecretKey, {
            apiVersion: '2025-10-29.clover'
        });
    }
    return stripe;
};

// Get all subscriptions
const getAllSubscriptions = async (): Promise<Subscription[]> => {
    return await SubscriptionModel.find({ isDeleted: false }).populate('userId', 'name email').populate('planId', 'name type price').select('-__v');
};

// Get subscriptions by user ID
const getSubscriptionsByUserId = async (userId: string): Promise<Subscription[]> => {
    return await SubscriptionModel.find({ userId, isDeleted: false }).populate('planId', 'name type price').select('-__v');
};

// Get a subscription by ID
const getSubscriptionById = async (id: string): Promise<Subscription | null> => {
    return await SubscriptionModel.findOne({ _id: id, isDeleted: false }).populate('userId', 'name email').populate('planId', 'name type price');
};

// Get subscription by Stripe subscription ID
const getSubscriptionByStripeId = async (stripeSubscriptionId: string): Promise<Subscription | null> => {
    return await SubscriptionModel.findOne({ stripeSubscriptionId, isDeleted: false }).populate('userId', 'name email').populate('planId', 'name type price');
};

// Create a new subscription with Stripe
const createSubscription = async (subscriptionData: { userId: string; planId: string; billingCycle: BillingCycle; paymentMethodId?: string; trialDays?: number }): Promise<Subscription> => {
    const { userId, planId, billingCycle, paymentMethodId, trialDays } = subscriptionData;

    // Verify user exists
    const user = await UserModel.findById(userId);
    if (!user) {
        throw new CustomError('User not found', 404);
    }

    // Verify plan exists
    const plan = await PlanModel.findById(planId);
    if (!plan) {
        throw new CustomError('Plan not found', 404);
    }

    // Check if user already has an active subscription
    const existingSubscription = await SubscriptionModel.findOne({
        userId,
        status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] },
        isDeleted: false
    });

    if (existingSubscription) {
        throw new CustomError('User already has an active subscription', 400);
    }

    // Create or get Stripe customer
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
        const stripeInstance = getStripeInstance();
        const customer = await stripeInstance.customers.create({
            email: user.email,
            name: user.name,
            metadata: { userId: userId }
        });
        stripeCustomerId = customer.id;

        // Update user with Stripe customer ID
        await UserModel.findByIdAndUpdate(userId, { stripeCustomerId });
    }

    // Attach payment method if provided
    if (paymentMethodId) {
        const stripeInstance = getStripeInstance();
        await stripeInstance.paymentMethods.attach(paymentMethodId, {
            customer: stripeCustomerId
        });

        // Set as default payment method
        await stripeInstance.customers.update(stripeCustomerId, {
            invoice_settings: {
                default_payment_method: paymentMethodId
            }
        });
    }

    // Create Stripe subscription
    const stripeSubscriptionData: Stripe.SubscriptionCreateParams = {
        customer: stripeCustomerId,
        items: [{ price: plan.stripePriceId! }],
        metadata: { userId, planId }
    };

    if (trialDays && trialDays > 0) {
        stripeSubscriptionData.trial_period_days = trialDays;
    }

    if (paymentMethodId) {
        stripeSubscriptionData.default_payment_method = paymentMethodId;
    }

    const subscriptionStartDate = Math.floor(Date.now() / 1000);
    let subscriptionEndDate = subscriptionStartDate;
    if (billingCycle === BillingCycle.YEARLY) {
        subscriptionEndDate = subscriptionStartDate + 365 * 24 * 60 * 60;
    } else {
        subscriptionEndDate = subscriptionStartDate + 30 * 24 * 60 * 60;
    }

    const stripeInstance = getStripeInstance();
    const stripeSubscription = (await stripeInstance.subscriptions.create(stripeSubscriptionData)) as Stripe.Subscription;

    // Create subscription record in our database
    const subscription = new SubscriptionModel({
        userId,
        planId,
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId,
        status: stripeSubscription.status as SubscriptionStatus,
        billingCycle,
        currentPeriodStart: subscriptionStartDate,
        currentPeriodEnd: subscriptionEndDate,
        trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : undefined,
        trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : undefined,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
    });

    return await subscription.save();
};

// Update a subscription
const updateSubscription = async (id: string, updatedData: Partial<Subscription>): Promise<Subscription | null> => {
    return await SubscriptionModel.findOneAndUpdate({ _id: id, isDeleted: false }, updatedData, { new: true }).populate('userId', 'name email').populate('planId', 'name type price');
};

// Cancel a subscription
const cancelSubscription = async (id: string, cancelAtPeriodEnd: boolean = true): Promise<Subscription | null> => {
    const subscription = await getSubscriptionById(id);
    if (!subscription) {
        throw new CustomError('Subscription not found', 404);
    }

    // Cancel in Stripe
    const stripeInstance = getStripeInstance();
    if (cancelAtPeriodEnd) {
        await stripeInstance.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: true
        });
    } else {
        await stripeInstance.subscriptions.cancel(subscription.stripeSubscriptionId);
    }

    // Update in our database
    const updateData: Partial<Subscription> = {
        cancelAtPeriodEnd,
        canceledAt: cancelAtPeriodEnd ? undefined : new Date()
    };

    if (!cancelAtPeriodEnd) {
        updateData.status = SubscriptionStatus.CANCELED;
    }

    return await updateSubscription(id, updateData);
};

export { getAllSubscriptions, getSubscriptionsByUserId, getSubscriptionById, getSubscriptionByStripeId, createSubscription, updateSubscription, cancelSubscription };
