'use client';

import React from 'react';
import { Plus, Sun, Cloud, Users, CheckCircle2, Circle, PieChart, Image as ImageIcon, BarChart2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function DailyLogTab({ project }: { project: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left: Daily Logs */}
      <div className="lg:col-span-8 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Today&apos;s Log</h2>
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-[#0B1120] font-bold">
            <Plus size={16} className="mr-2" />
            Add Log Entry
          </Button>
        </div>

        <div className="relative pl-8 space-y-8">
          {/* Timeline line */}
          <div className="absolute left-3 top-2 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-white/10 to-white/10"></div>

          {/* Log Item 1 */}
          <div className="relative">
            <div className="absolute -left-[29px] top-3 w-3 h-3 rounded-full bg-cyan-500 ring-4 ring-[#0B1120]"></div>
            <div className="bg-[#111827] border border-white/5 rounded-2xl p-6">
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-cyan-500 text-[#0B1120] text-xs font-bold px-3 py-1.5 rounded-full">
                  Mar 7, 2026
                </span>
                <span className="bg-orange-500/10 text-orange-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-orange-500/20">
                  <Sun size={14} /> Sunny
                </span>
                <span className="bg-white/5 text-gray-300 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10">
                  <Users size={14} /> 24 workers
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-2">Work Done:</p>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Finished foundation pouring for Section A, started steel rebar fixing for Pillar B1. Mix quality verified by on-site engineer.
                  </p>
                </div>
                
                <div className="border-l-2 border-orange-500 pl-4 py-1">
                  <p className="text-[10px] text-orange-500 uppercase tracking-wider font-bold mb-1">Remaining:</p>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    30% of Pillar B1 rebar remaining. Scheduled for completion tomorrow morning.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden relative">
                    <Image src="https://picsum.photos/seed/karim/100/100" alt="Karim" fill className="object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Logged by <span className="text-white font-medium">Karim</span></p>
                    <p className="text-[10px] text-gray-500">9:23 AM</p>
                  </div>
                </div>
                <button className="flex items-center gap-2 bg-cyan-500/10 text-cyan-400 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-cyan-500/20 transition-colors cursor-not-allowed opacity-80" title="Photos coming soon">
                  <ImageIcon size={14} /> 3 photos
                </button>
              </div>
            </div>
          </div>

          {/* Log Item 2 */}
          <div className="relative">
            <div className="absolute -left-[29px] top-3 w-3 h-3 rounded-full bg-gray-600 ring-4 ring-[#0B1120]"></div>
            <div className="bg-[#111827]/50 border border-white/5 rounded-2xl p-6">
              <div className="flex flex-wrap gap-3 mb-4">
                <span className="bg-white/10 text-gray-300 text-xs font-bold px-3 py-1.5 rounded-full">
                  Mar 6, 2026
                </span>
                <span className="bg-blue-500/10 text-blue-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-blue-500/20">
                  <Cloud size={14} /> Cloudy
                </span>
              </div>

              <p className="text-gray-400 text-sm mb-4">
                Section A excavation completed. Soil test reports attached.
              </p>

              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gray-800 overflow-hidden relative opacity-70">
                  <Image src="https://picsum.photos/seed/sarah/100/100" alt="Sarah" fill className="object-cover" referrerPolicy="no-referrer" />
                </div>
                <p className="text-[10px] text-gray-500">by Sarah • 4:15 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Active Phases & Insights */}
      <div className="lg:col-span-4 space-y-6">
        <h3 className="text-xl font-bold mb-6">Active Phases</h3>
        
        {/* Phase Card */}
        <div className="bg-[#111827] border border-cyan-500/20 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-cyan-500 flex items-center justify-center text-cyan-500 font-bold text-xs">
                  01
                </div>
                <h4 className="font-bold text-white">Foundation Phase</h4>
              </div>
              <ChevronUp size={16} className="text-gray-500" />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 w-[65%] rounded-full"></div>
              </div>
              <span className="bg-cyan-500/10 text-cyan-400 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                8 Tasks
              </span>
            </div>
          </div>
          
          <div className="p-2">
            {/* Task 1 */}
            <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-cyan-500" />
                <span className="text-sm text-gray-300">Site Excavation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-800 overflow-hidden relative">
                  <Image src="https://picsum.photos/seed/sarah/100/100" alt="Sarah" fill className="object-cover" referrerPolicy="no-referrer" />
                </div>
                <span className="bg-cyan-500/10 text-cyan-400 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider w-20 text-center">
                  Done
                </span>
              </div>
            </div>

            {/* Task 2 */}
            <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <PieChart size={16} className="text-cyan-500" />
                <span className="text-sm text-white font-medium">Pillar B1 Reinforcement</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-800 overflow-hidden relative">
                  <Image src="https://picsum.photos/seed/karim/100/100" alt="Karim" fill className="object-cover" referrerPolicy="no-referrer" />
                </div>
                <span className="bg-orange-500/10 text-orange-400 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider w-20 text-center border border-orange-500/20">
                  In Progress
                </span>
              </div>
            </div>

            {/* Task 3 */}
            <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <Circle size={16} className="text-gray-600" />
                <span className="text-sm text-gray-500">Concrete Curing Check</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-800 overflow-hidden relative opacity-50">
                  <Image src="https://picsum.photos/seed/rahim/100/100" alt="Rahim" fill className="object-cover" referrerPolicy="no-referrer" />
                </div>
                <span className="bg-white/5 text-gray-400 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider w-20 text-center">
                  Mar 9
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 2 (Collapsed) */}
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:border-white/10 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-gray-700 flex items-center justify-center text-gray-500 font-bold text-xs">
              02
            </div>
            <div>
              <h4 className="font-bold text-gray-300 text-sm">Structural Framing</h4>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Scheduled for Apr 2026</p>
            </div>
          </div>
          <ChevronDown size={16} className="text-gray-600" />
        </div>

        {/* Efficiency Insight */}
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <BarChart2 size={16} />
            </div>
            <h4 className="font-bold text-white">Efficiency Insight</h4>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mb-6">
            The project is currently tracking <span className="text-emerald-400 font-bold">2 days ahead</span> of schedule due to rapid completion of Section A.
          </p>
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-[#111827] overflow-hidden relative">
                  <Image src={`https://picsum.photos/seed/worker${i}/100/100`} alt="Worker" fill className="object-cover" referrerPolicy="no-referrer" />
                </div>
              ))}
              <div className="w-6 h-6 rounded-full border-2 border-[#111827] bg-gray-800 flex items-center justify-center text-[8px] font-bold text-gray-400">
                +12
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
