import React, { useState } from 'react';
import {
  Layers,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Zap,
  Calculator,
  Award,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Smile,
  Frown,
  Check,
  X,
} from 'lucide-react';
import { ExperimentMetrics } from '../types';
import { CityId, SUPPORTED_CITIES } from '../data/multiCityData';

interface ExperimentControlVsPilotProps {
  metrics: ExperimentMetrics | null;
  activeCity?: CityId;
}

const DEFAULT_METRICS: ExperimentMetrics = {
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

export const ExperimentControlVsPilot: React.FC<ExperimentControlVsPilotProps> = ({
  metrics: propMetrics,
  activeCity = 'PUNE',
}) => {
  const [monthlyDeliveries, setMonthlyDeliveries] = useState<number>(30000);
  const [avgFailedCost, setAvgFailedCost] = useState<number>(850);
  const [viewMode, setViewMode] = useState<'SIMPLE' | 'DETAILED'>('SIMPLE');

  const currentCityConfig = SUPPORTED_CITIES[activeCity] || SUPPORTED_CITIES.PUNE;
  const corridorSample = currentCityConfig.localities.slice(0, 3).join(', ');

  const metrics = propMetrics?.control && propMetrics?.pilot ? propMetrics : DEFAULT_METRICS;
  const control = metrics.control;
  const pilot = metrics.pilot;

  // ROI Calculator Math
  const controlFailRate = 100 - (control.firstAttemptSuccessRate || 78.4);
  const pilotFailRate = 100 - (pilot.firstAttemptSuccessRate || 94.2);
  const controlFailures = (monthlyDeliveries * controlFailRate) / 100;
  const pilotFailures = (monthlyDeliveries * pilotFailRate) / 100;
  const savedDeliveriesMonthly = Math.max(0, Math.round(controlFailures - pilotFailures));
  const monthlyCostSavings = savedDeliveriesMonthly * avgFailedCost;
  const annualSavingsInr = monthlyCostSavings * 12;

  const onTimeDelta = ((pilot.promiseAccuracyRate || 92.4) - (control.promiseAccuracyRate || 72.1)).toFixed(1);
  const firstAttemptDelta = ((pilot.firstAttemptSuccessRate || 94.2) - (control.firstAttemptSuccessRate || 78.4)).toFixed(1);
  const delayDelta = ((control.avgDelayMinutes || 46.2) - (pilot.avgDelayMinutes || 13.8)).toFixed(1);
  const costReductionPct = Math.round(
    (((control.unexpectedLogisticsCostPerOrder || 284) - (pilot.unexpectedLogisticsCostPerOrder || 62)) /
      (control.unexpectedLogisticsCostPerOrder || 284)) *
      100
  );
  const csatDelta = ((pilot.customerCsatScore || 4.65) - (control.customerCsatScore || 3.7)).toFixed(2);
  const inquiryReductionPct = Math.round(
    (((control.customerDeliveryInquiriesRate || 34.8) - (pilot.customerDeliveryInquiriesRate || 9.6)) /
      (control.customerDeliveryInquiriesRate || 34.8)) *
      100
  );
  const costPerDeliverySavings = (control.costPerSuccessfulDelivery || 1420) - (pilot.costPerSuccessfulDelivery || 1110);

  const SIMPLE_CARDS = [
    {
      title: 'Successful Deliveries on 1st Try',
      controlVal: `${control.firstAttemptSuccessRate}%`,
      pilotVal: `${pilot.firstAttemptSuccessRate}%`,
      gain: `+${firstAttemptDelta}% More`,
      explanation: 'In the Old Way, 1 in 5 trucks had to turn back due to gate/lift issues. In the LogiSync Way, 94 out of 100 succeed on the very first try.',
      icon: CheckCircle2,
      color: 'emerald',
    },
    {
      title: 'Average Transit Delay',
      controlVal: `${control.avgDelayMinutes} mins`,
      pilotVal: `${pilot.avgDelayMinutes} mins`,
      gain: `${delayDelta} mins Faster`,
      explanation: 'Because drivers get instant bypass routes around roadwork and pre-approved gate passes, average delay drops to just 14 mins.',
      icon: Clock,
      color: 'blue',
    },
    {
      title: 'Cost per Delivery',
      controlVal: `₹${control.costPerSuccessfulDelivery}`,
      pilotVal: `₹${pilot.costPerSuccessfulDelivery}`,
      gain: `Save ₹${costPerDeliverySavings} / order`,
      explanation: 'Eliminating second-day re-attempts and driver overtime cuts overall fulfillment expense by over ₹300 per furniture order.',
      icon: 'INR',
      color: 'amber',
    },
    {
      title: 'Customer Satisfaction (CSAT)',
      controlVal: `${control.customerCsatScore} / 5`,
      pilotVal: `${pilot.customerCsatScore} / 5`,
      gain: `+${csatDelta} Rating Boost`,
      explanation: 'Customers get accurate live tracking and arrive home to on-time furniture without support headache.',
      icon: Smile,
      color: 'indigo',
    },
  ];

  const METRIC_ROWS = [
    {
      label: 'On-Time SLA Delivery Rate',
      control: `${control.promiseAccuracyRate}%`,
      pilot: `${pilot.promiseAccuracyRate}%`,
      delta: `+${onTimeDelta}%`,
      positive: true,
      subtext: 'Orders delivered strictly within promised customer window',
    },
    {
      label: 'First-Attempt Success Rate',
      control: `${control.firstAttemptSuccessRate}%`,
      pilot: `${pilot.firstAttemptSuccessRate}%`,
      delta: `+${firstAttemptDelta}%`,
      positive: true,
      subtext: 'Eliminated aborted dispatches from gated society blockages',
    },
    {
      label: 'Avg Delay on Disrupted Orders',
      control: `+${control.avgDelayMinutes} mins`,
      pilot: `+${pilot.avgDelayMinutes} mins`,
      delta: `-${delayDelta} mins`,
      positive: true,
      subtext: 'Micro-routing & proactive gate pre-clearance',
    },
    {
      label: 'Unexpected Logistics Cost per Order',
      control: `₹${control.unexpectedLogisticsCostPerOrder}`,
      pilot: `₹${pilot.unexpectedLogisticsCostPerOrder}`,
      delta: `-${costReductionPct}%`,
      positive: true,
      subtext: 'Pre-authorized Mathadi union & society entry fee predictability',
    },
    {
      label: 'Cost per Successful Delivery',
      control: `₹${control.costPerSuccessfulDelivery}`,
      pilot: `₹${pilot.costPerSuccessfulDelivery}`,
      delta: `-₹${costPerDeliverySavings}`,
      positive: true,
      subtext: 'Fuel, overtime & re-attempt logistics cost reduction',
    },
    {
      label: 'Customer CSAT Score',
      control: `${control.customerCsatScore}/5.0`,
      pilot: `${pilot.customerCsatScore}/5.0`,
      delta: `+${csatDelta} pts`,
      positive: true,
      subtext: 'Real-time Delivery Confidence tracking & frictionless arrival',
    },
    {
      label: 'WISMO Support Call Inquiries',
      control: `${control.customerDeliveryInquiriesRate}%`,
      pilot: `${pilot.customerDeliveryInquiriesRate}%`,
      delta: `-${inquiryReductionPct}%`,
      positive: true,
      subtext: '"Where is my order" support volume dropped significantly',
    },
    {
      label: 'Reverse Logistics / Pickup SLA',
      control: `${control.pickupSlaAdherence}%`,
      pilot: `${pilot.pickupSlaAdherence}%`,
      delta: `+${((pilot.pickupSlaAdherence || 95.1) - (control.pickupSlaAdherence || 76.5)).toFixed(1)}%`,
      positive: true,
      subtext: 'Furniture/appliance returns processed on first slot',
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 text-sm">
      {/* Beginner Friendly "What is this?" Explainer Box */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-3xl p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-sm">
              In Simple Terms: What is this comparison?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Think of this as a <b>"Side-by-Side Test"</b>. We took <b>1,020 real deliveries</b> in {currentCityConfig.name} and divided them into two equal teams:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <div className="bg-white/90 border border-slate-200 rounded-xl p-3 flex items-start gap-2 text-xs">
                <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  A
                </div>
                <div>
                  <span className="font-bold text-slate-800">Team A (The Old Way):</span> Standard GPS and normal dispatch. Drivers faced gate arguments, road jams, and lift delays with no help.
                </div>
              </div>
              <div className="bg-white/90 border border-indigo-200 rounded-xl p-3 flex items-start gap-2 text-xs">
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  B
                </div>
                <div>
                  <span className="font-bold text-indigo-900">Team B (LogiSync Smart Way):</span> Equipped with instant bypass routes, pre-approved gate passes (₹250), and proactive customer updates.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header Banner & Mode Switcher */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Side-by-Side Trial Results</h2>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] px-2 py-0.5 rounded-full font-bold">
                  Proven Winner: LogiSync Smart Way
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Data from {currentCityConfig.name} ({corridorSample} Corridors)
              </p>
            </div>
          </div>

          {/* Toggle between Simple & Detailed View */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('SIMPLE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'SIMPLE'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Simple Cards
            </button>
            <button
              onClick={() => setViewMode('DETAILED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'DETAILED'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Data Table
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: SIMPLE CARDS */}
      {viewMode === 'SIMPLE' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SIMPLE_CARDS.map((card, i) => {
            const Icon = typeof card.icon !== 'string' ? card.icon : null;
            return (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                      {Icon ? <Icon className="w-4 h-4" /> : <span>₹</span>}
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{card.title}</h4>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-extrabold shrink-0">
                    {card.gain}
                  </span>
                </div>

                {/* Old vs New Comparison Bar */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                  <div className="border-r border-slate-200 pr-2">
                    <div className="text-[10px] font-bold uppercase text-slate-400">The Old Way</div>
                    <div className="text-base font-bold text-slate-600">{card.controlVal}</div>
                  </div>
                  <div className="pl-2">
                    <div className="text-[10px] font-bold uppercase text-indigo-600">LogiSync Smart Way</div>
                    <div className="text-base font-extrabold text-indigo-900">{card.pilotVal}</div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">{card.explanation}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: FULL DATA TABLE */}
      {viewMode === 'DETAILED' && (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Full Logistics KPI Comparison</h3>
            <span className="text-xs text-slate-500 font-medium">{currentCityConfig.name} Cohort (510 Orders Each)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-100/80 text-xs font-bold uppercase text-slate-500 border-b border-slate-200 tracking-wider">
                <tr>
                  <th className="py-3 px-5">Operational KPI</th>
                  <th className="py-3 px-5 text-slate-600">Old Way (Group A)</th>
                  <th className="py-3 px-5 text-indigo-700">LogiSync Way (Group B)</th>
                  <th className="py-3 px-5 text-right text-emerald-700">Measured Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {METRIC_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900">{row.label}</div>
                      <div className="text-xs text-slate-500">{row.subtext}</div>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-600">{row.control}</td>
                    <td className="py-3.5 px-5 font-bold text-indigo-900 bg-indigo-50/30">{row.pilot}</td>
                    <td className="py-3.5 px-5 text-right font-bold text-emerald-700">
                      <span className="bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-full text-xs font-bold shadow-2xs">
                        {row.delta}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Visual Summary: 3 Big Takeaways */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-emerald-900 block text-sm">Fewer Failed Deliveries</span>
            <span className="text-emerald-800">16% fewer trucks turned away at society gates or stuck in traffic.</span>
          </div>
        </div>

        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex items-start gap-2.5">
          <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-blue-900 block text-sm">32 Minutes Saved</span>
            <span className="text-blue-800">Faster arrival time per truck by dodging road excavations and lift queues.</span>
          </div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
            ₹
          </div>
          <div>
            <span className="font-bold text-amber-900 block text-sm">Save ₹310 Per Order</span>
            <span className="text-amber-800">Spending ₹250 on a gate pass avoids an ₹850 failed trip tomorrow.</span>
          </div>
        </div>
      </div>

      {/* Business ROI Calculator */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Calculator className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="font-bold text-slate-900 text-base">Estimated Savings for Your City</h3>
            <p className="text-xs text-slate-500">Calculate how much money you save by preventing failed deliveries</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Monthly Orders in City</label>
            <input
              type="number"
              value={monthlyDeliveries}
              onChange={(e) => setMonthlyDeliveries(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Cost when a Delivery Fails (₹)</label>
            <input
              type="number"
              value={avgFailedCost}
              onChange={(e) => setAvgFailedCost(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
            <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider block">
              Projected Annual Savings
            </span>
            <div className="text-2xl font-black text-emerald-700">
              ₹{(annualSavingsInr / 100000).toFixed(1)} Lakhs
            </div>
            <div className="text-xs text-emerald-800">
              Prevents ~{savedDeliveriesMonthly * 12} wasted trips/year
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
