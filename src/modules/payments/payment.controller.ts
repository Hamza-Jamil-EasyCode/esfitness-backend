import { Request, Response } from 'express';
import * as PaymentService from './payment.service';
import CustomError from '../../utils/custom-error';
import { formatResponse } from '../../utils/helpers';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from './payment.messages';
import { UserRole } from '../user/user.constants';
import { JwtPayload } from 'jsonwebtoken';
import Stripe from 'stripe';
import config from '../../config/default';

// Lazy initialize Stripe for webhook verification
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

const getPayments = async (req: Request, res: Response) => {
    const currentUser = req.user as JwtPayload;

    let payments;
    if (currentUser.role === UserRole.ADMIN) {
        payments = await PaymentService.getAllPayments();
    } else {
        payments = await PaymentService.getPaymentsByUserId(currentUser.id);
    }

    res.status(200).json(formatResponse(true, SUCCESS_MESSAGES.PAYMENTS_RETRIEVED, payments));
};

const getPaymentById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const currentUser = req.user as JwtPayload;

    const payment = await PaymentService.getPaymentById(id);
    if (!payment) {
        throw new CustomError(ERROR_MESSAGES.PAYMENT_ID_NOT_FOUND(id), 404);
    }

    // Check if user is authorized to view this payment
    if (currentUser.role !== UserRole.ADMIN && payment.userId.toString() !== currentUser.id) {
        throw new CustomError(ERROR_MESSAGES.PAYMENT_NOT_AUTHORIZED_VIEW, 403);
    }

    res.status(200).json(formatResponse(true, SUCCESS_MESSAGES.PAYMENT_RETRIEVED, payment));
};

// Stripe webhook handler
const handleWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = config.stripeWebhookSecret!;

    let event: Stripe.Event;

    try {
        // Verify webhook signature
        const stripeInstance = getStripeInstance();
        event = stripeInstance.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        throw new CustomError(ERROR_MESSAGES.WEBHOOK_SIGNATURE_INVALID, 400);
    }

    try {
        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                await PaymentService.handlePaymentSucceeded(paymentIntent);
                console.log('Payment succeeded:', paymentIntent.id);
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                await PaymentService.handlePaymentFailed(paymentIntent);
                console.log('Payment failed:', paymentIntent.id);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.status(200).json(formatResponse(true, SUCCESS_MESSAGES.WEBHOOK_PROCESSED));
    } catch (error) {
        console.error('Error processing webhook:', error);
        throw new CustomError(ERROR_MESSAGES.WEBHOOK_PROCESSING_ERROR, 500);
    }
};

export { getPayments, getPaymentById, handleWebhook };
