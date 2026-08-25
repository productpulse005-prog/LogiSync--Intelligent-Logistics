import React, { useState } from 'react';
import {
  PlayCircle,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ShieldCheck,
  Brain,
  Truck,
  Building,
  UserCheck,
  Sparkles,
  HelpCircle,
  Navigation,
  Info,
} from 'lucide-react';
import { Order, SocietyProfile, LogisticsConstraint } from '../types';
import { MitigationLifecycleModal } from './MitigationLifecycleModal';
import { CustomerMessageModal } from './CustomerMessageModal';
import { formatDeliverySchedule } from '../utils/dateScheduleUtils';

interface InteractiveDemoRunnerProps {
  orders: Order[];
  societies: SocietyProfile[];
  constraints: LogisticsConstraint[];
  onTriggerDisruption: () => Promise<void>;
  onApplyMitigation: (orderId: string) => Promise<void>;
  onCompleteDelivery: (orderId: string, actuals: any) => Promise<void>;
  onResetDemo: () => Promise<void>;
  onViewOrder: (order: Order) => void;
  onNavigateToTab: (tab: any) => void;
}

export const InteractiveDemoRunner: React.FC<InteractiveDemoRunnerProps> = ({
  orders,
  societies,
  constraints,
  onTriggerDisruption,
  onApplyMitigation,
  onCompleteDelivery,
  onResetDemo,
  onViewOrder,
  onNavigateToTab,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isRunningAction, setIsRunningAction] = useState<boolean>(false);
  const [isMitigationModalOpen, setIsMitigationModalOpen] = useState<boolean>(false);
  const [isCustomerMessageOpen, setIsCustomerMessageOpen] = useState<boolean>(false);

  const showcaseOrder = orders.find((o) => o.id === 'RM-82931') || orders[0];
  const showcaseSociety = societies.find((s) => s.id === 'SOC-001') || societies[0];

  const handleStepAction = async (step: number) => {
    setIsRunningAction(true);
    try {
      if (step === 2) {
        // Trigger Disruption Event
        await onTriggerDisruption();
        setCurrentStep(2);
      } else if (step === 3) {
        // Risk re-score review
        setCurrentStep(3);
      } else if (step === 4) {
        // Apply Mitigation
        await onApplyMitigation(showcaseOrder.id);
        setCurrentStep(4);
      } else if (step === 5) {
        // Customer View review
        setCurrentStep(5);
      } else if (step === 6) {
        // Complete delivery & train learning loop
        await onCompleteDelivery(showcaseOrder.id, {
          actualDelayMinutes: 12,
          actualCost: 350,
          actualMathadi: 350,
          actualSocietyFee: 0,
          actualUnloadingMinutes: 28,
          driverFeedback: 'Alternate bypass via Marunji was clear. Mathadi voucher cleared gate in 4 mins.',
        });
        setCurrentStep(6);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunningAction(false);
    }
  };

  const handleResetAll = async () => {
    setIsRunningAction(true);
    try {
      await onResetDemo();
      setCurrentStep(1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunningAction(false);
    }
  };

  const DEMO_STEPS = [
    {
      step: 1,
      title: 'Baseline State (Standard Schedule)',
      badge: 'Order RM-82931',
      desc: 'Showcase Order RM-82931 for Ananya Sharma at Megapolis Mystic, Hinjewadi Phase 3. Initial state is scheduled on-time with 92% confidence.',
      statusLabel: 'Low Risk • 92% Confidence',
      actionLabel: '1. Inject Real-World Urban Disruption',
      icon: Truck,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      step: 2,
      title: 'Real-World Disruption Injected',
      badge: 'Ground-Truth Event',
      desc: 'Metro Line 3 emergency excavation detected on Phase 1 bridge + Mathadi union handling demanded at Gate 2 + Service lift blackout window.',
      statusLabel: 'Hazard Active on Corridor',
      actionLabel: '2. Review Automated Recalculation',
      icon: AlertTriangle,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    },
    {
      step: 3,
      title: 'Automated Recalculation & Risk Re-scoring',
      badge: 'Intelligence Layer',
      desc: 'System detects disruption: Risk spikes to 76 (HIGH), Customer Confidence drops to 58%, and ETA delays by +45 minutes.',
      statusLabel: 'Risk Score: 76/100 • Delay: +45m',
      actionLabel: '3. Apply Proactive AI Mitigation',
      icon: Zap,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      step: 4,
      title: 'Proactive AI Mitigation Applied',
      badge: 'Action Applied',
      desc: 'System executes 4 synchronized mitigations: Dynamic Marunji bypass reroute + ₹350 pre-authorized Mathadi token + Reassuring customer notice. Delay drops from +45m to +12m.',
      statusLabel: 'Delay Saved: 33m • Risk Restored',
      actionLabel: '4. Inspect Customer Delivery Confidence View',
      icon: ShieldCheck,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      step: 5,
      title: 'Customer-Facing Delivery Confidence',
      badge: 'Transparent Status',
      desc: 'Customer receives clear, reassuring status update. Internal union friction and vendor disputes are suppressed to protect brand trust.',
      statusLabel: 'Customer Trust Protected',
      actionLabel: '5. Complete Delivery & Train Network',
      icon: UserCheck,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      step: 6,
      title: 'Continuous Closed-Loop Learning',
      badge: 'Network Learned',
      desc: 'Ground-truth execution logged. The system auto-calibrates future Mathadi probability and unloading benchmarks for Megapolis Mystic.',
      statusLabel: 'Society Baseline Permanently Updated',
      actionLabel: 'Demo Complete • Restart Flow',
      icon: Brain,
      color: 'text-violet-600 bg-violet-50 border-violet-200',
    },
  ];

  const activeStepData = DEMO_STEPS[currentStep - 1] || DEMO_STEPS[0];
  const StepIcon = activeStepData.icon;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
              <PlayCircle className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Interactive Guided Showcase Flow</h2>
                <span className="bg-amber-100 text-amber-900 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  Step {currentStep} of 6
                </span>
              </div>
              <p className="text-sm text-slate-500">
                Walk through Order <b>RM-82931</b> (Ananya Sharma, Megapolis Mystic, Hinjewadi) from urban disruption to AI mitigation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMitigationModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-indigo-200"
            >
              <Info className="w-3.5 h-3.5" />
              <span>What Happens in Mitigation?</span>
            </button>

            <button
              onClick={handleResetAll}
              disabled={isRunningAction}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRunningAction ? 'animate-spin' : ''}`} />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2 border-t border-slate-100">
          {DEMO_STEPS.map((s) => (
            <button
              key={s.step}
              onClick={() => handleStepAction(s.step)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                currentStep === s.step
                  ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold ring-1 ring-amber-400'
                  : currentStep > s.step
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <div className="text-[11px] uppercase font-bold">Step {s.step}</div>
              <div className="truncate text-xs mt-0.5">{s.badge}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Showcase Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step Detail Card (Left 2 cols) */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className={`p-2.5 rounded-xl border ${activeStepData.color}`}>
                <StepIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{activeStepData.title}</h3>
                <span className="text-xs text-slate-500">{activeStepData.badge}</span>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {activeStepData.statusLabel}
            </span>
          </div>

          <p className="text-slate-700 text-sm leading-relaxed">
            {activeStepData.desc}
          </p>

          {/* Showcase Order Status Grid */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-sm flex-wrap gap-2">
              <div>
                <span className="font-bold text-slate-900 font-mono block">
                  {showcaseOrder.id} • {showcaseOrder.customerName}
                </span>
                <span className="text-xs text-indigo-700 font-semibold flex items-center gap-1 mt-0.5">
                  <span>📅 {formatDeliverySchedule(showcaseOrder.deliveryDate, showcaseOrder.deliveryWindow).fullScheduleLabel}</span>
                  {showcaseOrder.status === 'RESCHEDULED' && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                      Rescheduled
                    </span>
                  )}
                </span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  showcaseOrder.riskLevel === 'HIGH' || showcaseOrder.riskLevel === 'CRITICAL'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {showcaseOrder.riskScore}/100 Risk • {showcaseOrder.confidenceScore}% Confidence
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Expected Arrival</span>
                <span className="font-bold text-slate-900 text-sm">{showcaseOrder.expectedEta}</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Estimated Delay</span>
                <span className="font-bold text-amber-700 text-sm">+{showcaseOrder.estimatedDelayMinutes} min</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Unforeseen Cost</span>
                <span className="font-bold text-slate-900 text-sm">₹{showcaseOrder.estimatedAdditionalCost}</span>
              </div>
            </div>

            {/* In-depth Step 4 Mitigation Breakdown */}
            {currentStep >= 4 && (
              <div className="mt-3 p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-2xl space-y-2.5 text-xs text-indigo-950">
                <div className="flex items-center justify-between font-bold text-indigo-900">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>How Mitigation Rescued This Delivery:</span>
                  </span>
                  <button
                    onClick={() => setIsMitigationModalOpen(true)}
                    className="text-[11px] text-indigo-700 underline font-semibold cursor-pointer"
                  >
                    View 4-Pillar Architecture &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-white rounded-xl border border-indigo-100 space-y-0.5">
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-blue-600" />
                      1. Dynamic Fleet Bypass
                    </span>
                    <p className="text-slate-600">Rerouted via Marunji Ring Bypass to evade bridge block (-33 mins delay).</p>
                  </div>

                  <div className="p-2 bg-white rounded-xl border border-indigo-100 space-y-0.5">
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black flex items-center justify-center">₹</span>
                      2. Pre-Authorized Voucher
                    </span>
                    <p className="text-slate-600">Digital ₹350 token pre-cleared Gate 2 Mathadi union without vehicle standoff.</p>
                  </div>

                  <div className="p-2 bg-white rounded-xl border border-indigo-100 space-y-0.5">
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-emerald-600" />
                      3. Customer Reassured
                    </span>
                    <p className="text-slate-600">Proactive ETA notice sent; internal union tension suppressed to protect brand trust.</p>
                  </div>

                  <div className="p-2 bg-white rounded-xl border border-indigo-100 space-y-0.5">
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Brain className="w-3 h-3 text-violet-600" />
                      4. Continuous Calibration
                    </span>
                    <p className="text-slate-600">Actual 28 min unloading duration updates society profile permanently.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <div className="flex flex-col sm:flex-row gap-3">
              {currentStep < 6 ? (
                <button
                  onClick={() => handleStepAction(currentStep + 1)}
                  disabled={isRunningAction}
                  className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>{isRunningAction ? 'Processing...' : activeStepData.actionLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleResetAll}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Demo Complete • Restart Flow</span>
                </button>
              )}

              <button
                onClick={() => setIsCustomerMessageOpen(true)}
                className="py-3 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Preview Customer Phone Intimation</span>
              </button>

              <button
                onClick={() => {
                  onViewOrder(showcaseOrder);
                  onNavigateToTab('DELIVERIES');
                }}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
              >
                Inspect in Tower
              </button>
            </div>
          </div>
        </div>

        {/* Destination Society Intelligence (Right col) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs text-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900">Destination Society Memory</h3>
          </div>

          <div className="space-y-3">
            <div>
              <div className="font-bold text-slate-900 text-base">{showcaseSociety.name}</div>
              <div className="text-xs text-slate-500">{showcaseSociety.address}</div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Mathadi Probability:</span>
                <span className="font-bold text-slate-800">{showcaseSociety.mathadiProbability}%</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Typical Mathadi Charge:</span>
                <span className="font-bold text-slate-800">₹{showcaseSociety.typicalMathadiCharge}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Unloading Benchmark:</span>
                <span className="font-bold text-slate-800">{showcaseSociety.typicalUnloadingMinutes} mins</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Completed Deliveries:</span>
                <span className="font-bold text-emerald-600">{showcaseSociety.totalDeliveriesCompleted}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
              <span className="text-slate-700 font-semibold uppercase text-[11px] block">
                Lift Restriction Window:
              </span>
              <p className="text-slate-600">{showcaseSociety.liftRestrictions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mitigation Lifecycle Modal */}
      <MitigationLifecycleModal
        isOpen={isMitigationModalOpen}
        onClose={() => setIsMitigationModalOpen(false)}
        order={showcaseOrder}
        onApplyMitigation={onApplyMitigation}
      />

      {/* Customer Notification Preview Modal */}
      <CustomerMessageModal
        isOpen={isCustomerMessageOpen}
        onClose={() => setIsCustomerMessageOpen(false)}
        order={showcaseOrder}
      />
    </div>
  );
};
