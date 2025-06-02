const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = decoded.user;

            if (!req.user) {
                 return res.status(401).json({ message: 'Ikke autorisert, brukerdata mangler i tokenet' });
            }

            next();
        } catch (error) {
            console.error('Token verifikasjonsfeil:', error.message);
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Ikke autorisert, token verifisering feilet' });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Ikke autorisert, token er utløpt' });
            }
            return res.status(401).json({ message: 'Ikke autorisert, ugyldig token' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Ikke autorisert, mangler token' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Forbudt: Administratorrettigheter kreves.' });
    }
};

const isOwnerOrAdmin = (req, res, next) => {
    const resourceUsername = req.params.username;

    if (!req.user) {
        return res.status(401).json({ message: 'Ikke autorisert' });
    }

    if (req.user.username === resourceUsername || req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Forbudt: Du har ikke tillatelse til å utføre denne handlingen på denne ressursen.' });
    }
};

module.exports = {
    protect,
    isAdmin,
    isOwnerOrAdmin,
};