import {
  SocietyProfile,
  LogisticsConstraint,
  ConstraintType,
  Order,
  Vehicle,
  Driver,
  Technician,
  LearningRecord,
  ExperimentMetrics,
  OperationsKpis,
  LocalityType,
  ProductItem,
} from '../types';

export function getRuntimeTodayDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Warehouses in Pune
export const PUNE_WAREHOUSES = [
  {
    id: 'WH-PUN-01',
    name: 'RentoMojo Hub West - Tathawade/Wakad',
    address: 'Near Bhumkar Chowk, Tathawade, Pune 411033',
    lat: 18.6085,
    lng: 73.7482,
  },
  {
    id: 'WH-PUN-02',
    name: 'RentoMojo Central Hub - Chakan Industrial',
    address: 'Phase 2, Chakan MIDC, Pune 410501',
    lat: 18.7521,
    lng: 73.8192,
  },
  {
    id: 'WH-PUN-03',
    name: 'RentoMojo Express Hub - Baner High Street',
    address: 'Veerbhadra Nagar, Baner, Pune 411045',
    lat: 18.5642,
    lng: 73.7764,
  },
];

// 100 Realistic Pune Societies across Baner, Balewadi, Mahalunge, Hinjewadi, Wakad
export const SEED_SOCIETIES: SocietyProfile[] = [
  {
    id: 'SOC-001',
    name: 'Megapolis Smart Homes - Mystic',
    locality: 'Hinjewadi',
    address: 'Phase 3, Rajiv Gandhi Infotech Park, Hinjewadi, Pune 411057',
    lat: 18.5831,
    lng: 73.6872,
    truckAllowed: true,
    maxVehicleSize: 'EICHER_14FT',
    deliveryWindow: '10:00 AM - 05:30 PM',
    pickupWindow: '10:00 AM - 04:00 PM',
    parkingAvailability: 'DEDICATED_BAY',
    loadingBayAvailability: true,
    serviceLiftAvailability: true,
    liftRestrictions: 'Service lift operational for furniture deliveries.',
    securityApprovalRequired: true,
    societyFee: 0,
    mathadiProbability: 25,
    typicalMathadiCharge: 0,
    typicalUnloadingMinutes: 24,
    historicalAverageDelayMinutes: 8,
    confidenceScore: 96,
    totalDeliveriesCompleted: 342,
    lastVerifiedDate: '24 Aug 2026',
    notes: 'Smooth delivery operations. Building security permits freight access upon driver QR verification.',
    zone: 'Hinjewadi Phase 3',
    gateContact: '+91 98231 44521',
    serviceLiftDimensions: '7.5 ft height x 4.8 ft depth',
  },
  {
    id: 'SOC-002',
    name: 'Blue Ridge Township - Tower 18 & 19',
    locality: 'Hinjewadi',
    address: 'Phase 1, Near Cognizant, Hinjewadi, Pune 411057',
    lat: 18.5985,
    lng: 73.7382,
    truckAllowed: true,
    maxVehicleSize: 'TATA_ACE',
    deliveryWindow: '09:00 AM - 06:00 PM',
    pickupWindow: '10:00 AM - 05:00 PM',
    parkingAvailability: 'TIGHT_BASEMENT',
    loadingBayAvailability: true,
    serviceLiftAvailability: true,
    liftRestrictions: 'Entry strictly from Gate 1. Max truck height 2.8m in podium basement.',
    securityApprovalRequired: true,
    societyFee: 150,
    mathadiProbability: 84,
    typicalMathadiCharge: 300,
    typicalUnloadingMinutes: 32,
    historicalAverageDelayMinutes: 24,
    confidenceScore: 92,
    totalDeliveriesCompleted: 489,
    lastVerifiedDate: '23 Aug 2026',
    notes: 'Requires MyGate pre-approval token. Heavy furniture requires floor padding in lift.',
    zone: 'Hinjewadi Phase 1',
    gateContact: '+91 98220 11983',
    serviceLiftDimensions: '8 ft height x 5 ft depth',
  },
  {
    id: 'SOC-003',
    name: 'Kolte Patil Life Republic - Sector R1',
    locality: 'Hinjewadi',
    address: 'Marunji, Near Hinjewadi Phase 1, Pune 411057',
    lat: 18.6184,
    lng: 73.7142,
    truckAllowed: true,
    maxVehicleSize: 'EICHER_14FT',
    deliveryWindow: '09:30 AM - 06:00 PM',
    pickupWindow: '10:00 AM - 05:00 PM',
    parkingAvailability: 'DEDICATED_BAY',
    loadingBayAvailability: true,
    serviceLiftAvailability: true,
    liftRestrictions: 'Service lift operational all day. Trucks larger than 14ft require security escort.',
    securityApprovalRequired: true,
    societyFee: 200,
    mathadiProbability: 78,
    typicalMathadiCharge: 300,
    typicalUnloadingMinutes: 28,
    historicalAverageDelayMinutes: 18,
    confidenceScore: 89,
    totalDeliveriesCompleted: 512,
    lastVerifiedDate: '22 Aug 2026',
    notes: 'Large campus with 4 internal security checkpoints. Allow +12 mins internal travel from Main Arch.',
    zone: 'Marunji/Life Republic',
    gateContact: '+91 97654 32101',
    serviceLiftDimensions: '8 ft height x 5.2 ft depth',
  },
  {
    id: 'SOC-004',
    name: 'Godrej Elements & 24',
    locality: 'Hinjewadi',
    address: 'Near Joyville, Hinjewadi Phase 1, Pune 411057',
    lat: 18.5912,
    lng: 73.7291,
    truckAllowed: true,
    maxVehicleSize: 'TATA_ACE',
    deliveryWindow: '10:00 AM - 05:00 PM',
    pickupWindow: '10:30 AM - 04:30 PM',
    parkingAvailability: 'STREET_ONLY',
    loadingBayAvailability: false,
    serviceLiftAvailability: true,
    liftRestrictions: 'No deliveries on Sunday afternoons. Lift key with supervisor.',
    securityApprovalRequired: true,
    societyFee: 300,
    mathadiProbability: 88,
    typicalMathadiCharge: 400,
    typicalUnloadingMinutes: 35,
    historicalAverageDelayMinutes: 28,
    confidenceScore: 90,
    totalDeliveriesCompleted: 215,
    lastVerifiedDate: '24 Aug 2026',
    notes: 'Narrow approach road during evening peak hours. Park at outer visitor bay.',
    zone: 'Hinjewadi Phase 1',
    gateContact: '+91 98901 88722',
    serviceLiftDimensions: '7 ft height x 4.5 ft depth',
  },
  {
    id: 'SOC-005',
    name: 'VTP Leonara & Bel Air',
    locality: 'Mahalunge',
    address: 'High Street Road, Mahalunge, Pune 411045',
    lat: 18.5724,
    lng: 73.7548,
    truckAllowed: true,
    maxVehicleSize: 'EICHER_14FT',
    deliveryWindow: '09:00 AM - 06:30 PM',
    pickupWindow: '09:30 AM - 05:30 PM',
    parkingAvailability: 'DEDICATED_BAY',
    loadingBayAvailability: true,
    serviceLiftAvailability: true,
    liftRestrictions: 'High-speed service elevator requires maintenance key from facility manager.',
    securityApprovalRequired: true,
    societyFee: 100,
    mathadiProbability: 62,
    typicalMathadiCharge: 250,
    typicalUnloadingMinutes: 26,
    historicalAverageDelayMinutes: 15,
    confidenceScore: 88,
    totalDeliveriesCompleted: 198,
    lastVerifiedDate: '21 Aug 2026',
    notes: 'Mahalunge-Hinjewadi bridge road ongoing water pipe excavation. Keep 15m buffer.',
    zone: 'Mahalunge Smart City',
    gateContact: '+91 98811 23456',
    serviceLiftDimensions: '8.2 ft height x 5.5 ft depth',
  },
  {
    id: 'SOC-006',
    name: 'Rohan Ananta & Tarang',
    locality: 'Wakad',
    address: 'Near Datta Mandir Road, Wakad, Pune 411057',
    lat: 18.6012,
    lng: 73.7681,
    truckAllowed: true,
    maxVehicleSize: 'TATA_ACE',
    deliveryWindow: '09:00 AM - 06:00 PM',
    pickupWindow: '09:30 AM - 05:00 PM',
    parkingAvailability: 'TIGHT_BASEMENT',
    loadingBayAvailability: false,
    serviceLiftAvailability: true,
    liftRestrictions: 'Tight ramp turn. 14ft Eicher trucks cannot enter basement.',
    securityApprovalRequired: true,
    societyFee: 0,
    mathadiProbability: 35,
    typicalMathadiCharge: 200,
    typicalUnloadingMinutes: 22,
    historicalAverageDelayMinutes: 10,
    confidenceScore: 95,
    totalDeliveriesCompleted: 430,
    lastVerifiedDate: '24 Aug 2026',
    notes: 'Smooth delivery operations. Good security cooperation if pre-notified on NobrokerHood.',
    zone: 'Wakad Central',
    gateContact: '+91 97300 44119',
    serviceLiftDimensions: '7.8 ft height x 4.8 ft depth',
  },
  {
    id: 'SOC-007',
    name: 'Kasturi Apostrophe',
    locality: 'Wakad',
    address: 'Kaspate Vasti, Wakad, Pune 411057',
    lat: 18.5948,
    lng: 73.7745,
    truckAllowed: false,
    maxVehicleSize: 'TATA_ACE',
    deliveryWindow: '10:00 AM - 05:00 PM',
    pickupWindow: '10:00 AM - 04:00 PM',
    parkingAvailability: 'STREET_ONLY',
    loadingBayAvailability: false,
    serviceLiftAvailability: true,
    liftRestrictions: 'No heavy trolley wheels on Italian marble lobby. Protective floor mat required.',
    securityApprovalRequired: true,
    societyFee: 200,
    mathadiProbability: 40,
    typicalMathadiCharge: 250,
    typicalUnloadingMinutes: 30,
    historicalAverageDelayMinutes: 19,
    confidenceScore: 91,
    totalDeliveriesCompleted: 184,
    lastVerifiedDate: '20 Aug 2026',
    notes: 'Premium gated community. Strictly enforced quiet hours 1:00 PM to 3:30 PM.',
    zone: 'Wakad Kaspate Vasti',
    gateContact: '+91 94220 89123',
    serviceLiftDimensions: '7.5 ft height x 4.6 ft depth',
  },
  {
    id: 'SOC-008',
    name: 'Puraniks Aldea Espanola',
    locality: 'Baner',
    address: 'Near Pan Card Club Road, Baner, Pune 411045',
    lat: 18.5589,
    lng: 73.7821,
    truckAllowed: true,
    maxVehicleSize: 'EICHER_14FT',
    deliveryWindow: '09:00 AM - 07:00 PM',
    pickupWindow: '09:30 AM - 06:00 PM',
    parkingAvailability: 'DEDICATED_BAY',
    loadingBayAvailability: true,
    serviceLiftAvailability: true,
    liftRestrictions: 'Service lift operational. Security requires physical ID card deposit.',
    securityApprovalRequired: true,
    societyFee: 0,
    mathadiProbability: 25,
    typicalMathadiCharge: 200,
    typicalUnloadingMinutes: 20,
    historicalAverageDelayMinutes: 8,
    confidenceScore: 96,
    totalDeliveriesCompleted: 390,
    lastVerifiedDate: '24 Aug 2026',
    notes: 'Easy parking, wide unloading bays. Very high on-time delivery rate.',
    zone: 'Baner Hills',
    gateContact: '+91 98230 77123',
    serviceLiftDimensions: '8 ft height x 5 ft depth',
  },
  {
    id: 'SOC-009',
    name: 'Balewadi High Street Pride Residences',
    locality: 'Balewadi',
    address: 'Near Balewadi High Street, Balewadi, Pune 411045',
    lat: 18.5752,
    lng: 73.7712,
    truckAllowed: true,
    maxVehicleSize: 'TATA_ACE',
    deliveryWindow: '09:30 AM - 05:30 PM',
    pickupWindow: '10:00 AM - 04:30 PM',
    parkingAvailability: 'TIGHT_BASEMENT',
    loadingBayAvailability: false,
    serviceLiftAvailability: true,
    liftRestrictions: 'Heavy commercial traffic on High Street road between 12 PM - 3 PM.',
    securityApprovalRequired: true,
    societyFee: 150,
    mathadiProbability: 55,
    typicalMathadiCharge: 300,
    typicalUnloadingMinutes: 27,
    historicalAverageDelayMinutes: 16,
    confidenceScore: 93,
    totalDeliveriesCompleted: 276,
    lastVerifiedDate: '22 Aug 2026',
    notes: 'Valet and commercial parking conflicts at entry road.',
    zone: 'Balewadi Central',
    gateContact: '+91 99224 55102',
    serviceLiftDimensions: '7.8 ft height x 4.8 ft depth',
  },
  {
    id: 'SOC-010',
    name: 'Pride Purple Park Connect',
    locality: 'Hinjewadi',
    address: 'Near Bhumkar Chowk, Hinjewadi Phase 1, Pune 411057',
    lat: 18.6021,
    lng: 73.7431,
    truckAllowed: true,
    maxVehicleSize: 'EICHER_14FT',
    deliveryWindow: '09:00 AM - 06:00 PM',
    pickupWindow: '09:00 AM - 05:00 PM',
    parkingAvailability: 'DEDICATED_BAY',
    loadingBayAvailability: true,
    serviceLiftAvailability: true,
    liftRestrictions: 'Service lift reserved for shifting between 11 AM - 1 PM on weekends.',
    securityApprovalRequired: true,
    societyFee: 100,
    mathadiProbability: 70,
    typicalMathadiCharge: 250,
    typicalUnloadingMinutes: 25,
    historicalAverageDelayMinutes: 14,
    confidenceScore: 91,
    totalDeliveriesCompleted: 320,
    lastVerifiedDate: '23 Aug 2026',
    notes: 'Bhumkar Chowk traffic bottle-neck between 4:30 PM - 7:30 PM.',
    zone: 'Hinjewadi Gate / Wakad Border',
    gateContact: '+91 98810 99432',
    serviceLiftDimensions: '8 ft height x 5 ft depth',
  },
];

