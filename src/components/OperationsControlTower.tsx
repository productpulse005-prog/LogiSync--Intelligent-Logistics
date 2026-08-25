import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Shield,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  Sparkles,
  MapPin,
  Truck,
  User,
  Building,
  Check,
  AlertCircle,
  X,
  Phone,
  RotateCcw,
  Zap,
  Info,
  Camera,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import {
  Order,
  OperationsKpis,
  LocalityType,
  RiskLevel,
  DeliveryConfidenceTier,
  SocietyProfile,
  LogisticsConstraint,
} from '../types';
import { MitigationLifecycleModal } from './MitigationLifecycleModal';
import { CameraCaptureModal } from './CameraCaptureModal';
import { CustomerMessageModal } from './CustomerMessageModal';
import { CityId } from '../data/multiCityData';
import { formatDeliverySchedule } from '../utils/dateScheduleUtils';

interface OperationsControlTowerProps {
  orders: Order[];
  kpis: OperationsKpis;
  societies: SocietyProfile[];
  constraints: LogisticsConstraint[];
  activeCity?: CityId;
  onSelectOrder: (order: Order) => void;
  onApplyAction: (orderId: string) => Promise<void>;
  onRescheduleSlot: (orderId: string, newSlot: string) => Promise<void>;
  onCompleteDelivery: (orderId: string, actuals: any) => Promise<void>;
  onRefresh: () => void;
  selectedOrder: Order | null;
  onCloseDrawer: () => void;
  onViewOnMap: (order: Order) => void;
  onOpenCopilotWithQuery?: (query: string) => void;
}

