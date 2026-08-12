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
  PlusCircle,
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

export const ALL_INDUSTRIES_DOMAINS = [
  'Real Estate & Property Management',
  'Construction, Electrical & Plumbing',
  'Landscaping & Groundskeeping',
  'Cleaning, Janitorial & Sanitation',
  'Logistics, Freight & Transportation',
  'Childcare, Daycare & Family Services',
  'Home Repair & Handyman Services',
  'Hospitality, Events & Catering',
  'IT & Cloud Infrastructure',
  'Software & Web Solutions',
  'Telecom, Networks & Fiber',
  'Cybersecurity & Compliance',
  'Data Systems & AI Solutions',
  'Hardware & Electronics Repair',
  'Enterprise ERP & Business Systems',
  'Healthcare & Medical Support',
  'Financial, Fintech & Accounting',
  'Industrial Automation & Robotics'
];

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
  
  // Private Expert Gate Tab State (login vs register)
  const [activeGateTab, setActiveGateTab] = useState<'login' | 'register'>('login');

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
  const [regPhone, setRegPhone] = useState('');
  const [regSkills, setRegSkills] = useState('');
  const [regDomains, setRegDomains] = useState<string[]>(['IT & Cloud Infrastructure', 'Software & Web Solutions']);
  const [regVehicle, setRegVehicle] = useState<'electric-bike' | 'public-transit' | 'ev' | 'hybrid'>('electric-bike');
  const [regBankName, setRegBankName] = useState('');
  const [regBankAccount, setRegBankAccount] = useState('');
  const [regBankRouting, setRegBankRouting] = useState('');
  const [regBankInstitution, setRegBankInstitution] = useState('');
  const [regBankTransit, setRegBankTransit] = useState('');

  const toggleRegDomain = (domain: string) => {
    setRegDomains(prev => 
      prev.includes(domain) 
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
    );
  };

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
      phone: regPhone,
      skills: regSkills.split(',').map(s => s.trim()).filter(Boolean),
      domains: regDomains.length > 0 ? regDomains : ['IT & Cloud Infrastructure'],
      vehicleType: regVehicle,
      bankName: regBankName || 'TD Canada Trust / Chase Bank',
      bankAccount: regBankAccount || '******8218',
      bankRouting: regBankRouting || '021000021',
      bankInstitution: regBankInstitution || '004',
      bankTransit: regBankTransit || '12345',
    });

    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setRegSkills('');
    setRegBankName('');
    setRegBankAccount('');
    setRegBankRouting('');
    setRegBankInstitution('');
    setRegBankTransit('');
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
      
      {/* Upper active expert status bar (shown only when signed in) */}
      {selectedExpertId && activeExpert && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white rounded-xl border border-slate-200 text-[#0f172a]">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider flex items-center gap-1.5">
                Specialist Account <span className="bg-emerald-100 border border-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded text-[8.5px] font-bold">Active Session</span>
              </div>
              <div className="text-xs font-bold text-slate-800 mt-1">
                Currently Logged In: <strong className="text-[#0f172a] font-extrabold">{activeExpert.name}</strong> &bull; <span className="text-[11px] text-slate-500 font-normal">{activeExpert.email}</span>
              </div>
            </div>
          </div>
          <div>
            <button
              onClick={() => onSelectExpert(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {showRegForm && (
        <form onSubmit={handleRegister} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm text-slate-800">
          <div className="font-bold text-sm text-slate-900">Register as Technical Specialist / Solutions Provider</div>
          <p className="text-xs text-slate-500">Create your technician profile to receive corporate and enterprise on-site dispatch contracts.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Full Legal Name</label>
              <input
                id="expert-reg-name"
                type="text"
                required
                placeholder="Elena Rostova"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-sm focus:outline-[#0f172a] focus:ring-1 focus:ring-[#0f172a]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Email Address</label>
              <input
                id="expert-reg-email"
                type="email"
                required
                placeholder="elena.r@solbridks.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-sm focus:outline-[#0f172a] focus:ring-1 focus:ring-[#0f172a]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-slate-700 block mb-1">Skills Specialties (comma separated)</label>
              <input
                id="expert-reg-skills"
                type="text"
                placeholder="Hardware Diagnostics, Network Cable Splicing, Server Optimization"
                value={regSkills}
                onChange={(e) => setRegSkills(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-sm focus:outline-[#0f172a] focus:ring-1 focus:ring-[#0f172a]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-slate-700 block mb-1">Service Dispatch Vehicle &amp; Toolkit Capability</label>
              <select
                id="expert-reg-vehicle"
                value={regVehicle}
                onChange={(e: any) => setRegVehicle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-sm focus:outline-[#0f172a] focus:ring-1 focus:ring-[#0f172a]"
              >
                <option value="electric-bike">Rapid Mobile Toolkit (Lite diagnostics, diagnostic backpack)</option>
                <option value="public-transit">Standard Transit Pack (Multi-purpose testing equipment)</option>
                <option value="ev">Heavy Deployment Rig (Desktop servers, heavy server rails)</option>
                <option value="hybrid">Advanced Commercial Pack (Full network repair &amp; patching tools)</option>
              </select>
            </div>
            
            {/* Bank Details section */}
            <div className="md:col-span-2 border-t border-slate-200 pt-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Direct Deposit Bank Account Details</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Bank Name</label>
                  <input
                    id="expert-reg-bank-name"
                    type="text"
                    required
                    placeholder="Global Commerce Treasury"
                    value={regBankName}
                    onChange={(e) => setRegBankName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-[#0f172a] focus:ring-1 focus:ring-[#0f172a]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Account Number</label>
                  <input
                    id="expert-reg-bank-acc"
                    type="text"
                    required
                    placeholder="******8218"
                    value={regBankAccount}
                    onChange={(e) => setRegBankAccount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-[#0f172a] focus:ring-1 focus:ring-[#0f172a]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Routing Number</label>
                  <input
                    id="expert-reg-bank-rt"
                    type="text"
                    required
                    placeholder="021000021"
                    value={regBankRouting}
                    onChange={(e) => setRegBankRouting(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-[#0f172a] focus:ring-1 focus:ring-[#0f172a]"
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
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs"
            >
              Discard
            </button>
            <button
              id="expert-reg-btn-submit"
              type="submit"
              className="bg-[#0f172a] hover:bg-slate-900 text-white font-black px-4 py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer"
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
            <div id="expert-pending-verification" className="bg-white border border-slate-200 rounded-3xl p-8 max-w-xl mx-auto shadow-sm space-y-6 text-center text-slate-800 animate-fade-in my-6">
              <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-300 flex items-center justify-center mx-auto text-amber-600 animate-pulse">
                <Sliders className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Specialist Profile: Verification Pending</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Greetings, <span className="font-extrabold text-slate-800">{activeExpert.name}</span>. Your technical credentials and bank details have been safely registered.
                </p>
                <p className="text-xs text-slate-500 font-medium font-sans">
                  To guarantee high quality and SLA compliance, our <strong>Operations Team</strong> will review and activate your profile shortly.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2">
                <div className="font-bold border-b border-slate-200 pb-1 uppercase tracking-wider text-[10px] text-slate-500">My Registered profile</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-800">
                  <div><span className="text-slate-500 font-semibold">Specialties:</span> {activeExpert.skills.join(', ') || 'General IT'}</div>
                  <div><span className="text-slate-500 font-semibold">Support Kit Type:</span> {activeExpert.vehicleType}</div>
                  <div><span className="text-slate-500 font-semibold">Receiving Inst.:</span> {activeExpert.bankName || 'Standard Commerce Reserve'}</div>
                  <div><span className="text-slate-500 font-semibold">Payout Account:</span> {activeExpert.bankAccount || '******8218'}</div>
                </div>
              </div>

              <div className="text-[11px] text-[#0f172a] bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 justify-center leading-normal">
                <span className="w-2 h-2 bg-[#dc2626] rounded-full animate-ping shrink-0" />
                <span>💡 DEMO ROUTE: Navigate to "Operator (HQ Control Room)" in the header tools to instantly verify this specialist!</span>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="flex border-b border-slate-200 gap-6 text-xs uppercase tracking-wider font-extrabold font-sans">
              <button 
                id="expert-tab-work"
                onClick={() => setExpertTab('work')}
                className={`pb-3 px-1 transition-all border-b-2 font-black cursor-pointer ${expertTab === 'work' ? 'border-[#0f172a] text-[#0f172a]' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
              >
                📌 Active Ingress Queue
              </button>
              <button 
                id="expert-tab-history"
                onClick={() => setExpertTab('history')}
                className={`pb-3 px-1 transition-all border-b-2 font-black cursor-pointer ${expertTab === 'history' ? 'border-[#0f172a] text-[#0f172a]' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
              >
                📦 Archived Solutions ({issues.filter(i => i.expertId === selectedExpertId && i.status === 'completed').length})
              </button>
              <button 
                id="expert-tab-finance"
                onClick={() => setExpertTab('finance')}
                className={`pb-3 px-1 transition-all border-b-2 font-black cursor-pointer ${expertTab === 'finance' ? 'border-[#0f172a] text-[#0f172a]' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
              >
                💳 bank payout details &amp; logs
              </button>
            </div>

            {expertTab === 'work' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">

          {/* LEFT COLUMN: ON-DEMAND DISPATCH REQUEST CARDS (7 columns) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-slate-700" /> SLA Ticket Intake Queue
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">COMMERCIAL CONTRACT INTAKE</span>
              </div>

              <div className="space-y-4 max-h-[420px] overflow-y-auto">
                {availableIncomingRequests.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                    <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-spin" />
                    <p className="text-sm font-semibold text-slate-800">Pinging dispatch satellite...</p>
                    <p className="text-xs text-slate-500 mt-1">No active client requests in your immediate smart-city grid yet.</p>
                  </div>
                ) : (
                  availableIncomingRequests.map((issue) => {
                    const priceRequested = customBids[issue.id] || '';
                    const needsBid = issue.pricingMethod === 'expert_bid';

                    return (
                      <div
                        key={issue.id}
                        id={`request-card-${issue.id}`}
                        className="bg-white border border-slate-200 p-4.5 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition shadow-sm"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="text-[10px] font-bold uppercase text-slate-600 font-mono">
                                {issue.category} 
                              </span>
                              <h4 className="font-bold text-slate-900 text-sm mt-1">{issue.title}</h4>
                            </div>
                            <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-slate-700 font-bold uppercase">
                              {issue.urgency}
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-600 mt-2 italic font-serif">“{issue.description}”</p>
                          
                          <div className="flex gap-4 mt-3 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-800">
                            <div>
                              Support Level: <span className="font-bold text-slate-900">On-Site Dispatch</span>
                            </div>
                            <div className="w-[1px] bg-slate-200" />
                            <div>
                              SLA Window: <span className="font-bold text-slate-900">Same-Day Priority</span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive price settings matching core requirements */}
                        <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Pricing Decision:</div>
                            <div className="text-xs text-slate-800 font-semibold uppercase mt-0.5">
                              {issue.pricingMethod === 'operator_fixed' ? (
                                <span className="text-slate-900 font-extrabold">Operating Fixed Rate: ${issue.price}</span>
                              ) : (
                                <span className="text-[#dc2626] font-extrabold">Expert Bidding Protocol</span>
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
                                    <div className="flex items-center bg-white border border-slate-200 rounded-xl pl-2.5 pr-1 py-1 max-w-28 text-xs shrink-0 shadow-xs">
                                      <DollarSign className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                      <input
                                        id={`input-bid-${issue.id}`}
                                        type="number"
                                        placeholder="Bid Price"
                                        value={priceRequested}
                                        onChange={(e) => handleBidPriceChange(issue.id, e.target.value)}
                                        className="w-full bg-transparent text-slate-900 focus:outline-none font-bold pl-0.5 text-xs text-center"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const bidVal = parseFloat(priceRequested);
                                        if (isNaN(bidVal) || bidVal <= 0) return;
                                        onSubmitExpertBid?.(issue.id, bidVal);
                                      }}
                                      className="bg-[#0f172a] hover:bg-slate-900 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs transition cursor-pointer active:scale-95 shadow-sm"
                                    >
                                      Submit Bid Quote
                                    </button>
                                  </div>
                                ) : issue.bidStatus === 'expert_submitted' ? (
                                  <div className="text-xs text-slate-600 font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-center shadow-xs">
                                    ⌛ Submitted Bid: <span className="text-slate-900 font-black">${issue.bidPrice}</span>. Pending client choice.
                                  </div>
                                ) : issue.bidStatus === 'expert_countered' ? (
                                  <div className="text-xs text-slate-600 font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-center shadow-xs">
                                    ⌛ You countered: <span className="text-slate-900 font-black">${issue.bidPrice}</span>. Waiting...
                                  </div>
                                ) : issue.bidStatus === 'client_countered' ? (
                                  <div className="space-y-2 text-right">
                                    <div className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 p-2.5 rounded-xl text-center shadow-xs">
                                      🔔 Client Countered: <strong className="font-extrabold">${issue.bidPrice}</strong>
                                    </div>
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => onExpertRespondBid?.(issue.id, 'accept')}
                                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs transition active:scale-95 cursor-pointer shadow-sm"
                                      >
                                        Accept Offer
                                      </button>
                                      
                                      <div className="flex items-center bg-white border border-slate-200 rounded-xl pl-2 pr-1 py-1 max-w-24 text-xs shrink-0 shadow-xs">
                                        <DollarSign className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                        <input
                                          id={`input-bid-counter-${issue.id}`}
                                          type="number"
                                          placeholder="Counter Price"
                                          className="w-full bg-transparent text-slate-900 focus:outline-none font-bold text-[11px] text-center"
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
                                        className="bg-[#0f172a] hover:bg-slate-900 text-white font-extrabold px-2.5 py-1.5 rounded-xl text-xs transition cursor-pointer shadow-sm"
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
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold uppercase text-slate-900 flex items-center gap-1.5 select-none">
                <Compass className="w-4 h-4 text-slate-700 animate-spin" /> Field Engineering Navigation
              </h3>

              <div className="space-y-4">
                {assignedJobs.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                    <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <div className="text-xs font-semibold text-slate-700">No active dispatches</div>
                    <p className="text-[10px] text-slate-500 mt-1">Accept a client ticket from your Live Request Radar on the left to initiate deployment.</p>
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
                        className="bg-white border border-slate-200 p-4 rounded-2xl space-y-4 shadow-sm"
                      >
                        <div className="flex justify-between border-b border-slate-200 pb-2">
                          <h4 className="font-bold text-slate-900 text-xs truncate line-clamp-1">{job.title}</h4>
                          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest leading-none font-mono">
                            {job.status.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Complete ticket SLA lifecycle chronology */}
                        <div className="py-1">
                          <TicketLifecycleTracker issue={job} />
                        </div>

                        {/* Inline Ticket Editor and Specs View for Expert */}
                        {editingJobId === job.id ? (
                          <div className="space-y-3 bg-slate-50 p-4 border border-slate-200 rounded-xl text-xs text-slate-800">
                            <div className="font-extrabold text-slate-900 text-xs mb-1">Modify Accepted Ticket Specifications</div>
                            
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600 block">Ticket Title</label>
                              <input
                                type="text"
                                value={editJobTitle}
                                onChange={(e) => setEditJobTitle(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-[#0f172a]"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600 block">Description Scope</label>
                              <textarea
                                value={editJobDesc}
                                rows={2}
                                onChange={(e) => setEditJobDesc(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-sans font-semibold focus:outline-[#0f172a]"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-bold text-slate-600 block">Category</label>
                                <select
                                  value={editJobCat}
                                  onChange={(e: any) => setEditJobCat(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 focus:outline-[#0f172a]"
                                >
                                  <option value="hardware">Hardware Repair</option>
                                  <option value="software">Software Setup</option>
                                  <option value="network">Network Deployment</option>
                                  <option value="security">Security Patch</option>
                                  <option value="cloud">Cloud Migration</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-slate-600 block">Urgency SLA</label>
                                <select
                                  value={editJobUrgency}
                                  onChange={(e: any) => setEditJobUrgency(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 focus:outline-[#0f172a]"
                                >
                                  <option value="low">Low SLA</option>
                                  <option value="medium">Medium SLA</option>
                                  <option value="high">High SLA</option>
                                  <option value="critical">Critical SLA</option>
                                </select>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600 block">Contract Price ($ USD)</label>
                              <input
                                type="number"
                                value={editJobPrice}
                                onChange={(e) => setEditJobPrice(Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-[#0f172a]"
                              />
                            </div>

                            <div className="flex gap-2 justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => setEditingJobId(null)}
                                className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold font-sans cursor-pointer hover:bg-slate-50"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveJobEdit(job.id)}
                                className="bg-[#0f172a] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold font-sans hover:bg-slate-900 transition-all cursor-pointer shadow-sm"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-50/80 p-3.5 border border-slate-200 rounded-xl space-y-2 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Problem Description</span>
                              <button
                                onClick={() => startEditingJob(job)}
                                className="text-slate-700 hover:text-slate-900 font-extrabold text-[11px] underline flex items-center gap-1 cursor-pointer"
                              >
                                Edit Details
                              </button>
                            </div>
                            <div className="text-slate-800 font-semibold leading-relaxed font-sans whitespace-pre-wrap">{job.description}</div>
                            <div className="grid grid-cols-3 gap-2 text-[10px] pt-1.5 border-t border-slate-200 text-slate-500 font-mono">
                              <div><span className="font-bold text-slate-800">Category:</span> {job.category.toUpperCase()}</div>
                              <div><span className="font-bold text-slate-800">Urgency:</span> {job.urgency.toUpperCase()}</div>
                              <div><span className="font-bold text-slate-800">Payout:</span> ${job.price}</div>
                            </div>
                          </div>
                        )}

                        {/* Dispatch Progress bar representation */}
                        {isDispatched && (
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                            <div className="flex justify-between items-center text-[10px] text-slate-800 font-bold">
                              <span>Travel Progress:</span>
                              <span className="text-[#dc2626] font-extrabold">{(job.activeStepIndex || 0) * 10}%</span>
                            </div>
                            <div className="w-full bg-white border border-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                style={{ width: `${((job.activeStepIndex || 0) * 10)}%` }}
                                className="bg-slate-900 h-full transition-all duration-300"
                              />
                            </div>
                            <button
                              id={`simulate-gps-step-${job.id}`}
                              onClick={() => onSimulateStep(job.id)}
                              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-3 rounded-xl text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Play className="w-3 h-3 text-white" /> Advance Location Step
                            </button>
                          </div>
                        )}

                        {/* Arrived On-site Diagnostics state */}
                        {isArrived && (
                          <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-center space-y-2 text-slate-800">
                            <p className="text-[11px] text-slate-800 font-medium">You have arrived at {job.clientName.split(' ')[0]}'s location. Ready to start repair.</p>
                            <button
                              id={`complete-diagnostic-${job.id}`}
                              onClick={() => onCompleteDiagnostic(job.id)}
                              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-2 px-3 rounded-xl text-xs transition shadow-sm cursor-pointer"
                            >
                              Start Repair
                            </button>
                          </div>
                        )}

                        {/* Active Service Solving progress */}
                        {isResolving && (
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center space-y-2">
                            <p className="text-[11px] text-slate-700 font-bold animate-pulse">Fixing issue &amp; testing resolution...</p>
                            <button
                              id={`complete-issue-${job.id}`}
                              onClick={() => onCompleteIssue(job.id)}
                              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-2 px-3 rounded-xl text-xs transition shadow-sm cursor-pointer"
                            >
                              Complete Repair &amp; Send Invoice
                            </button>
                          </div>
                        )}

                        {/* Pending payment invoice state */}
                        {isPendingPayment && (
                          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center space-y-1">
                            <span className="text-[9.5px] font-extrabold text-amber-600 uppercase shrink-0">Release Pending</span>
                            <p className="text-[10px] text-slate-700">Job solved! Invoice sent to client for ${job.price}.</p>
                          </div>
                        )}

                        {isCompleted && (
                          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center font-bold text-emerald-800 text-xs">
                            ✓ Payment received! Earnings saved.
                          </div>
                        )}

                        {/* Status dispatch trigger if accepted */}
                        {job.status === 'assigned' && (
                          <button
                            id={`start-ride-dispatch-${job.id}`}
                            onClick={() => onSimulateStep(job.id)}
                            className="w-full bg-[#d4a373] hover:bg-[#c39262] text-white font-bold py-1.5 px-3 rounded-lg text-xs transition flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                          >
                            <Wrench className="w-4 h-4 text-white" /> Start Heading to Location
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
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm text-slate-800">
                <div className="text-xs font-bold uppercase text-slate-500">Your Earnings Summary</div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[9.5px]">Total Earnings</span>
                    <span className="text-sm font-bold text-slate-900">${activeExpert.totalEarnings}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[9.5px]">Jobs Resolved</span>
                    <span className="text-sm font-bold text-slate-900">{activeExpert.totalResolved || 0} solutions</span>
                  </div>
                </div>

                <div className="text-[10.5px] text-slate-700 flex items-center gap-1.5 pt-1 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Licensed SolBridks Technical Specialist</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

        {/* History tab content */}
        {expertTab === 'history' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in text-slate-800">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Completed Job History</h3>
                <p className="text-[11px] text-slate-500">History of all completed repair jobs and confirmed earnings.</p>
              </div>
              <span className="text-[10px] bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider font-sans">Verified History</span>
            </div>
            {(() => {
              const historyIssues = issues.filter(i => i.expertId === selectedExpertId && i.status === 'completed');
              if (historyIssues.length === 0) {
                return (
                  <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                    <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-pulse" />
                    <p className="text-xs font-semibold text-slate-700">No completed jobs yet.</p>
                  </div>
                );
              }
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                  {historyIssues.map(item => (
                    <div key={item.id} className="border border-slate-200 p-4 rounded-2xl bg-slate-50/80 space-y-3 shadow-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] uppercase font-mono font-bold text-slate-700 bg-slate-200 border border-slate-300 px-1.5 py-0.5 rounded">{item.category}</span>
                          <h4 className="font-extrabold text-xs text-slate-900 mt-1.5">{item.title}</h4>
                        </div>
                        <span className="text-xs text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md font-mono">+${item.expertEarnings}</span>
                      </div>
                      <p className="text-xs text-slate-600">{item.description}</p>
                      <div className="grid grid-cols-3 gap-2 text-[10px] border-t border-slate-200 pt-2 font-mono">
                        <div>
                          <span className="text-slate-500 block uppercase text-[8px] font-bold font-sans">Status</span>
                          <span className="font-bold text-slate-900">Completed</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block uppercase text-[8px] font-bold font-sans">Ref Number</span>
                          <span className="font-bold text-slate-700">REF-{item.id.slice(0,4).toUpperCase()}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block uppercase text-[8px] font-bold font-sans">Warranty</span>
                          <span className="font-bold text-slate-900">90 Days</span>
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
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 max-w-2xl mx-auto animate-fade-in text-slate-800 border-t-4 border-t-[#0f172a]">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Bank &amp; Payout Details</h3>
              <p className="text-[11px] text-slate-500">Update your bank account information where job earnings will be deposited (85% payout rate).</p>
            </div>

            <form onSubmit={handleUpdateBankDetails} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 font-sans">Financial Institution</label>
                  <input
                    type="text"
                    required
                    defaultValue={activeExpert.bankName || "Commonwealth Green Reserve"}
                    onChange={(e) => { activeExpert.bankName = e.target.value; }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#0f172a]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 font-sans">Direct Account Number</label>
                  <input
                    type="text"
                    required
                    defaultValue={activeExpert.bankAccount || "******8218"}
                    onChange={(e) => { activeExpert.bankAccount = e.target.value; }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#0f172a]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1 font-sans">Transit / Routing (9-Digit Number)</label>
                  <input
                    type="text"
                    required
                    defaultValue={activeExpert.bankRouting || "021000021"}
                    onChange={(e) => { activeExpert.bankRouting = e.target.value; }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#0f172a]"
                  />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between text-xs font-sans">
                <div>
                  <span className="font-bold text-slate-900 block">Direct Payout Ledger configuration</span>
                  <span className="text-[11px] text-slate-500">SolBridks deductions: 15% system fee applied to all finalized client invoices.</span>
                </div>
                <span className="text-xs font-mono font-black text-slate-700">85/15 Payout Split</span>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0f172a] hover:bg-slate-900 text-white font-extrabold py-3 rounded-xl text-xs transition cursor-pointer font-sans shadow-sm"
              >
                Save Payout Coordinates
              </button>
            </form>
          </div>
        )}
          </div>
        );
      })() : (
        <div id="expert-registration-panel" className="bg-white border border-slate-200 rounded-2xl p-8 max-w-2xl mx-auto shadow-xl my-6 animate-fade-in text-slate-800 border-t-4 border-t-[#0f172a] font-sans">
          <div className="text-center space-y-3 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-[#0f172a]">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Specialist Portal</h2>
            <p className="text-xs text-slate-500 font-medium">Sign in to your account or register as a Technical Specialist to accept service contracts.</p>
          </div>

          {/* Form selection tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setActiveGateTab('login')}
              className={`py-2 px-4 rounded-xl text-xs font-bold font-sans transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeGateTab === 'login' 
                  ? 'bg-[#0f172a] text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              Existing Specialist Sign In
            </button>
            <button
              type="button"
              onClick={() => setActiveGateTab('register')}
              className={`py-2 px-4 rounded-xl text-xs font-bold font-sans transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeGateTab === 'register' 
                  ? 'bg-[#0f172a] text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              New Specialist Registration
            </button>
          </div>

          {activeGateTab === 'login' ? (
            <form onSubmit={handleExpertLogin} className="space-y-4 animate-fade-in">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest block font-sans">Existing Specialist Sign In</span>
                <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                  Please enter your registered email address to access your specialist technical dashboard and assigned tickets.
                </p>
              </div>

              {expertLoginError && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-xs font-semibold font-sans animate-fade-in flex items-start gap-2">
                  <span>⚠️ {expertLoginError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Email Address <span className="text-red-500">*</span></label>
                <input
                  id="expert-login-email"
                  type="email"
                  required
                  placeholder="e.g., elena.r@solbridks.com"
                  value={expertLoginEmail}
                  onChange={(e) => { setExpertLoginEmail(e.target.value); setExpertLoginError(''); }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-950 rounded-xl px-3.5 py-3 text-sm focus:outline-[#0f172a] font-semibold"
                />
              </div>

              <button
                id="expert-btn-login-submit"
                type="submit"
                className="w-full bg-[#0f172a] hover:bg-slate-900 text-white font-black py-3 rounded-2xl text-sm shadow-md transition-all text-center flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Sign In to Specialist Portal
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest block font-sans">New Specialist Registration</span>
                <p className="text-[11px] text-slate-500 leading-relaxed font-sans">Fill in your technical profile, contact details, and domains below to activate your specialist profile. Fields marked with <span className="text-red-500 font-bold">*</span> are required.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Full Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Elena Rostova"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-[#0f172a] font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Email Address <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      required
                      placeholder="e.g., elena.r@solbridks.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-[#0f172a] font-semibold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Mobile / Contact Phone Number <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 019-2831"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-[#0f172a] font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Industries &amp; Domains <span className="text-red-500">*</span> <span className="text-slate-400 font-normal lowercase">(Select all that apply)</span>
                  </label>
                  <div className="flex flex-wrap gap-2 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    {ALL_INDUSTRIES_DOMAINS.map((domain) => {
                      const isSelected = regDomains.includes(domain);
                      return (
                        <button
                          key={domain}
                          type="button"
                          onClick={() => toggleRegDomain(domain)}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected && <span className="text-emerald-400 font-extrabold text-xs">✓</span>}
                          {domain}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Technical Specialties &amp; Skills <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Fiber Optic splicing, Cisco Networking, General Plumbing, Property Maintenance, HVAC Repair"
                    value={regSkills}
                    onChange={(e) => setRegSkills(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-[#0f172a] font-semibold"
                  />
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Direct deposit bank info (USA &amp; Canada) <span className="text-slate-400 font-normal lowercase">(optional at registration)</span></span>
                  <p className="text-[11px] text-slate-400 mb-2">Provide your US ABA Routing or Canadian Transit &amp; Institution numbers for automatic payouts.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[9.5px] font-bold text-slate-700 block mb-0.5">Bank Name <span className="text-slate-400 font-normal">(Optional)</span></label>
                      <input
                        type="text"
                        placeholder="e.g., TD Canada Trust, Chase"
                        value={regBankName}
                        onChange={(e) => setRegBankName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-[11px] px-2.5 py-1.5 rounded-lg focus:outline-[#0f172a] text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[9.5px] font-bold text-slate-700 block mb-0.5">Account Number <span className="text-slate-400 font-normal">(Optional)</span></label>
                      <input
                        type="text"
                        placeholder="e.g., ******8218"
                        value={regBankAccount}
                        onChange={(e) => setRegBankAccount(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-[11px] px-2.5 py-1.5 rounded-lg focus:outline-[#0f172a] text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[9.5px] font-bold text-slate-700 block mb-0.5">ABA Routing No. (USA) <span className="text-slate-400 font-normal">(Optional)</span></label>
                      <input
                        type="text"
                        placeholder="e.g., 021000021"
                        value={regBankRouting}
                        onChange={(e) => setRegBankRouting(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-[11px] px-2.5 py-1.5 rounded-lg focus:outline-[#0f172a] text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[9.5px] font-bold text-slate-700 block mb-0.5">Institution No. (Canada - 3 Digits) <span className="text-slate-400 font-normal">(Optional)</span></label>
                      <input
                        type="text"
                        placeholder="e.g., 004 (TD) or 003 (RBC)"
                        value={regBankInstitution}
                        onChange={(e) => setRegBankInstitution(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-[11px] px-2.5 py-1.5 rounded-lg focus:outline-[#0f172a] text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[9.5px] font-bold text-slate-700 block mb-0.5">Transit / Branch No. (Canada - 5 Digits) <span className="text-slate-400 font-normal">(Optional)</span></label>
                      <input
                        type="text"
                        placeholder="e.g., 12345"
                        value={regBankTransit}
                        onChange={(e) => setRegBankTransit(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-[11px] px-2.5 py-1.5 rounded-lg focus:outline-[#0f172a] text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0f172a] hover:bg-slate-900 text-white font-black py-3 rounded-2xl text-sm shadow-md transition-all text-center flex items-center justify-center gap-2 transform active:scale-95 cursor-pointer mt-2"
              >
                Create Account &amp; Activate Specialist Profile
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
