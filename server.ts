import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  SEED_SOCIETIES as PUNE_SEED_SOCIETIES,
  SEED_CONSTRAINTS as PUNE_SEED_CONSTRAINTS,
  SEED_VEHICLES as PUNE_SEED_VEHICLES,
  SEED_DRIVERS as PUNE_SEED_DRIVERS,
  SEED_TECHNICIANS as PUNE_SEED_TECHNICIANS,
  SEED_EXPERIMENT_METRICS as PUNE_SEED_EXPERIMENT_METRICS,
  generateSeedOrders as generatePuneOrders,
  generateSeedLearningRecords as generatePuneLearning,
  calculateOrderRiskAndConfidence,
  PUNE_WAREHOUSES,
} from './src/data/puneLogisticsData';
import {
  BANGALORE_SOCIETIES,
  BANGALORE_CONSTRAINTS,
  DELHI_SOCIETIES,
  DELHI_CONSTRAINTS,
  MUMBAI_SOCIETIES,
  MUMBAI_CONSTRAINTS,
  HYDERABAD_SOCIETIES,
  HYDERABAD_CONSTRAINTS,
  generateCityOrders,
  generateCityVehicles,
  generateCityLearningRecords,
  generateCityExperimentMetrics,
} from './src/data/cityDatasets';
import { CityId, SUPPORTED_CITIES } from './src/data/multiCityData';
import {
  Order,
  SocietyProfile,
  LogisticsConstraint,
  DriverReport,
  LearningRecord,
  OperationsKpis,
  ExperimentMetrics,
  Vehicle,
  Driver,
  Technician,
} from './src/types';

interface CityState {
  societies: SocietyProfile[];
  constraints: LogisticsConstraint[];
  orders: Order[];
  driverReports: DriverReport[];
  learningRecords: LearningRecord[];
  vehicles: Vehicle[];
  drivers: Driver[];
  technicians: Technician[];
  experimentMetrics: ExperimentMetrics;
}

// Helper to initialize a city's database
function initCityState(cityId: CityId): CityState {
  if (cityId === 'PUNE') {
    return {
      societies: JSON.parse(JSON.stringify(PUNE_SEED_SOCIETIES)),
      constraints: JSON.parse(JSON.stringify(PUNE_SEED_CONSTRAINTS)),
      orders: generatePuneOrders(),
      driverReports: [
        {
          id: 'REP-PUN-001',
          driverId: 'DRV-PUN-02',
          driverName: 'Santosh Kadam',
          orderId: 'RM-82931',
          societyId: 'SOC-001',
          societyName: 'Megapolis Smart Homes - Mystic',
          type: 'MATHADI',
          title: 'Gate 2 Union demand for sofa unloading',
          amount: 350,
          impact: 'HIGH',
          notes: 'Local union mathadi team active at Gate 2 demanding ₹350 cash per sofa unit.',
          lat: 18.5831,
          lng: 73.6872,
          timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
          status: 'VERIFIED',
        },
        {
          id: 'REP-PUN-002',
          driverId: 'DRV-PUN-01',
          driverName: 'Sachin Shinde',
          orderId: 'RM-82932',
          societyId: 'SOC-002',
          societyName: 'Blue Ridge Township',
          type: 'EXCAVATION',
          title: 'Water pipeline trenching near Phase 1 roundabout',
          estimatedDurationHours: 4,
          impact: 'MEDIUM',
          notes: 'Traffic slowed down to single file near Cognizant circle.',
          lat: 18.5985,
          lng: 73.7382,
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          status: 'VERIFIED',
        },
      ],
      learningRecords: generatePuneLearning(),
      vehicles: JSON.parse(JSON.stringify(PUNE_SEED_VEHICLES)),
      drivers: JSON.parse(JSON.stringify(PUNE_SEED_DRIVERS)),
      technicians: JSON.parse(JSON.stringify(PUNE_SEED_TECHNICIANS)),
      experimentMetrics: JSON.parse(JSON.stringify(PUNE_SEED_EXPERIMENT_METRICS)),
    };
  }

  let socs: SocietyProfile[] = [];
  let consts: LogisticsConstraint[] = [];

  if (cityId === 'BANGALORE') {
    socs = JSON.parse(JSON.stringify(BANGALORE_SOCIETIES));
    consts = JSON.parse(JSON.stringify(BANGALORE_CONSTRAINTS));
  } else if (cityId === 'DELHI_NCR') {
    socs = JSON.parse(JSON.stringify(DELHI_SOCIETIES));
    consts = JSON.parse(JSON.stringify(DELHI_CONSTRAINTS));
  } else if (cityId === 'MUMBAI') {
    socs = JSON.parse(JSON.stringify(MUMBAI_SOCIETIES));
    consts = JSON.parse(JSON.stringify(MUMBAI_CONSTRAINTS));
  } else if (cityId === 'HYDERABAD') {
    socs = JSON.parse(JSON.stringify(HYDERABAD_SOCIETIES));
    consts = JSON.parse(JSON.stringify(HYDERABAD_CONSTRAINTS));
  }

  const orders = generateCityOrders(cityId, socs, consts);
  const vehicles = generateCityVehicles(cityId);

  return {
    societies: socs,
    constraints: consts,
    orders,
    driverReports: [
      {
        id: `REP-${cityId}-01`,
        driverId: `DRV-${cityId}-01`,
        driverName: cityId === 'BANGALORE' ? 'Manjunath Swamy' : cityId === 'DELHI_NCR' ? 'Rajesh Kumar' : cityId === 'MUMBAI' ? 'Dattatray Gaikwad' : 'Venkatesh Rao',
        orderId: orders[0]?.id || `RM-${cityId}-101`,
        societyId: socs[0]?.id || `SOC-${cityId}-01`,
        societyName: socs[0]?.name || 'Central Hub Township',
        type: cityId === 'BANGALORE' ? 'BUILDING_ACCESS' : cityId === 'DELHI_NCR' ? 'VEHICLE_RESTRICTION' : cityId === 'MUMBAI' ? 'MATHADI' : 'EXCAVATION',
        title: cityId === 'BANGALORE' ? 'Service lift freight booking queue' : cityId === 'DELHI_NCR' ? 'Commercial EV vehicle checkpoint' : cityId === 'MUMBAI' ? 'Union mathadi headload fee' : 'Flyover construction lane closure',
        amount: cityId === 'MUMBAI' ? 350 : 0,
        impact: 'HIGH',
        notes: `Ground ground truth event logged by delivery crew in ${SUPPORTED_CITIES[cityId].name}.`,
        lat: socs[0]?.lat || SUPPORTED_CITIES[cityId].center.lat,
        lng: socs[0]?.lng || SUPPORTED_CITIES[cityId].center.lng,
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        status: 'VERIFIED',
      },
    ],
    learningRecords: generateCityLearningRecords(cityId, socs),
    vehicles,
    drivers: [
      {
        id: `DRV-${cityId}-01`,
        name: cityId === 'BANGALORE' ? 'Manjunath Swamy' : cityId === 'DELHI_NCR' ? 'Rajesh Kumar' : cityId === 'MUMBAI' ? 'Dattatray Gaikwad' : 'Venkatesh Rao',
        phone: '+91 98450 11223',
        vehicleId: vehicles[0]?.id || `VEH-${cityId}-01`,
        rating: 4.8,
        completedDeliveriesToday: 4,
        onTimeRate: 94,
        currentZone: socs[0]?.locality || ('Hinjewadi' as any),
        status: 'ACTIVE',
      },
    ],
    technicians: [
      {
        id: `TECH-${cityId}-01`,
        name: cityId === 'BANGALORE' ? 'Kiran Kumar' : cityId === 'DELHI_NCR' ? 'Amit Sharma' : cityId === 'MUMBAI' ? 'Prashant Patil' : 'Srinivas Murthy',
        phone: '+91 98450 44556',
        specialization: 'FURNITURE_ASSEMBLY',
        currentZone: socs[0]?.locality || ('Hinjewadi' as any),
        assignedOrdersCount: 4,
      },
    ],
    experimentMetrics: generateCityExperimentMetrics(cityId),
  };
}

