
const nodemailer = require('nodemailer');

// Initialize the transporter using SMTP settings from environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.warn('WARNING: Email transporter configuration is incorrect:', error.message);
  } else {
    console.log('Server is ready to send emails');
  }
});

const defaultFrom = process.env.EMAIL_FROM || '"CalmConnect AI" <noreply@calmconnect.ai>';

/**
 * Send account verification email
 */
exports.sendVerificationEmail = async (to, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: defaultFrom,
    to,
    subject: 'Verify Your Email Address - CalmConnect AI',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; border: 1px solid #eee; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #3b82f6; margin: 0;">CalmConnect AI</h1>
          <p style="color: #666;">Your Mental Health Companion</p>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px;">
          <h2 style="margin-top: 0;">Welcome!</h2>
          <p>Thank you for joining CalmConnect AI. To complete your registration and start your wellness journey, please verify your email address.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
          </div>
          <p style="font-size: 0.9em; color: #666;">This link will expire in 24 hours. If you did not create an account, you can safely ignore this email.</p>
        </div>
        <p style="font-size: 0.8em; color: #999; text-align: center; margin-top: 20px;">
          &copy; 2025 CalmConnect AI. All rights reserved.
        </p>
      </div>
    `,
    text: `Welcome to CalmConnect AI! Please verify your email address by visiting the following link: ${verificationUrl}`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email successfully sent to ${to}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Could not send verification email. Please try again later.');
  }
};

/**
 * Send password reset email
 */
exports.sendPasswordResetEmail = async (to, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: defaultFrom,
    to,
    subject: 'Password Reset Request - CalmConnect AI',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; border: 1px solid #eee; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #3b82f6; margin: 0;">CalmConnect AI</h1>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px;">
          <h2 style="margin-top: 0;">Password Reset</h2>
          <p>We received a request to reset the password for your CalmConnect AI account. Click the button below to choose a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 0.9em; color: #666;">This link is valid for 1 hour. If you did not request a password reset, please ignore this email; your account is secure.</p>
        </div>
        <p style="font-size: 0.8em; color: #999; text-align: center; margin-top: 20px;">
          If you're having trouble clicking the button, copy and paste this link into your browser:<br/>
          <span style="color: #3b82f6;">${resetUrl}</span>
        </p>
      </div>
    `,
    text: `Reset your CalmConnect AI password by visiting this link: ${resetUrl}`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email successfully sent to ${to}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Could not send password reset email. Please try again later.');
  }
};

/**
 * Send a generic notification email
 */
exports.sendNotificationEmail = async (to, title, message, link = null) => {
  const actionUrl = link ? `${process.env.FRONTEND_URL}${link}` : process.env.FRONTEND_URL;

  const mailOptions = {
    from: defaultFrom,
    to,
    subject: `New Notification: ${title} - CalmConnect AI`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; border: 1px solid #eee; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #3b82f6; margin: 0;">CalmConnect AI</h1>
          <p style="color: #666;">Your Mental Health Companion</p>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px;">
          <h2 style="margin-top: 0; color: #1e40af;">${title}</h2>
          <p style="font-size: 1.1em; line-height: 1.5;">${message}</p>
          ${link ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${actionUrl}" style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Details</a>
          </div>
          ` : ''}
          <p style="font-size: 0.9em; color: #666;">You can manage your notification settings in your profile.</p>
        </div>
        <p style="font-size: 0.8em; color: #999; text-align: center; margin-top: 20px;">
          &copy; 2025 CalmConnect AI. All rights reserved.
        </p>
      </div>
    `,
    text: `New Notification from CalmConnect AI: ${title}\n\n${message}\n\nView details at: ${actionUrl}`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Notification email successfully sent to ${to}`);
  } catch (error) {
    console.error('Error sending notification email:', error);
    // We don't throw here to avoid failing the main operation if email fails
  }
};
