import { UserRole, ITIssue } from '../types';
import { 
  Building2, 
  Gauge, 
  User, 
  ShieldCheck, 
  Layers,
  Sparkles,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  issues: ITIssue[];
}

export default function Header({ currentRole, onRoleChange, issues }: HeaderProps) {
  const completedJobsCount = issues.filter(i => i.status === 'completed').length;

  const activeJobsCount = issues.filter(i => 
    ['assigned', 'dispatched', 'arrived', 'resolving', 'diagnosed', 'resolved', 'payment_pending', 'en_route'].includes(i.status)
  ).length;

  return (
    <header className="bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 via-indigo-950 to-slate-900 flex items-center justify-center shadow-md">
              <div className="w-5 h-5 border-2 border-white rounded-sm rotate-45 flex items-center justify-center">
                <span className="font-extrabold text-[9px] text-white -rotate-45">SB</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-black tracking-tight text-slate-900 font-sans">SolBridks</h1>
              </div>
              <p className="text-xs text-slate-500 font-medium">On demand Expert Services & Solutions</p>
            </div>
          </div>

          {/* Platform Performance / Real-time commercial index */}
          <div className="hidden lg:flex items-center gap-6 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl text-slate-800 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-1 px-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Jobs Completed</div>
                <div className="text-sm font-bold text-slate-700">{completedJobsCount + 36} solved</div>
              </div>
            </div>
            <div className="h-6 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="p-1 px-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Gauge className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">SLA Compliance</div>
                <div className="text-sm font-bold text-indigo-600">99.4% SLA</div>
              </div>
            </div>
            <div className="h-6 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="p-1 px-1.5 rounded-lg bg-slate-100 text-stone-700 border border-slate-200">
                <Clock className="w-4 h-4 text-stone-600" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Response Time</div>
                <div className="text-sm font-bold text-slate-700">14.2 mins</div>
              </div>
            </div>
            <div className="h-6 w-[1px] bg-slate-200" />
            <div className="relative flex items-center gap-2">
              <div className="p-1 px-1.5 rounded-lg bg-red-100 text-red-700 border border-red-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Active Dispatches</div>
                <div className="text-sm font-bold text-red-500">{activeJobsCount} live</div>
              </div>
            </div>
          </div>

          {/* User Persona/Role Switcher Buttons */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0 select-none shadow-inner">
            <span className="text-[10px] font-extrabold text-slate-500 px-2 uppercase my-1 hidden sm:inline-block">PORTAL SYSTEM:</span>
            
            <button
              id="switch-role-client"
              onClick={() => onRoleChange('client')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold tracking-wide transition-all ${
                currentRole === 'client'
                  ? 'bg-indigo-600 text-white shadow-md transform -translate-y-0.5'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Client UI
            </button>
 
            <button
              id="switch-role-expert"
              onClick={() => onRoleChange('expert')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold tracking-wide transition-all ${
                currentRole === 'expert'
                  ? 'bg-[#5a5a40] text-white shadow-md transform -translate-y-0.5'
                  : 'text-slate-600 hover:text-[#5a5a40] hover:bg-[#5a5a40]/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Expert Node
            </button>
 
            <button
              id="switch-role-operator"
              onClick={() => onRoleChange('operator')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold tracking-wide transition-all ${
                currentRole === 'operator'
                  ? 'bg-slate-900 text-white shadow-md transform -translate-y-0.5'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              HQ Control Room
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
