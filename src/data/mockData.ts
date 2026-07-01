import type { Load, Driver, Bid, Payment, ActivityItem, RevenueDataPoint, VolumeDataPoint } from '../types';

// ─── Loads ───────────────────────────────────────────────────────────────────

export const loads: Load[] = [
  { id: 'LD-1001', source: 'Mumbai, MH', destination: 'Delhi, DL', pickupDate: '2026-04-10', vehicleType: 'Container 20ft', weight: 8500, budget: 45000, status: 'active', bidsCount: 5, postedDate: '2026-04-08', distance: '1,420 km' },
  { id: 'LD-1002', source: 'Chennai, TN', destination: 'Bangalore, KA', pickupDate: '2026-04-11', vehicleType: 'Open Truck', weight: 3200, budget: 15000, status: 'pending', bidsCount: 3, postedDate: '2026-04-09', distance: '350 km' },
  { id: 'LD-1003', source: 'Kolkata, WB', destination: 'Guwahati, AS', pickupDate: '2026-04-09', vehicleType: 'Closed Body', weight: 5000, budget: 28000, status: 'in_transit', bidsCount: 7, postedDate: '2026-04-07', assignedDriver: 'Suresh Kumar', distance: '985 km' },
  { id: 'LD-1004', source: 'Hyderabad, TS', destination: 'Pune, MH', pickupDate: '2026-04-12', vehicleType: 'Trailer', weight: 15000, budget: 65000, status: 'pending', bidsCount: 2, postedDate: '2026-04-09', distance: '560 km' },
  { id: 'LD-1005', source: 'Ahmedabad, GJ', destination: 'Jaipur, RJ', pickupDate: '2026-04-10', vehicleType: 'Container 40ft', weight: 12000, budget: 52000, status: 'delivered', bidsCount: 6, postedDate: '2026-04-05', assignedDriver: 'Rajesh Patel', distance: '670 km' },
  { id: 'LD-1006', source: 'Lucknow, UP', destination: 'Patna, BR', pickupDate: '2026-04-13', vehicleType: 'Open Truck', weight: 4500, budget: 22000, status: 'active', bidsCount: 4, postedDate: '2026-04-09', distance: '540 km' },
  { id: 'LD-1007', source: 'Surat, GJ', destination: 'Nagpur, MH', pickupDate: '2026-04-11', vehicleType: 'Closed Body', weight: 6000, budget: 35000, status: 'in_transit', bidsCount: 8, postedDate: '2026-04-06', assignedDriver: 'Amar Singh', distance: '790 km' },
  { id: 'LD-1008', source: 'Coimbatore, TN', destination: 'Kochi, KL', pickupDate: '2026-04-14', vehicleType: 'Refrigerated', weight: 2800, budget: 18000, status: 'pending', bidsCount: 1, postedDate: '2026-04-09', distance: '190 km' },
  { id: 'LD-1009', source: 'Delhi, DL', destination: 'Chandigarh, PB', pickupDate: '2026-04-10', vehicleType: 'Open Truck', weight: 3500, budget: 12000, status: 'completed', bidsCount: 5, postedDate: '2026-04-03', assignedDriver: 'Vikram Yadav', distance: '250 km' },
  { id: 'LD-1010', source: 'Bangalore, KA', destination: 'Hyderabad, TS', pickupDate: '2026-04-15', vehicleType: 'Container 20ft', weight: 7200, budget: 38000, status: 'delayed', bidsCount: 4, postedDate: '2026-04-07', assignedDriver: 'Ravi Shankar', distance: '570 km' },
  { id: 'LD-1011', source: 'Pune, MH', destination: 'Goa, GA', pickupDate: '2026-04-11', vehicleType: 'Closed Body', weight: 2500, budget: 14000, status: 'active', bidsCount: 6, postedDate: '2026-04-08', distance: '450 km' },
  { id: 'LD-1012', source: 'Indore, MP', destination: 'Bhopal, MP', pickupDate: '2026-04-12', vehicleType: 'Open Truck', weight: 4000, budget: 10000, status: 'cancelled', bidsCount: 0, postedDate: '2026-04-09', distance: '195 km' },
  { id: 'LD-1013', source: 'Visakhapatnam, AP', destination: 'Vijayawada, AP', pickupDate: '2026-04-13', vehicleType: 'Container 20ft', weight: 5500, budget: 20000, status: 'pending', bidsCount: 3, postedDate: '2026-04-09', distance: '350 km' },
  { id: 'LD-1014', source: 'Kanpur, UP', destination: 'Varanasi, UP', pickupDate: '2026-04-14', vehicleType: 'Trailer', weight: 18000, budget: 55000, status: 'active', bidsCount: 5, postedDate: '2026-04-08', distance: '330 km' },
  { id: 'LD-1015', source: 'Rajkot, GJ', destination: 'Mumbai, MH', pickupDate: '2026-04-10', vehicleType: 'Container 40ft', weight: 14000, budget: 48000, status: 'in_transit', bidsCount: 7, postedDate: '2026-04-06', assignedDriver: 'Mohammed Ali', distance: '660 km' },
  { id: 'LD-1016', source: 'Mysore, KA', destination: 'Chennai, TN', pickupDate: '2026-04-15', vehicleType: 'Refrigerated', weight: 3000, budget: 22000, status: 'pending', bidsCount: 2, postedDate: '2026-04-09', distance: '480 km' },
  { id: 'LD-1017', source: 'Thiruvananthapuram, KL', destination: 'Bangalore, KA', pickupDate: '2026-04-11', vehicleType: 'Closed Body', weight: 4200, budget: 28000, status: 'completed', bidsCount: 6, postedDate: '2026-04-02', assignedDriver: 'Deepak Nair', distance: '730 km' },
  { id: 'LD-1018', source: 'Ludhiana, PB', destination: 'Delhi, DL', pickupDate: '2026-04-12', vehicleType: 'Open Truck', weight: 3800, budget: 16000, status: 'delivered', bidsCount: 4, postedDate: '2026-04-04', assignedDriver: 'Harpreet Singh', distance: '310 km' },
  { id: 'LD-1019', source: 'Ranchi, JH', destination: 'Kolkata, WB', pickupDate: '2026-04-13', vehicleType: 'Container 20ft', weight: 6500, budget: 32000, status: 'active', bidsCount: 3, postedDate: '2026-04-08', distance: '400 km' },
  { id: 'LD-1020', source: 'Bhubaneswar, OD', destination: 'Visakhapatnam, AP', pickupDate: '2026-04-14', vehicleType: 'Trailer', weight: 16000, budget: 42000, status: 'pending', bidsCount: 1, postedDate: '2026-04-09', distance: '440 km' },
];

