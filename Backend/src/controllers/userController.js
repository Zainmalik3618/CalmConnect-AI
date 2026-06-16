

const db = require('../services/db');
const bcrypt = require('bcryptjs');
const motivationService = require('../services/motivationService');

// Get current user's data
exports.getCurrentUser = async (req, res) => {
    try {
        const user = { ...req.user };
        if (user.role === 'psychiatrist') {
            const { rows: availability } = await db.query(
                'SELECT day, TO_CHAR(start_time, \'HH24:MI\') as "startTime", TO_CHAR(end_time, \'HH24:MI\') as "endTime" FROM psychiatrist_availability WHERE psychiatrist_id = $1', 
                [user.id]
            );
            user.availability = availability;
        }

        if (user.role === 'patient') {
            const stats = await motivationService.getUserStats(user.id);
            user.total_points = stats.streak.total_points;
            user.earnedBadges = stats.earnedBadges;
        }

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get all users (for contacts, admin panel, etc.)
exports.getAllUsers = async (req, res) => {
    try {
        const { rows: users } = await db.query('SELECT id, username, email, role, status, deletion_requested_at, deletion_request_reason, age, emergency_contact, mental_health_goals, background_details, qualifications, specialization, registration_number, clinic_details, experience FROM users ORDER BY username ASC');
        
        const usersWithStats = await Promise.all(users.map(async (user) => {
            if (user.role === 'patient') {
                try {
                    const stats = await motivationService.getUserStats(user.id);
                    return {
                        ...user,
                        total_points: stats.streak.total_points,
                        earnedBadges: stats.earnedBadges
                    };
                } catch (e) {
                    console.error(`Error fetching stats for user ${user.id}:`, e);
                    return user;
                }
            }
            return user;
        }));

        res.json(usersWithStats);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.rejectAccountDeletion = async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            UPDATE users 
            SET deletion_requested_at = NULL, deletion_request_reason = NULL 
            WHERE id = $1
            RETURNING id, username, email, role, status, deletion_requested_at, deletion_request_reason
        `;
        const { rows } = await db.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update current user's data
exports.updateCurrentUser = async (req, res) => {
    const { 
        username, email, currentPassword, newPassword,
        age, emergency_contact, mental_health_goals, background_details,
        qualifications, specialization, registration_number, clinic_details, experience,
        availability
    } = req.body;
    const userId = req.user.id;

    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        const { rows } = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
        const user = rows[0];

        let updates = [];
        let values = [];
        let valueIndex = 1;

        // Username update
        if (username && username !== user.username) {
            const existingUser = await client.query('SELECT id FROM users WHERE username = $1 AND id != $2', [username, userId]);
            if (existingUser.rows.length > 0) throw new Error('Username is already taken.');
            updates.push(`username = $${valueIndex++}`);
            values.push(username);
        }

        // Email update
        if (email && email !== user.email) {
            const existingUser = await client.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);
            if (existingUser.rows.length > 0) throw new Error('Email is already in use.');
            updates.push(`email = $${valueIndex++}`);
            values.push(email);
        }
        
        // Password update
        if (newPassword) {
            if (!currentPassword) throw new Error('Current password is required to update password.');
            
            const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isMatch) throw new Error('Incorrect current password.');

            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(newPassword, salt);
            updates.push(`password_hash = $${valueIndex++}`);
            values.push(password_hash);
        }

        // Patient specific fields
        if (user.role === 'patient') {
            if (age !== undefined) { updates.push(`age = $${valueIndex++}`); values.push(age); }
            if (emergency_contact !== undefined) { updates.push(`emergency_contact = $${valueIndex++}`); values.push(emergency_contact); }
            if (mental_health_goals !== undefined) { updates.push(`mental_health_goals = $${valueIndex++}`); values.push(mental_health_goals); }
            if (background_details !== undefined) { updates.push(`background_details = $${valueIndex++}`); values.push(background_details); }
        }

        // Psychiatrist specific fields
        if (user.role === 'psychiatrist') {
            if (qualifications !== undefined) { updates.push(`qualifications = $${valueIndex++}`); values.push(qualifications); }
            if (specialization !== undefined) { updates.push(`specialization = $${valueIndex++}`); values.push(specialization); }
            if (registration_number !== undefined) { updates.push(`registration_number = $${valueIndex++}`); values.push(registration_number); }
            if (clinic_details !== undefined) { updates.push(`clinic_details = $${valueIndex++}`); values.push(clinic_details); }
            if (experience !== undefined) { updates.push(`experience = $${valueIndex++}`); values.push(experience); }

            // Availability update
            if (availability && Array.isArray(availability)) {
                await client.query('DELETE FROM psychiatrist_availability WHERE psychiatrist_id = $1', [userId]);
                for (const slot of availability) {
                    await client.query(
                        'INSERT INTO psychiatrist_availability (psychiatrist_id, day, start_time, end_time) VALUES ($1, $2, $3, $4)',
                        [userId, slot.day, slot.startTime, slot.endTime]
                    );
                }
            }
        }
        
        if (updates.length > 0) {
            values.push(userId);
            const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${valueIndex} RETURNING id, username, email, role, status, age, emergency_contact, mental_health_goals, background_details, qualifications, specialization, registration_number, clinic_details, experience`;
            const updatedUserResult = await client.query(query, values);
            
            const finalUser = updatedUserResult.rows[0];
            if (finalUser.role === 'psychiatrist') {
                const { rows: finalAvailability } = await client.query(
                    'SELECT day, TO_CHAR(start_time, \'HH24:MI\') as "startTime", TO_CHAR(end_time, \'HH24:MI\') as "endTime" FROM psychiatrist_availability WHERE psychiatrist_id = $1', 
                    [userId]
                );
                finalUser.availability = finalAvailability;
            }
            
            await client.query('COMMIT');

            if (finalUser.role === 'patient') {
                const stats = await motivationService.getUserStats(userId);
                finalUser.total_points = stats.streak.total_points;
                finalUser.earnedBadges = stats.earnedBadges;
            }

            res.json(finalUser);
        } else if (availability && user.role === 'psychiatrist') {
            // Only availability changed
            await client.query('COMMIT');
            const { rows: finalUserRows } = await db.query('SELECT id, username, email, role, status, age, emergency_contact, mental_health_goals, background_details, qualifications, specialization, registration_number, clinic_details, experience FROM users WHERE id = $1', [userId]);
            const finalUser = finalUserRows[0];

            if (finalUser.role === 'patient') {
                const stats = await motivationService.getUserStats(userId);
                finalUser.total_points = stats.streak.total_points;
                finalUser.earnedBadges = stats.earnedBadges;
            }

            const { rows: finalAvailability } = await db.query(
                'SELECT day, TO_CHAR(start_time, \'HH24:MI\') as "startTime", TO_CHAR(end_time, \'HH24:MI\') as "endTime" FROM psychiatrist_availability WHERE psychiatrist_id = $1', 
                [userId]
            );
            finalUser.availability = finalAvailability;
            res.json(finalUser);
        }
 else {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'No changes provided.' });
        }

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).json({ message: err.message || 'Server Error' });
    } finally {
        client.release();
    }
};