// Generate the remaining 90 societies programmatically with realistic Pune names and coordinates
const LOCALITY_DISTRIBUTION: { locality: LocalityType; lat: number; lng: number; baseMathadi: number; fee: number }[] = [
  { locality: 'Hinjewadi', lat: 18.592, lng: 73.715, baseMathadi: 82, fee: 250 },
  { locality: 'Wakad', lat: 18.598, lng: 73.765, baseMathadi: 45, fee: 100 },
  { locality: 'Baner', lat: 18.561, lng: 73.784, baseMathadi: 30, fee: 50 },
  { locality: 'Balewadi', lat: 18.577, lng: 73.769, baseMathadi: 50, fee: 120 },
  { locality: 'Mahalunge', lat: 18.574, lng: 73.751, baseMathadi: 65, fee: 180 },
  { locality: 'Aundh', lat: 18.558, lng: 73.805, baseMathadi: 20, fee: 0 },
  { locality: 'Pashan', lat: 18.542, lng: 73.791, baseMathadi: 25, fee: 0 },
];

const SOCIETY_NAME_PREFIXES = [
  'Paranjape Schemes', 'Rohan', 'Kolte Patil', 'Godrej', 'VTP', 'Pride Purple', 'Nyati', 'Kasturi', 'Kumar', 'Gera',
  'Mantra', 'Amanora', 'Kalpataru', 'Runwal', 'Shapoorji Pallonji', 'Panchshil', 'Bhandari', 'Sukhwani', 'Mittals', 'Vilms'
];

