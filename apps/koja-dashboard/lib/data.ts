export type DriverStatus = "active" | "offline" | "late" | "on_leave" | "blocked" | "deactivated"
export type BusStatus = "active" | "available" | "blocked" | "maintenance" | "decommissioned"
export type AlertType = "breakdown" | "late_start" | "code_red" | "inspection_fail" | "cash_discrepancy" | "no_show" | "bus_offline" | "duty_missed" | "compliance_violation" | "low_utilisation" | "document_expiry" | "trip_anomaly" | "late_departure" | "route_change"
export type AlertSeverity = "critical" | "high" | "warning" | "info"
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
  vin?: string
  busType?: BusType
  manufacturer?: string
  year?: number
  colour?: string
  busUniqueCode?: string
  insuranceExpiry?: string
  roadworthinessExpiry?: string
  vehicleLicenseExpiry?: string
  gpsDeviceId?: string
  gpsPaired?: boolean
  gpsLastPing?: string
  driverAppPaired?: boolean
  qrActive?: boolean
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
  route?: string
  timestamp: string
  acknowledged: boolean
  resolved?: boolean
  escalated?: boolean
  suggestedAction?: string
  resolvedBy?: string
  resolvedAt?: string
  note?: string
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
  { id: "m1", busId: "b3", busCode: "BUS-03", type: "engine", date: "2026-05-22", nextDue: "2026-11-22", cost: 185000, vendor: "Seun Auto Works", notes: "Engine oil, air filter, cooling system flush", status: "completed" },
  { id: "m2", busId: "b1", busCode: "BUS-01", type: "routine", date: "2026-04-10", nextDue: "2026-06-15", cost: 45000, vendor: "Toyota Service Centre", notes: "30,000 km routine service", status: "completed" },
  { id: "m3", busId: "b2", busCode: "BUS-02", type: "tyre", date: "2026-03-18", nextDue: "2026-07-01", cost: 72000, vendor: "Tyre King Ikeja", notes: "All four tyres replaced — front pair showing wear", status: "completed" },
  { id: "m4", busId: "b6", busCode: "BUS-07", type: "brake", date: "2026-02-28", nextDue: "2026-08-10", cost: 38000, vendor: "Ade Brake Works", notes: "Brake pads and discs replaced front and rear", status: "completed" },
  { id: "m5", busId: "b5", busCode: "BUS-05", type: "electrical", date: "2026-05-10", nextDue: "2026-06-01", cost: 28000, vendor: "Spark Auto Electrics", notes: "Alternator replaced, battery terminals cleaned", status: "overdue" },
  { id: "m6", busId: "b8", busCode: "BUS-12", type: "routine", date: "2026-01-15", nextDue: "2026-06-25", cost: 55000, vendor: "Toyota Service Centre", notes: "Scheduled 60,000 km service", status: "scheduled" },
]

