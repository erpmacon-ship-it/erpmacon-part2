'use client';

import React, { useState } from 'react';
import { UserPlus, Mail, Shield, Trash2, CheckCircle2, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export function StaffTab({ project, onUpdate }: { project: any, onUpdate: (field: string, data: any) => void }) {
  const [staff, setStaff] = useState<any[]>(project?.staff || []);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isResending, setIsResending] = useState<string | null>(null);

  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    role: 'Site Engineer'
  });

  const handleResendInvite = async (member: any) => {
    setIsResending(member.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/invite-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          email: member.email,
          name: member.name,
          role: member.role,
          projectId: project.id,
          origin: window.location.origin
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        const errorMessage = result.error || "Server error";
        // Handle the specific case where the user is already fully registered
        if (errorMessage.includes('already been registered') || errorMessage.includes('already registered')) {
          toast.info(`${member.name} is already fully registered. They can log in directly.`);
          
          // Optionally update their status to active since they are registered
          const updatedStaff = staff.map(s => 
            s.id === member.id ? { ...s, status: 'active' } : s
          );
          setStaff(updatedStaff);
          onUpdate('staff', updatedStaff);
          return;
        }
        throw new Error(errorMessage);
      }
      
      toast.success(`Invitation resent to ${member.email}`);
    } catch (error: any) {
      console.error("Error resending invite:", error);
      toast.error(`Failed to resend invite: ${error.message}`);
    } finally {
      setIsResending(null);
    }
  };

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.email) return;

    const member = {
      id: Math.random().toString(36).substr(2, 9),
      name: newStaff.name,
      email: newStaff.email,
      role: newStaff.role,
      status: 'invited', // 'invited' | 'active'
      invitedAt: new Date().toISOString()
    };

    const newStaffList = [...staff, member];
    setStaff(newStaffList);
    onUpdate('staff', newStaffList);
    setIsAddOpen(false);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/invite-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          email: newStaff.email,
          name: newStaff.name,
          role: newStaff.role,
          projectId: project.id,
          origin: window.location.origin
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        const errorMessage = result.error || "Server error";
        console.error("Edge function error:", errorMessage);
        throw new Error(errorMessage);
      }
      
      toast.success(`Invitation email sent to ${newStaff.email}`);
    } catch (error: any) {
      console.error("Error inviting user:", error);
      toast.error(`Failed to send invite: ${error.message || "Ensure Edge Function is deployed."}`);
    }

    setNewStaff({ name: '', email: '', role: 'Site Engineer' });
  };

  const handleDelete = (id: string) => {
    const newStaffList = staff.filter(s => s.id !== id);
    setStaff(newStaffList);
    onUpdate('staff', newStaffList);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Project Staff</h2>
          <p className="text-sm text-gray-400">Manage team members and access control.</p>
        </div>
        
        <Button 
          onClick={() => setIsAddOpen(true)}
          className="bg-cyan-500 hover:bg-cyan-600 text-[#0B1120] font-bold"
        >
          <UserPlus size={16} className="mr-2" />
          Invite Staff
        </Button>
      </div>

      <div className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 bg-white/5 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <div className="col-span-4">Name & Email</div>
          <div className="col-span-3">Role</div>
          <div className="col-span-3">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        
        <div className="divide-y divide-white/5">
          {staff.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No staff members added yet.
            </div>
          ) : (
            staff.map((member) => (
              <div key={member.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] transition-colors">
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold uppercase">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{member.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Mail size={10} /> {member.email}
                    </p>
                  </div>
                </div>
                <div className="col-span-3">
                  <span className="bg-gray-800 text-gray-300 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-gray-700">
                    {member.role}
                  </span>
                </div>
                <div className="col-span-3">
                  {member.status === 'active' ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      <CheckCircle2 size={14} /> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-orange-400 uppercase tracking-wider">
                      <Clock size={14} /> Invited
                    </span>
                  )}
                </div>
                <div className="col-span-2 flex items-center justify-end gap-3">
                  {member.status === 'invited' && (
                    <button 
                      onClick={() => handleResendInvite(member)}
                      disabled={isResending === member.id}
                      className={`p-1.5 transition-colors ${isResending === member.id ? 'text-cyan-700' : 'text-cyan-500 hover:text-cyan-400'}`}
                      title="Resend Invite"
                    >
                      <Send size={16} className={isResending === member.id ? 'animate-pulse' : ''} />
                    </button>
                  )}
                  <button className="p-1.5 text-gray-500 hover:text-cyan-400 transition-colors" title="Access Control">
                    <Shield size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(member.id)}
                    className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                    title="Remove Staff"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Staff Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-[#111827] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Staff Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input 
                value={newStaff.name} 
                onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                className="bg-[#0B1120] border-white/10"
                placeholder="e.g. Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input 
                type="email"
                value={newStaff.email} 
                onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                className="bg-[#0B1120] border-white/10"
                placeholder="e.g. jane@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Project Role</Label>
              <select 
                value={newStaff.role}
                onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                className="w-full h-10 px-3 rounded-md bg-[#0B1120] border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="Project Manager">Project Manager</option>
                <option value="Site Engineer">Site Engineer</option>
                <option value="Architect">Architect</option>
                <option value="Accountant">Accountant</option>
                <option value="Supervisor">Supervisor</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddStaff} className="bg-cyan-500 hover:bg-cyan-600 text-[#0B1120] font-bold">Send Invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
