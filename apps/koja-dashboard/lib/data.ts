export type DriverStatus = "active" | "inactive" | "suspended" | "on_leave"
export type BusStatus = "active" | "inactive" | "maintenance" | "decommissioned"
export type AlertSeverity = "critical" | "high" | "medium"
export type AlertType =
  | "no_show"
  | "breakdown"
  | "offline"
  | "compliance"
  | "discrepancy"
  | "late_start"
  | "low_utilisation"
  | "gps_lost"
  | "doc_expiry"
export type TripStatus = "en_route" | "boarding" | "completed" | "cancelled"
export type ReconciliationStatus = "match" | "discrepancy" | "pending"
export type LeaveType = "annual" | "sick" | "emergency" | "maternity"
export type LeaveStatus = "pending" | "approved" | "declined"
export type ComplianceStatus = "verified" | "pending" | "expired"
export type BusType = "midi" | "mini" | "full" | "brt"
export type ShiftType = "morning" | "afternoon" | "evening"

export interface Driver {
  id: string
  name: string
  code: string
  phone: string
  email: string
  status: DriverStatus
  photo: string
  license: string
  licenseExpiry: string
  nin: string
  compliance: ComplianceStatus
  assignedBus: string | null
  assignedRoute: string | null
  shift: ShiftType | null
  earnings: { today: number; week: number; month: number }
  trips: { today: number; week: number; month: number; onTimeRate: number }
  incidents: number
  joinDate: string
  depot: string
  address: string
  emergencyContact: string
}

export interface Bus {
  id: string
  plateNumber: string
  vin: string
  code: string
  type: BusType
  manufacturer: string
  model: string
  year: number
  color: string
  status: BusStatus
  capacity: number
  assignedDriver: string | null
  assignedRoute: string | null
  depot: string
  gpsDevice: string | null
  documents: {
    insurance: { expiry: string; status: ComplianceStatus }
    roadworthiness: { expiry: string; status: ComplianceStatus }
    license: { expiry: string; status: ComplianceStatus }
  }
  earnings: { today: number; week: number; month: number }
  trips: { today: number; total: number }
  lastMaintenance: string
  nextMaintenance: string
  fuelLevel: number
  mileage: number
}

export interface Alert {
  id: string
  type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  entity: string
  entityId: string
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: string
  timestamp: string
  actionRequired: boolean
}

export interface Trip {
  id: string
  driver: string
  driverId: string
  bus: string
  busId: string
  route: string
  status: TripStatus
  pax: number
  capacity: number
  departure: string
  arrival: string | null
  revenue: number
}

export interface ReconciliationItem {
  id: string
  driver: string
  driverId: string
  bus: string
  route: string
  date: string
  expectedRevenue: number
  declaredRevenue: number
  trips: number
  status: ReconciliationStatus
  notes: string
}

export interface LeaveRequest {
  id: string
  driver: string
  driverId: string
  type: LeaveType
  startDate: string
  endDate: string
  days: number
  reason: string
  status: LeaveStatus
  submittedAt: string
  dutiesAffected: number
  declineReason?: string
}

export interface DispatchPlan {
  id: string
  route: string
  driver: string
  driverId: string
  bus: string
  busId: string
  status: "pending" | "active" | "no_show" | "complete" | "cancelled"
  departure: string
  trips: number
  pax: number
}

export interface Notification {
  id: string
  type: "alert" | "dispatch" | "leave" | "reconciliation" | "system"
  title: string
  message: string
  read: boolean
  timestamp: string
  link?: string
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: "owner" | "fleet_manager" | "scheduler" | "dispatcher" | "finance" | "auditor"
  status: "active" | "suspended"
  lastLogin: string
  depot: string
}

