const express = require('express');
const router = express.Router();
const { generateItinerary, regenerateDay } = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/generate/:tripId', generateItinerary);
router.post('/regenerate-day/:tripId', regenerateDay);

module.exports = router;
