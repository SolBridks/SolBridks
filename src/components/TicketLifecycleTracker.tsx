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

  // Simple, friendly lifecycle phases
  const phases = [
    {
      key: 'submission',
      label: '1. Request Received',
      description: 'Ticket submitted & logged',
      isCompleted: ['priced', 'assigned', 'dispatched', 'arrived', 'resolving', 'payment_pending', 'completed'].includes(status),
      isActive: status === 'submitted',
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 border-amber-200'
    },
    {
      key: 'pricing',
      label: '2. Price Confirmed',
      description: 'Fixed price quote set',
      isCompleted: ['assigned', 'dispatched', 'arrived', 'resolving', 'payment_pending', 'completed'].includes(status),
      isActive: status === 'priced',
      icon: CreditCard,
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200'
    },
    {
      key: 'dispatch',
      label: '3. Tech on the Way',
      description: 'Specialist travelling to you',
      isCompleted: ['arrived', 'resolving', 'payment_pending', 'completed'].includes(status),
      isActive: ['assigned', 'dispatched'].includes(status),
      icon: Truck,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200'
    },
    {
      key: 'diagnostic',
      label: '4. Repair in Progress',
      description: 'On-site diagnostic & fix',
      isCompleted: ['payment_pending', 'completed'].includes(status),
      isActive: ['arrived', 'resolving'].includes(status),
      icon: Wrench,
      color: 'text-emerald-700 bg-emerald-50 border-slate-200'
    },
    {
      key: 'accounting',
      label: '5. Ready for Payment',
      description: 'Repair done, invoice ready',
      isCompleted: status === 'completed',
      isActive: status === 'payment_pending',
      icon: ShieldAlert,
      color: 'text-red-600 bg-red-50 border-red-200'
    },
    {
      key: 'archived',
      label: '6. Ticket Closed',
      description: 'Job complete & verified',
      isCompleted: status === 'completed',
      isActive: status === 'completed',
      icon: CheckCircle2,
      color: 'text-slate-800 bg-slate-100 border-slate-300'
    }
  ];

  // Derive active description text in plain human language
  const getSLAStatusText = () => {
    switch (status) {
      case 'submitted':
        return 'Ticket received! Waiting for HQ to review details and confirm the price quote.';
      case 'priced':
        return 'Price quote confirmed. Waiting for an available technician to accept the job.';
      case 'assigned':
        return `Job accepted by technician ${issue.expertName || 'Tech Expert'}. Getting ready to head over.`;
      case 'dispatched':
        return `Technician ${issue.expertName || 'Tech Expert'} is on the way to your location.`;
      case 'arrived':
        return 'Technician has arrived on-site and is diagnosing the issue.';
      case 'resolving':
        return 'Fix in progress! Technician is working on resolving the problem.';
      case 'payment_pending':
        return 'Repair finished! Review the work and complete payment when ready.';
      case 'completed':
        return 'Job complete and paid! Your 90-day service warranty is now active.';
      default:
        return 'Monitoring system operations.';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm text-slate-800">
      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-700" />
          <span className="text-xs font-black uppercase text-slate-900 tracking-wider">
            TICKET PROGRESS TIMELINE
          </span>
        </div>
        <div className="text-[10px] bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded-md font-mono font-bold">
          TICKET ID: SB-{issue.id.split('_')[1] || issue.id}
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
                  ? 'border-slate-800 bg-slate-50 ring-2 ring-slate-900/10 shadow-sm'
                  : p.isCompleted 
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              {/* Completed dot */}
              <div className="absolute top-2.5 right-2.5">
                {p.isCompleted ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 fill-white" />
                ) : p.isActive ? (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-900 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-900"></span>
                  </span>
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-300" />
                )}
              </div>

              {/* Icon */}
              <div className={`p-1.5 rounded-lg inline-block mb-2 ${
                p.isActive 
                  ? 'bg-slate-900 text-white'
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
      <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-start gap-2.5 text-xs text-slate-700">
        <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-slate-900 uppercase tracking-wider text-[9px] block">
            Latest Status Update:
          </span>
          <p className="text-slate-700 font-sans leading-relaxed">
            {getSLAStatusText()}
          </p>
        </div>
      </div>
    </div>
  );
}