export const drivers: Driver[] = [
  {
    id: "DRV-001",
    name: "Fatima Garba",
    code: "KJA-001",
    phone: "+234 803 456 7890",
    email: "fatima.garba@koja.ng",
    status: "active",
    photo: "FG",
    license: "LAS-2021-445123",
    licenseExpiry: "2026-08-15",
    nin: "****5678",
    compliance: "verified",
    assignedBus: "BUS-01",
    assignedRoute: "Island → Lekki",
    shift: "morning",
    earnings: { today: 18500, week: 92000, month: 380000 },
    trips: { today: 4, week: 22, month: 89, onTimeRate: 94 },
    incidents: 0,
    joinDate: "2023-03-15",
    depot: "Lagos Island",
    address: "12 Bode Thomas, Surulere, Lagos",
    emergencyContact: "+234 812 234 5678",
  },
  {
    id: "DRV-002",
    name: "Ibrahim Musa",
    code: "KJA-002",
    phone: "+234 806 789 1234",
    email: "ibrahim.musa@koja.ng",
    status: "active",
    photo: "IM",
    license: "LAS-2020-332244",
    licenseExpiry: "2025-11-30",
    nin: "****1234",
    compliance: "verified",
    assignedBus: "BUS-02",
    assignedRoute: "Island → Oshodi",
    shift: "morning",
    earnings: { today: 14200, week: 78000, month: 312000 },
    trips: { today: 3, week: 18, month: 72, onTimeRate: 88 },
    incidents: 1,
    joinDate: "2022-07-20",
    depot: "Lagos Island",
    address: "45 Babs Animashaun, Surulere, Lagos",
    emergencyContact: "+234 803 987 6543",
  },
  {
    id: "DRV-003",
    name: "Chukwuemeka Obi",
    code: "KJA-003",
    phone: "+234 809 234 5678",
    email: "chukwuemeka.obi@koja.ng",
    status: "inactive",
    photo: "CO",
    license: "LAS-2019-228891",
    licenseExpiry: "2024-06-30",
    nin: "****9012",
    compliance: "expired",
    assignedBus: null,
    assignedRoute: null,
    shift: null,
    earnings: { today: 0, week: 0, month: 128000 },
    trips: { today: 0, week: 0, month: 51, onTimeRate: 76 },
    incidents: 2,
    joinDate: "2021-11-05",
    depot: "Oshodi",
    address: "7 Airport Road, Ikeja, Lagos",
    emergencyContact: "+234 816 543 2109",
  },
  {
    id: "DRV-004",
    name: "Tunde Adeleke",
    code: "KJA-004",
    phone: "+234 802 345 6789",
    email: "tunde.adeleke@koja.ng",
    status: "active",
    photo: "TA",
    license: "LAS-2022-556677",
    licenseExpiry: "2027-02-28",
    nin: "****3456",
    compliance: "verified",
    assignedBus: "BUS-04",
    assignedRoute: "Oshodi → Ikeja",
    shift: "afternoon",
    earnings: { today: 16800, week: 84000, month: 336000 },
    trips: { today: 3, week: 20, month: 80, onTimeRate: 91 },
    incidents: 0,
    joinDate: "2022-05-10",
    depot: "Oshodi",
    address: "23 Agege Motor Road, Ogba, Lagos",
    emergencyContact: "+234 808 765 4321",
  },
  {
    id: "DRV-005",
    name: "Aminu Danbaba",
    code: "KJA-005",
    phone: "+234 811 456 7890",
    email: "aminu.danbaba@koja.ng",
    status: "active",
    photo: "AD",
    license: "LAS-2021-778899",
    licenseExpiry: "2026-04-15",
    nin: "****7890",
    compliance: "verified",
    assignedBus: "BUS-05",
    assignedRoute: "Berger → Oshodi",
    shift: "morning",
    earnings: { today: 12400, week: 68000, month: 272000 },
    trips: { today: 2, week: 15, month: 60, onTimeRate: 85 },
    incidents: 3,
    joinDate: "2023-01-18",
    depot: "Berger",
    address: "88 Ikorodu Road, Ketu, Lagos",
    emergencyContact: "+234 805 432 1098",
  },
  {
    id: "DRV-006",
    name: "Seun Adeyemi",
    code: "KJA-006",
    phone: "+234 814 567 8901",
    email: "seun.adeyemi@koja.ng",
    status: "suspended",
    photo: "SA",
    license: "LAS-2020-889900",
    licenseExpiry: "2025-09-20",
    nin: "****2345",
    compliance: "pending",
    assignedBus: null,
    assignedRoute: null,
    shift: null,
    earnings: { today: 0, week: 0, month: 98000 },
    trips: { today: 0, week: 0, month: 39, onTimeRate: 72 },
    incidents: 5,
    joinDate: "2021-08-22",
    depot: "Ikeja",
    address: "56 Awolowo Way, Ikeja, Lagos",
    emergencyContact: "+234 802 109 8765",
  },
  {
    id: "DRV-007",
    name: "Ngozi Okonkwo",
    code: "KJA-007",
    phone: "+234 817 678 9012",
    email: "ngozi.okonkwo@koja.ng",
    status: "on_leave",
    photo: "NO",
    license: "LAS-2022-991122",
    licenseExpiry: "2027-07-31",
    nin: "****6789",
    compliance: "verified",
    assignedBus: null,
    assignedRoute: null,
    shift: null,
    earnings: { today: 0, week: 0, month: 156000 },
    trips: { today: 0, week: 0, month: 62, onTimeRate: 96 },
    incidents: 0,
    joinDate: "2022-02-14",
    depot: "Lagos Island",
    address: "34 Ikoyi Road, Ikoyi, Lagos",
    emergencyContact: "+234 809 876 5432",
  },
  {
    id: "DRV-008",
    name: "Bello Usman",
    code: "KJA-008",
    phone: "+234 820 789 0123",
    email: "bello.usman@koja.ng",
    status: "active",
    photo: "BU",
    license: "LAS-2023-112233",
    licenseExpiry: "2028-01-10",
    nin: "****0123",
    compliance: "verified",
    assignedBus: "BUS-08",
    assignedRoute: "Lekki → Island",
    shift: "evening",
    earnings: { today: 9800, week: 52000, month: 208000 },
    trips: { today: 2, week: 12, month: 48, onTimeRate: 89 },
    incidents: 1,
    joinDate: "2023-09-01",
    depot: "Lekki",
    address: "12 Admiralty Way, Lekki Phase 1, Lagos",
    emergencyContact: "+234 813 210 9876",
  },
]

