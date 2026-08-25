export type LocalityType = string;

export type ConstraintType =
  | 'ROAD_BLOCKAGE'
  | 'EXCAVATION'
  | 'TRAFFIC_RESTRICTION'
  | 'EVENT_RESTRICTION'
  | 'VEHICLE_RESTRICTION'
  | 'TOLL'
  | 'MATHADI'
  | 'SOCIETY_FEE'
  | 'PARKING'
  | 'BUILDING_ACCESS'
  | 'LOADING_DELAY'
  | 'WEATHER'
  | 'OTHER';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type DeliveryConfidenceTier = 'HIGH_CONFIDENCE' | 'MODERATE_CONFIDENCE' | 'AT_RISK';
export type InterventionStrategy = 'PREDICT' | 'PREVENT' | 'MITIGATE' | 'INFORM' | 'ACCEPT';

export interface SocietyProfile {
  id: string;
  name: string;
  locality: LocalityType;
  address: string;
  lat: number;
  lng: number;
  truckAllowed: boolean;
  maxVehicleSize: 'TATA_ACE' | 'EICHER_14FT' | 'EICHER_17FT' | 'TWO_WHEELER' | 'ANY';
  deliveryWindow: string; // e.g. "09:00 AM - 06:00 PM"
  pickupWindow: string;
  parkingAvailability: 'DEDICATED_BAY' | 'STREET_ONLY' | 'TIGHT_BASEMENT' | 'NO_PARKING';
  loadingBayAvailability: boolean;
  serviceLiftAvailability: boolean;
  liftRestrictions: string;
  securityApprovalRequired: boolean;
  societyFee: number;
  mathadiProbability: number; // 0-100 %
  typicalMathadiCharge: number;
  typicalUnloadingMinutes: number;
  historicalAverageDelayMinutes: number;
  confidenceScore: number;
  totalDeliveriesCompleted: number;
  lastVerifiedDate: string;
  notes: string;
  zone: string;
  gateContact?: string;
  serviceLiftDimensions?: string;
}

export interface LogisticsConstraint {
  id: string;
  type: ConstraintType;
  title: string;
  locality: LocalityType;
  lat: number;
  lng: number;
  radiusMeters: number;
  severity: SeverityLevel;
  source: 'DRIVER_REPORT' | 'POLICE_ADVISORY' | 'SOCIETY_ADMIN' | 'OPS_DESK' | 'HISTORICAL_PATTERN' | 'IOT_TELEMATICS';
  confidence: number; // 0-100
  expectedDelayMinutes: number;
  expectedCostInr: number;
  status: 'ACTIVE' | 'RESOLVED' | 'VERIFIED' | 'PENDING_VERIFICATION' | 'REJECTED';
  startTime: string;
  endTime: string;
  notes: string;
  affectedSocieties: string[];
  photoUrl?: string;
  interventionType: InterventionStrategy;
  createdAt: string;
  verifiedAt?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  category: 'FURNITURE' | 'APPLIANCE' | 'FITNESS' | 'ELECTRONICS';
  dimensions: string; // e.g. "84 x 36 x 32 in"
  weightKg: number;
  installationRequired: boolean;
  fragile: boolean;
  packageCount: number;
}

export interface RecommendedAction {
  actionType: 'REROUTE' | 'PRE_BOOK_MATHADI' | 'SHIFT_WINDOW' | 'ASSIGN_HELPERS' | 'ADVANCE_DISPATCH' | 'NONE';
  title: string;
  description: string;
  estimatedSavingsMin: number;
  estimatedSavingsCost: number;
  applied: boolean;
  appliedAt?: string;
}

export interface CustomerNotification {
  headline: string;
  message: string;
  status: 'NORMAL' | 'POTENTIAL_DELAY' | 'ACTION_REQUIRED';
  suggestedSlot?: string;
  slotOptions?: string[];
  updatedAt: string;
}

export interface DeliveryActuals {
  arrivedAt?: string;
  completedAt?: string;
  actualDelayMinutes: number;
  actualCost: number;
  actualMathadi: number;
  actualToll: number;
  actualSocietyFee: number;
  actualUnloadingMinutes: number;
  routeDeviation: boolean;
  deliverySuccess: boolean;
  driverFeedback?: string;
  reportedAt?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  unitNumber: string;
  address: string;
  locality: LocalityType;
  societyId: string;
  societyName: string;
  lat: number;
  lng: number;
  products: ProductItem[];
  warehouseId: string;
  warehouseName: string;
  deliveryDate: string;
  deliveryWindow: string; // e.g. "2 PM – 5 PM"
  deliveryType: 'DELIVERY' | 'PICKUP' | 'REPLACEMENT' | 'RELOCATION';
  assignedVehicleId: string;
  assignedVehicleNumber: string;
  assignedDriverId: string;
  assignedDriverName: string;
  assignedDriverPhone: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  status: 'SCHEDULED' | 'DISPATCHED' | 'OUT_FOR_DELIVERY' | 'AT_LOCATION' | 'DELIVERED' | 'DELAYED' | 'RESCHEDULED';
  
