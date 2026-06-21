export type UserRole = 'client' | 'expert' | 'operator';

export type IssueStatus =
  | 'submitted'       // Issue created, waiting for price setting / assignment
  | 'priced'          // Price determined (either by SolBridks or by individual bid)
  | 'assigned'        // Tech expert accepted the job
  | 'dispatched'      // Expert is "on the way" (real-time tracking starts)
  | 'arrived'         // Expert is diagnosing
  | 'resolving'       // Solution in progress
  | 'payment_pending' // Solved, waiting for secure payment
  | 'completed';      // Payed and fully archived

export type PricingMethod = 'operator_fixed' | 'expert_bid';

export interface TicketDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: UserRole;
  uploadedByName: string;
  uploadedAt: string;
  dataUrl: string; // Base64 payload or simulated secure hash
}

export interface ChatMessage {
  id: string;
  senderRole: UserRole;
  senderName: string;
  body: string;
  timestamp: string;
  isSecurelyEncrypted: boolean;
}

export interface ITIssue {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string; // Client contact phone
  title: string;
  description: string;
  category: 'hardware' | 'software' | 'network' | 'security' | 'cloud';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: IssueStatus;
  
  // Pricing & Payments
  pricingMethod: PricingMethod;
  price: number; // Set by SolBridks operator or expert bid
  operatorFee: number; // SolBridks platform cut
  expertEarnings: number;
  paymentId?: string;
  paymentStatus?: 'pending' | 'success' | 'refunded';
  
  // Real-time tracking simulated coordinates
  clientLat: number;
  clientLng: number;
  expertLat?: number;
  expertLng?: number;
  routeCoordinates?: [number, number][]; // SVG coordinates for the simulated route
  activeStepIndex?: number;
  
  // Sustainability & Growth Parameters
  wasteAvoidedKg: number; // KG of e-waste saved by repairing/upgrading
  co2SavedKg: number; // Offsets achieved by eco-friendly dispatch / repair
  lifespanExtendedMonths: number; // Target extension of device
  
  // Expert Info
  expertId?: string;
  expertName?: string;
  expertAvatar?: string;
  
  // Timestamps
  createdAt: string;
  assignedAt?: string;
  resolvedAt?: string;
  completedAt?: string;

  // Real-time Document exchange & Encrypted Communications
  documents?: TicketDocument[];
  chatMessages?: ChatMessage[];

  // Bidding & Real-time Quote Negotiations
  bidStatus?: 'none' | 'expert_submitted' | 'client_countered' | 'expert_countered' | 'closed';
  bidPrice?: number;
  bidExpertId?: string;
  bidExpertName?: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  companyName: string;
  phone: string;
  isRegistered: boolean;
}

export interface ExpertProfile {
  id: string;
  name: string;
  email: string;
  skills: string[];
  vehicleType: 'electric-bike' | 'public-transit' | 'ev' | 'hybrid'; // Represents engineering equipment patch / dispatch kit tier representing toolkits
  rating: number;
  totalResolved: number;
  totalEarnings: number;
  co2SavedTotal: number;
  isAvailable: boolean;
  currentLat: number;
  currentLng: number;
  isVerifiedByQA?: boolean; // New QA Admin confirmation state
  bankName?: string; // Financial Routing fields
  bankAccount?: string;
  bankRouting?: string;
}

export interface NotificationLog {
  id: string;
  timestamp: string;
  recipientRole: UserRole;
  recipientName: string;
  recipientContact: string; // Email or Mobile Number
  channel: 'email' | 'sms';
  subject: string;
  body: string;
  status: 'sent' | 'delivered';
}

export interface SolBridksConfig {
  hardwareFixedPrice: number;
  softwareFixedPrice: number;
  networkFixedPrice: number;
  securityFixedPrice: number;
  cloudFixedPrice: number;
  platformFeeRate: number; // e.g. 0.15 for 15%
  co2OffsetRate: number; // Cost of offset per kg of CO2 in dollars (usually tiny, included in fee)
}
