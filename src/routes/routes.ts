import { Express } from 'express';
import userRouter from '../modules/user/user.routes';
import mediaRouter from '../modules/media/media.routes';
import planRouter from '../modules/plans/plan.routes';
import subscriptionRouter from '../modules/subscriptions/subscription.routes';
import paymentRouter from '../modules/payments/payment.routes';
import config from '../config/default';

const registerRoutes = (app: Express) => {
    // Route to Ping & check if Server is online
    app.get(`${config.baseRoute}/ping`, (req, res) => {
        res.status(200).send('OK');
    });

    app.use(`${config.baseRoute}/users`, userRouter);
    app.use(`${config.baseRoute}/media`, mediaRouter);
    app.use(`${config.baseRoute}/plans`, planRouter);
    app.use(`${config.baseRoute}/subscriptions`, subscriptionRouter);
    app.use(`${config.baseRoute}/payments`, paymentRouter);
};

export default registerRoutes;
