import React, { useState } from 'react';
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Navigation,
  UserCheck,
  Brain,
  Smartphone,
  Truck,
  Building,
  AlertTriangle,
  Clock,
  ChevronRight,
  Sparkles,
  X,
  Play,
  RotateCcw,
  Sliders,
  Scale,
  FileText,
  HelpCircle,
  TrendingDown,
  Layers,
  ArrowDownRight,
  Boxes,
} from 'lucide-react';
import { Order } from '../types';
import { CityId, SUPPORTED_CITIES } from '../data/multiCityData';

interface MitigationLifecycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order | null;
  cityId?: CityId;
  onApplyMitigation?: (orderId: string) => Promise<void>;
}

type ModalTab = 'LIFECYCLE_DIFF' | 'DECISION_RULES' | 'STRATEGY_PLAYBOOK' | 'UNIT_ECONOMICS';

const CITY_PLACE_EXAMPLES: Record<
  CityId,
  {
    bypassRoute: string;
    sampleSociety: string;
    sampleGate: string;
    sampleLocality: string;
    defaultOrderId: string;
  }
> = {
  PUNE: {
    bypassRoute: 'Marunji Ring Bypass or Wakad Service Road',
    sampleSociety: 'Megapolis Splendida, Phase 3',
    sampleGate: 'Gate 2 Security & Mathadi Checkpoint',
    sampleLocality: 'Hinjewadi Phase 3',
    defaultOrderId: 'RM-82931',
  },
  BANGALORE: {
    bypassRoute: 'ORR Silk Board Bypass or Whitefield Outer Link Road',
    sampleSociety: 'Prestige Shantiniketan, Tower 4',
    sampleGate: 'South Gate 1 Commercial Freight Bay',
    sampleLocality: 'Whitefield / Bellandur',
    defaultOrderId: 'RM-BLR-101',
  },
  DELHI_NCR: {
    bypassRoute: 'Dwarka Expressway Bypass or Noida-Greater Noida Link',
    sampleSociety: 'ATS Greens Village, Sector 150',
    sampleGate: 'Commercial Freight Gate 3',
    sampleLocality: 'Noida Sector 150 / Gurugram',
    defaultOrderId: 'RM-DEL-201',
  },
  MUMBAI: {
    bypassRoute: 'Eastern Freeway / JVLR Bypass or LBS Marg',
    sampleSociety: 'Hiranandani Gardens Powai',
    sampleGate: 'Central Gate 1 (Mathadi Union Post)',
    sampleLocality: 'Powai / Lower Parel',
    defaultOrderId: 'RM-BOM-301',
  },
  HYDERABAD: {
    bypassRoute: 'Gachibowli Outer Ring Road (ORR) Bypass or Financial District Link',
    sampleSociety: 'My Home Bhooja, Tower D',
    sampleGate: 'Tower D Service Freight Gate',
    sampleLocality: 'Financial District / Gachibowli',
    defaultOrderId: 'RM-HYD-401',
  },
};

