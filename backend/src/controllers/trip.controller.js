const Trip = require('../models/Trip');
const User = require('../models/User');

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

// GET /api/trips
const getTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('-itinerary -hotels -packingList -localTips'); // Lightweight list
    res.json({ success: true, count: trips.length, trips });
  } catch (error) {
    next(error);
  }
};

// GET /api/trips/:id
const getTrip = async (req, res, next) => {
  try {
    const trip = await findTripForUser(req.params.id, req.user._id);
    res.json({ success: true, trip });
  } catch (error) {
    next(error);
  }
};

// POST /api/trips
const createTrip = async (req, res, next) => {
  try {
    const { destination, numberOfDays, budgetType, interests, travelStyle, startDate, title } = req.body;

    if (!destination || !numberOfDays || !budgetType || !interests) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    const trip = await Trip.create({
      user: req.user._id,
      title: title || `Trip to ${destination}`,
      destination,
      numberOfDays,
      budgetType,
      interests,
      travelStyle: travelStyle || 'solo',
      startDate: startDate || '',
      status: 'generating',
    });

    // Increment user's trip count
    await User.findByIdAndUpdate(req.user._id, { $inc: { tripsCount: 1 } });

    res.status(201).json({ success: true, trip });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/trips/:id
const updateTrip = async (req, res, next) => {
  try {
    const trip = await findTripForUser(req.params.id, req.user._id);

    const allowedUpdates = ['title', 'startDate', 'status', 'itinerary', 'budget', 'hotels', 'aiSummary', 'packingList', 'localTips', 'weatherSummary', 'generationMetadata'];
    allowedUpdates.forEach((key) => {
      if (req.body[key] !== undefined) {
        trip[key] = req.body[key];
      }
    });

    await trip.save();
    res.json({ success: true, trip });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/trips/:id
const deleteTrip = async (req, res, next) => {
  try {
    await findTripForUser(req.params.id, req.user._id);
    await Trip.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(req.user._id, { $inc: { tripsCount: -1 } });
    res.json({ success: true, message: 'Trip deleted.' });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/trips/:id/itinerary/:dayIndex/activities
const updateActivity = async (req, res, next) => {
  try {
    const trip = await findTripForUser(req.params.id, req.user._id);
    const dayIndex = parseInt(req.params.dayIndex);
    const { action, activityIndex, activity } = req.body;

    if (!trip.itinerary[dayIndex]) {
      return res.status(404).json({ success: false, message: 'Day not found.' });
    }

    if (action === 'add') {
      trip.itinerary[dayIndex].activities.push(activity);
    } else if (action === 'remove') {
      trip.itinerary[dayIndex].activities.splice(activityIndex, 1);
    } else if (action === 'update') {
      trip.itinerary[dayIndex].activities[activityIndex] = activity;
    }

    trip.markModified('itinerary');
    await trip.save();
    res.json({ success: true, trip });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTrips, getTrip, createTrip, updateTrip, deleteTrip, updateActivity };
