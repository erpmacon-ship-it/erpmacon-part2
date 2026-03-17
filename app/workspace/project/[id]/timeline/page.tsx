'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Building2, Plus, Save, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const DEFAULT_PHASES = [
  { id: '1', name: 'Chukti', status: 'completed', estimated_start_date: '', target_end_date: '', responsible_person: '' },
  { id: '2', name: 'Foundation', status: 'current', estimated_start_date: '', target_end_date: '', responsible_person: '' },
  { id: '3', name: 'Structure', status: 'future', estimated_start_date: '', target_end_date: '', responsible_person: '' },
  { id: '4', name: 'Finishing', status: 'future', estimated_start_date: '', target_end_date: '', responsible_person: '' },
  { id: '5', name: 'Ready for Sale', status: 'future', estimated_start_date: '', target_end_date: '', responsible_person: '' },
];

export default function TimelineSetupPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [phases, setPhases] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }

      const { data: projectData, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectData) {
        setProject(projectData);
        if (projectData.phases && Array.isArray(projectData.phases) && projectData.phases.length > 0) {
          setPhases(projectData.phases);
        } else {
          setPhases(DEFAULT_PHASES);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [projectId, router]);

  const handlePhaseChange = (id: string, field: string, value: string) => {
    setPhases(phases.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleDeletePhase = (id: string) => {
    setPhases(phases.filter(p => p.id !== id));
  };

  const handleAddPhase = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setPhases([...phases, { 
      id: newId, 
      name: 'New Phase', 
      status: 'future', 
      estimated_start_date: '', 
      target_end_date: '', 
      responsible_person: '' 
    }]);
  };

  const handleSavePhases = async () => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ phases })
        .eq('id', projectId);
        
      if (error) throw error;
      
      toast.success('Timeline saved successfully');
      router.push(`/workspace/project/${projectId}`);
    } catch (error: any) {
      console.error('Error saving phases:', error);
      toast.error('Failed to save timeline: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-white font-sans selection:bg-cyan-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0B1120] sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push(`/workspace/project/${projectId}`)}
              className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-400">
                <Building2 size={18} />
              </div>
              <h1 className="text-lg font-bold tracking-tight">
                {project?.name || 'Project'} / Timeline Setup
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={handleSavePhases} className="bg-cyan-500 text-[#0B1120] hover:bg-cyan-400 font-bold">
              <Save size={16} className="mr-2" />
              Save Timeline
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Project Timeline</h2>
          <p className="text-gray-400 text-sm">Configure the phases and milestones for this project. The timeline will be automatically tracked based on project activities, or you can manually update the status here.</p>
        </div>

        <div className="space-y-6">
          {phases.map((phase, index) => (
            <div key={phase.id} className="p-6 border border-white/10 rounded-2xl bg-[#111827] relative group transition-all hover:border-white/20">
              <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button 
                  onClick={() => handleDeletePhase(phase.id)}
                  className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                  title="Delete Phase"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <h3 className="text-lg font-bold">Phase Configuration</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-400 uppercase tracking-wider">Phase Name</Label>
                  <Input 
                    value={phase.name} 
                    onChange={(e) => handlePhaseChange(phase.id, 'name', e.target.value)}
                    className="bg-[#0B1120] border-white/10 focus-visible:ring-cyan-500 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-400 uppercase tracking-wider">Status</Label>
                  <select 
                    value={phase.status}
                    onChange={(e) => handlePhaseChange(phase.id, 'status', e.target.value)}
                    className="w-full h-11 px-3 rounded-md bg-[#0B1120] border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="completed">Completed</option>
                    <option value="current">Current</option>
                    <option value="future">Future</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-400 uppercase tracking-wider">Est. Start Date</Label>
                  <Input 
                    type="date"
                    value={phase.estimated_start_date} 
                    onChange={(e) => handlePhaseChange(phase.id, 'estimated_start_date', e.target.value)}
                    className="bg-[#0B1120] border-white/10 focus-visible:ring-cyan-500 h-11 [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-400 uppercase tracking-wider">Target End Date</Label>
                  <Input 
                    type="date"
                    value={phase.target_end_date} 
                    onChange={(e) => handlePhaseChange(phase.id, 'target_end_date', e.target.value)}
                    className="bg-[#0B1120] border-white/10 focus-visible:ring-cyan-500 h-11 [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs text-gray-400 uppercase tracking-wider">Responsible Person</Label>
                  <Input 
                    value={phase.responsible_person} 
                    onChange={(e) => handlePhaseChange(phase.id, 'responsible_person', e.target.value)}
                    className="bg-[#0B1120] border-white/10 focus-visible:ring-cyan-500 h-11"
                    placeholder="e.g. John Doe"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <Button 
            onClick={handleAddPhase}
            variant="outline" 
            className="w-full h-14 border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40 bg-transparent rounded-2xl"
          >
            <Plus size={20} className="mr-2" />
            Add New Phase
          </Button>
        </div>
      </main>
    </div>
  );
}
