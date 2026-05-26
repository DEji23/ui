export type DriverStatus = "active" | "offline" | "late" | "on_leave" | "blocked" | "pending"
export type VerificationStatus = "unverified" | "pending_docs" | "verified" | "rejected"
export type BusStatus = "active" | "available" | "blocked" | "maintenance"
export type AlertType = "breakdown" | "late_start" | "code_red" | "inspection_fail" | "cash_discrepancy" | "no_show"
export type AlertSeverity = "critical" | "warning" | "info"
export type TripStatus = "scheduled" | "boarding" | "en_route" | "completed" | "cancelled"
export type ReconciliationStatus = "match" | "discrepancy" | "pending"
export type LeaveType = "annual" | "sick" | "emergency" | "personal"
export type LeaveStatus = "pending" | "approved" | "declined" | "modified"

export interface Driver {
  id: string
  name: string
  code: string
  phone: string
  status: DriverStatus
  route?: string
  bus?: string
  currentPassengers?: number
  tripsToday: number
  earningsToday: number
  rating: number
  shiftStart?: string
  complianceStatus: "clear" | "warning" | "blocked"
  hoursThisWeek: number
  // Extended fields
  licenseNumber?: string
  licenseExpiry?: string   // "YYYY-MM-DD"
  address?: string
  nin?: string
  verificationStatus?: VerificationStatus
  joinedDate?: string      // "YYYY-MM-DD"
  onTimeRate?: number      // 0-100
  completionRate?: number  // 0-100
  incidentCount?: number
  busId?: string           // for the assigned bus reference
  assignmentType?: "primary" | "backup" | "temporary"
}

export interface Bus {
  id: string
  code: string
  model: string
  plate: string
  status: BusStatus
  route?: string
  driver?: string
  capacity: number
  currentPassengers?: number
  lastInspection: string
  inspectionResult: "pass" | "fail" | "pending"
  fuelLevel?: number
}

export interface Alert {
  id: string
  type: AlertType
  severity: AlertSeverity
  title: string
  description: string
  driver?: string
  bus?: string
  location?: string
  timestamp: string
  acknowledged: boolean
}

export interface Trip {
  id: string
  driver: string
  bus: string
  route: string
  status: TripStatus
  passengers: number
  capacity: number
  departure: string
  arrival?: string
  revenue: number
  tripNumber: number
}

export interface ReconciliationItem {
  id: string
  driver: string
  bus: string
  shift: string
  expectedCash: number
  declaredCash: number
  walletEarnings: number
  status: ReconciliationStatus
  discrepancyReason?: string
  timestamp: string
}

export interface LeaveRequest {
  id: string
  driver: string
  driverCode: string
  type: LeaveType
  from: string
  to: string
  status: LeaveStatus
  affectedDuties: number
  reason?: string
  submittedAt: string
}

export interface DispatchPlan {
  id: string
  driver: string
  driverCode: string
  bus: string
  route: string
  trips: number
  departure: string
  status: "active" | "no_show" | "completed" | "pending"
}

export interface RevenueDataPoint {
  date: string
  revenue: number
  passengers: number
}

