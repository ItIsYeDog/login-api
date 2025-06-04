const User = require('../models/User.js');

// POST /api/users - Opprett en ny bruker
const createUser = async (req, res) => {
    const { username, email } = req.body;

    if (!username || !email) { // Oppdatert validering fjernet passord
        return res.status(400).json({ message: 'Brukenavn og mail er påkrevd' });
    }

    try {
        let existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(409).json({ message: 'Email eksisterer allerede' });
            }
            if (existingUser.username === username) {
                return res.status(409).json({ message: 'Brukenavn eksisterer allerede' });
            }
        }

        const newUserPayload = { username, email }; // Fjernet password herfra

        const user = new User(newUserPayload);
        await user.save();

        const userResponse = user.toObject();
        // delete userResponse.password;    // Fjernet passord fra responsen

        res.status(201).json(userResponse);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        console.error(error);
        res.status(500).json({ message: 'Serverfeil under oppretting av bruker' });
    }
};

// GET /api/users/:username - Hent data for én spesifikk bruker
const getUserByUsername = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Bruker ikke funnet' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Serverfeil' });
    }
};

// GET /api/users - Hent en liste over alle brukere - kun brukernavn
const getAllUsernames = async (req, res) => {
    try {
        const users = await User.find().select('username -_id');
        res.json(users.map(user => ({ username: user.username })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Serverfeil' });
    }
};

// PUT /api/users/:username - Oppdater informasjon om en bruker
const updateUser = async (req, res) => {
    const { email, role, password: newPassword } = req.body;
    const { username } = req.params;

    try {
        const userToUpdate = await User.findOne({ username });
        if (!userToUpdate) {
            return res.status(404).json({ message: 'Bruker ikke funnet' });
        }

        if (email && email !== userToUpdate.email) {
            const existingUserWithEmail = await User.findOne({ email });
            if (existingUserWithEmail && existingUserWithEmail.username !== username) {
                return res.status(409).json({ message: 'Email er allerede i bruk av en annen konto' });
            }
            userToUpdate.email = email;
        }

        if (role) {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Forbudt: Kun administratorer kan endre roller.' });
            }
            if (!['user', 'admin'].includes(role)) {
                return res.status(400).json({ message: 'Ugyldig rolle spesifisert. Må være "user" eller "admin".' });
            }
            userToUpdate.role = role;
        }

        if (newPassword) {
            userToUpdate.password = newPassword; // Hashing skjer i pre-save hook
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
        res.status(500).json({ message: 'Serverfeil under oppdatering av bruker' });
    }
};

// DELETE /api/users/:username - Slett en bruker – kun tilgjengelig for administratorer
const deleteUser = async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ message: 'Bruker ikke funnet' });
        }
        res.json({ message: `Bruker '${req.params.username}' slettet` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Serverfeil' });
    }
};

module.exports = {
    createUser,
    getUserByUsername,
    getAllUsernames,
    updateUser,
    deleteUser,
};