// ─── Drivers ─────────────────────────────────────────────────────────────────

export const drivers: Driver[] = [
  { id: 'DR-001', name: 'Suresh Kumar', phone: '+91 98765 43210', email: 'suresh.k@email.com', vehicleType: 'Container 20ft', vehicleNumber: 'MH-04-AB-1234', licenseNumber: 'DL-2020-0045', rating: 4.8, totalTrips: 342, status: 'approved', documentsStatus: { license: 'verified', insurance: 'verified', registration: 'verified', aadhar: 'verified' }, joinedDate: '2024-03-15' },
  { id: 'DR-002', name: 'Rajesh Patel', phone: '+91 87654 32109', email: 'rajesh.p@email.com', vehicleType: 'Container 40ft', vehicleNumber: 'GJ-01-CD-5678', licenseNumber: 'DL-2019-0112', rating: 4.6, totalTrips: 278, status: 'approved', documentsStatus: { license: 'verified', insurance: 'verified', registration: 'verified', aadhar: 'verified' }, joinedDate: '2024-01-10' },
  { id: 'DR-003', name: 'Amar Singh', phone: '+91 76543 21098', email: 'amar.s@email.com', vehicleType: 'Closed Body', vehicleNumber: 'RJ-14-EF-9012', licenseNumber: 'DL-2021-0078', rating: 4.9, totalTrips: 415, status: 'approved', documentsStatus: { license: 'verified', insurance: 'verified', registration: 'verified', aadhar: 'verified' }, joinedDate: '2023-11-20' },
  { id: 'DR-004', name: 'Vikram Yadav', phone: '+91 65432 10987', email: 'vikram.y@email.com', vehicleType: 'Open Truck', vehicleNumber: 'UP-32-GH-3456', licenseNumber: 'DL-2022-0034', rating: 4.3, totalTrips: 156, status: 'approved', documentsStatus: { license: 'verified', insurance: 'pending', registration: 'verified', aadhar: 'verified' }, joinedDate: '2024-06-05' },
  { id: 'DR-005', name: 'Ravi Shankar', phone: '+91 54321 09876', email: 'ravi.s@email.com', vehicleType: 'Container 20ft', vehicleNumber: 'KA-01-IJ-7890', licenseNumber: 'DL-2020-0089', rating: 4.5, totalTrips: 210, status: 'approved', documentsStatus: { license: 'verified', insurance: 'verified', registration: 'verified', aadhar: 'verified' }, joinedDate: '2024-04-18' },
  { id: 'DR-006', name: 'Mohammed Ali', phone: '+91 43210 98765', email: 'mohammed.a@email.com', vehicleType: 'Container 40ft', vehicleNumber: 'TN-09-KL-2345', licenseNumber: 'DL-2018-0156', rating: 4.7, totalTrips: 520, status: 'approved', documentsStatus: { license: 'verified', insurance: 'verified', registration: 'verified', aadhar: 'verified' }, joinedDate: '2023-08-12' },
  { id: 'DR-007', name: 'Deepak Nair', phone: '+91 32109 87654', email: 'deepak.n@email.com', vehicleType: 'Closed Body', vehicleNumber: 'KL-07-MN-6789', licenseNumber: 'DL-2021-0201', rating: 4.4, totalTrips: 187, status: 'approved', documentsStatus: { license: 'verified', insurance: 'verified', registration: 'pending', aadhar: 'verified' }, joinedDate: '2024-02-28' },
  { id: 'DR-008', name: 'Harpreet Singh', phone: '+91 21098 76543', email: 'harpreet.s@email.com', vehicleType: 'Open Truck', vehicleNumber: 'PB-10-OP-0123', licenseNumber: 'DL-2019-0098', rating: 4.2, totalTrips: 298, status: 'approved', documentsStatus: { license: 'verified', insurance: 'verified', registration: 'verified', aadhar: 'verified' }, joinedDate: '2024-05-10' },
  { id: 'DR-009', name: 'Pradeep Reddy', phone: '+91 10987 65432', email: 'pradeep.r@email.com', vehicleType: 'Trailer', vehicleNumber: 'AP-31-QR-4567', licenseNumber: 'DL-2023-0012', rating: 3.9, totalTrips: 45, status: 'pending_approval', documentsStatus: { license: 'verified', insurance: 'pending', registration: 'verified', aadhar: 'verified' }, joinedDate: '2026-04-01' },
  { id: 'DR-010', name: 'Arvind Sharma', phone: '+91 09876 54321', email: 'arvind.s@email.com', vehicleType: 'Refrigerated', vehicleNumber: 'MP-09-ST-8901', licenseNumber: 'DL-2023-0045', rating: 4.0, totalTrips: 32, status: 'pending_approval', documentsStatus: { license: 'verified', insurance: 'missing', registration: 'pending', aadhar: 'verified' }, joinedDate: '2026-03-28' },
  { id: 'DR-011', name: 'Karthik Iyer', phone: '+91 98712 34567', email: 'karthik.i@email.com', vehicleType: 'Container 20ft', vehicleNumber: 'TN-01-UV-2345', licenseNumber: 'DL-2023-0067', rating: 0, totalTrips: 0, status: 'pending_approval', documentsStatus: { license: 'pending', insurance: 'missing', registration: 'missing', aadhar: 'verified' }, joinedDate: '2026-04-05' },
  { id: 'DR-012', name: 'Sanjay Gupta', phone: '+91 87612 34567', email: 'sanjay.g@email.com', vehicleType: 'Open Truck', vehicleNumber: 'DL-01-WX-6789', licenseNumber: 'DL-2022-0189', rating: 3.5, totalTrips: 78, status: 'rejected', documentsStatus: { license: 'rejected', insurance: 'rejected', registration: 'verified', aadhar: 'verified' }, joinedDate: '2025-12-15' },
  { id: 'DR-013', name: 'Anand Verma', phone: '+91 76512 34567', email: 'anand.v@email.com', vehicleType: 'Closed Body', vehicleNumber: 'UP-80-YZ-0123', licenseNumber: 'DL-2023-0089', rating: 4.1, totalTrips: 22, status: 'pending_approval', documentsStatus: { license: 'verified', insurance: 'verified', registration: 'pending', aadhar: 'pending' }, joinedDate: '2026-04-07' },
  { id: 'DR-014', name: 'Ramesh Babu', phone: '+91 65412 34567', email: 'ramesh.b@email.com', vehicleType: 'Trailer', vehicleNumber: 'KA-05-AB-4567', licenseNumber: 'DL-2020-0234', rating: 4.6, totalTrips: 310, status: 'suspended', documentsStatus: { license: 'verified', insurance: 'verified', registration: 'verified', aadhar: 'verified' }, joinedDate: '2023-09-20' },
  { id: 'DR-015', name: 'Prakash Joshi', phone: '+91 54312 34567', email: 'prakash.j@email.com', vehicleType: 'Container 20ft', vehicleNumber: 'MH-12-CD-8901', licenseNumber: 'DL-2023-0101', rating: 0, totalTrips: 0, status: 'pending_approval', documentsStatus: { license: 'verified', insurance: 'pending', registration: 'verified', aadhar: 'missing' }, joinedDate: '2026-04-09' },
];