export const drivers: Driver[] = [
  { id: "d1", name: "Ibrahim Musa", code: "KJA-001", phone: "080 2345 6789", status: "active", route: "Lagos Island – Oshodi", bus: "BUS-07", currentPassengers: 18, tripsToday: 2, earningsToday: 45000, rating: 4.8, shiftStart: "06:00", complianceStatus: "clear", hoursThisWeek: 28, licenseNumber: "DL-LG-00123", licenseExpiry: "2027-06-15", joinedDate: "2023-01-10", verificationStatus: "verified", onTimeRate: 96, completionRate: 99, incidentCount: 0, busId: "b6", assignmentType: "primary" },
  { id: "d2", name: "Tunde Adeleke", code: "KJA-002", phone: "080 3456 7890", status: "active", route: "Oshodi – Ikeja", bus: "BUS-12", currentPassengers: 22, tripsToday: 3, earningsToday: 54000, rating: 4.6, shiftStart: "07:00", complianceStatus: "clear", hoursThisWeek: 24, licenseNumber: "DL-LG-00456", licenseExpiry: "2026-11-20", joinedDate: "2023-03-05", verificationStatus: "verified", onTimeRate: 91, completionRate: 97, incidentCount: 0, busId: "b8", assignmentType: "primary" },
  { id: "d3", name: "Chukwuemeka Obi", code: "KJA-003", phone: "080 4567 8901", status: "late", tripsToday: 0, earningsToday: 0, rating: 4.2, complianceStatus: "warning", hoursThisWeek: 38, licenseNumber: "DL-LG-00789", licenseExpiry: "2025-08-30", joinedDate: "2023-07-14", verificationStatus: "verified", onTimeRate: 72, completionRate: 88, incidentCount: 1, busId: "b4", assignmentType: "primary" },
  { id: "d4", name: "Fatima Garba", code: "KJA-004", phone: "080 5678 9012", status: "active", route: "Lagos Island – Lekki", bus: "BUS-09", currentPassengers: 25, tripsToday: 2, earningsToday: 62500, rating: 4.9, shiftStart: "06:30", complianceStatus: "clear", hoursThisWeek: 22, licenseNumber: "DL-LG-00321", licenseExpiry: "2028-03-10", joinedDate: "2022-11-20", verificationStatus: "verified", onTimeRate: 98, completionRate: 100, incidentCount: 0, busId: "b7", assignmentType: "primary" },
  { id: "d5", name: "Seun Adeyemi", code: "KJA-005", phone: "080 6789 0123", status: "offline", tripsToday: 4, earningsToday: 92000, rating: 4.7, complianceStatus: "clear", hoursThisWeek: 48, licenseNumber: "DL-LG-00654", licenseExpiry: "2027-01-28", joinedDate: "2022-08-01", verificationStatus: "verified", onTimeRate: 89, completionRate: 95, incidentCount: 1 },
  { id: "d6", name: "Aminu Danbaba", code: "KJA-006", phone: "080 7890 1234", status: "active", route: "Berger – Oshodi", bus: "BUS-02", currentPassengers: 14, tripsToday: 1, earningsToday: 35000, rating: 4.3, shiftStart: "08:00", complianceStatus: "clear", hoursThisWeek: 16, licenseNumber: "DL-LG-00987", licenseExpiry: "2026-09-12", joinedDate: "2024-02-17", verificationStatus: "verified", onTimeRate: 93, completionRate: 96, incidentCount: 0, busId: "b2", assignmentType: "primary" },
  { id: "d7", name: "Blessing Okafor", code: "KJA-007", phone: "080 8901 2345", status: "on_leave", tripsToday: 0, earningsToday: 0, rating: 4.5, complianceStatus: "clear", hoursThisWeek: 0, licenseNumber: "DL-LG-01011", licenseExpiry: "2027-05-05", joinedDate: "2024-05-03", verificationStatus: "verified", onTimeRate: 88, completionRate: 94, incidentCount: 0 },
  { id: "d8", name: "Emeka Nwosu", code: "KJA-008", phone: "080 9012 3456", status: "blocked", tripsToday: 0, earningsToday: 0, rating: 3.8, complianceStatus: "blocked", hoursThisWeek: 12, licenseNumber: "DL-LG-01213", licenseExpiry: "2024-12-01", joinedDate: "2023-10-12", verificationStatus: "verified", onTimeRate: 55, completionRate: 68, incidentCount: 3 },
  { id: "d9", name: "Adaeze Eze", code: "KJA-009", phone: "081 2345 6789", status: "pending", tripsToday: 0, earningsToday: 0, rating: 5.0, complianceStatus: "clear", hoursThisWeek: 0, verificationStatus: "unverified", joinedDate: "2026-05-25", incidentCount: 0 },
]

