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
    <div id="operator-dashboard-panel" className="space-y-6 text-[#3d4234]">
      
      {/* Admin Tabs Toolbar panel */}
      <div className="flex flex-wrap border-b border-[#e9e7df] gap-4 text-xs font-extrabold uppercase tracking-wider font-sans bg-white p-3 rounded-xl border">
        <button
          onClick={() => setOperatorTab('rates')}
          className={`px-3 py-1.5 rounded-lg transition-all ${operatorTab === 'rates' ? 'bg-[#5a5a40] text-white shadow' : 'text-[#8a8d81] hover:text-[#3d4234]'}`}
        >
          📈 Guidelines &amp; Fixed Rates
        </button>
        <button
          onClick={() => setOperatorTab('specialists')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${operatorTab === 'specialists' ? 'bg-[#0f172a] text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}
        >
          🛡️ Specialists ({experts.length})
        </button>
        <button
          onClick={() => setOperatorTab('clients')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${operatorTab === 'clients' ? 'bg-[#0f172a] text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}
        >
          👥 Clients
        </button>
        <button
          onClick={() => setOperatorTab('tickets')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${operatorTab === 'tickets' ? 'bg-[#0f172a] text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}
        >
          🎟️ Support Tickets ({issues.length})
        </button>
      </div>

      {operatorTab === 'rates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          {/* SolFixed Rate parameters (Left columns: 5) */}
          <div className="lg:col-span-5 bg-white border border-[#e9e7df] rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#e9e7df] pb-3 font-sans">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#3d4234] flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-[#5a5a40]" /> Guidelines &amp; Fixed Rates
              </h3>
              <span className="text-[9px] bg-[#f0f2ea] border border-[#dce0d1] px-2 py-0.5 rounded text-[#5a5a40] font-bold uppercase">
                HQ COMPLIANCE
              </span>
            </div>

            <form onSubmit={handleSaveRates} className="space-y-4 text-xs">
              <div className="space-y-2.5 font-sans">
                <div>
                  <label className="text-[#3d4234] font-semibold block mb-1">Hardware &amp; Electronics Rate ($)</label>
                  <div className="flex items-center bg-white border border-[#e9e7df] rounded-xl px-2.5 py-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-[#8a8d81]" />
                    <input
                      type="number"
                      value={hardwareRate}
                      onChange={(e) => setHardwareRate(Number(e.target.value))}
                      className="bg-transparent text-[#3d4234] font-semibold ml-1 focus:outline-none w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[#3d4234] font-semibold block mb-1">Software &amp; Web Solutions Rate ($)</label>
                  <div className="flex items-center bg-white border border-[#e9e7df] rounded-xl px-2.5 py-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-[#8a8d81]" />
                    <input
                      type="number"
                      value={softwareRate}
                      onChange={(e) => setSoftwareRate(Number(e.target.value))}
                      className="bg-transparent text-[#3d4234] font-semibold ml-1 focus:outline-none w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[#3d4234] font-semibold block mb-1">Telecom &amp; Networking Rate ($)</label>
                  <div className="flex items-center bg-white border border-[#e9e7df] rounded-xl px-2.5 py-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-[#8a8d81]" />
                    <input
                      type="number"
                      value={networkRate}
                      onChange={(e) => setNetworkRate(Number(e.target.value))}
                      className="bg-transparent text-[#3d4234] font-semibold ml-1 focus:outline-none w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#3d4234] font-semibold block mb-1">Cybersecurity Rate ($)</label>
                    <div className="flex items-center bg-white border border-[#e9e7df] rounded-xl px-2.5 py-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-[#8a8d81]" />
                      <input
                        type="number"
                        value={securityRate}
                        onChange={(e) => setSecurityRate(Number(e.target.value))}
                        className="bg-transparent text-[#3d4234] font-semibold ml-1 focus:outline-none w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[#3d4234] font-semibold block mb-1">Cloud &amp; AI Rate ($)</label>
                    <div className="flex items-center bg-white border border-[#e9e7df] rounded-xl px-2.5 py-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-[#8a8d81]" />
                      <input
                        type="number"
                        value={cloudRate}
                        onChange={(e) => setCloudRate(Number(e.target.value))}
                        className="bg-transparent text-[#3d4234] font-semibold ml-1 focus:outline-none w-full"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[#3d4234] font-bold block mb-1">Platform Commission Rate (%)</label>
                  <div className="flex items-center bg-[#f9f9f5] border border-green-300 rounded-xl px-2.5 py-1.5">
                    <Percent className="w-3.5 h-3.5 text-[#5a5a40] shrink-0" />
                    <input
                      type="number"
                      value={platformFee}
                      onChange={(e) => setPlatformFee(Number(e.target.value))}
                      className="bg-transparent text-[#3d4234] font-extrabold ml-1 focus:outline-none w-full font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#5a5a40] hover:bg-[#4a4a34] text-white font-extrabold py-2 px-4 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1 font-sans cursor-pointer"
              >
                {isSaved ? <Check className="w-4 h-4 text-white" /> : null}
                {isSaved ? 'Rates Saved Successfully' : 'Commit Fixed Rates'}
              </button>
            </form>
          </div>

          {/* Pending operator-priced items queue (7 columns) */}
          <div id="operator-queue" className="lg:col-span-7 bg-white border border-[#e9e7df] rounded-2xl p-5 flex flex-col justify-between h-[450px] shadow-sm">
            <div>
              <div className="flex items-center justify-between border-b border-[#e9e7df] pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#3d4234] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#5a5a40]" /> SolFixed Awaiting Rates
                </h3>
                <span className="text-[10px] bg-[#fdfcf8] text-yellow-800 border border-yellow-300 px-2 py-0.5 rounded font-mono font-bold">
                  {unpricedIssues.length} Awaiting pricing
                </span>
              </div>

              <div className="space-y-3 mt-4 overflow-y-auto max-h-[250px] p-1 bg-[#fdfcf8] rounded-xl border border-[#e9e7df] p-2">
                {unpricedIssues.length === 0 ? (
                  <div className="text-center py-16 text-[#8a8d81]">
                    <CheckCircle className="w-8 h-8 text-[#5a5a40]/40 mx-auto mb-2" />
                    <div className="text-xs font-bold text-[#3d4234] uppercase tracking-wider">All Queues Clean</div>
                    <p className="text-[10.5px] text-[#8a8d81] mt-1 px-4 font-sans leading-normal">No customer incidents requiring direct fixed operator rate estimates at this time.</p>
                  </div>
                ) : (
                  unpricedIssues.map((issue) => {
                    const inputVal = pricingInputs[issue.id] || '';
                    return (
                      <div
                        key={issue.id}
                        className="bg-white border border-[#f0eee6] p-3 rounded-xl flex justify-between items-center gap-4 hover:border-[#e9e7df] shadow-sm font-sans"
                      >
                        <div className="min-w-0">
                          <span className="text-[9px] font-bold uppercase text-[#5a5a40] font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                            {issue.category} • {issue.urgency}
                          </span>
                          <h4 className="font-extrabold text-[#2c3124] text-xs truncate mt-1.5">{issue.title}</h4>
                          <span className="text-[9.5px] text-[#8a8d81]">Proposed standard: ${config[`${issue.category}FixedPrice` as keyof SolBridksConfig] || 85}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center bg-white border border-[#e9e7df] rounded-lg pl-2 pr-1.5 py-1 text-xs max-w-24">
                            <span className="text-[#8a8d81] text-[10px] font-bold font-mono">$</span>
                            <input
                              type="number"
                              placeholder="Set Price"
                              value={inputVal}
                              onChange={(e) => handlePriceInput(issue.id, e.target.value)}
                              className="w-full bg-transparent text-[#3d4234] font-black font-sans text-xs text-center focus:outline-none"
                            />
                          </div>
                          <button
                            onClick={() => {
                              const priceNum = parseFloat(inputVal);
                              if (isNaN(priceNum) || priceNum <= 0) return;
                              onOperatorSetPrice(issue.id, priceNum);
                            }}
                            className="bg-[#5a5a40] hover:bg-[#4a4a34] text-white font-black px-2.5 py-1 rounded-lg text-[10px] transition cursor-pointer"
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
            <div className="bg-[#f9f9f5] border border-[#e9e7df] p-4 rounded-xl flex justify-between items-center text-xs shrink-0 mt-4">
              <div>
                <div className="text-[9.5px] text-[#8a8d81] uppercase font-bold font-sans">HQ Gross Volume</div>
                <div className="text-sm font-black text-[#2c3124] font-mono mt-0.5">${totalCompletedGrossUSD.toFixed(1)} USD</div>
              </div>
              <div className="h-8 w-[1px] bg-[#e9e7df]" />
              <div>
                <div className="text-[9.5px] text-[#8a8d81] uppercase font-bold font-sans">15% Earned Fees</div>
                <div className="text-sm font-black text-green-700 font-mono mt-0.5">${totalCommittedFeesUSD.toFixed(1)} USD</div>
              </div>
              <div className="h-8 w-[1px] bg-[#e9e7df]" />
              <div>
                <div className="text-[9.5px] text-[#8a8d81] uppercase font-bold font-sans">Expert Disbursed</div>
                <div className="text-sm font-black text-[#5a5a40] font-mono mt-0.5">${totalExpertPayoutsUSD.toFixed(1)} USD</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SPECIALISTS MANAGEMENT TAB */}
      {operatorTab === 'specialists' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in border-t-4 border-t-[#0f172a]">
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">Specialists Directory &amp; Verification Hub</h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">Manage technician credentials, verification status, bank routing details, and on-site service providers.</p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
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
              <tbody className="divide-y divide-[#e9e7df] font-sans">
                {experts.map(exp => {
                  const isEditing = editingExpertId === exp.id;
                  const domainsList = exp.domains && exp.domains.length > 0 ? exp.domains : exp.skills;
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50 transition-all">
                      <td className="p-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editExpertName}
                            onChange={(e) => setEditExpertName(e.target.value)}
                            className="bg-white border rounded px-2 py-1 text-xs text-[#3d4234] font-bold"
                          />
                        ) : (
                          <div>
                            <span className="font-extrabold block text-sm text-[#2c3124]">{exp.name}</span>
                            <span className="text-[10px] text-[#8a8d81] block uppercase">{exp.skills.join(', ')}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {domainsList.map((d, i) => (
                            <span key={i} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                              {d}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 font-mono font-black text-[#5a5a40]">
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
                              className="bg-white border rounded px-1.5 py-0.5 text-[11px] block w-full"
                            />
                             <input
                              type="text"
                              value={editExpertAccount}
                              placeholder="Account Number"
                              onChange={(e) => setEditExpertAccount(e.target.value)}
                              className="bg-white border rounded px-1.5 py-0.5 text-[11px] block w-full"
                            />
                            <input
                              type="text"
                              value={editExpertRouting}
                              placeholder="Routing Number"
                              onChange={(e) => setEditExpertRouting(e.target.value)}
                              className="bg-white border rounded px-1.5 py-0.5 text-[11px] block w-full font-mono"
                            />
                          </div>
                        ) : (
                          <div className="text-[11px] leading-relaxed">
                            <span className="text-[#8a8d81] block text-[9.5px]">Inst: <strong className="text-slate-800">{exp.bankName || 'Standard reserve'}</strong></span>
                            <span className="text-[#8a8d81] block text-[9.5px]">Acct: <strong className="text-slate-800">{exp.bankAccount || 'Not registered'}</strong></span>
                            <span className="text-[#8a8d81] block text-[9.5px]">Route: <strong className="text-slate-800 font-mono">{exp.bankRouting || 'Not registered'}</strong></span>
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        {exp.isVerifiedByQA ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-bold uppercase">
                            <ShieldCheck className="w-3.5 h-3.5" />QA Certified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-yellow-50 text-yellow-700 border border-yellow-200 px-2.5 py-1 rounded-full font-bold uppercase">
                            <AlertTriangle className="w-3.5 h-3.5" />Pending QA Sign-off
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex flex-col sm:flex-row justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleVerification(exp.id)}
                            className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase transition cursor-pointer ${exp.isVerifiedByQA ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' : 'bg-green-600 text-white hover:bg-green-700 border'}`}
                          >
                            {exp.isVerifiedByQA ? 'Revoke Certification' : 'Approve Specialist'}
                          </button>
                          
                          {isEditing ? (
                            <button
                              onClick={() => handleSaveExpertDetails(exp.id)}
                              className="bg-[#0f172a] hover:bg-slate-900 text-white px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer"
                            >
                              Save Details
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartEditExpert(exp)}
                              className="bg-slate-200 hover:bg-slate-300 text-[#3d4234] px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
                            >
                              Edit Details
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteExpert(exp.id)}
                            className="bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 p-1 rounded cursor-pointer"
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
        <div className="bg-white border border-[#e9e7df] rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in text-[#3d4234]">
          <div className="flex items-center justify-between border-b border-[#e9e7df] pb-3">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#3d4234]">Clients Ledger</h3>
              <p className="text-xs text-[#8a8d81] font-sans">HQ Master Admin portfolio access to registered individual &amp; corporate client profiles.</p>
            </div>
            <span className="text-[10px] bg-[#f0f2ea] text-slate-800 border border-[#dce0d1] px-2 py-1 rounded font-mono font-bold">Client Accounts Record</span>
          </div>

          <div id="operator-client-card" className="border border-[#e9e7df] p-5 bg-[#f9f9f5] rounded-2xl space-y-4 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-3 border-b border-[#e9e7df]">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Client Login ID / Email</span>
                <span className="text-xs font-extrabold text-slate-900 block font-mono">{clientProfile.email || 'Not registered'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Full Name</span>
                <span className="text-xs font-extrabold text-slate-900 block">{clientProfile.name || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Contact Phone Number</span>
                <span className="text-xs font-extrabold text-slate-900 block">{clientProfile.phone || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Organization / Corporate</span>
                <span className="text-xs font-extrabold text-slate-900 block">{clientProfile.companyName || 'Individual Client'}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
              <div>
                <span className="text-[10.5px] font-bold text-slate-500 block">Registration &amp; Authorization State</span>
                {clientProfile.isRegistered ? (
                  <span className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-bold uppercase mt-1">
                    ✓ Active Member (Verified)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full font-bold uppercase mt-1">
                    ⚠️ Guest / Unregistered State
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleToggleClientRegistration}
                  className={`px-3.5 py-2 text-xs font-extrabold uppercase rounded-xl border cursor-pointer transition ${clientProfile.isRegistered ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100' : 'bg-[#0f172a] text-white hover:bg-slate-900'}`}
                >
                  {clientProfile.isRegistered ? 'Deregister Client' : 'Manually Register Client'}
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
                  className="bg-white hover:bg-slate-100 text-[#3d4234] border border-[#e9e7df] px-3.5 py-2 text-xs font-extrabold rounded-xl cursor-pointer shadow-xs"
                >
                  Modify Credentials
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MASTER PORTFOLIO TICKET LEDGER TAB */}
      {operatorTab === 'tickets' && (
        <div className="bg-white border border-[#e9e7df] rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in text-[#3d4234]">
          <div className="flex justify-between items-center border-b border-[#e9e7df] pb-3">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">Support Tickets Overview</h3>
              <p className="text-xs text-slate-500 font-sans">Full administrative authority to override lifecycles, edit invoice structures, force disbursements, or delete tickets.</p>
            </div>
            <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider font-mono">MASTER LEDGER RECORD</span>
          </div>

          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
            {issues.length === 0 ? (
              <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                <CheckCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold">No registered client tickets exist on the system portfolio.</p>
              </div>
            ) : (
              issues.map(iss => {
                const isOverriding = editingIssueId === iss.id;
                return (
                  <div key={iss.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-4 shadow-sm font-sans">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-2 text-xs">
                      <div>
                        <span className="font-mono font-bold text-[10px] uppercase bg-slate-200 px-1.5 py-0.5 rounded text-slate-800">ID: {iss.id}</span>
                        <span className="text-slate-500 ml-2">Client ID: <strong>{iss.clientId}</strong> &bull; Specialist: <strong>{iss.expertId || 'unassigned'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9.5px] uppercase font-mono font-bold text-[#5a5a40]">Cycle State:</span>
                        <select
                          value={iss.status}
                          onChange={(e) => handleOverrideStatus(iss.id, e.target.value)}
                          className="bg-white border rounded text-[#3d4234] text-[10.5px] font-bold px-1.5 py-0.5 outline-none font-mono"
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
                        <span className="text-[10px] font-bold uppercase text-[#5a5a40] font-mono bg-slate-200 px-1.5 py-0.5 rounded">{iss.category}</span>
                        <h4 className="font-black text-xs text-[#2c3124] mt-2">{iss.title}</h4>
                        <p className="text-xs text-[#5a5a40] mt-1 line-clamp-2">{iss.description}</p>
                        
                        {/* Dynamic SLA tracker ledger view */}
                        <div className="mt-3 p-1 border border-[#f0eee6] rounded-xl bg-white">
                          <TicketLifecycleTracker issue={iss} />
                        </div>
                      </div>

                      <div className="md:col-span-3 text-xs leading-relaxed space-y-1">
                        <div><span className="text-[#8a8d81]">Cleared Price:</span> <strong className="text-indigo-800">${iss.price || 0} USD</strong></div>
                        <div><span className="text-[#8a8d81]">Operator Fee (15%):</span> <strong className="text-[#3d4234] font-mono">${iss.operatorFee || 0}</strong></div>
                        <div><span className="text-[#8a8d81]">Expert Split (85%):</span> <strong className="text-green-700 font-mono">${iss.expertEarnings || 0}</strong></div>
                      </div>

                      <div className="md:col-span-4 text-right space-y-2">
                        {isOverriding ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <input
                              type="number"
                              value={editIssuePrice}
                              onChange={(e) => setEditIssuePrice(e.target.value)}
                              placeholder="Price"
                              className="bg-white border rounded text-xs px-2 py-1 w-20 text-center font-bold"
                            />
                            <button
                              onClick={() => handleSaveIssuePrice(iss.id)}
                              className="bg-[#5a5a40] hover:bg-[#4a4a34] text-white text-[10.5px] font-black px-2 py-1 rounded"
                            >
                              Save Price
                            </button>
                            <button
                              onClick={() => setEditingIssueId(null)}
                              className="bg-slate-300 text-[#3d4234] text-[10.5px] font-black px-2 py-1 rounded"
                            >
                              x
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
                                  ? 'bg-[#5a5a40] text-white border-[#5a5a40]'
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
                              className="bg-slate-200 hover:bg-slate-300 text-[#3d4234] text-[10px] font-bold px-2 py-1 rounded-lg border border-[#e9e7df] cursor-pointer"
                            >
                              Modify Price
                            </button>
                            
                            {iss.status === 'payment_pending' && (
                              <button
                                onClick={() => handleForcePayoutAndSplit(iss.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg cursor-pointer"
                              >
                                Direct Deposit Settlement
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteIssue(iss.id)}
                              className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 p-1 rounded-lg cursor-pointer"
                              title="Delete Ticket Entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {openCommunicationsId === iss.id && (
                      <div className="pt-4 border-t border-[#e9e7df] grid grid-cols-1 xl:grid-cols-2 gap-4 animate-fade-in p-4 bg-slate-50/50 rounded-2xl border border-dashed border-[#e9e7df]">
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