export const alerts: Alert[] = [
  { id: "a1", type: "breakdown", severity: "critical", title: "Bus Breakdown — BUS-03", description: "BUS-03 engine failure on Third Mainland Bridge. Bus is stationary, 22 passengers onboard. Replacement dispatched.", driver: "Yemi Bakare", bus: "BUS-03", location: "Third Mainland Bridge", timestamp: "08:42 AM", acknowledged: false, resolved: false, suggestedAction: "Dispatch replacement bus" },
  { id: "a2", type: "no_show", severity: "critical", title: "Driver No-Show — KJA-003", description: "Chukwuemeka Obi failed to check in for scheduled morning shift. Departure was 06:00. Now 44 minutes late. Duty unassigned.", driver: "Chukwuemeka Obi", route: "Ojota – CMS", timestamp: "06:44 AM", acknowledged: false, resolved: false, suggestedAction: "Assign replacement driver" },
  { id: "a3", type: "bus_offline", severity: "high", title: "GPS Signal Lost — BUS-04", description: "BUS-04 GPS signal lost for 52 minutes. Last known location: Oshodi Terminal. Driver not responding to calls.", bus: "BUS-04", location: "Oshodi Terminal", route: "Ojota – CMS", timestamp: "09:15 AM", acknowledged: false, resolved: false, suggestedAction: "Investigate bus status" },
  { id: "a4", type: "trip_anomaly", severity: "high", title: "AFC Mismatch — KJA-003", description: "29 passengers recorded on AFC system but driver declared 24 on last completed trip. ₦2,500 unaccounted for.", driver: "Chukwuemeka Obi", bus: "BUS-04", route: "Ojota – CMS", timestamp: "Yesterday 15:30", acknowledged: false, resolved: false, suggestedAction: "Flag duty for reconciliation" },
  { id: "a5", type: "compliance_violation", severity: "high", title: "Hours Limit Exceeded — KJA-005", description: "Seun Adeyemi has accumulated 48 hours this week, exceeding the 45-hour regulatory limit. Further assignment blocked.", driver: "Seun Adeyemi", timestamp: "Yesterday 22:00", acknowledged: true, resolved: false, suggestedAction: "Prevent further assignment this week" },
  { id: "a6", type: "cash_discrepancy", severity: "high", title: "Cash Discrepancy — KJA-005", description: "KJA-005 declared ₦8,500 less than expected on morning shift. Discrepancy attributed to underdeclared passengers.", driver: "Seun Adeyemi", timestamp: "Yesterday 19:30", acknowledged: true, resolved: false, suggestedAction: "Flag for reconciliation investigation" },
  { id: "a7", type: "document_expiry", severity: "warning", title: "Insurance Expiring — BUS-02", description: "BUS-02 third-party insurance expires in 42 days (10 July 2026). Renewal required before expiry to avoid service suspension.", bus: "BUS-02", timestamp: "Today 07:00", acknowledged: false, resolved: false, suggestedAction: "Schedule insurance renewal" },
  { id: "a8", type: "document_expiry", severity: "warning", title: "Operating Licence Expiry — BUS-07", description: "BUS-07 operating licence expires in 47 days (15 July 2026). Regulatory clearance required for continued operation.", bus: "BUS-07", timestamp: "Today 07:00", acknowledged: false, resolved: false, suggestedAction: "Initiate licence renewal" },
  { id: "a9", type: "low_utilisation", severity: "warning", title: "Low Seat Utilisation — Ojota–CMS", description: "Average seat fill on Ojota–CMS route dropped to 44% across last 3 trips. Revenue impact estimated ₦15,000 below target.", route: "Ojota – CMS", timestamp: "Yesterday 18:00", acknowledged: false, resolved: false, suggestedAction: "Review route schedule and demand" },
  { id: "a10", type: "late_departure", severity: "warning", title: "Late Departure — BUS-09 Trip 3", description: "BUS-09 left Lekki terminal 22 minutes behind schedule on Trip 3. Downstream schedule impact for afternoon run.", bus: "BUS-09", driver: "Fatima Garba", route: "Lagos Island – Lekki", timestamp: "11:52 AM", acknowledged: true, resolved: true, resolvedBy: "Dispatch", resolvedAt: "12:10 PM", suggestedAction: "Adjust afternoon departure time" },
  { id: "a11", type: "inspection_fail", severity: "critical", title: "Bus Blocked — Tyre Failure", description: "BUS-05 failed pre-trip inspection. Left rear tyre unsafe for road use. Bus removed from today's service.", bus: "BUS-05", timestamp: "06:20 AM", acknowledged: true, resolved: true, resolvedBy: "Fleet Manager", resolvedAt: "07:00 AM", suggestedAction: "Remove bus from service and arrange tyre replacement" },
  { id: "a12", type: "code_red", severity: "critical", title: "Emergency — Code Red KJA-006", description: "KJA-006 triggered silent emergency at Oshodi Bus Terminal. Police notified. Driver safe, situation defused.", driver: "Aminu Danbaba", location: "Oshodi Terminal", timestamp: "Yesterday 14:20", acknowledged: true, resolved: true, resolvedBy: "Fleet Manager", resolvedAt: "Yesterday 15:05", suggestedAction: "Request police assistance" },
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

export type ShiftType = "morning" | "afternoon" | "split"
export type RosterStatus = "draft" | "published" | "archived"
export type ShiftStatus = "assigned" | "conflict" | "leave" | "blocked" | "unassigned"

export interface Shift {
  id: string
  driverId: string
  driverName: string
  driverCode: string
  date: string
  dayOfWeek: number
  shiftType: ShiftType
  route: string
  busCode?: string
  startTime: string
  endTime: string
  status: ShiftStatus
  complianceFlag?: "rest_violation" | "hours_exceeded" | "license_expiring"
}

export interface Roster {
  id: string
  name: string
  weekStart: string
  weekEnd: string
  status: RosterStatus
  totalDrivers: number
  assignedShifts: number
  unassignedShifts: number
  conflicts: number
  publishedAt?: string
  createdAt: string
}

export interface VehicleBlock {
  id: string
  busCode: string
  route: string
  date: string
  trips: number
  departure: string
  driverId?: string
  driverName?: string
  status: "unassigned" | "assigned" | "dispatched" | "completed" | "cancelled"
}

export const rosters: Roster[] = [
  {
    id: "rs1",
    name: "Week 22 — May 26 – Jun 1",
    weekStart: "2026-05-26",
    weekEnd: "2026-06-01",
    status: "published",
    totalDrivers: 6,
    assignedShifts: 34,
    unassignedShifts: 2,
    conflicts: 1,
    publishedAt: "2026-05-23 09:00",
    createdAt: "2026-05-22 14:30",
  },
  {
    id: "rs2",
    name: "Week 23 — Jun 2 – 8",
    weekStart: "2026-06-02",
    weekEnd: "2026-06-08",
    status: "draft",
    totalDrivers: 6,
    assignedShifts: 6,
    unassignedShifts: 30,
    conflicts: 0,
    createdAt: "2026-05-27 10:00",
  },
]

export const weekShifts: Shift[] = [
  { id: "sh1", driverId: "d1", driverName: "Ibrahim Musa", driverCode: "KJA-001", date: "2026-05-26", dayOfWeek: 0, shiftType: "morning", route: "Lagos Island – Oshodi", busCode: "BUS-07", startTime: "06:00", endTime: "14:00", status: "assigned" },
  { id: "sh2", driverId: "d1", driverName: "Ibrahim Musa", driverCode: "KJA-001", date: "2026-05-27", dayOfWeek: 1, shiftType: "morning", route: "Lagos Island – Oshodi", busCode: "BUS-07", startTime: "06:00", endTime: "14:00", status: "assigned" },
  { id: "sh3", driverId: "d1", driverName: "Ibrahim Musa", driverCode: "KJA-001", date: "2026-05-28", dayOfWeek: 2, shiftType: "morning", route: "Lagos Island – Oshodi", busCode: "BUS-07", startTime: "06:00", endTime: "14:00", status: "assigned" },
  { id: "sh4", driverId: "d1", driverName: "Ibrahim Musa", driverCode: "KJA-001", date: "2026-05-29", dayOfWeek: 3, shiftType: "morning", route: "Lagos Island – Oshodi", busCode: "BUS-07", startTime: "06:00", endTime: "14:00", status: "assigned" },
  { id: "sh5", driverId: "d1", driverName: "Ibrahim Musa", driverCode: "KJA-001", date: "2026-05-30", dayOfWeek: 4, shiftType: "morning", route: "Lagos Island – Oshodi", busCode: "BUS-07", startTime: "06:00", endTime: "14:00", status: "assigned" },
  { id: "sh6", driverId: "d1", driverName: "Ibrahim Musa", driverCode: "KJA-001", date: "2026-05-31", dayOfWeek: 5, shiftType: "morning", route: "Lagos Island – Oshodi", busCode: "BUS-07", startTime: "06:00", endTime: "14:00", status: "assigned" },
  { id: "sh7", driverId: "d2", driverName: "Tunde Adeleke", driverCode: "KJA-002", date: "2026-05-26", dayOfWeek: 0, shiftType: "morning", route: "Oshodi – Ikeja", busCode: "BUS-12", startTime: "07:00", endTime: "15:00", status: "assigned" },
  { id: "sh8", driverId: "d2", driverName: "Tunde Adeleke", driverCode: "KJA-002", date: "2026-05-27", dayOfWeek: 1, shiftType: "morning", route: "Oshodi – Ikeja", busCode: "BUS-12", startTime: "07:00", endTime: "15:00", status: "assigned" },
  { id: "sh9", driverId: "d2", driverName: "Tunde Adeleke", driverCode: "KJA-002", date: "2026-05-28", dayOfWeek: 2, shiftType: "morning", route: "Oshodi – Ikeja", busCode: "BUS-12", startTime: "07:00", endTime: "15:00", status: "assigned" },
  { id: "sh10", driverId: "d2", driverName: "Tunde Adeleke", driverCode: "KJA-002", date: "2026-05-29", dayOfWeek: 3, shiftType: "morning", route: "Oshodi – Ikeja", busCode: "BUS-12", startTime: "07:00", endTime: "15:00", status: "assigned" },
  { id: "sh11", driverId: "d2", driverName: "Tunde Adeleke", driverCode: "KJA-002", date: "2026-05-30", dayOfWeek: 4, shiftType: "morning", route: "Oshodi – Ikeja", busCode: "BUS-12", startTime: "07:00", endTime: "15:00", status: "assigned" },
  { id: "sh12", driverId: "d2", driverName: "Tunde Adeleke", driverCode: "KJA-002", date: "2026-05-31", dayOfWeek: 5, shiftType: "morning", route: "Oshodi – Ikeja", busCode: "BUS-12", startTime: "07:00", endTime: "15:00", status: "assigned" },
  { id: "sh13", driverId: "d3", driverName: "Chukwuemeka Obi", driverCode: "KJA-003", date: "2026-05-26", dayOfWeek: 0, shiftType: "morning", route: "Ojota – CMS", busCode: "BUS-04", startTime: "06:00", endTime: "14:00", status: "assigned" },
  { id: "sh14", driverId: "d3", driverName: "Chukwuemeka Obi", driverCode: "KJA-003", date: "2026-05-27", dayOfWeek: 1, shiftType: "morning", route: "Ojota – CMS", busCode: "BUS-04", startTime: "06:00", endTime: "14:00", status: "assigned" },
  { id: "sh15", driverId: "d3", driverName: "Chukwuemeka Obi", driverCode: "KJA-003", date: "2026-05-28", dayOfWeek: 2, shiftType: "morning", route: "Ojota – CMS", busCode: "BUS-04", startTime: "06:00", endTime: "14:00", status: "assigned" },
  { id: "sh16", driverId: "d3", driverName: "Chukwuemeka Obi", driverCode: "KJA-003", date: "2026-05-29", dayOfWeek: 3, shiftType: "morning", route: "Ojota – CMS", busCode: "BUS-04", startTime: "06:00", endTime: "14:00", status: "conflict", complianceFlag: "rest_violation" },
  { id: "sh17", driverId: "d3", driverName: "Chukwuemeka Obi", driverCode: "KJA-003", date: "2026-05-30", dayOfWeek: 4, shiftType: "morning", route: "Ojota – CMS", startTime: "06:00", endTime: "14:00", status: "unassigned" },
  { id: "sh18", driverId: "d4", driverName: "Fatima Garba", driverCode: "KJA-004", date: "2026-05-26", dayOfWeek: 0, shiftType: "morning", route: "Lagos Island – Lekki", busCode: "BUS-09", startTime: "06:30", endTime: "14:30", status: "assigned" },
  { id: "sh19", driverId: "d4", driverName: "Fatima Garba", driverCode: "KJA-004", date: "2026-05-27", dayOfWeek: 1, shiftType: "morning", route: "Lagos Island – Lekki", busCode: "BUS-09", startTime: "06:30", endTime: "14:30", status: "assigned" },
  { id: "sh20", driverId: "d4", driverName: "Fatima Garba", driverCode: "KJA-004", date: "2026-05-28", dayOfWeek: 2, shiftType: "morning", route: "Lagos Island – Lekki", busCode: "BUS-09", startTime: "06:30", endTime: "14:30", status: "assigned" },
  { id: "sh21", driverId: "d4", driverName: "Fatima Garba", driverCode: "KJA-004", date: "2026-05-29", dayOfWeek: 3, shiftType: "morning", route: "Lagos Island – Lekki", busCode: "BUS-09", startTime: "06:30", endTime: "14:30", status: "assigned" },
  { id: "sh22", driverId: "d4", driverName: "Fatima Garba", driverCode: "KJA-004", date: "2026-05-30", dayOfWeek: 4, shiftType: "morning", route: "Lagos Island – Lekki", busCode: "BUS-09", startTime: "06:30", endTime: "14:30", status: "assigned" },
  { id: "sh23", driverId: "d4", driverName: "Fatima Garba", driverCode: "KJA-004", date: "2026-05-31", dayOfWeek: 5, shiftType: "morning", route: "Lagos Island – Lekki", busCode: "BUS-09", startTime: "06:30", endTime: "14:30", status: "assigned" },
  { id: "sh24", driverId: "d5", driverName: "Seun Adeyemi", driverCode: "KJA-005", date: "2026-05-26", dayOfWeek: 0, shiftType: "afternoon", route: "Berger – Oshodi", startTime: "14:00", endTime: "22:00", status: "assigned" },
  { id: "sh25", driverId: "d5", driverName: "Seun Adeyemi", driverCode: "KJA-005", date: "2026-05-27", dayOfWeek: 1, shiftType: "afternoon", route: "Berger – Oshodi", startTime: "14:00", endTime: "22:00", status: "assigned" },
  { id: "sh26", driverId: "d5", driverName: "Seun Adeyemi", driverCode: "KJA-005", date: "2026-05-28", dayOfWeek: 2, shiftType: "afternoon", route: "Berger – Oshodi", startTime: "14:00", endTime: "22:00", status: "assigned" },
  { id: "sh27", driverId: "d5", driverName: "Seun Adeyemi", driverCode: "KJA-005", date: "2026-05-29", dayOfWeek: 3, shiftType: "afternoon", route: "Berger – Oshodi", startTime: "14:00", endTime: "22:00", status: "assigned" },
  { id: "sh28", driverId: "d5", driverName: "Seun Adeyemi", driverCode: "KJA-005", date: "2026-05-30", dayOfWeek: 4, shiftType: "afternoon", route: "Berger – Oshodi", startTime: "14:00", endTime: "22:00", status: "assigned", complianceFlag: "hours_exceeded" },
  { id: "sh29", driverId: "d6", driverName: "Aminu Danbaba", driverCode: "KJA-006", date: "2026-05-26", dayOfWeek: 0, shiftType: "morning", route: "Berger – Oshodi", busCode: "BUS-02", startTime: "08:00", endTime: "16:00", status: "assigned" },
  { id: "sh30", driverId: "d6", driverName: "Aminu Danbaba", driverCode: "KJA-006", date: "2026-05-27", dayOfWeek: 1, shiftType: "morning", route: "Berger – Oshodi", busCode: "BUS-02", startTime: "08:00", endTime: "16:00", status: "assigned" },
  { id: "sh31", driverId: "d6", driverName: "Aminu Danbaba", driverCode: "KJA-006", date: "2026-05-28", dayOfWeek: 2, shiftType: "morning", route: "Berger – Oshodi", busCode: "BUS-02", startTime: "08:00", endTime: "16:00", status: "assigned" },
  { id: "sh32", driverId: "d6", driverName: "Aminu Danbaba", driverCode: "KJA-006", date: "2026-05-29", dayOfWeek: 3, shiftType: "morning", route: "Berger – Oshodi", busCode: "BUS-02", startTime: "08:00", endTime: "16:00", status: "assigned" },
  { id: "sh33", driverId: "d6", driverName: "Aminu Danbaba", driverCode: "KJA-006", date: "2026-05-30", dayOfWeek: 4, shiftType: "morning", route: "Berger – Oshodi", busCode: "BUS-02", startTime: "08:00", endTime: "16:00", status: "assigned" },
  { id: "sh34", driverId: "d6", driverName: "Aminu Danbaba", driverCode: "KJA-006", date: "2026-05-31", dayOfWeek: 5, shiftType: "morning", route: "Berger – Oshodi", busCode: "BUS-02", startTime: "08:00", endTime: "16:00", status: "assigned" },
  { id: "sh35", driverId: "d7", driverName: "Blessing Okafor", driverCode: "KJA-007", date: "2026-05-26", dayOfWeek: 0, shiftType: "morning", route: "", startTime: "", endTime: "", status: "leave" },
  { id: "sh36", driverId: "d7", driverName: "Blessing Okafor", driverCode: "KJA-007", date: "2026-05-27", dayOfWeek: 1, shiftType: "morning", route: "", startTime: "", endTime: "", status: "leave" },
  { id: "sh37", driverId: "d7", driverName: "Blessing Okafor", driverCode: "KJA-007", date: "2026-05-28", dayOfWeek: 2, shiftType: "morning", route: "", startTime: "", endTime: "", status: "leave" },
  { id: "sh38", driverId: "d7", driverName: "Blessing Okafor", driverCode: "KJA-007", date: "2026-05-29", dayOfWeek: 3, shiftType: "morning", route: "", startTime: "", endTime: "", status: "leave" },
  { id: "sh39", driverId: "d7", driverName: "Blessing Okafor", driverCode: "KJA-007", date: "2026-05-30", dayOfWeek: 4, shiftType: "morning", route: "", startTime: "", endTime: "", status: "leave" },
  { id: "sh40", driverId: "d8", driverName: "Emeka Nwosu", driverCode: "KJA-008", date: "2026-05-26", dayOfWeek: 0, shiftType: "morning", route: "", startTime: "", endTime: "", status: "blocked" },
  { id: "sh41", driverId: "d8", driverName: "Emeka Nwosu", driverCode: "KJA-008", date: "2026-05-27", dayOfWeek: 1, shiftType: "morning", route: "", startTime: "", endTime: "", status: "blocked" },
  { id: "sh42", driverId: "d8", driverName: "Emeka Nwosu", driverCode: "KJA-008", date: "2026-05-28", dayOfWeek: 2, shiftType: "morning", route: "", startTime: "", endTime: "", status: "blocked" },
  { id: "sh43", driverId: "d8", driverName: "Emeka Nwosu", driverCode: "KJA-008", date: "2026-05-29", dayOfWeek: 3, shiftType: "morning", route: "", startTime: "", endTime: "", status: "blocked" },
  { id: "sh44", driverId: "d8", driverName: "Emeka Nwosu", driverCode: "KJA-008", date: "2026-05-30", dayOfWeek: 4, shiftType: "morning", route: "", startTime: "", endTime: "", status: "blocked" },
  { id: "sh45", driverId: "d1", driverName: "Ibrahim Musa", driverCode: "KJA-001", date: "2026-06-02", dayOfWeek: 0, shiftType: "morning", route: "Lagos Island – Oshodi", busCode: "BUS-07", startTime: "06:00", endTime: "14:00", status: "assigned" },
  { id: "sh46", driverId: "d2", driverName: "Tunde Adeleke", driverCode: "KJA-002", date: "2026-06-02", dayOfWeek: 0, shiftType: "morning", route: "Oshodi – Ikeja", busCode: "BUS-12", startTime: "07:00", endTime: "15:00", status: "assigned" },
  { id: "sh47", driverId: "d4", driverName: "Fatima Garba", driverCode: "KJA-004", date: "2026-06-02", dayOfWeek: 0, shiftType: "morning", route: "Lagos Island – Lekki", busCode: "BUS-09", startTime: "06:30", endTime: "14:30", status: "assigned" },
  { id: "sh48", driverId: "d6", driverName: "Aminu Danbaba", driverCode: "KJA-006", date: "2026-06-02", dayOfWeek: 0, shiftType: "morning", route: "Berger – Oshodi", busCode: "BUS-02", startTime: "08:00", endTime: "16:00", status: "assigned" },
  { id: "sh49", driverId: "d1", driverName: "Ibrahim Musa", driverCode: "KJA-001", date: "2026-06-03", dayOfWeek: 1, shiftType: "morning", route: "Lagos Island – Oshodi", busCode: "BUS-07", startTime: "06:00", endTime: "14:00", status: "assigned" },
  { id: "sh50", driverId: "d2", driverName: "Tunde Adeleke", driverCode: "KJA-002", date: "2026-06-03", dayOfWeek: 1, shiftType: "morning", route: "Oshodi – Ikeja", busCode: "BUS-12", startTime: "07:00", endTime: "15:00", status: "assigned" },
]

export const vehicleBlocks: VehicleBlock[] = [
  { id: "vb1", busCode: "BUS-07", route: "Lagos Island – Oshodi", date: "2026-05-29", trips: 4, departure: "06:00", driverId: "d1", driverName: "Ibrahim Musa", status: "dispatched" },
  { id: "vb2", busCode: "BUS-12", route: "Oshodi – Ikeja", date: "2026-05-29", trips: 4, departure: "07:00", driverId: "d2", driverName: "Tunde Adeleke", status: "dispatched" },
  { id: "vb3", busCode: "BUS-09", route: "Lagos Island – Lekki", date: "2026-05-29", trips: 3, departure: "06:30", driverId: "d4", driverName: "Fatima Garba", status: "dispatched" },
  { id: "vb4", busCode: "BUS-04", route: "Ojota – CMS", date: "2026-05-29", trips: 3, departure: "06:00", status: "unassigned" },
  { id: "vb5", busCode: "BUS-02", route: "Berger – Oshodi", date: "2026-05-29", trips: 3, departure: "08:00", driverId: "d6", driverName: "Aminu Danbaba", status: "assigned" },
  { id: "vb6", busCode: "BUS-01", route: "Lagos Island – Oshodi", date: "2026-05-29", trips: 3, departure: "14:00", status: "unassigned" },
]

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
  { id: "di1", driverId: "d3", driverCode: "KJA-003", type: "late_start", description: "Did not accept assigned shift 38 minutes past scheduled departure. No prior notification given.", date: "2026-05-25", severity: "warning", status: "open" },
  { id: "di2", driverId: "d5", driverCode: "KJA-005", type: "complaint", description: "Passenger reported rude behaviour and refusal to give correct change on the Berger–Oshodi route.", date: "2026-05-22", severity: "info", status: "resolved" },
  { id: "di3", driverId: "d8", driverCode: "KJA-008", type: "fraud_suspicion", description: "Cash discrepancy of ₦22,500 found across 3 consecutive trips. Under-declared passenger count suspected.", date: "2026-05-20", severity: "critical", status: "open" },
  { id: "di4", driverId: "d2", driverCode: "KJA-002", type: "route_deviation", description: "Bus took an unofficial route at Oshodi junction without clearance. Route restored after 12 minutes.", date: "2026-05-18", severity: "warning", status: "dismissed" },
  { id: "di5", driverId: "d6", driverCode: "KJA-006", type: "no_show", description: "Failed to appear for assigned morning shift on 2026-05-15 without prior notification. Duty reassigned to backup driver.", date: "2026-05-15", severity: "warning", status: "resolved" },
  { id: "di6", driverId: "d1", driverCode: "KJA-001", type: "complaint", description: "Minor dispute with passenger over change amount. Resolved on-site. Passenger did not escalate.", date: "2026-05-10", severity: "info", status: "resolved" },
]

