import React from 'react';
import { ClipboardList, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BeeYieldCard, BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';

type MyTaskViewProps = {
  onTabChange?: (tab: string, message?: string, action?: string) => void;
};

const MyTaskView: React.FC<MyTaskViewProps> = ({ onTabChange }) => {
  return (
    <BeeYieldPageShell className={cn('p-0')}>
      <div className="p-4 lg:p-6 space-y-6 pb-20 max-w-7xl mx-auto">
        <BeeYieldPageHeader
          icon={ClipboardList}
          label="Operations"
          onBack={() => onTabChange?.('home')}
          title={
            <>
              My <span className="text-[#F4D03F]">Tasks</span>
            </>
          }
          subtitle="Your operational queue (real tasks only; no mock data)."
          actions={
            <button
              onClick={() => onTabChange?.('requests')}
              className="h-9 px-4 rounded-xl bg-white border border-gray-200 shadow-sm text-[10px] font-bold tracking-wider text-gray-700 hover:text-[#1A1A1A] hover:border-gray-300 transition-all flex items-center gap-2"
              aria-label="Go to requests"
              title="Go to requests"
            >
              Open Requests <ArrowRight className="w-3.5 h-3.5" />
            </button>
          }
        />

        <BeeYieldCard className="p-6 bg-white">
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-bold text-[#1A1A1A]">No tasks to show</p>
            <p className="text-[11px] font-medium text-gray-500 max-w-md leading-relaxed">
              Tasks will appear here once they’re created from inspections, alerts, or workflow automations.
            </p>
          </div>
        </BeeYieldCard>
      </div>
    </BeeYieldPageShell>
  );
};

export default MyTaskView;