const SOCIETY_NAME_SUFFIXES = [
  'Meadows', 'Heights', 'Residency', 'Greens', 'Enclave', 'Park', 'Woods', 'Towers', 'Boulevard', 'Grande',
  'Serenity', 'Imperia', 'Excellence', 'Splendour', 'Avenue', 'Solitaire', 'Oasis', 'Paradise', 'Vistas', 'Bliss'
];

for (let i = 11; i <= 100; i++) {
  const locConfig = LOCALITY_DISTRIBUTION[i % LOCALITY_DISTRIBUTION.length];
  const prefix = SOCIETY_NAME_PREFIXES[i % SOCIETY_NAME_PREFIXES.length];
  const suffix = SOCIETY_NAME_SUFFIXES[(i * 3) % SOCIETY_NAME_SUFFIXES.length];
  const latOffset = (Math.sin(i * 99) * 0.018);
  const lngOffset = (Math.cos(i * 77) * 0.022);
  const mathadiProb = Math.min(95, Math.max(10, Math.round(locConfig.baseMathadi + (Math.sin(i) * 18))));
  const hasLift = i % 14 !== 0; // almost all high-rises have lifts
  const fee = i % 3 === 0 ? locConfig.fee : (i % 5 === 0 ? locConfig.fee + 100 : 0);

  SEED_SOCIETIES.push({
    id: `SOC-${String(i).padStart(3, '0')}`,
    name: `${prefix} ${suffix} - Wing ${String.fromCharCode(65 + (i % 8))}`,
    locality: locConfig.locality,
    address: `Road No. ${1 + (i % 12)}, Sector ${1 + (i % 7)}, ${locConfig.locality}, Pune 411045`,
    lat: Number((locConfig.lat + latOffset).toFixed(5)),
    lng: Number((locConfig.lng + lngOffset).toFixed(5)),
    truckAllowed: i % 7 !== 0,
    maxVehicleSize: i % 4 === 0 ? 'TATA_ACE' : 'EICHER_14FT',
    deliveryWindow: i % 5 === 0 ? '10:00 AM - 05:00 PM' : '09:00 AM - 06:30 PM',
    pickupWindow: '10:00 AM - 05:00 PM',
    parkingAvailability: i % 3 === 0 ? 'DEDICATED_BAY' : (i % 3 === 1 ? 'TIGHT_BASEMENT' : 'STREET_ONLY'),
    loadingBayAvailability: i % 2 === 0,
    serviceLiftAvailability: hasLift,
    liftRestrictions: hasLift ? (i % 4 === 0 ? 'Service lift restricted 1:00 PM - 3:30 PM for housekeeping' : 'Key required from security gate') : 'G+4 floor building, no service lift available. Stair carry required.',
    securityApprovalRequired: true,
    societyFee: fee,
    mathadiProbability: mathadiProb,
    typicalMathadiCharge: mathadiProb > 50 ? 300 + (i % 4) * 50 : 0,
    typicalUnloadingMinutes: hasLift ? 22 + (i % 15) : 38 + (i % 12),
    historicalAverageDelayMinutes: Math.round(5 + (mathadiProb * 0.25) + (fee > 0 ? 8 : 0)),
    confidenceScore: Math.round(85 + (Math.cos(i) * 10)),
    totalDeliveriesCompleted: 80 + (i * 7),
    lastVerifiedDate: '24 Aug 2026',
    notes: `Standard gated society in ${locConfig.locality}. Verification status up to date.`,
    zone: `${locConfig.locality} Zone ${1 + (i % 3)}`,
    gateContact: `+91 98${(20000000 + i * 1421).toString().slice(0, 8)}`,
    serviceLiftDimensions: '7.8 ft x 4.8 ft',
  });
}

// 50 Seed Logistics Constraints across Pune West Corridor
export const SEED_CONSTRAINTS: LogisticsConstraint[] = [
  {
    id: 'CONST-001',
    type: 'EXCAVATION',
    title: 'Smart City Metro & Stormwater Trenching on Hinjewadi-Wakad Bridge',
    locality: 'Hinjewadi',
    lat: 18.5975,
    lng: 73.7420,
    radiusMeters: 450,
    severity: 'HIGH',
    source: 'DRIVER_REPORT',
    confidence: 95,
    expectedDelayMinutes: 35,
    expectedCostInr: 150,
    status: 'ACTIVE',
    startTime: '2026-08-24T06:00:00Z',
    endTime: '2026-08-28T22:00:00Z',
    notes: 'Single-lane bottleneck on flyover approach from Wakad to Hinjewadi Phase 1. Heavy trucks stalled.',
    affectedSocieties: ['SOC-004', 'SOC-010'],
    interventionType: 'PREDICT',
    createdAt: '2026-08-24T06:30:00Z',
    verifiedAt: '2026-08-24T07:15:00Z',
  },
  {
    id: 'CONST-002',
    type: 'MATHADI',
    title: 'Mathadi Mathadi Union Mandatory Handling Demand at Blue Ridge & Life Republic',
    locality: 'Hinjewadi',
    lat: 18.5860,
    lng: 73.7020,
    radiusMeters: 800,
    severity: 'HIGH',
    source: 'DRIVER_REPORT',
    confidence: 98,
    expectedDelayMinutes: 25,
    expectedCostInr: 350,
    status: 'ACTIVE',
    startTime: '2026-08-24T08:00:00Z',
    endTime: '2026-08-24T20:00:00Z',
    notes: 'Local union reps demanding ₹350 per heavy furniture piece for unloading. Pre-booked union vouchers accepted.',
    affectedSocieties: ['SOC-002', 'SOC-003'],
    interventionType: 'PREVENT',
    createdAt: '2026-08-24T08:15:00Z',
    verifiedAt: '2026-08-24T08:45:00Z',
  },
  {
    id: 'CONST-003',
    type: 'ROAD_BLOCKAGE',
    title: 'Culvert Repair & Waterlogging Near Mahalunge Stadium Road',
    locality: 'Mahalunge',
    lat: 18.5710,
    lng: 73.7535,
    radiusMeters: 300,
    severity: 'HIGH',
    source: 'POLICE_ADVISORY',
    confidence: 90,
    expectedDelayMinutes: 20,
    expectedCostInr: 80,
    status: 'ACTIVE',
    startTime: '2026-08-24T07:00:00Z',
    endTime: '2026-08-25T18:00:00Z',
    notes: 'Road partially blocked. Diverting small trucks through Balewadi High Street backlink.',
    affectedSocieties: ['SOC-005'],
    interventionType: 'MITIGATE',
    createdAt: '2026-08-24T07:30:00Z',
  },
  {
    id: 'CONST-004',
    type: 'SOCIETY_FEE',
    title: 'Mandatory Non-Refundable Society Moving Gate Pass Charge',
    locality: 'Hinjewadi',
    lat: 18.5912,
    lng: 73.7291,
    radiusMeters: 100,
    severity: 'MEDIUM',
    source: 'SOCIETY_ADMIN',
    confidence: 99,
    expectedDelayMinutes: 15,
    expectedCostInr: 250,
    status: 'ACTIVE',
    startTime: '2026-08-01T00:00:00Z',
    endTime: '2026-12-31T23:59:59Z',
    notes: 'Society management charges ₹250 for vendor delivery vehicle gate pass. Digital UPI accepted at gate.',
    affectedSocieties: ['SOC-004'],
    interventionType: 'ACCEPT',
    createdAt: '2026-08-01T09:00:00Z',
  },
  {
    id: 'CONST-005',
    type: 'BUILDING_ACCESS',
    title: 'Service Lift Annual Rope Maintenance (No Heavy Items 1:30 PM - 3:30 PM)',
    locality: 'Hinjewadi',
    lat: 18.5912,
    lng: 73.7291,
    radiusMeters: 50,
    severity: 'HIGH',
    source: 'SOCIETY_ADMIN',
    confidence: 96,
    expectedDelayMinutes: 45,
    expectedCostInr: 0,
    status: 'ACTIVE',
    startTime: '2026-08-24T13:30:00Z',
    endTime: '2026-08-24T15:30:00Z',
    notes: 'Elevator vendor servicing freight lift. Heavy furniture cannot be moved to upper floors (Tower 4-12).',
    affectedSocieties: ['SOC-004'],
    interventionType: 'INFORM',
    createdAt: '2026-08-24T09:00:00Z',
  },
  {
    id: 'CONST-006',
    type: 'TRAFFIC_RESTRICTION',
    title: 'Peak Hour Heavy Vehicle Entry Restriction on Baner Main Road',
    locality: 'Baner',
    lat: 18.5595,
    lng: 73.7850,
    radiusMeters: 1200,
    severity: 'MEDIUM',
    source: 'POLICE_ADVISORY',
    confidence: 100,
    expectedDelayMinutes: 20,
    expectedCostInr: 0,
    status: 'ACTIVE',
    startTime: '2026-08-24T17:00:00Z',
    endTime: '2026-08-24T20:30:00Z',
    notes: 'Traffic police enforcing no commercial vehicles >3.5 tonnes between 5 PM and 8:30 PM on Baner Rd.',
    affectedSocieties: ['SOC-008'],
    interventionType: 'PREDICT',
    createdAt: '2026-08-24T06:00:00Z',
  },
  {
    id: 'CONST-007',
    type: 'PARKING',
    title: 'Kaspate Vasti Drainage Work - Street Delivery Truck Parking Blocked',
    locality: 'Wakad',
    lat: 18.5945,
    lng: 73.7735,
    radiusMeters: 250,
    severity: 'MEDIUM',
    source: 'DRIVER_REPORT',
    confidence: 88,
    expectedDelayMinutes: 18,
    expectedCostInr: 0,
    status: 'ACTIVE',
    startTime: '2026-08-24T08:00:00Z',
    endTime: '2026-08-24T18:00:00Z',
    notes: 'Drivers must park 120 meters away and manually trolley furniture to the society gate.',
    affectedSocieties: ['SOC-007'],
    interventionType: 'MITIGATE',
    createdAt: '2026-08-24T08:30:00Z',
  },
  {
    id: 'CONST-008',
    type: 'TOLL',
    title: 'Fastag Lane Calibration Delay at Dehu Road / Express Toll Plaza',
    locality: 'Hinjewadi',
    lat: 18.6250,
    lng: 73.7100,
    radiusMeters: 150,
    severity: 'LOW',
    source: 'IOT_TELEMATICS',
    confidence: 92,
    expectedDelayMinutes: 12,
    expectedCostInr: 80,
    status: 'ACTIVE',
    startTime: '2026-08-24T07:00:00Z',
    endTime: '2026-08-24T19:00:00Z',
    notes: 'Lane 4 & 5 closed for optical sensor maintenance. Expect 10-15m queue.',
    affectedSocieties: ['SOC-003'],
    interventionType: 'ACCEPT',
    createdAt: '2026-08-24T07:00:00Z',
  },
];