// ─── FINANCIALS ─────────────────────────────────────────────────────────────

export type FeeCollector = "platform" | "government" | "union" | "terminal"
export type TripSettlementStatus = "provisional" | "confirmed" | "fee_calculated" | "approved" | "paid" | "disputed"
export type ComplianceDocType = "operating_license" | "insurance" | "commercial_permit" | "tax_registration" | "inspection_certificate" | "roadworthiness"

export interface TripFeeItem {
  name: string
  collector: FeeCollector
  amount: number
}

export interface FieldExpense {
  type: string
  amount: number
  category: "official" | "informal"
  timestamp: string
  location?: string
  status: "pending" | "approved" | "rejected"
}

export interface TripRecord {
  id: string
  date: string
  route: string
  bus: string
  driver: string
  driverCode: string
  shiftType: "morning" | "afternoon" | "split"
  startTime: string
  endTime: string
  tripStatus: "completed" | "cancelled" | "partial"
  passengerCount: number
  grossRevenue: number
  fees: TripFeeItem[]
  fieldExpenses: FieldExpense[]
  netRevenue: number
  settlementStatus: TripSettlementStatus
}

export interface Settlement {
  id: string
  date: string
  driver: string
  driverCode: string
  bus: string
  route: string
  grossRevenue: number
  totalTripFees: number
  totalDailyFees: number
  fieldExpenses: number
  netRevenue: number
  ownerSharePct: number
  driverSharePct: number
  ownerAmount: number
  driverAmount: number
  status: TripSettlementStatus
  regulatorySummary: { collector: string; amount: number }[]
}