// ─── Bids ────────────────────────────────────────────────────────────────────

export const bids: Bid[] = [
  { id: 'BD-001', loadId: 'LD-1001', driverId: 'DR-001', driverName: 'Suresh Kumar', driverRating: 4.8, vehicleType: 'Container 20ft', vehicleNumber: 'MH-04-AB-1234', price: 42000, eta: '18 hrs', distance: '1,420 km', status: 'pending', submittedAt: '2026-04-08 14:30', totalTrips: 342 },
  { id: 'BD-002', loadId: 'LD-1001', driverId: 'DR-005', driverName: 'Ravi Shankar', driverRating: 4.5, vehicleType: 'Container 20ft', vehicleNumber: 'KA-01-IJ-7890', price: 44500, eta: '20 hrs', distance: '1,450 km', status: 'pending', submittedAt: '2026-04-08 15:15', totalTrips: 210 },
  { id: 'BD-003', loadId: 'LD-1001', driverId: 'DR-006', driverName: 'Mohammed Ali', driverRating: 4.7, vehicleType: 'Container 40ft', vehicleNumber: 'TN-09-KL-2345', price: 40000, eta: '17 hrs', distance: '1,400 km', status: 'pending', submittedAt: '2026-04-08 16:00', totalTrips: 520 },
  { id: 'BD-004', loadId: 'LD-1001', driverId: 'DR-003', driverName: 'Amar Singh', driverRating: 4.9, vehicleType: 'Closed Body', vehicleNumber: 'RJ-14-EF-9012', price: 46000, eta: '19 hrs', distance: '1,430 km', status: 'pending', submittedAt: '2026-04-08 17:45', totalTrips: 415 },
  { id: 'BD-005', loadId: 'LD-1001', driverId: 'DR-008', driverName: 'Harpreet Singh', driverRating: 4.2, vehicleType: 'Open Truck', vehicleNumber: 'PB-10-OP-0123', price: 38000, eta: '22 hrs', distance: '1,480 km', status: 'pending', submittedAt: '2026-04-09 08:20', totalTrips: 298 },
  { id: 'BD-006', loadId: 'LD-1002', driverId: 'DR-005', driverName: 'Ravi Shankar', driverRating: 4.5, vehicleType: 'Container 20ft', vehicleNumber: 'KA-01-IJ-7890', price: 14000, eta: '5 hrs', distance: '350 km', status: 'pending', submittedAt: '2026-04-09 09:00', totalTrips: 210 },
  { id: 'BD-007', loadId: 'LD-1002', driverId: 'DR-007', driverName: 'Deepak Nair', driverRating: 4.4, vehicleType: 'Closed Body', vehicleNumber: 'KL-07-MN-6789', price: 13500, eta: '5.5 hrs', distance: '360 km', status: 'pending', submittedAt: '2026-04-09 10:30', totalTrips: 187 },
  { id: 'BD-008', loadId: 'LD-1002', driverId: 'DR-004', driverName: 'Vikram Yadav', driverRating: 4.3, vehicleType: 'Open Truck', vehicleNumber: 'UP-32-GH-3456', price: 15500, eta: '6 hrs', distance: '370 km', status: 'pending', submittedAt: '2026-04-09 11:15', totalTrips: 156 },
  { id: 'BD-009', loadId: 'LD-1004', driverId: 'DR-002', driverName: 'Rajesh Patel', driverRating: 4.6, vehicleType: 'Container 40ft', vehicleNumber: 'GJ-01-CD-5678', price: 62000, eta: '8 hrs', distance: '560 km', status: 'pending', submittedAt: '2026-04-09 12:00', totalTrips: 278 },
  { id: 'BD-010', loadId: 'LD-1004', driverId: 'DR-006', driverName: 'Mohammed Ali', driverRating: 4.7, vehicleType: 'Container 40ft', vehicleNumber: 'TN-09-KL-2345', price: 58000, eta: '9 hrs', distance: '580 km', status: 'pending', submittedAt: '2026-04-09 13:30', totalTrips: 520 },
];

