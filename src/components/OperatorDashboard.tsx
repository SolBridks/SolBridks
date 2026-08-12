import React, { useState } from 'react';
import { 
  Sliders, 
  Leaf, 
  TrendingUp, 
  Recycle, 
  DollarSign, 
  Layers, 
  Settings, 
  ShieldAlert, 
  CheckCircle,
  HelpCircle,
  Wrench,
  Percent,
  Check,
  Users,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  FolderLock,
  Compass,
  Trash2,
  Edit,
  Activity,
  CreditCard,
  Target
} from 'lucide-react';
import { ITIssue, SolBridksConfig, ExpertProfile, ClientProfile, TicketDocument, ChatMessage } from '../types';
import TicketLifecycleTracker from './TicketLifecycleTracker';
import TicketDocumentManager from './TicketDocumentManager';
import TicketChatConsole from './TicketChatConsole';

interface OperatorDashboardProps {
  issues: ITIssue[];
  config: SolBridksConfig;
  onUpdateConfig: (newConfig: SolBridksConfig) => void;
  onOperatorSetPrice: (issueId: string, price: number) => void;
  experts: ExpertProfile[];
  onUpdateExperts: (experts: ExpertProfile[]) => void;
  onUpdateIssues: (issues: ITIssue[]) => void;
  clientProfile: ClientProfile;
  onUpdateClientProfile: (profile: ClientProfile) => void;
  onUploadDocument: (issueId: string, doc: TicketDocument) => void;
  onDeleteDocument: (issueId: string, docId: string) => void;
  onSendMessage: (issueId: string, msg: ChatMessage) => void;
}

