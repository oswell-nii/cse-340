const express = require('express');
const router = express.Router();
const errorController = require('../controllers/errorController');
const errorHandler = require('../middleware/errorMiddleware'); // Assuming you'll create this middleware

// Route to intentionally trigger a 500 error
router.get('/trigger-error', errorController.triggerError);

module.exports = router;