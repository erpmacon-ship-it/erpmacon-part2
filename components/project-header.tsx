'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, Building2, Bell, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { ProfileSidebar } from './profile-sidebar';

interface ProjectHeaderProps {
  projectId: string;
  projectName?: string;
  user?: any;
}

export function ProjectHeader({ projectId, projectName, user }: ProjectHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Home',
      href: `/workspace/project/${projectId}`,
      icon: (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      )
    },
    {
      name: 'Management',
      href: `/workspace/project/${projectId}/management`,
      icon: (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      )
    },
    {
      name: 'Construction',
      href: `/workspace/project/${projectId}/construction`,
      icon: (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
      )
    },
    {
      name: 'Accounts',
      href: `/workspace/project/${projectId}/accounts`,
      icon: (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
      )
    },
    {
      name: 'Sales',
      href: `/workspace/project/${projectId}/sales`,
      icon: (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      )
    }
  ];

  return (
    <header className="border-b border-white/5 bg-[#0B1120] sticky top-0 z-50">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left: Branding & Project Name */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/workspace')}
            className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-400">
              <Building2 size={18} />
            </div>
            <h1 className="text-lg font-bold tracking-tight">
              {projectName || 'Project'}
            </h1>
          </div>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = item.name === 'Home' 
              ? pathname === item.href || pathname === `${item.href}/timeline`
              : pathname.startsWith(item.href);
              
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`font-medium text-sm flex items-center gap-2 transition-colors ${
                  isActive 
                    ? 'text-cyan-400 border-b-2 border-cyan-400 pb-5 -mb-5' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <div className={`w-4 h-4 rounded-sm flex items-center justify-center ${
                  isActive ? 'bg-cyan-400 text-[#0B1120]' : 'bg-gray-700 text-gray-300'
                }`}>
                  {item.icon}
                </div>
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Right: User Profile & Notifications */}
        <div className="flex items-center gap-6">
          <button className="relative text-gray-400 hover:text-white transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-[#0B1120]"></span>
          </button>
          
          <ProfileSidebar user={user}>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-tight">
                  {user?.user_metadata?.full_name || 'Admin User'}
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Super Administrator</p>
              </div>
              <div className="w-9 h-9 rounded-full border border-cyan-500/40 overflow-hidden bg-[#111827] relative">
                {user?.user_metadata?.avatar_url ? (
                  <Image src={user.user_metadata.avatar_url} alt="User" fill sizes="36px" className="object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-cyan-500 font-bold text-sm">
                    {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                  </div>
                )}
              </div>
              <ChevronDown size={16} className="text-gray-500 group-hover:text-white transition-colors" />
            </div>
          </ProfileSidebar>
        </div>
      </div>
    </header>
  );
}