// Add more generated seed constraints up to 50
const CONSTRAINT_TYPES: ConstraintType[] = [
  'ROAD_BLOCKAGE', 'EXCAVATION', 'TRAFFIC_RESTRICTION', 'MATHADI', 'SOCIETY_FEE', 'PARKING', 'BUILDING_ACCESS', 'WEATHER', 'LOADING_DELAY'
];

for (let c = 9; c <= 50; c++) {
  const soc = SEED_SOCIETIES[(c * 3) % SEED_SOCIETIES.length];
  const type = CONSTRAINT_TYPES[c % CONSTRAINT_TYPES.length];
  const sev = c % 4 === 0 ? 'HIGH' : (c % 4 === 1 ? 'MEDIUM' : (c % 4 === 2 ? 'LOW' : 'CRITICAL'));
  
  SEED_CONSTRAINTS.push({
    id: `CONST-${String(c).padStart(3, '0')}`,
    type,
    title: `${type.replace(/_/g, ' ')} near ${soc.name.split('-')[0].trim()}`,
    locality: soc.locality,
    lat: Number((soc.lat + (Math.sin(c) * 0.005)).toFixed(5)),
    lng: Number((soc.lng + (Math.cos(c) * 0.005)).toFixed(5)),
    radiusMeters: 100 + (c * 15),
    severity: sev,
    source: c % 3 === 0 ? 'DRIVER_REPORT' : (c % 3 === 1 ? 'HISTORICAL_PATTERN' : 'OPS_DESK'),
    confidence: Math.round(75 + (Math.sin(c) * 20)),
    expectedDelayMinutes: Math.round(10 + (c % 25)),
    expectedCostInr: type === 'MATHADI' ? 300 : (type === 'SOCIETY_FEE' ? 150 : (type === 'TOLL' ? 80 : 0)),
    status: c % 5 === 0 ? 'RESOLVED' : 'ACTIVE',
    startTime: '2026-08-24T06:00:00Z',
    endTime: '2026-08-24T22:00:00Z',
    notes: `Operational micro-constraint logged for ${soc.locality} corridor.`,
    affectedSocieties: [soc.id],
    interventionType: type === 'MATHADI' ? 'PREVENT' : (type === 'EXCAVATION' ? 'MITIGATE' : 'INFORM'),
    createdAt: '2026-08-24T07:00:00Z',
  });
}

// 30 Vehicles
export const SEED_VEHICLES: Vehicle[] = [
  { id: 'VEH-01', vehicleNumber: 'MH-12-RN-4819', model: 'Tata Ace Gold Diesel', type: 'TATA_ACE', capacityKg: 750, driverId: 'DRV-01', currentLat: 18.595, currentLng: 73.745, activeOrdersCount: 4, status: 'ON_ROUTE' },
  { id: 'VEH-02', vehicleNumber: 'MH-12-QZ-9021', model: 'Eicher Pro 2049 14ft', type: 'EICHER_14FT', capacityKg: 2500, driverId: 'DRV-02', currentLat: 18.583, currentLng: 73.690, activeOrdersCount: 6, status: 'UNLOADING' },
  { id: 'VEH-03', vehicleNumber: 'MH-14-GH-3312', model: 'Tata Ace EV Cargo', type: 'EV_CARGO_VAN', capacityKg: 600, driverId: 'DRV-03', currentLat: 18.562, currentLng: 73.780, activeOrdersCount: 3, status: 'ON_ROUTE' },
  { id: 'VEH-04', vehicleNumber: 'MH-12-TK-1188', model: 'Mahindra Bolero Maxi Truck', type: 'TATA_ACE', capacityKg: 1200, driverId: 'DRV-04', currentLat: 18.601, currentLng: 73.766, activeOrdersCount: 5, status: 'ON_ROUTE' },
  { id: 'VEH-05', vehicleNumber: 'MH-12-WX-5501', model: 'Eicher Pro 17ft Heavy', type: 'EICHER_17FT', capacityKg: 4000, driverId: 'DRV-05', currentLat: 18.618, currentLng: 73.715, activeOrdersCount: 7, status: 'ON_ROUTE' },
];

for (let v = 6; v <= 30; v++) {
  SEED_VEHICLES.push({
    id: `VEH-${String(v).padStart(2, '0')}`,
    vehicleNumber: `MH-12-${String.fromCharCode(65 + (v % 20))}${String.fromCharCode(65 + ((v * 2) % 20))}-${1000 + (v * 231)}`,
    model: v % 3 === 0 ? 'Tata Ace EV Cargo' : (v % 3 === 1 ? 'Tata Ace Gold' : 'Eicher Pro 14ft'),
    type: v % 3 === 0 ? 'EV_CARGO_VAN' : (v % 3 === 1 ? 'TATA_ACE' : 'EICHER_14FT'),
    capacityKg: v % 3 === 0 ? 650 : (v % 3 === 1 ? 850 : 2600),
    driverId: `DRV-${String(v).padStart(2, '0')}`,
    currentLat: Number((18.56 + (v * 0.002)).toFixed(4)),
    currentLng: Number((73.70 + (v * 0.003)).toFixed(4)),
    activeOrdersCount: 3 + (v % 5),
    status: v % 6 === 0 ? 'IDLE' : 'ON_ROUTE',
  });
}

