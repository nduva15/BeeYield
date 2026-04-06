import React from 'react';
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Gauge, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export type WeightDynamicsPoint = { time: string; weight: number; velocity: number };

const WeightDynamicsChart: React.FC<{ data?: WeightDynamicsPoint[] }> = ({ data }) => {
  const series = (data || []).filter((point) => point && Number.isFinite(point.weight) && Number.isFinite(point.velocity));
  const flowState = series.length >= 2 && series[series.length - 1].velocity > 0 ? 'Nectar gain' : 'Baseline';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#1B9157]" />
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-[#1A1A1A]">Weight dynamics</h3>
          </div>
          <p className="text-[11px] font-medium text-slate-500">A cleaner view of hive mass trend and change velocity.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#F4D03F]/20 bg-[#F4D03F]/10 px-3 py-1.5">
          <Gauge className="h-3.5 w-3.5 text-[#F4D03F]" />
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-600">{flowState}</span>
        </div>
      </div>

      <div className="h-[300px] rounded-[28px] border border-[#F4D03F]/15 bg-gradient-to-br from-white via-[#FFFDF8] to-[#F9F7F2] p-4 shadow-sm">
        {series.length >= 2 ? (
          <ResponsiveContainer width="100%" height="100%" debounce={50}>
            <ComposedChart data={series} margin={{ top: 12, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="weight-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F4D03F" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#F4D03F" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="velocity-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1B9157" stopOpacity={0.16} />
                  <stop offset="95%" stopColor="#1B9157" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5DE" />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 800 }}
                dy={8}
              />
              <YAxis
                yAxisId="weight"
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 800 }}
                dx={-6}
              />
              <YAxis yAxisId="velocity" orientation="right" hide />
              <Tooltip
                cursor={{ stroke: '#F4D03F', strokeOpacity: 0.35, strokeWidth: 1.5 }}
                contentStyle={{
                  borderRadius: '18px',
                  border: '1px solid rgba(244, 208, 63, 0.25)',
                  background: 'rgba(255, 255, 255, 0.96)',
                  boxShadow: '0 20px 45px -30px rgba(26,26,26,0.35)',
                  padding: '10px 12px',
                }}
                labelStyle={{ color: '#1A1A1A', fontSize: '10px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                itemStyle={{ color: '#475569', fontSize: '11px', fontWeight: 700 }}
              />
              <Area yAxisId="velocity" type="monotone" dataKey="velocity" fill="url(#velocity-fill)" stroke="none" />
              <Area yAxisId="weight" type="monotone" dataKey="weight" fill="url(#weight-fill)" stroke="none" />
              <Line
                yAxisId="weight"
                type="monotone"
                dataKey="weight"
                stroke="#1A1A1A"
                strokeWidth={3}
                dot={{ fill: '#F4D03F', r: 2.5, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#1B9157', stroke: '#FFF9F0', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <TrendingUp className="h-7 w-7 text-slate-300" />
            <p className="text-sm font-black text-[#1A1A1A]">No weight series yet</p>
            <p className="max-w-sm text-[11px] font-medium text-slate-500">Ingest weight readings to unlock the continuous dynamics chart.</p>
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { label: 'Latest weight', value: series.length ? `${series[series.length - 1].weight.toFixed(2)} kg` : '0.00 kg' },
          {
            label: 'Latest velocity',
            value: series.length ? `${series[series.length - 1].velocity >= 0 ? '+' : ''}${series[series.length - 1].velocity.toFixed(3)}` : '0.000',
          },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-[#F4D03F]/15 bg-[#FFF9F0] px-4 py-3">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
            <p className={cn('mt-1 text-base font-black text-[#1A1A1A]', item.label.includes('velocity') && series.length && series[series.length - 1].velocity < 0 && 'text-red-500')}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeightDynamicsChart;
