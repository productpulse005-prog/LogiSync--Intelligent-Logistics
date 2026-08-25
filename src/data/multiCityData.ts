import {
  SocietyProfile,
  LogisticsConstraint,
  Order,
  Vehicle,
  Driver,
  Technician,
  LearningRecord,
  OperationsKpis,
  ExperimentMetrics,
  LocalityType,
  ProductItem,
} from '../types';

export type CityId = 'PUNE' | 'BANGALORE' | 'DELHI_NCR' | 'MUMBAI' | 'HYDERABAD';

export interface CityConfig {
  id: CityId;
  name: string;
  shortName: string;
  state: string;
  center: { lat: number; lng: number; zoom: number };
  zones: { name: string; lat: number; lng: number; zoom: number }[];
  localities: string[];
  description: string;
  warehouses: { id: string; name: string; address: string; lat: number; lng: number }[];
}

export const SUPPORTED_CITIES: Record<CityId, CityConfig> = {
  PUNE: {
    id: 'PUNE',
    name: 'Pune',
    shortName: 'Pune',
    state: 'Maharashtra',
    center: { lat: 18.591, lng: 73.742, zoom: 13 },
    zones: [
      { name: 'All Pune West', lat: 18.591, lng: 73.742, zoom: 13 },
      { name: 'Hinjewadi IT Park', lat: 18.588, lng: 73.705, zoom: 14 },
      { name: 'Wakad & Flyover', lat: 18.598, lng: 73.765, zoom: 14 },
      { name: 'Baner High Street', lat: 18.568, lng: 73.778, zoom: 14 },
      { name: 'Balewadi Stadium', lat: 18.579, lng: 73.769, zoom: 14 },
      { name: 'Mahalunge Bypass', lat: 18.574, lng: 73.751, zoom: 14 },
    ],
    localities: ['Hinjewadi', 'Wakad', 'Baner', 'Balewadi', 'Mahalunge', 'Aundh', 'Pashan'],
    description: 'Tech corridor hub with IT parks, flyover excavations, gated townships, and Mathadi union pockets.',
    warehouses: [
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
    ],
  },
  BANGALORE: {
    id: 'BANGALORE',
    name: 'Bengaluru (Bangalore)',
    shortName: 'Bengaluru',
    state: 'Karnataka',
    center: { lat: 12.935, lng: 77.685, zoom: 12 },
    zones: [
      { name: 'All Bangalore Hubs', lat: 12.935, lng: 77.685, zoom: 12 },
      { name: 'Whitefield & ITPL', lat: 12.978, lng: 77.745, zoom: 14 },
      { name: 'Bellandur & ORR', lat: 12.929, lng: 77.678, zoom: 14 },
      { name: 'HSR Layout & Silk Board', lat: 12.912, lng: 77.645, zoom: 14 },
      { name: 'Koramangala & Indiranagar', lat: 12.935, lng: 77.625, zoom: 14 },
      { name: 'Electronic City Ph 1', lat: 12.845, lng: 77.665, zoom: 14 },
      { name: 'Sarjapur Road', lat: 12.898, lng: 77.712, zoom: 14 },
    ],
    localities: ['Whitefield', 'Bellandur', 'HSR Layout', 'Koramangala', 'Indiranagar', 'Electronic City', 'Sarjapur Road', 'Marathahalli'],
    description: 'Silicon Valley corridor with Outer Ring Road choke points, high-rise security protocols, and water tanker density.',
    warehouses: [
      {
        id: 'WH-BLR-01',
        name: 'RentoMojo South Hub - Electronic City',
        address: 'Near Tech Mahindra Gate, Electronic City Ph 1, Bangalore 560100',
        lat: 12.8415,
        lng: 77.6621,
      },
      {
        id: 'WH-BLR-02',
        name: 'RentoMojo East Central Hub - Hoodi/Whitefield',
        address: 'Sadaramangala Industrial Area, Whitefield, Bangalore 560066',
        lat: 12.9892,
        lng: 77.7324,
      },
      {
        id: 'WH-BLR-03',
        name: 'RentoMojo Outer Ring Hub - Bellandur',
        address: 'Near EcoSpace Business Park, Bellandur, Bangalore 560103',
        lat: 12.9245,
        lng: 77.6812,
      },
    ],
  },
  DELHI_NCR: {
    id: 'DELHI_NCR',
    name: 'Delhi NCR (Gurgaon & Noida)',
    shortName: 'Delhi NCR',
    state: 'Delhi / NCR',
    center: { lat: 28.495, lng: 77.105, zoom: 12 },
    zones: [
      { name: 'NCR Metropolitan', lat: 28.495, lng: 77.105, zoom: 12 },
      { name: 'Gurgaon DLF CyberCity', lat: 28.492, lng: 77.089, zoom: 14 },
      { name: 'Golf Course Extension', lat: 28.425, lng: 77.098, zoom: 14 },
      { name: 'Noida Expressway Sec 62-93', lat: 28.542, lng: 77.385, zoom: 14 },
      { name: 'Dwarka Expressway', lat: 28.525, lng: 76.995, zoom: 14 },
      { name: 'South Delhi (GK & Saket)', lat: 28.535, lng: 77.225, zoom: 14 },
    ],
    localities: ['Gurgaon DLF', 'Golf Course Ext', 'Noida Sec 62', 'Noida Sec 93', 'Dwarka', 'South Delhi', 'Indirapuram'],
    description: 'National Capital Region with GRAP commercial vehicle entry windows, strict high-rise service lift permits, and expressway diversions.',
    warehouses: [
      {
        id: 'WH-DEL-01',
        name: 'RentoMojo Gurgaon Mega Hub - Udyog Vihar',
        address: 'Phase 5, Udyog Vihar, Gurgaon 122016',
        lat: 28.5012,
        lng: 77.0854,
      },
      {
        id: 'WH-DEL-02',
        name: 'RentoMojo Noida Logistics Hub - Sec 80',
        address: 'Phase 2, Noida Hosiery Complex, Noida 201305',
        lat: 28.5284,
        lng: 77.4012,
      },
      {
        id: 'WH-DEL-03',
        name: 'RentoMojo Okhla Central Hub - New Delhi',
        address: 'Okhla Industrial Area Phase 2, New Delhi 110020',
        lat: 28.5298,
        lng: 77.2715,
      },
    ],
  },
  MUMBAI: {
    id: 'MUMBAI',
    name: 'Mumbai (MMR)',
    shortName: 'Mumbai',
    state: 'Maharashtra',
    center: { lat: 19.115, lng: 72.895, zoom: 12 },
    zones: [
      { name: 'MMR Corridor', lat: 19.115, lng: 72.895, zoom: 12 },
      { name: 'Powai Hiranandani', lat: 19.122, lng: 72.912, zoom: 14 },
      { name: 'Bandra & BKC', lat: 19.062, lng: 72.865, zoom: 14 },
      { name: 'Andheri East & JVLR', lat: 19.118, lng: 72.868, zoom: 14 },
      { name: 'Thane Ghodbunder', lat: 19.245, lng: 72.975, zoom: 14 },
      { name: 'Navi Mumbai Palm Beach', lat: 19.035, lng: 73.018, zoom: 14 },
    ],
    localities: ['Powai', 'Bandra BKC', 'Andheri East', 'Thane West', 'Navi Mumbai', 'Worli Lower Parel'],
    description: 'Coastal metropolitan hub with Mathadi Board heavy unload charges, JVLR metro work, and monsoon road waterlogging.',
    warehouses: [
      {
        id: 'WH-BOM-01',
        name: 'RentoMojo Bhiwandi Mega Warehouse Hub',
        address: 'Mankoli Naka, Bhiwandi-Kalyan Rd, Thane 421302',
        lat: 19.2785,
        lng: 73.0482,
      },
      {
        id: 'WH-BOM-02',
        name: 'RentoMojo Kurla/BKC Central Distribution',
        address: 'LBS Marg, Kurla West, Mumbai 400070',
        lat: 19.0712,
        lng: 72.8821,
      },
      {
        id: 'WH-BOM-03',
        name: 'RentoMojo Navi Mumbai Hub - Mahape',
        address: 'MIDC Industrial Area, Mahape, Navi Mumbai 400710',
        lat: 19.1025,
        lng: 73.0145,
      },
    ],
  },
  HYDERABAD: {
    id: 'HYDERABAD',
    name: 'Hyderabad (Cyberabad)',
    shortName: 'Hyderabad',
    state: 'Telangana',
    center: { lat: 17.435, lng: 78.365, zoom: 12 },
    zones: [
      { name: 'All Cyberabad', lat: 17.435, lng: 78.365, zoom: 12 },
      { name: 'Gachibowli Financial Dist', lat: 17.422, lng: 78.345, zoom: 14 },
      { name: 'Hitec City & Mindspace', lat: 17.448, lng: 78.381, zoom: 14 },
      { name: 'Madhapur & Durgam Cheruvu', lat: 17.438, lng: 78.392, zoom: 14 },
      { name: 'Kondapur & Botanical Garden', lat: 17.458, lng: 78.358, zoom: 14 },
      { name: 'Kukatpally & Miyapur', lat: 17.495, lng: 78.398, zoom: 14 },
    ],
    localities: ['Gachibowli', 'Hitec City', 'Madhapur', 'Kondapur', 'Financial District', 'Kukatpally'],
    description: 'Fastest growing tech zone with massive high-rise communities, flyover expansions, and tight basement clearance rules.',
    warehouses: [
      {
        id: 'WH-HYD-01',
        name: 'RentoMojo Gachibowli Hub - Nanakramguda',
        address: 'Near WaveRock SEZ, Financial District, Hyderabad 500032',
        lat: 17.4185,
        lng: 78.3412,
      },
      {
        id: 'WH-HYD-02',
        name: 'RentoMojo Kukatpally Distribution Center',
        address: 'Prashanthi Nagar, Kukatpally, Hyderabad 500072',
        lat: 17.4892,
        lng: 78.4124,
      },
    ],
  },
};

// Find closest city given latitude and longitude using Haversine
export function detectClosestCity(lat: number, lng: number): CityId {
  const cityCoords: Record<CityId, { lat: number; lng: number }> = {
    PUNE: { lat: 18.5204, lng: 73.8567 },
    BANGALORE: { lat: 12.9716, lng: 77.5946 },
    DELHI_NCR: { lat: 28.6139, lng: 77.2090 },
    MUMBAI: { lat: 19.0760, lng: 72.8777 },
    HYDERABAD: { lat: 17.3850, lng: 78.4867 },
  };

  let closestCity: CityId = 'PUNE';
  let minDistance = Infinity;

  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  for (const [cId, coords] of Object.entries(cityCoords)) {
    const dLat = toRad(coords.lat - lat);
    const dLon = toRad(coords.lng - lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat)) * Math.cos(toRad(coords.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;

    if (dist < minDistance) {
      minDistance = dist;
      closestCity = cId as CityId;
    }
  }

  return closestCity;
}
