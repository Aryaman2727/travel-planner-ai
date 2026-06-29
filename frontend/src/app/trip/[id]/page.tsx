'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Map, Clock, DollarSign, Hotel, Backpack, Lightbulb,
  Cloud, Plus, Trash2, RefreshCw, Loader2, Star, ChevronDown, ChevronUp,
  Edit2, Check, X
} from 'lucide-react';
import { tripsAPI, aiAPI } from '@/lib/api';
import { Trip, DayPlan, Activity, ACTIVITY_ICONS, BUDGET_LABELS } from '@/types';
import clsx from 'clsx';

type Tab = 'itinerary' | 'budget' | 'hotels' | 'packing' | 'tips';

export default function TripPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('itinerary');
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [regenerating, setRegenerating] = useState<number | null>(null);
  const [regenPrompt, setRegenPrompt] = useState('');
  const [regenTarget, setRegenTarget] = useState<number | null>(null);
  const [newActivity, setNewActivity] = useState<{ dayIndex: number } | null>(null);
  const [newActivityData, setNewActivityData] = useState({ title: '', description: '', time: '', type: 'other' as Activity['type'] });

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const fetchTrip = async () => {
    try {
      const { data } = await tripsAPI.get(id);
      setTrip(data.trip);
    } catch {
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveActivity = async (dayIndex: number, activityIndex: number) => {
    if (!trip) return;
    try {
      const { data } = await tripsAPI.updateActivity(trip._id, dayIndex, {
        action: 'remove',
        activityIndex,
      });
      setTrip(data.trip);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddActivity = async (dayIndex: number) => {
    if (!trip || !newActivityData.title.trim()) return;
    try {
      const { data } = await tripsAPI.updateActivity(trip._id, dayIndex, {
        action: 'add',
        activity: newActivityData,
      });
      setTrip(data.trip);
      setNewActivity(null);
      setNewActivityData({ title: '', description: '', time: '', type: 'other' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegenerateDay = async (dayNumber: number) => {
    if (!trip) return;
    setRegenerating(dayNumber);
    try {
      const { data } = await aiAPI.regenerateDay(trip._id, {
        dayNumber,
        userRequest: regenPrompt,
      });
      setTrip(data.trip);
      setRegenTarget(null);
      setRegenPrompt('');
    } catch (err) {
      console.error(err);
    } finally {
      setRegenerating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!trip) return null;

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'itinerary', label: 'Itinerary', icon: <Map className="w-4 h-4" /> },
    { id: 'budget', label: 'Budget', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'hotels', label: 'Hotels', icon: <Hotel className="w-4 h-4" /> },
    { id: 'packing', label: 'Packing', icon: <Backpack className="w-4 h-4" /> },
    { id: 'tips', label: 'Local Tips', icon: <Lightbulb className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">{trip.title}</h1>
            <p className="text-primary-600 font-medium flex items-center gap-1">
              <Map className="w-4 h-4" /> {trip.destination}
            </p>
            {trip.aiSummary && (
              <p className="text-slate-500 text-sm mt-3 leading-relaxed max-w-xl">{trip.aiSummary}</p>
            )}
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <span className="badge bg-primary-50 text-primary-700">
              <Clock className="w-3.5 h-3.5" /> {trip.numberOfDays} days
            </span>
            <span className="badge bg-slate-100 text-slate-600">{BUDGET_LABELS[trip.budgetType]}</span>
            {trip.budget?.total > 0 && (
              <span className="badge bg-green-50 text-green-700">
                <DollarSign className="w-3.5 h-3.5" /> ~${trip.budget.total.toLocaleString()} total
              </span>
            )}
          </div>
        </div>

        {trip.weatherSummary && (
          <div className="mt-4 flex items-start gap-2 bg-blue-50 text-blue-700 px-4 py-3 rounded-xl text-sm">
            <Cloud className="w-4 h-4 mt-0.5 flex-shrink-0" />
            {trip.weatherSummary}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Itinerary Tab */}
      {activeTab === 'itinerary' && (
        <div className="space-y-4">
          {trip.itinerary.map((day, dayIndex) => (
            <div key={day.day} className="card">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedDay(expandedDay === dayIndex ? null : dayIndex)}
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
                      D{day.day}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{day.theme || `Day ${day.day}`}</h3>
                      {day.date && <p className="text-xs text-slate-400">{day.date}</p>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{day.activities.length} activities</span>
                  {expandedDay === dayIndex ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </div>

              {expandedDay === dayIndex && (
                <div className="mt-4 border-t border-slate-50 pt-4">
                  {day.activities.map((activity, actIndex) => (
                    <div key={actIndex} className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0 group">
                      <div className="text-2xl w-8 flex-shrink-0">{ACTIVITY_ICONS[activity.type] || '📍'}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            {activity.time && <p className="text-xs text-slate-400 mb-0.5">{activity.time}</p>}
                            <h4 className="font-semibold text-slate-900 text-sm">{activity.title}</h4>
                            {activity.description && (
                              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{activity.description}</p>
                            )}
                            {activity.estimatedCost > 0 && (
                              <p className="text-xs text-green-600 font-medium mt-1">~${activity.estimatedCost}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveActivity(dayIndex, actIndex)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-300 hover:text-red-400 transition-all flex-shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add activity */}
                  {newActivity?.dayIndex === dayIndex ? (
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl space-y-2">
                      <input
                        type="text"
                        className="input text-sm"
                        placeholder="Activity title *"
                        value={newActivityData.title}
                        onChange={(e) => setNewActivityData({ ...newActivityData, title: e.target.value })}
                        autoFocus
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" className="input text-sm" placeholder="Time (e.g. 2:00 PM)" value={newActivityData.time} onChange={(e) => setNewActivityData({ ...newActivityData, time: e.target.value })} />
                        <select className="input text-sm" value={newActivityData.type} onChange={(e) => setNewActivityData({ ...newActivityData, type: e.target.value as Activity['type'] })}>
                          {['food','sightseeing','adventure','shopping','culture','transport','other'].map(t => (
                            <option key={t} value={t}>{ACTIVITY_ICONS[t as Activity['type']]} {t}</option>
                          ))}
                        </select>
                      </div>
                      <input type="text" className="input text-sm" placeholder="Description (optional)" value={newActivityData.description} onChange={(e) => setNewActivityData({ ...newActivityData, description: e.target.value })} />
                      <div className="flex gap-2">
                        <button onClick={() => handleAddActivity(dayIndex)} className="btn-primary text-sm flex items-center gap-1 py-2">
                          <Check className="w-3.5 h-3.5" /> Add
                        </button>
                        <button onClick={() => setNewActivity(null)} className="btn-secondary text-sm py-2">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setNewActivity({ dayIndex })}
                      className="mt-3 w-full flex items-center gap-2 text-sm text-slate-400 hover:text-primary-600 py-2 border-2 border-dashed border-slate-200 hover:border-primary-300 rounded-xl justify-center transition-all"
                    >
                      <Plus className="w-4 h-4" /> Add Activity
                    </button>
                  )}

                  {day.notes && (
                    <p className="mt-3 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                      💡 {day.notes}
                    </p>
                  )}

                  {/* Regenerate day */}
                  {regenTarget === dayIndex ? (
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl space-y-2">
                      <input
                        type="text"
                        className="input text-sm"
                        placeholder="Custom request (optional): e.g. 'More outdoor activities'"
                        value={regenPrompt}
                        onChange={(e) => setRegenPrompt(e.target.value)}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRegenerateDay(day.day)}
                          disabled={regenerating === day.day}
                          className="btn-primary text-sm flex items-center gap-1.5 py-2"
                        >
                          {regenerating === day.day ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                          Regenerate
                        </button>
                        <button onClick={() => setRegenTarget(null)} className="btn-secondary text-sm py-2">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRegenTarget(dayIndex)}
                      className="mt-3 text-xs flex items-center gap-1 text-slate-400 hover:text-primary-600 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" /> Regenerate this day with AI
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Budget Tab */}
      {activeTab === 'budget' && trip.budget && (
        <div className="card">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Budget Breakdown</h2>
          <div className="space-y-3">
            {[
              { label: '✈️ Flights', value: trip.budget.flights },
              { label: '🏨 Accommodation', value: trip.budget.accommodation },
              { label: '🍜 Food', value: trip.budget.food },
              { label: '🎭 Activities', value: trip.budget.activities },
              { label: '🚌 Local Transport', value: trip.budget.transport },
              { label: '🛍️ Miscellaneous', value: trip.budget.miscellaneous },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3 border-b border-slate-50">
                <span className="text-slate-600">{item.label}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-slate-100 rounded-full h-1.5">
                    <div
                      className="bg-primary-500 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, (item.value / trip.budget.total) * 100)}%` }}
                    />
                  </div>
                  <span className="font-semibold text-slate-900 w-20 text-right">
                    {trip.budget.currency} {item.value.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
            <div className="flex justify-between py-3 font-bold text-lg border-t-2 border-slate-200 mt-2">
              <span>Total Estimated</span>
              <span className="text-primary-600">{trip.budget.currency} {trip.budget.total.toLocaleString()}</span>
            </div>
          </div>
          {trip.budget.notes && (
            <p className="mt-4 text-sm text-slate-500 bg-slate-50 p-3 rounded-xl">{trip.budget.notes}</p>
          )}
        </div>
      )}

      {/* Hotels Tab */}
      {activeTab === 'hotels' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Recommended Hotels</h2>
          {trip.hotels.map((hotel, i) => (
           <div key={i} className="card cursor-pointer hover:shadow-lg transition-all" onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(hotel.name + ' ' + trip.destination)}`, '_blank')}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-slate-900">{hotel.name}</h3>
                  <p className="text-slate-500 text-sm">{hotel.location}</p>
                </div>
                <div className="text-right">
                  <span className={clsx('badge text-xs', {
                    'bg-green-50 text-green-700': hotel.category === 'budget',
                    'bg-blue-50 text-blue-700': hotel.category === 'mid-range',
                    'bg-purple-50 text-purple-700': hotel.category === 'luxury',
                  })}>
                    {hotel.category === 'budget' ? '💸 Budget' : hotel.category === 'mid-range' ? '💰 Mid-Range' : '💎 Luxury'}
                  </span>
                  {hotel.pricePerNight > 0 && (
                    <p className="text-sm font-bold text-slate-900 mt-1">${hotel.pricePerNight}/night</p>
                  )}
                </div>
              </div>
              {hotel.rating > 0 && (
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={clsx('w-4 h-4', i < Math.round(hotel.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200')}
                    />
                  ))}
                  <span className="text-sm text-slate-500 ml-1">{hotel.rating}</span>
                </div>
              )}
              {hotel.highlights?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {hotel.highlights.map((h, i) => (
                    <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{h}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Packing Tab */}
      {activeTab === 'packing' && (
        <div className="card">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Packing List</h2>
          <p className="text-sm text-slate-500 mb-4">AI-curated for {trip.destination}</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {trip.packingList.map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50">
                <input type="checkbox" className="w-4 h-4 rounded accent-primary-600 flex-shrink-0" />
                <span className="text-sm text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Local Tips Tab */}
      {activeTab === 'tips' && (
        <div className="card">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Local Insider Tips</h2>
          <p className="text-sm text-slate-500 mb-5">Genuine advice for visiting {trip.destination}</p>
          <div className="space-y-3">
            {trip.localTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <span className="text-xl flex-shrink-0">💡</span>
                <p className="text-sm text-amber-900 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
