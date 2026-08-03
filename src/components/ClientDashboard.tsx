import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  PlusCircle, 
  Activity, 
  HelpCircle, 
  AlertTriangle, 
  DollarSign, 
  Leaf, 
  TrendingUp, 
  Recycle, 
  ChevronRight,
  ShieldAlert,
  Loader2,
  Trash2,
  Lock,
  Wrench,
  Sparkles,
  Award,
  FileUp,
  LogOut,
  Key,
  ShieldCheck
} from 'lucide-react';
import { ITIssue, PricingMethod, IssueStatus, ClientProfile, TicketDocument, ChatMessage } from '../types';
import { generateSustainabilityEcoStats } from '../utils/storage';
import TicketLifecycleTracker from './TicketLifecycleTracker';
import TicketDocumentManager from './TicketDocumentManager';
import TicketChatConsole from './TicketChatConsole';

interface ClientDashboardProps {
  issues: ITIssue[];
  selectedIssueId: string | null;
  onSelectIssue: (id: string) => void;
  onCreateIssue: (issueData: Omit<ITIssue, 'id' | 'clientId' | 'clientName' | 'clientEmail' | 'createdAt' | 'status' | 'wasteAvoidedKg' | 'co2SavedKg' | 'lifespanExtendedMonths' | 'price' | 'operatorFee' | 'expertEarnings'>) => void;
  onDeleteIssue?: (id: string) => void;
  onInitiatePayment: () => void;
  fixedRates: Record<string, number>;
  clientProfile: ClientProfile;
  clients?: ClientProfile[];
  onSelectClient?: (id: string) => void;
  onUpdateClientProfile: (profile: ClientProfile) => void;
  onUpdateIssues?: (issues: ITIssue[]) => void;
  onUploadDocument: (issueId: string, doc: TicketDocument) => void;
  onDeleteDocument: (issueId: string, docId: string) => void;
  onSendMessage: (issueId: string, msg: ChatMessage) => void;
  onClientRespondBid?: (issueId: string, action: 'accept' | 'fixed' | 'counter', counterPrice?: number) => void;
}

