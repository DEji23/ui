export type DriverStatus = "active" | "offline" | "late" | "on_leave" | "blocked" | "deactivated"
export type BusStatus = "active" | "available" | "blocked" | "maintenance" | "decommissioned"
export type AlertType = "breakdown" | "late_start" | "code_red" | "inspection_fail" | "cash_discrepancy" | "no_show"
export type AlertSeverity = "critical" | "warning" | "info"
export type TripStatus = "scheduled" | "boarding" | "en_route" | "completed" | "cancelled"
export type ReconciliationStatus = "match" | "discrepancy" | "pending"
export type LeaveType = "annual" | "sick" | "emergency" | "personal"
export type LeaveStatus = "pending" | "approved" | "declined" | "modified"
export type MaintenanceType = "routine" | "tyre" | "engine" | "brake" | "electrical" | "other"
export type BusType = "coaster" | "hiace" | "sienna" | "brt" | "minibus"

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
  verificationStatus?: "pending" | "verified" | "rejected"
  licenseNumber?: string
  licenseExpiry?: string
  address?: string
  joinDate?: string
  nextOfKin?: string
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
  standingAllowed?: boolean
  currentPassengers?: number
  lastInspection: string
  inspectionResult: "pass" | "fail" | "pending"
  fuelLevel?: number
  // Identity
  vin?: string
  busType?: BusType
  manufacturer?: string
  year?: number
  colour?: string
  busUniqueCode?: string
  // Compliance
  insuranceExpiry?: string
  roadworthinessExpiry?: string
  vehicleLicenseExpiry?: string
  // Device & QR
  gpsDeviceId?: string
  gpsPaired?: boolean
  gpsLastPing?: string
  driverAppPaired?: boolean
  qrActive?: boolean
  // Operations
  nextMaintenanceDue?: string
  lastSeen?: string
}

export interface MaintenanceRecord {
  id: string
  busId: string
  busCode: string
  type: MaintenanceType
  date: string
  nextDue: string
  cost: number
  vendor: string
  notes?: string
  status: "completed" | "scheduled" | "overdue"
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
  { id: "d1", name: "Ibrahim Musa", code: "KJA-001", phone: "080 2345 6789", status: "active", route: "Lagos Island – Oshodi", bus: "BUS-07", currentPassengers: 18, tripsToday: 2, earningsToday: 45000, rating: 4.8, shiftStart: "06:00", complianceStatus: "clear", hoursThisWeek: 28, verificationStatus: "verified", licenseNumber: "FED-2020-001234", licenseExpiry: "2027-08-15", joinDate: "2023-02-10", address: "14 Adeniyi Jones, Ikeja, Lagos" },
  { id: "d2", name: "Tunde Adeleke", code: "KJA-002", phone: "080 3456 7890", status: "active", route: "Oshodi – Ikeja", bus: "BUS-12", currentPassengers: 22, tripsToday: 3, earningsToday: 54000, rating: 4.6, shiftStart: "07:00", complianceStatus: "clear", hoursThisWeek: 24, verificationStatus: "verified", licenseNumber: "FED-2019-005678", licenseExpiry: "2027-03-20", joinDate: "2022-11-15" },
  { id: "d3", name: "Chukwuemeka Obi", code: "KJA-003", phone: "080 4567 8901", status: "late", tripsToday: 0, earningsToday: 0, rating: 4.2, complianceStatus: "warning", hoursThisWeek: 38, verificationStatus: "pending", licenseNumber: "FED-2018-009012", licenseExpiry: "2026-06-30", joinDate: "2023-08-01" },
  { id: "d4", name: "Fatima Garba", code: "KJA-004", phone: "080 5678 9012", status: "active", route: "Lagos Island – Lekki", bus: "BUS-09", currentPassengers: 25, tripsToday: 2, earningsToday: 62500, rating: 4.9, shiftStart: "06:30", complianceStatus: "clear", hoursThisWeek: 22, verificationStatus: "verified", licenseNumber: "FED-2021-003456", licenseExpiry: "2028-01-10", joinDate: "2021-06-20", nextOfKin: "Malam Garba Aliyu" },
  { id: "d5", name: "Seun Adeyemi", code: "KJA-005", phone: "080 6789 0123", status: "offline", tripsToday: 4, earningsToday: 92000, rating: 4.7, complianceStatus: "clear", hoursThisWeek: 48, verificationStatus: "verified", licenseNumber: "FED-2017-007890", licenseExpiry: "2027-11-05", joinDate: "2020-03-12" },
  { id: "d6", name: "Aminu Danbaba", code: "KJA-006", phone: "080 7890 1234", status: "active", route: "Berger – Oshodi", bus: "BUS-02", currentPassengers: 14, tripsToday: 1, earningsToday: 35000, rating: 4.3, shiftStart: "08:00", complianceStatus: "clear", hoursThisWeek: 16, verificationStatus: "verified", licenseNumber: "FED-2022-002345", licenseExpiry: "2026-09-18", joinDate: "2024-01-08", address: "22 Berger Estate, Ojodu, Lagos" },
  { id: "d7", name: "Blessing Okafor", code: "KJA-007", phone: "080 8901 2345", status: "on_leave", tripsToday: 0, earningsToday: 0, rating: 4.5, complianceStatus: "clear", hoursThisWeek: 0, verificationStatus: "verified", licenseNumber: "FED-2020-006789", licenseExpiry: "2027-06-25", joinDate: "2022-07-30", nextOfKin: "Mrs. Ngozi Okafor" },
  { id: "d8", name: "Emeka Nwosu", code: "KJA-008", phone: "080 9012 3456", status: "blocked", tripsToday: 0, earningsToday: 0, rating: 3.8, complianceStatus: "blocked", hoursThisWeek: 12, verificationStatus: "rejected", licenseNumber: "FED-2016-004321", licenseExpiry: "2025-12-31", joinDate: "2021-09-15" },
]

