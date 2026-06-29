'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, ArrowLeft, MapPin, Calendar, Users, Wallet } from 'lucide-react';
import Link from 'next/link';
import { tripsAPI, aiAPI } from '@/lib/api';
import { INTERESTS, TripFormData } from '@/types';
import clsx from 'clsx';

const TRAVEL_STYLES = [
  { value: 'solo', label: '🧍 Solo', desc: 'Just me' },
  { value: 'couple', label: '👫 Couple', desc: 'Romantic trip' },
  { value: 'family', label: '👨‍👩‍👧 Family', desc: 'With kids' },
  { value: 'group', label: '👯 Group', desc: 'Friends' },
  { value: 'business', label: '💼 Business', desc: 'Work + leisure' },
];

const BUDGET_OPTIONS = [
  { value: 'low', label: '💸 Budget', desc: 'Hostels & street food', color: 'border-green-300 bg-green-50 text-green-700' },
  { value: 'medium', label: '💰 Mid-Range', desc: '3-star hotels, local dining', color: 'border-blue-300 bg-blue-50 text-blue-700' },
  { value: 'high', label: '💎 Luxury', desc: '5-star hotels, fine dining', color: 'border-purple-300 bg-purple-50 text-purple-700' },
];

const STEPS = ['Destination', 'Details', 'Interests', 'Review'];

export default function NewTripPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<TripFormData>({
    destination: '',
    numberOfDays: 5,
    budgetType: 'medium',
    interests: [],
    travelStyle: 'solo',
    startDate: '',
  });

  const toggleInterest = (interest: string) => {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter((i) => i !== interest)
        : [...f.interests, interest],
    }));
  };

  const canProceed = () => {
    if (step === 0) return form.destination.trim().length >= 2;
    if (step === 1) return form.numberOfDays >= 1 && form.budgetType && form.travelStyle;
    if (step === 2) return form.interests.length >= 1;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Create the trip record
      const { data: tripData } = await tripsAPI.create(form);
      const tripId = tripData.trip._id;

      // 2. Trigger AI generation
      await aiAPI.generate(tripId);

      // 3. Redirect to trip view
      router.push(`/trip/${tripId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-primary-600 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Crafting your itinerary...</h2>
          <p className="text-slate-500 mb-4">Our AI is generating a personalized trip to <strong>{form.destination}</strong></p>
          <div className="flex flex-col gap-2 text-sm text-slate-400">
            <div className="flex items-center gap-2 justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
              Building day-by-day schedule
            </div>
            <p>Calculating your budget breakdown</p>
            <p>Finding the best hotels</p>
            <p>Packing list & local tips</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                  i < step ? 'bg-primary-600 text-white' :
                  i === step ? 'bg-primary-600 text-white ring-4 ring-primary-100' :
                  'bg-slate-200 text-slate-500'
                )}
              >
                {i < step ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={clsx('flex-1 h-1 rounded-full w-12', i < step ? 'bg-primary-600' : 'bg-slate-200')} />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-500">Step {step + 1} of {STEPS.length}: <strong>{STEPS[step]}</strong></p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
      )}

      <div className="card">
        {/* Step 0: Destination */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-bold text-slate-900">Where are you headed?</h2>
            </div>
            <div>
              <label className="label">Destination</label>
              <input
                type="text"
                className="input text-lg"
                placeholder="e.g. Tokyo, Japan"
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
                autoFocus
              />
              <p className="text-xs text-slate-400 mt-1.5">City, country, or region</p>
            </div>
            <div>
              <label className="label">Start Date (Optional)</label>
              <input
                type="date"
                className="input"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-bold text-slate-900">Trip Details</h2>
            </div>
            <div>
              <label className="label">Number of Days: <strong>{form.numberOfDays}</strong></label>
              <input
                type="range"
                min={1}
                max={21}
                value={form.numberOfDays}
                onChange={(e) => setForm({ ...form, numberOfDays: parseInt(e.target.value) })}
                className="w-full accent-primary-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>1 day</span><span>21 days</span>
              </div>
            </div>

            <div>
              <label className="label flex items-center gap-2"><Users className="w-4 h-4" /> Travel Style</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TRAVEL_STYLES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setForm({ ...form, travelStyle: s.value as any })}
                    className={clsx(
                      'p-3 rounded-xl border-2 text-left transition-all',
                      form.travelStyle === s.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div className="font-semibold text-sm">{s.label}</div>
                    <div className="text-xs text-slate-400">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label flex items-center gap-2"><Wallet className="w-4 h-4" /> Budget Type</label>
              <div className="grid grid-cols-3 gap-3">
                {BUDGET_OPTIONS.map((b) => (
                  <button
                    key={b.value}
                    type="button"
                    onClick={() => setForm({ ...form, budgetType: b.value as any })}
                    className={clsx(
                      'p-3 rounded-xl border-2 text-left transition-all',
                      form.budgetType === b.value ? `border-2 ${b.color}` : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div className="font-bold text-sm">{b.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5 hidden sm:block">{b.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Interests */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">What are your interests?</h2>
            <p className="text-sm text-slate-500 mb-5">Select all that apply ({form.interests.length} selected)</p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={clsx(
                    'px-4 py-2 rounded-full border-2 text-sm font-medium transition-all',
                    form.interests.includes(interest)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  )}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-5">Review Your Trip</h2>
            <div className="space-y-3 mb-6">
              {[
                { label: 'Destination', value: form.destination },
                { label: 'Duration', value: `${form.numberOfDays} days` },
                { label: 'Travel Style', value: TRAVEL_STYLES.find(s => s.value === form.travelStyle)?.label },
                { label: 'Budget', value: BUDGET_OPTIONS.find(b => b.value === form.budgetType)?.label },
                { label: 'Interests', value: form.interests.join(', ') || 'None selected' },
                ...(form.startDate ? [{ label: 'Start Date', value: new Date(form.startDate).toLocaleDateString() }] : []),
              ].map((item) => (
                <div key={item.label} className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500 text-sm">{item.label}</span>
                  <span className="font-semibold text-slate-900 text-sm text-right max-w-[60%]">{item.value}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-400 bg-slate-50 p-3 rounded-xl">
              🤖 Our AI will generate a complete itinerary, budget, hotel suggestions, packing list, and local tips for your trip.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t border-slate-100">
          <button
            onClick={() => setStep((s) => s - 1)}
            className={clsx('btn-secondary', step === 0 && 'invisible')}
          >
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="btn-primary"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !canProceed()}
              className="btn-primary flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Generate My Itinerary
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
