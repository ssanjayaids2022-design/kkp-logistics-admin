// ─── Status Enums ────────────────────────────────────────────────────────────

export type LoadStatus = 'active' | 'in_transit' | 'delivered' | 'completed' | 'cancelled' | 'delayed';
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'processing';
export type DriverStatus = 'pending_approval' | 'approved' | 'rejected' | 'suspended';
export type BidStatus = 'pending' | 'accepted' | 'rejected';
export type DocumentStatus = 'verified' | 'pending' | 'rejected' | 'missing';

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface Load {
  id: string;
  source: string;
  destination: string;
  pickupDate: string;
  vehicleType: string;
  weight: number;
  budget: number;
  status: LoadStatus;
  bidsCount: number;
  postedDate: string;
  assignedDriver?: string;
  assignedById?: string;    // which admin/agent assigned the driver
  assignedByName?: string;
  assignedAt?: string;
  notes?: string;
  handling?: string;       // fragile / special handling instruction
  truckLength?: string;    // required truck body length (feet)
  distance?: string;
  priceType?: 'fixed' | 'per_ton';
  ratePerTon?: number;
  fixedAmount?: number;
  // Admin pricing worksheet
  quotedAmount?: number;   // price posted by KKP (base)
  kkpPrice?: number;       // KKP's set price
  bidAmount?: number | null;
  offeredAmount?: number;  // driver's extra request
  amountVisible?: boolean; // show the trip amount to drivers in the app
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleType: string;
  vehicleNumber: string;
  licenseNumber: string;
  totalTrips: number;
  status: DriverStatus;
  documentsStatus: {
    license: DocumentStatus;
    insurance: DocumentStatus;
    registration: DocumentStatus;
    aadhar: DocumentStatus;
  };
  joinedDate: string;
  avatar?: string;
  region?: string;
  location?: string;       // driver-entered current city
  documentUrls?: {         // viewable document files (data URLs / links)
    license?: string;
    insurance?: string;
    registration?: string;
    aadhar?: string;
  };
}

export interface Bid {
  id: string;
  loadId: string;
  driverId: string;
  driverName: string;
  vehicleType: string;
  vehicleNumber: string;
  price: number;
  eta: string;
  distance: string;
  status: BidStatus;
  submittedAt: string;
  avatar?: string;
  totalTrips: number;
}

export interface Payment {
  id: string;
  loadId: string;
  driverName: string;
  driverId: string;
  amount: number;
  status: PaymentStatus;
  dueDate: string;
  paidDate?: string;
  route: string;
  paymentMethod?: string;
  isOutside?: boolean;   // recorded outside the system (cash / direct UPI / etc.)
  notes?: string;
}

export type Role = 'CHAIRMAN' | 'MANAGER' | 'AGENT' | 'TECH_ADMIN';

// Canonical capability keys — the single source of truth the Access Matrix drives.
export type Permission =
  | 'dashboard.view'
  | 'loads.view'
  | 'loads.post'
  | 'loads.pricing.edit'
  | 'loads.delete'
  | 'match.view'
  | 'match.assign'
  | 'tracking.view'
  | 'drivers.view'
  | 'drivers.approve'
  | 'payments.view'
  | 'payments.edit'
  | 'analytics.operational'
  | 'analytics.financial'
  | 'audit.view'
  | 'audit.all'          // sees everyone's logs (vs. only own)
  | 'admin.manage'
  | 'access.matrix.edit'
  | 'users.password.reset'
  | 'settings.enterprise';

export type RolePermissions = Record<Role, Permission[]>;

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  scope?: string;
  status?: 'Active' | 'Suspended';
  lastLogin?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  remember: boolean;
}

export interface LoadFormData {
  source: string;
  destination: string;
  pickupDate: string;
  vehicleType: string;
  weight: number;
  priceType: 'fixed' | 'per_ton';
  fixedAmount?: number;
  ratePerTon?: number;
  notes: string;
}

export interface KPIData {
  title: string;
  value: string | number;
  trend: string;
  trendUp: boolean;
  icon: string;
  color: string;
}

export interface RevenueDataPoint {
  month: string;
  revenue: number;
}

export interface VolumeDataPoint {
  day: string;
  volume: number;
  highlight?: boolean;
}

export interface ActivityItem {
  id: string;
  type: 'load_posted' | 'driver_assigned' | 'delivery_completed' | 'bid_received' | 'payment_processed';
  message: string;
  time: string;
  status?: string;
}
