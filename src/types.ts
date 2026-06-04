// ─── Status Enums ────────────────────────────────────────────────────────────

export type LoadStatus = 'pending' | 'active' | 'in_transit' | 'delivered' | 'completed' | 'cancelled' | 'delayed';
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
  notes?: string;
  distance?: string;
  priceType?: 'fixed' | 'per_ton';
  ratePerTon?: number;
  fixedAmount?: number;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleType: string;
  vehicleNumber: string;
  licenseNumber: string;
  rating: number;
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
}

export interface Bid {
  id: string;
  loadId: string;
  driverId: string;
  driverName: string;
  driverRating: number;
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
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CHAIRMAN' | 'MANAGER' | 'LOAD_ADMIN';
  avatar?: string;
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
