import { ITIssue, ExpertProfile, ClientProfile, SolBridksConfig, IssueStatus, PricingMethod, NotificationLog } from '../types';

// Default configuration for SolBridks Operating Company
export const DEFAULT_CONFIG: SolBridksConfig = {
  hardwareFixedPrice: 85,
  softwareFixedPrice: 60,
  networkFixedPrice: 75,
  securityFixedPrice: 110,
  cloudFixedPrice: 120,
  platformFeeRate: 0.15, // 15% platform commission
  co2OffsetRate: 0.12, // $0.12 per kg offset
};

// Simulated city coordinate grid (0 - 100 x, 0 - 100 y)
export const SOLBRIDKS_COHQ = { x: 50, y: 50, name: "SolBridks Engineering Solutions Headquarters" };

export const DEFAULT_EXPERTS: ExpertProfile[] = [
  {
    id: 'exp_1',
    name: 'Elena Rostova',
    email: 'elena.r@solbridks.net',
    phone: '+1 (555) 291-8842',
    password: 'password123',
    skills: ['Hardware Repair', 'Energy Efficient Upgrades', 'Network Security'],
    domains: ['Hardware & Electronics Repair', 'Telecom, Networks & Fiber', 'IT & Cloud Infrastructure'],
    vehicleType: 'electric-bike',
    rating: 4.9,
    totalResolved: 42,
    totalEarnings: 2850,
    co2SavedTotal: 184,
    isAvailable: true,
    currentLat: 25,
    currentLng: 30,
    isVerifiedByQA: true,
    isPhoneVerified: true,
    bankName: 'Eco Green Credit Union',
    bankAccount: '*******9421',
    bankRouting: '*****301'
  },
  {
    id: 'exp_2',
    name: 'Marcus Chen',
    email: 'marcus.c@solbridks.net',
    phone: '+1 (555) 831-2091',
    password: 'password123',
    skills: ['Software Troubleshooting', 'Cloud Optimization', 'OS Tuneups'],
    domains: ['Software & Web Solutions', 'IT & Cloud Infrastructure', 'Data Systems & AI Solutions'],
    vehicleType: 'public-transit',
    rating: 4.8,
    totalResolved: 31,
    totalEarnings: 1950,
    co2SavedTotal: 142,
    isAvailable: true,
    currentLat: 75,
    currentLng: 20,
    isVerifiedByQA: true,
    isPhoneVerified: true,
    bankName: 'Sol Alliance Savings',
    bankAccount: '*******5032',
    bankRouting: '*****842'
  },
  {
    id: 'exp_3',
    name: 'Amina Diallo',
    email: 'amina.d@solbridks.net',
    phone: '+1 (555) 492-[0192]',
    password: 'password123',
    skills: ['Cybersecurity auditing', 'Cloud instance management', 'Network Repair'],
    domains: ['Cybersecurity & Compliance', 'IT & Cloud Infrastructure', 'Enterprise ERP & Business Systems'],
    vehicleType: 'ev',
    rating: 5.0,
    totalResolved: 18,
    totalEarnings: 1540,
    co2SavedTotal: 96,
    isAvailable: true,
    currentLat: 60,
    currentLng: 80,
    isVerifiedByQA: true,
    isPhoneVerified: true,
    bankName: 'Global Capital Merchant Trust',
    bankAccount: '*******1189',
    bankRouting: '*****581'
  }
];