export interface ComplianceDoc {
  id: string
  busId: string
  busCode: string
  type: ComplianceDocType
  name: string
  expiryDate: string
  cost: number
  region: string
  issuingAuthority: string
  status: "valid" | "expiring_soon" | "expired"
  amortizedDailyRate: number
}

export const tripRecords: TripRecord[] = [
  {
    id: "tr1", date: "2026-05-29", route: "Lagos Island – Oshodi", bus: "BUS-07", driver: "Ibrahim Musa", driverCode: "KJA-001",
    shiftType: "morning", startTime: "06:00", endTime: "09:10", tripStatus: "completed", passengerCount: 26, grossRevenue: 13000,
    fees: [
      { name: "Platform Commission (5%)", collector: "platform", amount: 650 },
      { name: "Municipal Transport Tax (3%)", collector: "government", amount: 390 },
      { name: "Drivers Union Levy", collector: "union", amount: 200 },
      { name: "Terminal Entry Fee", collector: "terminal", amount: 150 },
    ],
    fieldExpenses: [{ type: "Bridge Toll", amount: 500, category: "official", timestamp: "06:45 AM", location: "Carter Bridge", status: "approved" }],
    netRevenue: 11110, settlementStatus: "paid",
  },
  {
    id: "tr2", date: "2026-05-29", route: "Lagos Island – Oshodi", bus: "BUS-07", driver: "Ibrahim Musa", driverCode: "KJA-001",
    shiftType: "morning", startTime: "09:30", endTime: "12:40", tripStatus: "completed", passengerCount: 24, grossRevenue: 12000,
    fees: [
      { name: "Platform Commission (5%)", collector: "platform", amount: 600 },
      { name: "Municipal Transport Tax (3%)", collector: "government", amount: 360 },
      { name: "Drivers Union Levy", collector: "union", amount: 200 },
      { name: "Terminal Entry Fee", collector: "terminal", amount: 150 },
    ],
    fieldExpenses: [],
    netRevenue: 10690, settlementStatus: "approved",
  },
  {
    id: "tr3", date: "2026-05-29", route: "Oshodi – Ikeja", bus: "BUS-12", driver: "Tunde Adeleke", driverCode: "KJA-002",
    shiftType: "morning", startTime: "07:00", endTime: "09:50", tripStatus: "completed", passengerCount: 28, grossRevenue: 14000,
    fees: [
      { name: "Platform Commission (5%)", collector: "platform", amount: 700 },
      { name: "Municipal Transport Tax (3%)", collector: "government", amount: 420 },
      { name: "Drivers Union Levy", collector: "union", amount: 200 },
    ],
    fieldExpenses: [],
    netRevenue: 12680, settlementStatus: "fee_calculated",
  },
  {
    id: "tr4", date: "2026-05-29", route: "Lagos Island – Lekki", bus: "BUS-09", driver: "Fatima Garba", driverCode: "KJA-004",
    shiftType: "morning", startTime: "06:30", endTime: "09:45", tripStatus: "completed", passengerCount: 30, grossRevenue: 18000,
    fees: [
      { name: "Platform Commission (5%)", collector: "platform", amount: 900 },
      { name: "Municipal Transport Tax (3%)", collector: "government", amount: 540 },
      { name: "Drivers Union Levy", collector: "union", amount: 200 },
      { name: "Lekki Terminal Fee", collector: "terminal", amount: 200 },
    ],
    fieldExpenses: [{ type: "Lekki Toll Gate", amount: 1000, category: "official", timestamp: "07:15 AM", location: "Lekki Toll Plaza", status: "approved" }],
    netRevenue: 15160, settlementStatus: "paid",
  },
  {
    id: "tr5", date: "2026-05-29", route: "Berger – Oshodi", bus: "BUS-02", driver: "Aminu Danbaba", driverCode: "KJA-006",
    shiftType: "morning", startTime: "08:00", endTime: "10:30", tripStatus: "completed", passengerCount: 22, grossRevenue: 11000,
    fees: [
      { name: "Platform Commission (5%)", collector: "platform", amount: 550 },
      { name: "Municipal Transport Tax (3%)", collector: "government", amount: 330 },
      { name: "Drivers Union Levy", collector: "union", amount: 200 },
    ],
    fieldExpenses: [],
    netRevenue: 9920, settlementStatus: "provisional",
  },
  {
    id: "tr6", date: "2026-05-29", route: "Ojota – CMS", bus: "BUS-04", driver: "Chukwuemeka Obi", driverCode: "KJA-003",
    shiftType: "morning", startTime: "06:00", endTime: "09:20", tripStatus: "completed", passengerCount: 24, grossRevenue: 12000,
    fees: [
      { name: "Platform Commission (5%)", collector: "platform", amount: 600 },
      { name: "Municipal Transport Tax (3%)", collector: "government", amount: 360 },
      { name: "Drivers Union Levy", collector: "union", amount: 200 },
      { name: "CMS Terminal Fee", collector: "terminal", amount: 150 },
    ],
    fieldExpenses: [{ type: "Fuel Top-Up", amount: 3000, category: "informal", timestamp: "07:30 AM", location: "Ojota", status: "pending" }],
    netRevenue: 7690, settlementStatus: "disputed",
  },
  {
    id: "tr7", date: "2026-05-28", route: "Berger – Oshodi", bus: "BUS-11", driver: "Seun Adeyemi", driverCode: "KJA-005",
    shiftType: "morning", startTime: "06:30", endTime: "09:15", tripStatus: "completed", passengerCount: 29, grossRevenue: 14500,
    fees: [
      { name: "Platform Commission (5%)", collector: "platform", amount: 725 },
      { name: "Municipal Transport Tax (3%)", collector: "government", amount: 435 },
      { name: "Drivers Union Levy", collector: "union", amount: 200 },
    ],
    fieldExpenses: [],
    netRevenue: 13140, settlementStatus: "paid",
  },
  {
    id: "tr8", date: "2026-05-28", route: "Lagos Island – Oshodi", bus: "BUS-07", driver: "Ibrahim Musa", driverCode: "KJA-001",
    shiftType: "morning", startTime: "06:00", endTime: "09:05", tripStatus: "completed", passengerCount: 25, grossRevenue: 12500,
    fees: [
      { name: "Platform Commission (5%)", collector: "platform", amount: 625 },
      { name: "Municipal Transport Tax (3%)", collector: "government", amount: 375 },
      { name: "Drivers Union Levy", collector: "union", amount: 200 },
      { name: "Terminal Entry Fee", collector: "terminal", amount: 150 },
    ],
    fieldExpenses: [],
    netRevenue: 11150, settlementStatus: "paid",
  },
  {
    id: "tr9", date: "2026-05-28", route: "Lagos Island – Lekki", bus: "BUS-09", driver: "Fatima Garba", driverCode: "KJA-004",
    shiftType: "morning", startTime: "06:30", endTime: "09:50", tripStatus: "completed", passengerCount: 27, grossRevenue: 16200,
    fees: [
      { name: "Platform Commission (5%)", collector: "platform", amount: 810 },
      { name: "Municipal Transport Tax (3%)", collector: "government", amount: 486 },
      { name: "Drivers Union Levy", collector: "union", amount: 200 },
      { name: "Lekki Terminal Fee", collector: "terminal", amount: 200 },
    ],
    fieldExpenses: [{ type: "Lekki Toll Gate", amount: 1000, category: "official", timestamp: "07:20 AM", location: "Lekki Toll Plaza", status: "approved" }],
    netRevenue: 13504, settlementStatus: "approved",
  },
  {
    id: "tr10", date: "2026-05-28", route: "Oshodi – Ikeja", bus: "BUS-12", driver: "Tunde Adeleke", driverCode: "KJA-002",
    shiftType: "morning", startTime: "07:00", endTime: "09:45", tripStatus: "completed", passengerCount: 22, grossRevenue: 11000,
    fees: [
      { name: "Platform Commission (5%)", collector: "platform", amount: 550 },
      { name: "Municipal Transport Tax (3%)", collector: "government", amount: 330 },
      { name: "Drivers Union Levy", collector: "union", amount: 200 },
    ],
    fieldExpenses: [],
    netRevenue: 9920, settlementStatus: "approved",
  },
  {
    id: "tr11", date: "2026-05-27", route: "Lagos Island – Oshodi", bus: "BUS-07", driver: "Ibrahim Musa", driverCode: "KJA-001",
    shiftType: "morning", startTime: "06:00", endTime: "09:00", tripStatus: "completed", passengerCount: 28, grossRevenue: 14000,
    fees: [
      { name: "Platform Commission (5%)", collector: "platform", amount: 700 },
      { name: "Municipal Transport Tax (3%)", collector: "government", amount: 420 },
      { name: "Drivers Union Levy", collector: "union", amount: 200 },
      { name: "Terminal Entry Fee", collector: "terminal", amount: 150 },
    ],
    fieldExpenses: [],
    netRevenue: 12530, settlementStatus: "paid",
  },
  {
    id: "tr12", date: "2026-05-27", route: "Lagos Island – Lekki", bus: "BUS-09", driver: "Fatima Garba", driverCode: "KJA-004",
    shiftType: "morning", startTime: "06:30", endTime: "09:55", tripStatus: "completed", passengerCount: 30, grossRevenue: 17000,
    fees: [
      { name: "Platform Commission (5%)", collector: "platform", amount: 850 },
      { name: "Municipal Transport Tax (3%)", collector: "government", amount: 510 },
      { name: "Drivers Union Levy", collector: "union", amount: 200 },
      { name: "Lekki Terminal Fee", collector: "terminal", amount: 200 },
    ],
    fieldExpenses: [],
    netRevenue: 15240, settlementStatus: "paid",
  },
]

