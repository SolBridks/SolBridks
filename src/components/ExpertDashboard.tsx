import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  MapPin, 
  Radio, 
  ChevronRight, 
  DollarSign, 
  Leaf, 
  Compass, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Sliders, 
  Plus,
  Play,
  PlayCircle,
  Wrench,
  Cpu,
  LogOut,
  Key,
  Lock
} from 'lucide-react';
import { ITIssue, ExpertProfile, PricingMethod, TicketDocument, ChatMessage } from '../types';
import { generateSustainabilityEcoStats } from '../utils/storage';
import TicketLifecycleTracker from './TicketLifecycleTracker';
import TicketDocumentManager from './TicketDocumentManager';
import TicketChatConsole from './TicketChatConsole';

// Tactile Slide-to-Accept Track controller representing zero emission technician acceptance
const SlideToAccept = ({ onAccept }: { onAccept: () => void }) => {
  const [sliderVal, setSliderVal] = useState(0); 
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const startDrag = () => {
    setIsDragging(true);
  };

  const handleMove = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.min(100, Math.max(0, (x / rect.width) * 100));
    setSliderVal(pct);
    if (pct >= 90) {
      onAccept();
      setSliderVal(100);
      setIsDragging(false);
    }
  };

  useEffect(() => {
    if (isDragging) {
      const onGlobalMove = (e: MouseEvent) => handleMove(e.clientX);
      const onGlobalTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
      const onGlobalUp = () => {
        setIsDragging(false);
        setSliderVal((prev) => (prev < 90 ? 0 : 100));
      };

      window.addEventListener('mousemove', onGlobalMove);
      window.addEventListener('mouseup', onGlobalUp);
      window.addEventListener('touchmove', onGlobalTouchMove);
      window.addEventListener('touchend', onGlobalUp);

      return () => {
        window.removeEventListener('mousemove', onGlobalMove);
        window.removeEventListener('mouseup', onGlobalUp);
        window.removeEventListener('touchmove', onGlobalTouchMove);
        window.removeEventListener('touchend', onGlobalUp);
      };
    }
  }, [isDragging]);

  return (
    <div 
      ref={trackRef}
      className="relative w-48 sm:w-56 h-10 bg-[#15190e] border border-[#d4a37330] hover:border-[#d4a37360] rounded-2xl p-1 flex items-center select-none overflow-hidden shadow-inner transition-all"
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[9.5px] font-extrabold uppercase tracking-widest text-[#d4a373]/80 animate-pulse">
        {sliderVal > 50 ? "" : "Slide to Accept"}
      </div>

      <div 
        style={{ width: `${sliderVal}%` }}
        className="absolute left-0 top-0 bottom-0 bg-[#d4a373]/20 pointer-events-none rounded-l-2xl"
      />

      <div 
        onMouseDown={startDrag}
        onTouchStart={startDrag}
        style={{ 
          left: `calc(${sliderVal}% - ${(sliderVal / 100) * 32}px)`
        }}
        className="absolute w-8 h-8 rounded-xl bg-gradient-to-r from-[#d4a373] to-[#c39262] hover:scale-105 text-slate-950 flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg z-10 transition-all duration-75"
      >
        <ChevronRight className="w-5 h-5 text-slate-950" />
      </div>
    </div>
  );
};

interface ExpertDashboardProps {
  issues: ITIssue[];
  experts: ExpertProfile[];
  onSelectExpert: (id: string | null) => void;
  selectedExpertId: string | null;
  onRegisterExpert: (newExpert: Omit<ExpertProfile, 'id' | 'totalResolved' | 'totalEarnings' | 'co2SavedTotal' | 'rating' | 'isAvailable' | 'currentLat' | 'currentLng'>) => void;
  onAcceptIssue: (issueId: string, bidPrice?: number) => void;
  onSimulateStep: (issueId: string) => void;
  onCompleteDiagnostic: (issueId: string) => void;
  onCompleteIssue: (issueId: string) => void;
  onUploadDocument: (issueId: string, doc: TicketDocument) => void;
  onDeleteDocument: (issueId: string, docId: string) => void;
  onSendMessage: (issueId: string, msg: ChatMessage) => void;
  onSubmitExpertBid?: (issueId: string, bidPrice: number) => void;
  onExpertRespondBid?: (issueId: string, action: 'accept' | 'counter', counterPrice?: number) => void;
  onUpdateIssues?: (issues: ITIssue[]) => void;
}

