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

export const vehicleTypes = [
  'Open Truck',
  'Closed Body',
  'Container 20ft',
  'Container 40ft',
  'Trailer',
  'Refrigerated',
  'Flatbed',
  'Tanker',
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