// 50 Drivers
export const SEED_DRIVERS: Driver[] = [
  { id: 'DRV-01', name: 'Sachin Shinde', phone: '+91 98221 44019', vehicleId: 'VEH-01', rating: 4.85, completedDeliveriesToday: 3, onTimeRate: 94.2, currentZone: 'Hinjewadi', status: 'ACTIVE' },
  { id: 'DRV-02', name: 'Santosh Kadam', phone: '+91 97631 88902', vehicleId: 'VEH-02', rating: 4.90, completedDeliveriesToday: 4, onTimeRate: 91.0, currentZone: 'Hinjewadi', status: 'ACTIVE' },
  { id: 'DRV-03', name: 'Vikas Gaikwad', phone: '+91 98902 33119', vehicleId: 'VEH-03', rating: 4.78, completedDeliveriesToday: 2, onTimeRate: 96.5, currentZone: 'Baner', status: 'ACTIVE' },
  { id: 'DRV-04', name: 'Ramesh Pawar', phone: '+91 94220 11283', vehicleId: 'VEH-04', rating: 4.82, completedDeliveriesToday: 5, onTimeRate: 89.4, currentZone: 'Wakad', status: 'ACTIVE' },
  { id: 'DRV-05', name: 'Sunil Jadhav', phone: '+91 98811 77291', vehicleId: 'VEH-05', rating: 4.92, completedDeliveriesToday: 4, onTimeRate: 93.8, currentZone: 'Mahalunge', status: 'ACTIVE' },
];

const DRIVER_NAMES = [
  'Mahesh Patil', 'Ganesh Bhosale', 'Anil Deshmukh', 'Pravin Thorat', 'Rahul Sawant', 'Sanjay Jagtap', 'Amol Chavan',
  'Deepak Mane', 'Nitin Shirole', 'Prashant More', 'Rohit Salunkhe', 'Vijay Ghorpade', 'Kishore Sonawane', 'Ajay Tambe',
  'Yogesh Nalawade', 'Akash Shelar', 'Sagar Bhalerao', 'Dnyaneshwar Shinde', 'Baban Khot', 'Pandurang Naik'
];

for (let d = 6; d <= 50; d++) {
  const name = `${DRIVER_NAMES[d % DRIVER_NAMES.length]} ${d > 25 ? '(Team B)' : ''}`;
  const loc: LocalityType = LOCALITY_DISTRIBUTION[d % LOCALITY_DISTRIBUTION.length].locality;
  SEED_DRIVERS.push({
    id: `DRV-${String(d).padStart(2, '0')}`,
    name,
    phone: `+91 98${(22000000 + d * 3121).toString().slice(0, 8)}`,
    vehicleId: `VEH-${String(((d - 1) % 30) + 1).padStart(2, '0')}`,
    rating: Number((4.6 + (Math.sin(d) * 0.35)).toFixed(2)),
    completedDeliveriesToday: 1 + (d % 6),
    onTimeRate: Number((88 + (Math.cos(d) * 10)).toFixed(1)),
    currentZone: loc,
    status: d % 8 === 0 ? 'BREAK' : 'ACTIVE',
  });
}

// 20 Technicians
export const SEED_TECHNICIANS: Technician[] = [
  { id: 'TECH-01', name: 'Avinash More (Lead Carpenter)', phone: '+91 98224 88123', specialization: 'FURNITURE_ASSEMBLY', currentZone: 'Hinjewadi', assignedOrdersCount: 4 },
  { id: 'TECH-02', name: 'Pramod Kale (Appliance Specialist)', phone: '+91 97652 11983', specialization: 'APPLIANCE_INSTALL', currentZone: 'Wakad', assignedOrdersCount: 3 },
  { id: 'TECH-03', name: 'Tanaji Shinde (Master Tech)', phone: '+91 98901 66219', specialization: 'GENERAL', currentZone: 'Baner', assignedOrdersCount: 5 },
];

for (let t = 4; t <= 20; t++) {
  SEED_TECHNICIANS.push({
    id: `TECH-${String(t).padStart(2, '0')}`,
    name: `Tech Specialist ${t} (${t % 2 === 0 ? 'Assembly' : 'Appliance'})`,
    phone: `+91 97${(30000000 + t * 4512).toString().slice(0, 8)}`,
    specialization: t % 3 === 0 ? 'FURNITURE_ASSEMBLY' : (t % 3 === 1 ? 'APPLIANCE_INSTALL' : 'GENERAL'),
    currentZone: LOCALITY_DISTRIBUTION[t % LOCALITY_DISTRIBUTION.length].locality,
    assignedOrdersCount: 2 + (t % 4),
  });
}

// Catalog of RentoMojo Rental Products
export const PRODUCT_CATALOG: ProductItem[] = [
  { id: 'PRD-01', name: 'Naples 3-Seater Fabric Sofa (Grey)', category: 'FURNITURE', dimensions: '82 x 35 x 33 in', weightKg: 52, installationRequired: true, fragile: false, packageCount: 2 },
  { id: 'PRD-02', name: 'Kiwi Queen Bed with Memory Foam Mattress', category: 'FURNITURE', dimensions: '80 x 62 x 36 in', weightKg: 68, installationRequired: true, fragile: false, packageCount: 4 },
  { id: 'PRD-03', name: 'Haier 240L Frost-Free Double Door Refrigerator', category: 'APPLIANCE', dimensions: '55 x 60 x 145 cm', weightKg: 56, installationRequired: true, fragile: true, packageCount: 1 },
  { id: 'PRD-04', name: 'Samsung 6.5kg Fully Automatic Front Load Washing Machine', category: 'APPLIANCE', dimensions: '60 x 55 x 85 cm', weightKg: 64, installationRequired: true, fragile: true, packageCount: 1 },
  { id: 'PRD-05', name: 'Ergonomic Mesh High-Back Study/Work Chair', category: 'FURNITURE', dimensions: '26 x 26 x 45 in', weightKg: 18, installationRequired: true, fragile: false, packageCount: 1 },
  { id: 'PRD-06', name: 'Solid Wood 4-Seater Dining Table Set', category: 'FURNITURE', dimensions: '48 x 36 x 30 in', weightKg: 46, installationRequired: true, fragile: false, packageCount: 5 },
  { id: 'PRD-07', name: 'Motorized Treadmill with Auto-Incline', category: 'FITNESS', dimensions: '68 x 32 x 52 in', weightKg: 85, installationRequired: true, fragile: true, packageCount: 2 },
  { id: 'PRD-08', name: 'Sony Bravia 55" 4K Ultra HD Smart LED TV', category: 'ELECTRONICS', dimensions: '48.5 x 28.2 x 3.1 in', weightKg: 16, installationRequired: true, fragile: true, packageCount: 1 },
];

