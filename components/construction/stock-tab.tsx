'use client';

import React, { useState } from 'react';
import { AlertTriangle, ArrowRight, Package, Grid, LayoutGrid, Box, Filter, Download, Plus, MoreVertical, CheckCircle2, XCircle, Clock, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export function StockTab({ project, user }: { project: any, user: any }) {
  const isOwner = project?.user_id === user?.id;
  const staffList = project?.staff || [];
  
  // Default materials if none exist
  const defaultMaterials = [
    { id: 'm1', name: 'Cement', unit: 'bags', min_threshold: 100, current_stock: 1240, icon: 'Package' },
    { id: 'm2', name: 'Steel', unit: 'tons', min_threshold: 50, current_stock: 45, icon: 'Grid' },
    { id: 'm3', name: 'Bricks', unit: 'pcs', min_threshold: 5000, current_stock: 15000, icon: 'LayoutGrid' },
    { id: 'm4', name: 'Sand', unit: 'tons', min_threshold: 100, current_stock: 80, icon: 'Box' },
  ];

  const defaultLedger = [
    { id: 'l1', material_id: 'm2', type: 'INWARD', quantity: 12.5, submitted_by: 'marcus@example.com', submitted_at: '2023-10-24T09:45:00Z', status: 'PENDING' },
    { id: 'l2', material_id: 'm1', type: 'INWARD', quantity: 400, submitted_by: 'sarah@example.com', submitted_at: '2023-10-23T14:30:00Z', status: 'APPROVED' },
    { id: 'l3', material_id: 'm4', type: 'INWARD', quantity: 20, submitted_by: 'james@example.com', submitted_at: '2023-10-23T11:15:00Z', status: 'REJECTED' },
  ];

  const [materials, setMaterials] = useState<any[]>(project?.materials || defaultMaterials);
  const [ledger, setLedger] = useState<any[]>(project?.stock_ledger || defaultLedger);
  const [filterType, setFilterType] = useState<'ALL' | 'INWARD' | 'OUTWARD'>('ALL');
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [newEntry, setNewEntry] = useState({
    material_id: '',
    type: 'INWARD',
    quantity: '',
  });

  const getStaffName = (email: string) => {
    if (email === project?.user_email) return 'Owner';
    const staff = staffList.find((s: any) => s.email === email);
    return staff ? staff.name : email.split('@')[0];
  };

  const getMaterial = (id: string) => materials.find(m => m.id === id);

  const handleAddEntry = async () => {
    if (!newEntry.material_id || !newEntry.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    const qty = parseFloat(newEntry.quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid positive quantity');
      return;
    }

    const entry = {
      id: Math.random().toString(36).substr(2, 9),
      material_id: newEntry.material_id,
      type: newEntry.type,
      quantity: qty,
      submitted_by: user?.email,
      submitted_at: new Date().toISOString(),
      status: isOwner ? 'APPROVED' : 'PENDING' // Auto-approve if owner
    };

    const updatedLedger = [entry, ...ledger];
    let updatedMaterials = [...materials];

    // If auto-approved (owner), update stock immediately
    if (entry.status === 'APPROVED') {
      updatedMaterials = updatedMaterials.map(m => {
        if (m.id === entry.material_id) {
          const newStock = entry.type === 'INWARD' ? m.current_stock + entry.quantity : m.current_stock - entry.quantity;
          return { ...m, current_stock: newStock };
        }
        return m;
      });
    }

    setLedger(updatedLedger);
    if (entry.status === 'APPROVED') setMaterials(updatedMaterials);
    setIsAddOpen(false);
    setNewEntry({ material_id: '', type: 'INWARD', quantity: '' });

    try {
      const updateData: any = { stock_ledger: updatedLedger };
      if (entry.status === 'APPROVED') updateData.materials = updatedMaterials;
      
      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', project.id);
      if (error) throw error;
      toast.success(isOwner ? 'Stock entry added and approved' : 'Stock entry submitted for approval');
    } catch (error: any) {
      toast.error('Failed to save entry: ' + error.message);
    }
  };

  const handleApprove = async (entryId: string) => {
    if (!isOwner) return;

    const entry = ledger.find(l => l.id === entryId);
    if (!entry || entry.status !== 'PENDING') return;

    const updatedLedger = ledger.map(l => l.id === entryId ? { ...l, status: 'APPROVED' } : l);
    
    // Update material stock
    const updatedMaterials = materials.map(m => {
      if (m.id === entry.material_id) {
        const newStock = entry.type === 'INWARD' ? m.current_stock + entry.quantity : m.current_stock - entry.quantity;
        return { ...m, current_stock: newStock };
      }
      return m;
    });

    setLedger(updatedLedger);
    setMaterials(updatedMaterials);

    try {
      const { error } = await supabase
        .from('projects')
        .update({ stock_ledger: updatedLedger, materials: updatedMaterials })
        .eq('id', project.id);
      if (error) throw error;
      toast.success('Entry approved and stock updated');
    } catch (error: any) {
      toast.error('Failed to approve entry: ' + error.message);
    }
  };

  const handleReject = async (entryId: string) => {
    if (!isOwner) return;

    const updatedLedger = ledger.map(l => l.id === entryId ? { ...l, status: 'REJECTED' } : l);
    setLedger(updatedLedger);

    try {
      const { error } = await supabase
        .from('projects')
        .update({ stock_ledger: updatedLedger })
        .eq('id', project.id);
      if (error) throw error;
      toast.success('Entry rejected');
    } catch (error: any) {
      toast.error('Failed to reject entry: ' + error.message);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!isOwner) return;
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    const entry = ledger.find(l => l.id === entryId);
    if (!entry) return;

    const updatedLedger = ledger.filter(l => l.id !== entryId);
    let updatedMaterials = [...materials];

    // If it was APPROVED, we need to reverse the stock change
    if (entry.status === 'APPROVED') {
      updatedMaterials = updatedMaterials.map(m => {
        if (m.id === entry.material_id) {
          const newStock = entry.type === 'INWARD' ? m.current_stock - entry.quantity : m.current_stock + entry.quantity;
          return { ...m, current_stock: newStock };
        }
        return m;
      });
    }

    setLedger(updatedLedger);
    setMaterials(updatedMaterials);

    try {
      const { error } = await supabase
        .from('projects')
        .update({ stock_ledger: updatedLedger, materials: updatedMaterials })
        .eq('id', project.id);
      if (error) throw error;
      toast.success('Entry deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete entry: ' + error.message);
    }
  };

  const lowStockMaterials = materials.filter(m => m.current_stock < m.min_threshold);
  const filteredLedger = filterType === 'ALL' ? ledger : ledger.filter(l => l.type === filterType);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Package': return <Package className="w-5 h-5" />;
      case 'Grid': return <Grid className="w-5 h-5" />;
      case 'LayoutGrid': return <LayoutGrid className="w-5 h-5" />;
      case 'Box': return <Box className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const getStatusColor = (current: number, min: number) => {
    if (current <= min * 0.5) return 'bg-red-500';
    if (current < min) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Low Stock Warning */}
      {lowStockMaterials.length > 0 && (
        <div className="bg-[#451a03]/40 border border-amber-900/50 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <div>
              <h3 className="text-amber-500 font-semibold">{lowStockMaterials.length} materials below minimum threshold</h3>
              <p className="text-amber-500/70 text-sm">Critical stock shortage detected in site depot.</p>
            </div>
          </div>
          <button 
            onClick={() => setIsLowStockModalOpen(true)}
            className="text-amber-500 text-sm font-medium flex items-center gap-1 hover:text-amber-400 transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* IN / OUT Toggle */}
      <div className="flex justify-center">
        <div className="bg-[#111827] rounded-full p-1 border border-white/5 flex">
          <button 
            onClick={() => setFilterType('INWARD')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${filterType === 'INWARD' ? 'bg-teal-400 text-[#0B1120]' : 'text-gray-400 hover:text-white'}`}
          >
            IN
          </button>
          <button 
            onClick={() => setFilterType('OUTWARD')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${filterType === 'OUTWARD' ? 'bg-teal-400 text-[#0B1120]' : 'text-gray-400 hover:text-white'}`}
          >
            OUT
          </button>
          {filterType !== 'ALL' && (
            <button 
              onClick={() => setFilterType('ALL')}
              className="px-4 py-2 rounded-full text-sm font-medium text-gray-500 hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Material Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {materials.map(material => (
          <div key={material.id} className="bg-[#111827] border border-white/5 rounded-xl p-5 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="text-gray-400">
                {getIcon(material.icon)}
              </div>
              <div className={`w-2 h-2 rounded-full ${getStatusColor(material.current_stock, material.min_threshold)}`} />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">{material.current_stock.toLocaleString()}</span>
                <span className="text-sm text-gray-500">{material.unit}</span>
              </div>
              <p className="text-gray-400 text-sm mt-1">{material.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Ledger Table */}
      <div className="bg-[#111827] border border-white/5 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-teal-400 font-semibold tracking-wider text-sm">RECENT STOCK LEDGER</h3>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-md bg-white/5 text-gray-400 hover:text-white transition-colors">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-md bg-white/5 text-gray-400 hover:text-white transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-xs font-semibold text-gray-500 tracking-wider">
                <th className="p-4 font-medium">DATE & TIME</th>
                <th className="p-4 font-medium">MATERIAL NAME</th>
                <th className="p-4 font-medium">TYPE</th>
                <th className="p-4 font-medium">QUANTITY</th>
                <th className="p-4 font-medium">SUBMITTED BY</th>
                <th className="p-4 font-medium">STATUS</th>
                <th className="p-4 font-medium text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-white/5">
              {filteredLedger.map(entry => {
                const material = getMaterial(entry.material_id);
                const date = new Date(entry.submitted_at);
                
                return (
                  <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="text-white">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div className="text-gray-500 text-xs">{date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center text-gray-400">
                          {material ? getIcon(material.icon) : <Box className="w-4 h-4" />}
                        </div>
                        <span className="text-white font-medium">{material?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        {entry.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`font-medium ${entry.type === 'INWARD' ? 'text-teal-400' : 'text-amber-400'}`}>
                        {entry.type === 'INWARD' ? '+' : '-'} {entry.quantity} <span className="text-xs text-gray-500 uppercase">{material?.unit}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white">
                          {getStaffName(entry.submitted_by).charAt(0).toUpperCase()}
                        </div>
                        <span className="text-gray-300">{getStaffName(entry.submitted_by)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {entry.status === 'PENDING' && (
                        <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold tracking-wider">
                          <Clock className="w-3.5 h-3.5" /> PENDING
                        </div>
                      )}
                      {entry.status === 'APPROVED' && (
                        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5" /> APPROVED
                        </div>
                      )}
                      {entry.status === 'REJECTED' && (
                        <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold tracking-wider">
                          <XCircle className="w-3.5 h-3.5" /> REJECTED
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {entry.status === 'PENDING' && isOwner ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            onClick={() => handleApprove(entry.id)}
                            className="h-8 bg-teal-400 hover:bg-teal-500 text-[#0B1120] font-bold text-xs px-4"
                          >
                            APPROVE
                          </Button>
                          <Button 
                            onClick={() => handleReject(entry.id)}
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-1 text-gray-500 hover:text-white transition-colors outline-none">
                            <MoreVertical className="w-5 h-5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#111827] border-white/10 text-white">
                            <DropdownMenuItem 
                              onClick={() => setSelectedEntry(entry)}
                              className="hover:bg-white/5 cursor-pointer"
                            >
                              <Eye className="w-4 h-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            {isOwner && (
                              <DropdownMenuItem 
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="hover:bg-red-500/10 text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete Entry
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredLedger.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No stock entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm text-gray-500">
          <span>Showing 1-{Math.min(10, filteredLedger.length)} of {filteredLedger.length} entries</span>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">&lt;</button>
            <button className="w-8 h-8 rounded bg-teal-400 text-[#0B1120] font-medium flex items-center justify-center">1</button>
            <button className="w-8 h-8 rounded bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">2</button>
            <button className="w-8 h-8 rounded bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">3</button>
            <button className="w-8 h-8 rounded bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">&gt;</button>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsAddOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-teal-400 hover:bg-teal-500 text-[#0B1120] rounded-full flex items-center justify-center shadow-lg shadow-teal-500/20 transition-transform hover:scale-105 z-10"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add Entry Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-[#111827] border-white/10 text-white sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">New Stock Entry</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-gray-400">Entry Type</Label>
              <div className="flex gap-2">
                <button
                  onClick={() => setNewEntry({...newEntry, type: 'INWARD'})}
                  className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${
                    newEntry.type === 'INWARD' 
                      ? 'bg-teal-500/10 border-teal-500/50 text-teal-400' 
                      : 'bg-[#0B1120] border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  INWARD
                </button>
                <button
                  onClick={() => setNewEntry({...newEntry, type: 'OUTWARD'})}
                  className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${
                    newEntry.type === 'OUTWARD' 
                      ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' 
                      : 'bg-[#0B1120] border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  OUTWARD
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400">Material <span className="text-red-400">*</span></Label>
              <select 
                value={newEntry.material_id}
                onChange={(e) => setNewEntry({...newEntry, material_id: e.target.value})}
                className="w-full h-11 px-3 rounded-md bg-[#0B1120] border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select material...</option>
                {materials.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-400">Quantity <span className="text-red-400">*</span></Label>
              <Input 
                type="number"
                min="0"
                step="0.01"
                value={newEntry.quantity}
                onChange={(e) => setNewEntry({...newEntry, quantity: e.target.value})}
                placeholder="0.00"
                className="bg-[#0B1120] border-white/10 focus-visible:ring-teal-500"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-white/10 text-white hover:bg-white/5">
              Cancel
            </Button>
            <Button onClick={handleAddEntry} className="bg-teal-400 text-[#0B1120] hover:bg-teal-500 font-bold">
              Submit Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Low Stock Materials Modal */}
      <Dialog open={isLowStockModalOpen} onOpenChange={setIsLowStockModalOpen}>
        <DialogContent className="bg-[#111827] border-white/10 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-amber-500 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Low Stock Materials
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            {lowStockMaterials.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No materials are currently low on stock.</p>
            ) : (
              lowStockMaterials.map(m => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      {getIcon(m.icon)}
                    </div>
                    <div>
                      <p className="font-medium text-white">{m.name}</p>
                      <p className="text-xs text-gray-400">Min Threshold: {m.min_threshold} {m.unit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-amber-500">{m.current_stock.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{m.unit}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsLowStockModalOpen(false)} className="bg-white/10 text-white hover:bg-white/20">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Entry Details Modal */}
      <Dialog open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
        <DialogContent className="bg-[#111827] border-white/10 text-white sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Entry Details</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Material</p>
                  <p className="font-medium text-white">{getMaterial(selectedEntry.material_id)?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Type</p>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${
                    selectedEntry.type === 'INWARD' 
                      ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {selectedEntry.type}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Quantity</p>
                  <p className="font-medium text-white">{selectedEntry.quantity} {getMaterial(selectedEntry.material_id)?.unit}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <p className={`font-medium ${
                    selectedEntry.status === 'APPROVED' ? 'text-emerald-400' : 
                    selectedEntry.status === 'REJECTED' ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    {selectedEntry.status}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Submitted By</p>
                  <p className="font-medium text-white">{getStaffName(selectedEntry.submitted_by)} ({selectedEntry.submitted_by})</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Date & Time</p>
                  <p className="font-medium text-white">{new Date(selectedEntry.submitted_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedEntry(null)} className="bg-white/10 text-white hover:bg-white/20">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
