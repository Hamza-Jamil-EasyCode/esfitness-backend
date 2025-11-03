import config from '../config/default';

const resetPasswordTemplate = (token: string) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your Password</title>
    </head>
    <body>
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>You are receiving this email because you (or someone else) have requested the reset of a password.</p>
        <p>Please click on the following link, or paste this into your browser to complete the process:</p>
        <a href="${config.clientUrl}/reset-password?token=${token}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px;">Reset Password</a>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <p>This reset password token is valid for only 1 hour.</p>
        <p>Thanks,</p>
        <p>Your Company</p>
      </div>
    </body>
    </html>
  `;
};

export { resetPasswordTemplate };
