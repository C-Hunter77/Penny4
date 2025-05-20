import express from 'express';
import { Types } from 'mongoose';
import Thought from '../../models/Thought.js';
import User from '../../models/User.js';
const router = express.Router();
// GET all thoughts
router.get('/', async (_req, res) => {
    try {
        const thoughts = await Thought.find().select('-__v').lean();
        res.json(thoughts);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to get thoughts', error: err.message });
    }
});
// GET one thought by ID
router.get('/:id', async (req, res) => {
    try {
        const thought = await Thought.findById(req.params.id).select('-__v').lean();
        if (!thought) {
            return res.status(404).json({ message: 'No thought with that ID' });
        }
        res.json(thought);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to get thought', error: err.message });
    }
});
// POST create new thought
router.post('/', async (req, res) => {
    try {
        const { thoughtText, username, userId } = req.body;
        const newThought = await Thought.create({ thoughtText, username });
        await User.findByIdAndUpdate(userId, { $push: { thoughts: newThought._id } }, { new: true });
        res.status(201).json(newThought);
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Failed to create thought', error: err.message });
    }
});
// PUT update thought
router.put('/:id', async (req, res) => {
    try {
        const updated = await Thought.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-__v');
        if (!updated) {
            return res.status(404).json({ message: 'No thought with that ID' });
        }
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Failed to update thought', error: err.message });
    }
});
// DELETE thought
router.delete('/:id', async (req, res) => {
    try {
        const thought = await Thought.findByIdAndDelete(req.params.id);
        if (!thought) {
            return res.status(404).json({ message: 'No thought with that ID' });
        }
        await User.findOneAndUpdate({ username: thought.username }, { $pull: { thoughts: req.params.id } });
        res.json({ message: 'Thought deleted' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete thought', error: err.message });
    }
});
// POST reaction
router.post('/:thoughtId/reactions', async (req, res) => {
    try {
        const { thoughtId } = req.params;
        const { reactionBody, username } = req.body;
        if (!Types.ObjectId.isValid(thoughtId)) {
            return res.status(400).json({ message: 'Invalid thought ID' });
        }
        const thought = await Thought.findByIdAndUpdate(thoughtId, { $push: { reactions: { reactionBody, username } } }, { new: true, runValidators: true });
        if (!thought) {
            return res.status(404).json({ message: 'No thought with that ID' });
        }
        res.json(thought);
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Failed to add reaction', error: err.message });
    }
});
// DELETE reaction
router.delete('/:thoughtId/reactions/:reactionId', async (req, res) => {
    try {
        const { thoughtId, reactionId } = req.params;
        if (!Types.ObjectId.isValid(thoughtId) || !Types.ObjectId.isValid(reactionId)) {
            return res.status(400).json({ message: 'Invalid ID(s)' });
        }
        const thought = await Thought.findByIdAndUpdate(thoughtId, { $pull: { reactions: { reactionId } } }, { new: true });
        if (!thought) {
            return res.status(404).json({ message: 'No thought with that ID' });
        }
        res.json(thought);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to remove reaction', error: err.message });
    }
});
export default router;
