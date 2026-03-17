'use client';

import React, { useState } from 'react';
import { Plus, Upload, Eye, Download, Trash2, Calendar, CreditCard, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SigningMoneyTab({ project, onUpdate }: { project: any, onUpdate: (field: string, data: any) => void }) {
  const [payments, setPayments] = useState<any[]>(project?.signing_money || []);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [newPayment, setNewPayment] = useState({
    date: '',
    amount: '',
    method: 'Bank Transfer',
    notes: ''
  });

  const handleAddPayment = () => {
    if (!newPayment.date || !newPayment.amount) return;

    const payment = {
      id: Math.random().toString(36).substr(2, 9),
      date: newPayment.date,
      amount: parseFloat(newPayment.amount) || 0,
      method: newPayment.method,
      notes: newPayment.notes,
      receipt: null // Placeholder for file upload
    };

    const newPayments = [...payments, payment];
    setPayments(newPayments);
    onUpdate('signing_money', newPayments);
    setIsAddOpen(false);
    setNewPayment({ date: '', amount: '', method: 'Bank Transfer', notes: '' });
  };

  const handleDelete = (id: string) => {
    const newPayments = payments.filter(p => p.id !== id);
    setPayments(newPayments);
    onUpdate('signing_money', newPayments);
  };

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalAgreed = project?.terms_info?.cashComponent ? parseFloat(project.terms_info.cashComponent) : 0;
  const remaining = totalAgreed - totalPaid;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Signing Money Tracker</h2>
          <p className="text-sm text-gray-400">Track advance payments to the land owner.</p>
        </div>
        
        <Button 
          onClick={() => setIsAddOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
        >
          <Plus size={16} className="mr-2" />
          Record Payment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-2">Total Agreed Amount</p>
          <p className="text-3xl font-bold text-white font-mono">৳ {totalAgreed.toLocaleString('en-IN')}</p>
        </div>
        
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-2">Total Paid</p>
          <p className="text-3xl font-bold text-emerald-400 font-mono">৳ {totalPaid.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-[#111827] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-2">Remaining Balance</p>
          <p className="text-3xl font-bold text-orange-400 font-mono">৳ {Math.max(0, remaining).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 bg-white/5 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <div className="col-span-3">Date</div>
          <div className="col-span-3">Method</div>
          <div className="col-span-3 text-right">Amount (৳)</div>
          <div className="col-span-3 text-right">Receipt / Action</div>
        </div>
        
        <div className="divide-y divide-white/5">
          {payments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No payments recorded yet.
            </div>
          ) : (
            payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((payment) => (
              <div key={payment.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] transition-colors">
                <div className="col-span-3 font-medium text-white flex items-center gap-2">
                  <Calendar size={14} className="text-gray-500" />
                  {new Date(payment.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
                <div className="col-span-3 flex items-center gap-2">
                  <CreditCard size={14} className="text-gray-500" />
                  <span className="bg-gray-800 text-gray-300 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-gray-700">
                    {payment.method}
                  </span>
                </div>
                <div className="col-span-3 text-right font-mono text-emerald-400 font-bold">
                  {payment.amount.toLocaleString('en-IN')}
                </div>
                <div className="col-span-3 flex items-center justify-end gap-3">
                  <button className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors">
                    <Upload size={12} /> Upload
                  </button>
                  <button 
                    onClick={() => handleDelete(payment.id)}
                    className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Payment Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-[#111827] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Record Advance Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Input 
                type="date"
                value={newPayment.date} 
                onChange={(e) => setNewPayment({...newPayment, date: e.target.value})}
                className="bg-[#0B1120] border-white/10 [color-scheme:dark]"
              />
            </div>
            <div className="space-y-2">
              <Label>Amount (৳)</Label>
              <Input 
                type="number"
                value={newPayment.amount} 
                onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                className="bg-[#0B1120] border-white/10 font-mono text-emerald-400"
                placeholder="e.g. 500000"
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <select 
                value={newPayment.method}
                onChange={(e) => setNewPayment({...newPayment, method: e.target.value})}
                className="w-full h-10 px-3 rounded-md bg-[#0B1120] border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Pay Order">Pay Order</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Notes / Reference</Label>
              <Input 
                value={newPayment.notes} 
                onChange={(e) => setNewPayment({...newPayment, notes: e.target.value})}
                className="bg-[#0B1120] border-white/10"
                placeholder="e.g. Cheque No. 123456"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPayment} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold">Save Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
