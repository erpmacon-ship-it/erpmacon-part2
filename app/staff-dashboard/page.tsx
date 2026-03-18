'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User, Briefcase, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function StaffDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

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
      
      // Fetch all projects and filter in JS to avoid JSONB query issues
      const { data: allProjects, error } = await supabase
        .from('projects')
        .select('*');
        
      if (error) {
        console.error('Error fetching projects:', error);
      } else if (allProjects) {
        const userEmail = session.user.email?.toLowerCase();
        
        // Filter projects where the user is in the staff array OR has assigned tasks
        const myProjects = allProjects.filter(p => {
          const isStaff = p.staff && Array.isArray(p.staff) && p.staff.some((s: any) => s.email?.toLowerCase() === userEmail);
          const hasTasks = p.tasks && Array.isArray(p.tasks) && p.tasks.some((t: any) => t.assigned_to?.toLowerCase() === userEmail);
          return isStaff || hasTasks;
        });

        setProjects(myProjects);
        
        // Extract tasks assigned to this user
        let userTasks: any[] = [];
        myProjects.forEach(project => {
          if (project.tasks && Array.isArray(project.tasks)) {
            const assignedTasks = project.tasks
              .filter((t: any) => t.assigned_to?.toLowerCase() === userEmail)
              .map((t: any) => ({ ...t, project_id: project.id, project_name: project.name }));
            userTasks = [...userTasks, ...assignedTasks];
          }
        });
        
        // Sort tasks by finish date
        userTasks.sort((a, b) => new Date(a.finish_date).getTime() - new Date(b.finish_date).getTime());
        setTasks(userTasks);
      }

      setIsLoading(false);
    };

    checkSession();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    router.push('/');
  };

  const handleStatusChange = async (taskId: string, projectId: string, newStatus: string) => {
    try {
      // Find the project
      const project = projects.find(p => p.id === projectId);
      if (!project) return;
      
      // Update the task in the local state
      const updatedTasks = project.tasks.map((t: any) => 
        t.id === taskId ? { ...t, status: newStatus } : t
      );
      
      // Update the database
      const { error } = await supabase
        .from('projects')
        .update({ tasks: updatedTasks })
        .eq('id', projectId);
        
      if (error) throw error;
      
      // Update local state
      setProjects(projects.map(p => p.id === projectId ? { ...p, tasks: updatedTasks } : p));
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      
      toast.success('Task status updated');
    } catch (error: any) {
      toast.error('Failed to update task: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  const pendingTasks = tasks.filter(t => t.status !== 'Done');
  const completedTasks = tasks.filter(t => t.status === 'Done');

  // Office To-Do (Today/Tomorrow)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const officeToDo = pendingTasks.filter(t => {
    const taskDate = new Date(t.finish_date);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime() || taskDate.getTime() === tomorrow.getTime();
  });

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
                <p className="text-2xl font-bold text-zinc-900">{projects.length}</p>
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
                <p className="text-2xl font-bold text-zinc-900">{pendingTasks.length}</p>
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
                <p className="text-2xl font-bold text-zinc-900">{completedTasks.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Office To-Do (Today/Tomorrow) */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Office To-Do
                </CardTitle>
                <CardDescription>Tasks due today or tomorrow.</CardDescription>
              </CardHeader>
              <CardContent>
                {officeToDo.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-lg">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-zinc-900">All caught up!</h3>
                    <p className="text-sm text-zinc-500 mt-1">You have no tasks due today or tomorrow.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {officeToDo.map(task => (
                      <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-zinc-200 bg-white hover:border-zinc-300 transition-colors">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-zinc-900">{task.name}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
                              task.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                              'bg-zinc-100 text-zinc-600 border-zinc-200'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-500 mb-2">{task.project_name}</p>
                          <div className="flex items-center gap-4 text-xs text-zinc-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Due: {new Date(task.finish_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, task.project_id, e.target.value)}
                            className="h-9 px-3 rounded-md bg-white border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* All Pending Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>All Pending Tasks</CardTitle>
                <CardDescription>Your complete task backlog.</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-zinc-500">No pending tasks</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingTasks.filter(t => !officeToDo.find(ot => ot.id === t.id)).map(task => (
                      <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-zinc-200 bg-white hover:border-zinc-300 transition-colors">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-zinc-900">{task.name}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
                              task.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                              'bg-zinc-100 text-zinc-600 border-zinc-200'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-500 mb-2">{task.project_name}</p>
                          <div className="flex items-center gap-4 text-xs text-zinc-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Due: {new Date(task.finish_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, task.project_id, e.target.value)}
                            className="h-9 px-3 rounded-md bg-white border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                          </select>
                        </div>
                      </div>
                    ))}
                    {pendingTasks.filter(t => !officeToDo.find(ot => ot.id === t.id)).length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-sm text-zinc-500">All pending tasks are in your Office To-Do list.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Assigned Projects */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Projects</CardTitle>
                <CardDescription>Projects you are currently assigned to.</CardDescription>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-lg">
                    <Briefcase className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-zinc-900">No projects assigned</h3>
                    <p className="text-sm text-zinc-500 mt-1">You haven&apos;t been assigned to any projects yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map(project => (
                      <div key={project.id} className="p-4 rounded-lg border border-zinc-200 bg-zinc-50">
                        <h4 className="font-semibold text-zinc-900 mb-1">{project.name}</h4>
                        <p className="text-xs text-zinc-500 mb-3">{project.location || 'No location specified'}</p>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-500">Status:</span>
                          <span className="font-medium text-zinc-900 capitalize">{project.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
