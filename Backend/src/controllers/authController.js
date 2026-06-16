
const db = require('../services/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../services/emailService');
const motivationService = require('../services/motivationService');

// Helper to normalize IP addresses for better readability in logs
const getClientIp = (req) => {
  let ip = req.ip || req.socket.remoteAddress;
  // Standardize loopback addresses to the more common IPv4 format
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    return '127.0.0.1';
  }
  // Strip the IPv4-mapped IPv6 prefix if present
  if (ip && ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }
  return ip;
};

exports.register = async (req, res) => {
    const { username, email, password, role = 'patient' } = req.body;
    try {
        // Check if user exists
        const userExists = await db.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
        if (userExists.rows.length > 0) {
            // If user exists and is not verified, we can allow re-registering to trigger a new email
            const existingUser = userExists.rows[0];
            if (existingUser.is_verified) {
                return res.status(400).json({ message: 'User with this email or username already exists.' });
            }
            // If not verified, proceed to delete the old record before creating a new one
            await db.query('DELETE FROM users WHERE id = $1', [existingUser.id]);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        
        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
        const tokenExpires = new Date(Date.now() + 3600000 * 24); // 24 hours

        // Insert new user (unverified by default)
        const newUserQuery = `
            INSERT INTO users (username, email, password_hash, role, verification_token, verification_token_expires) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING id, email
        `;
        const { rows } = await db.query(newUserQuery, [username, email, password_hash, role, hashedToken, tokenExpires]);
        
        // Send verification email
        await emailService.sendVerificationEmail(rows[0].email, verificationToken);

        res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};


exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if user exists
        const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const user = rows[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // FIX: Check if the user's email is verified before allowing login.
        if (!user.is_verified) {
            return res.status(403).json({ message: 'Please verify your email address before logging in.', code: 'EMAIL_NOT_VERIFIED' });
        }

        // Check if user is blocked
        if (user.status === 'blocked') {
            return res.status(403).json({ message: 'Your account has been blocked.' });
        }
        
        // Generate JWT
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });

        // Generate Refresh Token
        const refreshToken = crypto.randomBytes(40).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000); // 7 days
        await db.query(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
            [user.id, refreshToken, expiresAt]
        );

        // Log login activity
        const ip = getClientIp(req);
        await db.query(
            'INSERT INTO user_activity_logs (user_id, activity_type, ip_address) VALUES ($1, $2, $3)',
            [user.id, 'login', ip]
        );

        // Update streak for patients
        if (user.role === 'patient') {
            try {
                await motivationService.updateStreak(user.id);
            } catch (err) {
                console.error("Failed to update streak on login:", err);
            }
        }
        
        // Don't send sensitive info to client
        delete user.password_hash;
        delete user.verification_token;
        delete user.verification_token_expires;
        delete user.password_reset_token;
        delete user.password_reset_expires;

        res.json({ token, refreshToken, user });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(400).json({ message: 'Verification token is missing.' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const { rows } = await db.query(
            'SELECT * FROM users WHERE verification_token = $1 AND verification_token_expires > NOW()',
            [hashedToken]
        );
        
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Verification token is invalid or has expired.' });
        }

        const user = rows[0];

        // Mark user as verified and clear token fields
        await db.query(
            'UPDATE users SET is_verified = TRUE, verification_token = NULL, verification_token_expires = NULL WHERE id = $1',
            [user.id]
        );

        res.json({ message: 'Email successfully verified.' });
    } catch (err) {
        console.error('Email verification error:', err);
        res.status(500).json({ message: 'Server error during email verification.' });
    }
};

exports.resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (rows.length > 0) {
            const user = rows[0];
            if (!user.is_verified) {
                // Generate new token and send email
                const verificationToken = crypto.randomBytes(32).toString('hex');
                const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
                const tokenExpires = new Date(Date.now() + 3600000 * 24); // 24 hours

                await db.query(
                    'UPDATE users SET verification_token = $1, verification_token_expires = $2 WHERE id = $3',
                    [hashedToken, tokenExpires, user.id]
                );

                await emailService.sendVerificationEmail(user.email, verificationToken);
            }
        }
        
        // Always send a generic success message to prevent email enumeration
        res.json({ message: 'If an account with that email exists and is not verified, a new verification link has been sent.' });

    } catch (err) {
        console.error('Resend verification error:', err);
        // Avoid sending specific errors
        res.json({ message: 'If an account with that email exists and is not verified, a new verification link has been sent.' });
    }
};


exports.logout = async (req, res) => {
    try {
        const userId = req.user.id;
        const { refreshToken } = req.body;
        if (refreshToken) {
            await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
        } else {
            await db.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
        }

        const ip = getClientIp(req);
        await db.query(
            'INSERT INTO user_activity_logs (user_id, activity_type, ip_address) VALUES ($1, $2, $3)',
            [userId, 'logout', ip]
        );
        res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
        console.error(err.message);
        // Don't send a 500, as the client will log out anyway.
        // Just acknowledge the request was processed.
        res.status(200).json({ message: 'Logout processed' });
    }
};

exports.refresh = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required.' });
    }

    try {
        // Find valid token in database
        const { rows } = await db.query(
            'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
            [refreshToken]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Refresh token is invalid or has expired.' });
        }

        const rt = rows[0];

        // Retrieve user
        const userQuery = await db.query(
            'SELECT id, username, email, role, status FROM users WHERE id = $1',
            [rt.user_id]
        );

        if (userQuery.rows.length === 0) {
            return res.status(401).json({ message: 'User not found.' });
        }

        const user = userQuery.rows[0];

        if (user.status === 'blocked') {
            return res.status(403).json({ message: 'Your account has been blocked.' });
        }

        // Generate new Access Token (expires in 15min)
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
        );

        // Rotate Refresh Token (highly secure)
        const newRefreshToken = crypto.randomBytes(40).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000); // 7 days

        // Delete old token and insert new one
        await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
        await db.query(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
            [user.id, newRefreshToken, expiresAt]
        );

        res.json({
            token,
            refreshToken: newRefreshToken
        });
    } catch (err) {
        console.error('Refresh token error:', err.message);
        res.status(500).json({ message: 'Server error during token refresh.' });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (rows.length === 0) {
            // Important: Don't reveal that the user doesn't exist.
            // This prevents email enumeration attacks.
            return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        }
        
        const user = rows[0];
        
        // FIX: Only allow verified users to reset their password.
        if (!user.is_verified) {
             return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        }

        // Create reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const passwordResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
            
        const passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour

        await db.query(
            'UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
            [passwordResetToken, passwordResetExpires, user.id]
        );

        // Send email
        await emailService.sendPasswordResetEmail(user.email, resetToken);

        res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });

    } catch (err) {
        console.error('Forgot password error:', err);
        // Also send a generic message on error to avoid leaking information
        res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, password } = req.body;

    try {
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const { rows } = await db.query(
            'SELECT * FROM users WHERE password_reset_token = $1 AND password_reset_expires > NOW()',
            [hashedToken]
        );

        if (rows.length === 0) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }

        const user = rows[0];

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Update password and clear reset token fields
        await db.query(
            'UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $2',
            [password_hash, user.id]
        );

        res.json({ message: 'Password has been reset successfully.' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};