export default function OperatorDashboard({
  issues,
  config,
  onUpdateConfig,
  onOperatorSetPrice,
  experts,
  onUpdateExperts,
  onUpdateIssues,
  clientProfile,
  onUpdateClientProfile,
  onUploadDocument,
  onDeleteDocument,
  onSendMessage,
}: OperatorDashboardProps) {
  
  // Tab switcher of operator panel
  const [operatorTab, setOperatorTab] = useState<'rates' | 'specialists' | 'clients' | 'tickets'>('rates');

  // GUIDELINE RULES RATE STATE
  const [hardwareRate, setHardwareRate] = useState(config.hardwareFixedPrice);
  const [softwareRate, setSoftwareRate] = useState(config.softwareFixedPrice);
  const [networkRate, setNetworkRate] = useState(config.networkFixedPrice);
  const [securityRate, setSecurityRate] = useState(config.securityFixedPrice);
  const [cloudRate, setCloudRate] = useState(config.cloudFixedPrice);
  const [platformFee, setPlatformFee] = useState(config.platformFeeRate * 100);
  const [isSaved, setIsSaved] = useState(false);

  // States for setting manually registered issues (unpriced operator fixed)
  const [pricingInputs, setPricingInputs] = useState<Record<string, string>>({});

  // Specialist edit state
  const [editingExpertId, setEditingExpertId] = useState<string | null>(null);
  const [editExpertName, setEditExpertName] = useState('');
  const [editExpertBank, setEditExpertBank] = useState('');
  const [editExpertAccount, setEditExpertAccount] = useState('');
  const [editExpertRouting, setEditExpertRouting] = useState('');

  // Ticket override price & custom status states
  const [editingIssueId, setEditingIssueId] = useState<string | null>(null);
  const [editIssuePrice, setEditIssuePrice] = useState('');
  const [openCommunicationsId, setOpenCommunicationsId] = useState<string | null>(null);

  // Handle saving standard fixed price guide parameters
  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      hardwareFixedPrice: Number(hardwareRate),
      softwareFixedPrice: Number(softwareRate),
      networkFixedPrice: Number(networkRate),
      securityFixedPrice: Number(securityRate),
      cloudFixedPrice: Number(cloudRate),
      platformFeeRate: platformFee / 100,
      co2OffsetRate: config.co2OffsetRate,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handlePriceInput = (issueId: string, val: string) => {
    setPricingInputs({ ...pricingInputs, [issueId]: val });
  };

  // Issues awaiting operator sets custom price
  const unpricedIssues = issues.filter(i => i.status === 'submitted' && i.pricingMethod === 'operator_fixed');

  // Calculates financial balances across system portfolio
  const totalCompletedGrossUSD = issues
    .filter(i => i.status === 'completed')
    .reduce((acc, curr) => acc + (curr.price || 0), 0);

  const totalCommittedFeesUSD = issues
    .filter(i => i.status === 'completed')
    .reduce((acc, curr) => acc + (curr.operatorFee || 0), 0);

  const totalExpertPayoutsUSD = issues
    .filter(i => i.status === 'completed')
    .reduce((acc, curr) => acc + (curr.expertEarnings || 0), 0);

  // QA Specialist verification handlers
  const handleToggleVerification = (expertId: string) => {
    const updated = experts.map(exp => {
      if (exp.id === expertId) {
        const nextState = !exp.isVerifiedByQA;
        return { ...exp, isVerifiedByQA: nextState };
      }
      return exp;
    });
    onUpdateExperts(updated);
  };

  // Inline Specialist edit handlers
  const handleStartEditExpert = (exp: ExpertProfile) => {
    setEditingExpertId(exp.id);
    setEditExpertName(exp.name);
    setEditExpertBank(exp.bankName || '');
    setEditExpertAccount(exp.bankAccount || '');
    setEditExpertRouting(exp.bankRouting || '');
  };

  const handleSaveExpertDetails = (expertId: string) => {
    const updated = experts.map(exp => {
      if (exp.id === expertId) {
        return { 
          ...exp, 
          name: editExpertName,
          bankName: editExpertBank,
          bankAccount: editExpertAccount,
          bankRouting: editExpertRouting
        };
      }
      return exp;
    });
    onUpdateExperts(updated);
    setEditingExpertId(null);
  };

  // Delete Specialist
  const handleDeleteExpert = (expertId: string) => {
    if (confirm("Are you sure you want to delete this specialist from the registry?")) {
      const filtered = experts.filter(exp => exp.id !== expertId);
      onUpdateExperts(filtered);
    }
  };

  // Toggle Client Profile Registration
  const handleToggleClientRegistration = () => {
    onUpdateClientProfile({
      ...clientProfile,
      isRegistered: !clientProfile.isRegistered
    });
  };

  // Inline Client Profile edits
  const handleSaveClientProfileDetails = (name: string, email: string, phone?: string, companyName?: string) => {
    onUpdateClientProfile({
      ...clientProfile,
      name,
      email,
      phone: phone !== undefined ? phone : clientProfile.phone,
      companyName: companyName !== undefined ? companyName : clientProfile.companyName
    });
  };

  // Direct Ticket portfolio controls: status override, forced payouts, manual edits, and deletion
  const handleForcePayoutAndSplit = (issueId: string) => {
    const updated = issues.map(iss => {
      if (iss.id === issueId) {
        const finalPrice = iss.price || 120;
        const operatorFee = Number((finalPrice * config.platformFeeRate).toFixed(1));
        const expertEarnings = Number((finalPrice - operatorFee).toFixed(1));

        // Credit the expert profile
        if (iss.expertId) {
          const updatedExperts = experts.map(exp => {
            if (exp.id === iss.expertId) {
              return {
                ...exp,
                totalEarnings: Number((exp.totalEarnings + expertEarnings).toFixed(1))
              };
            }
            return exp;
          });
          onUpdateExperts(updatedExperts);
        }

        return {
          ...iss,
          status: 'completed' as const,
          operatorFee,
          expertEarnings
        };
      }
      return iss;
    });
    onUpdateIssues(updated);
  };

  const handleOverrideStatus = (issueId: string, nextStatus: any) => {
    const updated = issues.map(iss => {
      if (iss.id === issueId) {
        return { ...iss, status: nextStatus };
      }
      return iss;
    });
    onUpdateIssues(updated);
  };

  const handleDeleteIssue = (issueId: string) => {
    if (confirm("Are you sure you want to delete this ticket portfolio entry permanently?")) {
      const filtered = issues.filter(iss => iss.id !== issueId);
      onUpdateIssues(filtered);
    }
  };

  const handleSaveIssuePrice = (issueId: string) => {
    const nextPrice = Number(editIssuePrice);
    if (isNaN(nextPrice) || nextPrice <= 0) return;

    const updated = issues.map(iss => {
      if (iss.id === issueId) {
        const opFee = Number((nextPrice * config.platformFeeRate).toFixed(1));
        const expEarn = Number((nextPrice - opFee).toFixed(1));
        return {
          ...iss,
          price: nextPrice,
          operatorFee: opFee,
          expertEarnings: expEarn
        };
      }
      return iss;
    });
    onUpdateIssues(updated);
    setEditingIssueId(null);
  };

  return (
    <div id="operator-dashboard-panel" className="space-y-6 text-slate-800">
      
      {/* Admin Tabs Toolbar panel */}
      <div className="flex flex-wrap border border-slate-200 gap-2 text-xs font-extrabold uppercase tracking-wider font-sans bg-white p-2 rounded-2xl shadow-xs">
        <button
          onClick={() => setOperatorTab('rates')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            operatorTab === 'rates' 
              ? 'bg-[#0f172a] text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          📈 Guidelines &amp; Fixed Rates
        </button>
        <button
          onClick={() => setOperatorTab('specialists')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            operatorTab === 'specialists' 
              ? 'bg-[#0f172a] text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          🛡️ Specialists ({experts.length})
        </button>
        <button
          onClick={() => setOperatorTab('clients')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            operatorTab === 'clients' 
              ? 'bg-[#0f172a] text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          👥 Clients
        </button>
        <button
          onClick={() => setOperatorTab('tickets')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            operatorTab === 'tickets' 
              ? 'bg-[#0f172a] text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          🎟️ Support Tickets ({issues.length})
        </button>
      </div>

      {operatorTab === 'rates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in font-sans">
          {/* SolFixed Rate parameters (Left columns: 5) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm border-t-4 border-t-[#0f172a]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-[#0f172a]" /> Guidelines &amp; Fixed Rates
              </h3>
              <span className="text-[9px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-bold uppercase">
                HQ RATES
              </span>
            </div>

            <form onSubmit={handleSaveRates} className="space-y-4 text-xs">
              <div className="space-y-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Hardware &amp; Electronics Rate ($)</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <DollarSign className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="number"
                      value={hardwareRate}
                      onChange={(e) => setHardwareRate(Number(e.target.value))}
                      className="bg-transparent text-slate-900 font-bold ml-1 focus:outline-none w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Software &amp; Web Solutions Rate ($)</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <DollarSign className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="number"
                      value={softwareRate}
                      onChange={(e) => setSoftwareRate(Number(e.target.value))}
                      className="bg-transparent text-slate-900 font-bold ml-1 focus:outline-none w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Telecom &amp; Networking Rate ($)</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <DollarSign className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="number"
                      value={networkRate}
                      onChange={(e) => setNetworkRate(Number(e.target.value))}
                      className="bg-transparent text-slate-900 font-bold ml-1 focus:outline-none w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Cybersecurity Rate ($)</label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                      <DollarSign className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        type="number"
                        value={securityRate}
                        onChange={(e) => setSecurityRate(Number(e.target.value))}
                        className="bg-transparent text-slate-900 font-bold ml-1 focus:outline-none w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Cloud &amp; AI Rate ($)</label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                      <DollarSign className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        type="number"
                        value={cloudRate}
                        onChange={(e) => setCloudRate(Number(e.target.value))}
                        className="bg-transparent text-slate-900 font-bold ml-1 focus:outline-none w-full"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Platform Commission Rate (%)</label>
                  <div className="flex items-center bg-emerald-50/50 border border-emerald-200 rounded-xl px-3 py-2">
                    <Percent className="w-4 h-4 text-emerald-700 shrink-0" />
                    <input
                      type="number"
                      value={platformFee}
                      onChange={(e) => setPlatformFee(Number(e.target.value))}
                      className="bg-transparent text-emerald-950 font-black ml-1 focus:outline-none w-full font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0f172a] hover:bg-slate-900 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2 font-sans cursor-pointer mt-2"
              >
                {isSaved ? <Check className="w-4 h-4 text-emerald-400" /> : null}
                {isSaved ? 'Rates Saved Successfully' : 'Save Fixed Rates'}
              </button>
            </form>
          </div>

          {/* Pending operator-priced items queue (7 columns) */}
          <div id="operator-queue" className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between h-[480px] shadow-sm">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#0f172a]" /> SolFixed Awaiting Rates
                </h3>
                <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-mono font-bold">
                  {unpricedIssues.length} Awaiting pricing
                </span>
              </div>

              <div className="space-y-3 mt-4 overflow-y-auto max-h-[260px] p-2 bg-slate-50/80 rounded-2xl border border-slate-200">
                {unpricedIssues.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <CheckCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">All Queues Clean</div>
                    <p className="text-[11px] text-slate-500 mt-1 px-4 font-sans leading-normal">No customer requests requiring custom rate quotes at this time.</p>
                  </div>
                ) : (
                  unpricedIssues.map((issue) => {
                    const inputVal = pricingInputs[issue.id] || '';
                    return (
                      <div
                        key={issue.id}
                        className="bg-white border border-slate-200 p-3.5 rounded-xl flex justify-between items-center gap-4 hover:border-slate-300 shadow-xs font-sans"
                      >
                        <div className="min-w-0">
                          <span className="text-[9px] font-bold uppercase text-slate-700 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                            {issue.category} • {issue.urgency}
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-xs truncate mt-1.5">{issue.title}</h4>
                          <span className="text-[10px] text-slate-500">Proposed standard: ${config[`${issue.category}FixedPrice` as keyof SolBridksConfig] || 85}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg pl-2 pr-1.5 py-1 text-xs max-w-24">
                            <span className="text-slate-400 text-[10px] font-bold font-mono">$</span>
                            <input
                              type="number"
                              placeholder="Set Price"
                              value={inputVal}
                              onChange={(e) => handlePriceInput(issue.id, e.target.value)}
                              className="w-full bg-transparent text-slate-900 font-black font-sans text-xs text-center focus:outline-none"
                            />
                          </div>
                          <button
                            onClick={() => {
                              const priceNum = parseFloat(inputVal);
                              if (isNaN(priceNum) || priceNum <= 0) return;
                              onOperatorSetPrice(issue.id, priceNum);
                            }}
                            className="bg-[#0f172a] hover:bg-slate-900 text-white font-bold px-3 py-1.5 rounded-lg text-[10.5px] transition cursor-pointer"
                          >
                            Send Rate
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Core operating financials of the Platform (Calculated dynamically) */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex justify-between items-center text-xs shrink-0 mt-4">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold font-sans">HQ Gross Volume</div>
                <div className="text-sm font-black text-slate-900 font-mono mt-0.5">${totalCompletedGrossUSD.toFixed(1)} USD</div>
              </div>
              <div className="h-8 w-[1px] bg-slate-200" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold font-sans">15% Earned Fees</div>
                <div className="text-sm font-black text-emerald-700 font-mono mt-0.5">${totalCommittedFeesUSD.toFixed(1)} USD</div>
              </div>
              <div className="h-8 w-[1px] bg-slate-200" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold font-sans">Expert Disbursed</div>
                <div className="text-sm font-black text-slate-700 font-mono mt-0.5">${totalExpertPayoutsUSD.toFixed(1)} USD</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SPECIALISTS MANAGEMENT TAB */}
      {operatorTab === 'specialists' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in border-t-4 border-t-[#0f172a] font-sans">
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">Specialists Directory &amp; Verification Hub</h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">Manage technician credentials, verification status, bank routing details, and on-site service providers.</p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Specialist Name</th>
                  <th className="p-3">Industries &amp; Domains</th>
                  <th className="p-3">Dynamic Earnings</th>
                  <th className="p-3">Bank Account Details</th>
                  <th className="p-3">Verification State</th>
                  <th className="p-3 text-right">Administrative Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {experts.map(exp => {
                  const isEditing = editingExpertId === exp.id;
                  const domainsList = exp.domains && exp.domains.length > 0 ? exp.domains : exp.skills;
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition-all">
                      <td className="p-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editExpertName}
                            onChange={(e) => setEditExpertName(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-900 font-bold focus:outline-[#0f172a]"
                          />
                        ) : (
                          <div>
                            <span className="font-extrabold block text-sm text-slate-900">{exp.name}</span>
                            <span className="text-[10px] text-slate-500 block uppercase font-medium">{exp.skills.join(', ')}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {domainsList.map((d, i) => (
                            <span key={i} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-slate-200">
                              {d}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 font-mono font-black text-emerald-700 text-sm">
                        ${exp.totalEarnings}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={editExpertBank}
                              placeholder="Bank Title"
                              onChange={(e) => setEditExpertBank(e.target.value)}
                              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] block w-full focus:outline-[#0f172a]"
                            />
                             <input
                              type="text"
                              value={editExpertAccount}
                              placeholder="Account Number"
                              onChange={(e) => setEditExpertAccount(e.target.value)}
                              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] block w-full focus:outline-[#0f172a]"
                            />
                            <input
                              type="text"
                              value={editExpertRouting}
                              placeholder="Routing Number"
                              onChange={(e) => setEditExpertRouting(e.target.value)}
                              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] block w-full font-mono focus:outline-[#0f172a]"
                            />
                          </div>
                        ) : (
                          <div className="text-[11px] leading-relaxed">
                            <span className="text-slate-500 block text-[9.5px]">Inst: <strong className="text-slate-800">{exp.bankName || 'Standard reserve'}</strong></span>
                            <span className="text-slate-500 block text-[9.5px]">Acct: <strong className="text-slate-800">{exp.bankAccount || 'Not registered'}</strong></span>
                            <span className="text-slate-500 block text-[9.5px]">Route: <strong className="text-slate-800 font-mono">{exp.bankRouting || 'Not registered'}</strong></span>
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        {exp.isVerifiedByQA ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-bold uppercase">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />QA Certified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full font-bold uppercase">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />Pending QA Sign-off
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex flex-col sm:flex-row justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleVerification(exp.id)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase transition cursor-pointer ${exp.isVerifiedByQA ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200' : 'bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-600'}`}
                          >
                            {exp.isVerifiedByQA ? 'Revoke Certification' : 'Approve Specialist'}
                          </button>
                          
                          {isEditing ? (
                            <button
                              onClick={() => handleSaveExpertDetails(exp.id)}
                              className="bg-[#0f172a] hover:bg-slate-900 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer"
                            >
                              Save Details
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartEditExpert(exp)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-3 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer"
                            >
                              Edit Details
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteExpert(exp.id)}
                            className="bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 p-1.5 rounded-xl cursor-pointer"
                            title="Delete Specialist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CLIENT PORTFOLIO INDEX */}
      {operatorTab === 'clients' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in text-slate-800 border-t-4 border-t-[#0f172a]">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">Client Profiles</h3>
              <p className="text-xs text-slate-500 font-sans">HQ admin view for registered individual &amp; corporate client profiles.</p>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-1 rounded-full font-mono font-bold">Client Accounts</span>
          </div>

          <div id="operator-client-card" className="border border-slate-200 p-5 bg-slate-50/80 rounded-2xl space-y-4 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Client Login Email</span>
                <span className="text-xs font-extrabold text-slate-900 block font-mono">{clientProfile.email || 'Not registered'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Full Name</span>
                <span className="text-xs font-extrabold text-slate-900 block">{clientProfile.name || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Phone Number</span>
                <span className="text-xs font-extrabold text-slate-900 block">{clientProfile.phone || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Company / Organization</span>
                <span className="text-xs font-extrabold text-slate-900 block">{clientProfile.companyName || 'Individual Client'}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
              <div>
                <span className="text-[10.5px] font-bold text-slate-500 block">Account Registration Status</span>
                {clientProfile.isRegistered ? (
                  <span className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-bold uppercase mt-1">
                    ✓ Active Account
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full font-bold uppercase mt-1">
                    ⚠️ Guest / Unregistered
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleToggleClientRegistration}
                  className={`px-4 py-2 text-xs font-extrabold uppercase rounded-xl border cursor-pointer transition ${clientProfile.isRegistered ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100' : 'bg-[#0f172a] text-white hover:bg-slate-900'}`}
                >
                  {clientProfile.isRegistered ? 'Deactivate Account' : 'Activate Account'}
                </button>
                <button
                  onClick={() => {
                    const nextName = prompt("Edit client full name:", clientProfile.name);
                    const nextEmail = prompt("Edit client login email:", clientProfile.email);
                    const nextPhone = prompt("Edit contact phone number:", clientProfile.phone || '');
                    const nextCompany = prompt("Edit company/organization name (leave blank for Individual):", clientProfile.companyName || '');
                    if (nextName !== null && nextEmail !== null) {
                      handleSaveClientProfileDetails(nextName, nextEmail, nextPhone || '', nextCompany || '');
                    }
                  }}
                  className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-4 py-2 text-xs font-extrabold rounded-xl cursor-pointer shadow-xs"
                >
                  Edit Profile Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MASTER PORTFOLIO TICKET LEDGER TAB */}
      {operatorTab === 'tickets' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in text-slate-800 border-t-4 border-t-[#0f172a]">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">All Support Tickets</h3>
              <p className="text-xs text-slate-500 font-sans">Full administrative control to update status, adjust prices, send payouts, or delete tickets.</p>
            </div>
            <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider font-mono">ALL TICKETS</span>
          </div>

          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
            {issues.length === 0 ? (
              <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                <CheckCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold">No client tickets exist yet.</p>
              </div>
            ) : (
              issues.map(iss => {
                const isOverriding = editingIssueId === iss.id;
                return (
                  <div key={iss.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/80 space-y-4 shadow-sm font-sans">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-2 text-xs">
                      <div>
                        <span className="font-mono font-bold text-[10px] uppercase bg-slate-200 px-1.5 py-0.5 rounded text-slate-800">ID: {iss.id}</span>
                        <span className="text-slate-500 ml-2">Client ID: <strong>{iss.clientId}</strong> &bull; Specialist: <strong>{iss.expertId || 'unassigned'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9.5px] uppercase font-mono font-bold text-slate-600">Cycle State:</span>
                        <select
                          value={iss.status}
                          onChange={(e) => handleOverrideStatus(iss.id, e.target.value)}
                          className="bg-white border border-slate-200 rounded text-slate-900 text-[10.5px] font-bold px-2 py-1 outline-none font-mono focus:outline-[#0f172a]"
                        >
                          <option value="submitted">submitted</option>
                          <option value="priced">priced</option>
                          <option value="assigned">assigned</option>
                          <option value="en_route">en_route</option>
                          <option value="arrived">arrived</option>
                          <option value="diagnosed">diagnosed</option>
                          <option value="resolved">resolved</option>
                          <option value="completed">completed</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-5">
                        <span className="text-[10px] font-bold uppercase text-slate-700 font-mono bg-slate-200 px-1.5 py-0.5 rounded">{iss.category}</span>
                        <h4 className="font-black text-xs text-slate-900 mt-2">{iss.title}</h4>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{iss.description}</p>
                        
                        {/* Dynamic SLA tracker ledger view */}
                        <div className="mt-3 p-1 border border-slate-200 rounded-xl bg-white">
                          <TicketLifecycleTracker issue={iss} />
                        </div>
                      </div>

                      <div className="md:col-span-3 text-xs leading-relaxed space-y-1">
                        <div><span className="text-slate-500">Cleared Price:</span> <strong className="text-indigo-800">${iss.price || 0} USD</strong></div>
                        <div><span className="text-slate-500">Operator Fee (15%):</span> <strong className="text-slate-800 font-mono">${iss.operatorFee || 0}</strong></div>
                        <div><span className="text-slate-500">Expert Split (85%):</span> <strong className="text-emerald-700 font-mono">${iss.expertEarnings || 0}</strong></div>
                      </div>

                      <div className="md:col-span-4 text-right space-y-2">
                        {isOverriding ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <input
                              type="number"
                              value={editIssuePrice}
                              onChange={(e) => setEditIssuePrice(e.target.value)}
                              placeholder="Price"
                              className="bg-white border border-slate-200 rounded-lg text-xs px-2.5 py-1 w-20 text-center font-bold focus:outline-[#0f172a]"
                            />
                            <button
                              onClick={() => handleSaveIssuePrice(iss.id)}
                              className="bg-[#0f172a] hover:bg-slate-900 text-white text-[10.5px] font-black px-3 py-1 rounded-lg cursor-pointer"
                            >
                              Save Price
                            </button>
                            <button
                              onClick={() => setEditingIssueId(null)}
                              className="bg-slate-200 text-slate-800 text-[10.5px] font-black px-2.5 py-1 rounded-lg cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 justify-end">
                            <button
                              onClick={() => {
                                setOpenCommunicationsId(openCommunicationsId === iss.id ? null : iss.id);
                              }}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
                                openCommunicationsId === iss.id
                                  ? 'bg-[#0f172a] text-white border-[#0f172a]'
                                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                              }`}
                            >
                              {openCommunicationsId === iss.id ? 'Close Direct Console' : 'Secure Vault & Chat'}
                            </button>

                            <button
                              onClick={() => {
                                setEditingIssueId(iss.id);
                                setEditIssuePrice(String(iss.price || 0));
                              }}
                              className="bg-white hover:bg-slate-100 text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-200 cursor-pointer shadow-xs"
                            >
                              Modify Price
                            </button>
                            
                            {iss.status === 'payment_pending' && (
                              <button
                                onClick={() => handleForcePayoutAndSplit(iss.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg cursor-pointer shadow-xs"
                              >
                                Direct Deposit Settlement
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteIssue(iss.id)}
                              className="bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 p-1.5 rounded-lg cursor-pointer"
                              title="Delete Ticket Entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {openCommunicationsId === iss.id && (
                      <div className="pt-4 border-t border-slate-200 grid grid-cols-1 xl:grid-cols-2 gap-4 animate-fade-in p-4 bg-white rounded-2xl border border-dashed border-slate-200">
                        <TicketDocumentManager 
                          issueId={iss.id}
                          documents={iss.documents || []}
                          currentRole="operator"
                          currentUserName="HQ Command Admin"
                          onUploadDocument={onUploadDocument}
                          onDeleteDocument={onDeleteDocument}
                        />

                        <TicketChatConsole 
                          issue={iss}
                          currentRole="operator"
                          currentUserName="HQ Command Admin"
                          onSendMessage={onSendMessage}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

    </div>
  );
}
