const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const userRoutes = require('./routes/users.js');
const authRoutes = require('./routes/auth.js');

// Loade env variabler
dotenv.config();

// Koble til MongoDB
connectDB();

const app = express();

// Middleware for å parse JSON bodies
app.use(express.json());

// Ruter
app.use('/api/auth', authRoutes);
app.use('/api/', userRoutes);

// Error hånderting
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Noe gikk galt!',
    });
});

const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`Server er oppe på port ${PORT}`));