export const INITIAL_ISSUES: ITIssue[] = [
  {
    id: 'issue_101',
    clientId: 'client_usr',
    clientName: 'Sarah Jenkins (EcoOffice Corp)',
    clientEmail: 's.jenkins@ecooffice.com',
    title: 'Thermostat IoT Controller Offline & Printer Power Leak',
    description: 'Our green office smart thermostat is disconnected from the local subnet. Also, our server room backup power unit is over-consuming. Need a smart hardware technician to diagnose and repair instead of replacing modules.',
    category: 'hardware',
    urgency: 'high',
    status: 'submitted',
    pricingMethod: 'operator_fixed',
    price: 0,
    operatorFee: 0,
    expertEarnings: 0,
    clientLat: 45,
    clientLng: 35,
    wasteAvoidedKg: 8.5,
    co2SavedKg: 42.1,
    lifespanExtendedMonths: 24,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
  },
  {
    id: 'issue_102',
    clientId: 'client_usr',
    clientName: 'Sarah Jenkins (EcoOffice Corp)',
    clientEmail: 's.jenkins@ecooffice.com',
    title: 'Cloud Cluster Under-Volt & Energy Waste Tuning',
    description: 'We need to profile server software logs and optimize container memory leaks. Scaling group runs too hot during night idle cycles. Need software expert to push clean code configurations.',
    category: 'cloud',
    urgency: 'medium',
    status: 'priced',
    pricingMethod: 'operator_fixed',
    price: 120,
    operatorFee: 18,
    expertEarnings: 102,
    clientLat: 80,
    clientLng: 65,
    wasteAvoidedKg: 0,
    co2SavedKg: 95.0,
    lifespanExtendedMonths: 12,
    createdAt: new Date().toISOString(),
  }
];

const STORAGE_KEYS = {
  CONFIG: 'solbridks_config_v1',
  EXPERTS: 'solbridks_experts_v1',
  ISSUES: 'solbridks_issues_v1',
};

export function getSolBridksConfig(): SolBridksConfig {
  const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
    return DEFAULT_CONFIG;
  }
  return JSON.parse(data);
}

export function saveSolBridksConfig(config: SolBridksConfig) {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
}

export function getExperts(): ExpertProfile[] {
  const data = localStorage.getItem(STORAGE_KEYS.EXPERTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.EXPERTS, JSON.stringify(DEFAULT_EXPERTS));
    return DEFAULT_EXPERTS;
  }
  return JSON.parse(data);
}

export function saveExperts(experts: ExpertProfile[]) {
  localStorage.setItem(STORAGE_KEYS.EXPERTS, JSON.stringify(experts));
}

export function getIssues(): ITIssue[] {
  const data = localStorage.getItem(STORAGE_KEYS.ISSUES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(INITIAL_ISSUES));
    return INITIAL_ISSUES;
  }
  return JSON.parse(data);
}

export function saveIssues(issues: ITIssue[]) {
  localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));
}

// Helper to simulate a coordinate path between two locations
export function calculateRoute(startLat: number, startLng: number, endLat: number, endLng: number, stepsCount = 10): [number, number][] {
  const list: [number, number][] = [];
  for (let i = 0; i <= stepsCount; i++) {
    const ratio = i / stepsCount;
    const x = startLat + (endLat - startLat) * ratio;
    const y = startLng + (endLng - startLng) * ratio;
    // Add subtle noise to create a realistic pathing curvature
    const noiseAmp = stepsCount > 0 && i > 0 && i < stepsCount ? 3 : 0;
    const offset = Math.sin(ratio * Math.PI) * noiseAmp;
    
    // Add point with a bit of path curvature (orthogonal to trajectory)
    const dx = endLat - startLat;
    const dy = endLng - startLng;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) {
      const perpX = (-dy / len) * offset;
      const perpY = (dx / len) * offset;
      list.push([x + perpX, y + perpY]);
    } else {
      list.push([x, y]);
    }
  }
  return list;
}