export const settlements: Settlement[] = [
  {
    id: "s1", date: "2026-05-29", driver: "Ibrahim Musa", driverCode: "KJA-001", bus: "BUS-07", route: "Lagos Island – Oshodi",
    grossRevenue: 39500, totalTripFees: 4290, totalDailyFees: 800, fieldExpenses: 500, netRevenue: 33910,
    ownerSharePct: 80, driverSharePct: 20, ownerAmount: 27128, driverAmount: 6782,
    status: "paid",
    regulatorySummary: [
      { collector: "Platform", amount: 1975 },
      { collector: "Government", amount: 1185 },
      { collector: "Union", amount: 600 },
      { collector: "Terminal", amount: 530 },
    ],
  },
  {
    id: "s2", date: "2026-05-29", driver: "Fatima Garba", driverCode: "KJA-004", bus: "BUS-09", route: "Lagos Island – Lekki",
    grossRevenue: 51200, totalTripFees: 5492, totalDailyFees: 1200, fieldExpenses: 2000, netRevenue: 42508,
    ownerSharePct: 80, driverSharePct: 20, ownerAmount: 34006, driverAmount: 8502,
    status: "approved",
    regulatorySummary: [
      { collector: "Platform", amount: 2560 },
      { collector: "Government", amount: 1536 },
      { collector: "Union", amount: 800 },
      { collector: "Terminal", amount: 596 },
    ],
  },
  {
    id: "s3", date: "2026-05-29", driver: "Tunde Adeleke", driverCode: "KJA-002", bus: "BUS-12", route: "Oshodi – Ikeja",
    grossRevenue: 25000, totalTripFees: 2400, totalDailyFees: 600, fieldExpenses: 0, netRevenue: 22000,
    ownerSharePct: 80, driverSharePct: 20, ownerAmount: 17600, driverAmount: 4400,
    status: "fee_calculated",
    regulatorySummary: [
      { collector: "Platform", amount: 1250 },
      { collector: "Government", amount: 750 },
      { collector: "Union", amount: 400 },
    ],
  },
  {
    id: "s4", date: "2026-05-29", driver: "Aminu Danbaba", driverCode: "KJA-006", bus: "BUS-02", route: "Berger – Oshodi",
    grossRevenue: 11000, totalTripFees: 1080, totalDailyFees: 400, fieldExpenses: 0, netRevenue: 9520,
    ownerSharePct: 80, driverSharePct: 20, ownerAmount: 7616, driverAmount: 1904,
    status: "provisional",
    regulatorySummary: [
      { collector: "Platform", amount: 550 },
      { collector: "Government", amount: 330 },
      { collector: "Union", amount: 200 },
    ],
  },
  {
    id: "s5", date: "2026-05-29", driver: "Chukwuemeka Obi", driverCode: "KJA-003", bus: "BUS-04", route: "Ojota – CMS",
    grossRevenue: 12000, totalTripFees: 1310, totalDailyFees: 400, fieldExpenses: 3000, netRevenue: 7290,
    ownerSharePct: 80, driverSharePct: 20, ownerAmount: 5832, driverAmount: 1458,
    status: "disputed",
    regulatorySummary: [
      { collector: "Platform", amount: 600 },
      { collector: "Government", amount: 360 },
      { collector: "Union", amount: 200 },
      { collector: "Terminal", amount: 150 },
    ],
  },
]

