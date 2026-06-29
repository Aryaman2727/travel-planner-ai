'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plane, LogOut, Plus, Map, User } from 'lucide-react';
import { AuthProvider, useAuth } from '@/lib/auth';

function DashboardNav() {
  const { user, logout } = useAuth();
  return (
    <nav className="fixed top-0 w-full bg-white border-b border-slate-100 z-50 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary-600">
          <Plane className="w-6 h-6" />
          WanderAI
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/trip/new" className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> New Trip
          </Link>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            <span className="hidden sm:block font-medium">{user?.name}</span>
          </div>
          <button onClick={logout} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-primary-600">
          <Plane className="w-6 h-6 animate-bounce" />
          <span className="font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav />
      <main className="pt-16">{children}</main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProtectedLayout>{children}</ProtectedLayout>
    </AuthProvider>
  );
}
