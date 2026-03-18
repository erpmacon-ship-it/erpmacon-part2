'use client';

import React, { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { User, ShieldCheck, Cloud, Globe, Bell, Palette, Plus, Edit2, LogOut, Building2, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';

interface ProfileSidebarProps {
  user: any;
  children: React.ReactNode;
}

export function ProfileSidebar({ user, children }: ProfileSidebarProps) {
  const router = useRouter();
  const params = useParams();
  const currentProjectId = params.id as string;
  const [projects, setProjects] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [themeColor, setThemeColor] = useState('teal'); // teal, purple, green

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('projects')
        .select('id, name')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5);
      
      if (data) setProjects(data);
    };
    fetchProjects();
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-[320px] sm:w-[380px] bg-[#0B1120] border-l border-white/5 p-0 text-white flex flex-col h-full overflow-hidden">
        
        {/* Top Profile Section */}
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full border-2 border-teal-500 overflow-hidden bg-[#111827] relative">
                {user?.user_metadata?.avatar_url ? (
                  <Image src={user.user_metadata.avatar_url} alt="User" fill sizes="56px" className="object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-teal-500 font-bold text-xl">
                    {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">
                  {user?.user_metadata?.full_name || 'Ahmad Rahman'}
                </h3>
                <p className="text-xs text-gray-400 mb-1">{user?.email || 'ahmad@macon.com'}</p>
                <span className="inline-block bg-teal-500 text-[#0B1120] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  OWNER
                </span>
              </div>
            </div>
            <button className="text-gray-500 hover:text-white transition-colors">
              <Edit2 size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Projects Section */}
          <div className="px-6 pb-6">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">PROJECTS</p>
            <div className="space-y-2">
              {projects.map((project) => {
                const isActive = project.id === currentProjectId;
                return (
                  <button 
                    key={project.id}
                    onClick={() => router.push(`/workspace/project/${project.id}`)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-teal-500/5 border border-teal-500/20 text-teal-400' 
                        : 'bg-white/5 border border-transparent text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Building2 size={18} className={isActive ? 'text-teal-400' : 'text-gray-500'} />
                      <span className="text-sm font-medium">{project.name}</span>
                    </div>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-teal-400"></div>}
                  </button>
                );
              })}
              
              <button 
                onClick={() => router.push('/workspace')}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-teal-500/30 text-teal-400 hover:bg-teal-500/10 transition-colors text-sm font-medium mt-2"
              >
                <Plus size={16} />
                New Project
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <div className="px-6 pb-6 space-y-1">
            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors group">
              <div className="flex items-center gap-4">
                <User size={18} className="text-teal-500 group-hover:text-teal-400" />
                <span className="text-sm font-medium">Profile</span>
              </div>
              <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400" />
            </button>
            
            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors group">
              <div className="flex items-center gap-4">
                <ShieldCheck size={18} className="text-teal-500 group-hover:text-teal-400" />
                <span className="text-sm font-medium">Access Control</span>
              </div>
              <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400" />
            </button>
            
            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors group">
              <div className="flex items-center gap-4">
                <Cloud size={18} className="text-teal-500 group-hover:text-teal-400" />
                <span className="text-sm font-medium">Backup & Restore</span>
              </div>
              <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400" />
            </button>
            
            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors group">
              <div className="flex items-center gap-4">
                <Globe size={18} className="text-teal-500 group-hover:text-teal-400" />
                <span className="text-sm font-medium">Language</span>
              </div>
              <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400" />
            </button>
            
            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors group">
              <div className="flex items-center gap-4">
                <Bell size={18} className="text-teal-500 group-hover:text-teal-400" />
                <span className="text-sm font-medium">Notifications</span>
              </div>
              <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400" />
            </button>
            
            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors group">
              <div className="flex items-center gap-4">
                <Palette size={18} className="text-teal-500 group-hover:text-teal-400" />
                <span className="text-sm font-medium">Theme</span>
              </div>
              <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Bottom Theme Section */}
        <div className="p-6 border-t border-white/5 bg-[#0B1120]">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4">THEME</p>
          
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => setThemeColor('teal')}
              className={`w-8 h-8 rounded-full bg-teal-400 flex items-center justify-center transition-transform ${themeColor === 'teal' ? 'ring-2 ring-teal-400 ring-offset-2 ring-offset-[#0B1120] scale-110' : ''}`}
            >
              {themeColor === 'teal' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B1120" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
            </button>
            <button 
              onClick={() => setThemeColor('purple')}
              className={`w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center transition-transform ${themeColor === 'purple' ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#0B1120] scale-110' : ''}`}
            >
              {themeColor === 'purple' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B1120" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
            </button>
            <button 
              onClick={() => setThemeColor('green')}
              className={`w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center transition-transform ${themeColor === 'green' ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-[#0B1120] scale-110' : ''}`}
            >
              {themeColor === 'green' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B1120" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
            </button>
          </div>

          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-medium text-white">Dark Mode</span>
            <Switch 
              checked={isDarkMode} 
              onCheckedChange={setIsDarkMode} 
              className="data-[state=checked]:bg-teal-400"
            />
          </div>

          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

      </SheetContent>
    </Sheet>
  );
}