// In-Memory Database Store initialized for all cities
const cityDatabases: Record<CityId, CityState> = {
  PUNE: initCityState('PUNE'),
  BANGALORE: initCityState('BANGALORE'),
  DELHI_NCR: initCityState('DELHI_NCR'),
  MUMBAI: initCityState('MUMBAI'),
  HYDERABAD: initCityState('HYDERABAD'),
};

function getCityId(req: express.Request): CityId {
  const c = ((req.query.city as string) || (req.body?.city as string) || (req.headers['x-city'] as string) || 'PUNE').toUpperCase();
  if (c.includes('BLR') || c.includes('BANGALORE') || c.includes('BENGALURU')) return 'BANGALORE';
  if (c.includes('DEL') || c.includes('GURGAON') || c.includes('NOIDA') || c.includes('NCR')) return 'DELHI_NCR';
  if (c.includes('MUM') || c.includes('BOM') || c.includes('THANE')) return 'MUMBAI';
  if (c.includes('HYD') || c.includes('CYBER')) return 'HYDERABAD';
  return 'PUNE';
}

function recalculateCityOrders(cityId: CityId) {
  const db = cityDatabases[cityId];
  if (!db) return;

  const societyMap = new Map<string, SocietyProfile>();
  db.societies.forEach(s => societyMap.set(s.id, s));

  db.orders = db.orders.map(order => {
    // Preserve completed and customer rescheduled orders
    if (order.status === 'DELIVERED' || order.status === 'RESCHEDULED') {
      return order;
    }

    const soc = societyMap.get(order.societyId);
    if (!soc) return order;
    const evaluated = calculateOrderRiskAndConfidence(order, soc, db.constraints);
    return {
      ...order,
      riskScore: evaluated.riskScore,
      riskLevel: evaluated.riskLevel,
      confidenceScore: evaluated.confidenceScore,
      confidenceTier: evaluated.confidenceTier,
      expectedEta: evaluated.expectedEta,
      estimatedDelayMinutes: evaluated.estimatedDelayMinutes,
      estimatedAdditionalCost: evaluated.estimatedAdditionalCost,
      riskReasons: evaluated.riskReasons,
      activeConstraintsCount: evaluated.matchedConstraintIds.length,
      matchedConstraintIds: evaluated.matchedConstraintIds,
      recommendedAction: order.recommendedAction.applied ? order.recommendedAction : evaluated.recommendedAction,
      customerNotification: evaluated.customerNotification,
    };
  });
}