export const buses: Bus[] = [
  {
    id: "BUS-01",
    plateNumber: "LND 234 KJ",
    vin: "1HGBH41JXMN109186",
    code: "KJB-001",
    type: "midi",
    manufacturer: "Toyota",
    model: "Coaster",
    year: 2020,
    color: "White/Blue",
    status: "active",
    capacity: 30,
    assignedDriver: "DRV-001",
    assignedRoute: "Island → Lekki",
    depot: "Lagos Island",
    gpsDevice: "GPS-441",
    documents: {
      insurance: { expiry: "2026-08-01", status: "verified" },
      roadworthiness: { expiry: "2026-03-15", status: "verified" },
      license: { expiry: "2026-08-01", status: "verified" },
    },
    earnings: { today: 18500, week: 92000, month: 380000 },
    trips: { today: 4, total: 487 },
    lastMaintenance: "2025-12-10",
    nextMaintenance: "2026-06-10",
    fuelLevel: 78,
    mileage: 87432,
  },
  {
    id: "BUS-02",
    plateNumber: "LND 567 KJ",
    vin: "2T1BURHE0JC073426",
    code: "KJB-002",
    type: "midi",
    manufacturer: "Toyota",
    model: "Coaster",
    year: 2021,
    color: "White/Blue",
    status: "active",
    capacity: 30,
    assignedDriver: "DRV-002",
    assignedRoute: "Island → Oshodi",
    depot: "Lagos Island",
    gpsDevice: "GPS-442",
    documents: {
      insurance: { expiry: "2025-11-30", status: "expired" },
      roadworthiness: { expiry: "2026-05-20", status: "verified" },
      license: { expiry: "2025-11-30", status: "expired" },
    },
    earnings: { today: 14200, week: 78000, month: 312000 },
    trips: { today: 3, total: 392 },
    lastMaintenance: "2025-10-05",
    nextMaintenance: "2026-04-05",
    fuelLevel: 45,
    mileage: 72150,
  },
  {
    id: "BUS-03",
    plateNumber: "LND 890 KJ",
    vin: "3VWD17AJ4FM387512",
    code: "KJB-003",
    type: "mini",
    manufacturer: "Nissan",
    model: "Urvan",
    year: 2019,
    color: "Silver",
    status: "maintenance",
    capacity: 18,
    assignedDriver: null,
    assignedRoute: null,
    depot: "Oshodi",
    gpsDevice: null,
    documents: {
      insurance: { expiry: "2026-01-15", status: "verified" },
      roadworthiness: { expiry: "2025-12-31", status: "expired" },
      license: { expiry: "2026-01-15", status: "verified" },
    },
    earnings: { today: 0, week: 0, month: 98000 },
    trips: { today: 0, total: 623 },
    lastMaintenance: "2026-05-18",
    nextMaintenance: "2026-06-18",
    fuelLevel: 20,
    mileage: 124800,
  },
  {
    id: "BUS-04",
    plateNumber: "LND 123 KJ",
    vin: "4T1BF1FK5EU822903",
    code: "KJB-004",
    type: "midi",
    manufacturer: "Toyota",
    model: "Coaster",
    year: 2022,
    color: "White/Blue",
    status: "active",
    capacity: 30,
    assignedDriver: "DRV-004",
    assignedRoute: "Oshodi → Ikeja",
    depot: "Oshodi",
    gpsDevice: "GPS-445",
    documents: {
      insurance: { expiry: "2027-02-28", status: "verified" },
      roadworthiness: { expiry: "2027-02-28", status: "verified" },
      license: { expiry: "2027-02-28", status: "verified" },
    },
    earnings: { today: 16800, week: 84000, month: 336000 },
    trips: { today: 3, total: 310 },
    lastMaintenance: "2026-01-15",
    nextMaintenance: "2026-07-15",
    fuelLevel: 62,
    mileage: 54320,
  },
  {
    id: "BUS-05",
    plateNumber: "LND 456 KJ",
    vin: "5YJSA1E26HF182473",
    code: "KJB-005",
    type: "midi",
    manufacturer: "Mitsubishi",
    model: "Rosa",
    year: 2021,
    color: "White",
    status: "active",
    capacity: 28,
    assignedDriver: "DRV-005",
    assignedRoute: "Berger → Oshodi",
    depot: "Berger",
    gpsDevice: "GPS-446",
    documents: {
      insurance: { expiry: "2026-04-15", status: "verified" },
      roadworthiness: { expiry: "2026-04-15", status: "verified" },
      license: { expiry: "2026-04-15", status: "verified" },
    },
    earnings: { today: 12400, week: 68000, month: 272000 },
    trips: { today: 2, total: 268 },
    lastMaintenance: "2026-02-20",
    nextMaintenance: "2026-08-20",
    fuelLevel: 55,
    mileage: 48900,
  },
  {
    id: "BUS-06",
    plateNumber: "LND 789 KJ",
    vin: "6GT12UEJ3B1022814",
    code: "KJB-006",
    type: "full",
    manufacturer: "Higer",
    model: "KLQ6129",
    year: 2020,
    color: "White/Green",
    status: "inactive",
    capacity: 45,
    assignedDriver: null,
    assignedRoute: null,
    depot: "Ikeja",
    gpsDevice: null,
    documents: {
      insurance: { expiry: "2026-06-30", status: "verified" },
      roadworthiness: { expiry: "2026-06-30", status: "verified" },
      license: { expiry: "2026-06-30", status: "verified" },
    },
    earnings: { today: 0, week: 0, month: 0 },
    trips: { today: 0, total: 0 },
    lastMaintenance: "2025-11-01",
    nextMaintenance: "2026-05-01",
    fuelLevel: 90,
    mileage: 12400,
  },
  {
    id: "BUS-07",
    plateNumber: "LND 321 KJ",
    vin: "7HVBBABN4YA100994",
    code: "KJB-007",
    type: "midi",
    manufacturer: "Toyota",
    model: "Coaster",
    year: 2023,
    color: "White/Blue",
    status: "active",
    capacity: 30,
    assignedDriver: null,
    assignedRoute: null,
    depot: "Lekki",
    gpsDevice: "GPS-449",
    documents: {
      insurance: { expiry: "2028-01-10", status: "verified" },
      roadworthiness: { expiry: "2028-01-10", status: "verified" },
      license: { expiry: "2028-01-10", status: "verified" },
    },
    earnings: { today: 0, week: 32000, month: 140000 },
    trips: { today: 0, total: 98 },
    lastMaintenance: "2026-04-01",
    nextMaintenance: "2026-10-01",
    fuelLevel: 100,
    mileage: 18760,
  },
  {
    id: "BUS-08",
    plateNumber: "LND 654 KJ",
    vin: "8ASCS2360X4097501",
    code: "KJB-008",
    type: "midi",
    manufacturer: "Toyota",
    model: "Coaster",
    year: 2022,
    color: "White/Blue",
    status: "active",
    capacity: 30,
    assignedDriver: "DRV-008",
    assignedRoute: "Lekki → Island",
    depot: "Lekki",
    gpsDevice: "GPS-450",
    documents: {
      insurance: { expiry: "2027-06-15", status: "verified" },
      roadworthiness: { expiry: "2027-06-15", status: "verified" },
      license: { expiry: "2027-06-15", status: "verified" },
    },
    earnings: { today: 9800, week: 52000, month: 208000 },
    trips: { today: 2, total: 202 },
    lastMaintenance: "2026-03-15",
    nextMaintenance: "2026-09-15",
    fuelLevel: 68,
    mileage: 34100,
  },
]

