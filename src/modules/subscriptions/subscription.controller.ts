import { Request, Response } from 'express';
import * as SubscriptionService from './subscription.service';
import CustomError from '../../utils/custom-error';
import { formatResponse } from '../../utils/helpers';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from './subscription.messages';
import { UserRole } from '../user/user.constants';
import { JwtPayload } from 'jsonwebtoken';

const getSubscriptions = async (req: Request, res: Response) => {
    const currentUser = req.user as JwtPayload;

    let subscriptions;
    if (currentUser.role === UserRole.ADMIN) {
        subscriptions = await SubscriptionService.getAllSubscriptions();
    } else {
        subscriptions = await SubscriptionService.getSubscriptionsByUserId(currentUser.id);
    }

    res.status(200).json(formatResponse(true, SUCCESS_MESSAGES.SUBSCRIPTIONS_RETRIEVED, subscriptions));
};

const getSubscriptionById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const currentUser = req.user as JwtPayload;

    const subscription = await SubscriptionService.getSubscriptionById(id);
    if (!subscription) {
        throw new CustomError(ERROR_MESSAGES.SUBSCRIPTION_ID_NOT_FOUND(id), 404);
    }

    // Check if user is authorized to view this subscription
    if (currentUser.role !== UserRole.ADMIN && subscription.userId.toString() !== currentUser.id) {
        throw new CustomError(ERROR_MESSAGES.SUBSCRIPTION_NOT_AUTHORIZED_VIEW, 403);
    }

    res.status(200).json(formatResponse(true, SUCCESS_MESSAGES.SUBSCRIPTION_RETRIEVED, subscription));
};

const createSubscription = async (req: Request, res: Response) => {
    const currentUser = req.user as JwtPayload;
    const { planId, billingCycle, paymentMethodId, trialDays } = req.body;

    const newSubscription = await SubscriptionService.createSubscription({
        userId: currentUser.id,
        planId,
        billingCycle,
        paymentMethodId,
        trialDays
    });

    res.status(201).json(formatResponse(true, SUCCESS_MESSAGES.SUBSCRIPTION_CREATED, newSubscription));
};

const updateSubscription = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { ...updatedData } = req.body;
    const currentUser = req.user as JwtPayload;

    // Get subscription to check ownership
    const subscription = await SubscriptionService.getSubscriptionById(id);
    if (!subscription) {
        throw new CustomError(ERROR_MESSAGES.SUBSCRIPTION_ID_NOT_FOUND(id), 404);
    }

    // Check if user is authorized to update this subscription
    if (currentUser.role !== UserRole.ADMIN && subscription.userId.toString() !== currentUser.id) {
        throw new CustomError(ERROR_MESSAGES.SUBSCRIPTION_NOT_AUTHORIZED_UPDATE, 403);
    }

    const updatedSubscription = await SubscriptionService.updateSubscription(id, { ...updatedData });
    if (!updatedSubscription) {
        throw new CustomError(ERROR_MESSAGES.SUBSCRIPTION_ID_NOT_FOUND(id), 404);
    }

    res.status(200).json(formatResponse(true, SUCCESS_MESSAGES.SUBSCRIPTION_UPDATED, updatedSubscription));
};

const cancelSubscription = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { cancelAtPeriodEnd = true } = req.body;
    const currentUser = req.user as JwtPayload;

    // Get subscription to check ownership
    const subscription = await SubscriptionService.getSubscriptionById(id);
    if (!subscription) {
        throw new CustomError(ERROR_MESSAGES.SUBSCRIPTION_ID_NOT_FOUND(id), 404);
    }

    // Check if user is authorized to cancel this subscription
    if (currentUser.role !== UserRole.ADMIN && subscription.userId.toString() !== currentUser.id) {
        throw new CustomError(ERROR_MESSAGES.SUBSCRIPTION_NOT_AUTHORIZED_CANCEL, 403);
    }

    const canceledSubscription = await SubscriptionService.cancelSubscription(id, cancelAtPeriodEnd);

    res.status(200).json(formatResponse(true, SUCCESS_MESSAGES.SUBSCRIPTION_CANCELED, canceledSubscription));
};

export { getSubscriptions, getSubscriptionById, createSubscription, updateSubscription, cancelSubscription };
