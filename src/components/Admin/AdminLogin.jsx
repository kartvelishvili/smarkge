import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useLoginThrottle } from '@/hooks/useLoginThrottle';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session, loading: authLoading } = useAuth();
  const {
    isLockedOut,
    getRemainingLockoutSeconds,
    recordFailedAttempt,
    clearAttempts,
    attemptsCount,
    maxAttempts,
  } = useLoginThrottle();

  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const locked = attemptsCount >= maxAttempts;

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (!authLoading && session) {
      navigate('/paneli/dashboard', { replace: true });
    }
  }, [session, authLoading, navigate]);

  // Lockout countdown timer
  useEffect(() => {
    if (!locked) return;

    const tick = () => {
      const remaining = getRemainingLockoutSeconds();
      setLockoutRemaining(remaining);
      if (remaining <= 0) clearInterval(intervalId);
    };

    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [locked, getRemainingLockoutSeconds]);

  const formatLockoutTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Check lockout before attempting
    if (isLockedOut()) {
      const remaining = getRemainingLockoutSeconds();
      setLockoutRemaining(remaining);
      toast({
        variant: 'destructive',
        title: 'Account Locked',
        description: `Too many failed attempts. Try again in ${formatLockoutTime(remaining)}.`,
      });
      return;
    }

    if (!credentials.email || !credentials.password) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter email and password' });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email.trim(),
        password: credentials.password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        clearAttempts();
        toast({ title: 'Success', description: 'Logged in successfully' });
        navigate('/paneli/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);

      const nowLocked = recordFailedAttempt();
      
      if (nowLocked) {
        const remaining = getRemainingLockoutSeconds();
        setLockoutRemaining(remaining);
        toast({
          variant: 'destructive',
          title: 'Account Locked',
          description: `Too many failed attempts. Try again in ${formatLockoutTime(remaining)}.`,
        });
      } else {
        const remainingAttempts = maxAttempts - attemptsCount - 1;
        toast({
          variant: 'destructive',
          title: 'Error',
          description: `Invalid credentials. ${remainingAttempts > 0 ? `${remainingAttempts} attempts remaining.` : ''}`,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#0D1126] border border-[#5468E7]/30 rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Admin Panel</h2>
          <p className="text-gray-400">Please sign in to continue</p>
        </div>

        {locked && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-400 text-sm font-medium">Account temporarily locked</p>
              <p className="text-red-400/70 text-xs mt-1">
                Too many failed login attempts. Try again in {formatLockoutTime(lockoutRemaining)}.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-[#5468E7]" />
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                className="w-full bg-[#0A0F1C] border border-[#5468E7]/30 rounded-lg py-3 pl-10 pr-4 text-white focus:border-[#5468E7] focus:outline-none"
                placeholder="Enter your email"
                disabled={isLoading || locked}
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-[#5468E7]" />
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="w-full bg-[#0A0F1C] border border-[#5468E7]/30 rounded-lg py-3 pl-10 pr-4 text-white focus:border-[#5468E7] focus:outline-none"
                placeholder="Enter password"
                disabled={isLoading || locked}
                autoComplete="current-password"
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading || locked} className="w-full bg-[#5468E7] hover:bg-[#3A4BCF] py-6 text-lg">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;