export const alerts: Alert[] = [
  {
    id: "ALT-001",
    type: "breakdown",
    severity: "critical",
    title: "Bus Breakdown — BUS-03",
    message: "Engine failure reported on Third Mainland Bridge. Replacement dispatched.",
    entity: "BUS-03",
    entityId: "BUS-03",
    acknowledged: false,
    timestamp: "2026-05-22T08:15:00",
    actionRequired: true,
  },
  {
    id: "ALT-002",
    type: "late_start",
    severity: "critical",
    title: "Late Start — KJA-003",
    message: "Chukwuemeka Obi has not accepted shift. 38 minutes overdue.",
    entity: "DRV-003",
    entityId: "DRV-003",
    acknowledged: false,
    timestamp: "2026-05-22T07:38:00",
    actionRequired: true,
  },
  {
    id: "ALT-003",
    type: "discrepancy",
    severity: "high",
    title: "Cash Discrepancy — KJA-005",
    message: "Seun Adeyemi declared ₦8,500 less than expected.",
    entity: "DRV-006",
    entityId: "DRV-006",
    acknowledged: false,
    timestamp: "2026-05-22T06:45:00",
    actionRequired: true,
  },
  {
    id: "ALT-004",
    type: "doc_expiry",
    severity: "high",
    title: "Insurance Expired — BUS-02",
    message: "Vehicle insurance for LND 567 KJ expired on 30 Nov 2025.",
    entity: "BUS-02",
    entityId: "BUS-02",
    acknowledged: false,
    timestamp: "2026-05-22T00:01:00",
    actionRequired: true,
  },
  {
    id: "ALT-005",
    type: "low_utilisation",
    severity: "medium",
    title: "Low Seat Utilisation — Route B",
    message: "Berger → Oshodi route averaging 38% capacity today.",
    entity: "Route",
    entityId: "route-b",
    acknowledged: true,
    acknowledgedBy: "Fleet Manager",
    acknowledgedAt: "2026-05-22T09:00:00",
    timestamp: "2026-05-22T05:30:00",
    actionRequired: false,
  },
  {
    id: "ALT-006",
    type: "no_show",
    severity: "critical",
    title: "Driver No-Show — KJA-007",
    message: "Ngozi Okonkwo did not report for assigned morning duty.",
    entity: "DRV-007",
    entityId: "DRV-007",
    acknowledged: false,
    timestamp: "2026-05-22T06:00:00",
    actionRequired: true,
  },
]