// User requests account deletion
exports.requestAccountDeletion = async (req, res) => {
    const { reason } = req.body;
    const userId = req.user.id;

    try {
        const query = `
            UPDATE users 
            SET deletion_requested_at = NOW(), deletion_request_reason = $1 
            WHERE id = $2 AND deletion_requested_at IS NULL
            RETURNING id, username, email, role, status, deletion_requested_at, deletion_request_reason
        `;
        const { rows } = await db.query(query, [reason, userId]);

        if (rows.length === 0) {
            return res.status(400).json({ message: 'Deletion has already been requested for this account.' });
        }
        
        // TODO: In a real-world scenario, you might want to send an email notification to the admin here.
        
        res.json(rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};


// --- Admin Controllers ---

exports.addPsychiatrist = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const userExists = await db.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User with this email or username already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUserQuery = 'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, status';
        const { rows } = await db.query(newUserQuery, [username, email, password_hash, 'psychiatrist']);
        
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.updateUserStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'active' or 'blocked'

    if (!['active', 'blocked'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided.' });
    }

    try {
        const { rows } = await db.query(
            'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, username, email, role, status',
            [status, id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    // Admins should not be able to delete themselves
    if (id === req.user.id) {
        return res.status(400).json({ message: "Administrators cannot delete their own accounts." });
    }

    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // 1. Handle Appointments first, as this is the source of the foreign key error.
        await client.query('DELETE FROM appointments WHERE patient_id = $1 OR psychiatrist_id = $1', [id]);

        // 2. Handle Direct Messages & Conversations
        const { rows: convoRows } = await client.query('SELECT conversation_id FROM conversation_participants WHERE user_id = $1', [id]);
        if (convoRows.length > 0) {
            const conversationIds = convoRows.map(r => r.conversation_id);
            await client.query('DELETE FROM direct_messages WHERE conversation_id = ANY($1::uuid[])', [conversationIds]);
            await client.query('DELETE FROM conversation_participants WHERE conversation_id = ANY($1::uuid[])', [conversationIds]);
            await client.query('DELETE FROM conversations WHERE id = ANY($1::uuid[])', [conversationIds]);
        }
        
        // 3. Handle AI Chat Sessions & Messages
        await client.query('DELETE FROM chat_messages WHERE session_id IN (SELECT id FROM chat_sessions WHERE user_id = $1)', [id]);
        await client.query('DELETE FROM chat_sessions WHERE user_id = $1', [id]);
        
        // 4. Handle other user-specific data
        await client.query('DELETE FROM mood_entries WHERE user_id = $1', [id]);
        await client.query('DELETE FROM journal_entries WHERE user_id = $1', [id]);
        await client.query('DELETE FROM thought_records WHERE user_id = $1', [id]);
        await client.query('DELETE FROM completed_exercises WHERE user_id = $1', [id]);

        // 5. Finally, delete the user from the users table
        const deleteResult = await client.query('DELETE FROM users WHERE id = $1', [id]);
        
        if (deleteResult.rowCount === 0) {
            throw new Error('User not found.');
        }

        await client.query('COMMIT');
        res.json({ message: 'User and all related data deleted successfully.' });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error during user deletion transaction:", err);
        if (err.message === 'User not found.') {
            res.status(404).json({ message: 'User not found.' });
        } else {
            res.status(500).json({ message: 'Server Error during user deletion.', detail: err.message });
        }
    } finally {
        client.release();
    }
};

exports.getActivityLogs = async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT ual.id, ual.user_id, ual.activity_type, ual.ip_address, ual.timestamp, u.username
            FROM user_activity_logs ual
            JOIN users u ON ual.user_id = u.id
            ORDER BY ual.timestamp DESC
            LIMIT 100 -- Add a limit for performance
        `);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};