// ─── Payments ────────────────────────────────────────────────────────────────

export const payments: Payment[] = [
  { id: 'PAY-001', loadId: 'LD-1005', driverName: 'Rajesh Patel', driverId: 'DR-002', amount: 52000, status: 'paid', dueDate: '2026-04-07', paidDate: '2026-04-06', route: 'Ahmedabad → Jaipur', paymentMethod: 'Bank Transfer' },
  { id: 'PAY-002', loadId: 'LD-1009', driverName: 'Vikram Yadav', driverId: 'DR-004', amount: 12000, status: 'paid', dueDate: '2026-04-05', paidDate: '2026-04-05', route: 'Delhi → Chandigarh', paymentMethod: 'UPI' },
  { id: 'PAY-003', loadId: 'LD-1017', driverName: 'Deepak Nair', driverId: 'DR-007', amount: 28000, status: 'paid', dueDate: '2026-04-04', paidDate: '2026-04-04', route: 'Thiruvananthapuram → Bangalore', paymentMethod: 'Bank Transfer' },
  { id: 'PAY-004', loadId: 'LD-1018', driverName: 'Harpreet Singh', driverId: 'DR-008', amount: 16000, status: 'paid', dueDate: '2026-04-06', paidDate: '2026-04-06', route: 'Ludhiana → Delhi', paymentMethod: 'UPI' },
  { id: 'PAY-005', loadId: 'LD-1003', driverName: 'Suresh Kumar', driverId: 'DR-001', amount: 28000, status: 'pending', dueDate: '2026-04-12', route: 'Kolkata → Guwahati', paymentMethod: 'Bank Transfer' },
  { id: 'PAY-006', loadId: 'LD-1007', driverName: 'Amar Singh', driverId: 'DR-003', amount: 35000, status: 'pending', dueDate: '2026-04-14', route: 'Surat → Nagpur' },
  { id: 'PAY-007', loadId: 'LD-1010', driverName: 'Ravi Shankar', driverId: 'DR-005', amount: 38000, status: 'overdue', dueDate: '2026-04-08', route: 'Bangalore → Hyderabad' },
  { id: 'PAY-008', loadId: 'LD-1015', driverName: 'Mohammed Ali', driverId: 'DR-006', amount: 48000, status: 'pending', dueDate: '2026-04-13', route: 'Rajkot → Mumbai' },
  { id: 'PAY-009', loadId: 'LD-1001', driverName: 'Suresh Kumar', driverId: 'DR-001', amount: 45000, status: 'processing', dueDate: '2026-04-15', route: 'Mumbai → Delhi' },
  { id: 'PAY-010', loadId: 'LD-1006', driverName: 'Vikram Yadav', driverId: 'DR-004', amount: 22000, status: 'pending', dueDate: '2026-04-16', route: 'Lucknow → Patna' },
  { id: 'PAY-011', loadId: 'LD-1011', driverName: 'Amar Singh', driverId: 'DR-003', amount: 14000, status: 'pending', dueDate: '2026-04-15', route: 'Pune → Goa' },
  { id: 'PAY-012', loadId: 'LD-1014', driverName: 'Harpreet Singh', driverId: 'DR-008', amount: 55000, status: 'overdue', dueDate: '2026-04-05', route: 'Kanpur → Varanasi' },
  { id: 'PAY-013', loadId: 'LD-1019', driverName: 'Deepak Nair', driverId: 'DR-007', amount: 32000, status: 'processing', dueDate: '2026-04-17', route: 'Ranchi → Kolkata' },
];

