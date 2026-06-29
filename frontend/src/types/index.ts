export interface Activity {
  _id?: string;
  time: string;
  title: string;
  description: string;
  type: 'food' | 'sightseeing' | 'adventure' | 'shopping' | 'culture' | 'transport' | 'accommodation' | 'other';
  estimatedCost: number;
}

export interface DayPlan {
  day: number;
  date: string;
  theme: string;
  activities: Activity[];
  notes: string;
}

export interface Budget {
  flights: number;
  accommodation: number;
  food: number;
  activities: number;
  transport: number;
  miscellaneous: number;
  total: number;
  currency: string;
  notes: string;
}

export interface Hotel {
  name: string;
  category: 'budget' | 'mid-range' | 'luxury';
  pricePerNight: number;
  rating: number;
  highlights: string[];
  location: string;
}

export interface Trip {
  _id: string;
  user: string;
  title: string;
  destination: string;
  numberOfDays: number;
  startDate?: string;
  budgetType: 'low' | 'medium' | 'high';
  interests: string[];
  travelStyle: 'solo' | 'couple' | 'family' | 'group' | 'business';
  status: 'generating' | 'active' | 'completed' | 'archived';
  itinerary: DayPlan[];
  budget: Budget;
  hotels: Hotel[];
  aiSummary: string;
  packingList: string[];
  localTips: string[];
  weatherSummary: string;
  createdAt: string;
  updatedAt: string;
}

export interface TripFormData {
  destination: string;
  numberOfDays: number;
  budgetType: 'low' | 'medium' | 'high';
  interests: string[];
  travelStyle: 'solo' | 'couple' | 'family' | 'group' | 'business';
  startDate?: string;
}

export const INTERESTS = [
  'Food & Cuisine',
  'Culture & History',
  'Adventure & Outdoors',
  'Shopping',
  'Art & Museums',
  'Nightlife',
  'Nature & Wildlife',
  'Architecture',
  'Sports',
  'Photography',
  'Relaxation & Wellness',
  'Local Experiences',
];

export const ACTIVITY_ICONS: Record<Activity['type'], string> = {
  food: '🍜',
  sightseeing: '🏛️',
  adventure: '🧗',
  shopping: '🛍️',
  culture: '🎭',
  transport: '🚌',
  accommodation: '🏨',
  other: '📍',
};

export const BUDGET_LABELS: Record<string, string> = {
  low: '💸 Budget',
  medium: '💰 Mid-Range',
  high: '💎 Luxury',
};
