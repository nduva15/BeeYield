import { UsbHubDashboard } from '@/components/beeyield/UsbHubDashboard';
import { Button } from '@/components/ui/button';
import {
   Search,
   Bell,
   ChevronDown,
   Moon,
   Headphones,
   Wifi,
   Settings as SettingsIcon,
   LogOut
} from 'lucide-react';

export function UsbHubConnection() {
   return (
      <div className="min-h-screen bg-[#FDFDFD] text-slate-800 font-sans">

         {/* Top Navigation Simulation */}
         <header className="bg-white border-b border-slate-100 px-6 py-2.5 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-10">
               <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-[#1E1E2E]">BeeYield Hub</h1>
               </div>
               <div className="relative group flex items-center bg-slate-100/50 border border-slate-200 rounded-full px-4 py-1.5 w-64 focus-within:ring-1 focus-within:ring-blue-400 focus-within:border-blue-400 transition-all">
                  <Search className="w-4 h-4 text-slate-400 mr-2" />
                  <input
                     type="text"
                     placeholder="Search apiaries, beehives"
                     className="bg-transparent border-0 p-0 text-xs w-full focus:outline-none"
                  />
               </div>
            </div>

            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 border border-slate-200 text-xs font-semibold">
                  <span className="w-5 h-5 flex items-center justify-center rounded-sm bg-blue-600 text-[10px] text-white font-black">GB</span>
                  <span className="text-slate-700">English</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
               </div>

               <div className="flex items-center gap-0.5 border-l border-slate-200 pl-3">
                  <Button variant="ghost" size="icon" className="w-9 h-9 text-slate-400 hover:bg-slate-50"><Moon className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="w-9 h-9 text-slate-400 hover:bg-slate-50"><Bell className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="w-9 h-9 text-slate-400 hover:bg-slate-50"><Headphones className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="w-9 h-9 text-slate-400 hover:bg-slate-50"><Wifi className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="w-9 h-9 text-slate-400 hover:bg-slate-50"><SettingsIcon className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="w-9 h-9 text-slate-400 hover:bg-slate-50"><LogOut className="w-4 h-4" /></Button>
               </div>
            </div>
         </header>

         <main className="max-w-[1240px] mx-auto px-6 py-10">
            <UsbHubDashboard />
         </main>
      </div>
   );
}