// ─── Chart Data ──────────────────────────────────────────────────────────────

export const revenueData: RevenueDataPoint[] = [
  { month: 'Jan', revenue: 320000 },
  { month: 'Feb', revenue: 450000 },
  { month: 'Mar', revenue: 380000 },
  { month: 'Apr', revenue: 580000 },
  { month: 'May', revenue: 720000 },
  { month: 'Jun', revenue: 620000 },
  { month: 'Jul', revenue: 810000 },
  { month: 'Aug', revenue: 750000 },
  { month: 'Sep', revenue: 890000 },
  { month: 'Oct', revenue: 950000 },
  { month: 'Nov', revenue: 1020000 },
  { month: 'Dec', revenue: 1150000 },
];

export const volumeData: VolumeDataPoint[] = [
  { day: 'Mon', volume: 40, highlight: false },
  { day: 'Tue', volume: 65, highlight: false },
  { day: 'Wed', volume: 55, highlight: false },
  { day: 'Thu', volume: 95, highlight: true },
  { day: 'Fri', volume: 75, highlight: false },
  { day: 'Sat', volume: 60, highlight: false },
  { day: 'Sun', volume: 85, highlight: false },
];

export const fillRateData = [
  { month: 'Jan', rate: 72 },
  { month: 'Feb', rate: 78 },
  { month: 'Mar', rate: 75 },
  { month: 'Apr', rate: 82 },
  { month: 'May', rate: 88 },
  { month: 'Jun', rate: 85 },
  { month: 'Jul', rate: 91 },
  { month: 'Aug', rate: 87 },
  { month: 'Sep', rate: 93 },
  { month: 'Oct', rate: 89 },
  { month: 'Nov', rate: 94 },
  { month: 'Dec', rate: 92 },
];

// ─── Activity Feed ───────────────────────────────────────────────────────────

export const recentActivity: ActivityItem[] = [
  { id: 'ACT-001', type: 'load_posted', message: 'New load posted: Mumbai → Delhi (LD-1001)', time: '5 min ago', status: 'active' },
  { id: 'ACT-002', type: 'bid_received', message: 'Bid received from Suresh Kumar for LD-1001 — ₹42,000', time: '12 min ago' },
  { id: 'ACT-003', type: 'driver_assigned', message: 'Amar Singh assigned to LD-1007 (Surat → Nagpur)', time: '45 min ago' },
  { id: 'ACT-004', type: 'delivery_completed', message: 'LD-1005 delivered successfully — Ahmedabad → Jaipur', time: '1 hr ago', status: 'completed' },
  { id: 'ACT-005', type: 'payment_processed', message: 'Payment of ₹52,000 processed for Rajesh Patel', time: '2 hrs ago' },
  { id: 'ACT-006', type: 'bid_received', message: '3 new bids received for LD-1002 (Chennai → Bangalore)', time: '2.5 hrs ago' },
  { id: 'ACT-007', type: 'load_posted', message: 'New load posted: Hyderabad → Pune (LD-1004)', time: '3 hrs ago', status: 'pending' },
  { id: 'ACT-008', type: 'delivery_completed', message: 'LD-1009 delivered — Delhi → Chandigarh', time: '4 hrs ago', status: 'completed' },
  { id: 'ACT-009', type: 'driver_assigned', message: 'Mohammed Ali assigned to LD-1015 (Rajkot → Mumbai)', time: '5 hrs ago' },
  { id: 'ACT-010', type: 'payment_processed', message: 'Payment of ₹12,000 processed for Vikram Yadav', time: '6 hrs ago' },
];

// ─── Vehicle Types ───────────────────────────────────────────────────────────

// Must match the driver app's onboarding vocabulary
// (6Ways web: OnboardingWizard VEHICLE_TYPES) so a posted load's vehicleType
// can match a driver's vehicleType on the board filter. Keep these in sync.
export const vehicleTypes = [
  'truck',
  'mini-truck',
  'trailer',
  'container',
];

// ─── Indian Cities for AutoComplete ──────────────────────────────────────────

export const indianCities = [
  'Mumbai, MH', 'Delhi, DL', 'Bangalore, KA', 'Chennai, TN', 'Kolkata, WB',
  'Hyderabad, TS', 'Pune, MH', 'Ahmedabad, GJ', 'Jaipur, RJ', 'Surat, GJ',
  'Lucknow, UP', 'Kanpur, UP', 'Nagpur, MH', 'Indore, MP', 'Bhopal, MP',
  'Patna, BR', 'Guwahati, AS', 'Chandigarh, PB', 'Coimbatore, TN', 'Kochi, KL',
  'Visakhapatnam, AP', 'Vijayawada, AP', 'Mysore, KA', 'Rajkot, GJ', 'Goa, GA',
  'Ludhiana, PB', 'Thiruvananthapuram, KL', 'Ranchi, JH', 'Bhubaneswar, OD',
  'Varanasi, UP', 'Agra, UP', 'Nashik, MH', 'Jodhpur, RJ', 'Udaipur, RJ',
  'Dehradun, UK', 'Shimla, HP', 'Amritsar, PB', 'Jalandhar, PB',
];

