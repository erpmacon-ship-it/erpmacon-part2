'use client';

import React, { useState } from 'react';
import { Phone, Home, Calendar, FileText, Upload, Eye, Download, Edit2, Building, Layers, Car, Sun, Shield } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const defaultProfile = {
  name: 'Abdur Rahman',
  nid: '1234567890',
  phone: '+880 1712 345678',
  address: 'House 12, Road 5, Block-A, Banani, Dhaka',
  agreementDate: '2024-01-15',
  notes: 'Preferably contact during business hours.',
  avatarUrl: 'https://picsum.photos/seed/abdur/200/200'
};

const defaultBuilding = {
  stories: 'G + 9',
  totalFlats: '36',
  parkingSlots: '40',
  terrace: 'Shared',
  buildingType: 'Residential',
  flatBreakdown: '4 flats per floor'
};

export function OverviewTab({ project, onUpdate }: { project: any, onUpdate: (field: string, data: any) => void }) {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditBuildingOpen, setIsEditBuildingOpen] = useState(false);

  const profile = project?.land_owner_profile || defaultProfile;
  const building = project?.building_info || defaultBuilding;

  const [editProfile, setEditProfile] = useState(profile);
  const [editBuilding, setEditBuilding] = useState(building);

  // Sync state when project updates or modal opens
  React.useEffect(() => {
    setEditProfile(project?.land_owner_profile || defaultProfile);
  }, [project?.land_owner_profile]);

  React.useEffect(() => {
    setEditBuilding(project?.building_info || defaultBuilding);
  }, [project?.building_info]);

  const handleSaveProfile = () => {
    onUpdate('land_owner_profile', editProfile);
    setIsEditProfileOpen(false);
  };

  const handleSaveBuilding = () => {
    onUpdate('building_info', editBuilding);
    setIsEditBuildingOpen(false);
  };

  const payments = project?.signing_money || [];
  const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
  const sortedPayments = [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastPayment = sortedPayments[0];

  return (
    <div className="space-y-8">
      {/* Land Owner Profile Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            Land Owner Profile
          </h2>
          <Button 
            onClick={() => setIsEditProfileOpen(true)}
            variant="outline" 
            className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 bg-transparent"
          >
            <Edit2 size={14} className="mr-2" />
            Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Profile Card & Advance Payments */}
          <div className="lg:col-span-4 space-y-6">
            {/* Profile Card */}
            <div className="bg-[#111827] border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center">
              <div className="relative w-24 h-24 rounded-full border-2 border-emerald-500/50 p-1 mb-4">
                <div className="w-full h-full rounded-full overflow-hidden relative bg-gray-800">
                  <Image src={profile.avatarUrl || "https://picsum.photos/seed/abdur/200/200"} alt={profile.name || "Land Owner"} fill className="object-cover" />
                </div>
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-[#111827] rounded-full"></div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{profile.name}</h3>
              
              <div className="flex gap-2 mb-2">
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-500/20">
                  Land Owner
                </span>
                <span className="bg-gray-800 text-gray-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-gray-700">
                  NID: {profile.nid}
                </span>
              </div>
            </div>

            {/* Advance Payments */}
            <div className="bg-[#111827] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <span className="text-orange-400">৳</span>
                  Advance Payments
                </h3>
                <button className="text-cyan-400 text-xs font-medium hover:underline">
                  View All →
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-[#0B1120] rounded-xl p-4 border border-white/5">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Total Paid</p>
                  <p className="text-lg font-bold text-white">৳ {totalPaid.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-[#0B1120] rounded-xl p-4 border border-white/5">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Last Date</p>
                  <p className="text-sm font-bold text-white mt-1">
                    {lastPayment ? new Date(lastPayment.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>
              </div>

              {lastPayment ? (
                <div className="bg-[#0B1120] rounded-xl p-4 border border-white/5 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-white">৳ {lastPayment.amount.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(lastPayment.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className="bg-gray-800 text-gray-400 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-gray-700">
                    {lastPayment.method}
                  </span>
                </div>
              ) : (
                <div className="bg-[#0B1120] rounded-xl p-4 border border-white/5 text-center text-gray-500 text-sm">
                  No payments recorded
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Details & Documents */}
          <div className="lg:col-span-8 space-y-6">
            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center flex-shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Phone Number</p>
                  <p className="text-sm font-medium text-white">{profile.phone}</p>
                </div>
              </div>

              <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center flex-shrink-0">
                  <Home size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Permanent Address</p>
                  <p className="text-sm font-medium text-white">{profile.address}</p>
                </div>
              </div>

              <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center flex-shrink-0">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Agreement Date</p>
                  <p className="text-sm font-medium text-white">{profile.agreementDate}</p>
                </div>
              </div>

              <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center flex-shrink-0">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">General Notes</p>
                  <p className="text-sm font-medium text-gray-300 italic">{profile.notes}</p>
                </div>
              </div>
            </div>

            {/* Ownership Documents */}
            <div className="bg-[#111827] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  Ownership Documents
                </h3>
                <Button variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 bg-transparent h-8 text-xs">
                  <Upload size={14} className="mr-2" />
                  Upload
                </Button>
              </div>

              <div className="space-y-3 mb-6">
                {/* Document 1 */}
                <div className="bg-[#0B1120] border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-[10px]">
                      PDF
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Land_Deed_2024.pdf</p>
                      <p className="text-xs text-gray-500">2.4 MB <span className="mx-2">|</span> Jan 18, 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-gray-400 hover:text-white transition-colors"><Eye size={16} /></button>
                    <button className="p-2 text-gray-400 hover:text-white transition-colors"><Download size={16} /></button>
                  </div>
                </div>

                {/* Document 2 */}
                <div className="bg-[#0B1120] border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                      IMG
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Site_Map_Annex_A.jpg</p>
                      <p className="text-xs text-gray-500">1.8 MB <span className="mx-2">|</span> Jan 20, 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-gray-400 hover:text-white transition-colors"><Eye size={16} /></button>
                    <button className="p-2 text-gray-400 hover:text-white transition-colors"><Download size={16} /></button>
                  </div>
                </div>
              </div>

              {/* Drag & Drop Area */}
              <div className="border-2 border-dashed border-emerald-500/20 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-emerald-500/[0.02] hover:bg-emerald-500/[0.04] transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                  <Upload size={20} />
                </div>
                <p className="text-sm font-medium text-gray-300 mb-1">Click or drag documents here to upload</p>
                <p className="text-xs text-gray-500">PDF, JPG, PNG (MAX 10MB)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Building Info Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Building size={16} />
            </div>
            Building Info
          </h2>
          <Button 
            onClick={() => setIsEditBuildingOpen(true)}
            variant="outline" 
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 bg-transparent"
          >
            <Edit2 size={14} className="mr-2" />
            Edit Info
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
              <Layers size={18} />
            </div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Stories</p>
            <p className="text-xl font-bold text-white">{building.stories}</p>
          </div>

          <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
              <Home size={18} />
            </div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Total Flats</p>
            <p className="text-xl font-bold text-white">{building.totalFlats}</p>
          </div>

          <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
              <Car size={18} />
            </div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Parking Slots</p>
            <p className="text-xl font-bold text-white">{building.parkingSlots}</p>
          </div>

          <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
              <Sun size={18} />
            </div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Terrace</p>
            <p className="text-xl font-bold text-white">{building.terrace}</p>
          </div>

          <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
              <Shield size={18} />
            </div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Building Type</p>
            <p className="text-xl font-bold text-white">{building.buildingType}</p>
          </div>

          <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
              <Layers size={18} />
            </div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Breakdown</p>
            <p className="text-sm font-bold text-white mt-1">{building.flatBreakdown}</p>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="bg-[#111827] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Land Owner Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input 
                value={editProfile.name} 
                onChange={(e) => setEditProfile({...editProfile, name: e.target.value})}
                className="bg-[#0B1120] border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>NID</Label>
              <Input 
                value={editProfile.nid} 
                onChange={(e) => setEditProfile({...editProfile, nid: e.target.value})}
                className="bg-[#0B1120] border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input 
                value={editProfile.phone} 
                onChange={(e) => setEditProfile({...editProfile, phone: e.target.value})}
                className="bg-[#0B1120] border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input 
                value={editProfile.address} 
                onChange={(e) => setEditProfile({...editProfile, address: e.target.value})}
                className="bg-[#0B1120] border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Agreement Date</Label>
              <Input 
                type="date"
                value={editProfile.agreementDate} 
                onChange={(e) => setEditProfile({...editProfile, agreementDate: e.target.value})}
                className="bg-[#0B1120] border-white/10 [color-scheme:dark]"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                value={editProfile.notes} 
                onChange={(e) => setEditProfile({...editProfile, notes: e.target.value})}
                className="bg-[#0B1120] border-white/10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditProfileOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProfile} className="bg-emerald-500 hover:bg-emerald-600 text-white">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Building Info Modal */}
      <Dialog open={isEditBuildingOpen} onOpenChange={setIsEditBuildingOpen}>
        <DialogContent className="bg-[#111827] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Building Info</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Number of Stories</Label>
              <Input 
                value={editBuilding.stories} 
                onChange={(e) => setEditBuilding({...editBuilding, stories: e.target.value})}
                className="bg-[#0B1120] border-white/10"
                placeholder="e.g. G + 9"
              />
            </div>
            <div className="space-y-2">
              <Label>Total Flats</Label>
              <Input 
                value={editBuilding.totalFlats} 
                onChange={(e) => setEditBuilding({...editBuilding, totalFlats: e.target.value})}
                className="bg-[#0B1120] border-white/10"
                type="number"
              />
            </div>
            <div className="space-y-2">
              <Label>Parking Slots</Label>
              <Input 
                value={editBuilding.parkingSlots} 
                onChange={(e) => setEditBuilding({...editBuilding, parkingSlots: e.target.value})}
                className="bg-[#0B1120] border-white/10"
                type="number"
              />
            </div>
            <div className="space-y-2">
              <Label>Rooftop/Terrace Info</Label>
              <Input 
                value={editBuilding.terrace} 
                onChange={(e) => setEditBuilding({...editBuilding, terrace: e.target.value})}
                className="bg-[#0B1120] border-white/10"
                placeholder="e.g. Shared, Private"
              />
            </div>
            <div className="space-y-2">
              <Label>Floor-wise Breakdown</Label>
              <Input 
                value={editBuilding.flatBreakdown} 
                onChange={(e) => setEditBuilding({...editBuilding, flatBreakdown: e.target.value})}
                className="bg-[#0B1120] border-white/10"
                placeholder="e.g. 4 flats per floor"
              />
            </div>
            <div className="space-y-2">
              <Label>Building Type</Label>
              <select 
                value={editBuilding.buildingType}
                onChange={(e) => setEditBuilding({...editBuilding, buildingType: e.target.value})}
                className="w-full h-10 px-3 rounded-md bg-[#0B1120] border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditBuildingOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveBuilding} className="bg-cyan-500 hover:bg-cyan-600 text-[#0B1120] font-bold">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
