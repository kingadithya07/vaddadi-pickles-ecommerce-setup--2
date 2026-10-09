import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticatedAdmin, setIsAuthenticatedAdmin] = useState(false);
  const setAdmin = useStore((state) => state.setAdmin);

  useEffect(() => {
    async function verifyAdmin() {
      try {
        // First verify we actually have a valid token right now
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          throw new Error('No active session found.');
        }

        // We fetch the profile securely from the database using the session's token.
        // This cannot be spoofed by modifying localStorage.
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError || profile?.role !== 'admin') {
          throw new Error('User does not have admin privileges.');
        }

        setAdmin(true);
        setIsAuthenticatedAdmin(true);
      } catch (error) {
        console.error('Admin security verification failed:', error);
        setAdmin(false);
        setIsAuthenticatedAdmin(false);
      } finally {
        setIsVerifying(false);
      }
    }

    verifyAdmin();
  }, [setAdmin]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 flex-col gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        <p className="text-gray-500 font-medium">Verifying security credentials...</p>
      </div>
    );
  }

  if (!isAuthenticatedAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