export default function ClientDashboard({
  issues,
  selectedIssueId,
  onSelectIssue,
  onCreateIssue,
  onDeleteIssue,
  onInitiatePayment,
  fixedRates,
  clientProfile,
  clients = [],
  onSelectClient,
  onUpdateClientProfile,
  onUpdateIssues,
  onUploadDocument,
  onDeleteDocument,
  onSendMessage,
  onClientRespondBid
}: ClientDashboardProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'hardware' | 'software' | 'network' | 'security' | 'cloud'>('hardware');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [pricingMethod, setPricingMethod] = useState<PricingMethod>('operator_fixed');

  // Attached files/documents state during issue creation
  const [attachedDocs, setAttachedDocs] = useState<TicketDocument[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    files.forEach((item: any) => {
      const file = item as File;
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target?.result as string;
        if (!dataUrl) return;

        let sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
        if (file.size > 1024 * 1024) {
          sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
        }

        const newDoc: TicketDocument = {
          id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: sizeStr,
          uploadedBy: 'client' as const,
          uploadedByName: clientProfile?.name || 'Sarah Jenkins',
          uploadedAt: new Date().toISOString(),
          dataUrl: dataUrl
        };

        setAttachedDocs((prev) => [...prev, newDoc]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachedDoc = (idx: number) => {
    setAttachedDocs((prev) => prev.filter((_, i) => i !== idx));
  };

  // Client registration and login details
  const [activeGateTab, setActiveGateTab] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [regName, setRegName] = useState(clientProfile?.name || '');
  const [regEmail, setRegEmail] = useState(clientProfile?.email || '');
  const [regCompanyName, setRegCompanyName] = useState(clientProfile?.companyName || '');
  const [regPhone, setRegPhone] = useState(clientProfile?.phone || '');

  const handleClientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = clients.find(c => c.email.toLowerCase().trim() === loginEmail.toLowerCase().trim() && c.isRegistered);
    if (found) {
      setLoginError('');
      setLoginEmail('');
      onSelectClient?.(found.id);
    } else {
      setLoginError('Verification failed. No registered client profile matches this email address in our system records.');
    }
  };

  const handleRegisterClient = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateClientProfile({
      id: clientProfile?.id || 'client_usr',
      name: regName,
      email: regEmail,
      companyName: regCompanyName.trim() || 'Individual Client',
      phone: regPhone,
      isRegistered: true,
    });
  };

  const clientOwnIssues = issues.filter(issue => issue.clientId === clientProfile?.id);
  const selectedIssue = clientOwnIssues.find(i => i.id === selectedIssueId);

  const [isEditingIssue, setIsEditingIssue] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCat, setEditCat] = useState<'hardware' | 'software' | 'network' | 'security' | 'cloud'>('hardware');
  const [editUrgency, setEditUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');

  useEffect(() => {
    if (selectedIssue) {
      setEditTitle(selectedIssue.title);
      setEditDesc(selectedIssue.description);
      setEditCat(selectedIssue.category as any);
      setEditUrgency(selectedIssue.urgency);
      setIsEditingIssue(false);
    }
  }, [selectedIssueId]);

  const handleSaveIssueEdit = () => {
    if (!selectedIssue || !onUpdateIssues) return;
    const nextIssues = issues.map(iss => {
      if (iss.id === selectedIssue.id) {
        const eco = generateSustainabilityEcoStats(editCat as any, editDesc, editUrgency);
        return {
          ...iss,
          title: editTitle,
          description: editDesc,
          category: editCat,
          urgency: editUrgency,
          wasteAvoidedKg: eco.wasteAvoidedKg,
          co2SavedKg: eco.co2SavedKg,
          lifespanExtendedMonths: eco.lifespanExtendedMonths
        };
      }
      return iss;
    });
    onUpdateIssues(nextIssues);
    setIsEditingIssue(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    // Simulate coordinates somewhere around the center region
    const clientLat = 20 + Math.random() * 60;
    const clientLng = 20 + Math.random() * 60;

    onCreateIssue({
      title,
      description,
      category,
      urgency,
      pricingMethod,
      clientLat,
      clientLng,
      documents: attachedDocs
    } as any);

    // Reset Form
    setTitle('');
    setDescription('');
    setCategory('hardware');
    setUrgency('medium');
    setPricingMethod('operator_fixed');
    setAttachedDocs([]);
    setShowCreateModal(false);
  };

  if (clientProfile && !clientProfile.isRegistered) {
    return (
      <div id="client-registration-panel" className="bg-white border border-slate-200 rounded-2xl p-8 max-w-2xl mx-auto shadow-xl my-6 animate-fade-in text-slate-800 border-t-4 border-t-[#0f172a]">
        <div className="text-center space-y-3 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-[#0f172a]">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Client Portal</h2>
          <p className="text-xs text-slate-500 font-medium">Sign in to your account or register as an Individual or Corporate Client to request on-demand technical support.</p>
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
            Existing Client Sign In
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
            New Client Registration
          </button>
        </div>

        {activeGateTab === 'login' ? (
          <form onSubmit={handleClientLogin} className="space-y-4 animate-fade-in">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest block font-sans">Existing Client Sign In</span>
              <p className="text-[11px] text-slate-500 leading-relaxed font-sans">Enter your registered email address to access your client support dashboard.</p>
            </div>

            {loginError && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-xs font-semibold font-sans animate-fade-in flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Email Address <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  id="client-login-email"
                  type="email"
                  required
                  placeholder="e.g., s.jenkins@ecooffice.com or alex.smith@gmail.com"
                  value={loginEmail}
                  onChange={(e) => { setLoginEmail(e.target.value); setLoginError(''); }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-950 rounded-xl pl-3.5 pr-10 py-3 text-sm focus:outline-[#0f172a] font-semibold"
                />
              </div>
            </div>

            <button
              id="client-btn-login-submit"
              type="submit"
              className="w-full bg-[#0f172a] hover:bg-slate-900 text-white font-black py-3 rounded-2xl text-sm shadow-md transition-all text-center flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Sign In to Client Portal
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterClient} className="space-y-4 animate-fade-in">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest block font-sans">Individual or Corporate Client Registration</span>
              <p className="text-[11px] text-slate-500 leading-relaxed font-sans">Fill in your contact details below to activate your client account. Fields marked with <span className="text-red-500 font-bold">*</span> are required.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name <span className="text-red-500">*</span></label>
                <input
                  id="client-reg-name"
                  type="text"
                  required
                  placeholder="e.g., Sarah Jenkins"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-[#0f172a] font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address <span className="text-red-500">*</span></label>
                <input
                  id="client-reg-email"
                  type="email"
                  required
                  placeholder="e.g., sarah.j@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-[#0f172a] font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mobile / Contact Phone Number <span className="text-red-500">*</span></label>
                <input
                  id="client-reg-phone"
                  type="tel"
                  required
                  placeholder="+1 (555) 303-4929"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-[#0f172a] font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Company / Organization Name <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input
                  id="client-reg-company"
                  type="text"
                  placeholder="e.g., EcoOffice Corp (Leave blank for Individual)"
                  value={regCompanyName}
                  onChange={(e) => setRegCompanyName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-[#0f172a] font-semibold"
                />
              </div>
            </div>

            <button
              id="client-btn-submit-registration"
              type="submit"
              className="w-full bg-[#0f172a] hover:bg-slate-900 text-white font-black py-3 rounded-2xl text-sm shadow-md transition-all text-center flex items-center justify-center gap-2 transform active:scale-95 cursor-pointer mt-2"
            >
              Create Account &amp; Access Dashboard
            </button>
          </form>
        )}
      </div>
    );
  }

  // Helper to color code urgency levels
  const getUrgencyClass = (lvl: string) => {
    switch (lvl) {
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-700 font-extrabold';
      case 'high':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800 font-bold';
      case 'medium':
        return 'bg-blue-100 border-blue-300 text-blue-700 font-bold';
      default:
        return 'bg-slate-100 border-slate-200 text-slate-600 font-medium';
    }
  };

  const getStatusStepperIndex = (status: IssueStatus) => {
    const steps: IssueStatus[] = ['submitted', 'priced', 'assigned', 'dispatched', 'arrived', 'resolving', 'payment_pending', 'completed'];
    return steps.indexOf(status);
  };

  const currentStepIndex = selectedIssue ? getStatusStepperIndex(selectedIssue.status) : -1;

  return (
    <div id="client-dashboard-panel" className="space-y-6">
      
      {/* Top action header with vibrant Blue and modern shadow */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-md">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Activity className="text-blue-600 w-5 h-5 animate-pulse" /> Client IT Center
          </h2>
          <p className="text-xs text-slate-500 font-medium font-sans">Log systems, hardware defects, or structural IT needs with SolBridks zero-emission technician network</p>
        </div>
        <button
          id="client-btn-new-issue"
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-sm shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 transform active:scale-95"
        >
          <PlusCircle className="w-4 h-4 text-white" />
          Request IT Specialist
        </button>
      </div>

      {/* Authorized Profile block (Private - hides other profiles completely) */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none font-sans flex items-center gap-1.5">
              Client Account <span className="bg-emerald-100 border border-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded text-[8.5px] font-bold">Active Session</span>
            </div>
            <div className="text-xs font-bold text-slate-800 mt-1">
              Currently Logged In: <strong id="cli-logged-in-badge" className="text-[#0f172a] font-extrabold">{clientProfile?.name} ({clientProfile?.companyName || 'Corporate Profile'})</strong> &bull; <span className="text-[11px] text-slate-500 font-normal">{clientProfile?.email}</span>
            </div>
          </div>
        </div>
        
        <div>
          <button
            id="client-btn-logout"
            onClick={() => {
              // Reset client session back to unregistered state to show portal selection
              onUpdateClientProfile({
                id: 'client_' + Date.now(),
                name: '',
                email: '',
                companyName: '',
                phone: '',
                isRegistered: false
              });
            }}
            className="px-4 py-2 rounded-xl text-xs font-extrabold bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left side: Created Issues Listing (5 columns) */}
        <div className="lg:col-span-5 h-[560px] flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md">
          <div className="bg-slate-50 px-4 py-3.5 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" /> Active Service Tickets ({clientOwnIssues.length})
            </h3>
            <span className="text-[10px] bg-blue-100 text-blue-700 font-extrabold font-mono px-2 py-0.5 rounded-full uppercase font-sans">ID Secure</span>
          </div>

          <div id="tickets-scrollable-container" className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {clientOwnIssues.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200 p-6">
                <ShieldAlert className="w-10 h-10 text-yellow-500 mx-auto mb-2 animate-bounce" />
                <p className="text-sm font-bold text-slate-800">No active IT tickets</p>
                <p className="text-xs text-slate-500 mt-1">Submit a ticket using the Blue button at the top</p>
              </div>
            ) : (
              clientOwnIssues.map((issue) => {
                const isActive = selectedIssueId === issue.id;
                return (
                  <div
                    key={issue.id}
                    id={`ticket-card-${issue.id}`}
                    onClick={() => onSelectIssue(issue.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer select-none transition-all duration-150 relative group ${
                      isActive 
                        ? 'bg-blue-50/75 border-l-4 border-blue-600 border-t-blue-100 border-b-blue-100 border-r-blue-200 shadow-md' 
                        : 'bg-white border-slate-200 hover:border-blue-300 text-slate-800 hover:shadow shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border bg-slate-100 border-slate-200 text-slate-700">
                        {issue.category}
                      </span>
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${getUrgencyClass(issue.urgency)}`}>
                        {issue.urgency}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-slate-950 text-sm mt-3 line-clamp-1">{issue.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{issue.description}</p>

                    <div className="flex items-center justify-between mt-4 pt-2.5 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-800 font-extrabold uppercase">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          ['submitted', 'priced'].includes(issue.status) 
                            ? 'bg-yellow-500 animate-pulse' 
                            : issue.status === 'completed'
                            ? 'bg-green-500'
                            : 'bg-blue-500'
                        }`} />
                        {issue.status.replace('_', ' ')}
                      </div>

                      <div className="text-right">
                        <div className="text-[9px] text-slate-500 uppercase font-extrabold tracking-wide">
                          {issue.pricingMethod === 'operator_fixed' ? 'Contract Price' : 'Expert Bid'}
                        </div>
                        <div className="text-xs font-black text-slate-900">
                          {issue.price > 0 ? `$${issue.price}` : 'Pending quote'}
                        </div>
                      </div>
                    </div>

                    {/* Delete option if un-assigned */}
                    {['submitted', 'priced'].includes(issue.status) && onDeleteIssue && (
                      <button
                        id={`ticket-delete-btn-${issue.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteIssue(issue.id);
                        }}
                        className="absolute top-2.5 right-2.5 p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                        title="Delete un-assigned ticket"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right side: Selected Issue Detail & Tracking Stepper (7 columns) */}
        <div id="ticket-detail-view" className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden h-[560px] flex flex-col shadow-md">
          {selectedIssue ? (
            <div className="flex-1 flex flex-col overflow-y-auto">
              
              {/* Header block with status banner */}
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-start gap-4">
                <div className="flex-1">
                  <span className="text-[10px] text-blue-600 font-mono font-black uppercase tracking-widest block mb-0.5 animate-pulse">
                    🟢 Live System Dispatch &amp; Tracking Active
                  </span>
                  <h3 id="ticket-details-title" className="text-base font-black text-slate-900 line-clamp-1">{selectedIssue.title}</h3>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  {onUpdateIssues && (
                    <button
                      id="client-btn-edit-issue-toggle"
                      onClick={() => setIsEditingIssue(!isEditingIssue)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                        isEditingIssue 
                          ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 font-extrabold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-extrabold shadow-sm'
                      }`}
                    >
                      {isEditingIssue ? 'Cancel' : 'Edit Ticket'}
                    </button>
                  )}

                  {/* Micro badge of assigned expert - glowing Yellow/Gold border */}
                  {selectedIssue.expertName && (
                    <div className="bg-yellow-50 border border-yellow-300 rounded-xl px-3 py-1 flex items-center gap-2 shrink-0 shadow-sm animate-none">
                      <Wrench className="w-4 h-4 text-yellow-600" />
                      <div>
                        <div className="text-[8px] text-yellow-800 uppercase leading-none font-extrabold">Dispatch Expert</div>
                        <div className="text-xs font-black text-yellow-700 leading-tight">{selectedIssue.expertName}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Main content body */}
              <div className="p-6 space-y-6 flex-1 bg-white">
                {isEditingIssue ? (
                  <div className="space-y-4 animate-fade-in text-slate-800">
                    <div className="bg-blue-50/50 border border-blue-200/50 rounded-2xl p-4 mb-2">
                      <h4 className="text-sm font-black text-slate-900">Modify Ticket Specifications</h4>
                      <p className="text-[11px] text-slate-500 font-semibold font-sans">Update this dispatch order. Platform SLA, routes, emission audit and technician dispatch parameters will auto-adapt to updates.</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block mb-1">Ticket Title</label>
                      <input
                        id="client-edit-title"
                        type="text"
                        required
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Skill / Tech Category</label>
                        <select
                          id="client-edit-category"
                          value={editCat}
                          onChange={(e) => setEditCat(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:outline-blue-500 font-extrabold"
                        >
                          <option value="hardware">Hardware Repair</option>
                          <option value="software">Software Optimization</option>
                          <option value="network">Network/Security Infra</option>
                          <option value="security">Cybersecurity Implementation</option>
                          <option value="cloud">Cloud Integration</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Urgency Level</label>
                        <select
                          id="client-edit-urgency"
                          value={editUrgency}
                          onChange={(e) => setEditUrgency(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:outline-blue-500 font-extrabold"
                        >
                          <option value="low">Low (Standard Dispatch)</option>
                          <option value="medium">Medium (48h SLA)</option>
                          <option value="high">High (24h Expedited)</option>
                          <option value="critical">Critical (Immediate Response)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block mb-1">Technical Scope / Detailed Description</label>
                      <textarea
                        id="client-edit-desc"
                        rows={5}
                        required
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:outline-blue-500 font-medium leading-relaxed"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsEditingIssue(false)}
                        className="px-4 py-2 text-xs font-extrabold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        id="client-btn-save-edit"
                        onClick={handleSaveIssueEdit}
                        className="px-5 py-2 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        Save Technical Updates
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Dynamic SLA Chronicle lifecycle Tracker */}
                    <div className="space-y-2">
                      <TicketLifecycleTracker issue={selectedIssue} />
                    </div>

                    <div className="h-[1px] bg-slate-100" />

                    {/* Tracking Progress Narrative -> Clean eye-grabbing alert styling */}
                    <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4">
                      <div className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 font-sans">
                        <Activity className="w-3.5 h-3.5 animate-pulse text-blue-600" /> Dispatch Center Log
                      </div>
                      <div id="live-dispatch-message" className="text-xs text-slate-800 font-bold leading-relaxed font-sans">
                        {selectedIssue.status === 'submitted' && "System logged. SolBridks HQ Operators or tech experts are estimating rates. You will receive quotes shortly."}
                        {selectedIssue.status === 'priced' && "Fixed Price quote active! We are waiting for a verified field technician to pull and accept your ticket."}
                        {selectedIssue.status === 'assigned' && `Expert technician ${selectedIssue.expertName} has accepted your service ticket. Preparing diagnostic kits and test rig.`}
                        {selectedIssue.status === 'dispatched' && `${selectedIssue.expertName} is dispatched to your site with diagnostic systems. Follow active pathing on index.`}
                        {selectedIssue.status === 'arrived' && `${selectedIssue.expertName} has arrived on-premises and is starting the diagnostic process.`}
                        {selectedIssue.status === 'resolving' && "Technician is performing repairs/configurations on hardware & active network boards."}
                        {selectedIssue.status === 'payment_pending' && "Resolutions complete! Testing passed. Please submit payment to unlock funds & close this ticket."}
                        {selectedIssue.status === 'completed' && "Ticket resolved, paid, and signed! Thank you for maintaining energy-efficient business hardware."}
                      </div>
                    </div>

                    {/* SLA & Service Performance Card */}
                    <div className="bg-[#0f172a] text-white rounded-[24px] p-5 flex gap-4 items-center relative overflow-hidden shadow-lg border-t-2 border-t-emerald-500">
                      <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                        <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
                      </div>
                      <div className="flex-grow z-10">
                        <div className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-widest block mb-1">
                          SLA Performance &amp; Service Metrics
                        </div>
                        <p className="text-xs text-slate-200 font-medium font-sans">Real-time resolution analytics and corporate dispatch standards:</p>
                        <div className="flex gap-6 mt-3">
                          <div>
                            <span className="text-[9px] text-slate-400 block uppercase font-bold">Response Target</span>
                            <span className="text-sm font-black font-mono text-white">15 Mins SLA</span>
                          </div>
                          <div className="w-[1px] bg-white/10" />
                          <div>
                            <span className="text-[9px] text-slate-400 block uppercase font-bold text-indigo-200">Quality Check</span>
                            <span className="text-sm font-black font-mono text-indigo-300">100% Core Audit</span>
                          </div>
                          <div className="w-[1px] bg-white/10" />
                          <div>
                            <span className="text-[9px] text-slate-400 block uppercase font-bold">Dispatch Coverage</span>
                            <span className="text-sm font-black font-mono text-white">Global On-Site</span>
                          </div>
                        </div>
                      </div>
                      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
                    </div>

                    {/* INTERACTIVE BIDDING TERMINAL FOR CLIENT ACTIONS */}
                    {selectedIssue.pricingMethod === 'expert_bid' && ['submitted', 'priced'].includes(selectedIssue.status) && (
                      <div className="bg-slate-50 border-2 border-indigo-600/10 rounded-2xl p-5 space-y-4 shadow-sm text-slate-850">
                        <div className="flex justify-between items-center pb-2.5 border-b border-indigo-100">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-indigo-600" />
                            <div>
                              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 font-sans">
                                Bidding &amp; Price Negotiation Console
                              </h4>
                              <span className="text-[10px] text-slate-500 font-medium">
                                Interact directly with the bidding expert in real time.
                              </span>
                            </div>
                          </div>
                          <span className="text-[9px] bg-indigo-100 text-indigo-700 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                            Active Auction
                          </span>
                        </div>

                        {(!selectedIssue.bidStatus || selectedIssue.bidStatus === 'none') ? (
                          <div className="bg-white border border-slate-200/60 rounded-xl p-4 text-center space-y-1.5 shadow-sm">
                            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto" />
                            <p className="text-xs font-bold text-slate-800">Waiting for Tech Expert Bid...</p>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                              Verified technicians are reviewing your ticket scope. Once they submit a quote, you can accept, counter-offer, or choose standard fixed-rate pricing.
                            </p>
                            <div className="pt-2">
                              <button
                                type="button"
                                onClick={() => onClientRespondBid?.(selectedIssue.id, 'fixed')}
                                className="bg-slate-950 hover:bg-slate-850 text-white font-extrabold px-3.5 py-2 rounded-xl text-[10.5px] transition-all cursor-pointer shadow-sm active:scale-95"
                              >
                                Switch to SolFixed Rate (${fixedRates[selectedIssue.category] || 85})
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm">
                              <div>
                                <div className="text-[9.5px] text-slate-400 uppercase font-black tracking-widest font-sans">
                                  Expert Bid Session
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                  <span className="text-xs font-black text-slate-950 font-sans">
                                    {selectedIssue.bidExpertName || "Verified Expert"}
                                  </span>
                                </div>
                                <p className="text-[10.5px] text-slate-500 font-medium mt-1">
                                  {selectedIssue.bidStatus === 'expert_submitted' && "Expert submitted initial quote."}
                                  {selectedIssue.bidStatus === 'expert_countered' && "Expert countered with a new quote."}
                                  {selectedIssue.bidStatus === 'client_countered' && "Waiting for Expert to respond to your counter-offer..."}
                                </p>
                              </div>

                              <div className="text-left sm:text-right shrink-0">
                                <span className="text-[9.5px] text-indigo-500 uppercase font-black tracking-widest block font-mono">
                                  Active Quote Price
                                </span>
                                <span className="text-2xl font-black text-indigo-950">
                                  ${selectedIssue.bidPrice} USD
                                </span>
                              </div>
                            </div>

                            {selectedIssue.bidStatus === 'client_countered' ? (
                              <div className="bg-indigo-50/60 border border-indigo-150 rounded-xl p-3.5 space-y-2">
                                <div className="text-xs text-indigo-900 font-bold leading-relaxed">
                                  ⏳ You submitted a counter-offer of <strong className="text-indigo-700">${selectedIssue.bidPrice}</strong>. We have relayed this to {selectedIssue.bidExpertName || "the expert"}.
                                </div>
                                <div className="pt-1 flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => onClientRespondBid?.(selectedIssue.id, 'fixed')}
                                    className="bg-slate-950 hover:bg-slate-850 text-white font-extrabold px-3.5 py-1.5 rounded-lg text-[10.5px] transition-all cursor-pointer"
                                  >
                                    Cancel &amp; Switch to SolFixed Price (${fixedRates[selectedIssue.category] || 85})
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <button
                                    type="button"
                                    onClick={() => onClientRespondBid?.(selectedIssue.id, 'accept')}
                                    className="bg-green-600 hover:bg-green-700 text-white font-black px-4 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                                  >
                                    <Award className="w-4 h-4 text-white" /> Accept Expert Bid
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => onClientRespondBid?.(selectedIssue.id, 'fixed')}
                                    className="bg-slate-950 hover:bg-slate-850 text-white font-black px-4 py-3 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                                  >
                                    <Recycle className="w-4 h-4 text-white" /> Switch to SolFixed Price (${fixedRates[selectedIssue.category] || 85})
                                  </button>
                                </div>

                                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
                                  <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block font-sans">
                                    Recounter Bid Price
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                      <input
                                        id="input-client-counter-price"
                                        type="number"
                                        placeholder="Enter Counter Offer"
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-950 font-black rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            const val = parseFloat(e.currentTarget.value);
                                            if (!isNaN(val) && val > 0) {
                                              onClientRespondBid?.(selectedIssue.id, 'counter', val);
                                              e.currentTarget.value = '';
                                            }
                                          }
                                        }}
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        const input = document.getElementById('input-client-counter-price') as HTMLInputElement;
                                        const val = parseFloat(input?.value || '');
                                        if (!isNaN(val) && val > 0) {
                                          onClientRespondBid?.(selectedIssue.id, 'counter', val);
                                          if (input) input.value = '';
                                        }
                                      }}
                                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                                    >
                                      Submit Counter
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Detailed Ticket Info */}
                    <div className="space-y-4">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Technical Scope summary</div>
                      <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed font-semibold font-sans">
                        {selectedIssue.description}
                      </p>
                    </div>

                    {/* Real-time Document exchange and Encrypted Chatting */}
                    <div className="pt-4 border-t border-slate-100 grid grid-cols-1 xl:grid-cols-2 gap-6">
                      <TicketDocumentManager 
                        issueId={selectedIssue.id}
                        documents={selectedIssue.documents || []}
                        currentRole="client"
                        currentUserName={clientProfile.isRegistered ? clientProfile.name : "Client Contact / Sarah Jenkins"}
                        onUploadDocument={onUploadDocument}
                        onDeleteDocument={onDeleteDocument}
                      />

                      <TicketChatConsole 
                        issue={selectedIssue}
                        currentRole="client"
                        currentUserName={clientProfile.isRegistered ? clientProfile.name : "Client Contact / Sarah Jenkins"}
                        onSendMessage={onSendMessage}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Sticky bottom checkout bar with vibrant Green checkout actions */}
              {selectedIssue.status === 'payment_pending' && (
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-4 sticky bottom-0 z-10 shrink-0">
                  <div>
                    <div className="text-[9.5px] text-slate-500 uppercase font-black tracking-wider">Required Completion Release</div>
                    <div className="text-xl font-black text-slate-900">${selectedIssue.price} USD</div>
                  </div>
                  <button
                    id="client-btn-launch-payment"
                    onClick={onInitiatePayment}
                    className="bg-green-600 hover:bg-green-700 text-white font-black px-6 py-3 rounded-xl text-sm transition-all flex items-center gap-2 shadow-lg shadow-green-500/25 active:scale-95"
                  >
                    <Lock className="w-4 h-4 text-white" /> Access Secure Checkout Portal
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="flex-grow flex flex-col justify-center items-center text-center p-6 text-slate-400 bg-white">
              <Sparkles className="w-12 h-12 text-blue-500/80 animate-pulse mb-3" />
              <h4 className="text-sm font-extrabold text-slate-800">Select a Service Ticket</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1">Select an active incident from the list to track live progress and submit secure payments once resolved.</p>
            </div>
          )}
        </div>

      </div>

      {/* CREATE NEW TICKET MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-[28px] p-6 max-w-xl w-full shadow-2xl relative text-left">
            <h3 className="text-lg font-black text-slate-950 flex items-center gap-2">
              <Award className="text-blue-600 w-5 h-5" /> File New Incident Ticket
            </h3>
            <p className="text-xs text-slate-500 mt-1">Configure operating parameters and pricing preferences dynamically.</p>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-slate-800">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Issue Overview Heading</label>
                <input
                  id="field-issue-title"
                  type="text"
                  placeholder="e.g. Broken PoE router or physical server motherboard replacement"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-950 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">System Defect Description</label>
                <textarea
                  id="field-issue-desc"
                  placeholder="Provide details about the hardware failures or firmware issues. Sustainable policies prioritize physical repairs over direct equipment disposal."
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-950 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Defect Category</label>
                  <select
                    id="field-issue-category"
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-950 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 font-semibold"
                  >
                    <option value="hardware">Hardware Repair</option>
                    <option value="software">Software Audit</option>
                    <option value="network">Network Subnetworks</option>
                    <option value="security">Cybersecurity Threat</option>
                    <option value="cloud">Eco Cloud Migration</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Priority urgency</label>
                  <select
                    id="field-issue-urgency"
                    value={urgency}
                    onChange={(e: any) => setUrgency(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-950 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 font-semibold"
                  >
                    <option value="low">Low (Next Business Day)</option>
                    <option value="medium">Medium Standard</option>
                    <option value="high">High Dispatch Priority</option>
                    <option value="critical">Critical (Immediate dispatch)</option>
                  </select>
                </div>
              </div>

              {/* Pricing decision option - Core parameter */}
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3">
                <div className="text-xs font-black text-slate-700 uppercase tracking-wide">
                  Pricing Decision Preference (Both Options Available)
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer select-none transition-all ${
                    pricingMethod === 'operator_fixed'
                      ? 'bg-blue-50/60 border-blue-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-blue-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">SolFixed Contract Price</span>
                      <input
                        id="pricing-fixed"
                        type="radio"
                        name="pricingMethod"
                        checked={pricingMethod === 'operator_fixed'}
                        onChange={() => setPricingMethod('operator_fixed')}
                        className="accent-blue-600"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 font-medium">
                      Company Operations guarantees transparent rates. Hardware repair fixed rate: ${fixedRates[category] || 85}.
                    </span>
                  </label>

                  <label className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer select-none transition-all ${
                    pricingMethod === 'expert_bid'
                      ? 'bg-blue-50/60 border-blue-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-blue-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">Tech Expert Bids</span>
                      <input
                        id="pricing-bid"
                        type="radio"
                        name="pricingMethod"
                        checked={pricingMethod === 'expert_bid'}
                        onChange={() => setPricingMethod('expert_bid')}
                        className="accent-blue-600"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 font-medium">
                      Submit ticket and let verified independent solution providers bid custom solution prices.
                    </span>
                  </label>
                </div>
              </div>

              {/* Optional File Attachments */}
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3">
                <div className="text-xs font-black text-slate-705 uppercase tracking-wide flex items-center gap-1.5 text-slate-700">
                  <FileUp className="w-4 h-4 text-blue-600 animate-bounce" /> Optional File/Document Attachments
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  Upload configuration files, diagnostic logs, images, or specifications to help experts quote accurately. Supports any file type.
                </p>

                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    id="submit-modal-file-upload"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    ref={fileInputRef}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 font-extrabold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-blue-600" /> Browse PDF, PNG, etc
                  </button>

                  <div className="text-[10px] text-slate-500 font-medium truncate flex-1 leading-none">
                    {attachedDocs.length === 0 ? "No files selected." : `${attachedDocs.length} files attached.`}
                  </div>
                </div>

                {attachedDocs.length > 0 && (
                  <div className="max-h-24 overflow-y-auto space-y-1 bg-white border border-slate-200/60 rounded-xl p-2">
                    {attachedDocs.map((doc, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10.5px] text-slate-800 bg-slate-50 border border-slate-150 px-2 py-1 rounded-lg">
                        <span className="font-semibold truncate max-w-[280px]">{doc.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-slate-400 font-mono">{doc.size}</span>
                          <button
                            type="button"
                            onClick={() => removeAttachedDoc(idx)}
                            className="text-red-500 hover:text-red-700 font-extrabold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  id="client-btn-close-modal"
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold px-4 py-2.5 rounded-xl text-sm transition-all"
                >
                  Discard
                </button>
                <button
                  id="client-btn-submit-modal"
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-black px-5 py-2.5 rounded-xl text-sm shadow-md transition-all flex items-center gap-2 active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  Publish Ticket
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
