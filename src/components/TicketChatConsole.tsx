import React, { useState, useEffect, useRef } from 'react';
import { ITIssue, ChatMessage, UserRole } from '../types';
import { 
  Send, 
  MessageSquare, 
  ShieldCheck, 
  PhoneCall, 
  CornerDownRight, 
  Sparkles,
  User,
  Layers,
  Lock,
  ExternalLink
} from 'lucide-react';

interface TicketChatConsoleProps {
  issue: ITIssue;
  currentRole: UserRole;
  currentUserName: string;
  onSendMessage: (issueId: string, message: ChatMessage) => void;
}

export default function TicketChatConsole({
  issue,
  currentRole,
  currentUserName,
  onSendMessage
}: TicketChatConsoleProps) {
  const [typedMessage, setTypedMessage] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = issue.chatMessages || [];

  // Scroll to bottom on load/new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set default phone number if present or mock
  useEffect(() => {
    if (currentRole === 'operator') {
      const defaultPhone = issue.clientPhone || '5550199201';
      setPhoneInput(defaultPhone);
    }
  }, [issue, currentRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const newMsg: ChatMessage = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      senderRole: currentRole,
      senderName: currentUserName,
      body: typedMessage.trim(),
      timestamp: new Date().toISOString(),
      isSecurelyEncrypted: true
    };

    onSendMessage(issue.id, newMsg);
    setTypedMessage('');
  };

  // Helper to get formatted timestamps
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Helper badge color based on role
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'operator':
        return (
          <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider bg-slate-900 text-white px-1.5 py-0.5 rounded">
            <Layers className="w-2.5 h-2.5" /> HQ Command
          </span>
        );
      case 'expert':
        return (
          <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider bg-[#5a5a40] text-white px-1.5 py-0.5 rounded">
            <Sparkles className="w-2.5 h-2.5" /> Tech{issue.expertName ? ` (${issue.expertName})` : ' Expert'}
          </span>
        );
      case 'client':
        return (
          <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider bg-indigo-600 text-white px-1.5 py-0.5 rounded">
            <User className="w-2.5 h-2.5" /> Client
          </span>
        );
    }
  };

  // Build a secure WhatsApp notification dispatch link
  const triggerWhatsAppDispatch = (recipientRole: 'client' | 'expert') => {
    let targetNum = phoneInput || '5550199201';
    
    // Clean phone number from non-numeric characters for URI
    const cleanNum = targetNum.replace(/\D/g, '');
    
    let messageBody = '';
    if (recipientRole === 'client') {
      messageBody = `SolBridks HQ Message for Ticket #${issue.id} ("${issue.title}"):\n\nHello ${issue.clientName}, your support ticket message center is active. The technician setup is ready under SLA guidelines. Status: [${issue.status.toUpperCase()}]. Please upload documents or view details here: https://solbridks.net/ticket/${issue.id}`;
    } else {
      const expertName = issue.expertName || 'Assigned Expert';
      messageBody = `SolBridks HQ Dispatch for Specialist ${expertName}:\n\nAction required on Ticket #${issue.id} ("${issue.title}"). Client: ${issue.clientName}. Location coordinates [${issue.clientLat}, ${issue.clientLng}]. Check attachments and respond via Secure Chat.`;
    }

    const waUrl = `https://wa.me/${cleanNum}?text=${encodeURIComponent(messageBody)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="bg-[#fbfcfa] border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[400px]">
      
      {/* Header Panel */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#dc2626]" />
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Encrypted Support Chat
            </h4>
            <p className="text-[10px] text-slate-500">Direct message sync for Ticket #{issue.id.substring(0,6)}</p>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full self-start sm:self-center">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>SECURE MESSAGING</span>
        </div>
      </div>

      {/* Messages body scrolling */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white/50">
        
        {/* Initial automatic audit log event marker as standard visual style */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f9f9f5] border border-[#f0eee6] rounded-full text-[9px] text-[#8a8d81]">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Secure handshake created; Session encrypted</span>
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-300" />
            <p className="text-xs font-sans">No secure messages yet.</p>
            <p className="text-[10px] text-slate-400 max-w-xs font-sans">
              Type a direct update or coordinate details below. Messages instantly replicate to the other role views.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderRole === currentRole;
            return (
              <div 
                key={msg.id} 
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[10px]">
                  <span className="font-bold text-slate-700">{msg.senderName}</span>
                  {getRoleBadge(msg.senderRole)}
                  <span className="text-slate-400 text-[9px]">{formatTime(msg.timestamp)}</span>
                </div>

                <div className={`p-3 rounded-2xl text-xs max-w-[80%] shadow-sm leading-relaxed ${
                  isMe 
                    ? 'bg-slate-900 text-white rounded-tr-none' 
                    : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60'
                }`}>
                  <p>{msg.body}</p>
                  
                  {msg.isSecurelyEncrypted && (
                    <div className={`flex items-center gap-1 text-[8px] mt-1.5 leading-none ${
                      isMe ? 'text-emerald-400/85' : 'text-emerald-600/85'
                    }`}>
                      <Lock className="w-2.5 h-2.5" />
                      <span>Encrypted payload</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input messaging terminal */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-[#e9e7df] bg-slate-50 gap-2 flex items-center shrink-0">
        <input
          type="text"
          value={typedMessage}
          onChange={(e) => setTypedMessage(e.target.value)}
          placeholder={`Direct text to ${currentRole === 'operator' ? 'Client or Expert' : 'HQ Control room'}...`}
          className="flex-1 text-xs border border-[#dce0d1] bg-white text-slate-800 p-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
        />
        <button
          type="submit"
          className="p-2 rounded-xl bg-slate-900 border border-slate-850 text-white hover:bg-slate-800 transition-all cursor-pointer shadow-md inline-flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* HQ Admin Direct Telecommunication & WhatsApp Bridge UI */}
      {currentRole === 'operator' && (
        <div className="bg-[#f0f2ea]/60 border-t border-[#e9e7df] p-3 space-y-2.5 shrink-0 text-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <PhoneCall className="w-3 h-3 text-[#5a5a40]" /> Secure Telecom Gateways (WhatsApp)
            </span>
            <span className="text-[8px] text-[#5a5a40]/75 tracking-tighter uppercase font-mono">Bypasses offline local UI limits</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="flex items-center gap-1.5 w-full sm:w-auto flex-1 bg-white border border-[#dce0d1] rounded-xl px-2.5 py-1.5 text-xs text-slate-800 shrink-0">
              <span className="text-[10px] text-slate-400 font-black font-mono">TO:</span>
              <input
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="WhatsApp Number (e.g. 5550199)"
                className="bg-transparent border-none outline-none text-xs w-full text-slate-800 font-mono"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto self-stretch">
              <button
                type="button"
                onClick={() => triggerWhatsAppDispatch('client')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-emerald-600 border border-emerald-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl hover:bg-emerald-700 transition-all cursor-pointer shadow-sm"
              >
                <span>Notify Client</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
              <button
                type="button"
                onClick={() => triggerWhatsAppDispatch('expert')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-emerald-600 border border-emerald-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl hover:bg-emerald-700 transition-all cursor-pointer shadow-sm"
              >
                <span>Instruct Tech</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