export const buses: Bus[] = [
  { id: "b1", code: "BUS-01", model: "Toyota Coaster", plate: "LND 234 GE", status: "available", capacity: 30, lastInspection: "Today 05:45", inspectionResult: "pass", fuelLevel: 85 },
  { id: "b2", code: "BUS-02", model: "Toyota Coaster", plate: "LND 678 GE", status: "active", route: "Berger – Oshodi", driver: "Aminu Danbaba", capacity: 30, currentPassengers: 14, lastInspection: "Today 07:50", inspectionResult: "pass", fuelLevel: 62 },
  { id: "b3", code: "BUS-03", model: "Higer KLQ6109", plate: "LND 112 GE", status: "maintenance", capacity: 49, lastInspection: "Yesterday", inspectionResult: "fail", fuelLevel: 20 },
  { id: "b4", code: "BUS-04", model: "Toyota Coaster", plate: "LND 345 GE", status: "available", capacity: 30, lastInspection: "Today 06:00", inspectionResult: "pass", fuelLevel: 90 },
  { id: "b5", code: "BUS-05", model: "Toyota Sienna", plate: "LND 567 GE", status: "blocked", capacity: 7, lastInspection: "Today 06:15", inspectionResult: "fail", fuelLevel: 45 },
  { id: "b6", code: "BUS-07", model: "Toyota Coaster", plate: "LND 901 GE", status: "active", route: "Lagos Island – Oshodi", driver: "Ibrahim Musa", capacity: 30, currentPassengers: 18, lastInspection: "Today 05:55", inspectionResult: "pass", fuelLevel: 55 },
  { id: "b7", code: "BUS-09", model: "Higer KLQ6109", plate: "LND 123 GE", status: "active", route: "Lagos Island – Lekki", driver: "Fatima Garba", capacity: 30, currentPassengers: 25, lastInspection: "Today 06:20", inspectionResult: "pass", fuelLevel: 70 },
  { id: "b8", code: "BUS-12", model: "Toyota Coaster", plate: "LND 456 GE", status: "active", route: "Oshodi – Ikeja", driver: "Tunde Adeleke", capacity: 30, currentPassengers: 22, lastInspection: "Today 06:45", inspectionResult: "pass", fuelLevel: 48 },
]

export const alerts: Alert[] = [
  { id: "a1", type: "breakdown", severity: "critical", title: "Bus Breakdown", description: "BUS-03 engine failure on Third Mainland Bridge. Replacement dispatched.", driver: "Yemi Bakare", bus: "BUS-03", location: "Third Mainland Bridge", timestamp: "08:42 AM", acknowledged: false },
  { id: "a2", type: "late_start", severity: "warning", title: "Late Start — KJA-003", description: "Chukwuemeka Obi has not accepted shift. 38 min past departure.", driver: "Chukwuemeka Obi", timestamp: "08:30 AM", acknowledged: false },
  { id: "a3", type: "cash_discrepancy", severity: "warning", title: "Cash Discrepancy", description: "KJA-005 declared ₦8,500 less than expected. Reason: underdeclared passengers.", driver: "Seun Adeyemi", timestamp: "Yesterday 19:30", acknowledged: true },
  { id: "a4", type: "inspection_fail", severity: "critical", title: "Bus Blocked — Tyre Issue", description: "BUS-05 failed pre-trip inspection. Left rear tyre unsafe.", bus: "BUS-05", timestamp: "06:20 AM", acknowledged: true },
  { id: "a5", type: "code_red", severity: "critical", title: "Emergency — Code Red", description: "KJA-006 triggered silent emergency at Oshodi Bus Terminal.", driver: "Aminu Danbaba", location: "Oshodi Terminal", timestamp: "Yesterday 14:20", acknowledged: true },
  { id: "a6", type: "no_show", severity: "warning", title: "No-Show", description: "KJA-007 Blessing Okafor did not check in. Leave request approved.", driver: "Blessing Okafor", timestamp: "06:00 AM", acknowledged: true },
]

export const activeTrips: Trip[] = [
  { id: "t1", driver: "Fatima Garba", bus: "BUS-09", route: "Lagos Island → Lekki", status: "en_route", passengers: 25, capacity: 30, departure: "09:00", revenue: 12500, tripNumber: 2 },
  { id: "t2", driver: "Ibrahim Musa", bus: "BUS-07", route: "Lagos Island → Oshodi", status: "en_route", passengers: 18, capacity: 30, departure: "08:30", revenue: 9000, tripNumber: 2 },
  { id: "t3", driver: "Tunde Adeleke", bus: "BUS-12", route: "Oshodi → Ikeja", status: "boarding", passengers: 22, capacity: 30, departure: "09:15", revenue: 11000, tripNumber: 3 },
  { id: "t4", driver: "Seun Adeyemi", bus: "BUS-11", route: "Berger → Oshodi", status: "completed", passengers: 28, capacity: 30, departure: "07:00", arrival: "08:05", revenue: 14000, tripNumber: 2 },
  { id: "t5", driver: "Aminu Danbaba", bus: "BUS-02", route: "Berger → Oshodi", status: "boarding", passengers: 14, capacity: 30, departure: "09:30", revenue: 7000, tripNumber: 1 },
]

