'use client';

import React, { useState } from 'react';
import { Plus, CheckCircle2, Circle, Clock, User, Calendar as CalendarIcon, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export function TaskManagementTab({ project, user }: { project: any, user: any }) {
  const isOwner = project?.user_id === user?.id;
  const [tasks, setTasks] = useState<any[]>(project?.tasks || []);
  const [phases, setPhases] = useState<any[]>(project?.phases || []);
  const staffList = project?.staff || [];
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    phase_id: '',
    name: '',
    description: '',
    assigned_to: '',
    finish_date: ''
  });

  const handleAddTask = async () => {
    if (!newTask.phase_id || !newTask.name || !newTask.assigned_to || !newTask.finish_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    const task = {
      id: Math.random().toString(36).substr(2, 9),
      ...newTask,
      status: 'Not Started',
      created_at: new Date().toISOString()
    };

    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);
    setIsAddOpen(false);
    setNewTask({ phase_id: '', name: '', description: '', assigned_to: '', finish_date: '' });

    try {
      const { error } = await supabase
        .from('projects')
        .update({ tasks: updatedTasks })
        .eq('id', project.id);
      if (error) throw error;
      toast.success('Task added successfully');
    } catch (error: any) {
      toast.error('Failed to save task: ' + error.message);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    setTasks(updatedTasks);

    // Check if we need to advance circuit progress
    const task = updatedTasks.find(t => t.id === taskId);
    let updatedPhases = [...phases];
    let phasesChanged = false;

    if (task && newStatus === 'Done') {
      const phaseTasks = updatedTasks.filter(t => t.phase_id === task.phase_id);
      const allDone = phaseTasks.every(t => t.status === 'Done');
      
      if (allDone && phaseTasks.length > 0) {
        const phaseIndex = updatedPhases.findIndex(p => p.id === task.phase_id);
        if (phaseIndex !== -1 && updatedPhases[phaseIndex].status !== 'completed') {
          updatedPhases[phaseIndex].status = 'completed';
          if (phaseIndex + 1 < updatedPhases.length) {
            updatedPhases[phaseIndex + 1].status = 'current';
          }
          phasesChanged = true;
          setPhases(updatedPhases);
          toast.success(`Phase "${updatedPhases[phaseIndex].name}" completed! Circuit advanced.`);
        }
      }
    }

    try {
      const updateData: any = { tasks: updatedTasks };
      if (phasesChanged) {
        updateData.phases = updatedPhases;
      }
      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', project.id);
      if (error) throw error;
    } catch (error: any) {
      toast.error('Failed to update status: ' + error.message);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    const taskId = taskToDelete;
    setTaskToDelete(null);
    
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    setTasks(updatedTasks);
    try {
      const { error } = await supabase
        .from('projects')
        .update({ tasks: updatedTasks })
        .eq('id', project.id);
      if (error) throw error;
      toast.success('Task deleted');
    } catch (error: any) {
      toast.error('Failed to delete task: ' + error.message);
    }
  };

  const getStaffName = (email: string) => {
    const staff = staffList.find((s: any) => s.email === email);
    return staff ? staff.name : email;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Task Management</h2>
          <p className="text-sm text-gray-400 mt-1">Manage construction tasks and track phase progress.</p>
        </div>
        {isOwner && (
          <Button onClick={() => setIsAddOpen(true)} className="bg-cyan-500 text-[#0B1120] hover:bg-cyan-400 font-bold">
            <Plus size={16} className="mr-2" />
            Add Task
          </Button>
        )}
      </div>

      {phases.length === 0 ? (
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Timeline Phases</h3>
          <p className="text-gray-400 text-sm">Please set up the project timeline phases first before adding tasks.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {phases.map(phase => {
            const phaseTasks = tasks.filter(t => t.phase_id === phase.id);
            if (phaseTasks.length === 0 && !isOwner) return null; // Hide empty phases for staff

            return (
              <div key={phase.id} className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden">
                <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      phase.status === 'completed' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' :
                      phase.status === 'current' ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)] animate-pulse' :
                      'bg-gray-600'
                    }`} />
                    <h3 className="text-lg font-bold text-white">{phase.name}</h3>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-white/5 text-gray-400 uppercase tracking-wider">
                      {phase.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 flex items-center gap-2">
                    <CheckCircle2 size={16} className={phaseTasks.length > 0 && phaseTasks.every(t => t.status === 'Done') ? 'text-emerald-400' : 'text-gray-500'} />
                    {phaseTasks.filter(t => t.status === 'Done').length} / {phaseTasks.length} Tasks
                  </div>
                </div>

                <div className="p-6">
                  {phaseTasks.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No tasks assigned to this phase yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {phaseTasks.map(task => (
                        <div key={task.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-white/5 bg-[#0B1120] hover:border-white/10 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-bold text-white text-base">{task.name}</h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
                                task.status === 'Done' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                task.status === 'In Progress' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                                'bg-gray-500/10 text-gray-400 border-gray-500/20'
                              }`}>
                                {task.status}
                              </span>
                            </div>
                            {task.description && (
                              <p className="text-sm text-gray-400 mb-3 line-clamp-2">{task.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1.5">
                                <User size={14} className="text-gray-400" />
                                <span>{getStaffName(task.assigned_to)}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <CalendarIcon size={14} className="text-gray-400" />
                                <span>Due: {new Date(task.finish_date).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 md:pl-4 md:border-l border-white/5">
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task.id, e.target.value)}
                              disabled={!isOwner && user?.email !== task.assigned_to}
                              className="h-9 px-3 rounded-lg bg-[#111827] border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="Not Started">Not Started</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Done">Done</option>
                            </select>
                            
                            {isOwner && (
                              <button 
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-[#111827] border-white/10 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add New Task</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-gray-400">Timeline Phase <span className="text-red-400">*</span></Label>
              <select 
                value={newTask.phase_id}
                onChange={(e) => setNewTask({...newTask, phase_id: e.target.value})}
                className="w-full h-11 px-3 rounded-md bg-[#0B1120] border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Select a phase...</option>
                {phases.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-400">Task Name <span className="text-red-400">*</span></Label>
              <Input 
                value={newTask.name}
                onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                placeholder="e.g. Pour concrete for foundation"
                className="bg-[#0B1120] border-white/10 focus-visible:ring-cyan-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-400">Description</Label>
              <Textarea 
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Detailed instructions for the task..."
                className="bg-[#0B1120] border-white/10 focus-visible:ring-cyan-500 min-h-[100px] resize-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-400">Assign To <span className="text-red-400">*</span></Label>
                <select 
                  value={newTask.assigned_to}
                  onChange={(e) => setNewTask({...newTask, assigned_to: e.target.value})}
                  className="w-full h-11 px-3 rounded-md bg-[#0B1120] border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select staff...</option>
                  {staffList.map((s: any) => (
                    <option key={s.email} value={s.email}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-400">Finish Date <span className="text-red-400">*</span></Label>
                <Input 
                  type="date"
                  value={newTask.finish_date}
                  onChange={(e) => setNewTask({...newTask, finish_date: e.target.value})}
                  className="bg-[#0B1120] border-white/10 focus-visible:ring-cyan-500 [color-scheme:dark]"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-white/10 text-white hover:bg-white/5">
              Cancel
            </Button>
            <Button onClick={handleAddTask} className="bg-cyan-500 text-[#0B1120] hover:bg-cyan-400 font-bold">
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <DialogContent className="bg-[#111827] border-white/10 text-white sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-400">Delete Task</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-300">Are you sure you want to delete this task? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskToDelete(null)} className="border-white/10 text-white hover:bg-white/5">
              Cancel
            </Button>
            <Button onClick={confirmDeleteTask} className="bg-red-500 text-white hover:bg-red-600 font-bold">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