export const activeTrips: Trip[] = [
  {
    id: "TRP-001",
    driver: "Fatima Garba",
    driverId: "DRV-001",
    bus: "BUS-01",
    busId: "BUS-01",
    route: "Island → Lekki",
    status: "en_route",
    pax: 25,
    capacity: 30,
    departure: "08:00",
    arrival: null,
    revenue: 18500,
  },
  {
    id: "TRP-002",
    driver: "Ibrahim Musa",
    driverId: "DRV-002",
    bus: "BUS-02",
    busId: "BUS-02",
    route: "Island → Oshodi",
    status: "en_route",
    pax: 18,
    capacity: 30,
    departure: "08:15",
    arrival: null,
    revenue: 14200,
  },
  {
    id: "TRP-003",
    driver: "Tunde Adeleke",
    driverId: "DRV-004",
    bus: "BUS-04",
    busId: "BUS-04",
    route: "Oshodi → Ikeja",
    status: "boarding",
    pax: 22,
    capacity: 30,
    departure: "09:00",
    arrival: null,
    revenue: 0,
  },
  {
    id: "TRP-004",
    driver: "Aminu Danbaba",
    driverId: "DRV-005",
    bus: "BUS-05",
    busId: "BUS-05",
    route: "Berger → Oshodi",
    status: "boarding",
    pax: 14,
    capacity: 28,
    departure: "09:15",
    arrival: null,
    revenue: 0,
  },
  {
    id: "TRP-005",
    driver: "Bello Usman",
    driverId: "DRV-008",
    bus: "BUS-08",
    busId: "BUS-08",
    route: "Lekki → Island",
    status: "en_route",
    pax: 28,
    capacity: 30,
    departure: "08:45",
    arrival: null,
    revenue: 9800,
  },
]