export const MitigationLifecycleModal: React.FC<MitigationLifecycleModalProps> = ({
  isOpen,
  onClose,
  order,
  cityId = 'PUNE',
  onApplyMitigation,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('LIFECYCLE_DIFF');
  const [activeStage, setActiveStage] = useState<number>(1);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationCompleted, setSimulationCompleted] = useState<boolean>(order?.recommendedAction?.applied || false);

  if (!isOpen) return null;

  const cityPlaces = CITY_PLACE_EXAMPLES[cityId] || CITY_PLACE_EXAMPLES.PUNE;
  const currentCityConfig = SUPPORTED_CITIES[cityId] || SUPPORTED_CITIES.PUNE;

  const displayOrderId = order?.id || cityPlaces.defaultOrderId;
  const displaySociety = order?.societyName || cityPlaces.sampleSociety;
  const displayGate = cityPlaces.sampleGate;

  const MITIGATION_PILLARS = [
    {
      id: 1,
      title: '1. Fleet & Driver Dynamic Bypass',
      subtitle: 'Corridor Rerouting',
      icon: Navigation,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      badgeColor: 'bg-blue-100 text-blue-800',
      whatHappens: `The telematics engine detects roadblocks, metro excavations, or gridlock in ${currentCityConfig.name} and calculates a viable bypass route (via ${cityPlaces.bypassRoute}), transmitting turn-by-turn waypoints directly to the driver mobile app.`,
      impact: 'Recovers 25–35 minutes of road transit delay.',
      stateChange: {
        before: `Blocked at main approach corridor in ${order?.locality || cityPlaces.sampleLocality} (+45 min delay)`,
        after: `Diverted via ${cityPlaces.bypassRoute} (+12 min total transit)`,
      },
    },
    {
      id: 2,
      title: '2. Pre-Authorized Digital Gate Voucher',
      subtitle: 'Ground Friction Elimination',
      icon: 'INR',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      badgeColor: 'bg-amber-100 text-amber-800',
      whatHappens: `For high Mathadi union probability or society gate passes at ${displaySociety}, LogiSync auto-generates a pre-authorized digital token/voucher (₹200–₹350). The driver presents the QR pass at ${displayGate}, eliminating driver-union arguments and 20+ minute vehicle lockouts.`,
      impact: 'Eliminates gate disputes and driver cash out-of-pocket bottlenecks.',
      stateChange: {
        before: `Vehicle halted at ${displaySociety} by union team (dispute)`,
        after: 'Pre-cleared with verified LogiSync digital voucher in <4 mins',
      },
    },
    {
      id: 3,
      title: '3. Customer Promise Protection',
      subtitle: 'Transparent Reassurance',
      icon: UserCheck,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      whatHappens: `Customer tracking view in ${currentCityConfig.name} is dynamically updated with a calibrated ETA window. Crucially, internal friction (union clashes, driver disputes) is suppressed. Instead, the customer receives a polite, transparent reassurance notification.`,
      impact: 'Reduces customer support inquiry calls by 66% and keeps CSAT > 4.6/5.0.',
      stateChange: {
        before: 'Status: "ACTION REQUIRED / High Delay Risk"',
        after: 'Status: "High Confidence — Route Adjusted (ETA on track)"',
      },
    },
    {
      id: 4,
      title: '4. Closed-Loop Machine Calibration',
      subtitle: 'Self-Healing Logistics Network',
      icon: Brain,
      color: 'bg-violet-50 text-violet-700 border-violet-200',
      badgeColor: 'bg-violet-100 text-violet-800',
      whatHappens: `Upon delivery completion at ${displaySociety}, actual delay and unloading metrics feed back into the continuous learning model. Society profiles (unloading benchmark, lift wait times) in ${currentCityConfig.name} are automatically calibrated for all future deliveries.`,
      impact: `Permanently improves prediction accuracy for the entire ${currentCityConfig.name} delivery cluster.`,
      stateChange: {
        before: `Society baseline for ${displaySociety} assumed static generic time`,
        after: 'Calibrated society benchmark to 28 min actual unloading',
      },
    },
  ];

  const DECISION_RULES = [
    {
      ruleId: 'RULE-MIT-01',
      name: 'Dynamic Arterial Bypass',
      trigger: 'Corridor Transit Delay > 20 mins OR Active Excavation / Breakdown',
      action: 'Calculate alternative approach route & transmit waypoints to driver telematics.',
      expectedPayoff: 'Recovers 20–35 mins of road delay. Prevents truck gridlock.',
      tag: 'Fleet Reroute',
      tagColor: 'bg-blue-100 text-blue-800',
    },
    {
      ruleId: 'RULE-MIT-02',
      name: 'Pre-Authorized Mathadi Pass',
      trigger: 'Mathadi Union Probability > 40% AND Bulky Cargo (>30 kg or Appliance/Sofa)',
      action: 'Generate instant ₹250–₹350 digital payment slip for driver to show at union gate.',
      expectedPayoff: 'Eliminates 25-min roadside arguments, vehicle impound risk, and cash shortages.',
      tag: 'Union Pre-Clearance',
      tagColor: 'bg-amber-100 text-amber-800',
    },
    {
      ruleId: 'RULE-MIT-03',
      name: 'Service Lift Pre-Coordination',
      trigger: 'Tower Floor > 6 AND Society Lift Maintenance / Blackout Window Active',
      action: 'Pre-book freight elevator window with society management OR assign 2nd helper.',
      expectedPayoff: 'Avoids staircase carry-up delays (saves 20–40 mins unloading time).',
      tag: 'Building Logistics',
      tagColor: 'bg-purple-100 text-purple-800',
    },
    {
      ruleId: 'RULE-MIT-04',
      name: 'Proactive Customer Reassurance',
      trigger: 'Risk Score elevated > 40 but ETA delay is under control (<30 mins)',
      action: 'Send SMS/WhatsApp reassurance with updated ETA without alarming user with internal friction.',
      expectedPayoff: 'Reduces WISMO ("Where is my order") support calls by 72%.',
      tag: 'Customer CSAT',
      tagColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      ruleId: 'RULE-MIT-05',
      name: 'Zero-Penalty Customer Reschedule',
      trigger: 'Critical corridor shutdown or severe constraint with unrecoverable delay > 60 mins',
      action: 'Offer customer 1-click slot rescheduling with guaranteed priority next morning.',
      expectedPayoff: 'Prevents failed first-attempt delivery & preserves customer trust.',
      tag: 'Slot Re-alignment',
      tagColor: 'bg-rose-100 text-rose-800',
    },
  ];

  const STRATEGIES = [
    {
      title: 'Dynamic Telematics Reroute',
      type: 'DYNAMIC_REROUTE',
      icon: Navigation,
      color: 'border-blue-200 bg-blue-50/50',
      description:
        'Calculates real-time micro-bypass routes around construction zones, metro digging, and bridge blockages using sub-arterial corridors.',
      whenUsed: 'Triggered when road congestion, excavation, or accidents add >20 minutes to standard transit time.',
      outcome: 'Transmits turn-by-turn navigation directly to driver app, saving 25–35 minutes.',
    },
    {
      title: 'Pre-Authorized Mathadi & Gate Pass',
      type: 'PREAUTH_FEE',
      icon: 'INR',
      color: 'border-amber-200 bg-amber-50/50',
      description:
        'Auto-issues verified digital payment vouchers for union handling charges and gated community commercial entry passes.',
      whenUsed: 'Triggered when society profile indicates Mathadi union presence or mandatory entry fee.',
      outcome: 'Driver presents digital QR pass at gate, clearing security in <4 minutes without cash disputes.',
    },
    {
      title: 'Elevator & Freight Slot Reservation',
      type: 'LIFT_SLOT_RESERVATION',
      icon: Building,
      color: 'border-purple-200 bg-purple-50/50',
      description:
        'Coordinates with society facility managers to reserve freight elevator access during designated maintenance windows.',
      whenUsed: 'Triggered for high-rise towers (floors 6+) with known lift restrictions or afternoon blackout periods.',
      outcome: 'Eliminates waiting time for service elevators, ensuring rapid doorstep transit.',
    },
    {
      title: 'Secondary Porter & Technician Dispatch',
      type: 'PORTER_DISPATCH',
      icon: Truck,
      color: 'border-indigo-200 bg-indigo-50/50',
      description:
        'Dispatches an additional field assistant or furniture assembly technician to assist with bulky multi-item unloads.',
      whenUsed: 'Triggered when order weight > 80kg or complex furniture installation is required in restricted societies.',
      outcome: 'Cuts unloading time from 60 mins to 25 mins, keeping downstream route deliveries on schedule.',
    },
  ];

  const runSimulation = async () => {
    setIsSimulating(true);
    setSimulationCompleted(false);

    for (let i = 1; i <= 4; i++) {
      setActiveStage(i);
      await new Promise((resolve) => setTimeout(resolve, 700));
    }

    if (order && onApplyMitigation && !order.recommendedAction.applied) {
      await onApplyMitigation(order.id);
    }

    setIsSimulating(false);
    setSimulationCompleted(true);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Mitigation Decision Engine &amp; Execution Logic</h2>
                <p className="text-xs text-slate-400">
                  How LogiSync predicts risks, chooses optimal interventions, and protects delivery promises.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 gap-2 overflow-x-auto text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('LIFECYCLE_DIFF')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'LIFECYCLE_DIFF'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>1. Real-Time Execution Diff</span>
          </button>

          <button
            onClick={() => setActiveTab('DECISION_RULES')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'DECISION_RULES'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4 text-violet-600" />
            <span>2. Rules &amp; Trigger Thresholds</span>
          </button>

          <button
            onClick={() => setActiveTab('STRATEGY_PLAYBOOK')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'STRATEGY_PLAYBOOK'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Boxes className="w-4 h-4 text-blue-600" />
            <span>3. Mitigation Playbook</span>
          </button>

          <button
            onClick={() => setActiveTab('UNIT_ECONOMICS')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'UNIT_ECONOMICS'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Scale className="w-4 h-4 text-emerald-600" />
            <span>4. Unit Economics &amp; ROI</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto text-sm">
          {/* TAB 1: Real-Time Execution Diff */}
          {activeTab === 'LIFECYCLE_DIFF' && (
            <div className="space-y-6 animate-fade-in">
              {/* Top Quick Summary: Before vs After State Diff */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    Live State Transformation (Before vs After Mitigation)
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Order {order?.id || 'RM-82931'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Metric 1: Risk Score */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                    <span className="text-slate-500 text-[11px] font-medium block">Risk Score</span>
                    <div className="flex items-center gap-2 font-bold">
                      <span className="text-rose-600 line-through">78 (HIGH)</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-emerald-600 text-sm">15 (LOW)</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold block">-63 risk pts recovered</span>
                  </div>

                  {/* Metric 2: Estimated Delay */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                    <span className="text-slate-500 text-[11px] font-medium block">Estimated Delay</span>
                    <div className="flex items-center gap-2 font-bold">
                      <span className="text-rose-600 line-through">+45 mins</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-emerald-600 text-sm">+12 mins</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold block">33 minutes saved</span>
                  </div>

                  {/* Metric 3: Confidence Tier */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                    <span className="text-slate-500 text-[11px] font-medium block">Delivery Confidence</span>
                    <div className="flex items-center gap-2 font-bold">
                      <span className="text-rose-600 line-through">52% (AT RISK)</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-emerald-600 text-sm">95% (HIGH)</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold block">Promise Protected</span>
                  </div>
                </div>
              </div>

              {/* 4 Pillars of Mitigation Execution */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                  The 4 Synchronized Mitigation Actions
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MITIGATION_PILLARS.map((pillar) => {
                    const Icon = typeof pillar.icon !== 'string' ? pillar.icon : null;
                    const isActive = activeStage === pillar.id;

                    return (
                      <div
                        key={pillar.id}
                        onClick={() => setActiveStage(pillar.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                          isActive
                            ? 'bg-indigo-50/70 border-indigo-400 shadow-xs ring-1 ring-indigo-400'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${pillar.color} font-bold text-xs flex items-center justify-center`}>
                              {Icon ? <Icon className="w-4 h-4" /> : <span>₹</span>}
                            </div>
                            <span className="font-bold text-slate-900 text-xs">{pillar.title}</span>
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${pillar.badgeColor}`}>
                            {pillar.subtitle}
                          </span>
                        </div>

                        <p className="text-slate-600 text-xs leading-relaxed">{pillar.whatHappens}</p>

                        <div className="pt-2 border-t border-slate-100/80 text-[11px] space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <span className="font-medium">Before:</span>
                            <span className="text-rose-700 font-medium">{pillar.stateChange.before}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                            <span className="text-emerald-600 font-bold">After:</span>
                            <span className="text-emerald-700">{pillar.stateChange.after}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Decision Rules & Trigger Thresholds */}
          {activeTab === 'DECISION_RULES' && (
            <div className="space-y-5 animate-fade-in">
              {/* Formula Card */}
              <div className="p-4 bg-violet-50 border border-violet-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-violet-900 font-bold text-xs uppercase tracking-wider">
                  <Brain className="w-4 h-4 text-violet-600" />
                  <span>LogiSync Multi-Factor Risk Scoring Formula</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-violet-100 font-mono text-xs text-violet-950 font-bold">
                  Risk Score = (0.35 × CorridorDelay) + (0.30 × MathadiProb) + (0.20 × LiftBlackout) + (0.15 × GateWait)
                </div>
                <p className="text-xs text-violet-800 leading-relaxed">
                  When the calculated Risk Score exceeds <b>40</b>, the engine immediately evaluates the underlying root causes to select the optimal mitigation action with the highest delay and cost recovery.
                </p>
              </div>

              {/* Rules List */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                  Automated Decision Rules &amp; Execution Triggers
                </h3>

                <div className="space-y-2.5">
                  {DECISION_RULES.map((rule) => (
                    <div
                      key={rule.ruleId}
                      className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 hover:border-slate-300 transition-colors shadow-2xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                            {rule.ruleId}
                          </span>
                          <span className="font-bold text-slate-900 text-xs">{rule.name}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rule.tagColor}`}>
                          {rule.tag}
                        </span>
                      </div>

                      <div className="text-xs space-y-1 pt-1">
                        <div className="flex items-start gap-1.5 text-slate-600">
                          <span className="font-bold text-slate-700 min-w-[70px]">IF Trigger:</span>
                          <span className="font-medium text-slate-900">{rule.trigger}</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-indigo-700">
                          <span className="font-bold min-w-[70px]">THEN Action:</span>
                          <span>{rule.action}</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-emerald-700">
                          <span className="font-bold min-w-[70px]">PAYOFF:</span>
                          <span className="font-semibold">{rule.expectedPayoff}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Mitigation Playbook */}
          {activeTab === 'STRATEGY_PLAYBOOK' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-1">
                <h3 className="font-bold text-blue-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Boxes className="w-4 h-4 text-blue-600" />
                  <span>Standard Operating Mitigation Playbook</span>
                </h3>
                <p className="text-xs text-blue-800">
                  Each urban constraint pattern maps to a targeted operational workflow engineered to prevent delivery abandonment.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {STRATEGIES.map((strat) => {
                  const Icon = typeof strat.icon !== 'string' ? strat.icon : null;
                  return (
                    <div
                      key={strat.type}
                      className={`p-4 rounded-2xl border ${strat.color} space-y-2.5 shadow-2xs`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-white text-slate-900 shadow-2xs font-bold text-xs flex items-center justify-center">
                          {Icon ? <Icon className="w-4 h-4 text-indigo-600" /> : <span className="text-amber-700">₹</span>}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">{strat.title}</span>
                          <span className="text-[10px] font-mono text-slate-500">{strat.type}</span>
                        </div>
                      </div>

                      <p className="text-slate-600 text-xs leading-relaxed">{strat.description}</p>

                      <div className="space-y-1 pt-1.5 border-t border-slate-200/60 text-[11px]">
                        <div>
                          <span className="font-bold text-slate-700">When Triggered: </span>
                          <span className="text-slate-600">{strat.whenUsed}</span>
                        </div>
                        <div>
                          <span className="font-bold text-emerald-700">Operational Outcome: </span>
                          <span className="text-emerald-800 font-medium">{strat.outcome}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: Unit Economics & ROI */}
          {activeTab === 'UNIT_ECONOMICS' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  <span>Why Mitigation Pays for Itself (Unit Economics)</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Failing to mitigate an active delivery risk leads to severe cascading losses: vehicle impound, driver overtime, aborted attempts, customer cancellations, and repeat dispatches.
                </p>
              </div>

              {/* Economic Comparison Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Financial Component</th>
                      <th className="py-2.5 px-3">Unmitigated Delivery Failure</th>
                      <th className="py-2.5 px-3">With LogiSync Proactive Mitigation</th>
                      <th className="py-2.5 px-4 text-right">Net Savings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-900">Mitigation Investment Cost</td>
                      <td className="py-3 px-3 text-slate-500">₹0 (No action taken)</td>
                      <td className="py-3 px-3 font-semibold text-amber-700">₹350 (Pre-auth gate pass)</td>
                      <td className="py-3 px-4 text-right text-slate-500">-₹350</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-900">Aborted Trip Re-Attempt Cost</td>
                      <td className="py-3 px-3 text-rose-700 font-bold">₹850 (Second vehicle dispatch)</td>
                      <td className="py-3 px-3 text-emerald-700 font-semibold">₹0 (100% First-attempt success)</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700">+₹850</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-900">Driver Overtime &amp; Delay Loss</td>
                      <td className="py-3 px-3 text-rose-700 font-bold">₹420 (60 min gate argument)</td>
                      <td className="py-3 px-3 text-emerald-700 font-semibold">₹0 (Cleared in 4 mins)</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700">+₹420</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-900">WISMO Customer Support Inquiries</td>
                      <td className="py-3 px-3 text-rose-700 font-bold">₹150 (3 escalations)</td>
                      <td className="py-3 px-3 text-emerald-700 font-semibold">₹0 (Proactive reassurance)</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700">+₹150</td>
                    </tr>
                    <tr className="bg-emerald-50/50 font-bold">
                      <td className="py-3 px-4 text-emerald-950">Total Net Cost per Disrupted Order</td>
                      <td className="py-3 px-3 text-rose-700">₹1,420 Lost per Order</td>
                      <td className="py-3 px-3 text-emerald-800">₹350 Total Cost</td>
                      <td className="py-3 px-4 text-right text-emerald-700 text-sm font-black">+₹1,070 Saved (75% ROI)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              {isSimulating ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing 4-Stage Mitigation...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Simulate Real-Time Mitigation</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
