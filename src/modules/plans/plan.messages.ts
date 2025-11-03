// Success messages for plan module
export const SUCCESS_MESSAGES = {
    PLANS_RETRIEVED: 'Plans retrieved successfully',
    PLAN_RETRIEVED: 'Plan retrieved successfully',
    PLAN_CREATED: 'Plan created successfully',
    PLAN_UPDATED: 'Plan updated successfully',
    PLAN_DELETED: 'Plan deleted successfully',
    PLAN_SEEDED: 'Plans seeded successfully'
};

// Error messages for plan module
export const ERROR_MESSAGES = {
    PLAN_NOT_FOUND: 'Plan not found',
    PLAN_ID_NOT_FOUND: (id: string) => `Plan with id ${id} not found`,
    PLAN_ALREADY_EXISTS: 'Plan already exists',
    PLAN_NOT_AUTHORIZED_UPDATE: 'You are not authorized to update this plan',
    PLAN_NOT_AUTHORIZED_DELETE: 'You are not authorized to delete this plan',
    PLAN_NOT_AUTHORIZED_VIEW: 'You are not authorized to view this plan',
    PLAN_SEED_FAILURE: 'Failed to seed plans'
};
