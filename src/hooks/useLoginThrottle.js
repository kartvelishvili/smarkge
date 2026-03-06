import { useState, useCallback } from 'react';

const LOCKOUT_KEY = 'admin_login_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/**
 * useLoginThrottle
 * 
 * Client-side login attempt throttling.
 * After MAX_ATTEMPTS failed logins within the lockout window,
 * blocks further attempts for LOCKOUT_DURATION_MS.
 * 
 * Stores attempt timestamps in localStorage to persist across page refreshes.
 */
const getAttempts = () => {
  try {
    const raw = localStorage.getItem(LOCKOUT_KEY);
    if (!raw) return [];
    const attempts = JSON.parse(raw);
    const now = Date.now();
    // Keep only attempts within the lockout window
    return attempts.filter((ts) => now - ts < LOCKOUT_DURATION_MS);
  } catch {
    return [];
  }
};

const saveAttempts = (attempts) => {
  localStorage.setItem(LOCKOUT_KEY, JSON.stringify(attempts));
};

export const useLoginThrottle = () => {
  const [attempts, setAttempts] = useState(() => getAttempts());

  const isLockedOut = useCallback(() => {
    const current = getAttempts();
    return current.length >= MAX_ATTEMPTS;
  }, []);

  const getRemainingLockoutSeconds = useCallback(() => {
    const current = getAttempts();
    if (current.length < MAX_ATTEMPTS) return 0;
    const oldestRelevant = current[0]; // earliest attempt in window
    const unlockAt = oldestRelevant + LOCKOUT_DURATION_MS;
    const remaining = Math.max(0, Math.ceil((unlockAt - Date.now()) / 1000));
    return remaining;
  }, []);

  const recordFailedAttempt = useCallback(() => {
    const current = getAttempts();
    current.push(Date.now());
    saveAttempts(current);
    setAttempts(current);
    return current.length >= MAX_ATTEMPTS;
  }, []);

  const clearAttempts = useCallback(() => {
    localStorage.removeItem(LOCKOUT_KEY);
    setAttempts([]);
  }, []);

  return {
    isLockedOut,
    getRemainingLockoutSeconds,
    recordFailedAttempt,
    clearAttempts,
    attemptsCount: attempts.length,
    maxAttempts: MAX_ATTEMPTS,
  };
};