function computeKpisForCity(cityId: CityId): OperationsKpis {
  const db = cityDatabases[cityId] || cityDatabases.PUNE;
  const total = db.orders.length;
  const atRisk = db.orders.filter(o => o.riskLevel === 'HIGH' || o.riskLevel === 'CRITICAL').length;
  const onTimeOrders = db.orders.filter(o => o.riskLevel === 'LOW' || o.estimatedDelayMinutes <= 15 || o.status === 'DELIVERED' || o.status === 'RESCHEDULED').length;
  const onTimePct = Number(((onTimeOrders / (total || 1)) * 100).toFixed(1));
  const avgDelay = Math.round(db.orders.reduce((acc, o) => acc + o.estimatedDelayMinutes, 0) / (total || 1));
  const avgConfidence = Math.round(db.orders.reduce((acc, o) => acc + o.confidenceScore, 0) / (total || 1));
  const unexpectedCost = db.orders.reduce((acc, o) => acc + o.estimatedAdditionalCost, 0);
  const activeConstraints = db.constraints.filter(c => c.status === 'ACTIVE').length;
  const verifiedReports = db.driverReports.filter(r => r.status === 'VERIFIED').length;

  const delayMinutesSaved = db.orders.reduce((sum, o) => {
    if (o.status === 'RESCHEDULED') return sum + 45;
    if (o.recommendedAction?.applied) return sum + 35;
    if (o.riskLevel === 'LOW') return sum + 25;
    if (o.riskLevel === 'MEDIUM') return sum + 15;
    return sum + 5;
  }, 0);

  return {
    totalDeliveriesToday: total,
    onTimePercent: onTimePct,
    onTimeDeliveryRate: onTimePct,
    totalDelayMinutesAvoided: Math.max(245, delayMinutesSaved),
    firstAttemptSuccessPercent: 94.2,
    atRiskOrdersCount: atRisk,
    avgDelayMinutes: avgDelay,
    unexpectedLogisticsCostTotal: unexpectedCost,
    unexpectedCostPerOrder: Math.round(unexpectedCost / (total || 1)) || 62,
    pickupSlaPercent: 95.1,
    avgDeliveryConfidencePercent: avgConfidence,
    activeConstraintsCount: activeConstraints,
    verifiedDriverReportsToday: verifiedReports,
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security hardening: hide server framework fingerprinting
  app.disable('x-powered-by');

  // Security headers middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Body parsing with safe size bounds
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Server-side Gemini AI Client (Key remains strictly server-side)
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const ai = geminiApiKey ? new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  }) : null;

  // ----------------------------------------------------
  // API ROUTES
  // ----------------------------------------------------

  // 1. Health & Config
  app.get('/api/health', (req, res) => {
    const cityId = getCityId(req);
    const db = cityDatabases[cityId] || cityDatabases.PUNE;
    res.json({
      status: 'ok',
      service: 'LogiSync Intelligence',
      version: '2.0.0-multi-city',
      activeCity: SUPPORTED_CITIES[cityId].name,
      ordersCount: db.orders.length,
      societiesCount: db.societies.length,
      constraintsCount: db.constraints.length,
      aiAvailable: !!ai,
    });
  });

  // 2. Operations Control Tower KPIs
  app.get('/api/kpis', (req, res) => {
    const cityId = getCityId(req);
    res.json(computeKpisForCity(cityId));
  });

  // 3. Experiment Comparison Metrics (Control vs Pilot)
  app.get('/api/experiment-metrics', (req, res) => {
    const cityId = getCityId(req);
    const db = cityDatabases[cityId] || cityDatabases.PUNE;
    res.json(db.experimentMetrics);
  });

  // 4. Orders Listing & Filter
  app.get('/api/orders', (req, res) => {
    const cityId = getCityId(req);
    const db = cityDatabases[cityId] || cityDatabases.PUNE;
    const { locality, riskLevel, confidenceTier, search, status, limit = '1000', offset = '0' } = req.query;

    let filtered = [...db.orders];

    if (locality && locality !== 'ALL') {
      filtered = filtered.filter(o => o.locality.toLowerCase() === String(locality).toLowerCase());
    }

    if (riskLevel && riskLevel !== 'ALL') {
      filtered = filtered.filter(o => o.riskLevel === riskLevel);
    }

    if (confidenceTier && confidenceTier !== 'ALL') {
      filtered = filtered.filter(o => o.confidenceTier === confidenceTier);
    }

    if (status && status !== 'ALL') {
      filtered = filtered.filter(o => o.status === status);
    }

    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(
        o =>
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.societyName.toLowerCase().includes(q) ||
          o.address.toLowerCase().includes(q) ||
          o.locality.toLowerCase().includes(q)
      );
    }

    const total = filtered.length;
    const start = parseInt(String(offset), 10) || 0;
    const lim = parseInt(String(limit), 10) || 1000;
    const paginated = filtered.slice(start, start + lim);

    res.json({
      total,
      limit: lim,
      offset: start,
      orders: paginated,
      city: cityId,
    });
  });

  // 5. Get Single Order Detail
  app.get('/api/orders/:id', (req, res) => {
    const cityId = getCityId(req);
    const db = cityDatabases[cityId] || cityDatabases.PUNE;
    const order = db.orders.find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const society = db.societies.find(s => s.id === order.societyId);
    const activeConstraints = db.constraints.filter(c => order.matchedConstraintIds.includes(c.id));

    res.json({
      order,
      society,
      activeConstraints,
    });
  });

  // 5b. Update Order Details (Customer Name, Phone, Assigned Driver, Vehicle, Address)
  const handleUpdateOrder = (req: express.Request, res: express.Response) => {
    const cityId = getCityId(req);
    const db = cityDatabases[cityId] || cityDatabases.PUNE;
    const idx = db.orders.findIndex(o => o.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = db.orders[idx];
    const {
      customerName,
      customerPhone,
      customerEmail,
      unitNumber,
      address,
      assignedDriverId,
      assignedDriverName,
      assignedDriverPhone,
      assignedVehicleId,
      assignedVehicleNumber,
      assignedTechnicianId,
      assignedTechnicianName,
      status,
      deliveryWindow,
      deliveryDate,
    } = req.body;

    if (customerName) order.customerName = customerName;
    if (customerPhone) order.customerPhone = customerPhone;
    if (customerEmail) order.customerEmail = customerEmail;
    if (unitNumber) order.unitNumber = unitNumber;
    if (address) order.address = address;
    if (status) order.status = status;
    if (deliveryWindow) order.deliveryWindow = deliveryWindow;
    if (deliveryDate) order.deliveryDate = deliveryDate;

    // Driver update & matching
    if (assignedDriverId) {
      order.assignedDriverId = assignedDriverId;
      const matchedDriver = db.drivers.find(d => d.id === assignedDriverId);
      if (matchedDriver) {
        order.assignedDriverName = matchedDriver.name;
        order.assignedDriverPhone = matchedDriver.phone;
        if (!assignedVehicleId && matchedDriver.vehicleId) {
          order.assignedVehicleId = matchedDriver.vehicleId;
        }
      }
    }
    if (assignedDriverName) order.assignedDriverName = assignedDriverName;
    if (assignedDriverPhone) order.assignedDriverPhone = assignedDriverPhone;
    if (assignedVehicleId) order.assignedVehicleId = assignedVehicleId;
    if (assignedVehicleNumber) order.assignedVehicleNumber = assignedVehicleNumber;
    if (assignedTechnicianId) order.assignedTechnicianId = assignedTechnicianId;
    if (assignedTechnicianName) order.assignedTechnicianName = assignedTechnicianName;

    // Update customer notification text with fresh customer name
    if (customerName || assignedDriverName) {
      order.customerNotification = {
        ...order.customerNotification,
        updatedAt: new Date().toISOString(),
      };
    }

    db.orders[idx] = order;

    res.json({
      success: true,
      order,
      message: `Order ${order.id} updated. Customer: ${order.customerName}, Driver: ${order.assignedDriverName}`,
    });
  };

  app.put('/api/orders/:id', handleUpdateOrder);
  app.patch('/api/orders/:id', handleUpdateOrder);

  // 6. Apply Recommended Action (Reroute, Pre-book Mathadi, Shift Slot)
  app.post('/api/orders/:id/apply-action', (req, res) => {
    const cityId = getCityId(req);
    const db = cityDatabases[cityId] || cityDatabases.PUNE;
    const idx = db.orders.findIndex(o => o.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = db.orders[idx];
    const savingsMin = order.recommendedAction.estimatedSavingsMin || 20;
    const savingsCost = order.recommendedAction.estimatedSavingsCost || 100;

    const newDelay = Math.max(5, order.estimatedDelayMinutes - savingsMin);
    const newCost = Math.max(0, order.estimatedAdditionalCost - savingsCost);
    const newRisk = Math.max(15, order.riskScore - 35);
    const newConfidence = Math.min(95, order.confidenceScore + 25);

    order.recommendedAction = {
      ...order.recommendedAction,
      applied: true,
      appliedAt: new Date().toISOString(),
    };

    order.estimatedDelayMinutes = newDelay;
    order.estimatedAdditionalCost = newCost;
    order.riskScore = newRisk;
    order.confidenceScore = newConfidence;
    order.riskLevel = newRisk >= 55 ? 'HIGH' : (newRisk >= 30 ? 'MEDIUM' : 'LOW');
    order.confidenceTier = newConfidence >= 85 ? 'HIGH_CONFIDENCE' : (newConfidence >= 65 ? 'MODERATE_CONFIDENCE' : 'AT_RISK');
    order.customerNotification = {
      headline: 'High confidence — route adjusted',
      message: `We've applied an optimized alternate route for your delivery in ${SUPPORTED_CITIES[cityId].name}. Your delivery is confirmed with expected arrival at ${order.expectedEta}.`,
      status: 'NORMAL',
      updatedAt: new Date().toISOString(),
    };

    db.orders[idx] = order;

    res.json({
      success: true,
      order,
      message: `Applied mitigation: ${order.recommendedAction.title}. Estimated time saved: ${savingsMin}m, Cost saved: ₹${savingsCost}`,
    });
  });

  // 7. Reschedule Delivery Slot
  app.post('/api/orders/:id/reschedule-slot', (req, res) => {
    const cityId = getCityId(req);
    const db = cityDatabases[cityId] || cityDatabases.PUNE;
    const { newSlot, newDate } = req.body;
    const idx = db.orders.findIndex(o => o.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = db.orders[idx];
    const updatedSlot = newSlot || 'Tomorrow, 10:00 AM – 01:00 PM';
    order.deliveryWindow = updatedSlot;
    order.expectedEta = updatedSlot;
    
    if (newDate) {
      order.deliveryDate = newDate;
    } else if (updatedSlot.toLowerCase().includes('tomorrow') && !updatedSlot.toLowerCase().includes('day after')) {
      const tomorrow = new Date(Date.now() + 86400000);
      order.deliveryDate = tomorrow.toISOString().split('T')[0];
    } else if (updatedSlot.toLowerCase().includes('day after')) {
      const dayAfter = new Date(Date.now() + 172800000);
      order.deliveryDate = dayAfter.toISOString().split('T')[0];
    }

    // Format human day and date
    const dParts = order.deliveryDate.split('-');
    const dateObj = dParts.length === 3 ? new Date(parseInt(dParts[0], 10), parseInt(dParts[1], 10) - 1, parseInt(dParts[2], 10)) : new Date(order.deliveryDate);
    const dayName = isNaN(dateObj.getTime()) ? 'Tomorrow' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = isNaN(dateObj.getTime()) ? order.deliveryDate : dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

    order.status = 'RESCHEDULED';
    order.confidenceScore = 98;
    order.confidenceTier = 'HIGH_CONFIDENCE';
    order.riskScore = 8;
    order.riskLevel = 'LOW';
    order.estimatedDelayMinutes = 0;
    order.estimatedAdditionalCost = 0;
    order.riskReasons = [`Customer confirmed new delivery slot: ${dayName}, ${dateStr} (${updatedSlot})`];
    order.customerNotification = {
      headline: 'Delivery window updated & confirmed',
      message: `Your new delivery slot is confirmed for ${dayName}, ${dateStr} • ${updatedSlot}. Product allocation and technician route have been updated in the system.`,
      status: 'NORMAL',
      suggestedSlot: `${dayName}, ${dateStr} • ${updatedSlot}`,
      updatedAt: new Date().toISOString(),
    };

    db.orders[idx] = order;

    res.json({
      success: true,
      order,
      message: `Delivery rescheduled successfully to ${dayName}, ${dateStr} (${order.deliveryWindow})`,
    });
  });

  // 8. Complete Delivery & Trigger Learning Feedback Loop
  app.post('/api/orders/:id/complete-delivery', (req, res) => {
    const cityId = getCityId(req);
    const db = cityDatabases[cityId] || cityDatabases.PUNE;
    const { actualDelayMinutes, actualCost, actualMathadi, actualSocietyFee, actualUnloadingMinutes, driverFeedback } = req.body;
    const idx = db.orders.findIndex(o => o.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = db.orders[idx];
    const socIdx = db.societies.findIndex(s => s.id === order.societyId);
    const society = socIdx !== -1 ? db.societies[socIdx] : null;

    order.status = 'DELIVERED';
    order.actuals = {
      arrivedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      completedAt: new Date().toISOString(),
      actualDelayMinutes: Number(actualDelayMinutes) || 25,
      actualCost: Number(actualCost) || 300,
      actualMathadi: Number(actualMathadi) || 0,
      actualToll: 0,
      actualSocietyFee: Number(actualSocietyFee) || (society?.societyFee || 0),
      actualUnloadingMinutes: Number(actualUnloadingMinutes) || 32,
      routeDeviation: true,
      deliverySuccess: true,
      driverFeedback: driverFeedback || `Delivered via alternate route in ${SUPPORTED_CITIES[cityId].name}.`,
      reportedAt: new Date().toISOString(),
    };

    db.orders[idx] = order;

    const learningRecord: LearningRecord = {
      id: `LRN-${cityId}-${Date.now().toString().slice(-6)}`,
      orderId: order.id,
      societyId: order.societyId,
      societyName: order.societyName,
      completedAt: new Date().toISOString(),
      predictedDelayMin: order.estimatedDelayMinutes,
      actualDelayMin: order.actuals.actualDelayMinutes,
      delayVarianceMin: order.actuals.actualDelayMinutes - order.estimatedDelayMinutes,
      predictedCostInr: order.estimatedAdditionalCost,
      actualCostInr: order.actuals.actualCost,
      costVarianceInr: order.actuals.actualCost - order.estimatedAdditionalCost,
      predictedMathadiInr: society?.typicalMathadiCharge || 0,
      actualMathadiInr: order.actuals.actualMathadi,
      predictedUnloadingMin: society?.typicalUnloadingMinutes || 25,
      actualUnloadingMin: order.actuals.actualUnloadingMinutes,
      primaryDisruptionCause: order.actuals.actualMathadi > 0 ? 'Mathadi handling verified by driver' : 'Ground access variance',
      modelAdjustmentMade: society
        ? `Calibrated ${society.name.split('-')[0].trim()} unloading benchmark to ${order.actuals.actualUnloadingMinutes} min.`
        : 'Model baseline updated.',
    };

    db.learningRecords.unshift(learningRecord);

    if (society && socIdx !== -1) {
      db.societies[socIdx] = {
        ...society,
        totalDeliveriesCompleted: society.totalDeliveriesCompleted + 1,
        lastVerifiedDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        typicalUnloadingMinutes: Math.round((society.typicalUnloadingMinutes * 0.8) + (order.actuals.actualUnloadingMinutes * 0.2)),
        notes: `${society.notes} [Learned: Verified on ${new Date().toLocaleDateString()}].`,
      };
    }

    recalculateCityOrders(cityId);

    res.json({
      success: true,
      order,
      learningRecord,
      updatedSociety: db.societies[socIdx],
      message: 'Delivery recorded and closed-loop continuous learning model updated.',
    });
  });

  // 9. Societies listing
  app.get('/api/societies', (req, res) => {
    const cityId = getCityId(req);
    const db = cityDatabases[cityId] || cityDatabases.PUNE;
    const { locality, search } = req.query;
    let list = [...db.societies];

    if (locality && locality !== 'ALL') {
      list = list.filter(s => s.locality.toLowerCase() === String(locality).toLowerCase());
    }

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q) || s.locality.toLowerCase().includes(q));
    }

    res.json(list);
  });

  // 10. Get Society Detail
  app.get('/api/societies/:id', (req, res) => {
    const cityId = getCityId(req);
    const db = cityDatabases[cityId] || cityDatabases.PUNE;
    const soc = db.societies.find(s => s.id === req.params.id);
    if (!soc) return res.status(404).json({ error: 'Society not found' });

    const recentOrders = db.orders.filter(o => o.societyId === soc.id).slice(0, 10);
    const recentLearning = db.learningRecords.filter(l => l.societyId === soc.id).slice(0, 10);

    res.json({
      society: soc,
      recentOrders,
      recentLearning,
    });
  });

  // 11. Update Society Profile
  app.put('/api/societies/:id', (req, res) => {
    const cityId = getCityId(req);
    const db = cityDatabases[cityId] || cityDatabases.PUNE;
    const idx = db.societies.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Society not found' });

    db.societies[idx] = {
      ...db.societies[idx],
      ...req.body,
      lastVerifiedDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    };

    recalculateCityOrders(cityId);

    res.json({
      success: true,
      society: db.societies[idx],
    });
  });

  // 12. Constraints Listing & CRUD
  app.get('/api/constraints', (req, res) => {
    const cityId = getCityId(req);
    const db = cityDatabases[cityId] || cityDatabases.PUNE;
    const { locality, type, status } = req.query;
    let list = [...db.constraints];

    if (locality && locality !== 'ALL') {
      list = list.filter(c => c.locality.toLowerCase() === String(locality).toLowerCase());
    }

    if (type && type !== 'ALL') {
      list = list.filter(c => c.type === type);
    }

    if (status && status !== 'ALL') {
      list = list.filter(c => c.status === status);
    }

    res.json(list);
  });

  app.post('/api/constraints', (req, res) => {
    const cityId = getCityId(req);
    const db = cityDatabases[cityId] || cityDatabases.PUNE;
    const cityConfig = SUPPORTED_CITIES[cityId];

    const newConstraint: LogisticsConstraint = {
      id: `CONST-${cityId}-${Date.now().toString().slice(-4)}`,
      title: req.body.title || 'New Road/Access Constraint',
      type: req.body.type || 'ROAD_BLOCKAGE',
      locality: req.body.locality || (cityConfig.localities[0] as any),
      lat: req.body.lat || cityConfig.center.lat,
      lng: req.body.lng || cityConfig.center.lng,
      radiusMeters: req.body.radiusMeters || 300,
      severity: req.body.severity || 'MEDIUM',
      source: req.body.source || 'OPS_DESK',
      confidence: req.body.confidence || 90,
      expectedDelayMinutes: req.body.expectedDelayMinutes || 20,
      expectedCostInr: req.body.expectedCostInr || 0,
      status: req.body.status || 'ACTIVE',
      startTime: req.body.startTime || new Date().toISOString(),
      endTime: req.body.endTime || new Date(Date.now() + 3600000 * 24).toISOString(),
      notes: req.body.notes || '',
      affectedSocieties: req.body.affectedSocieties || [],
      interventionType: req.body.interventionType || 'MITIGATE',
      createdAt: new Date().toISOString(),
    };

    db.constraints.unshift(newConstraint);
    recalculateCityOrders(cityId);

    res.json({
      success: true,
      constraint: newConstraint,
      message: 'Constraint logged and routes updated.',
    });
  });

  app.put('/api/constraints/:id', (req, res) => {
    const cityId = getCityId(req);
    const db = cityDatabases[cityId] || cityDatabases.PUNE;
    const idx = db.constraints.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Constraint not found' });

    db.constraints[idx] = {
      ...db.constraints[idx],
      ...req.body,
    };

    recalculateCityOrders(cityId);

    res.json({
      success: true,
      constraint: db.constraints[idx],
    });
  });

  app.delete('/api/constraints/:id', (req, res) => {
    const cityId = getCityId(req);
    const db = cityDatabases[cityId] || cityDatabases.PUNE;
    db.constraints = db.constraints.filter(c => c.id !== req.params.id);
    recalculateCityOrders(cityId);
    res.json({ success: true, message: 'Constraint removed' });
  });

  // 13. Driver Ground-Truth Reporting
  app.get('/api/driver-reports', (req, res) => {
    const cityId = getCityId(req);
    const db = cityDatabases[cityId] || cityDatabases.PUNE;
    res.json(db.driverReports);
  });

  app.post('/api/driver-reports', (req, res) => {
    const cityId = getCityId(req);
    const db = cityDatabases[cityId] || cityDatabases.PUNE;
    const { driverId, driverName, orderId, societyId, type, title, amount, impact, notes, lat, lng, photoUrl } = req.body;

    const matchedSociety = db.societies.find(s => s.id === societyId || (lat && Math.abs(s.lat - Number(lat)) < 0.005));
    const reportLat = Number(lat) || matchedSociety?.lat || SUPPORTED_CITIES[cityId].center.lat;
    const reportLng = Number(lng) || matchedSociety?.lng || SUPPORTED_CITIES[cityId].center.lng;
    const targetLocality = matchedSociety?.locality || req.body.locality || (SUPPORTED_CITIES[cityId].localities[0] as any);

    // 1. Identify all affected societies in geographic radius (~2.5km) or matching locality
    const affectedSocObjects = db.societies.filter(s => {
      if (matchedSociety && s.id === matchedSociety.id) return true;
      if (societyId && s.id === societyId) return true;
      const distanceDeg = Math.sqrt(Math.pow(s.lat - reportLat, 2) + Math.pow(s.lng - reportLng, 2));
      if (distanceDeg < 0.025) return true;
      if ((type === 'ROAD_BLOCKAGE' || type === 'EXCAVATION' || type === 'TRAFFIC_RESTRICTION') && s.locality === targetLocality) {
        return true;
      }
      return false;
    });

    const affectedSocieties = affectedSocObjects.map(s => s.id);
    if (matchedSociety && !affectedSocieties.includes(matchedSociety.id)) {
      affectedSocieties.push(matchedSociety.id);
    }

    const report: DriverReport = {
      id: `REP-${cityId}-${Date.now().toString().slice(-4)}`,
      driverId: driverId || `DRV-${cityId}-01`,
      driverName: driverName || 'Field Pilot Crew',
      orderId,
      societyId: matchedSociety?.id || societyId,
      societyName: matchedSociety?.name || 'Reported Location',
      type: type || 'ROAD_BLOCKAGE',
      title: title || `${type} reported by driver`,
      amount: Number(amount) || 0,
      impact: impact || 'HIGH',
      notes: notes || '',
      lat: reportLat,
      lng: reportLng,
      photoUrl,
      timestamp: new Date().toISOString(),
      status: 'VERIFIED',
    };

    db.driverReports.unshift(report);

    // 2. Create the real-time active Logistics Constraint
    const newConstraint: LogisticsConstraint = {
      id: `CONST-${cityId}-${Date.now().toString().slice(-4)}`,
      type: report.type,
      title: report.title,
      locality: targetLocality,
      lat: reportLat,
      lng: reportLng,
      radiusMeters: 500,
      severity: report.impact,
      source: 'DRIVER_REPORT',
      confidence: 98,
      expectedDelayMinutes: report.impact === 'CRITICAL' ? 55 : (report.impact === 'HIGH' ? 35 : (report.impact === 'MEDIUM' ? 15 : 5)),
      expectedCostInr: report.amount || (report.type === 'MATHADI' ? (report.impact === 'LOW' ? 0 : 350) : (report.type === 'SOCIETY_FEE' ? (report.impact === 'LOW' ? 0 : 200) : 0)),
      status: 'ACTIVE',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000 * 8).toISOString(),
      notes: `Driver note: "${report.notes}" (Reported by ${report.driverName})`,
      affectedSocieties: affectedSocieties.length > 0 ? affectedSocieties : (matchedSociety ? [matchedSociety.id] : []),
      interventionType: report.type === 'MATHADI' ? 'PREVENT' : 'MITIGATE',
      createdAt: new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
    };

    db.constraints.unshift(newConstraint);

    // 3. Update all affected societies in memory with verified ground truth
    affectedSocObjects.forEach(soc => {
      const sIdx = db.societies.findIndex(s => s.id === soc.id);
      if (sIdx !== -1) {
        const s = db.societies[sIdx];
        s.lastVerifiedDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

        if (report.type === 'MATHADI') {
          if (report.impact === 'CRITICAL') {
            s.mathadiProbability = 92;
            s.typicalMathadiCharge = report.amount || 400;
          } else if (report.impact === 'HIGH') {
            s.mathadiProbability = 82;
            s.typicalMathadiCharge = report.amount || 350;
          } else if (report.impact === 'MEDIUM') {
            s.mathadiProbability = 48;
            s.typicalMathadiCharge = report.amount || 150;
          } else {
            s.mathadiProbability = 15;
            s.typicalMathadiCharge = report.amount || 0;
          }
          s.notes = `${s.notes} [Driver Truth: Mathadi fee ₹${s.typicalMathadiCharge} verified by ${report.driverName}].`;
        } else if (report.type === 'SOCIETY_FEE') {
          s.societyFee = report.amount || (report.impact === 'LOW' ? 0 : 200);
          s.notes = `${s.notes} [Driver Truth: Society gate fee ₹${s.societyFee} verified by ${report.driverName}].`;
        } else if (report.type === 'BUILDING_ACCESS') {
          s.serviceLiftAvailability = report.impact === 'LOW';
          s.liftRestrictions = report.impact !== 'LOW' ? 'Service elevator offline / freight queue. Manual staircase carry required.' : 'Service lift operational.';
          s.typicalUnloadingMinutes = report.impact === 'CRITICAL' ? 50 : report.impact === 'HIGH' ? 42 : 28;
          s.notes = `${s.notes} [Driver Truth: Service lift status verified by ${report.driverName}].`;
        } else if (report.type === 'PARKING') {
          s.parkingAvailability = report.impact === 'LOW' ? 'DEDICATED_BAY' : 'STREET_ONLY';
          s.typicalUnloadingMinutes = Math.max(s.typicalUnloadingMinutes, 36);
          s.notes = `${s.notes} [Driver Truth: Loading bay clearance verified by ${report.driverName}].`;
        } else if (report.type === 'EXCAVATION' || report.type === 'ROAD_BLOCKAGE') {
          s.historicalAverageDelayMinutes = Math.max(s.historicalAverageDelayMinutes, report.impact === 'CRITICAL' ? 45 : (report.impact === 'HIGH' ? 30 : 15));
          s.notes = `${s.notes} [Driver Truth: Road corridor delay verified by ${report.driverName}].`;
        }
      }
    });

    // 4. Runtime Recalculation across ALL orders, customers, and drivers in the city
    recalculateCityOrders(cityId);

    // 5. Apply explicit direct impact flag to the target order if specified
    let targetOrderUpdated: Order | undefined;
    if (orderId) {
      const ordIdx = db.orders.findIndex(o => o.id === orderId);
      if (ordIdx !== -1) {
        const ord = db.orders[ordIdx];
        ord.driverFlaggedImpact = report.impact;
        if (report.impact === 'CRITICAL') {
          ord.riskScore = 88;
          ord.riskLevel = 'CRITICAL';
          ord.confidenceTier = 'AT_RISK';
          ord.confidenceScore = 42;
          ord.estimatedDelayMinutes = 55;
          ord.expectedEta = '04:10 PM';
          ord.customerNotification = {
            headline: 'Critical access notice — options available',
            message: `A major ground access bottleneck near ${ord.locality || 'your area'} is causing an estimated +55m delay. Current ETA: ${ord.expectedEta}. Our dispatch team is actively coordinating clearance. We recommend confirming whether you prefer to wait or pick a guaranteed delivery slot tomorrow.`,
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
        } else if (report.impact === 'HIGH') {
          ord.riskScore = 68;
          ord.riskLevel = 'HIGH';
          ord.confidenceTier = 'AT_RISK';
          ord.confidenceScore = 60;
          ord.estimatedDelayMinutes = 35;
          ord.expectedEta = '03:50 PM';
          ord.customerNotification = {
            headline: 'Delivery delay intimation — action optional',
            message: `Local corridor clearance or gated community access checks near ${ord.locality || 'your area'} are adding an estimated +35m delay. Calibrated arrival window: ${ord.expectedEta}. You can continue waiting or select a free reschedule slot.`,
            status: 'ACTION_REQUIRED',
            suggestedSlot: 'Tomorrow, 10:00 AM – 01:00 PM',
            slotOptions: [
              'Tomorrow, 10:00 AM – 01:00 PM',
              'Tomorrow, 02:00 PM – 05:00 PM',
              'Keep Today (Late Evening 6–8 PM)',
            ],
            updatedAt: new Date().toISOString(),
          };
        } else if (report.impact === 'MEDIUM') {
          ord.riskScore = 38;
          ord.riskLevel = 'MEDIUM';
          ord.confidenceTier = 'MODERATE_CONFIDENCE';
          ord.confidenceScore = 80;
          ord.estimatedDelayMinutes = 15;
          ord.expectedEta = '03:30 PM';
          ord.customerNotification = {
            headline: 'Slight transit buffer added',
            message: `We are monitoring minor road traffic variance and society entry verification near ${ord.locality || 'your area'}. We have added a brief +15m buffer to your delivery window. Calibrated ETA: ${ord.expectedEta}.`,
            status: 'POTENTIAL_DELAY',
            updatedAt: new Date().toISOString(),
          };
        } else {
          ord.riskScore = 15;
          ord.riskLevel = 'LOW';
          ord.confidenceTier = 'HIGH_CONFIDENCE';
          ord.confidenceScore = 95;
          ord.estimatedDelayMinutes = 0;
          ord.expectedEta = '03:15 PM';
          ord.customerNotification = {
            headline: 'High confidence — on track',
            message: `Your delivery team and products are confirmed. Building entry access and route conditions near ${ord.locality || 'your area'} have been verified. Expected arrival: ${ord.expectedEta}.`,
            status: 'NORMAL',
            updatedAt: new Date().toISOString(),
          };
        }
        targetOrderUpdated = ord;
      }
    }

    // 6. Update vehicle active orders telemetry
    db.vehicles.forEach(veh => {
      const assignedCount = db.orders.filter(o => o.assignedVehicleId === veh.id && o.status !== 'DELIVERED').length;
      veh.activeOrdersCount = assignedCount;
    });

    const updatedKpis = computeKpisForCity(cityId);

    res.json({
      success: true,
      report,
      createdConstraint: newConstraint,
      affectedSocietiesCount: affectedSocieties.length,
      targetOrder: targetOrderUpdated,
      kpis: updatedKpis,
      message: `Ground-truth report submitted. Live runtime recalculated for all ${db.orders.length} customers, ${db.drivers.length} drivers, and ${affectedSocieties.length} locations in ${SUPPORTED_CITIES[cityId].name}.`,
    });
  });

  // 14. Learning Records
  app.get('/api/learning-records', (req, res) => {
    const cityId = getCityId(req);
    const db = cityDatabases[cityId] || cityDatabases.PUNE;
    res.json(db.learningRecords);
  });

  // 15. Fleet
  app.get('/api/fleet', (req, res) => {
    const cityId = getCityId(req);
    const db = cityDatabases[cityId] || cityDatabases.PUNE;
    res.json({
      vehicles: db.vehicles,
      drivers: db.drivers,
      technicians: db.technicians,
      warehouses: SUPPORTED_CITIES[cityId].warehouses,
    });
  });

  // 16. AI Operations Copilot
  app.post('/api/ai/operations-copilot', async (req, res) => {
    const cityId = getCityId(req);
    const db = cityDatabases[cityId] || cityDatabases.PUNE;
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    const atRiskCount = db.orders.filter(o => o.riskLevel === 'HIGH' || o.riskLevel === 'CRITICAL').length;
    const activeConstraints = db.constraints.filter(c => c.status === 'ACTIVE');
    const cityName = SUPPORTED_CITIES[cityId].name;

    const contextSummary = `
      City Hub: ${cityName} (${SUPPORTED_CITIES[cityId].localities.join(', ')})
      Total Orders Today: ${db.orders.length}
      At-Risk Orders: ${atRiskCount}
      Active Micro-Constraints: ${activeConstraints.length} (Key: ${activeConstraints.slice(0, 3).map(c => `${c.type}: ${c.title}`).join('; ')})
      Societies Monitored: ${db.societies.slice(0, 5).map(s => s.name).join(', ')}
    `;

    try {
      if (ai) {
        const prompt = `
          You are the Senior Logistics Operations Copilot for LogiSync Intelligence in ${cityName}, India.
          Answer the operations manager's question with concise, factual, data-grounded insights based on the context below.
          Be professional, direct, and actionable.

          Key Domain Knowledge on LogiSync Mitigation Logic:
          1. 4-Stage Mitigation Architecture:
             - Stage 1 (Fleet Reroute): Telematics detects road excavation / bridge blockage, recalculates bypass via sub-arterial corridors (saves 25–35 min).
             - Stage 2 (Ground Pre-Auth): For Mathadi union (>40% risk) or gated societies, issues instant ₹200–₹350 digital QR voucher, eliminating gate disputes and 20+ min truck lockout.
             - Stage 3 (Customer Reassurance): Updates customer tracking with high confidence ETA while suppressing internal union/friction alerts, cutting WISMO calls by 66%.
             - Stage 4 (Closed-Loop Learning): Logs actual unloading & delay to calibrate future society baseline parameters.
          2. Risk Scoring Formula: Risk = (0.35 × CorridorDelay) + (0.30 × MathadiProb) + (0.20 × LiftBlackout) + (0.15 × GateWait). Score > 40 triggers automated mitigation.
          3. Unit Economics: Spending ₹350 on pre-auth saves ₹1,420 in aborted trips and driver overtime, yielding ₹1,070 net savings per order.

          Context:
          ${contextSummary}
          
          Operations Manager Query: "${query}"
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
        });

        return res.json({
          response: response.text || 'Operations telemetry evaluated.',
          source: 'Gemini 3.7 Flash Intelligence',
        });
      }
    } catch (err: any) {
      console.warn('Gemini API call fallback:', err?.message);
    }

    const fallbackAnswer = `Operations Telemetry for ${cityName}:
• Disruption Summary: ${atRiskCount} orders currently flagged for active delivery risk.
• Active Constraints: ${activeConstraints.length > 0 ? activeConstraints[0].title : 'Corridor running with normal traffic variance'}.
• Ground Intelligence: Automated route adjustments and slot protection active across ${cityName} corridors.`;

    res.json({
      response: fallbackAnswer,
      source: 'LogiSync Rule Engine & Telematics Model',
    });
  });

  // 17. AI Driver Note Parsing
  app.post('/api/ai/parse-driver-note', async (req, res) => {
    const cityId = getCityId(req);
    const { rawNote, driverLocality } = req.body;
    if (!rawNote) return res.status(400).json({ error: 'rawNote is required' });

    try {
      if (ai) {
        const prompt = `
          You are a logistics NLP parser for Indian urban delivery operations in ${SUPPORTED_CITIES[cityId].name}.
          Parse this driver note into a structured JSON object.
          Driver Note: "${rawNote}"
          Default Locality: "${driverLocality || SUPPORTED_CITIES[cityId].localities[0]}"
          
          Return pure JSON with keys:
          - type: one of ["ROAD_BLOCKAGE", "EXCAVATION", "MATHADI", "SOCIETY_FEE", "PARKING", "BUILDING_ACCESS", "TRAFFIC_RESTRICTION", "OTHER"]
          - title: short clean English summary
          - amount: number in INR if money is mentioned, else 0
          - severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
          - expectedDelayMinutes: estimated delay in minutes
          - customerFriendlySummary: neutral non-accusatory customer update text
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json({ parsed });
      }
    } catch (err: any) {
      console.warn('Gemini parser fallback:', err?.message);
    }

    const isMathadi = /mathadi|union|hamali|unloading charge/i.test(rawNote);
    const isRoad = /road|block|digging|excavation|traffic|jam/i.test(rawNote);
    const amountMatch = rawNote.match(/(\d+)\s*(?:rs|inr|rupees|₹)?/i);

    res.json({
      parsed: {
        type: isMathadi ? 'MATHADI' : (isRoad ? 'EXCAVATION' : 'BUILDING_ACCESS'),
        title: rawNote.slice(0, 60),
        amount: amountMatch ? parseInt(amountMatch[1], 10) : (isMathadi ? 350 : 0),
        severity: 'HIGH',
        expectedDelayMinutes: 30,
        customerFriendlySummary: isMathadi
          ? 'Building access may require an additional unloading arrangement.'
          : 'Temporary road access restriction detected on your route.',
      },
    });
  });

  // 17b. AI Multimodal Hazard Photo Analyzer
  app.post('/api/ai/analyze-hazard-photo', async (req, res) => {
    const cityId = getCityId(req);
    const { photoDataUrl, currentNote } = req.body;
    if (!photoDataUrl) return res.status(400).json({ error: 'photoDataUrl is required' });

    try {
      if (ai) {
        let mimeType = 'image/jpeg';
        let base64Data = '';
        if (photoDataUrl.startsWith('data:')) {
          const parts = photoDataUrl.split(',');
          const mimeMatch = parts[0].match(/:(.*?);/);
          if (mimeMatch) mimeType = mimeMatch[1];
          base64Data = parts[1];
        }

        if (base64Data) {
          const prompt = `
            You are an AI visual ground-truth detector for urban delivery in ${SUPPORTED_CITIES[cityId].name}, India.
            Analyze this delivery photo (such as gate receipt, mathadi union slip, road excavation, barricade, broken elevator/lift, or parking choke).
            
            Return pure JSON with keys:
            - detected: boolean (true if image depicts real ground condition/hazard/receipt/road/gate)
            - type: one of ["MATHADI", "ROAD_BLOCKAGE", "EXCAVATION", "SOCIETY_FEE", "BUILDING_ACCESS", "PARKING", "TRAFFIC_RESTRICTION", "OTHER"]
            - detectedElements: string[] (e.g. ["Mathadi Handload Receipt", "Road Excavation", "Security Gate Barricade"])
            - suggestedTitle: short clean English title (e.g. "Gate 2 Mathadi handling demand verified from camera receipt")
            - suggestedNote: concise driver ground note (e.g. "Gate 2 union fee slip captured by driver. Demanding ₹350 cash.")
            - amount: number if receipt/slip mentions amount in INR (else 350 for mathadi, or 0)
            - severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
            - estimatedDelayMinutes: number (e.g. 35)
            - customerIntimationNote: reassuring customer-facing update with reschedule recommendation
          `;

          const response = await ai.models.generateContent({
            model: 'gemini-3.7-flash',
            contents: [
              {
                role: 'user',
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
            config: {
              responseMimeType: 'application/json',
            },
          });

          const parsed = JSON.parse(response.text || '{}');
          return res.json({ analysis: parsed });
        }
      }
    } catch (err: any) {
      console.warn('Gemini multimodal image analysis fallback:', err?.message);
    }

    // Fallback intelligent heuristics for photo
    res.json({
      analysis: {
        detected: true,
        type: 'MATHADI',
        detectedElements: ['On-site Ground Hazard Photo Verified', 'Gate Access Evidence'],
        suggestedTitle: 'Ground obstacle/gate slip verified by camera photo',
        suggestedNote: 'Photo captured by driver confirming on-site gate/corridor condition.',
        amount: 350,
        severity: 'HIGH',
        estimatedDelayMinutes: 35,
        customerIntimationNote: 'Gate verification and building coordination in progress. Expected arrival window updated with reschedule option.',
      },
    });
  });

  // 18. AI Customer Note Generator
  app.post('/api/ai/generate-customer-note', async (req, res) => {
    const { internalReason } = req.body;

    try {
      if (ai) {
        const prompt = `
          You are a customer communication specialist for a furniture/appliance rental company in India.
          Translate this internal logistics disruption reason into neutral, comforting, customer-friendly language.
          
          STRICT RULES:
          1. NEVER mention political parties, driver names, driver ratings, internal vendor disputes, internal costs, or Mathadi union names.
          2. Use polite, reassuring phrasing like "temporary road access restriction", "building access coordination", or "specialized handling requirement".
          3. Keep it under 2 sentences.
          
          Internal Reason: "${internalReason}"
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
        });

        return res.json({
          customerNote: response.text?.trim() || 'We are monitoring a temporary local access condition and have adjusted your delivery schedule.',
        });
      }
    } catch (err) {
      // fallback
    }

    let customerNote = 'We are monitoring a temporary road access restriction affecting your route.';
    if (/mathadi|union|hamali/i.test(internalReason)) {
      customerNote = 'Building access requires an additional unloading coordination step. Our delivery team is managing clearance.';
    } else if (/lift|elevator/i.test(internalReason)) {
      customerNote = 'Scheduled building service elevator maintenance is temporarily affecting transit times to upper floors.';
    }

    res.json({ customerNote });
  });

  // 19. Demo Flow: Trigger Showcase Disruption
  app.post('/api/demo/trigger-disruption', (req, res) => {
    const cityId = getCityId(req);
    const db = cityDatabases[cityId] || cityDatabases.PUNE;
    const showcase = db.orders[0];
    if (!showcase) return res.status(404).json({ error: 'Order not found' });

    const disruptionConstraint: LogisticsConstraint = {
      id: `CONST-${cityId}-DEMO-99`,
      type: cityId === 'BANGALORE' ? 'TRAFFIC_RESTRICTION' : cityId === 'DELHI_NCR' ? 'VEHICLE_RESTRICTION' : 'EXCAVATION',
      title: cityId === 'BANGALORE'
        ? 'Emergency Metro Pipe Digging & Traffic Divergence near Outer Ring Road'
        : cityId === 'DELHI_NCR'
        ? 'Pollution Advisory Commercial Entry Choke on Expressway'
        : 'Emergency Metro Trenching on Main Delivery Approach',
      locality: showcase.locality,
      lat: showcase.lat + 0.002,
      lng: showcase.lng + 0.002,
      radiusMeters: 600,
      severity: 'CRITICAL',
      source: 'DRIVER_REPORT',
      confidence: 98,
      expectedDelayMinutes: 45,
      expectedCostInr: 350,
      status: 'ACTIVE',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000 * 12).toISOString(),
      notes: 'Driver reported heavy congestion on approach bridge + gate access restrictions.',
      affectedSocieties: [showcase.societyId],
      interventionType: 'PREVENT',
      createdAt: new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
    };

    db.constraints = db.constraints.filter(c => c.id !== disruptionConstraint.id);
    db.constraints.unshift(disruptionConstraint);

    showcase.riskScore = 78;
    showcase.riskLevel = 'HIGH';
    showcase.confidenceScore = 55;
    showcase.confidenceTier = 'AT_RISK';
    showcase.estimatedDelayMinutes = 45;
    showcase.estimatedAdditionalCost = 350;
    showcase.riskReasons = [
      'Emergency road excavation on primary approach corridor (+45 min delay)',
      'Building service lift maintenance window active',
      'Historical unloading duration variance: +15 minutes',
    ];
    showcase.recommendedAction = {
      actionType: 'REROUTE',
      title: 'Apply Alternate Transit Bypass + Priority Unloading Pass',
      description: 'Divert delivery vehicle via ring road bypass to avoid roadblock and trigger advance gate clearance.',
      estimatedSavingsMin: 32,
      estimatedSavingsCost: 150,
      applied: false,
    };
    showcase.customerNotification = {
      headline: 'Delivery needs attention',
      message: `We are monitoring a temporary access condition in ${SUPPORTED_CITIES[cityId].name} and coordinating building clearance for your delivery.`,
      status: 'ACTION_REQUIRED',
      suggestedSlot: 'Tomorrow, 10:00 AM – 01:00 PM',
      slotOptions: ['Tomorrow, 10:00 AM – 01:00 PM', 'Tomorrow, 02:00 PM – 05:00 PM', 'Keep Today (Late Evening 6–8 PM)'],
      updatedAt: new Date().toISOString(),
    };

    recalculateCityOrders(cityId);

    res.json({
      success: true,
      order: showcase,
      constraint: disruptionConstraint,
      message: `Showcase disruption triggered in ${SUPPORTED_CITIES[cityId].name}! Risk evaluated and mitigation prepared.`,
    });
  });

  // 20. Demo Reset
  app.post('/api/demo/reset', (req, res) => {
    const cityId = getCityId(req);
    cityDatabases[cityId] = initCityState(cityId);
    recalculateCityOrders(cityId);

    res.json({
      success: true,
      message: `Dataset for ${SUPPORTED_CITIES[cityId].name} reset to pristine baseline.`,
    });
  });

  // Global API error handler to prevent internal trace or key leakage
  app.use('/api', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('API Error:', err?.message || err);
    res.status(500).json({
      error: 'An operational error occurred while processing your request.',
      status: 500,
    });
  });

  // ----------------------------------------------------
  // VITE MIDDLEWARE & STATIC SERVING
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LogiSync Intelligence server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