// ─── Driver Performance ──────────────────────────────────────────────────────
export interface DriverPerformance {
  key: string;
  name: string;
  phone: string;
  totalTrips: number;
  activeTrips: number;
  successRate: number;
  avgTripValue: number;
  totalEarnings: number;
  lastActive: string;
  verificationStatus: 'approved' | 'pending_approval' | 'rejected' | 'suspended';
}

export const driverPerformanceData: DriverPerformance[] = [
  { key: '1', name: 'Suresh Kumar', phone: '+91 98765 43210', totalTrips: 342, activeTrips: 2, successRate: 98.5, avgTripValue: 35000, totalEarnings: 11970000, lastActive: '2026-05-25', verificationStatus: 'approved' },
  { key: '2', name: 'Rajesh Patel', phone: '+91 87654 32109', totalTrips: 278, activeTrips: 1, successRate: 96.2, avgTripValue: 42000, totalEarnings: 11676000, lastActive: '2026-05-24', verificationStatus: 'approved' },
  { key: '3', name: 'Amar Singh', phone: '+91 76543 21098', totalTrips: 415, activeTrips: 3, successRate: 99.1, avgTripValue: 31000, totalEarnings: 12865000, lastActive: '2026-05-25', verificationStatus: 'approved' },
  { key: '4', name: 'Vikram Yadav', phone: '+91 65432 10987', totalTrips: 156, activeTrips: 1, successRate: 92.4, avgTripValue: 24000, totalEarnings: 3744000, lastActive: '2026-05-23', verificationStatus: 'approved' },
  { key: '5', name: 'Ravi Shankar', phone: '+91 54321 09876', totalTrips: 210, activeTrips: 2, successRate: 95.8, avgTripValue: 29000, totalEarnings: 6090000, lastActive: '2026-05-25', verificationStatus: 'approved' },
  { key: '6', name: 'Mohammed Ali', phone: '+91 43210 98765', totalTrips: 520, activeTrips: 4, successRate: 99.4, avgTripValue: 45000, totalEarnings: 23400000, lastActive: '2026-05-25', verificationStatus: 'approved' },
  { key: '7', name: 'Deepak Nair', phone: '+91 32109 87654', totalTrips: 187, activeTrips: 1, successRate: 94.6, avgTripValue: 28000, totalEarnings: 5236000, lastActive: '2026-05-24', verificationStatus: 'approved' },
  { key: '8', name: 'Harpreet Singh', phone: '+91 21098 76543', totalTrips: 298, activeTrips: 2, successRate: 97.0, avgTripValue: 38000, totalEarnings: 11324000, lastActive: '2026-05-25', verificationStatus: 'approved' },
  { key: '9', name: 'Pradeep Reddy', phone: '+91 10987 65432', totalTrips: 45, activeTrips: 0, successRate: 91.1, avgTripValue: 32000, totalEarnings: 1440000, lastActive: '2026-05-20', verificationStatus: 'pending_approval' },
  { key: '10', name: 'Arvind Sharma', phone: '+91 09876 54321', totalTrips: 32, activeTrips: 0, successRate: 89.5, avgTripValue: 28000, totalEarnings: 896000, lastActive: '2026-05-18', verificationStatus: 'pending_approval' },
];

export const driverLeaderboardData = [...driverPerformanceData]
  .sort((a, b) => b.totalTrips - a.totalTrips)
  .slice(0, 10);

// ─── Load Performance ────────────────────────────────────────────────────────
export interface LoadPerformance {
  key: string;
  loadId: string;
  route: string;
  cargoType: string;
  basePrice: number;
  bidCount: number;
  winningBid: number;
  bidRange: string;
  timeToAssign: string;
  status: string;
  postedDate: string;
}

export const loadPerformanceData: LoadPerformance[] = [
  { key: '1', loadId: 'LD-1001', route: 'Mumbai → Delhi', cargoType: 'Industrial Goods', basePrice: 45000, bidCount: 5, winningBid: 42000, bidRange: '₹38,000 - ₹46,000', timeToAssign: '4.2 hrs', status: 'Active', postedDate: '2026-04-08' },
  { key: '2', loadId: 'LD-1003', route: 'Kolkata → Guwahati', cargoType: 'Chemicals', basePrice: 28000, bidCount: 7, winningBid: 27500, bidRange: '₹26,000 - ₹29,000', timeToAssign: '2.5 hrs', status: 'In Transit', postedDate: '2026-04-07' },
  { key: '3', loadId: 'LD-1005', route: 'Ahmedabad → Jaipur', cargoType: 'Electronics', basePrice: 52000, bidCount: 6, winningBid: 51000, bidRange: '₹48,000 - ₹53,000', timeToAssign: '1.8 hrs', status: 'Delivered', postedDate: '2026-04-05' },
  { key: '4', loadId: 'LD-1007', route: 'Surat → Nagpur', cargoType: 'Textiles', basePrice: 35000, bidCount: 8, winningBid: 34000, bidRange: '₹32,000 - ₹36,000', timeToAssign: '3.1 hrs', status: 'In Transit', postedDate: '2026-04-06' },
  { key: '5', loadId: 'LD-1009', route: 'Delhi → Chandigarh', cargoType: 'FMCG', basePrice: 12000, bidCount: 5, winningBid: 11500, bidRange: '₹11,000 - ₹12,500', timeToAssign: '1.2 hrs', status: 'Completed', postedDate: '2026-04-03' },
  { key: '6', loadId: 'LD-1010', route: 'Bangalore → Hyderabad', cargoType: 'Auto Parts', basePrice: 38000, bidCount: 4, winningBid: 37000, bidRange: '₹36,000 - ₹39,500', timeToAssign: '5.0 hrs', status: 'Delayed', postedDate: '2026-04-07' },
];

