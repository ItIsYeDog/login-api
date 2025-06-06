const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');

// POST /api/auth/login - User login
router.post('/login', authController.loginUser);

module.exports = router;