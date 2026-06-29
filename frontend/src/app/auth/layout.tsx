import { AuthProvider } from '@/lib/auth';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-50 flex items-center justify-center p-4">
        {children}
      </div>
    </AuthProvider>
  );
}