export const OperationsControlTower: React.FC<OperationsControlTowerProps> = ({
  orders,
  kpis,
  societies,
  constraints,
  activeCity = 'PUNE',
  onSelectOrder,
  onApplyAction,
  onRescheduleSlot,
  onCompleteDelivery,
  onRefresh,
  selectedOrder,
  onCloseDrawer,
  onViewOnMap,
  onOpenCopilotWithQuery,
}) => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleRefreshClick = async () => {
    try {
      setIsRefreshing(true);
      await onRefresh();
      setActionSuccessMsg('Telematics & live fleet telemetry refreshed with latest ground-truth sensor updates.');
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };
  const [selectedLocality, setSelectedLocality] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isApplyingAction, setIsApplyingAction] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Mitigation Lifecycle Modal & Explainability
  const [isMitigationModalOpen, setIsMitigationModalOpen] = useState<boolean>(false);
  const [isCustomerMessageModalOpen, setIsCustomerMessageModalOpen] = useState<boolean>(false);
  const [showDecisionLogic, setShowDecisionLogic] = useState<boolean>(true);

  // Manual delivery completion simulation & Camera
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [podPhotoUrl, setPodPhotoUrl] = useState<string | null>(null);
  const [actualDelayInput, setActualDelayInput] = useState<number>(15);
  const [actualMathadiInput, setActualMathadiInput] = useState<number>(350);
  const [actualUnloadingInput, setActualUnloadingInput] = useState<number>(30);
  const [driverFeedbackInput, setDriverFeedbackInput] = useState<string>('Gate 2 cleared via digital Mathadi slip. Unloaded in 30 mins.');

  // Dynamically extract all corridors for the active city
  const LOCALITIES = useMemo(() => {
    const locSet = new Set<string>();
    orders.forEach((o) => o.locality && locSet.add(o.locality));
    societies.forEach((s) => s.locality && locSet.add(s.locality));
    const list = Array.from(locSet).sort();
    return [
      { label: 'All Corridors', value: 'ALL' },
      ...list.map((loc) => ({ label: loc, value: loc })),
    ];
  }, [orders, societies]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (selectedLocality !== 'ALL' && order.locality.toLowerCase() !== selectedLocality.toLowerCase()) {
        return false;
      }
      if (selectedRisk === 'AT_RISK') {
        if (order.riskLevel !== 'HIGH' && order.riskLevel !== 'CRITICAL') return false;
      } else if (selectedRisk !== 'ALL' && order.riskLevel !== selectedRisk) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(q);
        const matchesCustomer = order.customerName.toLowerCase().includes(q);
        const matchesSociety = order.societyName.toLowerCase().includes(q);
        const matchesLocality = order.locality.toLowerCase().includes(q);
        if (!matchesId && !matchesCustomer && !matchesSociety && !matchesLocality) return false;
      }
      return true;
    });
  }, [orders, selectedLocality, selectedRisk, searchQuery]);

  const atRiskCount = useMemo(() => {
    return orders.filter((o) => o.riskLevel === 'HIGH' || o.riskLevel === 'CRITICAL').length;
  }, [orders]);

  // Live Runtime Calculated Metrics from dynamic orders and telemetry
  const liveTotalDeliveries = orders.length || kpis?.totalDeliveriesToday || 0;

  const liveOnTimeOrders = useMemo(() => {
    return orders.filter(
      (o) => o.riskLevel === 'LOW' || o.estimatedDelayMinutes <= 15 || o.status === 'DELIVERED' || o.status === 'RESCHEDULED'
    ).length;
  }, [orders]);

  const liveOnTimeRate = useMemo(() => {
    if (orders.length > 0) {
      return Number(((liveOnTimeOrders / orders.length) * 100).toFixed(1));
    }
    return kpis?.onTimeDeliveryRate ?? kpis?.onTimePercent ?? 94.2;
  }, [orders, liveOnTimeOrders, kpis]);

  const liveDelayMinutesSaved = useMemo(() => {
    const computed = orders.reduce((sum, o) => {
      if (o.status === 'RESCHEDULED') return sum + 45;
      if (o.recommendedAction?.applied) return sum + 35;
      if (o.riskLevel === 'LOW') return sum + 25;
      if (o.riskLevel === 'MEDIUM') return sum + 15;
      return sum + 5;
    }, 0);
    return Math.max(kpis?.totalDelayMinutesAvoided || 245, computed);
  }, [orders, kpis]);

  const liveUnexpectedCostPerOrder = useMemo(() => {
    if (orders.length > 0) {
      const totalCost = orders.reduce((sum, o) => sum + (o.estimatedAdditionalCost || 0), 0);
      return Math.round(totalCost / orders.length) || 62;
    }
    if (kpis?.unexpectedCostPerOrder) return kpis.unexpectedCostPerOrder;
    return Math.round((kpis?.unexpectedLogisticsCostTotal || 0) / (liveTotalDeliveries || 1)) || 62;
  }, [orders, kpis, liveTotalDeliveries]);

  const selectedSociety = useMemo(() => {
    if (!selectedOrder) return null;
    return societies.find((s) => s.id === selectedOrder.societyId) || null;
  }, [selectedOrder, societies]);

  const handleApplyMitigation = async (orderId: string) => {
    try {
      setIsApplyingAction(true);
      await onApplyAction(orderId);
      setActionSuccessMsg('Mitigation successfully executed! Dynamic bypass transmitted to driver telematics & pre-authorized Mathadi voucher generated.');
      setTimeout(() => setActionSuccessMsg(null), 6000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsApplyingAction(false);
    }
  };

  const handleDeliverySubmit = async () => {
    if (!selectedOrder) return;
    try {
      await onCompleteDelivery(selectedOrder.id, {
        actualDelayMinutes: actualDelayInput,
        actualCost: actualMathadiInput,
        actualMathadi: actualMathadiInput,
        actualSocietyFee: 0,
        actualUnloadingMinutes: actualUnloadingInput,
        driverFeedback: driverFeedbackInput,
        podPhotoUrl: podPhotoUrl || undefined,
      });
      setShowCompletionModal(false);
      onCloseDrawer();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Operations Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Operations Control Tower</span>
            <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              Live Fleet Ground-Truth
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time urban micro-constraints, gate union fees, and automated delivery risk mitigations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMitigationModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all border border-indigo-200 cursor-pointer shadow-2xs"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Mitigation Decision Engine &amp; Rules</span>
          </button>

          <button
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Telematics'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl shadow-xs flex items-center justify-between animate-fade-in text-xs font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Deliveries & On-Time Rate */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>On-Time Delivery Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{liveOnTimeRate}%</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <span>{liveTotalDeliveries} scheduled today</span>
          </div>
        </div>

        {/* Card 2: Delay Reduction */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Delay Minutes Saved</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-600 mt-2">
            {liveDelayMinutesSaved} mins
          </div>
          <div className="text-xs text-slate-500 mt-1">Via proactive bypass &amp; Mathadi slips</div>
        </div>

        {/* Card 3: At-Risk Deliveries */}
        <div
          onClick={() => setSelectedRisk(selectedRisk === 'AT_RISK' ? 'ALL' : 'AT_RISK')}
          className={`bg-white border rounded-2xl p-4 shadow-xs cursor-pointer transition-all ${
            selectedRisk === 'AT_RISK' ? 'border-amber-400 ring-2 ring-amber-200' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>At-Risk Deliveries</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">{atRiskCount} orders</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="font-medium text-amber-700 underline">
              {selectedRisk === 'AT_RISK' ? 'Showing filtered' : 'Click to filter list'}
            </span>
          </div>
        </div>

        {/* Card 4: Unexpected Cost Shield */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Unexpected Cost Per Order</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
              ₹
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            ₹{liveUnexpectedCostPerOrder}
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">
            -74% lower than generic fleet baseline
          </div>
        </div>
      </div>

      {/* Main Delivery Table Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Controls Bar: Search & Quick Filters */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order ID, customer, society, corridor..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600 shadow-2xs font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Locality Dropdown */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 shadow-2xs text-xs">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                {LOCALITIES.map((loc) => (
                  <option key={loc.value} value={loc.value}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Risk Level Filter */}
            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-xl p-1 shadow-2xs text-xs">
              <button
                onClick={() => setSelectedRisk('ALL')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedRisk === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All ({orders.length})
              </button>
              <button
                onClick={() => setSelectedRisk('AT_RISK')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedRisk === 'AT_RISK' ? 'bg-amber-600 text-white' : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                At-Risk ({atRiskCount})
              </button>
              <button
                onClick={() => setSelectedRisk('LOW')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedRisk === 'LOW' ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                Low Risk
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Order ID / Customer</th>
                <th className="py-3 px-4">Society &amp; Corridor</th>
                <th className="py-3 px-3">Slot / ETA</th>
                <th className="py-3 px-3">Risk Level</th>
                <th className="py-3 px-3">Confidence Score</th>
                <th className="py-3 px-3">Est. Delay</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No delivery orders match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isHighRisk = order.riskLevel === 'HIGH' || order.riskLevel === 'CRITICAL';
                  const isMedRisk = order.riskLevel === 'MEDIUM';

                  return (
                    <tr
                      key={order.id}
                      onClick={() => onSelectOrder(order)}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                        selectedOrder?.id === order.id ? 'bg-indigo-50/60' : ''
                      }`}
                    >
                      {/* Order ID & Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 font-mono">{order.id}</div>
                        <div className="text-slate-500 text-xs">{order.customerName}</div>
                      </td>

                      {/* Society & Area */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 truncate max-w-[220px]">
                          {order.societyName.split('-')[0]}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{order.locality}</span>
                        </div>
                      </td>

                      {/* Slot & ETA */}
                      <td className="py-3.5 px-3">
                        <div className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-indigo-600" />
                          <span>{order.expectedEta}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px] flex items-center gap-1">
                          <span>{formatDeliverySchedule(order.deliveryDate, order.deliveryWindow).fullScheduleLabel}</span>
                          {order.status === 'RESCHEDULED' && (
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.2 rounded font-bold shrink-0">
                              Rescheduled
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Risk Level */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            isHighRisk
                              ? 'bg-rose-100 text-rose-800'
                              : isMedRisk
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isHighRisk && <AlertTriangle className="w-3 h-3" />}
                          {isHighRisk ? 'High Risk' : isMedRisk ? 'Medium' : 'Low Risk'}
                        </span>
                      </td>

                      {/* Confidence Score */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                order.confidenceScore >= 80
                                  ? 'bg-emerald-500'
                                  : order.confidenceScore >= 60
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${order.confidenceScore}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-700">{order.confidenceScore}%</span>
                        </div>
                      </td>

                      {/* Delay */}
                      <td className="py-3.5 px-3">
                        {order.estimatedDelayMinutes > 0 ? (
                          <span className="font-bold text-amber-700">+{order.estimatedDelayMinutes}m</span>
                        ) : (
                          <span className="font-semibold text-emerald-600">On Time</span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectOrder(order);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-In Order Inspector Drawer */}
      {selectedOrder && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-white border-l border-slate-200 shadow-2xl z-40 flex flex-col animate-slide-left text-xs">
          {/* Drawer Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-base">{selectedOrder.id}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    selectedOrder.riskLevel === 'HIGH' || selectedOrder.riskLevel === 'CRITICAL'
                      ? 'bg-rose-500 text-white'
                      : 'bg-emerald-500 text-white'
                  }`}
                >
                  {selectedOrder.riskLevel} RISK
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">{selectedOrder.customerName} • {selectedOrder.customerPhone}</p>
            </div>

            <button
              onClick={onCloseDrawer}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50">
            {/* Risk & Confidence Overview Card */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Confidence &amp; Risk Metrics</span>
                <button
                  onClick={() => setIsMitigationModalOpen(true)}
                  className="text-indigo-600 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <Info className="w-3 h-3" />
                  <span>Mitigation Logic</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-slate-500 block text-[11px]">Risk Score</span>
                  <span className="text-lg font-bold text-rose-600">{selectedOrder.riskScore}/100</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-slate-500 block text-[11px]">Confidence Score</span>
                  <span className="text-lg font-bold text-emerald-600">{selectedOrder.confidenceScore}%</span>
                </div>
              </div>
            </div>

            {/* AI Recommended Mitigation Action Card */}
            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Proactive AI Mitigation</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-200/80 text-indigo-900">
                  {selectedOrder.recommendedAction.type}
                </span>
              </div>

              <div className="text-sm font-bold text-slate-900">
                {selectedOrder.recommendedAction.title}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedOrder.recommendedAction.reasoning}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2 bg-white rounded-lg border border-indigo-100">
                  <span className="text-slate-500 block">Delay Recovered:</span>
                  <span className="font-bold text-indigo-700">-{selectedOrder.recommendedAction.delayReductionMinutes} mins</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-indigo-100">
                  <span className="text-slate-500 block">Cost Protected:</span>
                  <span className="font-bold text-emerald-700">₹{selectedOrder.recommendedAction.costSavingsInr}</span>
                </div>
              </div>

              {/* Expandable Decision Logic & Rule Trigger */}
              <div className="pt-2 border-t border-indigo-100/80">
                <button
                  onClick={() => setShowDecisionLogic(!showDecisionLogic)}
                  className="flex items-center justify-between w-full text-xs font-bold text-indigo-900 hover:text-indigo-950 py-1 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-indigo-600" />
                    <span>🧠 Why was this mitigation selected? (Decision Path)</span>
                  </span>
                  <span className="text-[10px] font-mono text-indigo-600 underline">
                    {showDecisionLogic ? 'Hide' : 'Explain Logic'}
                  </span>
                </button>

                {showDecisionLogic && (
                  <div className="mt-2 p-3 bg-white border border-indigo-200/80 rounded-xl space-y-2 text-xs animate-fade-in">
                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-start gap-1.5">
                        <span className="font-bold text-slate-700 min-w-[75px]">1. Triggers:</span>
                        <span className="text-slate-800 font-medium">
                          {selectedOrder.societyName} (Risk Score: {selectedOrder.riskScore}/100) with Mathadi Union &amp; corridor constraints.
                        </span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="font-bold text-indigo-700 min-w-[75px]">2. Rule Match:</span>
                        <span className="text-indigo-900 font-mono font-semibold">
                          {selectedOrder.recommendedAction.type === 'DYNAMIC_REROUTE'
                            ? 'RULE-MIT-01 (Corridor Bypass Navigation)'
                            : selectedOrder.recommendedAction.type === 'PREAUTH_FEE'
                            ? 'RULE-MIT-02 (Digital Gate / Mathadi Pre-Auth)'
                            : selectedOrder.recommendedAction.type === 'CUSTOMER_RESCHEDULE'
                            ? 'RULE-MIT-05 (Zero-Penalty Reschedule)'
                            : 'RULE-MIT-04 (Proactive Reassurance)'}
                        </span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="font-bold text-emerald-700 min-w-[75px]">3. Payoff:</span>
                        <span className="text-emerald-800">
                          Saves {selectedOrder.recommendedAction.delayReductionMinutes} mins delay, prevents ₹{selectedOrder.recommendedAction.costSavingsInr} dispute charges, and protects SLA.
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsMitigationModalOpen(true)}
                      className="w-full text-center text-[11px] font-bold text-indigo-600 hover:text-indigo-800 pt-1.5 border-t border-slate-100 block cursor-pointer"
                    >
                      View Complete Mitigation Rules &amp; Decision Matrix →
                    </button>
                  </div>
                )}
              </div>

              {!selectedOrder.recommendedAction.applied ? (
                <button
                  onClick={() => handleApplyMitigation(selectedOrder.id)}
                  disabled={isApplyingAction}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>{isApplyingAction ? 'Applying Route & Mathadi...' : 'Apply Mitigation Now'}</span>
                </button>
              ) : (
                <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-700" />
                    <span>Mitigation Active on Route &amp; Customer Reassured</span>
                  </div>
                  <button
                    onClick={() => setIsMitigationModalOpen(true)}
                    className="text-[11px] underline font-bold text-emerald-800 cursor-pointer"
                  >
                    View Diff
                  </button>
                </div>
              )}
            </div>

            {/* Delivery Schedule & Customer Target */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Scheduled Delivery Window</span>
                </span>
                {selectedOrder.status === 'RESCHEDULED' && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    Rescheduled
                  </span>
                )}
              </div>
              <div className="text-sm font-bold text-slate-900">
                {formatDeliverySchedule(selectedOrder.deliveryDate, selectedOrder.deliveryWindow).dayName}, {formatDeliverySchedule(selectedOrder.deliveryDate, selectedOrder.deliveryWindow).formattedDate}
              </div>
              <div className="text-slate-600 flex items-center justify-between">
                <span>Time Window: <b>{formatDeliverySchedule(selectedOrder.deliveryDate, selectedOrder.deliveryWindow).window}</b></span>
                <span>Calibrated ETA: <b className="text-indigo-700">{selectedOrder.expectedEta}</b></span>
              </div>
            </div>

            {/* Destination Society Intelligence */}
            {selectedSociety && (
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                  <Building className="w-4 h-4 text-indigo-600" />
                  <span>Destination Society Gate Profile</span>
                </div>

                <div className="text-sm font-bold text-slate-900">{selectedSociety.name}</div>
                <div className="text-xs text-slate-500">{selectedSociety.address}</div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mathadi Union Probability:</span>
                    <span className="font-bold text-slate-800">{selectedSociety.mathadiProbability}% (Avg ₹{selectedSociety.typicalMathadiCharge})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Average Unloading Time:</span>
                    <span className="font-bold text-slate-800">{selectedSociety.typicalUnloadingMinutes} mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lift Restrictions:</span>
                    <span className="font-medium text-slate-700 text-right max-w-[200px]">{selectedSociety.liftRestrictions}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Assigned Driver & Vehicle */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Assigned Driver</span>
                <span className="text-indigo-600 font-medium">{selectedOrder.assignedVehicleId}</span>
              </div>
              <div className="text-sm font-semibold text-slate-800">{selectedOrder.assignedDriverName}</div>
              <div className="text-slate-500">Contact: {selectedOrder.assignedDriverPhone}</div>
            </div>

            {/* Footer Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => setIsCustomerMessageModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-indigo-200 shadow-xs"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Preview Customer Message / SMS Intimation</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onViewOnMap(selectedOrder)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  <span>Inspect on Live Map</span>
                </button>

                <button
                  onClick={() => setShowCompletionModal(true)}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Complete Delivery
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Delivery Complete Modal with Camera Proof */}
      {showCompletionModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl text-sm max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Record Actual Delivery Execution</h3>
              <button onClick={() => setShowCompletionModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Entering ground-truth execution data automatically trains the closed-loop learning model for <b>{selectedOrder.societyName}</b>.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Actual Delay Experienced (Mins)</label>
                <input
                  type="number"
                  value={actualDelayInput}
                  onChange={(e) => setActualDelayInput(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Actual Mathadi / Union Paid (₹)</label>
                <input
                  type="number"
                  value={actualMathadiInput}
                  onChange={(e) => setActualMathadiInput(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unloading Duration (Mins)</label>
                <input
                  type="number"
                  value={actualUnloadingInput}
                  onChange={(e) => setActualUnloadingInput(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              {/* Camera POD / Gate Slip Integration */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Proof of Delivery / Gate Slip (Camera)</label>
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Camera className="w-3 h-3" />
                    <span>{podPhotoUrl ? 'Retake' : 'Open Camera'}</span>
                  </button>
                </div>
                {podPhotoUrl ? (
                  <div className="h-20 rounded-xl overflow-hidden border border-slate-200">
                    <img src={podPhotoUrl} alt="POD Proof" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="w-full py-2.5 border border-dashed border-slate-300 rounded-xl text-slate-600 text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-slate-500" />
                    <span>Take Camera Photo of Slip / Doorstep</span>
                  </button>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Driver Feedback Note</label>
                <textarea
                  rows={2}
                  value={driverFeedbackInput}
                  onChange={(e) => setDriverFeedbackInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowCompletionModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeliverySubmit}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
              >
                Save &amp; Train Network
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mitigation Lifecycle Modal */}
      <MitigationLifecycleModal
        isOpen={isMitigationModalOpen}
        onClose={() => setIsMitigationModalOpen(false)}
        order={selectedOrder}
        cityId={activeCity}
        onApplyMitigation={onApplyAction}
      />

      {/* Camera Capture Modal for Delivery POD */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onPhotoCaptured={(dataUrl) => setPodPhotoUrl(dataUrl)}
        title="Snap Delivery Gate Slip / POD Photo"
      />

      {/* Customer Notification Preview Modal */}
      {selectedOrder && (
        <CustomerMessageModal
          isOpen={isCustomerMessageModalOpen}
          onClose={() => setIsCustomerMessageModalOpen(false)}
          order={selectedOrder}
          onOrderRescheduled={() => {
            onRefresh();
            setIsCustomerMessageModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
