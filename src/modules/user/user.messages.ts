// Success messages for user module
export const SUCCESS_MESSAGES = {
    USERS_RETRIEVED: 'Users retrieved successfully',
    USER_RETRIEVED: 'User retrieved successfully',
    USER_CREATED: 'User created successfully',
    USER_UPDATED: 'User updated successfully',
    USER_DELETED: 'User deleted successfully',
    ACCOUNT_UPDATED: 'Account updated successfully',
    ACCOUNT_DELETED: 'Account deleted successfully',
    SIGNIN_SUCCESSFUL: 'Signin successful',
    PASSWORD_RESET_LINK_SENT: 'Password reset link sent to your email',
    PASSWORD_RESET_SUCCESS: 'Password reset successfully',
    EMAIL_VERIFICATION_SUCCESS: 'Email verified successfully',
    SIGNUP_SUCCESS: 'Signup successful. Please check your email to verify your account.',
    EVENT_SENT: 'Event sent successfully'
};

// Error messages for user module
export const ERROR_MESSAGES = {
    USER_NOT_FOUND: 'User not found',
    USER_ID_NOT_FOUND: (id: string) => `User with id ${id} not found`,
    INVALID_CREDENTIALS: 'Invalid credentials',
    INVALID_TOKEN: 'Invalid or expired token',
    VERIFICATION_TOKEN_REQUIRED: 'Verification token is required',
    EMAIL_SEND_FAILURE: 'Unable to send verification email',
    PASSWORD_RESET_EMAIL_FAILURE: 'Unable to send email',
    SOCKET_EVENT_FAILURE: 'Socket event could not be sent',
    USER_NOT_AUTHORIZED_UPDATE: 'You are not authorized to update this user',
    USER_NOT_AUTHORIZED_DELETE: 'You are not authorized to delete this user',
    USER_NOT_AUTHORIZED_VIEW: 'You are not authorized to view this user'
};
