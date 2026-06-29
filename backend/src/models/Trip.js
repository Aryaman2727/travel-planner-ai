const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  time: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  type: {
    type: {
      type: String,
      default: 'other',
    },
  },
  estimatedCost: { type: Number, default: 0 },
});

const dayPlanSchema = new mongoose.Schema({
  day: { type: Number, required: true },
  date: { type: String, default: '' },
  theme: { type: String, default: '' },
  activities: [activitySchema],
  notes: { type: String, default: '' },
});

const budgetBreakdownSchema = new mongoose.Schema({
  flights: { type: Number, default: 0 },
  accommodation: { type: Number, default: 0 },
  food: { type: Number, default: 0 },
  activities: { type: Number, default: 0 },
  transport: { type: Number, default: 0 },
  miscellaneous: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  notes: { type: String, default: '' },
});

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['budget', 'mid-range', 'luxury'], default: 'mid-range' },
  pricePerNight: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  highlights: [String],
  location: { type: String, default: '' },
});

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Trip title is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    numberOfDays: {
      type: Number,
      required: true,
      min: [1, 'Must be at least 1 day'],
      max: [30, 'Cannot exceed 30 days'],
    },
    startDate: { type: String, default: '' },
    budgetType: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    interests: {
      type: [String],
      required: true,
      validate: [(arr) => arr.length > 0, 'Select at least one interest'],
    },
    travelStyle: {
      type: String,
      enum: ['solo', 'couple', 'family', 'group', 'business'],
      default: 'solo',
    },
    status: {
      type: String,
      enum: ['generating', 'active', 'completed', 'archived'],
      default: 'generating',
    },
    itinerary: [dayPlanSchema],
    budget: budgetBreakdownSchema,
    hotels: [hotelSchema],
    aiSummary: { type: String, default: '' },
    packingList: [String],     // Creative feature: AI-generated packing list
    localTips: [String],       // Creative feature: local insider tips
    weatherSummary: { type: String, default: '' }, // Creative feature
    generationMetadata: {
      model: { type: String, default: 'claude-sonnet-4-6' },
      generatedAt: { type: Date },
      tokensUsed: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Ensure users can only access their own trips
tripSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Trip', tripSchema);