export const complianceDocs: ComplianceDoc[] = [
  { id: "cd1", busId: "b6", busCode: "BUS-07", type: "insurance", name: "Third-Party Insurance", expiryDate: "2026-09-15", cost: 180000, region: "Lagos State", issuingAuthority: "NAICOM", status: "valid", amortizedDailyRate: 493 },
  { id: "cd2", busId: "b6", busCode: "BUS-07", type: "operating_license", name: "Transport Operator Licence", expiryDate: "2026-07-15", cost: 45000, region: "Lagos State", issuingAuthority: "LASTMA", status: "expiring_soon", amortizedDailyRate: 123 },
  { id: "cd3", busId: "b6", busCode: "BUS-07", type: "commercial_permit", name: "Commercial Route Permit", expiryDate: "2027-01-15", cost: 25000, region: "Lagos State", issuingAuthority: "LAMATA", status: "valid", amortizedDailyRate: 68 },
  { id: "cd4", busId: "b8", busCode: "BUS-12", type: "insurance", name: "Third-Party Insurance", expiryDate: "2026-08-20", cost: 180000, region: "Lagos State", issuingAuthority: "NAICOM", status: "valid", amortizedDailyRate: 493 },
  { id: "cd5", busId: "b8", busCode: "BUS-12", type: "inspection_certificate", name: "Vehicle Roadworthiness", expiryDate: "2026-07-10", cost: 15000, region: "Lagos State", issuingAuthority: "VIO", status: "expiring_soon", amortizedDailyRate: 41 },
  { id: "cd6", busId: "b7", busCode: "BUS-09", type: "insurance", name: "Third-Party Insurance", expiryDate: "2026-10-01", cost: 180000, region: "Lagos State", issuingAuthority: "NAICOM", status: "valid", amortizedDailyRate: 493 },
  { id: "cd7", busId: "b7", busCode: "BUS-09", type: "operating_license", name: "Transport Operator Licence", expiryDate: "2027-01-20", cost: 45000, region: "Lagos State", issuingAuthority: "LASTMA", status: "valid", amortizedDailyRate: 123 },
  { id: "cd8", busId: "b4", busCode: "BUS-04", type: "insurance", name: "Third-Party Insurance", expiryDate: "2026-12-01", cost: 180000, region: "Lagos State", issuingAuthority: "NAICOM", status: "valid", amortizedDailyRate: 493 },
  { id: "cd9", busId: "b4", busCode: "BUS-04", type: "commercial_permit", name: "Commercial Route Permit", expiryDate: "2026-11-10", cost: 25000, region: "Lagos State", issuingAuthority: "LAMATA", status: "valid", amortizedDailyRate: 68 },
  { id: "cd10", busId: "b3", busCode: "BUS-03", type: "insurance", name: "Third-Party Insurance", expiryDate: "2026-05-28", cost: 180000, region: "Lagos State", issuingAuthority: "NAICOM", status: "expired", amortizedDailyRate: 493 },
  { id: "cd11", busId: "b3", busCode: "BUS-03", type: "roadworthiness", name: "Roadworthiness Certificate", expiryDate: "2026-04-30", cost: 20000, region: "Lagos State", issuingAuthority: "VIO", status: "expired", amortizedDailyRate: 55 },
  { id: "cd12", busId: "b2", busCode: "BUS-02", type: "insurance", name: "Third-Party Insurance", expiryDate: "2026-07-10", cost: 180000, region: "Lagos State", issuingAuthority: "NAICOM", status: "expiring_soon", amortizedDailyRate: 493 },
  { id: "cd13", busId: "b2", busCode: "BUS-02", type: "operating_license", name: "Transport Operator Licence", expiryDate: "2026-08-05", cost: 45000, region: "Lagos State", issuingAuthority: "LASTMA", status: "valid", amortizedDailyRate: 123 },
]

