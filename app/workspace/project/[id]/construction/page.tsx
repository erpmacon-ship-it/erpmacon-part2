'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ProjectHeader } from '@/components/project-header';
import { DailyLogTab } from '@/components/construction/daily-log-tab';
import { TaskManagementTab } from '@/components/construction/task-management-tab';
import { StockTab } from '@/components/construction/stock-tab';
import { RequisitionTab } from '@/components/construction/requisition-tab';

export default function ConstructionPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Daily Log');

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }
      setUser(session.user);

      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectData) {
        setProject(projectData);
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

  const subTabs = ['Daily Log', 'Task Management', 'Stock', 'Requisition'];

  return (
    <div className="min-h-screen bg-[#0B1120] text-white font-sans selection:bg-cyan-500/30">
      <ProjectHeader projectId={projectId} projectName={project?.name} user={user} />

      {/* Sub Navigation */}
      <div className="border-b border-white/5 bg-[#0B1120] sticky top-[73px] z-40">
        <div className="px-6 max-w-[1600px] mx-auto flex items-center gap-8">
          {subTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-sm font-medium transition-colors relative ${
                activeTab === tab ? 'text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6 max-w-[1600px] mx-auto">
        {activeTab === 'Daily Log' && <DailyLogTab project={project} />}
        {activeTab === 'Task Management' && <TaskManagementTab project={project} />}
        {activeTab === 'Stock' && <StockTab project={project} />}
        {activeTab === 'Requisition' && <RequisitionTab project={project} />}
      </main>
    </div>
  );
}
