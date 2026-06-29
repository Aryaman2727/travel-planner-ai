const express = require('express');
const router = express.Router();
const { getTrips, getTrip, createTrip, updateTrip, deleteTrip, updateActivity } = require('../controllers/trip.controller');
const { protect } = require('../middleware/auth');

// All trip routes require authentication
router.use(protect);

router.route('/').get(getTrips).post(createTrip);
router.route('/:id').get(getTrip).patch(updateTrip).delete(deleteTrip);
router.patch('/:id/itinerary/:dayIndex/activities', updateActivity);

module.exports = router;
