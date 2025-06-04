const express = require('express');
const router = express.Router();
const { protect, isAdmin, isOwnerOrAdmin } = require('../middleware/authMiddleware.js'); // protect kan fjernes herfra hvis den ikke brukes av andre ruter i denne filen
const userController = require('../controllers/userController.js');

// POST /api/createUser - Opprett en ny bruker
// Denne ruten hadde ikke 'protect' middleware, så ingen endring her for tokenfjerning.
router.post('/createUser', userController.createUser);

// GET /api/:username - Hent data for én spesifikk bruker
// Fjerner 'protect' middleware herfra
router.get('/:username', userController.getUserByUsername);

// GET /api/ - Hent en liste over alle brukere - kun brukernavn
// Beholder 'protect' her med mindre du også vil fjerne det
router.get('/', protect, userController.getAllUsernames);

// PUT /api/:username - Oppdater informasjon om en bruker
// Beholder '[protect, isOwnerOrAdmin]' grunnet ikke oppgaven
router.put('/:username', [protect, isOwnerOrAdmin], userController.updateUser);

// DELETE /api/:username - Slett en bruker – kun tilgjengelig for administratorer
// Beholder '[protect, isAdmin]' grunnet ikke oppgaven
router.delete('/:username', [protect, isAdmin], userController.deleteUser);

module.exports = router;