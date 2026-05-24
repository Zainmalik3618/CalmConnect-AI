
const motivationService = require('../services/motivationService');

const motivationController = {
    async getDashboard(req, res) {
        try {
            const userId = req.user.id;
            const [stats, quote] = await Promise.all([
                motivationService.getUserStats(userId),
                motivationService.getRandomQuote()
            ]);
            
            res.json({
                stats,
                quote
            });
        } catch (err) {
            console.error('Error fetching motivation dashboard:', err);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    async recordActivity(req, res) {
        try {
            const userId = req.user.id;
            await motivationService.recordActivity(userId, 'generic');
            res.json({ message: 'Activity recorded' });
        } catch (err) {
            console.error('Error recording activity:', err);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};

module.exports = motivationController;
