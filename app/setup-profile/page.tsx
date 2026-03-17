'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';

export default function SetupProfilePage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    let subscription: any = null;
    let timeout: any = null;

    const checkUser = async () => {
      // If there's a hash with access_token, Supabase will handle it automatically
      // We just need to wait for the session to be established
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUser(session.user);
      } else {
        // Only listen for auth changes if we don't have a session yet
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            setUser(session.user);
          }
        });
        subscription = data.subscription;
        
        // Timeout after 5 seconds if no session is found
        timeout = setTimeout(() => {
          // Check one last time before redirecting
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session && !user) {
              console.error("No session found after 5 seconds. URL:", window.location.href);
              toast.error("Authentication timeout. Please try clicking the invite link again.");
              // router.push('/'); // Disabled for debugging
            }
          });
        }, 5000);
      }
    };
    
    checkUser();

    return () => {
      if (subscription) subscription.unsubscribe();
      if (timeout) clearTimeout(timeout);
    };
  }, [router, user]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
        data: { profile_setup: true }
      });

      if (error) throw error;

      toast.success('Profile setup complete!', {
        description: 'Your password has been set successfully.',
      });
      
      // Redirect based on role
      const role = user?.user_metadata?.role;
      if (role && role !== 'Admin' && role !== 'Owner') {
        router.push('/staff-dashboard');
      } else {
        router.push('/workspace');
      }
    } catch (error: any) {
      console.error('Error setting password:', error);
      toast.error('Failed to set password', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050B14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050B14] text-white flex flex-col items-center justify-center p-6 font-sans selection:bg-cyan-500/30">
      <div className="max-w-md w-full bg-[#0A121E]/80 border border-white/5 p-8 rounded-2xl backdrop-blur-sm shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome, {user.user_metadata?.full_name || 'Team Member'}!</h1>
          <p className="text-gray-400 text-sm">
            You&apos;ve been invited as a <strong className="text-cyan-400">{user.user_metadata?.role || 'Staff'}</strong>. 
            Please set a password to complete your account setup.
          </p>
        </div>

        <form onSubmit={handleSetup} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-gray-400 ml-1 uppercase tracking-wider">New Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-cyan-500 transition-colors">
                <Lock size={16} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#050B14] border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-gray-600 text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-gray-400 ml-1 uppercase tracking-wider">Confirm Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-cyan-500 transition-colors">
                <Lock size={16} />
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#050B14] border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-gray-600 text-sm"
                required
              />
            </div>
          </div>

          <button 
            disabled={isLoading}
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-400 to-cyan-600 text-[#050B14] font-bold py-3 mt-4 rounded-xl hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            Complete Setup & Go to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
