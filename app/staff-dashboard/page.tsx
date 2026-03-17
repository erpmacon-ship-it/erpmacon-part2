'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User, Briefcase, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function StaffDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/');
        return;
      }

      const role = session.user.user_metadata?.role;
      if (role === 'Admin' || role === 'Owner') {
        router.push('/workspace');
        return;
      }

      setUser(session.user);
      setIsLoading(false);
    };

    checkSession();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg text-zinc-900">Staff Portal</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <User className="w-4 h-4" />
                <span>{user?.user_metadata?.name || user?.email}</span>
                <span className="px-2 py-0.5 bg-zinc-100 rounded-full text-xs font-medium text-zinc-600">
                  {user?.user_metadata?.role || 'Staff'}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-zinc-600 hover:text-zinc-900">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900">Welcome back, {user?.user_metadata?.name?.split(' ')[0] || 'Team Member'}</h1>
          <p className="text-zinc-500 mt-1">Here&apos;s an overview of your assigned tasks and projects.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Active Projects</p>
                <p className="text-2xl font-bold text-zinc-900">0</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Pending Tasks</p>
                <p className="text-2xl font-bold text-zinc-900">0</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Completed Tasks</p>
                <p className="text-2xl font-bold text-zinc-900">0</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assigned Projects */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Projects</CardTitle>
                <CardDescription>Projects you are currently assigned to.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-lg">
                  <Briefcase className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-zinc-900">No projects assigned</h3>
                  <p className="text-sm text-zinc-500 mt-1">You haven&apos;t been assigned to any projects yet.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Deadlines */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>Tasks due in the next 7 days.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500">No upcoming deadlines</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