export const loadBiddingMetrics = {
  avgBidsPerLoad: 4.8,
  avgBidVsBaseDiff: -3.2,
  bidAcceptanceRate: 94.2,
  bidToAssignmentTime: '2.8 hrs',
};

// ─── Trip & POD Analytics ────────────────────────────────────────────────────
export interface TripDetail {
  key: string;
  assignmentId: string;
  driverName: string;
  route: string;
  status: string;
  startDate: string;
  duration: string;
  agreedPrice: number;
  podStatus: 'approved' | 'pending' | 'rejected' | 'missing';
}

export const tripDetailsData: TripDetail[] = [
  { key: '1', assignmentId: 'TX-5001', driverName: 'Suresh Kumar', route: 'Mumbai → Delhi', status: 'Active', startDate: '2026-05-24', duration: '28 hrs', agreedPrice: 42000, podStatus: 'pending' },
  { key: '2', assignmentId: 'TX-5002', driverName: 'Rajesh Patel', route: 'Ahmedabad → Jaipur', status: 'Completed', startDate: '2026-05-22', duration: '18 hrs', agreedPrice: 51000, podStatus: 'approved' },
  { key: '3', assignmentId: 'TX-5003', driverName: 'Amar Singh', route: 'Surat → Nagpur', status: 'In Transit', startDate: '2026-05-23', duration: '22 hrs', agreedPrice: 34000, podStatus: 'missing' },
  { key: '4', assignmentId: 'TX-5004', driverName: 'Vikram Yadav', route: 'Delhi → Chandigarh', status: 'Completed', startDate: '2026-05-21', duration: '7 hrs', agreedPrice: 11500, podStatus: 'approved' },
  { key: '5', assignmentId: 'TX-5005', driverName: 'Ravi Shankar', route: 'Bangalore → Hyderabad', status: 'Delayed', startDate: '2026-05-23', duration: '14 hrs', agreedPrice: 37000, podStatus: 'rejected' },
  { key: '6', assignmentId: 'TX-5006', driverName: 'Mohammed Ali', route: 'Rajkot → Mumbai', status: 'Completed', startDate: '2026-05-20', duration: '20 hrs', agreedPrice: 48000, podStatus: 'approved' },
];

export const tripPerformanceSummary = {
  totalTrips: 1842,
  completedTrips: 1682,
  inProgressTrips: 112,
  cancelledTrips: 48,
  completionRate: 91.3,
  avgDurationHours: 19.5,
};

export const podMetrics = {
  avgTripDuration: '19.5 hrs',
  podFirstTimeApprovalRate: 88.5,
  avgPodReviewTime: '45 mins',
};

// ─── Payment Analytics ───────────────────────────────────────────────────────
export interface PaymentPipeline {
  key: string;
  stage: string;
  count: number;
  totalAmount: number;
}

export const paymentPipelineData: PaymentPipeline[] = [
  { key: '1', stage: 'Pending Advance Payout', count: 18, totalAmount: 185000 },
  { key: '2', stage: 'Advance Paid', count: 42, totalAmount: 450000 },
  { key: '3', stage: 'Pending Balance Payout (POD Pending)', count: 12, totalAmount: 240000 },
  { key: '4', stage: 'Balance Approved & Processing', count: 8, totalAmount: 160000 },
  { key: '5', stage: 'Paid & Closed', count: 1240, totalAmount: 24800000 },
];

export interface PaymentDetail {
  key: string;
  assignmentId: string;
  driverName: string;
  totalAmount: number;
  advancePaid: number;
  advanceStatus: string;
  balancePaid: number;
  balanceStatus: string;
  dueDate: string;
  paidDate: string;
}

