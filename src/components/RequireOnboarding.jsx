import { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function RequireOnboarding() {
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(null);
  const location = useLocation();

  useEffect(() => {
    async function checkOnboardingStatus() {
      try {
        const user = supabase.auth.user();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('onboarded')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setOnboarded(data?.onboarded ?? false);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setOnboarded(false);
      } finally {
        setLoading(false);
      }
    }

    checkOnboardingStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const user = supabase.auth.user();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!onboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (onboarded && location.pathname === '/onboarding') {
    return <Navigate to="/tasks" replace />;
  }

  return <Outlet />;
} 