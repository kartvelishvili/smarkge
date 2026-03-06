import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useNavigate } from 'react-router-dom';

const INACTIVITY_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart'];
const LAST_ACTIVITY_KEY = 'admin_last_activity';

/**
 * useAdminSessionExpiry
 * 
 * Tracks user activity and forces logout after 24 hours of inactivity.
 * Also checks on mount if the stored last-activity timestamp is expired.
 */
export const useAdminSessionExpiry = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const forceLogout = useCallback(async () => {
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    await supabase.auth.signOut();
    navigate('/paneli', { replace: true });
  }, [navigate]);

  const resetTimer = useCallback(() => {
    if (!session) return;
    
    const now = Date.now();
    localStorage.setItem(LAST_ACTIVITY_KEY, String(now));

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      forceLogout();
    }, INACTIVITY_TIMEOUT_MS);
  }, [session, forceLogout]);

  useEffect(() => {
    if (!session) return;

    // Check if session is already expired from a previous visit
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (lastActivity) {
      const elapsed = Date.now() - Number(lastActivity);
      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        forceLogout();
        return;
      }
    }

    // Initialize timer
    resetTimer();

    // Listen for user activity
    const handleActivity = () => resetTimer();
    ACTIVITY_EVENTS.forEach((event) =>
      document.addEventListener(event, handleActivity, { passive: true })
    );

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((event) =>
        document.removeEventListener(event, handleActivity)
      );
    };
  }, [session, resetTimer, forceLogout]);
};