// Generate Customer-Facing Neutral Notifications tailored strictly by Risk Level
export function generateCustomerNotification(params: {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidenceTier?: 'HIGH_CONFIDENCE' | 'MODERATE_CONFIDENCE' | 'AT_RISK';
  estimatedDelayMinutes: number;
  expectedEta: string;
  locality?: string;
  societyName?: string;
  customerName?: string;
  isMitigated?: boolean;
  isRescheduled?: boolean;
  deliveryWindow?: string;
}): Order['customerNotification'] {
  const {
    riskLevel,
    confidenceTier,
    estimatedDelayMinutes,
    expectedEta,
    locality = 'your area',
    societyName,
    isMitigated = false,
    isRescheduled = false,
    deliveryWindow,
  } = params;

  if (isRescheduled) {
    return {
      headline: 'Delivery window updated & confirmed',
      message: `Your delivery has been rescheduled to ${deliveryWindow || expectedEta}. Dispatch route and technician assignments have been updated.`,
      status: 'NORMAL',
      suggestedSlot: deliveryWindow,
      updatedAt: new Date().toISOString(),
    };
  }

  if (isMitigated) {
    return {
      headline: 'Access pre-cleared — route optimized',
      message: `Our dynamic routing team has pre-cleared building gate access and engaged an alternate bypass route. Your delivery is confirmed on track for ${expectedEta}.`,
      status: 'NORMAL',
      updatedAt: new Date().toISOString(),
    };
  }

  if (riskLevel === 'CRITICAL') {
    return {
      headline: 'Critical access notice — options available',
      message: `A major ground access bottleneck near ${locality} is causing an estimated +${estimatedDelayMinutes || 45}m delay. Current ETA: ${expectedEta}. Our dispatch team is actively coordinating clearance. We recommend confirming whether you prefer to wait or pick a guaranteed delivery slot tomorrow.`,
      status: 'ACTION_REQUIRED',
      suggestedSlot: 'Tomorrow, 10:00 AM – 01:00 PM',
      slotOptions: [
        'Tomorrow, 10:00 AM – 01:00 PM',
        'Tomorrow, 02:00 PM – 05:00 PM',
        'Tomorrow, 06:00 PM – 09:00 PM',
        'Keep Today (Late Evening 6–8 PM)',
      ],
      updatedAt: new Date().toISOString(),
    };
  }

  if (riskLevel === 'HIGH') {
    return {
      headline: 'Delivery delay intimation — action optional',
      message: `Local corridor clearance or gated community access checks near ${locality} are adding an estimated +${estimatedDelayMinutes || 30}m delay. Calibrated arrival window: ${expectedEta}. You can continue waiting or select a free reschedule slot.`,
      status: 'ACTION_REQUIRED',
      suggestedSlot: 'Tomorrow, 10:00 AM – 01:00 PM',
      slotOptions: [
        'Tomorrow, 10:00 AM – 01:00 PM',
        'Tomorrow, 02:00 PM – 05:00 PM',
        'Keep Today (Late Evening 6–8 PM)',
      ],
      updatedAt: new Date().toISOString(),
    };
  }

  if (riskLevel === 'MEDIUM') {
    return {
      headline: 'Slight transit buffer added',
      message: `We are monitoring minor road traffic variance and society entry verification near ${locality}. We have added a brief +${estimatedDelayMinutes || 15}m buffer to your delivery window. Calibrated ETA: ${expectedEta}.`,
      status: 'POTENTIAL_DELAY',
      updatedAt: new Date().toISOString(),
    };
  }

  // LOW Risk
  return {
    headline: 'High confidence — on track',
    message: `Your delivery team and products are confirmed. Building entry access and route conditions near ${locality} have been verified. Expected arrival: ${expectedEta}.`,
    status: 'NORMAL',
    updatedAt: new Date().toISOString(),
  };
}

// Calculation of Risk & Delivery Confidence using Ground-Truth Logistics Intelligence Model
export function calculateOrderRiskAndConfidence(
  order: Partial<Order>,
  society: SocietyProfile,
  constraints: LogisticsConstraint[]
): {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidenceScore: number;
  confidenceTier: 'HIGH_CONFIDENCE' | 'MODERATE_CONFIDENCE' | 'AT_RISK';
  expectedEta: string;
  estimatedDelayMinutes: number;
  estimatedAdditionalCost: number;
  riskReasons: string[];
  recommendedAction: Order['recommendedAction'];
  customerNotification: Order['customerNotification'];
  matchedConstraintIds: string[];
} {
  let riskScore = 10; // Baseline minimal risk
  const riskReasons: string[] = [];
  let estimatedDelayMinutes = 0;
  let estimatedAdditionalCost = 0;
  const matchedConstraintIds: string[] = [];

  // 1. Mathadi Probability & Cost Evaluation
  if (society.mathadiProbability >= 70) {
    const mathadiWeight = Math.round((society.mathadiProbability / 100) * 28);
    riskScore += mathadiWeight;
    estimatedAdditionalCost += society.typicalMathadiCharge;
    estimatedDelayMinutes += 15;
    riskReasons.push(`High Mathadi demand probability (${society.mathadiProbability}%) at ${society.name.split('-')[0].trim()}`);
  } else if (society.mathadiProbability >= 40) {
    riskScore += 12;
    estimatedAdditionalCost += Math.round(society.typicalMathadiCharge * 0.5);
    riskReasons.push(`Moderate Mathadi presence (${society.mathadiProbability}%)`);
  }

  // 2. Society Entry Fee & Gate Approval
  if (society.societyFee > 0) {
    riskScore += 8;
    estimatedAdditionalCost += society.societyFee;
    estimatedDelayMinutes += 10;
    riskReasons.push(`Mandatory society vendor gate fee (₹${society.societyFee})`);
  }

  // 3. Service Lift & Heavy Carry Constraints
  const hasHeavyItems = (order.products || []).some(p => p.weightKg > 40 || p.dimensions.includes('Queen') || p.dimensions.includes('Sofa'));
  if (!society.serviceLiftAvailability && hasHeavyItems) {
    riskScore += 26;
    estimatedDelayMinutes += 25;
    estimatedAdditionalCost += 200; // manual porterage
    riskReasons.push('No service lift available for heavy furniture carry (Staircase manual carry required)');
  } else if (society.liftRestrictions && society.liftRestrictions.includes('restricted')) {
    riskScore += 15;
    estimatedDelayMinutes += 18;
    riskReasons.push(`Lift timing restriction: ${society.liftRestrictions}`);
  }

  // 4. Vehicle Access & Parking Constraints
  if (!society.truckAllowed && order.assignedVehicleId?.startsWith('VEH-02')) {
    riskScore += 30;
    estimatedDelayMinutes += 30;
    riskReasons.push('Assigned 14ft Eicher truck not permitted inside society premises');
  }

  // 5. Active Geographical Constraints Matching
  for (const c of constraints) {
    if (c.status !== 'ACTIVE') continue;

    // Check if society is affected or within radius
    const isAffected = c.affectedSocieties.includes(society.id) ||
      (Math.abs(c.lat - society.lat) < 0.015 && Math.abs(c.lng - society.lng) < 0.015);

    if (isAffected) {
      matchedConstraintIds.push(c.id);
      const severityBoost = c.severity === 'CRITICAL' ? 35 : (c.severity === 'HIGH' ? 24 : (c.severity === 'MEDIUM' ? 14 : 6));
      riskScore += severityBoost;
      estimatedDelayMinutes += c.expectedDelayMinutes;
      estimatedAdditionalCost += c.expectedCostInr;
      riskReasons.push(`${c.title} (+${c.expectedDelayMinutes}m delay, +₹${c.expectedCostInr})`);
    }
  }

  // Cap risk score
  riskScore = Math.min(99, Math.max(5, riskScore));

  // Determine Risk Level
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (riskScore >= 75) riskLevel = 'CRITICAL';
  else if (riskScore >= 55) riskLevel = 'HIGH';
  else if (riskScore >= 30) riskLevel = 'MEDIUM';

  // If driver has explicitly flagged a ground-truth impact, honor it directly
  if (order.driverFlaggedImpact) {
    riskLevel = order.driverFlaggedImpact;
    if (riskLevel === 'CRITICAL') {
      riskScore = Math.max(85, riskScore);
      estimatedDelayMinutes = Math.max(55, estimatedDelayMinutes);
    } else if (riskLevel === 'HIGH') {
      riskScore = Math.max(65, Math.min(74, riskScore));
      estimatedDelayMinutes = Math.max(35, estimatedDelayMinutes);
    } else if (riskLevel === 'MEDIUM') {
      riskScore = Math.max(35, Math.min(54, riskScore));
      estimatedDelayMinutes = Math.max(15, estimatedDelayMinutes);
    } else {
      // LOW
      riskScore = Math.min(25, riskScore);
      estimatedDelayMinutes = 0;
    }
  }

  // Calculate Delivery Confidence (Inverse of risk, calibrated with society confidence history)
  let rawConfidence = Math.round(100 - (riskScore * 0.85) + ((society.confidenceScore - 90) * 0.3));
  rawConfidence = Math.min(98, Math.max(35, rawConfidence));

  let confidenceTier: 'HIGH_CONFIDENCE' | 'MODERATE_CONFIDENCE' | 'AT_RISK' = 'HIGH_CONFIDENCE';
  if (rawConfidence < 65 || riskScore >= 65 || riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
    confidenceTier = 'AT_RISK';
  } else if (rawConfidence < 85 || riskScore >= 35 || riskLevel === 'MEDIUM') {
    confidenceTier = 'MODERATE_CONFIDENCE';
  }

  // Calculate Expected ETA from baseline slot
  const baseEta = order.deliveryWindow?.includes('2 PM') ? '03:15 PM' : (order.deliveryWindow?.includes('10 AM') ? '11:45 AM' : '05:30 PM');
  let expectedEta = baseEta;
  if (estimatedDelayMinutes > 0) {
    const hours = parseInt(baseEta.split(':')[0], 10);
    const minutes = parseInt(baseEta.split(':')[1].split(' ')[0], 10) + estimatedDelayMinutes;
    const totalMin = hours * 60 + minutes;
    const finalH = Math.floor(totalMin / 60) % 12 || 12;
    const finalM = totalMin % 60;
    expectedEta = `${String(finalH).padStart(2, '0')}:${String(finalM).padStart(2, '0')} PM`;
  }

  // Determine Recommended Action (Ground-Truth Intervention)
  let recommendedAction: Order['recommendedAction'] = {
    actionType: 'NONE',
    title: 'Standard Dispatch Route',
    description: 'No special intervention required. Delivery conditions are clear.',
    estimatedSavingsMin: 0,
    estimatedSavingsCost: 0,
    applied: false,
  };

  if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
    if (society.mathadiProbability >= 70 && matchedConstraintIds.length > 0) {
      recommendedAction = {
        actionType: 'REROUTE',
        title: 'Alternate Bypass + Pre-book Mathadi Voucher',
        description: 'Take Mahalunge Ring Bypass to avoid Wakad flyover jam, and pre-authorize digital Mathadi gate slip before 11:30 AM.',
        estimatedSavingsMin: Math.round(estimatedDelayMinutes * 0.65),
        estimatedSavingsCost: 150,
        applied: false,
      };
    } else if (matchedConstraintIds.length > 0) {
      recommendedAction = {
        actionType: 'REROUTE',
        title: 'Dynamic Reroute via Hinjewadi Phase 2 Arterial Link',
        description: 'Bypass active excavation sector via arterial connector road.',
        estimatedSavingsMin: Math.round(estimatedDelayMinutes * 0.7),
        estimatedSavingsCost: 50,
        applied: false,
      };
    } else if (society.mathadiProbability >= 75) {
      recommendedAction = {
        actionType: 'PRE_BOOK_MATHADI',
        title: 'Pre-arrange Mathadi Union Slip with Society Office',
        description: 'Pre-issue authorized unloading voucher to eliminate 30m gate dispute.',
        estimatedSavingsMin: 22,
        estimatedSavingsCost: 100,
        applied: false,
      };
    } else {
      recommendedAction = {
        actionType: 'ADVANCE_DISPATCH',
        title: 'Advance Dispatch by 45 Minutes',
        description: 'Dispatch truck before 11:00 AM to beat afternoon society service-lift closure.',
        estimatedSavingsMin: 35,
        estimatedSavingsCost: 0,
        applied: false,
      };
    }
  } else if (riskLevel === 'MEDIUM') {
    recommendedAction = {
      actionType: 'ADVANCE_DISPATCH',
      title: 'Advance Dispatch Buffer',
      description: 'Allocate +15 min buffer for society gate pass verification.',
      estimatedSavingsMin: 12,
      estimatedSavingsCost: 0,
      applied: false,
    };
  }

  const isMitigated = order.recommendedAction?.applied || false;
  const isRescheduled = order.status === 'RESCHEDULED';

  const customerNotification = generateCustomerNotification({
    riskLevel,
    confidenceTier,
    estimatedDelayMinutes,
    expectedEta,
    locality: society.locality,
    societyName: society.name,
    customerName: order.customerName,
    isMitigated,
    isRescheduled,
    deliveryWindow: order.deliveryWindow,
  });

  return {
    riskScore,
    riskLevel,
    confidenceScore: rawConfidence,
    confidenceTier,
    expectedEta,
    estimatedDelayMinutes,
    estimatedAdditionalCost,
    riskReasons,
    recommendedAction,
    customerNotification,
    matchedConstraintIds,
  };
}

