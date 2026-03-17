'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, CheckCircle2, Upload, FileText, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function TermsTab({ project, onUpdate }: { project: any, onUpdate: (field: string, data: any) => void }) {
  const [isApproved, setIsApproved] = useState<boolean>(project?.terms_approved || false);
  const [mode, setMode] = useState<'A' | 'B'>('A'); // A: Flat Count, B: Percentage
  
  const [totalFlats, setTotalFlats] = useState(project?.terms_info?.totalFlats || '36');
  const [ownerShare, setOwnerShare] = useState(project?.terms_info?.ownerShare || '');
  const [developerShare, setDeveloperShare] = useState(project?.terms_info?.developerShare || '');
  const [cashComponent, setCashComponent] = useState(project?.terms_info?.cashComponent || '');

  // Calculated values
  const total = parseFloat(totalFlats) || 0;
  const ownerInput = parseFloat(ownerShare) || 0;
  const devInput = parseFloat(developerShare) || 0;

  let calcOwnerFlats = 0;
  let calcOwnerPct = 0;
  let calcDevFlats = 0;
  let calcDevPct = 0;

  if (total > 0) {
    if (mode === 'A') {
      calcOwnerFlats = ownerInput;
      calcOwnerPct = (ownerInput / total) * 100;
      calcDevFlats = devInput;
      calcDevPct = (devInput / total) * 100;
    } else {
      calcOwnerPct = ownerInput;
      calcOwnerFlats = (ownerInput / 100) * total;
      calcDevPct = devInput;
      calcDevFlats = (devInput / 100) * total;
    }
  }

  const handleApprove = () => {
    const termsData = {
      totalFlats,
      ownerShare,
      developerShare,
      cashComponent,
      mode,
      calcOwnerFlats,
      calcOwnerPct,
      calcDevFlats,
      calcDevPct
    };
    onUpdate('terms_info', termsData);
    onUpdate('terms_approved', true);
    setIsApproved(true);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Terms & Chukti</h2>
          <p className="text-sm text-gray-400">Ratio calculator and agreement terms.</p>
        </div>
        
        {isApproved && (
          <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20">
            <CheckCircle2 size={16} />
            <span className="font-bold text-sm">Terms Approved & Locked</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ratio Calculator */}
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Calculator size={20} />
            </div>
            <h3 className="text-lg font-bold">Ratio Calculator</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-400 uppercase tracking-wider">Total Flat Count</Label>
              <Input 
                type="number"
                value={totalFlats} 
                onChange={(e) => setTotalFlats(e.target.value)}
                disabled={isApproved}
                className="bg-[#0B1120] border-white/10 text-lg font-bold h-12"
              />
            </div>

            {!isApproved && (
              <div className="flex gap-2 p-1 bg-[#0B1120] rounded-lg border border-white/5">
                <button
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${
                    mode === 'A' ? 'bg-cyan-500 text-[#0B1120]' : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => { setMode('A'); setOwnerShare(''); setDeveloperShare(''); }}
                >
                  Mode A: Enter Flat Count
                </button>
                <button
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${
                    mode === 'B' ? 'bg-cyan-500 text-[#0B1120]' : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => { setMode('B'); setOwnerShare(''); setDeveloperShare(''); }}
                >
                  Mode B: Enter Percentage
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-gray-400 uppercase tracking-wider">
                  Owner Share {mode === 'A' ? '(Flats)' : '(%)'}
                </Label>
                <Input 
                  type="number"
                  value={ownerShare} 
                  onChange={(e) => {
                    setOwnerShare(e.target.value);
                    if (mode === 'A') {
                      setDeveloperShare(String(parseFloat(totalFlats) - parseFloat(e.target.value || '0')));
                    } else {
                      setDeveloperShare(String(100 - parseFloat(e.target.value || '0')));
                    }
                  }}
                  disabled={isApproved}
                  className="bg-[#0B1120] border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-400 uppercase tracking-wider">
                  Developer Share {mode === 'A' ? '(Flats)' : '(%)'}
                </Label>
                <Input 
                  type="number"
                  value={developerShare} 
                  onChange={(e) => {
                    setDeveloperShare(e.target.value);
                    if (mode === 'A') {
                      setOwnerShare(String(parseFloat(totalFlats) - parseFloat(e.target.value || '0')));
                    } else {
                      setOwnerShare(String(100 - parseFloat(e.target.value || '0')));
                    }
                  }}
                  disabled={isApproved}
                  className="bg-[#0B1120] border-white/10"
                />
              </div>
            </div>

            {/* Results Display */}
            <div className="mt-6 p-4 bg-[#0B1120] border border-white/5 rounded-xl space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Land Owner</p>
                  <p className="text-xl font-bold text-white">{calcOwnerFlats.toFixed(1)} Flats</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Ratio</p>
                  <p className="text-xl font-bold text-emerald-400">{calcOwnerPct.toFixed(1)}%</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Developer</p>
                  <p className="text-xl font-bold text-white">{calcDevFlats.toFixed(1)} Flats</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Ratio</p>
                  <p className="text-xl font-bold text-cyan-400">{calcDevPct.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cash Component & Documents */}
        <div className="space-y-6">
          <div className="bg-[#111827] border border-white/5 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold border-b border-white/5 pb-4">Financial & Documents</h3>
            
            <div className="space-y-2">
              <Label className="text-xs text-gray-400 uppercase tracking-wider">Cash Component / Signing Money (৳)</Label>
              <Input 
                type="number"
                value={cashComponent} 
                onChange={(e) => setCashComponent(e.target.value)}
                disabled={isApproved}
                className="bg-[#0B1120] border-white/10 text-lg font-mono text-emerald-400"
                placeholder="e.g. 5000000"
              />
            </div>

            <div className="pt-4">
              <Label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Agreement Documents</Label>
              <div className="border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-white/5 text-gray-400 flex items-center justify-center mb-3">
                  <Upload size={18} />
                </div>
                <p className="text-sm font-medium text-gray-300 mb-1">Upload Final Chukti Document</p>
                <p className="text-xs text-gray-500">PDF only (MAX 20MB)</p>
              </div>
            </div>
          </div>

          {!isApproved && (
            <Button 
              onClick={handleApprove}
              className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              Approve & Lock Terms
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
