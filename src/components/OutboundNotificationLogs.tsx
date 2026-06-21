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
    <div className="bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Header bar always visible */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-4 flex items-center justify-between cursor-pointer select-none bg-slate-950 hover:bg-slate-900 transition-all font-mono"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Server className="w-5 h-5 text-indigo-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </div>
          <div>
            <div className="text-xs font-black tracking-widest text-[#a8af9e] uppercase">
              SolBridks Outbound Telemetry Hub
            </div>
            <div className="text-[10px] text-slate-400 font-sans">
              Real-time SMS &amp; SMTP Relay Carrier Gateways ({notifications.length} logged alerts)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-sans">
            SLA Automatic Gateway
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {isOpen && (
        <div className="p-5 border-t border-slate-800 space-y-4 max-h-[500px] overflow-y-auto font-mono">
          {/* Controls & Metrics */}
          <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold mr-2">Target Filter:</span>
              {(['all', 'client', 'expert', 'operator'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setFilterRole(role)}
                  className={`text-[9px] px-2.5 py-1 rounded-md uppercase font-bold border transition ${
                    filterRole === role
                      ? 'bg-slate-100 text-slate-900 border-white'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {onClearAll && (
              <button
                onClick={onClearAll}
                className="text-[9px] text-slate-400 underline hover:text-red-400 border-none bg-transparent cursor-pointer"
              >
                Clear Router Logs
              </button>
            )}
          </div>

          {/* Logs Stream */}
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              <BellRing className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
              <span>No alerts routed. Initiate ticket changes to trigger SMTP / SMS relays.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((notif) => {
                const isSms = notif.channel === 'sms';
                return (
                  <div 
                    key={notif.id}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-850 hover:border-indigo-500/20 transition-all text-xs"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-900 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isSms ? (
                          <span className="flex items-center gap-1 text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded font-bold uppercase">
                            <Smartphone className="w-3 h-3" /> SMS Gateway
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[9px] bg-indigo-950 text-indigo-400 border border-indigo-800 px-2 py-0.5 rounded font-bold uppercase">
                            <Mail className="w-3 h-3" /> SMTP Relay
                          </span>
                        )}
                        <span className="text-slate-400 text-[10px] uppercase font-bold">
                          To: {notif.recipientRole} ({notif.recipientName})
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-slate-200 text-xs font-bold leading-tight">
                        {notif.subject}
                      </div>
                      <div className="text-slate-400 text-[10.5px] leading-relaxed break-words font-sans bg-slate-900/40 p-2 rounded-lg border border-slate-800/60">
                        {notif.body}
                      </div>
                      <div className="text-[9px] text-indigo-400 flex items-center gap-2 mt-1 font-mono">
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                        <span>Route parameters: carrier_endpoint={notif.recipientContact} | status_code=200_OK_DELIVERED</span>
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
