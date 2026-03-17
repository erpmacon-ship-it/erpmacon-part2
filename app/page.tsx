'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff, Check, User, Building2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  companyName: z.string().min(2, 'Company name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function AuthPage() {
  const [view, setView] = useState<'login' | 'signup'>('signup');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Prefetch the workspace route for instant navigation
  useEffect(() => {
    router.prefetch('/workspace');
    router.prefetch('/setup-profile');
    router.prefetch('/staff-dashboard');
    
    // Check for errors or invite tokens in the URL hash or query string
    if (typeof window !== 'undefined') {
      const hashContent = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hashContent);
      const queryParams = new URLSearchParams(window.location.search);
      
      const error = hashParams.get('error') || queryParams.get('error');
      const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');
      
      if (error) {
        console.error('Auth error from URL:', error, errorDescription);
        toast.error('Authentication Error', {
          description: errorDescription ? errorDescription.replace(/\+/g, ' ') : 'The link is invalid or has expired. Please request a new invite.',
          duration: 8000,
        });
        // Clear the hash/query so we don't keep showing the error
        window.history.replaceState(null, '', window.location.pathname);
      } else if (
        hashContent.includes('type=invite') || 
        hashParams.get('type') === 'invite' || 
        queryParams.get('type') === 'invite' ||
        queryParams.has('code')
      ) {
        // If it's an invite link but we are on the root page, redirect to setup-profile
        // This handles the case where Supabase falls back to the Site URL
        console.log("Redirecting to setup-profile due to URL params:", {
          hash: hashContent,
          query: window.location.search
        });
        toast.loading("Processing invite link...");
        router.push('/setup-profile' + window.location.search + window.location.hash);
        return;
      }
    }
    
    // Check if user is already logged in or if this is an invite link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Prevent redirecting if we are already on the setup-profile page
        if (window.location.pathname === '/setup-profile') {
          return;
        }
        
        // If the user was invited but hasn't set up their profile yet, force them to setup-profile
        const metadata = session.user.user_metadata;
        if (metadata?.invited_to_project && !metadata?.profile_setup) {
          router.push('/setup-profile');
          return;
        }
        
        // Check user role to determine where to redirect
        const role = metadata?.role;
        if (role && role !== 'Admin' && role !== 'Owner') {
          router.push('/staff-dashboard');
        } else {
          router.push('/workspace');
        }
      }
    };
    
    checkSession();

    // Listen for auth changes (like when the invite link is clicked and Supabase logs them in)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Prevent redirecting if we are already on the setup-profile page
        if (window.location.pathname === '/setup-profile') {
          return;
        }
        
        // If the user was invited but hasn't set up their profile yet, force them to setup-profile
        const metadata = session.user.user_metadata;
        if (metadata?.invited_to_project && !metadata?.profile_setup) {
          router.push('/setup-profile');
          return;
        }
        
        const role = metadata?.role;
        if (role && role !== 'Admin' && role !== 'Owner') {
          router.push('/staff-dashboard');
        } else {
          router.push('/workspace');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', companyName: '', email: '', password: '' }
  });

  const toggleView = () => {
    setView(view === 'login' ? 'signup' : 'login');
    setShowPassword(false);
    loginForm.reset();
    signupForm.reset();
  };

  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast.error('Sign in failed', {
          description: error.message,
        });
        setIsLoading(false);
        return;
      }

      toast.success('Welcome back!', {
        description: 'Successfully logged into your workspace.',
      });
      
      const role = authData.user?.user_metadata?.role;
      if (role && role !== 'Admin' && role !== 'Owner') {
        router.push('/staff-dashboard');
      } else {
        router.push('/workspace');
      }
    } catch (error: any) {
      toast.error('Authentication Error', {
        description: 'An unexpected error occurred. Please try again.',
      });
      setIsLoading(false);
    }
  };

  const onLoginError = (errors: any) => {
    const firstError = Object.values(errors)[0] as any;
    toast.error('Validation Error', {
      description: firstError?.message || 'Please fill in all required fields correctly.',
    });
  };

  const onSignupSubmit = async (data: SignupFormValues) => {
    if (!agreedToTerms) {
      toast.error('Terms & Conditions', {
        description: 'You must agree to the Terms & Conditions to continue.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error, data: authData } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            company_name: data.companyName,
          }
        }
      });

      if (error) {
        toast.error('Sign up failed', {
          description: error.message,
        });
        setIsLoading(false);
        return;
      }

      // Create workspace for the new user (fire and forget to speed up transition)
      if (authData.user) {
        supabase
          .from('workspaces')
          .insert([{ 
            name: data.companyName,
            user_id: authData.user.id // Adding user_id to prevent database errors
          }])
          .then(({ error: workspaceError }) => {
            if (workspaceError) {
              // Using console.warn instead of console.error to prevent the Next.js red error overlay
              console.warn("Workspace creation note:", workspaceError.message || workspaceError);
            }
          });
      }

      toast.success('Account created!', {
        description: 'Your workspace has been successfully set up.',
      });
      router.push('/workspace');
    } catch (error: any) {
      toast.error('Registration Error', {
        description: 'An unexpected error occurred. Please try again.',
      });
      setIsLoading(false);
    }
  };

  const onSignupError = (errors: any) => {
    const firstError = Object.values(errors)[0] as any;
    toast.error('Validation Error', {
      description: firstError?.message || 'Please fill in all required fields correctly.',
    });
  };

  return (
    <main className="min-h-screen bg-[#050B14] text-white flex flex-col md:flex-row font-sans selection:bg-cyan-500/30">
      {/* Left Side: Auth Form */}
      <div className="flex-1 flex flex-col p-6 md:p-8 lg:p-12 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/5 blur-[100px] rounded-full" />
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-6 md:mb-8 z-10">
          <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center font-bold text-lg text-[#050B14]">
            M
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wider leading-none">MACON</h1>
            <p className="text-[9px] text-gray-400 tracking-[0.2em] font-medium mt-1">REAL ESTATE OS</p>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-md w-full mx-auto md:mx-0 z-10 flex-grow flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                {view === 'login' ? 'Welcome back' : 'Create your workspace'}
              </h2>
              <p className="text-gray-400 text-sm mb-4 md:mb-6">
                {view === 'login' 
                  ? 'Sign in to your workspace' 
                  : 'Join 200+ developers managing assets on MACON.'}
              </p>

              {/* Form Container */}
              <div className="bg-[#0A121E]/50 border border-white/5 p-5 md:p-6 rounded-2xl backdrop-blur-sm shadow-2xl">
                {view === 'login' ? (
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit, onLoginError)} className="space-y-3">
                    {/* Email Field */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-gray-400 ml-1 uppercase tracking-wider">Email Address</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-cyan-500 transition-colors">
                          <Mail size={16} />
                        </div>
                        <input
                          type="email"
                          {...loginForm.register('email')}
                          placeholder="name@company.com"
                          className="w-full bg-[#050B14] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-gray-600 text-sm"
                        />
                      </div>
                      {loginForm.formState.errors.email && (
                        <p className="text-red-500 text-xs ml-1">{loginForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-gray-400 ml-1 uppercase tracking-wider">Password</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-cyan-500 transition-colors">
                          <Lock size={16} />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          {...loginForm.register('password')}
                          placeholder="••••••••"
                          className="w-full bg-[#050B14] border border-white/10 rounded-xl py-2.5 pl-10 pr-10 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-gray-600 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {loginForm.formState.errors.password && (
                        <p className="text-red-500 text-xs ml-1">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    {/* Options */}
                    <div className="flex items-center justify-between text-xs mt-2">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div 
                          className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                            rememberMe ? 'bg-cyan-500 border-cyan-500' : 'border-white/20 group-hover:border-white/40'
                          }`}
                          onClick={() => setRememberMe(!rememberMe)}
                        >
                          {rememberMe && <Check size={12} className="text-[#050B14]" />}
                        </div>
                        <span className="text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
                      </label>
                      <a href="#" className="text-cyan-500 hover:text-cyan-400 transition-colors font-medium">
                        Forgot password?
                      </a>
                    </div>

                    {/* Action Button */}
                    <button 
                      disabled={isLoading}
                      type="submit"
                      className="w-full bg-gradient-to-r from-cyan-400 to-cyan-600 text-[#050B14] font-bold py-2.5 mt-2 rounded-xl hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading && <Loader2 size={16} className="animate-spin" />}
                      Sign In
                    </button>
                  </form>
                ) : (
                  <form onSubmit={signupForm.handleSubmit(onSignupSubmit, onSignupError)} className="space-y-3">
                    {/* Full Name Field */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-gray-400 ml-1 uppercase tracking-wider">Full Name</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-cyan-500 transition-colors">
                          <User size={16} />
                        </div>
                        <input
                          type="text"
                          {...signupForm.register('fullName')}
                          placeholder="John Doe"
                          className="w-full bg-[#050B14] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-gray-600 text-sm"
                        />
                      </div>
                      {signupForm.formState.errors.fullName && (
                        <p className="text-red-500 text-xs ml-1">{signupForm.formState.errors.fullName.message}</p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-gray-400 ml-1 uppercase tracking-wider">Work Email</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-cyan-500 transition-colors">
                          <Mail size={16} />
                        </div>
                        <input
                          type="email"
                          {...signupForm.register('email')}
                          placeholder="name@company.com"
                          className="w-full bg-[#050B14] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-gray-600 text-sm"
                        />
                      </div>
                      {signupForm.formState.errors.email && (
                        <p className="text-red-500 text-xs ml-1">{signupForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    {/* Company Name Field */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-gray-400 ml-1 uppercase tracking-wider">Company Name</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-cyan-500 transition-colors">
                          <Building2 size={16} />
                        </div>
                        <input
                          type="text"
                          {...signupForm.register('companyName')}
                          placeholder="Real Estate Corp"
                          className="w-full bg-[#050B14] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-gray-600 text-sm"
                        />
                      </div>
                      {signupForm.formState.errors.companyName && (
                        <p className="text-red-500 text-xs ml-1">{signupForm.formState.errors.companyName.message}</p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-gray-400 ml-1 uppercase tracking-wider">Password</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-cyan-500 transition-colors">
                          <Lock size={16} />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          {...signupForm.register('password')}
                          placeholder="••••••••"
                          className="w-full bg-[#050B14] border border-white/10 rounded-xl py-2.5 pl-10 pr-10 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-gray-600 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {signupForm.formState.errors.password && (
                        <p className="text-red-500 text-xs ml-1">{signupForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    {/* Options */}
                    <div className="flex items-center justify-between text-xs mt-2">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div 
                          className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                            agreedToTerms ? 'bg-cyan-500 border-cyan-500' : 'border-white/20 group-hover:border-white/40'
                          }`}
                          onClick={() => setAgreedToTerms(!agreedToTerms)}
                        >
                          {agreedToTerms && <Check size={12} className="text-[#050B14]" />}
                        </div>
                        <span className="text-gray-400 group-hover:text-gray-300 transition-colors">
                          I agree to <a href="#" className="text-cyan-500 hover:underline">Terms & Conditions</a>
                        </span>
                      </label>
                    </div>

                    {/* Action Button */}
                    <button 
                      disabled={isLoading}
                      type="submit"
                      className="w-full bg-gradient-to-r from-cyan-400 to-cyan-600 text-[#050B14] font-bold py-2.5 mt-2 rounded-xl hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading && <Loader2 size={16} className="animate-spin" />}
                      Create Account
                    </button>
                  </form>
                )}

                {/* Divider */}
                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-white/5"></div>
                  <span className="flex-shrink mx-4 text-gray-500 text-[9px] font-bold tracking-widest uppercase">OR</span>
                  <div className="flex-grow border-t border-white/5"></div>
                </div>

                {/* Secondary Action */}
                {view === 'login' ? (
                  <button 
                    onClick={toggleView}
                    className="w-full border border-cyan-500/30 text-cyan-500 font-bold py-2.5 rounded-xl hover:bg-cyan-500/5 transition-all text-sm"
                  >
                    Create new account
                  </button>
                ) : (
                  <button className="w-full bg-white text-gray-900 font-bold py-2.5 rounded-xl hover:bg-gray-100 transition-all text-sm flex items-center justify-center gap-3">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </button>
                )}
              </div>

              {/* Toggle View Link */}
              <div className="mt-4 text-center">
                <p className="text-gray-400 text-xs">
                  {view === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    onClick={toggleView}
                    className="text-cyan-500 font-bold hover:underline"
                  >
                    {view === 'login' ? 'Create Account' : 'Sign In'}
                  </button>
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 text-center md:text-left">
          <p className="text-gray-600 text-[9px] tracking-wider uppercase">
            © 2024 MACON Platforms Inc. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side: Image & Content */}
      <div className="hidden md:flex flex-1 relative bg-[#0A121E] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
          alt="Modern Skyscraper"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover opacity-30 grayscale contrast-125"
          priority
          referrerPolicy="no-referrer"
        />
        
        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#050B14]/50" />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, #22d3ee 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Dynamic Content */}
        <div className="absolute bottom-0 left-0 p-16 lg:p-20 xl:p-24 max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight text-gray-100 mb-12">
                {view === 'login' 
                  ? '"Trusted by 200+ real estate developers across the globe to manage $50B+ in property assets."'
                  : '"Build the future of real estate."'}
              </p>

              <div className="flex items-center gap-6">
                {/* Avatars */}
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#050B14] overflow-hidden relative">
                      <Image
                        src={`https://picsum.photos/seed/user${i + (view === 'login' ? 0 : 10)}/100/100`}
                        alt={`User ${i}`}
                        fill
                        sizes="40px"
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-[#050B14] bg-cyan-500 flex items-center justify-center text-[#050B14] font-bold text-[10px]">
                    +200
                  </div>
                </div>

                {/* Rating / Info */}
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Industry Standard</p>
                  <div className="flex gap-1 text-cyan-500">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
