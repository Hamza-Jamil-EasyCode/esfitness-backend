import { Request, Response } from 'express';
import * as PlanService from './plan.service';
import CustomError from '../../utils/custom-error';
import { formatResponse } from '../../utils/helpers';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from './plan.messages';

const getPlans = async (req: Request, res: Response) => {
    const plans = await PlanService.getAllPlans();
    res.status(200).json(formatResponse(true, SUCCESS_MESSAGES.PLANS_RETRIEVED, plans));
};

const getPlanById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const plan = await PlanService.getPlanById(id);
    if (!plan) {
        throw new CustomError(ERROR_MESSAGES.PLAN_ID_NOT_FOUND(id), 404);
    }
    res.status(200).json(formatResponse(true, SUCCESS_MESSAGES.PLAN_RETRIEVED, plan));
};

const createPlan = async (req: Request, res: Response) => {
    const { ...planData } = req.body;
    const newPlan = await PlanService.createPlan({ ...planData });
    res.status(201).json(formatResponse(true, SUCCESS_MESSAGES.PLAN_CREATED, newPlan));
};

const updatePlan = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { ...updatedData } = req.body;
    const updatedPlan = await PlanService.updatePlan(id, { ...updatedData });
    if (!updatedPlan) {
        throw new CustomError(ERROR_MESSAGES.PLAN_ID_NOT_FOUND(id), 404);
    }
    res.status(200).json(formatResponse(true, SUCCESS_MESSAGES.PLAN_UPDATED, updatedPlan));
};

const deletePlan = async (req: Request, res: Response) => {
    const { id } = req.params;
    const deleted = await PlanService.deletePlan(id);
    if (!deleted) {
        throw new CustomError(ERROR_MESSAGES.PLAN_ID_NOT_FOUND(id), 404);
    }
    res.status(200).json(formatResponse(true, SUCCESS_MESSAGES.PLAN_DELETED));
};

const seedPlans = async (req: Request, res: Response) => {
    await PlanService.seedDefaultPlans();
    res.status(200).json(formatResponse(true, SUCCESS_MESSAGES.PLAN_SEEDED));
};

export { getPlans, getPlanById, createPlan, updatePlan, deletePlan, seedPlans };
