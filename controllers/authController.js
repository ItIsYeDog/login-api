const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const dotenv = require('dotenv');

dotenv.config();

// POST /api/auth/login - User login
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'E-post og passord er påkrevd' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Ugyldig e-post eller passord' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Ugyldig e-post eller passord' });
        }

        const payload = {
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' }, // Token utløper om 1 time
            (err, token) => {
                if (err) {
                    console.error('Feil ved signering av token:', err);
                    return res.status(500).json({ message: 'Serverfeil under generering av token' });
                }
                res.json({ token });
            }
        );
    } catch (error) {
        console.error('Innloggingsfeil:', error);
        res.status(500).json({ message: 'Serverfeil under innlogging' });
    }
};

module.exports = {
    loginUser,
};