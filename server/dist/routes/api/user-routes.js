import express from 'express';
import { Types } from 'mongoose';
import User from '../../models/User.js';
import Thought from '../../models/Thought.js'; // for BONUS cleanup on user delete
const router = express.Router();
// GET all users
router.get('/', async (_req, res) => {
    try {
        const users = await User.find().select('-__v').lean();
        res.json(users);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to get users', error: err.message });
    }
});
// GET one user by ID (with thoughts & friends)
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-__v')
            .populate('thoughts')
            .populate('friends')
            .lean();
        if (!user) {
            return res.status(404).json({ message: 'No user with that ID' });
        }
        res.json(user);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to get user', error: err.message });
    }
});
// POST create new user
router.post('/', async (req, res) => {
    try {
        const { username, email } = req.body;
        const newUser = await User.create({ username, email });
        res.status(201).json(newUser);
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Failed to create user', error: err.message });
    }
});
// PUT update user by ID
router.put('/:id', async (req, res) => {
    try {
        const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-__v');
        if (!updated) {
            return res.status(404).json({ message: 'No user with that ID' });
        }
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Failed to update user', error: err.message });
    }
});
// DELETE user (and associated thoughts)
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'No user with that ID' });
        }
        await Thought.deleteMany({ username: user.username });
        res.json({ message: 'User and associated thoughts deleted' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete user', error: err.message });
    }
});
// POST add friend
router.post('/:userId/friends/:friendId', async (req, res) => {
    try {
        const { userId, friendId } = req.params;
        if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(friendId)) {
            return res.status(400).json({ message: 'Invalid user or friend ID' });
        }
        const user = await User.findByIdAndUpdate(userId, { $addToSet: { friends: friendId } }, { new: true }).populate('friends');
        if (!user) {
            return res.status(404).json({ message: 'No user with that ID' });
        }
        res.json(user);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add friend', error: err.message });
    }
});
// DELETE remove friend
router.delete('/:userId/friends/:friendId', async (req, res) => {
    try {
        const { userId, friendId } = req.params;
        if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(friendId)) {
            return res.status(400).json({ message: 'Invalid user or friend ID' });
        }
        const user = await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } }, { new: true }).populate('friends');
        if (!user) {
            return res.status(404).json({ message: 'No user with that ID' });
        }
        res.json(user);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to remove friend', error: err.message });
    }
});
export default router;