export const reconciliationItems: ReconciliationItem[] = [
  { id: "r1", driver: "Seun Adeyemi", bus: "BUS-11", shift: "Morning", expectedCash: 22500, declaredCash: 14000, walletEarnings: 67500, status: "discrepancy", discrepancyReason: "Under-declared — under investigation", timestamp: "Yesterday 19:30" },
  { id: "r2", driver: "Ibrahim Musa", bus: "BUS-07", shift: "Morning", expectedCash: 15000, declaredCash: 15000, walletEarnings: 30000, status: "match", timestamp: "Yesterday 18:45" },
  { id: "r3", driver: "Fatima Garba", bus: "BUS-09", shift: "Morning", expectedCash: 20000, declaredCash: 20000, walletEarnings: 42500, status: "match", timestamp: "Yesterday 18:20" },
  { id: "r4", driver: "Tunde Adeleke", bus: "BUS-12", shift: "Morning", expectedCash: 18000, declaredCash: 18000, walletEarnings: 36000, status: "match", timestamp: "Yesterday 18:55" },
  { id: "r5", driver: "Aminu Danbaba", bus: "BUS-02", shift: "Morning", expectedCash: 0, declaredCash: 0, walletEarnings: 0, status: "pending", timestamp: "Today" },
]

export const leaveRequests: LeaveRequest[] = [
  { id: "l1", driver: "Blessing Okafor", driverCode: "KJA-007", type: "annual", from: "2026-05-19", to: "2026-05-23", status: "approved", affectedDuties: 5, submittedAt: "2026-05-14" },
  { id: "l2", driver: "Emeka Nwosu", driverCode: "KJA-008", type: "sick", from: "2026-05-21", to: "2026-05-22", status: "pending", affectedDuties: 2, submittedAt: "2026-05-21" },
  { id: "l3", driver: "Chukwuemeka Obi", driverCode: "KJA-003", type: "emergency", from: "2026-05-21", to: "2026-05-21", status: "pending", affectedDuties: 1, submittedAt: "2026-05-21" },
  { id: "l4", driver: "Tunde Adeleke", driverCode: "KJA-002", type: "personal", from: "2026-05-28", to: "2026-05-28", status: "declined", affectedDuties: 1, reason: "Critical operations day – insufficient cover", submittedAt: "2026-05-18" },
]

export const dispatchPlans: DispatchPlan[] = [
  { id: "dp1", driver: "Ibrahim Musa", driverCode: "KJA-001", bus: "BUS-07", route: "Lagos Island – Oshodi", trips: 3, departure: "06:00", status: "active" },
  { id: "dp2", driver: "Tunde Adeleke", driverCode: "KJA-002", bus: "BUS-12", route: "Oshodi – Ikeja", trips: 4, departure: "07:00", status: "active" },
  { id: "dp3", driver: "Fatima Garba", driverCode: "KJA-004", bus: "BUS-09", route: "Lagos Island – Lekki", trips: 3, departure: "06:30", status: "active" },
  { id: "dp4", driver: "Chukwuemeka Obi", driverCode: "KJA-003", bus: "BUS-04", route: "Ojota – CMS", trips: 3, departure: "06:00", status: "no_show" },
  { id: "dp5", driver: "Aminu Danbaba", driverCode: "KJA-006", bus: "BUS-02", route: "Berger – Oshodi", trips: 3, departure: "08:00", status: "active" },
  { id: "dp6", driver: "Seun Adeyemi", driverCode: "KJA-005", bus: "BUS-11", route: "Berger – Oshodi", trips: 4, departure: "06:30", status: "completed" },
]

export const revenueData: RevenueDataPoint[] = [
  { date: "Mon", revenue: 485000, passengers: 892 },
  { date: "Tue", revenue: 512000, passengers: 941 },
  { date: "Wed", revenue: 498000, passengers: 915 },
  { date: "Thu", revenue: 534000, passengers: 982 },
  { date: "Fri", revenue: 621000, passengers: 1142 },
  { date: "Sat", revenue: 587000, passengers: 1079 },
  { date: "Today", revenue: 289000, passengers: 531 },
]
