'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Map, Trash2, Clock, Calendar, Loader2, Plane, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { tripsAPI } from '@/lib/api';
import { Trip, BUDGET_LABELS } from '@/types';
import clsx from 'clsx';

const STATUS_COLORS: Record<string, string> = {
  generating: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  archived: 'bg-slate-100 text-slate-600',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const { data } = await tripsAPI.list();
      setTrips(data.trips);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this trip?')) return;
    setDeleting(id);
    try {
      await tripsAPI.delete(id);
      setTrips((prev) => prev.filter((t) => t._id !== id));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user?.name?.split(' ')[0]}! ✈️
          </h1>
          <p className="text-slate-500 mt-1">
            {trips.length === 0 ? 'Plan your first adventure' : `You have ${trips.length} trip${trips.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link href="/trip/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Trip
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Trips', value: trips.length, icon: '🗺️' },
          { label: 'Active', value: trips.filter(t => t.status === 'active').length, icon: '✈️' },
          { label: 'Completed', value: trips.filter(t => t.status === 'completed').length, icon: '✅' },
          { label: 'Countries', value: new Set(trips.map(t => t.destination.split(',').pop()?.trim())).size, icon: '🌍' },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-slate-900">{s.value}</div>
            <div className="text-xs text-slate-500 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Trip list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : trips.length === 0 ? (
        <div className="card text-center py-16">
          <Plane className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No trips yet</h3>
          <p className="text-slate-400 mb-6">Plan your first AI-powered adventure!</p>
          <Link href="/trip/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Plan My First Trip
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {trips.map((trip) => (
            <Link key={trip._id} href={`/trip/${trip._id}`} className="card hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 relative group block">
              <div className="flex items-start justify-between mb-3">
                <span className={clsx('badge', STATUS_COLORS[trip.status] || 'bg-slate-100 text-slate-600')}>
                  {trip.status}
                </span>
                <button
                  onClick={(e) => handleDelete(e, trip._id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  {deleting === trip._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>

              <h3 className="font-bold text-slate-900 text-lg mb-1 line-clamp-1">{trip.title}</h3>
              <p className="text-primary-600 font-medium text-sm mb-3 flex items-center gap-1">
                <Map className="w-4 h-4" /> {trip.destination}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {trip.numberOfDays} days
                </span>
                <span>{BUDGET_LABELS[trip.budgetType]}</span>
              </div>

              {trip.startDate && (
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {new Date(trip.startDate).toLocaleDateString()}
                </p>
              )}

              <div className="mt-4 flex items-center text-primary-600 text-sm font-medium">
                View Details <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
