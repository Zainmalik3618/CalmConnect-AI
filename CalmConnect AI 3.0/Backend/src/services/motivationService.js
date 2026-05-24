
const db = require('./db');

const motivationService = {
    async updateStreak(userId) {
        console.log(`[MotivationService] Attempting to update streak for user: ${userId}`);
        const now = new Date();
        const today = now.toISOString().split('T')[0]; // Current UTC date
        
        try {
            // Fetch streak info, forcing date to string to avoid timezone shifts
            const result = await db.query(
                "SELECT *, TO_CHAR(last_activity_date, 'YYYY-MM-DD') as last_date_str FROM user_streaks WHERE user_id = $1",
                [userId]
            );
            
            let streak = result.rows[0];
            let newStreak = 1;
            let totalPointsToAdd = 10;
            let isNewRecord = false;

            if (!streak) {
                console.log(`[MotivationService] No streak record found for ${userId}. Creating initial record for today: ${today}`);
                await db.query(
                    'INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date, total_points) VALUES ($1, 1, 1, $2, 10)',
                    [userId, today]
                );
                return { current_streak: 1, is_new_record: true };
            }
            
            const lastDateStr = streak.last_date_str; // e.g. "2026-05-19"
            console.log(`[MotivationService] Comparison - Last Login: ${lastDateStr}, Today (UTC): ${today}`);
            
            if (lastDateStr === today) {
                console.log(`[MotivationService] User already logged in today (${today}). Adding 5 points, no streak increment.`);
                await db.query(
                    'UPDATE user_streaks SET total_points = total_points + 5, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1',
                    [userId]
                );
                return { current_streak: streak.current_streak, is_new_record: false };
            }
            
            // Calculate yesterday in UTC
            const yesterdayDate = new Date(now);
            yesterdayDate.setUTCDate(now.getUTCDate() - 1);
            const yesterdayStr = yesterdayDate.toISOString().split('T')[0];
            
            if (lastDateStr === yesterdayStr) {
                newStreak = streak.current_streak + 1;
                console.log(`[MotivationService] Streak continued! New streak: ${newStreak}`);
            } else {
                console.log(`[MotivationService] Streak reset to 1. (Last login was ${lastDateStr}, expected ${yesterdayStr})`);
                newStreak = 1;
            }
            
            const newLongest = Math.max(newStreak, streak.longest_streak || 0);
            isNewRecord = newStreak > (streak.longest_streak || 0);
            
            await db.query(
                'UPDATE user_streaks SET current_streak = $1, longest_streak = $2, last_activity_date = $3, total_points = total_points + $4, updated_at = CURRENT_TIMESTAMP WHERE user_id = $5',
                [newStreak, newLongest, today, totalPointsToAdd, userId]
            );
            
            if (newStreak === 3) await this.awardBadge(userId, 'streak_3');
            if (newStreak === 7) await this.awardBadge(userId, 'streak_7');
            
            return { current_streak: newStreak, is_new_record: isNewRecord };
        } catch (err) {
            console.error('[MotivationService] Error in updateStreak:', err);
            throw err;
        }
    },

    async recordActivity(userId, activityType) {
        console.log(`[MotivationService] Recording activity ${activityType} for user ${userId}`);
        try {
            // Add interaction points (5 points for any purposeful activity)
            await db.query(
                'INSERT INTO user_streaks (user_id, total_points) VALUES ($1, 5) ON CONFLICT (user_id) DO UPDATE SET total_points = user_streaks.total_points + 5, updated_at = CURRENT_TIMESTAMP',
                [userId]
            );

            // Logic to award achievement-based badges
            if (activityType === 'journal') {
                await this.awardBadge(userId, 'first_journal');
            } else if (activityType === 'cbt') {
                // Check if they performed CBT activities for 7 consecutive days
                const result = await db.query(
                    `SELECT DISTINCT TO_CHAR(activity_date, 'YYYY-MM-DD') as activity_day
                     FROM (
                        SELECT date as activity_date FROM thought_records WHERE user_id = $1
                        UNION
                        SELECT date as activity_date FROM completed_exercises WHERE user_id = $1
                     ) as combined_cbt
                     ORDER BY activity_day DESC`,
                    [userId]
                );
                
                const days = result.rows.map(r => r.activity_day);
                
                if (days.length >= 7) {
                    let consecutiveCount = 1;
                    let hasSevenConsecutive = false;
                    
                    for (let i = 0; i < days.length - 1; i++) {
                        const current = new Date(days[i]);
                        const next = new Date(days[i+1]);
                        
                        // Calculate difference in days
                        const diffInMs = current.getTime() - next.getTime();
                        const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
                        
                        if (diffInDays === 1) {
                            consecutiveCount++;
                            if (consecutiveCount >= 7) {
                                hasSevenConsecutive = true;
                                break;
                            }
                        } else {
                            consecutiveCount = 1;
                        }
                    }
                    
                    if (hasSevenConsecutive) {
                        await this.awardBadge(userId, 'cbt_master');
                    }
                }
            } else if (activityType === 'mood') {
                // Check for 3 distinct days of mood logging
                const result = await db.query(
                    "SELECT COUNT(DISTINCT date_trunc('day', date)) as day_count FROM mood_entries WHERE user_id = $1",
                    [userId]
                );
                const dayCount = parseInt(result.rows[0].day_count);
                if (dayCount >= 3) {
                    await this.awardBadge(userId, 'mood_tracker');
                }
            }
        } catch (err) {
            console.error('[MotivationService] Error recording activity:', err);
        }
    },

    async awardBadge(userId, badgeId) {
        try {
            await db.query(
                'INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                [userId, badgeId]
            );
        } catch (err) {
            console.error('Error awarding badge:', err);
        }
    },

    async getUserStats(userId) {
        const streakResult = await db.query('SELECT * FROM user_streaks WHERE user_id = $1', [userId]);
        const badgesResult = await db.query(
            'SELECT b.*, ub.awarded_at FROM badges b JOIN user_badges ub ON b.id = ub.badge_id WHERE ub.user_id = $1 ORDER BY ub.awarded_at DESC',
            [userId]
        );
        const allBadges = await db.query('SELECT * FROM badges');
        
        return {
            streak: streakResult.rows[0] || { current_streak: 0, longest_streak: 0, total_points: 0 },
            earnedBadges: badgesResult.rows,
            availableBadgesCount: allBadges.rowCount
        };
    },

    async getRandomQuote() {
        const result = await db.query('SELECT * FROM daily_quotes ORDER BY RANDOM() LIMIT 1');
        return result.rows[0];
    }
};

module.exports = motivationService;