export const buses: Bus[] = [
  {
    id: "b1", code: "BUS-01", model: "Toyota Coaster", plate: "LND 234 GE",
    status: "available", capacity: 30, lastInspection: "Today 05:45", inspectionResult: "pass", fuelLevel: 85,
    vin: "JT2BF22K4W0123456", busType: "coaster", manufacturer: "Toyota", year: 2020, colour: "White",
    busUniqueCode: "B-01-JEHGO",
    insuranceExpiry: "2026-08-15", roadworthinessExpiry: "2026-11-30", vehicleLicenseExpiry: "2026-09-20",
    gpsDeviceId: "GPS-001", gpsPaired: true, gpsLastPing: "2 min ago", driverAppPaired: true, qrActive: true,
    nextMaintenanceDue: "2026-06-15", lastSeen: "10:22 AM",
  },
  {
    id: "b2", code: "BUS-02", model: "Toyota Coaster", plate: "LND 678 GE",
    status: "active", route: "Berger – Oshodi", driver: "Aminu Danbaba", capacity: 30, currentPassengers: 14,
    lastInspection: "Today 07:50", inspectionResult: "pass", fuelLevel: 62,
    vin: "JT2BF22K4W0234567", busType: "coaster", manufacturer: "Toyota", year: 2019, colour: "White",
    busUniqueCode: "B-02-JEHGO",
    insuranceExpiry: "2026-07-10", roadworthinessExpiry: "2026-10-15", vehicleLicenseExpiry: "2026-08-05",
    gpsDeviceId: "GPS-002", gpsPaired: true, gpsLastPing: "Live", driverAppPaired: true, qrActive: true,
    nextMaintenanceDue: "2026-07-01", lastSeen: "Live",
  },
  {
    id: "b3", code: "BUS-03", model: "Higer KLQ6109", plate: "LND 112 GE",
    status: "maintenance", capacity: 49, lastInspection: "Yesterday", inspectionResult: "fail", fuelLevel: 20,
    vin: "LHGFA16516Y000123", busType: "brt", manufacturer: "Higer", year: 2018, colour: "Yellow",
    busUniqueCode: "B-03-JEHGO",
    insuranceExpiry: "2026-05-28", roadworthinessExpiry: "2026-04-30", vehicleLicenseExpiry: "2026-06-01",
    gpsDeviceId: "GPS-003", gpsPaired: false, gpsLastPing: "2 days ago", driverAppPaired: false, qrActive: true,
    nextMaintenanceDue: "Overdue", lastSeen: "Yesterday",
  },
  {
    id: "b4", code: "BUS-04", model: "Toyota Coaster", plate: "LND 345 GE",
    status: "available", capacity: 30, lastInspection: "Today 06:00", inspectionResult: "pass", fuelLevel: 90,
    vin: "JT2BF22K4W0345678", busType: "coaster", manufacturer: "Toyota", year: 2021, colour: "White",
    busUniqueCode: "B-04-JEHGO",
    insuranceExpiry: "2026-12-01", roadworthinessExpiry: "2026-12-15", vehicleLicenseExpiry: "2026-11-10",
    gpsDeviceId: "GPS-004", gpsPaired: true, gpsLastPing: "5 min ago", driverAppPaired: true, qrActive: true,
    nextMaintenanceDue: "2026-09-01", lastSeen: "9:45 AM",
  },
  {
    id: "b5", code: "BUS-05", model: "Toyota Sienna", plate: "LND 567 GE",
    status: "blocked", capacity: 7, lastInspection: "Today 06:15", inspectionResult: "fail", fuelLevel: 45,
    vin: "5TDZK23C69S123456", busType: "sienna", manufacturer: "Toyota", year: 2017, colour: "Silver",
    busUniqueCode: "B-05-JEHGO",
    insuranceExpiry: "2026-06-08", roadworthinessExpiry: "2026-05-20", vehicleLicenseExpiry: "2026-07-15",
    gpsDeviceId: undefined, gpsPaired: false, gpsLastPing: undefined, driverAppPaired: false, qrActive: false,
    nextMaintenanceDue: "2026-06-01", lastSeen: "6:15 AM",
  },
  {
    id: "b6", code: "BUS-07", model: "Toyota Coaster", plate: "LND 901 GE",
    status: "active", route: "Lagos Island – Oshodi", driver: "Ibrahim Musa", capacity: 30, currentPassengers: 18,
    lastInspection: "Today 05:55", inspectionResult: "pass", fuelLevel: 55,
    vin: "JT2BF22K4W0456789", busType: "coaster", manufacturer: "Toyota", year: 2020, colour: "White",
    busUniqueCode: "B-07-JEHGO",
    insuranceExpiry: "2026-09-15", roadworthinessExpiry: "2026-11-01", vehicleLicenseExpiry: "2026-10-20",
    gpsDeviceId: "GPS-007", gpsPaired: true, gpsLastPing: "Live", driverAppPaired: true, qrActive: true,
    nextMaintenanceDue: "2026-08-10", lastSeen: "Live",
  },
  {
    id: "b7", code: "BUS-09", model: "Higer KLQ6109", plate: "LND 123 GE",
    status: "active", route: "Lagos Island – Lekki", driver: "Fatima Garba", capacity: 30, currentPassengers: 25,
    lastInspection: "Today 06:20", inspectionResult: "pass", fuelLevel: 70,
    vin: "LHGFA16516Y000234", busType: "brt", manufacturer: "Higer", year: 2019, colour: "Blue",
    busUniqueCode: "B-09-JEHGO",
    insuranceExpiry: "2026-10-01", roadworthinessExpiry: "2027-01-15", vehicleLicenseExpiry: "2026-09-30",
    gpsDeviceId: "GPS-009", gpsPaired: true, gpsLastPing: "Live", driverAppPaired: true, qrActive: true,
    nextMaintenanceDue: "2026-07-20", lastSeen: "Live",
  },
  {
    id: "b8", code: "BUS-12", model: "Toyota Coaster", plate: "LND 456 GE",
    status: "active", route: "Oshodi – Ikeja", driver: "Tunde Adeleke", capacity: 30, currentPassengers: 22,
    lastInspection: "Today 06:45", inspectionResult: "pass", fuelLevel: 48,
    vin: "JT2BF22K4W0567890", busType: "coaster", manufacturer: "Toyota", year: 2020, colour: "White",
    busUniqueCode: "B-12-JEHGO",
    insuranceExpiry: "2026-08-20", roadworthinessExpiry: "2026-10-05", vehicleLicenseExpiry: "2026-09-10",
    gpsDeviceId: "GPS-012", gpsPaired: true, gpsLastPing: "Live", driverAppPaired: true, qrActive: true,
    nextMaintenanceDue: "2026-06-25", lastSeen: "Live",
  },
]

