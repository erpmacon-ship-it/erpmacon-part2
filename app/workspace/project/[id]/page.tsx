'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, Building2, Bell, ChevronDown, Plus, 
  CheckCircle2, Circle, AlertTriangle, Info, Calendar, Map, MoreVertical
} from 'lucide-react';
import Image from 'next/image';
import { ProjectHeader } from '@/components/project-header';

const DEFAULT_PHASES = [
  { id: '1', name: 'Chukti', status: 'completed', estimated_start_date: '', target_end_date: '', responsible_person: '' },
  { id: '2', name: 'Foundation', status: 'current', estimated_start_date: '', target_end_date: '', responsible_person: '' },
  { id: '3', name: 'Structure', status: 'future', estimated_start_date: '', target_end_date: '', responsible_person: '' },
  { id: '4', name: 'Finishing', status: 'future', estimated_start_date: '', target_end_date: '', responsible_person: '' },
  { id: '5', name: 'Ready for Sale', status: 'future', estimated_start_date: '', target_end_date: '', responsible_person: '' },
];

export default function ProjectDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [phases, setPhases] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }
      setUser(session.user);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-white font-sans selection:bg-cyan-500/30">
      <ProjectHeader projectId={projectId} projectName={project?.name} user={user} />

      {/* Main Dashboard Content */}
      <main className="p-6 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top Left: Financial & Alerts */}
        <div className="lg:col-span-4 bg-[#111827] rounded-2xl border border-white/5 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Financial & Alerts
            </h2>
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-emerald-500/20">
              ON TRACK
            </span>
          </div>

          <div className="flex items-center gap-8 mt-4">
            {/* Donut Chart */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Circle */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1F2937" strokeWidth="12" />
                {/* Progress Circle */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#06B6D4" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="82.89" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">67%</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Spent</span>
              </div>
            </div>

            {/* Financial Stats */}
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1">Total Budget</p>
                <p className="text-2xl font-bold text-white leading-none">$1.2M</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1">Spent To Date</p>
                <p className="text-xl font-bold text-white leading-none">$800K</p>
              </div>
              <div>
                <p className="text-[10px] text-cyan-500 uppercase tracking-wider font-semibold mb-1">Remaining</p>
                <p className="text-xl font-bold text-cyan-400 leading-none">$400K</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Right: Project Progress Status */}
        <div className="lg:col-span-8 bg-[#111827] rounded-2xl border border-white/5 p-6 relative overflow-hidden">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-lg font-bold">Project Progress Status</h2>
            <button 
              onClick={() => router.push(`/workspace/project/${projectId}/timeline`)}
              className="flex items-center gap-2 px-4 py-2 bg-transparent border border-cyan-500/30 text-cyan-400 rounded-lg text-sm font-medium hover:bg-cyan-500/10 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              Timeline Setup
            </button>
          </div>

          {/* Electric Circuit-Style Linear Track */}
          <div 
            className="relative pt-16 pb-8 px-4 max-w-5xl mx-auto cursor-pointer"
            onClick={() => router.push(`/workspace/project/${projectId}/timeline`)}
          >
            <div className="flex justify-between items-center relative w-full">
              {phases.map((phase, index) => {
                const isCompleted = phase.status === 'completed';
                const isCurrent = phase.status === 'current';
                const isFuture = phase.status === 'future';
                const isLast = index === phases.length - 1;
                
                // Determine if the line to the NEXT node should be active
                const nextPhase = phases[index + 1];
                const isNextActive = nextPhase && (nextPhase.status === 'completed' || nextPhase.status === 'current');
                const lineActive = isCompleted && isNextActive;

                return (
                  <div key={phase.id} className="relative flex flex-col items-center flex-1 group/node">
                    
                    {/* Connecting Line (Circuit path) */}
                    {!isLast && (
                      <div 
                        className={`absolute top-4 left-[50%] right-[-50%] h-1 z-0 transition-all duration-500 ${
                          lineActive 
                            ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]' 
                            : 'bg-gray-800'
                        }`} 
                      />
                    )}

                    {/* Node (Circuit dot) */}
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted ? 'bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]' :
                      isCurrent ? 'bg-[#111827] border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' :
                      'bg-[#111827] border-2 border-gray-700'
                    }`}>
                      {isCompleted && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B1120" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      {isCurrent && <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></div>}
                      {isFuture && <div className="w-2 h-2 rounded-full bg-gray-700"></div>}
                    </div>
                    
                    {/* Label */}
                    <div className="mt-4 text-center">
                      <h4 className={`text-xs font-bold uppercase tracking-wider transition-colors ${isCompleted || isCurrent ? 'text-cyan-400' : 'text-gray-500 group-hover/node:text-gray-400'}`}>
                        {phase.name}
                      </h4>
                    </div>

                    {/* Hover Tooltip (Placeholder for future info) */}
                    <div className="absolute -top-16 opacity-0 group-hover/node:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                      <div className="bg-gray-900 text-gray-200 text-[10px] px-3 py-2 rounded shadow-xl border border-gray-700 whitespace-nowrap flex flex-col items-center">
                        <p className="font-bold text-cyan-400 mb-1">{phase.name}</p>
                        <p className="text-gray-400 italic">Important info will appear here...</p>
                      </div>
                      {/* Tooltip Arrow */}
                      <div className="w-2 h-2 bg-gray-900 border-b border-r border-gray-700 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Middle Left: Urgent Alerts */}
        <div className="lg:col-span-4 bg-[#111827] rounded-2xl border border-white/5 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" />
            <h2 className="text-lg font-bold">Urgent Alerts</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Alert 1 */}
            <div className="p-4 border-b border-white/5 flex gap-4 hover:bg-white/[0.02] transition-colors relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
              <div className="mt-0.5">
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                  <span className="font-bold text-xs">!</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-medium text-white leading-tight pr-4">Material supply delay: Cement shipment delayed 48h</h4>
                  <span className="text-[10px] text-gray-500 flex-shrink-0">2m ago</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <span className="bg-gray-800 text-gray-300 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-gray-700">Auto-Alert</span>
                  <span className="bg-gray-800 text-gray-300 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-gray-700">Logistics</span>
                </div>
              </div>
            </div>

            {/* Alert 2 */}
            <div className="p-4 border-b border-white/5 flex gap-4 hover:bg-white/[0.02] transition-colors relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
              <div className="mt-0.5">
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                  <span className="font-bold text-xs">!</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-medium text-white leading-tight pr-4">Over-budget variance detected in Sector 4 plumbing</h4>
                  <span className="text-[10px] text-gray-500 flex-shrink-0">15m ago</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <span className="bg-gray-800 text-gray-300 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-gray-700">System</span>
                  <span className="bg-gray-800 text-gray-300 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-gray-700">Finance</span>
                </div>
              </div>
            </div>

            {/* Alert 3 */}
            <div className="p-4 flex gap-4 hover:bg-white/[0.02] transition-colors relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
              <div className="mt-0.5">
                <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
                  <Info size={12} strokeWidth={3} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-medium text-white leading-tight pr-4">Upcoming inspection: Structural Safety Board (Tomorrow)</h4>
                  <span className="text-[10px] text-gray-500 flex-shrink-0">1h ago</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <span className="bg-gray-800 text-gray-300 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-gray-700">Compliance</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Right: Daily Tasks */}
        <div className="lg:col-span-8 bg-[#111827] rounded-2xl border border-white/5 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CheckCircle2 size={18} className="text-cyan-400" />
              Daily Tasks
            </h2>
            <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border border-cyan-500/20">
              Owner View
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {/* Task 1 */}
            <div className="p-4 border-b border-white/5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors group">
              <div className="w-5 h-5 rounded border-2 border-cyan-500 flex-shrink-0 cursor-pointer"></div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white truncate">Approve payment for HVAC subcontracting</h4>
                <div className="flex gap-2 mt-1.5">
                  <span className="bg-gray-800 text-gray-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-gray-700">Financial</span>
                  <span className="bg-gray-800 text-gray-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-gray-700">Urgent</span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold px-4 py-1.5 rounded uppercase tracking-wider hover:bg-cyan-500/20 transition-colors">
                  Approve
                </button>
                <button className="text-gray-500 hover:text-white transition-colors">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            {/* Task 2 */}
            <div className="p-4 border-b border-white/5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors group">
              <div className="w-5 h-5 rounded border-2 border-cyan-500 flex-shrink-0 cursor-pointer"></div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white truncate">Review architectural change for Balcony B-22</h4>
                <div className="flex gap-2 mt-1.5">
                  <span className="bg-gray-800 text-gray-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-gray-700">Auto-Alert</span>
                  <span className="bg-gray-800 text-gray-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-gray-700">System</span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button className="bg-transparent border border-white/20 text-gray-300 text-[10px] font-bold px-4 py-1.5 rounded uppercase tracking-wider hover:bg-white/10 transition-colors">
                  Order
                </button>
                <button className="bg-transparent border border-white/20 text-gray-300 text-[10px] font-bold px-4 py-1.5 rounded uppercase tracking-wider hover:bg-white/10 transition-colors">
                  Reschedule
                </button>
              </div>
            </div>

            {/* Task 3 */}
            <div className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors group">
              <div className="w-5 h-5 rounded border-2 border-gray-600 flex-shrink-0 cursor-pointer"></div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-400 truncate">Quarterly safety compliance documentation</h4>
                <div className="flex gap-2 mt-1.5">
                  <span className="bg-gray-800 text-gray-500 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-gray-700">Admin</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 text-gray-500">
                <span className="text-[10px] font-bold uppercase tracking-wider">Due in 3d</span>
                <Calendar size={14} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Project Site Location */}
        <div className="lg:col-span-12 bg-[#111827] rounded-2xl border border-white/5 overflow-hidden relative min-h-[200px] flex flex-col justify-end p-6">
          {/* Map Background Placeholder */}
          <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
            <Map size={120} />
          </div>
          
          <div className="absolute top-6 right-6 z-10">
            <span className="bg-[#0B1120] text-cyan-400 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border border-cyan-500/30 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Live Telemetry Active
            </span>
          </div>

          <div className="relative z-10">
            <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1">Project Site Location</p>
            <h2 className="text-2xl font-bold text-white">72nd West, Block A-12, Sector 4</h2>
          </div>
        </div>

      </main>
    </div>
  );
}