// ─── EXCEPTIONS ───────────────────────────────────────────────────────────────

export type ExceptionCategory = "driver" | "bus_asset" | "trip_route" | "passenger_payment" | "compliance" | "security_incident"
export type ExceptionStatus = "open" | "in_progress" | "resolved"

export interface ExceptionAuditEntry {
  timestamp: string
  action: string
  actor: string
  note?: string
}

export interface Exception {
  id: string
  category: ExceptionCategory
  severity: AlertSeverity
  title: string
  description: string
  route?: string
  bus?: string
  driver?: string
  tripId?: string
  detectedAt: string
  status: ExceptionStatus
  recommendedAction?: string
  auditLog: ExceptionAuditEntry[]
  resolvedAt?: string
  resolvedBy?: string
  resolution?: string
}

export interface MockPassenger {
  id: string
  name: string
  phone: string
  walletBalance: number
  recentTrips: { date: string; route: string; fare: number; tripId: string }[]
}

export interface PassengerRefund {
  id: string
  passengerId: string
  passengerName: string
  passengerPhone: string
  tripId: string
  route: string
  date: string
  originalCharge: number
  refundAmount: number
  reason: string
  status: "pending" | "approved" | "processed" | "rejected"
  requestedAt: string
  processedAt?: string
  processedBy?: string
}

export interface IncidentReport {
  id: string
  exceptionId?: string
  incidentType: "passenger_altercation" | "theft" | "assault" | "medical_emergency" | "fire" | "accident" | "fraud" | "suspicious_boarding"
  timestamp: string
  route: string
  bus: string
  driver: string
  passengerInvolved?: string
  description: string
  actionTaken: string
  driverSuspended: boolean
  busLocked: boolean
  escalatedToPolice: boolean
  reportedBy: string
  status: "open" | "under_review" | "closed"
}

export const mockPassengers: MockPassenger[] = [
  {
    id: "p1", name: "Adaeze Nwosu", phone: "080 1122 3344", walletBalance: 4500,
    recentTrips: [
      { date: "2026-05-29", route: "Lagos Island – Lekki", fare: 600, tripId: "t4-AM" },
      { date: "2026-05-29", route: "Lagos Island – Lekki", fare: 600, tripId: "t4-AM" },
      { date: "2026-05-28", route: "Lagos Island – Lekki", fare: 600, tripId: "t9-AM" },
    ],
  },
  {
    id: "p2", name: "Emeka Okeke", phone: "080 5566 7788", walletBalance: 2200,
    recentTrips: [
      { date: "2026-05-29", route: "Ojota – CMS", fare: 500, tripId: "t6-AM" },
      { date: "2026-05-28", route: "Ojota – CMS", fare: 500, tripId: "t6-PM" },
    ],
  },
  {
    id: "p3", name: "Chidinma Eze", phone: "080 9900 1122", walletBalance: 8000,
    recentTrips: [
      { date: "2026-05-29", route: "Oshodi – Ikeja", fare: 400, tripId: "t3-AM" },
      { date: "2026-05-29", route: "Oshodi – Ikeja", fare: 400, tripId: "t3-AM" },
    ],
  },
]

