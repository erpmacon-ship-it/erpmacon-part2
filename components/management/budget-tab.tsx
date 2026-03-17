'use client';

import React, { useState } from 'react';
import { Plus, Calculator, CheckCircle2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function BudgetTab({ project, onUpdate }: { project: any, onUpdate: (field: string, data: any) => void }) {
  const [items, setItems] = useState<any[]>(project?.budget_items || []);
  const [isApproved, setIsApproved] = useState<boolean>(project?.budget_approved || false);
  
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Calculator State
  const [calcData, setCalcData] = useState({
    area: '',
    floors: '',
    foundationCost: '',
    floorCost: ''
  });

  // Manual Add State
  const [manualData, setManualData] = useState({
    name: '',
    cost: ''
  });

  const handleCalculate = () => {
    const area = parseFloat(calcData.area) || 0;
    const floors = parseFloat(calcData.floors) || 0;
    const foundationCost = parseFloat(calcData.foundationCost) || 0;
    const floorCost = parseFloat(calcData.floorCost) || 0;

    const totalFoundation = area * foundationCost;
    const totalFloors = area * floors * floorCost;
    const total = totalFoundation + totalFloors;

    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Calculated Construction Cost (${area} sqft, ${floors} floors)`,
      cost: total,
      type: 'calculated'
    };

    const newItems = [...items, newItem];
    setItems(newItems);
    onUpdate('budget_items', newItems);
    setIsCalcOpen(false);
    setCalcData({ area: '', floors: '', foundationCost: '', floorCost: '' });
  };

  const handleManualAdd = () => {
    if (!manualData.name || !manualData.cost) return;

    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: manualData.name,
      cost: parseFloat(manualData.cost) || 0,
      type: 'manual'
    };

    const newItems = [...items, newItem];
    setItems(newItems);
    onUpdate('budget_items', newItems);
    setIsAddOpen(false);
    setManualData({ name: '', cost: '' });
  };

  const handleDelete = (id: string) => {
    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);
    onUpdate('budget_items', newItems);
  };

  const handleApprove = () => {
    setIsApproved(true);
    onUpdate('budget_approved', true);
  };

  const grandTotal = items.reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Project Budget</h2>
          <p className="text-sm text-gray-400">Manage and calculate construction costs.</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={() => setIsCalcOpen(true)}
            variant="outline" 
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 bg-transparent"
          >
            <Calculator size={16} className="mr-2" />
            Calculate Budget
          </Button>
          <Button 
            onClick={() => setIsAddOpen(true)}
            className="bg-cyan-500 hover:bg-cyan-600 text-[#0B1120] font-bold"
          >
            <Plus size={16} className="mr-2" />
            Add Item
          </Button>
        </div>
        {isApproved && (
          <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20">
            <CheckCircle2 size={16} />
            <span className="font-bold text-sm">Budget Approved & Locked</span>
          </div>
        )}
      </div>

      <div className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 bg-white/5 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <div className="col-span-7">Item Description</div>
          <div className="col-span-3 text-right">Cost (৳)</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        
        <div className="divide-y divide-white/5">
          {items.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No budget items added yet. Calculate or add manually.
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] transition-colors">
                <div className="col-span-7 font-medium text-white">{item.name}</div>
                <div className="col-span-3 text-right font-mono text-cyan-400">
                  {item.cost.toLocaleString('en-IN')}
                </div>
                <div className="col-span-2 text-right">
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="grid grid-cols-12 gap-4 p-6 bg-[#0B1120] border-t border-white/5 items-center">
          <div className="col-span-7 text-right font-bold text-gray-400 uppercase tracking-wider">
            Grand Total
          </div>
          <div className="col-span-3 text-right font-mono text-2xl font-bold text-emerald-400">
            ৳ {grandTotal.toLocaleString('en-IN')}
          </div>
          <div className="col-span-2 text-right">
            {items.length > 0 && (
              <Button 
                onClick={handleApprove}
                disabled={isApproved}
                className={`w-full ${isApproved ? 'bg-emerald-500/20 text-emerald-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
              >
                {isApproved ? 'Approved' : 'Approve Budget'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Calculator Modal */}
      <Dialog open={isCalcOpen} onOpenChange={setIsCalcOpen}>
        <DialogContent className="bg-[#111827] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Calculate Construction Budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Total Construction Area (sqft)</Label>
              <Input 
                type="number"
                value={calcData.area} 
                onChange={(e) => setCalcData({...calcData, area: e.target.value})}
                className="bg-[#0B1120] border-white/10"
                placeholder="e.g. 5000"
              />
            </div>
            <div className="space-y-2">
              <Label>Number of Floors</Label>
              <Input 
                type="number"
                value={calcData.floors} 
                onChange={(e) => setCalcData({...calcData, floors: e.target.value})}
                className="bg-[#0B1120] border-white/10"
                placeholder="e.g. 10"
              />
            </div>
            <div className="space-y-2">
              <Label>Foundation Cost (per sqft)</Label>
              <Input 
                type="number"
                value={calcData.foundationCost} 
                onChange={(e) => setCalcData({...calcData, foundationCost: e.target.value})}
                className="bg-[#0B1120] border-white/10"
                placeholder="e.g. 1200"
              />
            </div>
            <div className="space-y-2">
              <Label>Per Floor Construction Cost (per sqft)</Label>
              <Input 
                type="number"
                value={calcData.floorCost} 
                onChange={(e) => setCalcData({...calcData, floorCost: e.target.value})}
                className="bg-[#0B1120] border-white/10"
                placeholder="e.g. 2500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCalcOpen(false)}>Cancel</Button>
            <Button onClick={handleCalculate} className="bg-cyan-500 hover:bg-cyan-600 text-[#0B1120] font-bold">Calculate & Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Add Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-[#111827] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Add Budget Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Item Name / Description</Label>
              <Input 
                value={manualData.name} 
                onChange={(e) => setManualData({...manualData, name: e.target.value})}
                className="bg-[#0B1120] border-white/10"
                placeholder="e.g. Interior Design"
              />
            </div>
            <div className="space-y-2">
              <Label>Estimated Cost (৳)</Label>
              <Input 
                type="number"
                value={manualData.cost} 
                onChange={(e) => setManualData({...manualData, cost: e.target.value})}
                className="bg-[#0B1120] border-white/10"
                placeholder="e.g. 500000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleManualAdd} className="bg-cyan-500 hover:bg-cyan-600 text-[#0B1120] font-bold">Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
