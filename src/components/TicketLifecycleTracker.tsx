import React from 'react';
import { ITIssue, IssueStatus } from '../types';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  ShieldAlert, 
  Truck, 
  Wrench, 
  CreditCard,
  History
} from 'lucide-react';

interface TrackerProps {
  issue: ITIssue;
}

export default function TicketLifecycleTracker({ issue }: TrackerProps) {
  const status = issue.status;

  // Professional enterprise lifecycle phases
  const phases = [
    {
      key: 'submission',
      label: '1. Intake Audit',
      description: 'Liaison intake logged',
      isCompleted: ['priced', 'assigned', 'dispatched', 'arrived', 'resolving', 'payment_pending', 'completed'].includes(status),
      isActive: status === 'submitted',
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 border-amber-200'
    },
    {
      key: 'pricing',
      label: '2. Rate Confirmed',
      description: 'SLA quote structured',
      isCompleted: ['assigned', 'dispatched', 'arrived', 'resolving', 'payment_pending', 'completed'].includes(status),
      isActive: status === 'priced',
      icon: CreditCard,
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200'
    },
    {
      key: 'dispatch',
      label: '3. Specialist En Route',
      description: 'Vehicle GPS tracking',
      isCompleted: ['arrived', 'resolving', 'payment_pending', 'completed'].includes(status),
      isActive: ['assigned', 'dispatched'].includes(status),
      icon: Truck,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200'
    },
    {
      key: 'diagnostic',
      label: '4. Active Recovery',
      description: 'In-situ diagnostics & code',
      isCompleted: ['payment_pending', 'completed'].includes(status),
      isActive: ['arrived', 'resolving'].includes(status),
      icon: Wrench,
      color: 'text-emerald-700 bg-emerald-50 border-[#e9e7df]'
    },
    {
      key: 'accounting',
      label: '5. Auditing & Ledger',
      description: 'Verified pending payout',
      isCompleted: status === 'completed',
      isActive: status === 'payment_pending',
      icon: ShieldAlert,
      color: 'text-red-600 bg-red-50 border-red-200'
    },
    {
      key: 'archived',
      label: '6. Settlement Closed',
      description: 'Contract completed',
      isCompleted: status === 'completed',
      isActive: status === 'completed',
      icon: CheckCircle2,
      color: 'text-slate-800 bg-slate-100 border-slate-300'
    }
  ];

  // Derive active description text
  const getSLAStatusText = () => {
    switch (status) {
      case 'submitted':
        return 'Ticket lodged in master queue. Awaiting operator appraisal and fixed cost confirmation.';
      case 'priced':
        return 'Commercial price computed. Awaiting qualified technician to lock contract and execute.';
      case 'assigned':
        return `Contract locked by specialist ${issue.expertName || 'Technical Expert'}. Initializing dispatch checklist.`;
      case 'dispatched':
        return `Rapid-response vehicle dispatched. Specialist ${issue.expertName || 'Technical Expert'} is navigating to coordinates.`;
      case 'arrived':
        return 'Specialist on site. Running initial hardware system and software database diagnostic tests.';
      case 'resolving':
        return 'Active resolution phase initiated. Deploying updates, testing signals, and checking firmware stability.';
      case 'payment_pending':
        return 'Resolution completed. Specialist dispatched final reports. Awaiting corporate checkout clearance.';
      case 'completed':
        return 'SLA contract closed successfully. Invoices cleared and 90-Day commercial warranty activated.';
      default:
        return 'Monitoring system operations.';
    }
  };

  return (
    <div className="bg-white border border-[#e9e7df] rounded-2xl p-5 space-y-4 shadow-sm text-amber-900/90">
      <div className="flex justify-between items-center pb-2 border-b border-[#f0eee6]">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#5a5a40]" />
          <span className="text-xs font-black uppercase text-[#2c3124] tracking-wider">
            SLA LIFECYCLE CHRONOLOGY
          </span>
        </div>
        <div className="text-[10px] bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded-md font-mono font-bold">
          CODE: SB-{issue.id.split('_')[1] || issue.id}
        </div>
      </div>

      {/* Progress horizontal timeline bar */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2">
        {phases.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div 
              key={p.key}
              className={`p-3 rounded-xl border transition-all text-left relative ${
                p.isActive 
                  ? 'border-[#5a5a40] bg-[#fbfcfc] ring-2 ring-[#5a5a40]/10 shadow-sm'
                  : p.isCompleted 
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-[#f0eee6] bg-[#fdfcfc]'
              }`}
            >
              {/* Completed dot */}
              <div className="absolute top-2.5 right-2.5">
                {p.isCompleted ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 fill-white" />
                ) : p.isActive ? (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5a5a40] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5a5a40]"></span>
                  </span>
                ) : (
                  <Circle className="w-3.5 h-3.5 text-[#e1e2da]" />
                )}
              </div>

              {/* Icon */}
              <div className={`p-1.5 rounded-lg inline-block mb-2 ${
                p.isActive 
                  ? 'bg-[#5a5a40] text-white'
                  : p.isCompleted 
                    ? 'bg-emerald-600/10 text-emerald-700'
                    : 'bg-slate-100 text-slate-400'
              }`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="text-xs font-bold text-slate-900 tracking-tight leading-none">
                {p.label}
              </div>
              <div className="text-[9px] text-slate-500 mt-1 leading-normal font-sans">
                {p.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* SLA Commentary block */}
      <div className="bg-[#fcfcfa] border border-[#f0eee6] p-3 rounded-xl flex items-start gap-2.5 text-xs text-[#5a5a40]">
        <Clock className="w-4 h-4 text-[#8a8d81] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-[#3d4234] uppercase tracking-wider text-[9px] block">
            Current Operator Dispatch Diary:
          </span>
          <p className="text-slate-700 font-sans leading-relaxed">
            {getSLAStatusText()}
          </p>
        </div>
      </div>
    </div>
  );
}