// Generate realistic environmental savings for green IT
export function generateSustainabilityEcoStats(category: string, description: string, urgency: string) {
  let waste = 0;
  let co2 = 0;
  let extended = 0;

  switch (category) {
    case 'hardware':
      waste = urgency === 'critical' ? 12.4 : urgency === 'high' ? 8.2 : 5.0;
      co2 = waste * 5.2; // roughly 5.2kg CO2 embedded in manufacture per kg e-waste
      extended = urgency === 'critical' ? 36 : 24;
      break;
    case 'software':
      waste = 0; // pure dynamic optimization
      co2 = urgency === 'critical' ? 32.0 : 15.4; // OS optimize saves server cluster draw
      extended = 12;
      break;
    case 'network':
      waste = 1.2; // cabling or router salvage
      co2 = 24.1;
      extended = 18;
      break;
    case 'security':
      waste = 0.5;
      co2 = 18.0;
      extended = 24;
      break;
    case 'cloud':
      waste = 0;
      co2 = 120.0; // Server footprint consolidation
      extended = 18;
      break;
    default:
      waste = 2.0;
      co2 = 10.0;
      extended = 12;
  }

  return {
    wasteAvoidedKg: Number(waste.toFixed(1)),
    co2SavedKg: Number(co2.toFixed(1)),
    lifespanExtendedMonths: extended,
  };
}

export function getClients(): ClientProfile[] {
  const data = localStorage.getItem('solbridks_clients_v2');
  if (!data) {
    const defaultClients: ClientProfile[] = [
      {
        id: 'client_usr',
        name: 'Sarah Jenkins',
        email: 's.jenkins@ecooffice.com',
        companyName: 'EcoOffice Corp',
        phone: '+1 (555) 303-4929',
        password: 'password123',
        isRegistered: true,
        isPhoneVerified: true
      }
    ];
    localStorage.setItem('solbridks_clients_v2', JSON.stringify(defaultClients));
    return defaultClients;
  }
  return JSON.parse(data);
}

export function saveClients(clients: ClientProfile[]) {
  localStorage.setItem('solbridks_clients_v2', JSON.stringify(clients));
}

export function getClientProfile(): ClientProfile {
  const data = localStorage.getItem('solbridks_client_profile_v1');
  if (!data) {
    const defaultProfile: ClientProfile = {
      id: 'client_usr',
      name: 'Sarah Jenkins',
      email: 's.jenkins@ecooffice.com',
      companyName: 'EcoOffice Corp',
      phone: '+1 (555) 303-4929',
      password: 'password123',
      isRegistered: true, // Set to true now that we seed it as registered
      isPhoneVerified: true
    };
    localStorage.setItem('solbridks_client_profile_v1', JSON.stringify(defaultProfile));
    return defaultProfile;
  }
  return JSON.parse(data);
}

export function saveClientProfile(profile: ClientProfile) {
  localStorage.setItem('solbridks_client_profile_v1', JSON.stringify(profile));
}

export const INITIAL_NOTIFICATIONS: NotificationLog[] = [
  {
    id: 'notif_1',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    recipientRole: 'client',
    recipientName: 'Sarah Jenkins',
    recipientContact: 's.jenkins@ecooffice.com',
    channel: 'email',
    subject: 'Ticket #101 Lodged Successfully',
    body: 'SolBridks Operations Team has received your technical ticket "Thermostat IoT Controller Offline & Printer Power Leak". Verification is now active with standard corporate SLA compliance.',
    status: 'delivered'
  },
  {
    id: 'notif_2',
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    recipientRole: 'operator',
    recipientName: 'HQ Control Room Operator',
    recipientContact: 'alerts@solbridks-systems.com',
    channel: 'sms',
    subject: 'Emergency dispatch SLA triggered',
    body: 'SolBridks HQ Alert: Action Required. Urgent ticket "Thermostat IoT Controller Offline & Printer Power Leak" created by Sarah Jenkins has successfully passed ingestion checks and is ready for expert allocation.',
    status: 'delivered'
  }
];

export function getNotifications(): NotificationLog[] {
  const data = localStorage.getItem('solbridks_notifications_v1');
  if (!data) {
    localStorage.setItem('solbridks_notifications_v1', JSON.stringify(INITIAL_NOTIFICATIONS));
    return INITIAL_NOTIFICATIONS;
  }
  return JSON.parse(data);
}

export function saveNotifications(logs: NotificationLog[]) {
  localStorage.setItem('solbridks_notifications_v1', JSON.stringify(logs));
}

