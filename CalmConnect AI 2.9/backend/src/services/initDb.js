
const db = require('./db');

const initDb = async () => {
    try {
        // Optional: Ensure schema exists if mentioned by user
        // await db.query('CREATE SCHEMA IF NOT EXISTS calmconnect');
        // await db.query('SET search_path TO calmconnect, public');

        await db.query(`
            CREATE TABLE IF NOT EXISTS user_streaks (
                user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                current_streak INTEGER DEFAULT 0,
                longest_streak INTEGER DEFAULT 0,
                last_activity_date DATE,
                total_points INTEGER DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS badges (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT NOT NULL,
                icon_name VARCHAR(50) NOT NULL,
                category VARCHAR(50) NOT NULL
            );

            CREATE TABLE IF NOT EXISTS user_badges (
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                badge_id VARCHAR(50) REFERENCES badges(id) ON DELETE CASCADE,
                awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, badge_id)
            );

            CREATE TABLE IF NOT EXISTS daily_quotes (
                id SERIAL PRIMARY KEY,
                text TEXT NOT NULL,
                author VARCHAR(100),
                category VARCHAR(50)
            );

            CREATE TABLE IF NOT EXISTS feedback (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
                target_id UUID REFERENCES users(id) ON DELETE SET NULL,
                type VARCHAR(50) NOT NULL,
                rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS reports (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                target_id UUID REFERENCES users(id) ON DELETE SET NULL,
                type VARCHAR(50) NOT NULL,
                description TEXT NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Seed badges if empty
            INSERT INTO badges (id, name, description, icon_name, category)
            VALUES 
                ('first_journal', 'First Reflection', 'Wrote your first journal entry', 'book', 'journaling'),
                ('streak_3', 'Consistency Starter', 'Maintained a 3-day activity streak', 'flame', 'streak'),
                ('streak_7', 'Week of Wellness', 'Maintained a 7-day activity streak', 'zap', 'streak'),
                ('cbt_master', 'Mindful Navigator', 'Completed CBT exercises for 7 consecutive days', 'brain', 'cbt'),
                ('mood_tracker', 'Emotional Aware', 'Logged mood for 3 consecutive days', 'smile', 'mood')
            ON CONFLICT (id) DO UPDATE SET 
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                icon_name = EXCLUDED.icon_name;

            -- Seed quotes if empty
            INSERT INTO daily_quotes (text, author, category)
            SELECT 'The only way to do great work is to love what you do.', 'Steve Jobs', 'motivation'
            WHERE NOT EXISTS (SELECT 1 FROM daily_quotes WHERE text = 'The only way to do great work is to love what you do.');
            
            INSERT INTO daily_quotes (text, author, category)
            SELECT 'It does not matter how slowly you go as long as you do not stop.', 'Confucius', 'perseverance'
            WHERE NOT EXISTS (SELECT 1 FROM daily_quotes WHERE text = 'It does not matter how slowly you go as long as you do not stop.');

            INSERT INTO daily_quotes (text, author, category)
            SELECT 'Mental health is not a destination, but a process.', 'Noam Shpancer', 'wellness'
            WHERE NOT EXISTS (SELECT 1 FROM daily_quotes WHERE text = 'Mental health is not a destination, but a process.');

            -- Update users table with new profile fields
            ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS mental_health_goals TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS background_details TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS qualifications TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS specialization TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS registration_number TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS clinic_details TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS experience TEXT;

            CREATE TABLE IF NOT EXISTS forum_posts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                is_anonymous BOOLEAN DEFAULT FALSE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS forum_comments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE NOT NULL,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                is_anonymous BOOLEAN DEFAULT FALSE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Motivation and standard tables initialized/updated');
    } catch (err) {
        console.error('Error initializing database:', err.message);
    }
};

module.exports = initDb;