export const reconciliationItems: ReconciliationItem[] = [
  {
    id: "REC-001",
    driver: "Fatima Garba",
    driverId: "DRV-001",
    bus: "BUS-01",
    route: "Island → Lekki",
    date: "2026-05-21",
    expectedRevenue: 42000,
    declaredRevenue: 42000,
    trips: 4,
    status: "match",
    notes: "",
  },
  {
    id: "REC-002",
    driver: "Aminu Danbaba",
    driverId: "DRV-005",
    bus: "BUS-05",
    route: "Berger → Oshodi",
    date: "2026-05-21",
    expectedRevenue: 28000,
    declaredRevenue: 19500,
    trips: 3,
    status: "discrepancy",
    notes: "₦8,500 shortfall. Driver claims passenger count error.",
  },
  {
    id: "REC-003",
    driver: "Ibrahim Musa",
    driverId: "DRV-002",
    bus: "BUS-02",
    route: "Island → Oshodi",
    date: "2026-05-21",
    expectedRevenue: 36000,
    declaredRevenue: 36000,
    trips: 3,
    status: "match",
    notes: "",
  },
  {
    id: "REC-004",
    driver: "Tunde Adeleke",
    driverId: "DRV-004",
    bus: "BUS-04",
    route: "Oshodi → Ikeja",
    date: "2026-05-21",
    expectedRevenue: 31500,
    declaredRevenue: 29000,
    trips: 3,
    status: "discrepancy",
    notes: "₦2,500 shortfall. Under investigation.",
  },
  {
    id: "REC-005",
    driver: "Bello Usman",
    driverId: "DRV-008",
    bus: "BUS-08",
    route: "Lekki → Island",
    date: "2026-05-21",
    expectedRevenue: 22000,
    declaredRevenue: 22000,
    trips: 2,
    status: "match",
    notes: "",
  },
]

export const leaveRequests: LeaveRequest[] = [
  {
    id: "LVE-001",
    driver: "Ngozi Okonkwo",
    driverId: "DRV-007",
    type: "annual",
    startDate: "2026-05-23",
    endDate: "2026-05-30",
    days: 7,
    reason: "Family commitment — travelling to Enugu for asonye ceremony.",
    status: "pending",
    submittedAt: "2026-05-20T14:30:00",
    dutiesAffected: 7,
  },
  {
    id: "LVE-002",
    driver: "Ibrahim Musa",
    driverId: "DRV-002",
    type: "sick",
    startDate: "2026-05-22",
    endDate: "2026-05-23",
    days: 2,
    reason: "Malaria treatment, doctor's note attached.",
    status: "pending",
    submittedAt: "2026-05-22T06:00:00",
    dutiesAffected: 2,
  },
  {
    id: "LVE-003",
    driver: "Fatima Garba",
    driverId: "DRV-001",
    type: "emergency",
    startDate: "2026-05-10",
    endDate: "2026-05-12",
    days: 3,
    reason: "Death of father.",
    status: "approved",
    submittedAt: "2026-05-09T18:45:00",
    dutiesAffected: 3,
  },
  {
    id: "LVE-004",
    driver: "Bello Usman",
    driverId: "DRV-008",
    type: "annual",
    startDate: "2026-04-15",
    endDate: "2026-04-17",
    days: 3,
    reason: "Annual leave.",
    status: "declined",
    submittedAt: "2026-04-10T10:00:00",
    dutiesAffected: 3,
    declineReason: "Insufficient coverage during the period.",
  },
]

