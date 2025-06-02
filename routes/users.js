const express = require('express');
const router = express.Router();
const { protect, isAdmin, isOwnerOrAdmin } = require('../middleware/authMiddleware.js');
const userController = require('../controllers/userController.js');

// POST /api/users - Opprett en ny bruker
router.post('/', userController.createUser);

// GET /api/users/:username - Hent data for én spesifikk bruker
router.get('/:username', protect, userController.getUserByUsername);

// GET /api/users - Hent en liste over alle brukere - kun brukernavn
router.get('/', protect, userController.getAllUsernames);

// PUT /api/users/:username - Oppdater informasjon om en bruker
router.put('/:username', [protect, isOwnerOrAdmin], userController.updateUser);

// DELETE /api/users/:username - Slett en bruker – kun tilgjengelig for administratorer
router.delete('/:username', [protect, isAdmin], userController.deleteUser);

module.exports = router;