// Generate 1,000+ Orders across Pune West Corridor
export function generateSeedOrders(): Order[] {
  const orders: Order[] = [];
  const CUSTOMER_FIRST_NAMES = [
    'Aditi', 'Rohan', 'Priya', 'Amit', 'Neha', 'Siddharth', 'Ananya', 'Varun', 'Deepika', 'Kunal',
    'Sneha', 'Tanmay', 'Pooja', 'Gaurav', 'Meera', 'Abhishek', 'Shruti', 'Nikhil', 'Kavita', 'Arjun',
    'Ritu', 'Manish', 'Divya', 'Saurabh', 'Aishwarya', 'Vivek', 'Pallavi', 'Karthik', 'Swati', 'Harsh'
  ];
  const CUSTOMER_LAST_NAMES = [
    'Sharma', 'Kulkarni', 'Patil', 'Joshi', 'Deshmukh', 'Verma', 'Gupta', 'Iyer', 'Nair', 'Chopra',
    'Mehta', 'Reddy', 'Shinde', 'Agarwal', 'Pawar', 'Bhat', 'Rao', 'Shah', 'Malhotra', 'Bose'
  ];

  // Specific Golden Showcase Order (Order RM-82931) for the main Demo Scenario
  const showcaseSociety = SEED_SOCIETIES[0]; // Megapolis Smart Homes Hinjewadi
  const initialShowcaseEval = calculateOrderRiskAndConfidence(
    { products: [PRODUCT_CATALOG[0], PRODUCT_CATALOG[4]], deliveryWindow: '2 PM – 5 PM' },
    showcaseSociety,
    SEED_CONSTRAINTS
  );

  orders.push({
    id: 'RM-82931',
    customerName: 'Aditi Sharma',
    customerPhone: '+91 98201 55432',
    customerEmail: 'aditi.sharma@example.com',
    unitNumber: 'Tower Mystic, Apt 1404',
    address: 'Megapolis Smart Homes Mystic, Hinjewadi Phase 3, Pune 411057',
    locality: 'Hinjewadi',
    societyId: showcaseSociety.id,
    societyName: showcaseSociety.name,
    lat: showcaseSociety.lat,
    lng: showcaseSociety.lng,
    products: [PRODUCT_CATALOG[0], PRODUCT_CATALOG[4]], // Naples 3-Seater Sofa + Ergonomic Chair
    warehouseId: PUNE_WAREHOUSES[0].id,
    warehouseName: PUNE_WAREHOUSES[0].name,
    deliveryDate: getRuntimeTodayDate(),
    deliveryWindow: '2 PM – 5 PM',
    deliveryType: 'DELIVERY',
    assignedVehicleId: 'VEH-02',
    assignedVehicleNumber: 'MH-12-QZ-9021 (Eicher 14ft)',
    assignedDriverId: 'DRV-02',
    assignedDriverName: 'Santosh Kadam',
    assignedDriverPhone: '+91 97631 88902',
    assignedTechnicianId: 'TECH-01',
    assignedTechnicianName: 'Avinash More (Assembly)',
    status: 'OUT_FOR_DELIVERY',
    riskScore: 15,
    riskLevel: 'LOW',
    confidenceScore: 95,
    confidenceTier: 'HIGH_CONFIDENCE',
    expectedEta: '03:15 PM',
    estimatedDelayMinutes: 0,
    estimatedAdditionalCost: 0,
    riskReasons: [],
    activeConstraintsCount: 0,
    matchedConstraintIds: [],
    recommendedAction: {
      actionType: 'NONE',
      title: 'Standard Route on schedule',
      description: 'No severe constraints detected on current transit corridor.',
      estimatedSavingsMin: 0,
      estimatedSavingsCost: 0,
      applied: false,
    },
    customerNotification: {
      headline: 'High confidence — on track',
      message: 'Your delivery team and products are confirmed. Building entry access and route conditions near Hinjewadi have been verified. Expected arrival: 03:15 PM.',
      status: 'NORMAL',
      updatedAt: new Date().toISOString(),
    },
    routeWaypoints: [
      [18.6085, 73.7482], // Tathawade WH
      [18.5975, 73.7420], // Wakad-Hinjewadi Flyover (Disruption point)
      [18.5912, 73.7291], // Hinjewadi Ph 1
      [18.5831, 73.6872], // Megapolis Destination
    ],
    alternateRouteWaypoints: [
      [18.6085, 73.7482], // Tathawade WH
      [18.6184, 73.7142], // Marunji Bypass North
      [18.5831, 73.6872], // Megapolis Destination directly avoiding flyover
    ],
  });

  // Generate 1,020 additional realistic synthetic orders
  const SLOTS = ['10:00 AM - 01:00 PM', '02:00 PM - 05:00 PM', '05:00 PM - 08:00 PM'];
  const TYPES: ('DELIVERY' | 'PICKUP' | 'REPLACEMENT')[] = ['DELIVERY', 'DELIVERY', 'DELIVERY', 'PICKUP', 'REPLACEMENT'];
  const STATUSES: Order['status'][] = ['SCHEDULED', 'OUT_FOR_DELIVERY', 'DISPATCHED', 'AT_LOCATION', 'DELIVERED', 'DELAYED'];

  for (let i = 2; i <= 1020; i++) {
    const orderId = `RM-${82930 + i}`;
    const custFirst = CUSTOMER_FIRST_NAMES[i % CUSTOMER_FIRST_NAMES.length];
    const custLast = CUSTOMER_LAST_NAMES[(i * 3) % CUSTOMER_LAST_NAMES.length];
    const society = SEED_SOCIETIES[i % SEED_SOCIETIES.length];
    const slot = SLOTS[i % SLOTS.length];
    const delType = TYPES[i % TYPES.length];
    const vehicle = SEED_VEHICLES[i % SEED_VEHICLES.length];
    const driver = SEED_DRIVERS[i % SEED_DRIVERS.length];
    const tech = SEED_TECHNICIANS[i % SEED_TECHNICIANS.length];
    const wh = PUNE_WAREHOUSES[i % PUNE_WAREHOUSES.length];

    // Pick 1 to 3 products
    const pCount = 1 + (i % 3);
    const prodList: ProductItem[] = [];
    for (let p = 0; p < pCount; p++) {
      prodList.push(PRODUCT_CATALOG[(i + p * 2) % PRODUCT_CATALOG.length]);
    }

    const calculated = calculateOrderRiskAndConfidence(
      { products: prodList, deliveryWindow: slot, assignedVehicleId: vehicle.id },
      society,
      SEED_CONSTRAINTS
    );

    const status = i < 20 ? 'OUT_FOR_DELIVERY' : (i < 40 ? 'AT_LOCATION' : (i < 100 ? 'SCHEDULED' : (i < 300 ? 'DELIVERED' : STATUSES[i % STATUSES.length])));

    orders.push({
      id: orderId,
      customerName: `${custFirst} ${custLast}`,
      customerPhone: `+91 98${(20000000 + i * 7821).toString().slice(0, 8)}`,
      customerEmail: `${custFirst.toLowerCase()}.${custLast.toLowerCase()}${i % 99}@example.com`,
      unitNumber: `Flat ${100 + (i % 180)}, Wing ${String.fromCharCode(65 + (i % 6))}`,
      address: `${society.name}, ${society.address}`,
      locality: society.locality,
      societyId: society.id,
      societyName: society.name,
      lat: society.lat,
      lng: society.lng,
      products: prodList,
      warehouseId: wh.id,
      warehouseName: wh.name,
      deliveryDate: getRuntimeTodayDate(),
      deliveryWindow: slot,
      deliveryType: delType,
      assignedVehicleId: vehicle.id,
      assignedVehicleNumber: `${vehicle.vehicleNumber} (${vehicle.model})`,
      assignedDriverId: driver.id,
      assignedDriverName: driver.name,
      assignedDriverPhone: driver.phone,
      assignedTechnicianId: tech.id,
      assignedTechnicianName: tech.name,
      status,
      riskScore: calculated.riskScore,
      riskLevel: calculated.riskLevel,
      confidenceScore: calculated.confidenceScore,
      confidenceTier: calculated.confidenceTier,
      expectedEta: calculated.expectedEta,
      estimatedDelayMinutes: calculated.estimatedDelayMinutes,
      estimatedAdditionalCost: calculated.estimatedAdditionalCost,
      riskReasons: calculated.riskReasons,
      activeConstraintsCount: calculated.matchedConstraintIds.length,
      matchedConstraintIds: calculated.matchedConstraintIds,
      recommendedAction: calculated.recommendedAction,
      customerNotification: calculated.customerNotification,
    });
  }

  return orders;
}