  // Intelligence Layer Outputs
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  driverFlaggedImpact?: SeverityLevel;
  confidenceScore: number; // 0-100 %
  confidenceTier: DeliveryConfidenceTier;
  expectedEta: string; // e.g. "03:45 PM"
  estimatedDelayMinutes: number;
  estimatedAdditionalCost: number;
  riskReasons: string[];
  activeConstraintsCount: number;
  matchedConstraintIds: string[];
  recommendedAction: RecommendedAction;
  customerNotification: CustomerNotification;
  actuals?: DeliveryActuals;
  routeWaypoints?: [number, number][];
  alternateRouteWaypoints?: [number, number][];
}

export interface DriverReport {
  id: string;
  driverId: string;
  driverName: string;
  orderId?: string;
  societyId?: string;
  societyName?: string;
  type: ConstraintType;
  title: string;
  amount?: number;
  estimatedDurationHours?: number;
  impact: SeverityLevel;
  notes: string;
  lat: number;
  lng: number;
  photoUrl?: string;
  timestamp: string;
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  model: string;
  type: 'TATA_ACE' | 'EICHER_14FT' | 'EICHER_17FT' | 'EV_CARGO_VAN';
  capacityKg: number;
  driverId: string;
  currentLat: number;
  currentLng: number;
  activeOrdersCount: number;
  status: 'IDLE' | 'ON_ROUTE' | 'UNLOADING' | 'MAINTENANCE';
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleId: string;
  rating: number;
  completedDeliveriesToday: number;
  onTimeRate: number;
  currentZone: LocalityType;
  status: 'ACTIVE' | 'BREAK' | 'OFF_DUTY';
}

export interface Technician {
  id: string;
  name: string;
  phone: string;
  specialization: 'FURNITURE_ASSEMBLY' | 'APPLIANCE_INSTALL' | 'GENERAL';
  currentZone: LocalityType;
  assignedOrdersCount: number;
}

export interface LearningRecord {
  id: string;
  orderId: string;
  societyId: string;
  societyName: string;
  completedAt: string;
  predictedDelayMin: number;
  actualDelayMin: number;
  delayVarianceMin: number;
  predictedCostInr: number;
  actualCostInr: number;
  costVarianceInr: number;
  predictedMathadiInr: number;
  actualMathadiInr: number;
  predictedUnloadingMin: number;
  actualUnloadingMin: number;
  primaryDisruptionCause?: string;
  modelAdjustmentMade: string;
}

export interface ExperimentMetrics {
  control: {
    firstAttemptSuccessRate: number; // e.g. 78.4%
    promiseAccuracyRate: number; // e.g. 72.1%
    avgDelayMinutes: number; // e.g. 48 min
    unexpectedLogisticsCostPerOrder: number; // e.g. ₹280
    costPerSuccessfulDelivery: number; // e.g. ₹1,450
    pickupSlaAdherence: number; // e.g. 76%
    customerDeliveryInquiriesRate: number; // e.g. 34.2%
    customerCsatScore: number; // e.g. 3.7 / 5.0
  };
  pilot: {
    firstAttemptSuccessRate: number; // e.g. 93.8%
    promiseAccuracyRate: number; // e.g. 91.5%
    avgDelayMinutes: number; // e.g. 14 min
    unexpectedLogisticsCostPerOrder: number; // e.g. ₹65
    costPerSuccessfulDelivery: number; // e.g. ₹1,120
    pickupSlaAdherence: number; // e.g. 94.2%
    customerDeliveryInquiriesRate: number; // e.g. 11.4%
    customerCsatScore: number; // e.g. 4.6 / 5.0
  };
}

export interface OperationsKpis {
  totalDeliveriesToday: number;
  onTimePercent: number;
  onTimeDeliveryRate?: number;
  totalDelayMinutesAvoided?: number;
  firstAttemptSuccessPercent: number;
  atRiskOrdersCount: number;
  avgDelayMinutes: number;
  unexpectedLogisticsCostTotal: number;
  unexpectedCostPerOrder?: number;
  pickupSlaPercent: number;
  avgDeliveryConfidencePercent: number;
  activeConstraintsCount: number;
  verifiedDriverReportsToday: number;
}
