const Groq = require('groq-sdk');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const BUDGET_MAP = {
  low: 'budget-conscious traveler (hostels, street food, free attractions)',
  medium: 'mid-range traveler (3-star hotels, local restaurants, mix of paid/free attractions)',
  high: 'luxury traveler (4-5 star hotels, fine dining, premium experiences)',
};

const STYLE_MAP = { 
  solo: 'solo traveler',
  couple: 'couple on a romantic trip',
  family: 'family with children',
  group: 'group of friends',
  business: 'business traveler with leisure time',
};

const generateItinerary = async ({ destination, numberOfDays, budgetType, interests, travelStyle, startDate }) => {
  const prompt = `You are an expert travel planner. Generate a comprehensive travel plan:

- Destination: ${destination}
- Duration: ${numberOfDays} days
- Budget: ${BUDGET_MAP[budgetType] || budgetType}
- Travel style: ${STYLE_MAP[travelStyle] || travelStyle}
- Interests: ${interests.join(', ')}
${startDate ? `- Start date: ${startDate}` : ''}

Respond with ONLY a valid JSON object, no markdown, no backticks, no explanation:

{
  "title": "Catchy trip title",
  "aiSummary": "2-3 sentence overview",
  "weatherSummary": "Weather note",
  "itinerary": [
    {
      "day": 1,
      "date": "",
      "theme": "Day theme",
      "activities": [
        {
          "time": "9:00 AM",
          "title": "Activity name",
          "description": "Description with tips",
          "type": "sightseeing",
          "estimatedCost": 25
        }
      ],
      "notes": "Helpful tip"
    }
  ],
  "budget": {
    "flights": 400,
    "accommodation": 300,
    "food": 150,
    "activities": 100,
    "transport": 50,
    "miscellaneous": 50,
    "total": 1050,
    "currency": "USD",
    "notes": "Budget tips"
  },
  "hotels": [
    {
      "name": "Hotel Name",
      "category": "budget",
      "pricePerNight": 80,
      "rating": 4.2,
      "highlights": ["Free breakfast", "Central location"],
      "location": "Area name"
    }
  ],
  "packingList": ["Item 1", "Item 2"],
  "localTips": ["Tip 1", "Tip 2"]
}

Generate ${numberOfDays} days. Include 3 hotels (one budget, one mid-range, one luxury). 10-15 packing items. 5-7 local tips.`;

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 8000,
    messages: [
      { 
        role: 'system', 
        content: 'You are an expert travel planner. Always respond with valid JSON only. No markdown, no backticks, no explanation.' 
      },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
  });

  const text = response.choices[0].message.content.trim();
  const clean = text.replace(/^```json\n?|\n?```$/g, '').trim();
  const data = JSON.parse(clean);

  return { 
    data, 
    tokensUsed: response.usage?.total_tokens || 0 
  };
};

const regenerateDay = async ({ destination, dayNumber, currentDay, userRequest, budgetType, interests }) => {
  const prompt = `You are an expert travel planner. Regenerate Day ${dayNumber} of a trip to ${destination}.

Current day: ${JSON.stringify(currentDay, null, 2)}
User request: "${userRequest || `More aligned with ${interests.join(', ')}`}"
Budget: ${BUDGET_MAP[budgetType] || budgetType}

Respond with ONLY valid JSON, no markdown, no backticks:
{
  "day": ${dayNumber},
  "date": "${currentDay.date || ''}",
  "theme": "Theme",
  "activities": [
    {
      "time": "9:00 AM",
      "title": "Activity",
      "description": "Description",
      "type": "sightseeing",
      "estimatedCost": 20
    }
  ],
  "notes": "Tip"
}`;

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 2000,
    messages: [
      { 
        role: 'system', 
        content: 'You are an expert travel planner. Always respond with valid JSON only. No markdown, no backticks.' 
      },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
  });

  const text = response.choices[0].message.content.trim();
  const clean = text.replace(/^```json\n?|\n?```$/g, '').trim();
  return JSON.parse(clean);
};

module.exports = { generateItinerary, regenerateDay };