export const maintenanceRecords: MaintenanceRecord[] = [
  {
    id: "m1", busId: "b3", busCode: "BUS-03",
    type: "engine", date: "2026-05-22", nextDue: "2026-11-22",
    cost: 185000, vendor: "Seun Auto Works",
    notes: "Engine oil, air filter, cooling system flush",
    status: "completed",
  },
  {
    id: "m2", busId: "b1", busCode: "BUS-01",
    type: "routine", date: "2026-04-10", nextDue: "2026-06-15",
    cost: 45000, vendor: "Toyota Service Centre",
    notes: "30,000 km routine service",
    status: "completed",
  },
  {
    id: "m3", busId: "b2", busCode: "BUS-02",
    type: "tyre", date: "2026-03-18", nextDue: "2026-07-01",
    cost: 72000, vendor: "Tyre King Ikeja",
    notes: "All four tyres replaced — front pair showing wear",
    status: "completed",
  },
  {
    id: "m4", busId: "b6", busCode: "BUS-07",
    type: "brake", date: "2026-02-28", nextDue: "2026-08-10",
    cost: 38000, vendor: "Ade Brake Works",
    notes: "Brake pads and discs replaced front and rear",
    status: "completed",
  },
  {
    id: "m5", busId: "b5", busCode: "BUS-05",
    type: "electrical", date: "2026-05-10", nextDue: "2026-06-01",
    cost: 28000, vendor: "Spark Auto Electrics",
    notes: "Alternator replaced, battery terminals cleaned",
    status: "overdue",
  },
  {
    id: "m6", busId: "b8", busCode: "BUS-12",
    type: "routine", date: "2026-01-15", nextDue: "2026-06-25",
    cost: 55000, vendor: "Toyota Service Centre",
    notes: "Scheduled 60,000 km service",
    status: "scheduled",
  },
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

export interface NextDeparture {
  route: string
  time: string
  bus: string
  driver: string
}

export const nextDepartures: NextDeparture[] = [
  { route: "Lagos Island → Oshodi", time: "09:30 AM", bus: "BUS-07", driver: "Ibrahim Musa" },
  { route: "Oshodi → Ikeja", time: "09:45 AM", bus: "BUS-12", driver: "Tunde Adeleke" },
  { route: "Lagos Island → Lekki", time: "10:00 AM", bus: "BUS-09", driver: "Fatima Garba" },
]

export const tripsCompletedToday = 4
export const pendingSettlementsAmount = 210000

export type DriverIncidentType =
  | "complaint"
  | "reckless_driving"
  | "fraud_suspicion"
  | "late_start"
  | "route_deviation"
  | "no_show"
  | "accident"

export interface DriverIncident {
  id: string
  driverId: string
  driverCode: string
  type: DriverIncidentType
  description: string
  date: string
  severity: "critical" | "warning" | "info"
  status: "open" | "resolved" | "dismissed"
}

export const driverIncidents: DriverIncident[] = [
  {
    id: "di1", driverId: "d3", driverCode: "KJA-003",
    type: "late_start", description: "Did not accept assigned shift 38 minutes past scheduled departure. No prior notification given.",
    date: "2026-05-25", severity: "warning", status: "open",
  },
  {
    id: "di2", driverId: "d5", driverCode: "KJA-005",
    type: "complaint", description: "Passenger reported rude behaviour and refusal to give correct change on the Berger–Oshodi route.",
    date: "2026-05-22", severity: "info", status: "resolved",
  },
  {
    id: "di3", driverId: "d8", driverCode: "KJA-008",
    type: "fraud_suspicion", description: "Cash discrepancy of ₦22,500 found across 3 consecutive trips. Under-declared passenger count suspected.",
    date: "2026-05-20", severity: "critical", status: "open",
  },
  {
    id: "di4", driverId: "d2", driverCode: "KJA-002",
    type: "route_deviation", description: "Bus took an unofficial route at Oshodi junction without clearance. Route restored after 12 minutes.",
    date: "2026-05-18", severity: "warning", status: "dismissed",
  },
  {
    id: "di5", driverId: "d6", driverCode: "KJA-006",
    type: "no_show", description: "Failed to appear for assigned morning shift on 2026-05-15 without prior notification. Duty reassigned to backup driver.",
    date: "2026-05-15", severity: "warning", status: "resolved",
  },
  {
    id: "di6", driverId: "d1", driverCode: "KJA-001",
    type: "complaint", description: "Minor dispute with passenger over change amount. Resolved on-site. Passenger did not escalate.",
    date: "2026-05-10", severity: "info", status: "resolved",
  },
]