export const exceptions: Exception[] = [
  {
    id: "ex1", category: "driver", severity: "critical",
    title: "Driver No-Show — KJA-003",
    description: "Chukwuemeka Obi failed to check in for scheduled morning shift. Departure was 06:00. Duty unassigned and BUS-04 standing idle at terminal.",
    route: "Ojota – CMS", bus: "BUS-04", driver: "Chukwuemeka Obi",
    detectedAt: "06:44 AM", status: "open",
    recommendedAction: "Assign replacement driver",
    auditLog: [{ timestamp: "06:44 AM", action: "Exception detected — driver did not check in for scheduled 06:00 departure", actor: "System" }],
  },
  {
    id: "ex2", category: "driver", severity: "high",
    title: "Mid-Trip Swap Request — KJA-002",
    description: "Tunde Adeleke requested driver swap at Ikeja due to fatigue. Trip 3 of 4 currently in progress. Handover required before next trip departs.",
    route: "Oshodi – Ikeja", bus: "BUS-12", driver: "Tunde Adeleke",
    detectedAt: "10:15 AM", status: "in_progress",
    recommendedAction: "Assign replacement driver with handover location",
    auditLog: [
      { timestamp: "10:15 AM", action: "Swap request received from driver KJA-002 via app", actor: "System" },
      { timestamp: "10:18 AM", action: "Exception acknowledged by dispatcher — searching for available driver", actor: "Dispatch" },
    ],
  },
  {
    id: "ex3", category: "bus_asset", severity: "critical",
    title: "Bus Breakdown — BUS-03 (Pre-Trip)",
    description: "BUS-03 failed pre-trip inspection. Engine fault light triggered at terminal. Bus removed from scheduled Berger–Oshodi service today.",
    route: "Berger – Oshodi", bus: "BUS-03",
    detectedAt: "05:50 AM", status: "in_progress",
    recommendedAction: "Assign replacement bus",
    auditLog: [
      { timestamp: "05:50 AM", action: "Pre-trip inspection failed — engine fault code triggered", actor: "System" },
      { timestamp: "06:05 AM", action: "Bus removed from active service roster for today", actor: "Fleet Manager" },
    ],
  },
  {
    id: "ex4", category: "bus_asset", severity: "high",
    title: "Mid-Trip Bus Breakdown — BUS-07",
    description: "BUS-07 reported transmission fault en route on Third Mainland Bridge. 18 passengers onboard. Replacement dispatch needed — passengers must not be double-billed.",
    route: "Lagos Island – Oshodi", bus: "BUS-07", driver: "Ibrahim Musa", tripId: "t2",
    detectedAt: "09:22 AM", status: "open",
    recommendedAction: "Dispatch replacement bus + manage passenger transfer (no double billing)",
    auditLog: [{ timestamp: "09:22 AM", action: "Transmission fault reported by driver KJA-001 — bus stationary on Third Mainland Bridge", actor: "System" }],
  },
  {
    id: "ex5", category: "trip_route", severity: "warning",
    title: "Route Deviation Detected — BUS-09",
    description: "BUS-09 GPS shows 1.2km deviation from assigned Lagos Island–Lekki corridor near Ajah junction. No official diversion clearance on file.",
    route: "Lagos Island – Lekki", bus: "BUS-09", driver: "Fatima Garba",
    detectedAt: "10:42 AM", status: "open",
    recommendedAction: "Contact driver and log route deviation",
    auditLog: [{ timestamp: "10:42 AM", action: "Route deviation flagged automatically by GPS tracking — 1.2km off assigned corridor", actor: "System" }],
  },
  {
    id: "ex6", category: "trip_route", severity: "warning",
    title: "Overcapacity — BUS-09 Trip 2",
    description: "BUS-09 boarded 34 passengers against rated capacity of 30. Driver allowed additional boardings at Lekki Phase 1 stop. Requires admin override or offboarding.",
    route: "Lagos Island – Lekki", bus: "BUS-09", driver: "Fatima Garba", tripId: "t1",
    detectedAt: "09:55 AM", status: "open",
    recommendedAction: "Admin override required — document justification or instruct driver to offboard 4 passengers",
    auditLog: [{ timestamp: "09:55 AM", action: "Passenger count exceeded rated capacity by 4 — AFC system flagged boarding anomaly", actor: "System" }],
  },
  {
    id: "ex7", category: "passenger_payment", severity: "high",
    title: "Double-Charge Complaint — Adaeze Nwosu",
    description: "Passenger Adaeze Nwosu was charged twice on Lagos Island – Lekki trip, 29 May 2026. Both deductions confirmed in wallet log. ₦600 refund due.",
    route: "Lagos Island – Lekki",
    detectedAt: "10:05 AM", status: "open",
    recommendedAction: "Issue passenger refund via wallet",
    auditLog: [{ timestamp: "10:05 AM", action: "Double-charge complaint logged via passenger helpline — wallet deduction verified", actor: "System" }],
  },
  {
    id: "ex8", category: "passenger_payment", severity: "warning",
    title: "QR Scanner Offline — BUS-12 Trip 3",
    description: "Boarding QR scanner on BUS-12 failed for 6 passengers at Oshodi terminal. Passengers unable to board digitally. Fallback cash boarding decision pending.",
    route: "Oshodi – Ikeja", bus: "BUS-12", driver: "Tunde Adeleke",
    detectedAt: "09:18 AM", status: "in_progress",
    recommendedAction: "Apply fallback boarding rule — manually log passenger count",
    auditLog: [
      { timestamp: "09:18 AM", action: "QR scanner offline reported by driver KJA-002 — 6 passengers queued", actor: "System" },
      { timestamp: "09:20 AM", action: "Fallback boarding authorised — manual headcount logging activated", actor: "Dispatch" },
    ],
  },
  {
    id: "ex9", category: "compliance", severity: "critical",
    title: "Hours Limit Exceeded — KJA-005",
    description: "Seun Adeyemi has accumulated 48 hours this week, exceeding the 45-hour regulatory limit. System has blocked further assignment. Documented override required to proceed.",
    driver: "Seun Adeyemi",
    detectedAt: "Yesterday 22:00", status: "open",
    recommendedAction: "Force end shift / swap driver / approve extension with documented justification",
    auditLog: [{ timestamp: "Yesterday 22:00", action: "Weekly hours limit exceeded — KJA-005 at 48h against 45h regulatory cap", actor: "System" }],
  },
  {
    id: "ex10", category: "compliance", severity: "warning",
    title: "No Break Logged — KJA-001",
    description: "Ibrahim Musa completed 3 consecutive trips without a recorded rest break. Policy requires minimum 20-minute break after 4 hours on duty.",
    driver: "Ibrahim Musa", route: "Lagos Island – Oshodi",
    detectedAt: "11:30 AM", status: "open",
    recommendedAction: "Force break before next assigned trip",
    auditLog: [{ timestamp: "11:30 AM", action: "No rest break logged after 4h 30m continuous duty — compliance policy triggered", actor: "System" }],
  },
  {
    id: "ex11", category: "security_incident", severity: "critical",
    title: "Code Red — KJA-006 at Oshodi Terminal",
    description: "Aminu Danbaba triggered silent emergency at Oshodi Terminal. Passenger confrontation escalated physically. Police notified. Incident requires formal report and driver welfare check.",
    route: "Berger – Oshodi", bus: "BUS-02", driver: "Aminu Danbaba",
    detectedAt: "Yesterday 14:20", status: "in_progress",
    recommendedAction: "File incident report — assess driver for suspension pending review",
    auditLog: [
      { timestamp: "Yesterday 14:20", action: "Silent emergency triggered by driver KJA-006 at Oshodi Terminal", actor: "System" },
      { timestamp: "Yesterday 14:22", action: "Police notified. Fleet manager and supervisor alerted.", actor: "System" },
      { timestamp: "Yesterday 14:35", action: "Situation defused. Driver safe. Passengers evacuated front section.", actor: "Fleet Manager" },
    ],
  },
  {
    id: "ex12", category: "security_incident", severity: "high",
    title: "Suspicious QR Fraud — BUS-04",
    description: "AFC system detected 8 boardings using duplicate QR codes on BUS-04 morning trip. Possible organised QR code fraud. Boarding records flagged for investigation.",
    bus: "BUS-04", route: "Ojota – CMS",
    detectedAt: "07:45 AM", status: "open",
    recommendedAction: "Lock bus QR/AFC system and investigate boarding records",
    auditLog: [{ timestamp: "07:45 AM", action: "8 duplicate QR code boardings detected on AFC system — fraud pattern flagged", actor: "System" }],
  },
]

export const incidentReports: IncidentReport[] = [
  {
    id: "ir1", exceptionId: "ex11",
    incidentType: "passenger_altercation",
    timestamp: "Yesterday 14:20",
    route: "Berger – Oshodi", bus: "BUS-02", driver: "Aminu Danbaba",
    passengerInvolved: "Unknown — male, approx 35 yrs, grey shirt",
    description: "Passenger became aggressive when asked to board via queue at Oshodi Terminal. Verbal altercation escalated to physical confrontation. Driver triggered emergency alert. Other passengers evacuated to front section.",
    actionTaken: "Police notified and attended scene. Area secured. Driver given water and rest period. Passengers transferred to BUS-01 to complete route.",
    driverSuspended: false, busLocked: false, escalatedToPolice: true,
    reportedBy: "Fleet Manager", status: "under_review",
  },
]

export const passengerRefunds: PassengerRefund[] = [
  {
    id: "rf1", passengerId: "p1", passengerName: "Adaeze Nwosu", passengerPhone: "080 1122 3344",
    tripId: "t4-AM", route: "Lagos Island – Lekki", date: "2026-05-29",
    originalCharge: 1200, refundAmount: 600,
    reason: "Double charge — AFC system deducted twice on single boarding event",
    status: "pending", requestedAt: "10:05 AM",
  },
]
