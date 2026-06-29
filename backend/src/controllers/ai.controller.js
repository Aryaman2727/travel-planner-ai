const Trip = require('../models/Trip');
const aiService = require('../services/ai.service');

// Helper: ensure trip belongs to current user
const findTripForUser = async (tripId, userId) => {
  const trip = await Trip.findOne({ _id: tripId, user: userId });
  if (!trip) {
    const err = new Error('Trip not found or access denied.');
    err.statusCode = 404;
    throw err;
  }
  return trip;
};

// POST /api/ai/generate/:tripId
// Generates full itinerary for an existing trip record
const generateItinerary = async (req, res, next) => {
  try {
    const trip = await findTripForUser(req.params.tripId, req.user._id);

    if (trip.status === 'active' && trip.itinerary.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Itinerary already generated. Use regenerate endpoint to update specific days.',
      });
    }

    trip.status = 'generating';
    await trip.save();

    const { data, tokensUsed } = await aiService.generateItinerary({
      destination: trip.destination,
      numberOfDays: trip.numberOfDays,
      budgetType: trip.budgetType,
      interests: trip.interests,
      travelStyle: trip.travelStyle,
      startDate: trip.startDate,
    });

    // Save generated content to trip
    trip.title = data.title || trip.title;
    trip.aiSummary = data.aiSummary || '';
    trip.weatherSummary = data.weatherSummary || '';
    // to handle any type enum returned from aiserivce ,
    const validTypes = ['food', 'sightseeing', 'adventure', 'shopping', 'culture', 'transport', 'accommodation', 'other'];
const sanitizedItinerary = (data.itinerary || []).map(day => ({
  ...day,
  activities: day.activities.map(act => ({
    ...act,
    type: validTypes.includes(act.type) ? act.type : 'other'
  }))
}));
trip.itinerary = sanitizedItinerary;
    trip.budget = data.budget || {};
    trip.hotels = data.hotels || [];
    trip.packingList = data.packingList || [];
    trip.localTips = data.localTips || [];
    trip.status = 'active';
    trip.generationMetadata = {
      model: 'claude-sonnet-4-6',
      generatedAt: new Date(),
      tokensUsed,
    };

    await trip.save();
    res.json({ success: true, trip });
  } catch (error) {
    // Mark trip as failed if generation fails
    try {
      await Trip.findByIdAndUpdate(req.params.tripId, { status: 'generating' });
    } catch (_) {}
    next(error);
  }
};

// POST /api/ai/regenerate-day/:tripId
const regenerateDay = async (req, res, next) => {
  try {
    const { dayNumber, userRequest } = req.body;
    if (!dayNumber) {
      return res.status(400).json({ success: false, message: 'dayNumber is required.' });
    }

    const trip = await findTripForUser(req.params.tripId, req.user._id);

    const dayIndex = dayNumber - 1;
    if (!trip.itinerary[dayIndex]) {
      return res.status(404).json({ success: false, message: `Day ${dayNumber} not found.` });
    }

    const newDay = await aiService.regenerateDay({
      destination: trip.destination,
      dayNumber,
      currentDay: trip.itinerary[dayIndex],
      userRequest,
      budgetType: trip.budgetType,
      interests: trip.interests,
    });

    trip.itinerary[dayIndex] = newDay;
    trip.markModified('itinerary');
    await trip.save();

    res.json({ success: true, day: newDay, trip });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateItinerary, regenerateDay };
