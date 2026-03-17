'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, LogOut, Search, LayoutGrid, List, Plus, Building2, FileText, Bell, Menu, X, Settings, Palette, Shield, Database, Globe, Moon, Sun, ChevronDown, Edit2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  image_url: string;
  updated_at: string;
}

export default function WorkspacePage() {
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  
  // Edit Project State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [editProjectData, setEditProjectData] = useState({ name: '', description: '', image_url: '' });
  const [projectImageFile, setProjectImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Drag and Drop State
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const checkUserAndFetchProjects = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        router.push('/');
        return;
      }
      
      setUser(session.user);

      // Fetch projects
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', session.user.id)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        let fetchedProjects = data || [];
        
        // Apply saved order if exists
        const projectOrder = session.user.user_metadata?.project_order;
        if (projectOrder && Array.isArray(projectOrder)) {
          fetchedProjects.sort((a, b) => {
            const indexA = projectOrder.indexOf(a.id);
            const indexB = projectOrder.indexOf(b.id);
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
          });
        }
        
        setProjects(fetchedProjects);
      } catch (error: any) {
        console.error('Error fetching projects:', error.message);
        if (error.code !== '42P01') {
          toast.error('Failed to load projects');
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkUserAndFetchProjects();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const openProfileEdit = () => {
    router.push('/workspace/profile');
  };

  const openEditModal = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setProjectToEdit(project);
    setEditProjectData({
      name: project.name,
      description: project.description || '',
      image_url: project.image_url || ''
    });
    setProjectImageFile(null);
    setIsEditModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large', { description: 'Please select an image smaller than 2MB.' });
      return;
    }

    setProjectImageFile(file);
    setEditProjectData({ ...editProjectData, image_url: URL.createObjectURL(file) });
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectToEdit || !editProjectData.name.trim()) return;

    setIsUploading(true);
    try {
      let finalImageUrl = editProjectData.image_url;

      if (projectImageFile) {
        const fileExt = projectImageFile.name.split('.').pop();
        const fileName = `${projectToEdit.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('project image')
          .upload(fileName, projectImageFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('project image')
          .getPublicUrl(fileName);

        finalImageUrl = publicUrl;
      }

      const { error } = await supabase
        .from('projects')
        .update({ 
          name: editProjectData.name,
          description: editProjectData.description,
          image_url: finalImageUrl
        })
        .eq('id', projectToEdit.id);

      if (error) throw error;

      setProjects(projects.map(p => p.id === projectToEdit.id ? { ...p, ...editProjectData, image_url: finalImageUrl } : p));
      setIsEditModalOpen(false);
      toast.success('Project Updated', { description: 'Project details updated successfully.' });
    } catch (error: any) {
      toast.error('Update Failed', { description: error.message || 'Could not update project' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (targetProjectId: string) => {
    if (!draggedProjectId || draggedProjectId === targetProjectId) return;
    
    const newProjects = [...projects];
    const draggedIndex = newProjects.findIndex(p => p.id === draggedProjectId);
    const targetIndex = newProjects.findIndex(p => p.id === targetProjectId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    const [draggedProject] = newProjects.splice(draggedIndex, 1);
    newProjects.splice(targetIndex, 0, draggedProject);
    
    setProjects(newProjects);
    setDraggedProjectId(null);

    // Save order to user_metadata
    try {
      const projectOrder = newProjects.map(p => p.id);
      await supabase.auth.updateUser({
        data: { project_order: projectOrder }
      });
    } catch (error) {
      console.error('Failed to save project order:', error);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) {
      toast.error('Validation Error', { description: 'Project name is required' });
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([
          { 
            name: newProject.name, 
            description: newProject.description,
            user_id: user.id 
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setProjects([data, ...projects]);
      setIsModalOpen(false);
      setNewProject({ name: '', description: '' });
      toast.success('Project Created', { description: 'Your new project has been successfully created.' });
    } catch (error: any) {
      toast.error('Creation Failed', { description: error.message || 'Could not create project' });
    } finally {
      setIsCreating(false);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeProjectsCount = projects.filter(p => p.status === 'ACTIVE').length;

  return (
    <div className="min-h-screen bg-[#050B14] text-white font-sans selection:bg-cyan-500/30 flex flex-col">
      {/* Header */}
      <header className="px-8 py-6 max-w-7xl mx-auto w-full flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">My Workspace</h1>
          {loading ? (
            <div className="h-4 w-64 bg-white/5 rounded animate-pulse mt-2"></div>
          ) : (
            <p className="text-gray-400 text-sm">
              You have {activeProjectsCount} active projects in your portfolio
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notification Bell */}
          <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#050B14]"></span>
          </button>

          {/* User Avatar & Nickname */}
          <div className="hidden sm:flex items-center gap-3 bg-white/5 py-1.5 pl-1.5 pr-4 rounded-full border border-white/10">
            <div className="relative">
              <div className="w-8 h-8 rounded-full border border-cyan-500/40 overflow-hidden bg-[#0A121E] relative">
                {user?.user_metadata?.avatar_url ? (
                  <Image src={user.user_metadata.avatar_url} alt="User" fill sizes="32px" className="object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-cyan-500 font-bold text-sm">
                    {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-cyan-500 border-2 border-[#050B14] rounded-full"></div>
            </div>
            <span className="text-sm font-medium text-white">
              {user?.user_metadata?.nickname || user?.user_metadata?.full_name?.split(' ')[0] || 'User'}
            </span>
          </div>

          {/* Side Menu Button */}
          <button 
            onClick={() => setIsSideMenuOpen(true)}
            className="p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-lg border border-white/10 hover:bg-white/10"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-8 pb-12 max-w-7xl mx-auto w-full">
        
        {/* Toolbar */}
        <div className="bg-[#0A121E]/80 border border-white/5 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between backdrop-blur-sm">
          
          {/* Search */}
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#050B14] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-gray-600 text-sm"
            />
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            {/* View Toggle */}
            <div className="flex items-center bg-[#050B14] border border-white/10 rounded-xl p-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <List size={18} />
              </button>
            </div>

            {/* New Project Button */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-cyan-400 to-cyan-600 text-[#050B14] font-bold py-2.5 px-5 rounded-xl hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all active:scale-95 text-sm flex items-center gap-2"
            >
              <Plus size={18} strokeWidth={2.5} />
              New Project
            </button>
          </div>
        </div>

        {/* Projects Grid/List */}
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6" 
          : "flex flex-col gap-4"}>
          
          {loading ? (
            /* Loading Skeletons */
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`bg-[#0A121E] border border-white/5 rounded-2xl overflow-hidden animate-pulse ${viewMode === 'list' ? 'flex flex-row h-24' : ''}`}>
                <div className={`${viewMode === 'list' ? 'w-32 h-full' : 'h-28 w-full'} bg-white/5`}></div>
                <div className={`p-4 space-y-3 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="h-5 bg-white/5 rounded w-1/2"></div>
                    <div className="h-5 bg-white/5 rounded w-12"></div>
                  </div>
                  <div className="h-3 bg-white/5 rounded w-3/4"></div>
                  <div className="pt-3 flex justify-between items-center border-t border-white/5">
                    <div className="h-3 bg-white/5 rounded w-1/3"></div>
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-white/5 border-2 border-[#0A121E]"></div>
                      <div className="w-6 h-6 rounded-full bg-white/5 border-2 border-[#0A121E]"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <>
              {/* Actual Projects */}
              {filteredProjects.map((project) => (
                <div 
                  key={project.id} 
                  draggable
                  onDragStart={() => setDraggedProjectId(project.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(project.id)}
                  onClick={() => router.push(`/workspace/project/${project.id}`)}
                  className={`bg-[#0A121E] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all group cursor-pointer ${
                    viewMode === 'list' ? 'flex flex-row items-center' : 'flex flex-col'
                  } ${draggedProjectId === project.id ? 'ring-2 ring-cyan-500 scale-[1.02] shadow-[0_0_30px_rgba(34,211,238,0.15)] z-10 bg-[#0A121E]' : ''}`}
                >
                  {/* Image Container */}
                  <div className={`${viewMode === 'list' ? 'h-24 w-32 flex-shrink-0' : 'h-28 w-full'} relative bg-[#050B14] overflow-hidden`}>
                    {project.image_url ? (
                      <Image 
                        src={project.image_url} 
                        alt={project.name} 
                        fill 
                        sizes="(max-width: 768px) 100vw, 300px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                        <Image 
                          src={`https://picsum.photos/seed/${project.id}/600/400`} 
                          alt={project.name} 
                          fill 
                          sizes="(max-width: 768px) 100vw, 300px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex items-center justify-between' : ''}`}>
                    {viewMode === 'grid' ? (
                      <>
                        <div className="flex justify-between items-start mb-1.5">
                          <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors truncate pr-2">{project.name}</h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button 
                              onClick={(e) => openEditModal(e, project)} 
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-all"
                              title="Edit Project"
                            >
                              <Edit2 size={14} />
                            </button>
                            {project.status === 'ACTIVE' && (
                              <span className="bg-teal-500/10 text-teal-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-teal-500/20">
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-400 text-xs mb-4 line-clamp-2">{project.description}</p>
                        
                        {/* Footer */}
                        <div className="pt-3 flex justify-between items-center border-t border-white/5">
                          <p className="text-[10px] text-gray-500 truncate pr-2">
                            Updated {project.updated_at ? formatDistanceToNow(new Date(project.updated_at), { addSuffix: true }) : 'recently'}
                          </p>
                          
                          {/* Mock Avatars */}
                          <div className="flex -space-x-1.5 flex-shrink-0">
                            <div className="w-5 h-5 rounded-full border border-[#0A121E] overflow-hidden relative">
                              <Image src={`https://picsum.photos/seed/${project.id}1/100/100`} alt="Team" fill sizes="20px" className="object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div className="w-5 h-5 rounded-full border border-[#0A121E] overflow-hidden relative">
                              <Image src={`https://picsum.photos/seed/${project.id}2/100/100`} alt="Team" fill sizes="20px" className="object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div className="w-5 h-5 rounded-full border border-[#0A121E] bg-cyan-500 flex items-center justify-center text-[8px] font-bold text-[#050B14] z-10">
                              +3
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* List View Content */}
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors truncate">{project.name}</h3>
                            <button 
                              onClick={(e) => openEditModal(e, project)} 
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-all"
                              title="Edit Project"
                            >
                              <Edit2 size={14} />
                            </button>
                            {project.status === 'ACTIVE' && (
                              <span className="bg-teal-500/10 text-teal-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-teal-500/20 flex-shrink-0">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-xs line-clamp-1">{project.description}</p>
                        </div>
                        <div className="flex items-center gap-6 flex-shrink-0">
                          <p className="text-[10px] text-gray-500">
                            Updated {project.updated_at ? formatDistanceToNow(new Date(project.updated_at), { addSuffix: true }) : 'recently'}
                          </p>
                          <div className="flex -space-x-1.5 flex-shrink-0">
                            <div className="w-6 h-6 rounded-full border border-[#0A121E] overflow-hidden relative">
                              <Image src={`https://picsum.photos/seed/${project.id}1/100/100`} alt="Team" fill sizes="24px" className="object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div className="w-6 h-6 rounded-full border border-[#0A121E] overflow-hidden relative">
                              <Image src={`https://picsum.photos/seed/${project.id}2/100/100`} alt="Team" fill sizes="24px" className="object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div className="w-6 h-6 rounded-full border border-[#0A121E] bg-cyan-500 flex items-center justify-center text-[9px] font-bold text-[#050B14] z-10">
                              +3
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {/* Add New Project Card */}
              <button 
                onClick={() => setIsModalOpen(true)}
                className={`bg-transparent border-2 border-dashed border-white/10 rounded-2xl p-5 flex items-center justify-center text-center hover:border-white/30 hover:bg-white/5 transition-all group ${
                  viewMode === 'list' ? 'flex-row gap-4 h-24' : 'flex-col min-h-[220px]'
                }`}
              >
                <div className={`rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors group-hover:scale-110 duration-300 ${
                  viewMode === 'list' ? 'w-10 h-10' : 'w-10 h-10 mb-3'
                }`}>
                  <Plus size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <div className={viewMode === 'list' ? 'text-left' : ''}>
                  <h3 className="text-base font-bold text-white mb-1">Add Project</h3>
                  <p className="text-gray-500 text-xs max-w-[150px]">
                    Start a new project
                  </p>
                </div>
              </button>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center border-t border-white/5 mt-auto gap-4">
        <p className="text-gray-500 text-xs font-medium tracking-widest uppercase">
          © 2024 ERP NEXUS CORE
        </p>
        <div className="flex gap-6 text-xs font-bold tracking-widest uppercase text-gray-500">
          <a href="#" className="hover:text-gray-300 transition-colors">Documentation</a>
          <a href="#" className="hover:text-gray-300 transition-colors">Support</a>
        </div>
      </footer>

      {/* Add Project Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#0A121E] border-white/10 text-white sm:max-w-[500px] p-0 overflow-hidden">
          <div className="p-6 md:p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold">Create New Project</DialogTitle>
              <DialogDescription className="text-gray-400">
                Add a new project to your workspace portfolio.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateProject} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">Project Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-cyan-500 transition-colors">
                    <Building2 size={18} />
                  </div>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="e.g. Urban Development Phase 1"
                    className="w-full bg-[#050B14] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-gray-600 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">Description (Optional)</label>
                <div className="relative group">
                  <div className="absolute top-3.5 left-4 flex items-start pointer-events-none text-gray-500 group-focus-within:text-cyan-500 transition-colors">
                    <FileText size={18} />
                  </div>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Brief description of the project..."
                    className="w-full bg-[#050B14] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-gray-600 text-sm min-h-[100px] resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newProject.name.trim()}
                  className="bg-gradient-to-r from-cyan-400 to-cyan-600 text-[#050B14] font-bold py-2.5 px-6 rounded-xl hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all active:scale-95 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating && <Loader2 size={16} className="animate-spin" />}
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Side Menu Overlay */}
      <AnimatePresence>
        {isSideMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSideMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:w-80 bg-[#0A121E] border-l border-white/10 z-50 flex flex-col shadow-2xl"
            >
              {/* Menu Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">Menu</h2>
                <button 
                  onClick={() => setIsSideMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Menu Content */}
              <div className="flex-1 overflow-y-auto py-4">
                {/* A. Profile */}
                <div 
                  onClick={openProfileEdit}
                  className="px-6 pb-6 border-b border-white/5 mb-4 cursor-pointer group hover:bg-white/5 transition-colors pt-2"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-16 h-16 rounded-full border-2 border-cyan-500/30 overflow-hidden bg-[#050B14] relative group-hover:border-cyan-400 transition-colors">
                      {user?.user_metadata?.avatar_url ? (
                        <Image src={user.user_metadata.avatar_url} alt="User" fill sizes="64px" className="object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-cyan-500 font-bold text-xl group-hover:text-cyan-400 transition-colors">
                          {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-bold group-hover:text-cyan-400 transition-colors">{user?.user_metadata?.nickname || user?.user_metadata?.full_name || 'User Name'}</h3>
                      <p className="text-gray-400 text-xs mb-1">{user?.email}</p>
                      <span className="inline-block px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold rounded uppercase tracking-wider border border-cyan-500/20">
                        Admin
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 text-center group-hover:text-gray-400 transition-colors">Click to edit profile</p>
                </div>

                {/* B. Settings */}
                <div className="px-4 mb-2">
                  <button 
                    onClick={() => setExpandedMenu(expandedMenu === 'settings' ? null : 'settings')}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors text-gray-300 hover:text-white group"
                  >
                    <div className="flex items-center gap-3">
                      <Settings size={18} className="text-gray-500 group-hover:text-cyan-400 transition-colors" />
                      <span className="font-medium text-sm">Settings</span>
                    </div>
                    <ChevronDown size={16} className={`text-gray-500 transition-transform ${expandedMenu === 'settings' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {expandedMenu === 'settings' && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-11 pr-3 py-2 space-y-1">
                          <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white text-sm">
                            <Shield size={14} /> Access Control
                          </button>
                          <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white text-sm">
                            <Database size={14} /> Backup Data
                          </button>
                          <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white text-sm">
                            <Globe size={14} /> Language (EN/BN)
                          </button>
                          <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white text-sm">
                            <Bell size={14} /> Notifications
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* C. Theme */}
                <div className="px-4 mb-2">
                  <button 
                    onClick={() => setExpandedMenu(expandedMenu === 'theme' ? null : 'theme')}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors text-gray-300 hover:text-white group"
                  >
                    <div className="flex items-center gap-3">
                      <Palette size={18} className="text-gray-500 group-hover:text-cyan-400 transition-colors" />
                      <span className="font-medium text-sm">Theme</span>
                    </div>
                    <ChevronDown size={16} className={`text-gray-500 transition-transform ${expandedMenu === 'theme' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {expandedMenu === 'theme' && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-11 pr-3 py-2 space-y-4">
                          {/* Background Theme */}
                          <div>
                            <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Background</p>
                            <div className="flex gap-2">
                              <button className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg bg-white/10 text-white text-xs font-medium border border-cyan-500/30">
                                <Moon size={14} /> Dark
                              </button>
                              <button className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-white/5 text-gray-400 text-xs font-medium border border-transparent">
                                <Sun size={14} /> Light
                              </button>
                            </div>
                          </div>
                          
                          {/* Color Theme */}
                          <div>
                            <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Accent Color</p>
                            <div className="flex gap-3">
                              <button className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 border-2 border-white ring-2 ring-cyan-500/50"></button>
                              <button className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 border-2 border-transparent hover:border-white/50 transition-colors"></button>
                              <button className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-600 border-2 border-transparent hover:border-white/50 transition-colors"></button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* D. Sign Out */}
              <div className="p-6 border-t border-white/10">
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors font-medium text-sm border border-red-500/20"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Project Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-[#0A121E] border-white/10 text-white sm:max-w-[500px] p-0 overflow-hidden">
          <div className="p-6 md:p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold">Edit Project</DialogTitle>
              <DialogDescription className="text-gray-400">
                Update details for your project.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEditProject} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">Project Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-cyan-500 transition-colors">
                    <Building2 size={18} />
                  </div>
                  <input
                    type="text"
                    value={editProjectData.name}
                    onChange={(e) => setEditProjectData({ ...editProjectData, name: e.target.value })}
                    className="w-full bg-[#050B14] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">Description</label>
                <div className="relative group">
                  <div className="absolute top-3.5 left-4 flex items-start pointer-events-none text-gray-500 group-focus-within:text-cyan-500 transition-colors">
                    <FileText size={18} />
                  </div>
                  <textarea
                    value={editProjectData.description}
                    onChange={(e) => setEditProjectData({ ...editProjectData, description: e.target.value })}
                    className="w-full bg-[#050B14] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm min-h-[100px] resize-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">Project Image</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-cyan-500 transition-colors">
                    <ImageIcon size={18} />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full bg-[#050B14] border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer text-gray-400"
                  />
                </div>
                {editProjectData.image_url && (
                  <div className="mt-3 relative w-full h-32 rounded-xl overflow-hidden border border-white/10 bg-[#050B14]">
                    <Image src={editProjectData.image_url} alt="Preview" fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!editProjectData.name.trim() || isUploading}
                  className="bg-gradient-to-r from-cyan-400 to-cyan-600 text-[#050B14] font-bold py-2.5 px-6 rounded-xl hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all active:scale-95 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