export const paymentDetailsData: PaymentDetail[] = [
  { key: '1', assignmentId: 'TX-5001', driverName: 'Suresh Kumar', totalAmount: 42000, advancePaid: 21000, advanceStatus: 'Paid', balancePaid: 0, balanceStatus: 'Pending POD', dueDate: '2026-05-30', paidDate: '-' },
  { key: '2', assignmentId: 'TX-5002', driverName: 'Rajesh Patel', totalAmount: 51000, advancePaid: 25500, advanceStatus: 'Paid', balancePaid: 25500, balanceStatus: 'Paid', dueDate: '2026-05-24', paidDate: '2026-05-23' },
  { key: '3', assignmentId: 'TX-5003', driverName: 'Amar Singh', totalAmount: 34000, advancePaid: 17000, advanceStatus: 'Paid', balancePaid: 0, balanceStatus: 'Pending POD', dueDate: '2026-05-29', paidDate: '-' },
  { key: '4', assignmentId: 'TX-5004', driverName: 'Vikram Yadav', totalAmount: 11500, advancePaid: 5750, advanceStatus: 'Paid', balancePaid: 5750, balanceStatus: 'Paid', dueDate: '2026-05-23', paidDate: '2026-05-23' },
  { key: '5', assignmentId: 'TX-5005', driverName: 'Ravi Shankar', totalAmount: 37000, advancePaid: 18500, advanceStatus: 'Paid', balancePaid: 0, balanceStatus: 'Disputed', dueDate: '2026-05-25', paidDate: '-' },
];

export const payoutMetrics = {
  totalPaidOutMonth: 2840000,
  totalPendingPayouts: 240000,
  avgDaysToPayment: 3.2,
  paymentDisputeCount: 2,
};

// ─── Operational Efficiency ──────────────────────────────────────────────────
export interface AdminWorkload {
  key: string;
  taskType: string;
  pendingCount: number;
  avgTimeToComplete: string;
  slaTarget: string;
}

export const adminWorkloadData: AdminWorkload[] = [
  { key: '1', taskType: 'Driver Verification', pendingCount: 4, avgTimeToComplete: '22 mins', slaTarget: '30 mins' },
  { key: '2', taskType: 'POD Reviews', pendingCount: 12, avgTimeToComplete: '45 mins', slaTarget: '60 mins' },
  { key: '3', taskType: 'Bid Acceptance Reviews', pendingCount: 8, avgTimeToComplete: '10 mins', slaTarget: '15 mins' },
  { key: '4', taskType: 'Payment Release Approvals', pendingCount: 7, avgTimeToComplete: '18 mins', slaTarget: '30 mins' },
];

export const slaMetrics = {
  driverVerificationAvgTime: '22 mins',
  podReviewAvgTime: '45 mins',
  bidReviewAvgTime: '10 mins',
  paymentReleaseAvgTime: '18 mins',
};

// ─── Route & Geography ───────────────────────────────────────────────────────
export interface RoutePerformance {
  key: string;
  origin: string;
  destination: string;
  avgBids: number;
  avgBidAmount: number;
  avgDuration: string;
  totalTrips: number;
}

export const routePerformanceMatrix: RoutePerformance[] = [
  { key: '1', origin: 'Mumbai', destination: 'Delhi', avgBids: 5.2, avgBidAmount: 42000, avgDuration: '28 hrs', totalTrips: 185 },
  { key: '2', origin: 'Chennai', destination: 'Coimbatore', avgBids: 4.8, avgBidAmount: 17200, avgDuration: '10 hrs', totalTrips: 142 },
  { key: '3', origin: 'Madurai', destination: 'Chennai', avgBids: 4.5, avgBidAmount: 16800, avgDuration: '11 hrs', totalTrips: 128 },
  { key: '4', origin: 'Salem', destination: 'Trichy', avgBids: 3.9, avgBidAmount: 8900, avgDuration: '4 hrs', totalTrips: 98 },
  { key: '5', origin: 'Coimbatore', destination: 'Salem', avgBids: 4.1, avgBidAmount: 8400, avgDuration: '5 hrs', totalTrips: 86 },
];

export interface CityActivity {
  key: string;
  city: string;
  asOriginCount: number;
  asDestinationCount: number;
  totalVolume: number;
}

export const cityActivityData: CityActivity[] = [
  { key: '1', city: 'Chennai', asOriginCount: 327, asDestinationCount: 290, totalVolume: 617 },
  { key: '2', city: 'Mumbai', asOriginCount: 245, asDestinationCount: 220, totalVolume: 465 },
  { key: '3', city: 'Delhi', asOriginCount: 198, asDestinationCount: 234, totalVolume: 432 },
  { key: '4', city: 'Coimbatore', asOriginCount: 180, asDestinationCount: 210, totalVolume: 390 },
  { key: '5', city: 'Bangalore', asOriginCount: 165, asDestinationCount: 185, totalVolume: 350 },
];

// ─── Executive Dashboard Trends (30 Days Daily Trips & Top Routes) ───────────
export const dailyTripCompletionsTrend = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - 30 + i);
  return {
    date: d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
    trips: Math.round(15 + Math.random() * 15 + Math.sin(i / 2) * 5),
  };
});

export const topRoutesByVolume = [
  { route: 'Chennai → Coimbatore', volume: 185 },
  { route: 'Chennai → Madurai', volume: 142 },
  { route: 'Madurai → Chennai', volume: 128 },
  { route: 'Salem → Trichy', volume: 98 },
  { route: 'Coimbatore → Salem', volume: 86 },
  { route: 'Trichy → Madurai', volume: 74 },
  { route: 'Mumbai → Delhi', volume: 68 },
  { route: 'Delhi → Chandigarh', volume: 62 },
  { route: 'Bangalore → Hyderabad', volume: 55 },
  { route: 'Kolkata → Guwahati', volume: 48 },
];