export default function ExpertDashboard({
  issues,
  experts,
  onSelectExpert,
  selectedExpertId,
  onRegisterExpert,
  onAcceptIssue,
  onSimulateStep,
  onCompleteDiagnostic,
  onCompleteIssue,
  onUploadDocument,
  onDeleteDocument,
  onSendMessage,
  onSubmitExpertBid,
  onExpertRespondBid,
  onUpdateIssues
}: ExpertDashboardProps) {
  
  // Private Expert Login States
  const [expertLoginEmail, setExpertLoginEmail] = useState('');
  const [expertLoginError, setExpertLoginError] = useState('');

  const handleExpertLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = experts.find(ex => ex.email.toLowerCase().trim() === expertLoginEmail.toLowerCase().trim());
    if (found) {
      setExpertLoginError('');
      setExpertLoginEmail('');
      onSelectExpert(found.id);
    } else {
      setExpertLoginError('Verification failed. No engineering specialist matches this email address in our directory.');
    }
  };

  // Registration Form States
  const [showRegForm, setShowRegForm] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regSkills, setRegSkills] = useState('');
  const [regVehicle, setRegVehicle] = useState<'electric-bike' | 'public-transit' | 'ev' | 'hybrid'>('electric-bike');
  const [regBankName, setRegBankName] = useState('');
  const [regBankAccount, setRegBankAccount] = useState('');
  const [regBankRouting, setRegBankRouting] = useState('');

  // Tab State: work = active dispatch radar, history = previous solutions, finance = bank edits
  const [expertTab, setExpertTab] = useState<'work' | 'history' | 'finance'>('work');

  // Expert Job Editing states
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editJobDesc, setEditJobDesc] = useState('');
  const [editJobPrice, setEditJobPrice] = useState(0);
  const [editJobCat, setEditJobCat] = useState<'hardware' | 'software' | 'network' | 'security' | 'cloud'>('hardware');
  const [editJobUrgency, setEditJobUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');

  const startEditingJob = (job: ITIssue) => {
    setEditingJobId(job.id);
    setEditJobTitle(job.title);
    setEditJobDesc(job.description);
    setEditJobPrice(job.price);
    setEditJobCat(job.category as any);
    setEditJobUrgency(job.urgency);
  };

  const handleSaveJobEdit = (jobId: string) => {
    if (!onUpdateIssues) return;
    const nextIssues = issues.map(iss => {
      if (iss.id === jobId) {
        const eco = generateSustainabilityEcoStats(editJobCat, editJobDesc, editJobUrgency);
        const operatorFee = Number((editJobPrice * 0.1).toFixed(1));
        const expertEarnings = editJobPrice - operatorFee;
        return {
          ...iss,
          title: editJobTitle,
          description: editJobDesc,
          price: editJobPrice,
          operatorFee,
          expertEarnings,
          category: editJobCat,
          urgency: editJobUrgency,
          wasteAvoidedKg: eco.wasteAvoidedKg,
          co2SavedKg: eco.co2SavedKg,
          lifespanExtendedMonths: eco.lifespanExtendedMonths
        };
      }
      return iss;
    });
    onUpdateIssues(nextIssues);
    setEditingJobId(null);
  };

  // Custom Bidding States
  const [customBids, setCustomBids] = useState<Record<string, string>>({});

  const activeExpert = experts.find(e => e.id === selectedExpertId);

  // Helper to match issue category with expert skills/specialties
  const isMatchesExpertise = (issueCategory: string, skills: string[]) => {
    if (!skills || skills.length === 0) return true;
    const lowerCat = issueCategory.toLowerCase();
    return skills.some(skill => {
      const s = skill.toLowerCase();
      // Match general keywords or common subsets
      return s.includes(lowerCat) || lowerCat.includes(s) || s === 'all' || s === '*';
    });
  };

  // Filter issues that are unassigned and match bidding/fixed rules & expert skillsets
  const availableIncomingRequests = issues.filter(issue => {
    const isUnassigned = issue.status === 'submitted' || issue.status === 'priced';
    if (!isUnassigned) return false;
    if (!activeExpert) return false;
    return isMatchesExpertise(issue.category, activeExpert.skills);
  });

  // Filter issues assigned to the active expert
  const assignedJobs = issues.filter(issue => issue.expertId === selectedExpertId);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail) return;

    onRegisterExpert({
      name: regName,
      email: regEmail,
      skills: regSkills.split(',').map(s => s.trim()).filter(Boolean),
      vehicleType: regVehicle,
      bankName: regBankName || 'Commonwealth Green Reserve',
      bankAccount: regBankAccount || '******8218',
      bankRouting: regBankRouting || '021000021',
    });

    setRegName('');
    setRegEmail('');
    setRegSkills('');
    setRegBankName('');
    setRegBankAccount('');
    setRegBankRouting('');
    setShowRegForm(false);
  };

  const handleUpdateBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExpert) return;
    activeExpert.bankName = regBankName || activeExpert.bankName;
    activeExpert.bankAccount = regBankAccount || activeExpert.bankAccount;
    activeExpert.bankRouting = regBankRouting || activeExpert.bankRouting;
    // Just force a state update or inform they are saved
    alert("Bank details updated successfully!");
  };

  const handleBidPriceChange = (issueId: string, value: string) => {
    setCustomBids({ ...customBids, [issueId]: value });
  };

  return (
    <div id="expert-dashboard-panel" className="space-y-6">
      
      {/* Upper expert status check bar (Confidential - hides other experts completely) */}
      <div className="bg-white border border-[#e9e7df] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f0f2ea] border border-[#dce0d1] flex items-center justify-center">
            <Users className="w-5 h-5 text-[#5a5a40]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#2c3124] flex items-center gap-2">
              {selectedExpertId && activeExpert ? (
                <>Active Expert Node: <span className="text-[#5a5a40] font-black">{activeExpert.name}</span></>
              ) : (
                <>Specialist Secure Node Gateway</>
              )}
            </h2>
            <p className="text-xs text-[#8a8d81] font-sans">
              {selectedExpertId && activeExpert ? (
                <span className="font-mono">Specialist ID: {activeExpert.id} &bull; {activeExpert.email}</span>
              ) : (
                <>On-demand field &amp; infra technical solution dispatch perimeter. Verified specialist authentication required.</>
              )}
            </p>
          </div>
        </div>

        {selectedExpertId && activeExpert ? (
          <div>
            <button
              onClick={() => onSelectExpert(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#f4f3ed] border border-rose-100 text-[#3d4234] hover:text-rose-700 hover:bg-rose-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              Disconnect &amp; Lock Node
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-[#f0f2ea] border border-[#dce0d1] text-[#5a5a40] px-2.5 py-1.5 rounded-lg font-mono font-bold flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> GATEWAY LOCK ACTIVE
            </span>
          </div>
        )}
      </div>

      {showRegForm && (
        <form onSubmit={handleRegister} className="bg-white border border-[#e9e7df] rounded-2xl p-5 space-y-4 shadow-sm text-[#3d4234]">
          <div className="font-bold text-sm text-[#2c3124]">Register as Technical Specialist / Solutions Provider</div>
          <p className="text-xs text-[#8a8d81]">Create your technician profile to receive corporate and enterprise on-site dispatch contracts.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#3d4234] block mb-1">Full Legal Name</label>
              <input
                id="expert-reg-name"
                type="text"
                required
                placeholder="Elena Rostova"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full bg-white border border-[#e9e7df] text-[#3d4234] rounded-xl px-3 py-2 text-sm focus:outline-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#3d4234] block mb-1">Email Address</label>
              <input
                id="expert-reg-email"
                type="email"
                required
                placeholder="elena.r@solbridks.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full bg-white border border-[#e9e7df] text-[#3d4234] rounded-xl px-3 py-2 text-sm focus:outline-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-[#3d4234] block mb-1">Skills Specialties (comma separated)</label>
              <input
                id="expert-reg-skills"
                type="text"
                placeholder="Hardware Diagnostics, Network Cable Splicing, Server Optimization"
                value={regSkills}
                onChange={(e) => setRegSkills(e.target.value)}
                className="w-full bg-white border border-[#e9e7df] text-[#3d4234] rounded-xl px-3 py-2 text-sm focus:outline-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-[#3d4234] block mb-1">Service Dispatch Vehicle &amp; Toolkit Capability</label>
              <select
                id="expert-reg-vehicle"
                value={regVehicle}
                onChange={(e: any) => setRegVehicle(e.target.value)}
                className="w-full bg-white border border-[#e9e7df] text-[#3d4234] rounded-xl px-3 py-2 text-sm focus:outline-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40]"
              >
                <option value="electric-bike">Rapid Mobile Toolkit (Lite diagnostics, diagnostic backpack)</option>
                <option value="public-transit">Standard Transit Pack (Multi-purpose testing equipment)</option>
                <option value="ev">Heavy Deployment Rig (Desktop servers, heavy server rails)</option>
                <option value="hybrid">Advanced Commercial Pack (Full network repair &amp; patching tools)</option>
              </select>
            </div>
            
            {/* Bank Details section */}
            <div className="md:col-span-2 border-t border-[#e9e7df] pt-3">
              <span className="text-[10px] font-bold text-[#8a8d81] uppercase tracking-wider block mb-2">Direct Deposit Payout Bank Node Coordinates</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#3d4234] block mb-1">Bank Name</label>
                  <input
                    id="expert-reg-bank-name"
                    type="text"
                    required
                    placeholder="Global Commerce Treasury"
                    value={regBankName}
                    onChange={(e) => setRegBankName(e.target.value)}
                    className="w-full bg-white border border-[#e9e7df] text-[#3d4234] rounded-xl px-3 py-2 text-xs focus:outline-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#3d4234] block mb-1">Account Number</label>
                  <input
                    id="expert-reg-bank-acc"
                    type="text"
                    required
                    placeholder="******8218"
                    value={regBankAccount}
                    onChange={(e) => setRegBankAccount(e.target.value)}
                    className="w-full bg-white border border-[#e9e7df] text-[#3d4234] rounded-xl px-3 py-2 text-xs focus:outline-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#3d4234] block mb-1">Routing Number</label>
                  <input
                    id="expert-reg-bank-rt"
                    type="text"
                    required
                    placeholder="021000021"
                    value={regBankRouting}
                    onChange={(e) => setRegBankRouting(e.target.value)}
                    className="w-full bg-white border border-[#e9e7df] text-[#3d4234] rounded-xl px-3 py-2 text-xs focus:outline-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              id="expert-reg-btn-cancel"
              type="button"
              onClick={() => setShowRegForm(false)}
              className="bg-white border border-[#e9e7df] hover:bg-gray-100 text-[#3d4234] font-semibold px-4 py-2 rounded-xl text-xs"
            >
              Discard
            </button>
            <button
              id="expert-reg-btn-submit"
              type="submit"
              className="bg-[#5a5a40] hover:bg-[#4a4a34] text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm"
            >
              Submit Registration
            </button>
          </div>
        </form>
      )}

      {selectedExpertId ? (() => {
        const activeExpert = experts.find(e => e.id === selectedExpertId);
        if (!activeExpert) return null;

        if (!activeExpert.isVerifiedByQA) {
          return (
            <div id="expert-pending-verification" className="bg-white border border-[#e9e7df] rounded-3xl p-8 max-w-xl mx-auto shadow-sm space-y-6 text-center text-[#3d4234] animate-fade-in my-6">
              <div className="w-14 h-14 rounded-full bg-yellow-50 border border-yellow-300 flex items-center justify-center mx-auto text-yellow-600 animate-pulse">
                <Sliders className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#2c3124]">Specialist Node: Verification Pending</h3>
                <p className="text-xs text-[#8a8d81] leading-relaxed">
                  Greetings, <span className="font-extrabold text-[#3d4234]">{activeExpert.name}</span>. Your technical credentials and bank routing configurations have been safely lodged in our master ledger.
                </p>
                <p className="text-xs text-slate-500 font-medium font-sans">
                  To guarantee absolute corporate excellence and SLA safety standards, the <strong>Quality Assurance Control Room (Operator Team)</strong> will audit and confirm your profile shortly.
                </p>
              </div>

              <div className="bg-[#f9f9f5] border border-[#e9e7df] rounded-xl p-4 text-left text-xs space-y-2">
                <div className="font-bold border-b border-[#e9e7df] pb-1 uppercase tracking-wider text-[10px] text-[#8a8d81]">My Registered profile</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-[#2c3124]">
                  <div><span className="text-[#8a8d81] font-semibold">Specialties:</span> {activeExpert.skills.join(', ') || 'General IT'}</div>
                  <div><span className="text-[#8a8d81] font-semibold">Support Kit Type:</span> {activeExpert.vehicleType}</div>
                  <div><span className="text-[#8a8d81] font-semibold">Receiving Inst.:</span> {activeExpert.bankName || 'Standard Commerce Reserve'}</div>
                  <div><span className="text-[#8a8d81] font-semibold">Payout Account:</span> {activeExpert.bankAccount || '******8218'}</div>
                </div>
              </div>

              <div className="text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 justify-center leading-normal">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-ping shrink-0" />
                <span>💡 DEMO ROUTE: Navigate to "Operator (HQ Control Room)" in the header tools to instantly verify this specialist!</span>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="flex border-b border-[#e9e7df] gap-6 text-xs uppercase tracking-wider font-extrabold font-sans">
              <button 
                id="expert-tab-work"
                onClick={() => setExpertTab('work')}
                className={`pb-3 px-1 transition-all border-b-2 font-black ${expertTab === 'work' ? 'border-[#5a5a40]' : 'border-transparent text-[#8a8d81] hover:text-[#3d4234]'}`}
              >
                📌 Active Ingress Queue
              </button>
              <button 
                id="expert-tab-history"
                onClick={() => setExpertTab('history')}
                className={`pb-3 px-1 transition-all border-b-2 font-black ${expertTab === 'history' ? 'border-[#5a5a40]' : 'border-transparent text-[#8a8d81] hover:text-[#3d4234]'}`}
              >
                📦 Archived Solutions ({issues.filter(i => i.expertId === selectedExpertId && i.status === 'completed').length})
              </button>
              <button 
                id="expert-tab-finance"
                onClick={() => setExpertTab('finance')}
                className={`pb-3 px-1 transition-all border-b-2 font-black ${expertTab === 'finance' ? 'border-[#5a5a40]' : 'border-transparent text-[#8a8d81] hover:text-[#3d4234]'}`}
              >
                💳 bank payout details &amp; logs
              </button>
            </div>

            {expertTab === 'work' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">

          {/* LEFT COLUMN: ON-DEMAND DISPATCH REQUEST CARDS (7 columns) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-[#e9e7df] rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3d4234] flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#5a5a40]" /> SLA Ticket Intake Queue
                </span>
                <span className="text-[10px] text-[#8a8d81] font-bold uppercase">COMMERCIAL CONTRACT INTAKE</span>
              </div>

              <div className="space-y-4 max-h-[420px] overflow-y-auto">
                {availableIncomingRequests.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-[#e9e7df] rounded-xl bg-[#fdfcf8]">
                    <Clock className="w-8 h-8 text-[#8a8d81] mx-auto mb-2 animate-spin" />
                    <p className="text-sm font-semibold text-[#3d4234]">Pinging dispatch satellite...</p>
                    <p className="text-xs text-[#8a8d81] mt-1">No active client requests in your immediate smart-city grid yet.</p>
                  </div>
                ) : (
                  availableIncomingRequests.map((issue) => {
                    const priceRequested = customBids[issue.id] || '';
                    const needsBid = issue.pricingMethod === 'expert_bid';

                    return (
                      <div
                        key={issue.id}
                        id={`request-card-${issue.id}`}
                        className="bg-white border border-[#f0eee6] p-4 rounded-xl flex flex-col justify-between hover:border-[#e9e7df] transition"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="text-[10px] font-bold uppercase text-[#5a5a40] font-mono">
                                {issue.category} 
                              </span>
                              <h4 className="font-bold text-[#2c3124] text-sm mt-1">{issue.title}</h4>
                            </div>
                            <span className="text-[10px] bg-[#f0f2ea] border border-[#dce0d1] px-2 py-0.5 rounded text-[#5a5a40] font-semibold">
                              {issue.urgency}
                            </span>
                          </div>
                          
                          <p className="text-xs text-[#8a8d81] mt-2 italic font-serif">“{issue.description}”</p>
                          
                          <div className="flex gap-4 mt-3 py-2 px-3 bg-[#f9f9f5] border border-[#e9e7df] rounded-lg text-[11px] text-[#3d4234]">
                            <div>
                              Support Level: <span className="font-bold text-[#2c3124]">On-Site Dispatch</span>
                            </div>
                            <div className="w-[1px] bg-[#e9e7df]" />
                            <div>
                              SLA Window: <span className="font-bold text-[#5a5a40]">Same-Day Priority</span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive price settings matching core requirements */}
                        <div className="mt-4 pt-3 border-t border-[#e9e7df] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <div className="text-[9px] text-[#8a8d81] uppercase tracking-widest font-bold">Pricing Decision:</div>
                            <div className="text-xs text-[#3d4234] font-semibold uppercase mt-0.5">
                              {issue.pricingMethod === 'operator_fixed' ? (
                                <span className="text-[#5a5a40] font-bold">Operating Fixed Rate: ${issue.price}</span>
                              ) : (
                                <span className="text-[#d4a373] font-bold">Expert Bidding Protocol</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                            {issue.pricingMethod === 'operator_fixed' ? (
                              <SlideToAccept onAccept={() => onAcceptIssue(issue.id)} />
                            ) : (
                              <div className="w-full sm:w-auto space-y-2 text-right">
                                {(!issue.bidStatus || issue.bidStatus === 'none') ? (
                                  <div className="flex items-center gap-2 justify-end">
                                    <div className="flex items-center bg-white border border-[#e9e7df] rounded-xl pl-2.5 pr-1 py-1 max-w-28 text-xs shrink-0 shadow-xs">
                                      <DollarSign className="w-3.5 h-3.5 text-[#5a5a40] shrink-0" />
                                      <input
                                        id={`input-bid-${issue.id}`}
                                        type="number"
                                        placeholder="Bid Price"
                                        value={priceRequested}
                                        onChange={(e) => handleBidPriceChange(issue.id, e.target.value)}
                                        className="w-full bg-transparent text-[#3d4234] focus:outline-none font-bold pl-0.5 text-xs text-center"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const bidVal = parseFloat(priceRequested);
                                        if (isNaN(bidVal) || bidVal <= 0) return;
                                        onSubmitExpertBid?.(issue.id, bidVal);
                                      }}
                                      className="bg-[#5a5a40] hover:bg-[#4a4a34] text-white font-extrabold px-3.5 py-2 rounded-xl text-xs transition cursor-pointer active:scale-95 shadow-sm"
                                    >
                                      Submit Bid Quote
                                    </button>
                                  </div>
                                ) : issue.bidStatus === 'expert_submitted' ? (
                                  <div className="text-xs text-slate-500 font-bold bg-[#fdfcf8] border border-[#e9e7df] rounded-xl px-3 py-2 text-center shadow-xs">
                                    ⌛ Submitted Bid: <span className="text-[#3d4234] font-black">${issue.bidPrice}</span>. Pending client choice.
                                  </div>
                                ) : issue.bidStatus === 'expert_countered' ? (
                                  <div className="text-xs text-slate-500 font-bold bg-[#fdfcf8] border border-[#e9e7df] rounded-xl px-3 py-2 text-center shadow-xs">
                                    ⌛ You countered: <span className="text-[#3d4234] font-black">${issue.bidPrice}</span>. Waiting...
                                  </div>
                                ) : issue.bidStatus === 'client_countered' ? (
                                  <div className="space-y-2 text-right">
                                    <div className="text-xs font-bold text-red-650 bg-red-50 border border-red-150 p-2.5 rounded-xl text-center shadow-xs text-red-700">
                                      🔔 Client Countered: <strong className="font-extrabold">${issue.bidPrice}</strong>
                                    </div>
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => onExpertRespondBid?.(issue.id, 'accept')}
                                        className="bg-green-700 hover:bg-green-800 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs transition active:scale-95 cursor-pointer shadow-sm"
                                      >
                                        Accept Offer
                                      </button>
                                      
                                      <div className="flex items-center bg-white border border-[#e9e7df] rounded-xl pl-2 pr-1 py-1 max-w-24 text-xs shrink-0 shadow-xs">
                                        <DollarSign className="w-3.5 h-3.5 text-[#5a5a40] shrink-0" />
                                        <input
                                          id={`input-bid-counter-${issue.id}`}
                                          type="number"
                                          placeholder="Counter Price"
                                          className="w-full bg-transparent text-[#3d4234] focus:outline-none font-bold text-[11px] text-center"
                                          onKeyDown={(e: any) => {
                                            if (e.key === 'Enter') {
                                              const val = parseFloat(e.target.value);
                                              if (!isNaN(val) && val > 0) {
                                                onExpertRespondBid?.(issue.id, 'counter', val);
                                                e.target.value = '';
                                              }
                                            }
                                          }}
                                        />
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          const input = document.getElementById(`input-bid-counter-${issue.id}`) as HTMLInputElement;
                                          const val = parseFloat(input?.value || '');
                                          if (!isNaN(val) && val > 0) {
                                            onExpertRespondBid?.(issue.id, 'counter', val);
                                            if (input) input.value = '';
                                          }
                                        }}
                                        className="bg-[#5a5a40] hover:bg-[#4a4a34] text-white font-extrabold px-2.5 py-1.5 rounded-xl text-xs transition cursor-pointer shadow-sm"
                                      >
                                        Counter
                                      </button>
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ACTIVE JOBS FIELD SERVICE & DISPATCH SIMULATOR (5 columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#e9e7df] rounded-2xl p-5 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold uppercase text-[#3d4234] flex items-center gap-1.5 select-none">
                <Compass className="w-4 h-4 text-[#5a5a40] animate-spin" /> Field Engineering Navigation
              </h3>

              <div className="space-y-4">
                {assignedJobs.length === 0 ? (
                  <div className="text-center py-10 text-[#8a8d81] bg-[#fdfcf8] border border-dashed border-[#e9e7df] rounded-xl">
                    <CheckCircle2 className="w-8 h-8 text-[#e9e7df] mx-auto mb-2" />
                    <div className="text-xs font-semibold text-[#3d4234]">No active dispatches</div>
                    <p className="text-[10px] text-[#8a8d81] mt-1">Accept a client ticket from your Live Request Radar on the left to initiate deployment.</p>
                  </div>
                ) : (
                  assignedJobs.map((job) => {
                    const isDispatched = job.status === 'dispatched';
                    const isArrived = job.status === 'arrived';
                    const isResolving = job.status === 'resolving';
                    const isCompleted = job.status === 'completed';
                    const isPendingPayment = job.status === 'payment_pending';

                    return (
                      <div
                        key={job.id}
                        id={`active-task-${job.id}`}
                        className="bg-white border border-[#f0eee6] p-4 rounded-xl space-y-4"
                      >
                        <div className="flex justify-between border-b border-[#e9e7df] pb-2">
                          <h4 className="font-bold text-[#2c3124] text-xs truncate line-clamp-1">{job.title}</h4>
                          <span className="text-[9px] font-bold text-[#5a5a40] uppercase tracking-widest leading-none font-mono">
                            {job.status.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Complete ticket SLA lifecycle chronology */}
                        <div className="py-1">
                          <TicketLifecycleTracker issue={job} />
                        </div>

                        {/* Inline Ticket Editor and Specs View for Expert */}
                        {editingJobId === job.id ? (
                          <div className="space-y-3 bg-stone-50 p-4 border border-[#e9e7df] rounded-xl text-xs text-stone-800">
                            <div className="font-extrabold text-stone-900 text-xs mb-1">Modify Accepted Ticket Specifications</div>
                            
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-stone-600 block">Ticket Title</label>
                              <input
                                type="text"
                                value={editJobTitle}
                                onChange={(e) => setEditJobTitle(e.target.value)}
                                className="w-full bg-white border border-[#e9e7df] rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-950 focus:outline-[#5a5a40]"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-stone-600 block">Description Scope</label>
                              <textarea
                                value={editJobDesc}
                                rows={2}
                                onChange={(e) => setEditJobDesc(e.target.value)}
                                className="w-full bg-white border border-[#e9e7df] rounded-lg px-2.5 py-1.5 text-xs text-stone-950 font-sans font-semibold focus:outline-[#5a5a40]"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-bold text-stone-600 block">Category</label>
                                <select
                                  value={editJobCat}
                                  onChange={(e: any) => setEditJobCat(e.target.value)}
                                  className="w-full bg-white border border-[#e9e7df] rounded-lg px-2 py-1 text-xs font-bold text-stone-950 focus:outline-[#5a5a40]"
                                >
                                  <option value="hardware">Hardware Repair</option>
                                  <option value="software">Software Setup</option>
                                  <option value="network">Network Deployment</option>
                                  <option value="security">Security Patch</option>
                                  <option value="cloud">Cloud Migration</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-stone-600 block">Urgency SLA</label>
                                <select
                                  value={editJobUrgency}
                                  onChange={(e: any) => setEditJobUrgency(e.target.value)}
                                  className="w-full bg-white border border-[#e9e7df] rounded-lg px-2 py-1 text-xs font-bold text-stone-950 focus:outline-[#5a5a40]"
                                >
                                  <option value="low">Low SLA</option>
                                  <option value="medium">Medium SLA</option>
                                  <option value="high">High SLA</option>
                                  <option value="critical">Critical SLA</option>
                                </select>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-stone-600 block">Contract Price ($ USD)</label>
                              <input
                                type="number"
                                value={editJobPrice}
                                onChange={(e) => setEditJobPrice(Number(e.target.value))}
                                className="w-full bg-white border border-[#e9e7df] rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-950 focus:outline-[#5a5a40]"
                              />
                            </div>

                            <div className="flex gap-2 justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => setEditingJobId(null)}
                                className="bg-white border border-[#e9e7df] text-stone-700 px-3 py-1.5 rounded-lg text-xs font-bold font-sans"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveJobEdit(job.id)}
                                className="bg-[#5a5a40] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold font-sans hover:bg-[#4a4a34] transition-all"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-stone-50/50 p-3.5 border border-[#e9e7df]/60 rounded-xl space-y-2 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Technical Scope</span>
                              <button
                                onClick={() => startEditingJob(job)}
                                className="text-[#5a5a40] hover:text-[#4a4a34] font-extrabold text-[11px] underline flex items-center gap-1"
                              >
                                Edit Ticket Specs
                              </button>
                            </div>
                            <div className="text-stone-800 font-semibold leading-relaxed font-sans whitespace-pre-wrap">{job.description}</div>
                            <div className="grid grid-cols-3 gap-2 text-[10px] pt-1.5 border-t border-[#e9e7df]/40 text-[#8a8d81] font-mono">
                              <div><span className="font-bold text-[#5a5a40]">Category:</span> {job.category.toUpperCase()}</div>
                              <div><span className="font-bold text-[#5a5a40]">Urgency:</span> {job.urgency.toUpperCase()}</div>
                              <div><span className="font-bold text-[#5a5a40]">Payout Rate:</span> ${job.price}</div>
                            </div>
                          </div>
                        )}

                        {/* Dispatch Progress bar representation */}
                        {isDispatched && (
                          <div className="bg-[#f9f9f5] p-3 rounded-lg border border-[#e9e7df] space-y-2">
                            <div className="flex justify-between items-center text-[10px] text-[#3d4234] font-semibold">
                              <span>Field Deployment progress:</span>
                              <span className="text-[#d4a373] font-bold">{(job.activeStepIndex || 0) * 10}%</span>
                            </div>
                            <div className="w-full bg-white border border-[#e9e7df] rounded-full h-1.5 overflow-hidden">
                              <div
                                style={{ width: `${((job.activeStepIndex || 0) * 10)}%` }}
                                className="bg-[#5a5a40] h-full transition-all duration-300"
                              />
                            </div>
                            <button
                              id={`simulate-gps-step-${job.id}`}
                              onClick={() => onSimulateStep(job.id)}
                              className="w-full bg-[#5a5a40] hover:bg-[#4a4a34] text-white font-bold py-1 px-3 rounded-md text-[11px] transition-all flex items-center justify-center gap-1.5"
                            >
                              <Play className="w-3 h-3 text-white" /> Push Real-Time Dispatch Step
                            </button>
                          </div>
                        )}

                        {/* Arrived On-site Diagnostics state */}
                        {isArrived && (
                          <div className="bg-[#f0f2ea] p-3 rounded-lg border border-[#dce0d1] text-center space-y-2 text-[#3d4234]">
                            <p className="text-[11px] text-[#3d4234]">You have arrived to {job.clientName.split(' ')[0]}. Prepare solution protocols.</p>
                            <button
                              id={`complete-diagnostic-${job.id}`}
                              onClick={() => onCompleteDiagnostic(job.id)}
                              className="w-full bg-[#d4a373] hover:bg-[#c39262] text-white font-extrabold py-1.5 px-3 rounded-lg text-xs transition shadow-sm"
                            >
                              Start Solution Phase
                            </button>
                          </div>
                        )}

                        {/* Active Service Solving progress */}
                        {isResolving && (
                          <div className="bg-[#f9f9f5] p-3 rounded-lg border border-[#e9e7df] text-center space-y-2">
                            <p className="text-[11px] text-[#5a5a40] font-medium animate-pulse">Repairing hardware registers and subnets...</p>
                            <button
                              id={`complete-issue-${job.id}`}
                              onClick={() => onCompleteIssue(job.id)}
                              className="w-full bg-[#5a5a40] hover:bg-[#4a4a34] text-white font-extrabold py-1.5 px-3 rounded-lg text-xs transition shadow-sm"
                            >
                              Finalize & File Invoice
                            </button>
                          </div>
                        )}

                        {/* Pending payment invoice state */}
                        {isPendingPayment && (
                          <div className="bg-[#fdfcf8] border border-[#e9e7df] p-3 rounded-lg text-center space-y-1">
                            <span className="text-[9.5px] font-bold text-[#d4a373] uppercase shrink-0">Release Pending</span>
                            <p className="text-[10px] text-[#3d4234]">Successfully solved! Client has been in-app invoiced for ${job.price}.</p>
                          </div>
                        )}

                        {isCompleted && (
                          <div className="bg-[#f0f2ea] border border-[#dce0d1] p-3 rounded-lg text-center font-bold text-[#5a5a40] text-xs">
                            ✓ Payment received! Earnings saved.
                          </div>
                        )}

                        {/* Status dispatch trigger if accepted */}
                        {job.status === 'assigned' && (
                          <button
                            id={`start-ride-dispatch-${job.id}`}
                            onClick={() => onSimulateStep(job.id)}
                            className="w-full bg-[#d4a373] hover:bg-[#c39262] text-white font-bold py-1.5 px-3 rounded-lg text-xs transition flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Wrench className="w-4 h-4 text-white" /> Start Technical Field Dispatch
                          </button>
                        )}

                        {/* Real-time Document exchange and Encrypted Chatting */}
                        <div className="pt-4 border-t border-[#f0eee6] grid grid-cols-1 xl:grid-cols-2 gap-4">
                          <TicketDocumentManager 
                            issueId={job.id}
                            documents={job.documents || []}
                            currentRole="expert"
                            currentUserName={job.expertName || activeExpert?.name || 'Technical Specialist'}
                            onUploadDocument={onUploadDocument}
                            onDeleteDocument={onDeleteDocument}
                          />

                          <TicketChatConsole 
                            issue={job}
                            currentRole="expert"
                            currentUserName={job.expertName || activeExpert?.name || 'Technical Specialist'}
                            onSendMessage={onSendMessage}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Profile performance metrics */}
            {activeExpert && (
              <div className="bg-white border border-[#e9e7df] rounded-2xl p-5 space-y-3 shadow-sm text-[#3d4234]">
                <div className="text-xs font-bold uppercase text-[#8a8d81]">Your Specialist Ledger</div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#f9f9f5] p-2.5 rounded-xl border border-[#e9e7df]">
                    <span className="text-[#8a8d81] block text-[9.5px]">Total Earnings</span>
                    <span className="text-sm font-bold text-[#3d4234]">${activeExpert.totalEarnings}</span>
                  </div>
                  <div className="bg-[#f9f9f5] p-2.5 rounded-xl border border-[#e9e7df]">
                    <span className="text-[#8a8d81] block text-[9.5px]">Jobs Resolved</span>
                    <span className="text-sm font-bold text-[#5a5a40]">{activeExpert.totalResolved || 0} solutions</span>
                  </div>
                </div>

                <div className="text-[10.5px] text-[#3d4234] flex items-center gap-1.5 pt-1">
                  <ShieldCheck className="w-4 h-4 text-[#5a5a40] shrink-0" />
                  <span>Licensed SolBridks Technical Specialist</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

        {/* History tab content */}
        {expertTab === 'history' && (
          <div className="bg-white border border-[#e9e7df] rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in text-slate-800">
            <div className="flex justify-between items-center border-b border-[#e9e7df] pb-3">
              <div>
                <h3 className="font-extrabold text-[#2c3124] text-xs uppercase tracking-wider">Archived Solutions case logbook</h3>
                <p className="text-[11px] text-[#8a8d81]">Historical records of completed operations with verified corporate SLA audit confirmations.</p>
              </div>
              <span className="text-[10px] bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider font-sans">Verified Ledger</span>
            </div>
            {(() => {
              const historyIssues = issues.filter(i => i.expertId === selectedExpertId && i.status === 'completed');
              if (historyIssues.length === 0) {
                return (
                  <div className="text-center py-12 text-[#8a8d81] border border-dashed border-[#e9e7df] rounded-2xl">
                    <Clock className="w-8 h-8 text-[#e9e7df] mx-auto mb-2 animate-pulse" />
                    <p className="text-xs font-semibold text-slate-700">No completed dispatches registered yet on this node.</p>
                  </div>
                );
              }
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                  {historyIssues.map(item => (
                    <div key={item.id} className="border border-[#e9e7df] p-4 rounded-2xl bg-[#f9f9f5] space-y-3 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] uppercase font-mono font-bold text-[#5a5a40] bg-[#f0f2ea] border border-[#dce0d1] px-1.5 py-0.5 rounded">{item.category}</span>
                          <h4 className="font-extrabold text-xs text-[#2c3124] mt-1.5">{item.title}</h4>
                        </div>
                        <span className="text-xs text-green-700 font-extrabold bg-green-50 border border-green-100 px-2 py-1 rounded-md font-mono">+${item.expertEarnings}</span>
                      </div>
                      <p className="text-xs text-[#5a5a40]">{item.description}</p>
                      <div className="grid grid-cols-3 gap-2 text-[10px] border-t border-[#e9e7df] pt-2 font-mono">
                        <div>
                          <span className="text-[#8a8d81] block uppercase text-[8px] font-bold text-[#8a8d81] font-sans">SLA Status</span>
                          <span className="font-bold text-[#3d4234]">100% Met</span>
                        </div>
                        <div>
                          <span className="text-[#8a8d81] block uppercase text-[8px] font-bold text-[#8a8d81] font-sans">Resolution Code</span>
                          <span className="font-bold text-slate-700">RES-{item.id.slice(0,4).toUpperCase()}</span>
                        </div>
                        <div>
                          <span className="text-[#8a8d81] block uppercase text-[8px] font-bold text-[#8a8d81] font-sans">Service Warranty</span>
                          <span className="font-bold text-[#3d4234]">90-Day Extension</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Finance tab content */}
        {expertTab === 'finance' && (
          <div className="bg-white border border-[#e9e7df] rounded-2xl p-6 shadow-sm space-y-6 max-w-2xl mx-auto animate-fade-in text-slate-800">
            <div className="border-b border-[#e9e7df] pb-3">
              <h3 className="font-extrabold text-sm text-[#2c3124] uppercase tracking-wider">Bank routing &amp; Clearing details</h3>
              <p className="text-[11px] text-[#8a8d81]">Verify, update or customize secure direct payment clearing routing details. Platform deductions (15%) are retained during client settlement.</p>
            </div>

            <form onSubmit={handleUpdateBankDetails} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#3d4234] block mb-1 font-sans">Financial Institution</label>
                  <input
                    type="text"
                    required
                    defaultValue={activeExpert.bankName || "Commonwealth Green Reserve"}
                    onChange={(e) => { activeExpert.bankName = e.target.value; }}
                    className="w-full bg-[#fdfcf8] border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#5a5a40]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#3d4234] block mb-1 font-sans">Direct Account Number</label>
                  <input
                    type="text"
                    required
                    defaultValue={activeExpert.bankAccount || "******8218"}
                    onChange={(e) => { activeExpert.bankAccount = e.target.value; }}
                    className="w-full bg-[#fdfcf8] border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#5a5a40]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-[#3d4234] block mb-1 font-sans">Transit / Routing (9-Digit Number)</label>
                  <input
                    type="text"
                    required
                    defaultValue={activeExpert.bankRouting || "021000021"}
                    onChange={(e) => { activeExpert.bankRouting = e.target.value; }}
                    className="w-full bg-[#fdfcf8] border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#5a5a40]"
                  />
                </div>
              </div>

              <div className="bg-[#f0f2ea] border border-[#dce0d1] p-4 rounded-xl flex items-center justify-between text-xs font-sans">
                <div>
                  <span className="font-bold text-[#2c3124] block">Direct Payout Ledger configuration</span>
                  <span className="text-[11px] text-[#5a5a40]">SolBridks deductions: 15% system fee applied to all finalized client invoices.</span>
                </div>
                <span className="text-xs font-mono font-black text-[#8a8d81]">85/15 Payout Split</span>
              </div>

              <button
                type="submit"
                className="w-full bg-[#5a5a40] hover:bg-[#4a4a34] text-white font-extrabold py-2.5 rounded-xl text-xs transition cursor-pointer font-sans"
              >
                Save Payout Coordinates
              </button>
            </form>
          </div>
        )}
          </div>
        );
      })() : (
        <div id="expert-onboarding-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in my-4">
          
          {/* Private Active profile secure gateway side */}
          <div className="lg:col-span-5 bg-white border border-[#e9e7df] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#e9e7df]">
              <Users className="w-5 h-5 text-[#5a5a40]" />
              <div>
                <h3 className="font-extrabold text-sm text-[#2c3124]">Specialist Secure Sign In</h3>
                <p className="text-[10px] text-[#8a8d81]">Enter your verified specialist credentials to login.</p>
              </div>
            </div>

            <form onSubmit={handleExpertLogin} className="space-y-4 pt-1 animate-fade-in">
              <div className="bg-[#fcfcfa] border border-[#e9e7df] p-3 rounded-xl space-y-1">
                <span className="text-[9px] font-black text-[#5a5a40] uppercase tracking-widest block font-sans">Specialist perimeter</span>
                <p className="text-[10.5px] text-[#8a8d81] leading-relaxed font-sans">
                  Unauthorized profile sweeps are strictly forbidden. Access credentials are encrypted and mapped only via verified corporate routes.
                </p>
              </div>

              {expertLoginError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3.5 py-2.5 rounded-xl text-xs font-semibold font-sans animate-fade-in flex items-start gap-1.5 leading-normal">
                  <span>⚠️ {expertLoginError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#3d4234] block">Registered Specialist Email</label>
                <input
                  id="expert-login-email"
                  type="email"
                  required
                  placeholder="e.g., elena.r@solbridks.com"
                  value={expertLoginEmail}
                  onChange={(e) => { setExpertLoginEmail(e.target.value); setExpertLoginError(''); }}
                  className="w-full bg-[#fdfcf8] border border-[#e9e7df] text-xs px-3.5 py-2.5 rounded-xl focus:outline-[#5a5a40] text-[#3d4234] font-semibold"
                />
              </div>

              <button
                id="expert-btn-login-submit"
                type="submit"
                className="w-full bg-[#5a5a40] hover:bg-[#4a4a34] text-white font-extrabold py-2.5 rounded-xl text-xs transition cursor-pointer text-center block shadow-sm mt-3"
              >
                Authenticate Specialist Session
              </button>
            </form>
          </div>

          {/* Registration form side */}
          <div className="lg:col-span-7 bg-white border border-[#e9e7df] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="pb-2 border-b border-[#e9e7df]">
              <h3 className="font-extrabold text-sm text-[#2c3124]">Register as Technical Specialist / Solutions Provider</h3>
              <p className="text-[10px] text-[#8a8d81]">Are you a technical contractor? Set up your legal profile & routes to start receiving corporate SLA dispatch contracts.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10.5px] font-bold text-[#3d4234] block mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Elena Rostova"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-[#fdfcf8] border border-[#e9e7df] text-xs px-3 py-1.5 rounded-xl focus:outline-[#5a5a40] text-[#3d4234]"
                  />
                </div>
                <div>
                  <label className="text-[10.5px] font-bold text-[#3d4234] block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="elena.r@solbridks.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-[#fdfcf8] border border-[#e9e7df] text-xs px-3 py-1.5 rounded-xl focus:outline-[#5a5a40] text-[#3d4234]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10.5px] font-bold text-[#3d4234] block mb-1">Technical Specialties (comma separated)</label>
                  <input
                    type="text"
                    required
                    placeholder="Fiber Optic splicing, Router config, DB Optimization..."
                    value={regSkills}
                    onChange={(e) => setRegSkills(e.target.value)}
                    className="w-full bg-[#fdfcf8] border border-[#e9e7df] text-xs px-3 py-1.5 rounded-xl focus:outline-[#5a5a40] text-[#3d4234]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10.5px] font-bold text-[#3d4234] block mb-1">Service Dispatch Vehicle &amp; Toolkit Capability</label>
                  <select
                    value={regVehicle}
                    onChange={(e: any) => setRegVehicle(e.target.value)}
                    className="w-full bg-white border border-[#e9e7df] text-xs px-3 py-1.5 rounded-xl focus:outline-[#5a5a40] text-[#3d4234]"
                  >
                    <option value="electric-bike">Rapid Mobile Toolkit (Lite diagnostics, diagnostic backpack)</option>
                    <option value="public-transit">Standard Transit Pack (Multi-purpose testing equipment)</option>
                    <option value="ev">Heavy Deployment Rig (Desktop servers, heavy server rails)</option>
                    <option value="hybrid">Advanced Commercial Pack (Full network repair &amp; patching tools)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 border-t border-[#e9e7df] pt-3">
                  <span className="text-[10px] font-bold text-[#8a8d81] uppercase tracking-wider block mb-2">Direct bank account coordinates (for commercial payouts)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[9.5px] font-bold text-[#3d4234] block mb-0.5">Bank Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Global Commerce Treasury"
                        value={regBankName}
                        onChange={(e) => setRegBankName(e.target.value)}
                        className="w-full bg-[#fdfcf8] border border-[#e9e7df] text-[11px] px-2.5 py-1.5 rounded-lg focus:outline-[#5a5a40] text-[#3d4234]"
                      />
                    </div>
                    <div>
                      <label className="text-[9.5px] font-bold text-[#3d4234] block mb-0.5">Account Number</label>
                      <input
                        type="text"
                        required
                        placeholder="******8218"
                        value={regBankAccount}
                        onChange={(e) => setRegBankAccount(e.target.value)}
                        className="w-full bg-[#fdfcf8] border border-[#e9e7df] text-[11px] px-2.5 py-1.5 rounded-lg focus:outline-[#5a5a40] text-[#3d4234]"
                      />
                    </div>
                    <div>
                      <label className="text-[9.5px] font-bold text-[#3d4234] block mb-0.5">Routing Number</label>
                      <input
                        type="text"
                        required
                        placeholder="021000021"
                        value={regBankRouting}
                        onChange={(e) => setRegBankRouting(e.target.value)}
                        className="w-full bg-[#fdfcf8] border border-[#e9e7df] text-[11px] px-2.5 py-1.5 rounded-lg focus:outline-[#5a5a40] text-[#3d4234]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#5a5a40] hover:bg-[#4a4a34] text-white font-extrabold py-2.5 rounded-xl text-xs transition cursor-pointer text-center block shadow-sm"
              >
                Register &amp; Activate solutions provider profile
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
