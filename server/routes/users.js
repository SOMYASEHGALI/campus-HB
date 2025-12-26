const express = require('express');
const User = require('../models/User');
const Application = require('../models/Application');
const { auth, admin } = require('../middleware/authMiddleware');
const router = express.Router();

// Get all users (admin only)
router.get('/', auth, admin, async (req, res) => {
    try {
        const users = await User.find()
            .select('-password') // Don't send passwords
            .sort({ createdAt: -1 });

        // Get application counts for each user
        const usersWithStats = await Promise.all(users.map(async (user) => {
            const applicationCount = await Application.countDocuments({
                studentId: user._id
            });
            return {
                ...user.toObject(),
                applicationCount
            };
        }));

        res.json(usersWithStats);
    } catch (err) {
        console.error('Get Users Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Toggle user active status (admin only)
router.patch('/:id/toggle-status', auth, admin, async (req, res) => {
    try {
        console.log('[Toggle Status] Request received for user ID:', req.params.id);
        console.log('[Toggle Status] Admin user ID:', req.user.id);

        const user = await User.findById(req.params.id);
        if (!user) {
            console.log('[Toggle Status] User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('[Toggle Status] Found user:', user.email, 'Current isActive:', user.isActive);

        // Prevent admin from deactivating themselves
        if (user._id.toString() === req.user.id) {
            console.log('[Toggle Status] Admin trying to deactivate themselves');
            return res.status(400).json({ message: 'You cannot deactivate your own account' });
        }

        // Handle users without isActive field (backward compatibility)
        if (user.isActive === undefined) {
            user.isActive = true;
        }

        user.isActive = !user.isActive;
        await user.save();

        console.log('[Toggle Status] User status updated to:', user.isActive);

        res.json({
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            user: {
                ...user.toObject(),
                password: undefined
            }
        });
    } catch (err) {
        console.error('Toggle Status Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete user permanently (admin only)
router.delete('/:id', auth, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        // Delete all applications by this user
        const deletedApps = await Application.deleteMany({ studentId: user._id });

        // Delete the user
        await User.findByIdAndDelete(req.params.id);

        console.log(`[Admin Audit] Deleted user ${user.email} and ${deletedApps.deletedCount} applications`);

        res.json({
            message: 'User and all associated data deleted successfully',
            deletedApplications: deletedApps.deletedCount
        });
    } catch (err) {
        console.error('Delete User Error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
