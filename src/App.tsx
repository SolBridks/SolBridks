import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ClientDashboard from './components/ClientDashboard';
import ExpertDashboard from './components/ExpertDashboard';
import OperatorDashboard from './components/OperatorDashboard';
import PaymentForm from './components/PaymentForm';
import OutboundNotificationLogs from './components/OutboundNotificationLogs';
import { 
  UserRole, 
  ITIssue, 
  ExpertProfile, 
  ClientProfile,
  SolBridksConfig,
  IssueStatus,
  NotificationLog,
  TicketDocument,
  ChatMessage
} from './types';
import { 
  getSolBridksConfig, 
  saveSolBridksConfig, 
  getExperts, 
  saveExperts, 
  getIssues, 
  saveIssues,
  getClientProfile,
  saveClientProfile,
  getClients,
  saveClients,
  calculateRoute,
  generateSustainabilityEcoStats,
  getNotifications,
  saveNotifications
} from './utils/storage';
import { 
  Compass, 
  ShieldCheck, 
  MessageSquare, 
  Globe, 
  Tv, 
  Smartphone, 
  Zap, 
  X,
  PlusCircle,
  HelpCircle,
  TrendingDown,
  Lock
} from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('client');
  const [isHqAuthenticated, setIsHqAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPasskey, setAuthPasskey] = useState('');
  const [authError, setAuthError] = useState('');

  const [config, setConfig] = useState<SolBridksConfig>(getSolBridksConfig());
  const [experts, setExperts] = useState<ExpertProfile[]>(getExperts());
  const [issues, setIssues] = useState<ITIssue[]>(getIssues());
  const [clientProfile, setClientProfile] = useState<ClientProfile>(getClientProfile());
  const [clients, setClients] = useState<ClientProfile[]>(getClients());

  const handleSelectClient = (clientId: string) => {
    const selected = clients.find(c => c.id === clientId);
    if (selected) {
      setClientProfile(selected);
      saveClientProfile(selected);
    }
  };
  const [notifications, setNotifications] = useState<NotificationLog[]>(getNotifications());
  
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [selectedExpertId, setSelectedExpertId] = useState<string | null>(null);
  const [showPaymentPortal, setShowPaymentPortal] = useState(false);

  const updateNotificationsState = (newLogs: NotificationLog[]) => {
    setNotifications(newLogs);
    saveNotifications(newLogs);
  };

  const triggerNotificationsOnStatusChange = (
    issue: ITIssue,
    status: IssueStatus,
    optionalExpertName?: string,
    optionalExpertId?: string
  ) => {
    const ts = new Date().toISOString();
    const cleanId = issue.id.toUpperCase().replace('ISSUE_', '#');
    const newAlerts: NotificationLog[] = [];

    // Party 1: Client
    const clientEmail = clientProfile.isRegistered ? clientProfile.email : (issue.clientEmail || 's.jenkins@ecooffice.com');
    const clientPhone = clientProfile.isRegistered ? clientProfile.phone : '+1 (555) 303-4929';
    const clientName = clientProfile.isRegistered ? clientProfile.name : 'Sarah Jenkins';

    // Party 2: Tech Expert / Specialist
    const activeExpId = optionalExpertId || issue.expertId;
    const exp = experts.find(e => e.id === activeExpId);
    const expEmail = exp?.email || 'expert@solbridks.net';
    const expName = optionalExpertName || exp?.name || 'Technical Specialist';
    const expPhone = '+1 (555) 404-9281';

    // Party 3: HQ Control Room
    const hqEmail = 'ops-room@solbridks-systems.com';
    const hqPhone = '+1 (800) 555-0199';

    if (status === 'submitted') {
      newAlerts.push({
        id: `notif_${Date.now()}_c_e`,
        timestamp: ts,
        recipientRole: 'client',
        recipientName: clientName,
        recipientContact: clientEmail,
        channel: 'email',
        subject: `[SMTP Relay] Ticket ${cleanId} Registered Successfully`,
        body: `Dear ${clientName}, your support ticket "${issue.title}" has been safely archived in our queue. A designated HQ operator is appraising standard commercial rates now.`,
        status: 'delivered'
      });
      newAlerts.push({
        id: `notif_${Date.now()}_c_m`,
        timestamp: ts,
        recipientRole: 'client',
        recipientName: clientName,
        recipientContact: clientPhone,
        channel: 'sms',
        subject: `SLA Alert: Ticket Registered`,
        body: `SolBridks Gateway: Support Ticket ${cleanId} has been successfully lodged in the master system queue. SLA active.`,
        status: 'delivered'
      });
      newAlerts.push({
        id: `notif_${Date.now()}_o_e`,
        timestamp: ts,
        recipientRole: 'operator',
        recipientName: 'HQ Operations Team',
        recipientContact: hqEmail,
        channel: 'email',
        subject: `[HQ Dispatch System] New Support Ticket Registered: ${cleanId}`,
        body: `A new client contract request has been lodged: "${issue.title}". Category: ${issue.category.toUpperCase()} | Urgency: ${issue.urgency.toUpperCase()}. Please configure fixed pricing or open standard bidding channels.`,
        status: 'delivered'
      });
    } 
    else if (status === 'priced') {
      newAlerts.push({
        id: `notif_${Date.now()}_c_e`,
        timestamp: ts,
        recipientRole: 'client',
        recipientName: clientName,
        recipientContact: clientEmail,
        channel: 'email',
        subject: `[SMTP] SLA Proposal Quoted for ${cleanId}`,
        body: `Dear ${clientName}, pricing for your ticket "${issue.title}" has been structured at $${issue.price}. Registered specialists are now invited to lock the contract and dispatch on-site.`,
        status: 'delivered'
      });
      newAlerts.push({
        id: `notif_${Date.now()}_o_m`,
        timestamp: ts,
        recipientRole: 'operator',
        recipientName: 'HQ Controller',
        recipientContact: hqPhone,
        channel: 'sms',
        subject: `Ticket Pricing Settled`,
        body: `SolBridks HQ: Ticket ${cleanId} price approved at $${issue.price}. Active catalog published to specialist nodes.`,
        status: 'delivered'
      });
    }
    else if (status === 'assigned') {
      newAlerts.push({
        id: `notif_${Date.now()}_c_m`,
        timestamp: ts,
        recipientRole: 'client',
        recipientName: clientName,
        recipientContact: clientPhone,
        channel: 'sms',
        subject: `Specialist Assigned`,
        body: `SolBridks Dispatch: Great news! Technical Specialist ${expName} has locked your Ticket ${cleanId}. They are preparing vehicles and equipment for dispatch.`,
        status: 'delivered'
      });
      newAlerts.push({
        id: `notif_${Date.now()}_e_e`,
        timestamp: ts,
        recipientRole: 'expert',
        recipientName: expName,
        recipientContact: expEmail,
        channel: 'email',
        subject: `[SLA Assignment] Support Contract Confirmed: ${cleanId}`,
        body: `Hello ${expName}, you have successfully locked Ticket ${cleanId} ("${issue.title}"). Standard payout of $${issue.expertEarnings} guaranteed upon successful validation. Please review client address.`,
        status: 'delivered'
      });
      newAlerts.push({
        id: `notif_${Date.now()}_e_m`,
        timestamp: ts,
        recipientRole: 'expert',
        recipientName: expName,
        recipientContact: expPhone,
        channel: 'sms',
        subject: `SLA Dispatch Confirmed`,
        body: `SolBridks Expert: Contract locked! Proceed to client site for ${cleanId}. GPS tracker is active on your portal.`,
        status: 'delivered'
      });
      newAlerts.push({
        id: `notif_${Date.now()}_o_e`,
        timestamp: ts,
        recipientRole: 'operator',
        recipientName: 'HQ Controller',
        recipientContact: hqEmail,
        channel: 'email',
        subject: `[HQ Hub] Ticket Assigned to ${expName}: ${cleanId}`,
        body: `Audit Log: Ticket ${cleanId} accepted by verified specialist ${expName} (ID: ${activeExpId}). Payout ledger pending verification.`,
        status: 'delivered'
      });
    }
    else if (status === 'dispatched') {
      newAlerts.push({
        id: `notif_${Date.now()}_c_m`,
        timestamp: ts,
        recipientRole: 'client',
        recipientName: clientName,
        recipientContact: clientPhone,
        channel: 'sms',
        subject: `In Transit Tracker`,
        body: `SolBridks In-Transit: Specialist ${expName} has completed packaging diagnostic toolkits and is moving towards your premises. SLA clock ticking.`,
        status: 'delivered'
      });
      newAlerts.push({
        id: `notif_${Date.now()}_e_m`,
        timestamp: ts,
        recipientRole: 'expert',
        recipientName: expName,
        recipientContact: expPhone,
        channel: 'sms',
        subject: `Telemetry Tracker active`,
        body: `SolBridks System: Live dispatch route tracking active. Maintain vehicle speed.`,
        status: 'delivered'
      });
      newAlerts.push({
        id: `notif_${Date.now()}_o_m`,
        timestamp: ts,
        recipientRole: 'operator',
        recipientName: 'HQ Controller',
        recipientContact: hqPhone,
        channel: 'sms',
        subject: `Specialist Dispatched`,
        body: `SolBridks HQ: Technical Specialist ${expName} initiated in-transit step sequence on Ticket ${cleanId}.`,
        status: 'delivered'
      });
    }
    else if (status === 'arrived') {
      newAlerts.push({
        id: `notif_${Date.now()}_c_e`,
        timestamp: ts,
        recipientRole: 'client',
        recipientName: clientName,
        recipientContact: clientEmail,
        channel: 'email',
        subject: `[SMTP] Specialist Arrived on Premise: ${cleanId}`,
        body: `Dear ${clientName}, specialist ${expName} has arrived on coordinates. Initial diagnostic equipment profiling is starting.`,
        status: 'delivered'
      });
      newAlerts.push({
        id: `notif_${Date.now()}_c_m`,
        timestamp: ts,
        recipientRole: 'client',
        recipientName: clientName,
        recipientContact: clientPhone,
        channel: 'sms',
        subject: `Specialist Arrived`,
        body: `SolBridks Alert: Specialist ${expName} has successfully arrived on site and established diagnostics.`,
        status: 'delivered'
      });
      newAlerts.push({
        id: `notif_${Date.now()}_e_m`,
        timestamp: ts,
        recipientRole: 'expert',
        recipientName: expName,
        recipientContact: expPhone,
        channel: 'sms',
        subject: `Telemetry: Arrived`,
        body: `SolBridks Expert: GPS confirmed arrival on client premises. Standard diagnostic logs enabled.`,
        status: 'delivered'
      });
      newAlerts.push({
        id: `notif_${Date.now()}_o_m`,
        timestamp: ts,
        recipientRole: 'operator',
        recipientName: 'HQ Controller',
        recipientContact: hqPhone,
        channel: 'sms',
        subject: `Specialist On-Site`,
        body: `SolBridks HQ: Specialist ${expName} checked in on site for Ticket ${cleanId}. SLA status met.`,
        status: 'delivered'
      });
    }
    else if (status === 'resolving') {
      newAlerts.push({
        id: `notif_${Date.now()}_c_m`,
        timestamp: ts,
        recipientRole: 'client',
        recipientName: clientName,
        recipientContact: clientPhone,
        channel: 'sms',
        subject: `Resolution Started`,
        body: `SolBridks Progress: Active technical restoration under way for Ticket ${cleanId}. Checking software dependencies/modem configs.`,
        status: 'delivered'
      });
      newAlerts.push({
        id: `notif_${Date.now()}_e_e`,
        timestamp: ts,
        recipientRole: 'expert',
        recipientName: expName,
        recipientContact: expEmail,
        channel: 'email',
        subject: `[Diagnostic Gateway] Resolution Session Logged: ${cleanId}`,
        body: `Hello ${expName}, recovery systems session logged. Ensure detailed hardware settings are fully patched before sending resolution audit reports.`,
        status: 'delivered'
      });
    }
    else if (status === 'payment_pending') {
      newAlerts.push({
        id: `notif_${Date.now()}_c_e`,
        timestamp: ts,
        recipientRole: 'client',
        recipientName: clientName,
        recipientContact: clientEmail,
        channel: 'email',
        subject: `[Action Required] SLA Resolution Signed & Ready: ${cleanId}`,
        body: `Dear ${clientName}, specialist ${expName} has completed all on-site repairs and signed off standard telemetry checks. Please proceed to the payment portal to clear the ledger.`,
        status: 'delivered'
      });
      newAlerts.push({
        id: `notif_${Date.now()}_c_m`,
        timestamp: ts,
        recipientRole: 'client',
        recipientName: clientName,
        recipientContact: clientPhone,
        channel: 'sms',
        subject: `Action Required: Pay Invoice`,
        body: `SolBridks SLA: Technical work resolved! Please lock standard secure checkout of $${issue.price} to complete Ticket ${cleanId}.`,
        status: 'delivered'
      });
      newAlerts.push({
        id: `notif_${Date.now()}_e_m`,
        timestamp: ts,
        recipientRole: 'expert',
        recipientName: expName,
        recipientContact: expPhone,
        channel: 'sms',
        subject: `Pending invoice approval`,
        body: `SolBridks System: Great job! Diagnostic session closed. Outstanding payout $${issue.expertEarnings} is queued pending client payment clearance.`,
        status: 'delivered'
      });
      newAlerts.push({
        id: `notif_${Date.now()}_o_m`,
        timestamp: ts,
        recipientRole: 'operator',
        recipientName: 'HQ Controller',
        recipientContact: hqPhone,
        channel: 'sms',
        subject: `Work Signed Off`,
        body: `SolBridks HQ: Ticket ${cleanId} work completed. Client ${clientName} has been prompted to authorize payout settlement.`,
        status: 'delivered'
      });
    }
    else if (status === 'completed') {
      newAlerts.push({
        id: `notif_${Date.now()}_c_e`,
        timestamp: ts,
        recipientRole: 'client',
        recipientName: clientName,
        recipientContact: clientEmail,
        channel: 'email',
        subject: `[SMTP Relay] Secure Receipt & 90-Day Warranty: ${cleanId}`,
        body: `Dear ${clientName}, secure payout of $${issue.price} settled via SolBridks Corporate Check. Your system SLA report has been archived. A 90-day extended coverage warranty is now active on your node.`,
        status: 'delivered'
      });
      newAlerts.push({
        id: `notif_${Date.now()}_e_e`,
        timestamp: ts,
        recipientRole: 'expert',
        recipientName: expName,
        recipientContact: expEmail,
        channel: 'email',
        subject: `[Payout Disbursed] Bank Deposit Confirmed: ${cleanId}`,
        body: `Hello ${expName}, secure clearance approved! $${issue.expertEarnings} has been wire-routed directly to your verified bank account: ${exp?.bankName || 'Sol Alliance Savings'} (${exp?.bankAccount || '*******5032'}). Thank you for your expert assistance.`,
        status: 'delivered'
      });
      newAlerts.push({
        id: `notif_${Date.now()}_e_m`,
        timestamp: ts,
        recipientRole: 'expert',
        recipientName: expName,
        recipientContact: expPhone,
        channel: 'sms',
        subject: `Payout Cleared!`,
        body: `SolBridks: Payout of $${issue.expertEarnings} has been deposited to your corporate bank account. Well done!`,
        status: 'delivered'
      });
      newAlerts.push({
        id: `notif_${Date.now()}_o_m`,
        timestamp: ts,
        recipientRole: 'operator',
        recipientName: 'HQ Controller',
        recipientContact: hqPhone,
        channel: 'sms',
        subject: `Ledger Settled`,
        body: `SolBridks HQ: Ticket ${cleanId} fully settled. Platform fee of $${issue.operatorFee} posted to ledger.`,
        status: 'delivered'
      });
    }

    if (newAlerts.length > 0) {
      updateNotificationsState([...newAlerts, ...notifications]);
    }
  };

  // Auto select appropriate default nodes to improve testability
  useEffect(() => {
    if (issues.length > 0 && !selectedIssueId) {
      setSelectedIssueId(issues[0].id);
    }
    // Deactivated auto-expert selection to enforce private specialist node isolation
    // if (experts.length > 0 && !selectedExpertId) {
    //   setSelectedExpertId(experts[0].id);
    // }
  }, [issues, experts]);

  // Sync state to LocalStorage
  const updateConfigState = (newConfig: SolBridksConfig) => {
    setConfig(newConfig);
    saveSolBridksConfig(newConfig);
  };

  const updateExpertsState = (newExperts: ExpertProfile[]) => {
    setExperts(newExperts);
    saveExperts(newExperts);
  };

  const updateIssuesState = (newIssues: ITIssue[]) => {
    setIssues(newIssues);
    saveIssues(newIssues);
  };

  const updateClientProfileState = (newProfile: ClientProfile) => {
    setClientProfile(newProfile);
    saveClientProfile(newProfile);

    // Sync client registration status inside the selectable list
    if (newProfile.isRegistered) {
      const exists = clients.some(c => c.id === newProfile.id);
      let nextClients: ClientProfile[];
      if (exists) {
        nextClients = clients.map(c => c.id === newProfile.id ? newProfile : c);
      } else {
        nextClients = [...clients, newProfile];
      }
      setClients(nextClients);
      saveClients(nextClients);
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
  };

  const handleUploadDocument = (issueId: string, doc: any) => {
    const nextIssues = issues.map(iss => {
      if (iss.id === issueId) {
        return {
          ...iss,
          documents: [doc, ...(iss.documents || [])]
        };
      }
      return iss;
    });
    updateIssuesState(nextIssues);
  };

  const handleDeleteDocument = (issueId: string, docId: string) => {
    const nextIssues = issues.map(iss => {
      if (iss.id === issueId) {
        return {
          ...iss,
          documents: (iss.documents || []).filter(d => d.id !== docId)
        };
      }
      return iss;
    });
    updateIssuesState(nextIssues);
  };

  const handleSendMessage = (issueId: string, msg: any) => {
    const nextIssues = issues.map(iss => {
      if (iss.id === issueId) {
        return {
          ...iss,
          chatMessages: [...(iss.chatMessages || []), msg]
        };
      }
      return iss;
    });
    updateIssuesState(nextIssues);
  };

  // CLIENT HANDLERS
  const handleCreateIssue = (newData: {
    title: string;
    description: string;
    category: 'hardware' | 'software' | 'network' | 'security' | 'cloud';
    urgency: 'low' | 'medium' | 'high' | 'critical';
    pricingMethod: 'operator_fixed' | 'expert_bid';
    clientLat: number;
    clientLng: number;
    documents?: TicketDocument[];
  }) => {
    const id = `issue_${Date.now()}`;
    const eco = generateSustainabilityEcoStats(newData.category, newData.description, newData.urgency);
    
    // Determine initial price if operator_fixed, else pending (0)
    let initialPrice = 0;
    if (newData.pricingMethod === 'operator_fixed') {
      const fixedPriceKey = `${newData.category}FixedPrice` as keyof SolBridksConfig;
      initialPrice = Number(config[fixedPriceKey]) || 85;
    }

    const operatorFee = Number((initialPrice * config.platformFeeRate).toFixed(1));
    const expertEarnings = initialPrice - operatorFee;

    const newIssue: ITIssue = {
      id,
      clientId: clientProfile.id || 'client_usr',
      clientName: clientProfile.isRegistered 
        ? `${clientProfile.name} (${clientProfile.companyName})` 
        : 'Sarah Jenkins (EcoOffice Corp)',
      clientEmail: clientProfile.isRegistered ? clientProfile.email : divEmail,
      title: newData.title,
      description: newData.description,
      category: newData.category,
      urgency: newData.urgency,
      status: newData.pricingMethod === 'operator_fixed' ? 'priced' : 'submitted',
      pricingMethod: newData.pricingMethod,
      price: initialPrice,
      operatorFee,
      expertEarnings,
      clientLat: newData.clientLat,
      clientLng: newData.clientLng,
      wasteAvoidedKg: eco.wasteAvoidedKg,
      co2SavedKg: eco.co2SavedKg,
      lifespanExtendedMonths: eco.lifespanExtendedMonths,
      createdAt: new Date().toISOString(),
      documents: newData.documents || [],
      chatMessages: []
    };

    const nextIssues = [newIssue, ...issues];
    updateIssuesState(nextIssues);
    setSelectedIssueId(id);
    
    // Trigger initial notification alert sequence
    triggerNotificationsOnStatusChange(newIssue, newIssue.status);
  };

  const handleDeleteIssue = (id: string) => {
    const nextIssues = issues.filter(i => i.id !== id);
    updateIssuesState(nextIssues);
    if (selectedIssueId === id) {
      setSelectedIssueId(nextIssues[0]?.id || null);
    }
  };

  // EXPERT HANDLERS
  const handleRegisterExpert = (newData: {
    name: string;
    email: string;
    skills: string[];
    vehicleType: 'electric-bike' | 'public-transit' | 'ev' | 'hybrid';
    bankName: string;
    bankAccount: string;
    bankRouting: string;
  }) => {
    const id = `exp_${Date.now()}`;
    // Assign random coordinate in grid boundary
    const lat = 15 + Math.random() * 70;
    const lng = 15 + Math.random() * 70;

    const newExpert: ExpertProfile = {
      id,
      name: newData.name,
      email: newData.email,
      skills: newData.skills,
      vehicleType: newData.vehicleType,
      rating: 5.5,
      totalResolved: 0,
      totalEarnings: 0,
      co2SavedTotal: 0,
      isAvailable: true,
      currentLat: lat,
      currentLng: lng,
      isVerifiedByQA: false, // Default is false, requires Operator/QA confirmation to accept tickets!
      bankName: newData.bankName,
      bankAccount: newData.bankAccount,
      bankRouting: newData.bankRouting,
    };

    const nextExperts = [...experts, newExpert];
    updateExpertsState(nextExperts);
    setSelectedExpertId(id);
  };

  // Expert accepts issue
  const handleAcceptIssue = (issueId: string, bidPrice?: number) => {
    const expert = experts.find(e => e.id === selectedExpertId);
    if (!expert) return;

    let updatedIssue: ITIssue | null = null;
    const nextIssues = issues.map((issue) => {
      if (issue.id === issueId) {
        const finalPrice = bidPrice !== undefined ? bidPrice : issue.price;
        const operatorFee = Number((finalPrice * config.platformFeeRate).toFixed(1));
        const expertEarnings = finalPrice - operatorFee;

        // Calculate visual route from expert current location to client location on the map
        const route = calculateRoute(
          expert.currentLat,
          expert.currentLng,
          issue.clientLat,
          issue.clientLng,
          10
        );

        updatedIssue = {
          ...issue,
          status: 'assigned' as const,
          expertId: expert.id,
          expertName: expert.name,
          price: finalPrice,
          operatorFee,
          expertEarnings,
          expertLat: expert.currentLat,
          expertLng: expert.currentLng,
          routeCoordinates: route,
          activeStepIndex: 0,
          assignedAt: new Date().toISOString(),
        };
        return updatedIssue;
      }
      return issue;
    });

    updateIssuesState(nextIssues);
    if (updatedIssue) {
      triggerNotificationsOnStatusChange(updatedIssue, 'assigned');
    }
  };

  const handleSubmitExpertBid = (issueId: string, bidPrice: number) => {
    const expert = experts.find(e => e.id === selectedExpertId);
    if (!expert) return;

    const nextIssues = issues.map((issue) => {
      if (issue.id === issueId) {
        return {
          ...issue,
          bidPrice,
          bidStatus: 'expert_submitted' as const,
          bidExpertId: expert.id,
          bidExpertName: expert.name,
          bidExpertAvatar: expert.vehicleType
        };
      }
      return issue;
    });
    updateIssuesState(nextIssues);

    const updated = nextIssues.find(i => i.id === issueId);
    if (updated) {
      const email = clientProfile.isRegistered ? clientProfile.email : divEmail;
      const newAlert: NotificationLog = {
        id: `alert_${Date.now()}`,
        timestamp: new Date().toISOString(),
        recipientRole: 'client',
        recipientName: updated.clientName,
        recipientContact: email,
        channel: 'email',
        subject: `[Bidding Alert] Tech Specialist submitted a Bid of $${bidPrice}`,
        body: `Technical Expert ${expert.name} submitted a bid quote of $${bidPrice} for your ticket "${updated.title}". Please accept, counter, or switch to SolFixed contract pricing.`,
        status: 'sent'
      };
      updateNotificationsState([newAlert, ...notifications]);
    }
  };

  const handleClientRespondBid = (issueId: string, action: 'accept' | 'fixed' | 'counter', counterPrice?: number) => {
    let updatedIssue: ITIssue | null = null;
    const nextIssues = issues.map((issue) => {
      if (issue.id === issueId) {
        if (action === 'accept') {
          const finalPrice = issue.bidPrice || 0;
          const operatorFee = Number((finalPrice * config.platformFeeRate).toFixed(1));
          const expertEarnings = finalPrice - operatorFee;
          
          const exp = experts.find(e => e.id === issue.bidExpertId);
          const route = exp ? calculateRoute(exp.currentLat, exp.currentLng, issue.clientLat, issue.clientLng, 10) : [];

          updatedIssue = {
            ...issue,
            status: 'assigned' as const,
            expertId: issue.bidExpertId,
            expertName: issue.bidExpertName,
            price: finalPrice,
            operatorFee,
            expertEarnings,
            expertLat: exp?.currentLat,
            expertLng: exp?.currentLng,
            routeCoordinates: route,
            activeStepIndex: 0,
            assignedAt: new Date().toISOString(),
            bidStatus: 'accepted' as const
          };
          return updatedIssue;
        } else if (action === 'fixed') {
          const fixedPriceKey = `${issue.category}FixedPrice` as keyof SolBridksConfig;
          const initialPrice = Number(config[fixedPriceKey]) || 85;
          const operatorFee = Number((initialPrice * config.platformFeeRate).toFixed(1));
          const expertEarnings = initialPrice - operatorFee;

          updatedIssue = {
            ...issue,
            pricingMethod: 'operator_fixed' as const,
            price: initialPrice,
            operatorFee,
            expertEarnings,
            status: 'priced' as const,
            bidPrice: undefined,
            bidStatus: 'none' as const,
            bidExpertId: undefined,
            bidExpertName: undefined,
            bidExpertAvatar: undefined
          };
          return updatedIssue;
        } else if (action === 'counter') {
          const finalPrice = counterPrice || 0;
          updatedIssue = {
            ...issue,
            bidPrice: finalPrice,
            bidStatus: 'client_countered' as const
          };
          return updatedIssue;
        }
      }
      return issue;
    });

    updateIssuesState(nextIssues);

    if (updatedIssue) {
      if (action === 'accept') {
        triggerNotificationsOnStatusChange(updatedIssue, 'assigned');
      } else if (action === 'fixed') {
        triggerNotificationsOnStatusChange(updatedIssue, 'priced');
      } else if (action === 'counter') {
        const exp = experts.find(e => e.id === (updatedIssue as ITIssue).bidExpertId);
        if (exp) {
          const newAlert: NotificationLog = {
            id: `alert_${Date.now()}`,
            timestamp: new Date().toISOString(),
            recipientRole: 'expert',
            recipientName: exp.name,
            recipientContact: exp.email,
            channel: 'email',
            subject: `[Bidding Offer] Client Countered with $${counterPrice}`,
            body: `The client has countered your bid on "${(updatedIssue as ITIssue).title}" with an offer of $${counterPrice}. You can accept their offer or submit another counter-bid.`,
            status: 'sent'
          };
          updateNotificationsState([newAlert, ...notifications]);
        }
      }
    }
  };

  const handleExpertRespondBid = (issueId: string, action: 'accept' | 'counter', counterPrice?: number) => {
    const expert = experts.find(e => e.id === selectedExpertId);
    if (!expert) return;

    let updatedIssue: ITIssue | null = null;
    const nextIssues = issues.map((issue) => {
      if (issue.id === issueId) {
        if (action === 'accept') {
          const finalPrice = issue.bidPrice || 0;
          const operatorFee = Number((finalPrice * config.platformFeeRate).toFixed(1));
          const expertEarnings = finalPrice - operatorFee;
          
          const route = calculateRoute(expert.currentLat, expert.currentLng, issue.clientLat, issue.clientLng, 10);

          updatedIssue = {
            ...issue,
            status: 'assigned' as const,
            expertId: expert.id,
            expertName: expert.name,
            price: finalPrice,
            operatorFee,
            expertEarnings,
            expertLat: expert.currentLat,
            expertLng: expert.currentLng,
            routeCoordinates: route,
            activeStepIndex: 0,
            assignedAt: new Date().toISOString(),
            bidStatus: 'accepted' as const,
            bidExpertId: expert.id,
            bidExpertName: expert.name
          };
          return updatedIssue;
        } else if (action === 'counter') {
          const finalPrice = counterPrice || 0;
          updatedIssue = {
            ...issue,
            bidPrice: finalPrice,
            bidStatus: 'expert_countered' as const,
            bidExpertId: expert.id,
            bidExpertName: expert.name
          };
          return updatedIssue;
        }
      }
      return issue;
    });

    updateIssuesState(nextIssues);

    if (updatedIssue) {
      if (action === 'accept') {
        triggerNotificationsOnStatusChange(updatedIssue, 'assigned');
      } else if (action === 'counter') {
        const email = clientProfile.isRegistered ? clientProfile.email : divEmail;
        const newAlert: NotificationLog = {
          id: `alert_${Date.now()}`,
          timestamp: new Date().toISOString(),
          recipientRole: 'client',
          recipientName: (updatedIssue as ITIssue).clientName,
          recipientContact: email,
          channel: 'email',
          subject: `[Bidding Offer] Expert Countered with $${counterPrice}`,
          body: `Technical Specialist ${expert.name} countered with a bid of $${counterPrice} on your ticket "${(updatedIssue as ITIssue).title}". Please accept, counter, or switch to SolFixed rate.`,
          status: 'sent'
        };
        updateNotificationsState([newAlert, ...notifications]);
      }
    }
  };

  // Simulate real-time dispatch GPS tracking increments
  const handleSimulateStep = (issueId: string) => {
    let updatedIssue: ITIssue | null = null;
    let oldStatus: IssueStatus = 'assigned';

    const nextIssues = issues.map((issue) => {
      if (issue.id === issueId) {
        oldStatus = issue.status;
        const route = issue.routeCoordinates || [];
        const nextIndex = (issue.activeStepIndex !== undefined ? issue.activeStepIndex : -1) + 1;
        
        let nextStatus: IssueStatus = 'dispatched';
        let finalLat = issue.expertLat;
        let finalLng = issue.expertLng;

        if (nextIndex < route.length) {
          finalLat = route[nextIndex][0];
          finalLng = route[nextIndex][1];
        } else {
          // Arrived on location
          nextStatus = 'arrived';
          finalLat = issue.clientLat;
          finalLng = issue.clientLng;
        }

        updatedIssue = {
          ...issue,
          status: nextStatus,
          activeStepIndex: nextIndex,
          expertLat: finalLat,
          expertLng: finalLng,
        };
        return updatedIssue;
      }
      return issue;
    });

    updateIssuesState(nextIssues);
    if (updatedIssue) {
      if (oldStatus !== (updatedIssue as ITIssue).status) {
        triggerNotificationsOnStatusChange(updatedIssue, (updatedIssue as ITIssue).status);
      }
    }
  };

  const handleCompleteDiagnostic = (issueId: string) => {
    let updated: ITIssue | null = null;
    const nextIssues = issues.map((issue) => {
      if (issue.id === issueId) {
        updated = {
          ...issue,
          status: 'resolving' as const,
        };
        return updated;
      }
      return issue;
    });
    updateIssuesState(nextIssues);
    if (updated) {
      triggerNotificationsOnStatusChange(updated, 'resolving');
    }
  };

  const handleCompleteIssue = (issueId: string) => {
    let updated: ITIssue | null = null;
    const nextIssues = issues.map((issue) => {
      if (issue.id === issueId) {
        updated = {
          ...issue,
          status: 'payment_pending' as const,
          resolvedAt: new Date().toISOString(),
        };
        return updated;
      }
      return issue;
    });
    updateIssuesState(nextIssues);
    if (updated) {
      triggerNotificationsOnStatusChange(updated, 'payment_pending');
    }
  };

  // SECURE CHECKOUT HANDLERS
  const handlePaymentSuccess = (paymentId: string) => {
    let completedIssue: ITIssue | undefined;

    const nextIssues = issues.map((issue) => {
      if (issue.id === selectedIssueId) {
        completedIssue = {
          ...issue,
          status: 'completed' as const,
          paymentId,
          paymentStatus: 'success' as const,
          completedAt: new Date().toISOString(),
        };
        return completedIssue;
      }
      return issue;
    });

    updateIssuesState(nextIssues);
    if (completedIssue) {
      triggerNotificationsOnStatusChange(completedIssue, 'completed');
    }

    // If an expert was attached to this ticket, deposit their earned wages and update CO2 stats
    if (completedIssue && (completedIssue as ITIssue).expertId) {
      const targetExpId = (completedIssue as ITIssue).expertId!;
      const earnings = (completedIssue as ITIssue).expertEarnings;
      const offset = (completedIssue as ITIssue).co2SavedKg;

      const nextExperts = experts.map((exp) => {
        if (exp.id === targetExpId) {
          return {
            ...exp,
            totalEarnings: exp.totalEarnings + earnings,
            co2SavedTotal: exp.co2SavedTotal + offset,
            totalResolved: exp.totalResolved + 1,
          };
        }
        return exp;
      });
      updateExpertsState(nextExperts);
    }

    // Dismiss Portal shortly
    setTimeout(() => {
      setShowPaymentPortal(false);
    }, 2800);
  };

  // OPERATOR HQ HANDLERS
  const handleOperatorSetPrice = (issueId: string, price: number) => {
    let updated: ITIssue | null = null;
    const nextIssues = issues.map((issue) => {
      if (issue.id === issueId) {
        const operatorFee = Number((price * config.platformFeeRate).toFixed(1));
        const expertEarnings = price - operatorFee;

        updated = {
          ...issue,
          status: 'priced' as const,
          price,
          operatorFee,
          expertEarnings,
        };
        return updated;
      }
      return issue;
    });
    updateIssuesState(nextIssues);
    if (updated) {
      triggerNotificationsOnStatusChange(updated, 'priced');
    }
  };

  const divEmail = "divakarcan75038@gmail.com";

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 flex flex-col font-sans selection:bg-[#0f172a] selection:text-white">
      
      {/* Brand Header & Global Scorecards */}
      <Header 
        currentRole={currentRole} 
        onRoleChange={handleRoleChange} 
        issues={issues} 
      />

      {/* Main body wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Toggle persona dashboards */}
        <section className="transition-all duration-300">
           {currentRole === 'client' && (
            <ClientDashboard
              issues={issues}
              selectedIssueId={selectedIssueId}
              onSelectIssue={setSelectedIssueId}
              onCreateIssue={handleCreateIssue}
              onDeleteIssue={handleDeleteIssue}
              onInitiatePayment={() => setShowPaymentPortal(true)}
              fixedRates={{
                hardware: config.hardwareFixedPrice,
                software: config.softwareFixedPrice,
                network: config.networkFixedPrice,
                security: config.securityFixedPrice,
                cloud: config.cloudFixedPrice,
              }}
              clientProfile={clientProfile}
              clients={clients}
              onSelectClient={handleSelectClient}
              onUpdateClientProfile={updateClientProfileState}
              onUpdateIssues={updateIssuesState}
              onUploadDocument={handleUploadDocument}
              onDeleteDocument={handleDeleteDocument}
              onSendMessage={handleSendMessage}
              onClientRespondBid={handleClientRespondBid}
            />
          )}

          {currentRole === 'expert' && (
            <ExpertDashboard
              issues={issues}
              experts={experts}
              onSelectExpert={setSelectedExpertId}
              selectedExpertId={selectedExpertId}
              onRegisterExpert={handleRegisterExpert}
              onAcceptIssue={handleAcceptIssue}
              onSimulateStep={handleSimulateStep}
              onCompleteDiagnostic={handleCompleteDiagnostic}
              onCompleteIssue={handleCompleteIssue}
              onUploadDocument={handleUploadDocument}
              onDeleteDocument={handleDeleteDocument}
              onSendMessage={handleSendMessage}
              onSubmitExpertBid={handleSubmitExpertBid}
              onExpertRespondBid={handleExpertRespondBid}
              onUpdateIssues={updateIssuesState}
            />
          )}

          {currentRole === 'operator' && (
            isHqAuthenticated ? (
              <OperatorDashboard
                issues={issues}
                config={config}
                onUpdateConfig={updateConfigState}
                onOperatorSetPrice={handleOperatorSetPrice}
                experts={experts}
                onUpdateExperts={updateExpertsState}
                onUpdateIssues={updateIssuesState}
                clientProfile={clientProfile}
                onUpdateClientProfile={updateClientProfileState}
                onUploadDocument={handleUploadDocument}
                onDeleteDocument={handleDeleteDocument}
                onSendMessage={handleSendMessage}
              />
            ) : (
              <div className="max-w-md mx-auto my-12 bg-white border border-slate-200 rounded-3xl p-8 text-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full pointer-events-none filter blur-xl" />
                
                <div className="text-center space-y-2">
                  <div className="inline-flex p-3 bg-red-50 border border-red-100 rounded-full text-red-600 mb-2">
                    <Lock className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-widest text-slate-900 font-sans">Access Restricted</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">
                    This HQ Control Room is strictly reserved for Company Owners, Directors, and Authorized Admins. End-users (Clients &amp; Experts) are restricted from accessing system logs and pricing configurations.
                  </p>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const key = authPasskey.trim().toLowerCase();
                  if (['admin', 'director', 'solbridks_hq', 'admin123'].includes(key)) {
                    setIsHqAuthenticated(true);
                    setAuthError('');
                  } else {
                    setAuthError('Access Denied: Invalid security signature.');
                  }
                }} className="space-y-4 mt-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 block">
                      Security Passkey Signature
                    </label>
                    <input
                      type="password"
                      value={authPasskey}
                      onChange={(e) => {
                        setAuthPasskey(e.target.value);
                        setAuthError('');
                      }}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-slate-900 rounded-xl px-4 py-3 text-center font-mono text-lg tracking-widest text-slate-800 outline-none transition-all placeholder:text-slate-300"
                    />
                    <span className="text-[9px] text-slate-500 block text-center mt-1">
                      💡 Owner/Admin Hint: enter <strong className="text-slate-900">admin</strong> or <strong className="text-slate-900">director</strong> to authorize entry
                    </span>
                  </div>

                  {authError && (
                    <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-[10.5px] font-bold text-center leading-relaxed">
                      ⚠️ {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-[#0f172a] hover:bg-slate-900 text-white font-black text-xs py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer text-center uppercase tracking-wider"
                  >
                    Authenticate Signature
                  </button>
                </form>
              </div>
            )
          )}
        </section>

        {/* Global Outbound Telecom Gateway Router Logs - Restrict strictly to HQ Control Room */}
        {currentRole === 'operator' && isHqAuthenticated && (
          <section className="animate-fade-in pt-4">
            <OutboundNotificationLogs 
              notifications={notifications} 
              onClearAll={() => updateNotificationsState([])}
            />
          </section>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2 flex flex-col items-center">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="SolBridks" className="w-6 h-6 object-contain rounded-md" referrerPolicy="no-referrer" />
            <span className="font-extrabold text-sm text-[#0f172a]">Sol<span className="text-[#dc2626]">Bridks</span></span>
          </div>
          <p className="font-semibold text-slate-700">SolBridks On-Demand Expert Technical Services &amp; Solutions</p>
          <p>© 2026 SolBridks. Dedicated to high-availability corporate operations, secure cloud integrations, and enterprise hardware systems engineering.</p>
        </div>
      </footer>

      {/* PAYMENTS GATEWAY OVERLAY MODAL */}
      {showPaymentPortal && selectedIssueId && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          {(() => {
            const currentIssue = issues.find(i => i.id === selectedIssueId);
            if (!currentIssue) return null;
            return (
              <div className="w-full max-w-xl">
                <PaymentForm 
                  issue={currentIssue} 
                  onPaymentSuccess={handlePaymentSuccess} 
                  onCancel={() => setShowPaymentPortal(false)} 
                />
              </div>
            );
          })()}
        </div>
      )}

    </div>
  );
}
