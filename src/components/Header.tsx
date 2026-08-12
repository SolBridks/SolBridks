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
            <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-md overflow-hidden p-1 shrink-0">
              <img 
                src="/logo.jpg" 
                alt="SolBridks Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback to SVG if image loading has issues
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/favicon.svg";
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-2xl font-black tracking-tight text-[#0f172a] font-sans">
                  Sol<span className="text-[#dc2626]">Bridks</span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-500 font-bold tracking-tight">On demand Expert Services &amp; Solutions</p>
            </div>
          </div>

          {/* User Role Switcher Buttons */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0 select-none shadow-inner">
            <button
              id="switch-role-client"
              onClick={() => onRoleChange('client')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold tracking-wide transition-all ${
                currentRole === 'client'
                  ? 'bg-[#0f172a] text-white shadow-md transform -translate-y-0.5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Client Portal
            </button>
 
            <button
              id="switch-role-expert"
              onClick={() => onRoleChange('expert')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold tracking-wide transition-all ${
                currentRole === 'expert'
                  ? 'bg-[#0f172a] text-white shadow-md transform -translate-y-0.5'
                  : 'text-slate-600 hover:text-[#0f172a] hover:bg-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Specialist Portal
            </button>
 
            <button
              id="switch-role-operator"
              onClick={() => onRoleChange('operator')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold tracking-wide transition-all ${
                currentRole === 'operator'
                  ? 'bg-[#18181b] text-white shadow-md transform -translate-y-0.5'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              HQ Operations
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
