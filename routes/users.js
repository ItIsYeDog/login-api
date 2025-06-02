const express = require('express');
const User = require('../models/User.js');
const { protect, isAdmin, isOwnerOrAdmin } = require('../middleware/authMiddleware.js');

const router = express.Router();

// POST /api/users - Opprett en ny bruker
router.post('/', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    try {
        let existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(409).json({ message: 'Email already exists' });
            }
            if (existingUser.username === username) {
                return res.status(409).json({ message: 'Username already exists' });
            }
        }

        const newUserPayload = { username, email, password };

        const user = new User(newUserPayload);
        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json(userResponse);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error while creating user' });
    }
});

// GET /api/users/:username - Hent data for én spesifikk bruker
router.get('/:username', protect, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/users - Hent en liste over alle brukere - kun brukernavn
router.get('/', protect, async (req, res) => {
    try {
        const users = await User.find().select('username -_id');
        res.json(users.map(user => ({ username: user.username })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/users/:username - Oppdater informasjon om en bruker
router.put('/:username', [protect, isOwnerOrAdmin], async (req, res) => {
    const { email, role, password: newPassword } = req.body;
    const { username } = req.params;

    try {
        const userToUpdate = await User.findOne({ username });
        if (!userToUpdate) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (email && email !== userToUpdate.email) {
            const existingUserWithEmail = await User.findOne({ email });
            if (existingUserWithEmail && existingUserWithEmail.username !== username) {
                return res.status(409).json({ message: 'Email already in use by another account' });
            }
            userToUpdate.email = email;
        }

        if (role) {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Forbidden: Only administrators can change roles.' });
            }
            if (!['user', 'admin'].includes(role)) {
                return res.status(400).json({ message: 'Invalid role specified. Must be "user" or "admin".' });
            }
            userToUpdate.role = role;
        }

        if (newPassword) {
            userToUpdate.password = newPassword;
        }

        await userToUpdate.save();

        const userResponse = userToUpdate.toObject();
        delete userResponse.password;
        res.json(userResponse);

    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error while updating user' });
    }
});

// DELETE /api/users/:username - Slett en bruker – kun tilgjengelig for administratorer
router.delete('/:username', [protect, isAdmin], async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: `User '${req.params.username}' deleted successfully` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;