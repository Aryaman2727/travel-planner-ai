'use client';
import Link from 'next/link';
import { Plane, Map, DollarSign, Star, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-primary-600">
            <Plane className="w-6 h-6" />
            WanderAI
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-slate-600 hover:text-slate-900 font-medium px-4 py-2 rounded-lg">
              Log in
            </Link>
            <Link href="/auth/register" className="btn-primary text-sm">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Powered by Claude AI
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
            Your perfect trip,{' '}
            <span className="text-transparent bg-clip-text gradient-hero inline-block">
              planned by AI
            </span>
          </h1>
          <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto">
            Tell us where you want to go. WanderAI generates a day-by-day itinerary, budget breakdown, hotel recommendations, and local tips — instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="btn-primary flex items-center gap-2 justify-center text-base">
              Plan My Trip <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/auth/login" className="btn-secondary text-base">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Everything you need to travel smarter</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Map className="w-7 h-7 text-primary-600" />,
                title: 'Day-by-Day Itineraries',
                desc: 'Personalized schedules based on your interests, travel style, and duration.',
              },
              {
                icon: <DollarSign className="w-7 h-7 text-primary-600" />,
                title: 'Smart Budget Planning',
                desc: 'Accurate cost breakdowns for flights, hotels, food, and activities.',
              },
              {
                icon: <Star className="w-7 h-7 text-primary-600" />,
                title: 'Hotel Recommendations',
                desc: 'Curated hotel suggestions across budget, mid-range, and luxury categories.',
              },
              {
                icon: <Zap className="w-7 h-7 text-accent-500" />,
                title: 'Editable in Seconds',
                desc: 'Remove activities, add your own, or regenerate any day with a custom prompt.',
              },
              {
                icon: <Shield className="w-7 h-7 text-accent-500" />,
                title: 'Private & Secure',
                desc: 'Your trips are private. Complete data isolation between users.',
              },
              {
                icon: <Sparkles className="w-7 h-7 text-accent-500" />,
                title: 'Packing Lists & Local Tips',
                desc: 'AI-generated packing lists and insider local tips for your destination.',
              },
            ].map((f) => (
              <div key={f.title} className="card hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to explore the world?</h2>
          <p className="text-slate-500 mb-8">Join thousands of travelers planning smarter trips with AI.</p>
          <Link href="/auth/register" className="btn-primary inline-flex items-center gap-2 text-base">
            Start Planning Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 px-4 text-center text-sm text-slate-400">
        <div className="flex items-center justify-center gap-2 font-semibold text-primary-600 mb-2">
          <Plane className="w-4 h-4" />
          WanderAI
        </div>
        <p>Built with ❤️ for the Trao FS Assessment</p>
      </footer>
    </div>
  );
}