// 100+ Historical Delivery Learning Records for Actual vs Predicted Engine
export function generateSeedLearningRecords(): LearningRecord[] {
  const records: LearningRecord[] = [];
  const causes = [
    'Unpredicted Mathadi Demand at Society Gate',
    'Service Lift Breakdown & 6-Floor Stair Carry',
    'Smart City Road Excavation Bottleneck',
    'Unexpected Society Commercial Entry Charge',
    'Visitor Parking Dispute with Security Guard',
    'Customer Rescheduling during Transit',
    'Narrow Approach Road — Vehicle Transshipment Needed'
  ];

  for (let l = 1; l <= 120; l++) {
    const soc = SEED_SOCIETIES[l % SEED_SOCIETIES.length];
    const predDelay = 10 + (l % 20);
    const actualDelay = predDelay + (Math.round(Math.sin(l * 12) * 22));
    const predCost = soc.societyFee + (soc.mathadiProbability > 50 ? 250 : 0);
    const actualCost = predCost + (l % 3 === 0 ? 350 : 0);

    records.push({
      id: `LRN-${String(l).padStart(4, '0')}`,
      orderId: `RM-${80000 + l}`,
      societyId: soc.id,
      societyName: soc.name,
      completedAt: new Date(Date.now() - (l * 3600000 * 5)).toISOString(),
      predictedDelayMin: predDelay,
      actualDelayMin: Math.max(0, actualDelay),
      delayVarianceMin: Math.max(0, actualDelay) - predDelay,
      predictedCostInr: predCost,
      actualCostInr: actualCost,
      costVarianceInr: actualCost - predCost,
      predictedMathadiInr: soc.mathadiProbability > 50 ? 250 : 0,
      actualMathadiInr: actualCost > predCost ? 350 : (soc.mathadiProbability > 50 ? 250 : 0),
      predictedUnloadingMin: soc.typicalUnloadingMinutes,
      actualUnloadingMin: soc.typicalUnloadingMinutes + (l % 4 === 0 ? 18 : -3),
      primaryDisruptionCause: actualCost > predCost || actualDelay > predDelay + 15 ? causes[l % causes.length] : undefined,
      modelAdjustmentMade: actualCost > predCost ? `Auto-adjusted ${soc.name.split('-')[0].trim()} baseline Mathadi probability +8% & added ₹350 contingency` : 'Model weights validated within ±5% tolerance.',
    });
  }

  return records;
}

// Seed A/B Experiment Metrics
export const SEED_EXPERIMENT_METRICS: ExperimentMetrics = {
  control: {
    firstAttemptSuccessRate: 78.4,
    promiseAccuracyRate: 72.1,
    avgDelayMinutes: 46.2,
    unexpectedLogisticsCostPerOrder: 284,
    costPerSuccessfulDelivery: 1420,
    pickupSlaAdherence: 76.5,
    customerDeliveryInquiriesRate: 34.8,
    customerCsatScore: 3.7,
  },
  pilot: {
    firstAttemptSuccessRate: 94.2,
    promiseAccuracyRate: 92.4,
    avgDelayMinutes: 13.8,
    unexpectedLogisticsCostPerOrder: 62,
    costPerSuccessfulDelivery: 1110,
    pickupSlaAdherence: 95.1,
    customerDeliveryInquiriesRate: 9.6,
    customerCsatScore: 4.65,
  },
};