export const dispatchPlans: DispatchPlan[] = [
  {
    id: "DIS-001",
    route: "Island → Lekki",
    driver: "Fatima Garba",
    driverId: "DRV-001",
    bus: "BUS-01",
    busId: "BUS-01",
    status: "active",
    departure: "08:00",
    trips: 4,
    pax: 25,
  },
  {
    id: "DIS-002",
    route: "Island → Oshodi",
    driver: "Ibrahim Musa",
    driverId: "DRV-002",
    bus: "BUS-02",
    busId: "BUS-02",
    status: "active",
    departure: "08:15",
    trips: 3,
    pax: 18,
  },
  {
    id: "DIS-003",
    route: "Oshodi → Ikeja",
    driver: "Tunde Adeleke",
    driverId: "DRV-004",
    bus: "BUS-04",
    busId: "BUS-04",
    status: "active",
    departure: "09:00",
    trips: 3,
    pax: 22,
  },
  {
    id: "DIS-004",
    route: "Berger → Oshodi",
    driver: "Aminu Danbaba",
    driverId: "DRV-005",
    bus: "BUS-05",
    busId: "BUS-05",
    status: "active",
    departure: "09:15",
    trips: 2,
    pax: 14,
  },
  {
    id: "DIS-005",
    route: "Lekki → Island",
    driver: "Bello Usman",
    driverId: "DRV-008",
    bus: "BUS-08",
    busId: "BUS-08",
    status: "active",
    departure: "08:45",
    trips: 2,
    pax: 28,
  },
  {
    id: "DIS-006",
    route: "Island → Ikeja",
    driver: "— Unassigned —",
    driverId: "",
    bus: "BUS-07",
    busId: "BUS-07",
    status: "pending",
    departure: "10:00",
    trips: 0,
    pax: 0,
  },
]

export const revenueData = [
  { day: "Mon", amount: 480000 },
  { day: "Tue", amount: 520000 },
  { day: "Wed", amount: 498000 },
  { day: "Thu", amount: 545000 },
  { day: "Fri", amount: 612000 },
  { day: "Sat", amount: 590000 },
  { day: "Today", amount: 289000 },
]

export const notifications: Notification[] = [
  {
    id: "NOT-001",
    type: "alert",
    title: "Critical: Bus Breakdown",
    message: "BUS-03 engine failure on Third Mainland Bridge.",
    read: false,
    timestamp: "2026-05-22T08:15:00",
    link: "/alerts",
  },
  {
    id: "NOT-002",
    type: "dispatch",
    title: "Driver No-Show",
    message: "KJA-007 Ngozi Okonkwo has not reported for duty.",
    read: false,
    timestamp: "2026-05-22T07:00:00",
    link: "/dispatch",
  },
  {
    id: "NOT-003",
    type: "leave",
    title: "Leave Request",
    message: "Ngozi Okonkwo requests 7-day annual leave from May 23.",
    read: false,
    timestamp: "2026-05-20T14:30:00",
    link: "/leave",
  },
  {
    id: "NOT-004",
    type: "reconciliation",
    title: "Cash Discrepancy",
    message: "Aminu Danbaba declared ₦8,500 less than expected.",
    read: true,
    timestamp: "2026-05-21T22:00:00",
    link: "/reconciliation",
  },
  {
    id: "NOT-005",
    type: "alert",
    title: "Document Expiry",
    message: "BUS-02 insurance expired on 30 Nov 2025.",
    read: true,
    timestamp: "2026-05-22T00:01:00",
    link: "/fleet",
  },
  {
    id: "NOT-006",
    type: "system",
    title: "Leave Request",
    message: "Ibrahim Musa requests 2-day sick leave from today.",
    read: false,
    timestamp: "2026-05-22T06:00:00",
    link: "/leave",
  },
]

export const teamMembers: TeamMember[] = [
  {
    id: "USR-001",
    name: "Fleet Manager",
    email: "manager@koja.ng",
    role: "fleet_manager",
    status: "active",
    lastLogin: "2026-05-22T08:00:00",
    depot: "All Depots",
  },
  {
    id: "USR-002",
    name: "Dispatch Officer",
    email: "dispatch@koja.ng",
    role: "dispatcher",
    status: "active",
    lastLogin: "2026-05-22T07:30:00",
    depot: "Lagos Island",
  },
  {
    id: "USR-003",
    name: "Finance Officer",
    email: "finance@koja.ng",
    role: "finance",
    status: "active",
    lastLogin: "2026-05-21T17:00:00",
    depot: "All Depots",
  },
  {
    id: "USR-004",
    name: "Scheduler",
    email: "scheduler@koja.ng",
    role: "scheduler",
    status: "active",
    lastLogin: "2026-05-22T06:45:00",
    depot: "All Depots",
  },
]
