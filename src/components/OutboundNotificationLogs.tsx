import React, { useState } from 'react';
import { NotificationLog } from '../types';
import { 
  Mail, 
  Smartphone, 
  CheckCircle, 
  Server, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Search,
  BellRing
} from 'lucide-react';

interface LogsProps {
  notifications: NotificationLog[];
  onClearAll?: () => void;
}

export default function OutboundNotificationLogs({ notifications, onClearAll }: LogsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterRole, setFilterRole] = useState<'all' | 'client' | 'expert' | 'operator'>('all');

  const filtered = notifications
    .filter(n => filterRole === 'all' || n.recipientRole === filterRole)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="bg-white text-slate-800 rounded-2xl border border-slate-200 shadow-lg overflow-hidden font-sans">
      {/* Header bar always visible - Light & Eye-Catching */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-4 flex items-center justify-between cursor-pointer select-none bg-slate-50 hover:bg-slate-100 transition-all border-b border-slate-200"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Server className="w-5 h-5 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <h3 className="text-sm font-extrabold tracking-wide text-slate-900 font-sans">
              Real-time SMS &amp; Email Dispatch Alerts
            </h3>
            <div className="text-[11px] text-slate-500 font-medium">
              Live automated SLA notifications &amp; event logs ({notifications.length} logged events)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            Automated Notifications Active
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </div>

      {isOpen && (
        <div className="p-5 bg-slate-50/50 space-y-4 max-h-[500px] overflow-y-auto border-t border-slate-100">
          {/* Controls & Metrics */}
          <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold mr-1">Target Filter:</span>
              {(['all', 'client', 'expert', 'operator'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setFilterRole(role)}
                  className={`text-[10px] px-3 py-1 rounded-lg uppercase font-extrabold border transition cursor-pointer ${
                    filterRole === role
                      ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {onClearAll && (
              <button
                onClick={onClearAll}
                className="text-[10px] font-bold text-slate-500 hover:text-red-600 transition-colors border-none bg-transparent cursor-pointer"
              >
                Clear Router Logs
              </button>
            )}
          </div>

          {/* Logs Stream */}
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs bg-white rounded-xl border border-dashed border-slate-200">
              <BellRing className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <span className="font-medium text-slate-600">No alerts routed. Update ticket status to dispatch notifications.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((notif) => {
                const isSms = notif.channel === 'sms';
                return (
                  <div 
                    key={notif.id}
                    className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all text-xs shadow-xs space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isSms ? (
                          <span className="flex items-center gap-1 text-[9.5px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold uppercase">
                            <Smartphone className="w-3.5 h-3.5 text-amber-600" /> SMS Notification
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[9.5px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-bold uppercase">
                            <Mail className="w-3.5 h-3.5 text-blue-600" /> Email Notification
                          </span>
                        )}
                        <span className="text-slate-600 text-[11px] uppercase font-bold">
                          To: <strong className="text-slate-900">{notif.recipientRole}</strong> ({notif.recipientName})
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono font-semibold">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-slate-900 text-xs font-extrabold leading-tight">
                        {notif.subject}
                      </div>
                      <div className="text-slate-700 text-xs leading-relaxed break-words font-sans bg-slate-50 p-3 rounded-xl border border-slate-200">
                        {notif.body}
                      </div>
                      <div className="text-[10px] text-emerald-700 flex items-center gap-2 pt-0.5 font-mono font-medium">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Endpoint: {notif.recipientContact} | Status: Delivered (200 OK)</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
