import React, { useState } from 'react';
import {
  ShieldCheck,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Truck,
  Package,
  Wrench,
  ChevronRight,
  PhoneCall,
  RotateCcw,
  Sparkles,
  HelpCircle,
  X,
  MessageSquare,
  Smartphone,
  Bell,
} from 'lucide-react';
import { Order } from '../types';
import { api } from '../services/api';
import { CustomerMessageModal } from './CustomerMessageModal';
import { formatDeliverySchedule, getUpcomingScheduleSlots } from '../utils/dateScheduleUtils';

interface CustomerDeliveryConfidenceProps {
  orders: Order[];
  selectedOrderId?: string;
  onSelectOrder?: (order: Order) => void;
  onOrderUpdated: () => void;
}

export const CustomerDeliveryConfidence: React.FC<CustomerDeliveryConfidenceProps> = ({
  orders,
  selectedOrderId: propSelectedOrderId,
  onSelectOrder,
  onOrderUpdated,
}) => {
  const [internalOrderId, setInternalOrderId] = useState<string>(
    propSelectedOrderId || orders[0]?.id || 'RM-82931'
  );
  const [showRescheduleModal, setShowRescheduleModal] = useState<boolean>(false);
  const [showMessageModal, setShowMessageModal] = useState<boolean>(false);
  const upcomingSlots = getUpcomingScheduleSlots();
  const [selectedSlotObj, setSelectedSlotObj] = useState(upcomingSlots[0]);
  const [isRescheduling, setIsRescheduling] = useState<boolean>(false);
  const [rescheduleSuccess, setRescheduleSuccess] = useState<string | null>(null);

  // Keep internal state in sync if prop changes
  React.useEffect(() => {
    if (propSelectedOrderId) {
      setInternalOrderId(propSelectedOrderId);
    }
  }, [propSelectedOrderId]);

  const currentOrder =
    orders.find((o) => o.id === (propSelectedOrderId || internalOrderId)) ||
    orders.find((o) => o.id === internalOrderId) ||
    orders[0];

  const handleCustomerDropdownChange = (orderId: string) => {
    setInternalOrderId(orderId);
    const selected = orders.find((o) => o.id === orderId);
    if (selected && onSelectOrder) {
      onSelectOrder(selected);
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!currentOrder) return;
    try {
      setIsRescheduling(true);
      await api.rescheduleSlot(currentOrder.id, selectedSlotObj.timeWindow, selectedSlotObj.dateStr);
      setShowRescheduleModal(false);
      setRescheduleSuccess(`Your delivery slot has been confirmed for ${selectedSlotObj.dayName}, ${selectedSlotObj.formattedDate} (${selectedSlotObj.timeWindow}).`);
      onOrderUpdated();
      setTimeout(() => setRescheduleSuccess(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRescheduling(false);
    }
  };

  const scheduleInfo = formatDeliverySchedule(currentOrder?.deliveryDate, currentOrder?.deliveryWindow);

  if (!currentOrder) {
    return <div className="p-8 text-center text-slate-500">No orders found.</div>;
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      {/* Top Switcher for Customer & Driver Synchronization */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[280px] space-y-1">
            <label className="text-slate-600 font-bold text-xs uppercase tracking-wider block">
              Select Customer to Simulate View:
            </label>
            <select
              value={currentOrder.id}
              onChange={(e) => handleCustomerDropdownChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2 font-semibold text-xs focus:outline-none focus:border-indigo-600 shadow-2xs"
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.customerName} ({o.id}) — Assigned Driver: {o.assignedDriverName || 'Santosh Kadam'} [{o.societyName.split('-')[0].trim()}]
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl font-bold border border-indigo-200 flex items-center gap-1.5 self-end">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Customer Delivery Confidence View</span>
          </div>
        </div>

        {/* Live Customer & Driver Linked Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
              👤
            </div>
            <div className="truncate">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Active Customer</span>
              <span className="font-bold text-slate-900 truncate">{currentOrder.customerName}</span>
              <span className="text-slate-500 text-[11px] block">{currentOrder.customerPhone}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-emerald-50/80 rounded-xl border border-emerald-200">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
              🚚
            </div>
            <div className="truncate">
              <span className="text-[10px] text-emerald-700 block uppercase font-bold">Assigned Driver (Auto-Updated)</span>
              <span className="font-bold text-emerald-950 truncate">{currentOrder.assignedDriverName || 'Santosh Kadam'}</span>
              <span className="text-emerald-700 text-[11px] block">{currentOrder.assignedVehicleNumber || currentOrder.assignedVehicleId}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {rescheduleSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl shadow-xs flex items-center justify-between animate-fade-in text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold">{rescheduleSuccess}</span>
          </div>
          <button onClick={() => setRescheduleSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Customer Tracking Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Top Confidence Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-mono">Order {currentOrder.id}</span>
              <h2 className="text-xl font-bold text-slate-900">Furniture &amp; Appliances Delivery</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full text-emerald-800 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Delivery Confidence: {currentOrder.confidenceScore}%</span>
          </div>
        </div>

        {/* Expected Time Box */}
        <div className="p-5 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase text-indigo-900 tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Scheduled Delivery Date &amp; Window</span>
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl sm:text-2xl font-bold text-slate-900">
                {scheduleInfo.dayName}, {scheduleInfo.formattedDate}
              </span>
              <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-1 rounded-lg font-bold border border-indigo-200">
                {scheduleInfo.window}
              </span>
            </div>
            <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-slate-700">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Calibrated ETA: <b className="text-slate-900">{currentOrder.expectedEta}</b></span>
              </span>
              {currentOrder.status === 'RESCHEDULED' && (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Rescheduled Slot Locked</span>
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowRescheduleModal(true)}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 font-bold text-xs border border-indigo-200 shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{currentOrder.status === 'RESCHEDULED' ? 'Change Date / Slot' : 'Reschedule Date & Slot'}</span>
          </button>
        </div>

        {/* Rescheduled Confirmation Banner */}
        {currentOrder.status === 'RESCHEDULED' && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-3 animate-fade-in shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-bold text-sm text-emerald-950">Delivery Rescheduled Successfully</h4>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Confirmed for <b>{scheduleInfo.dayName}, {scheduleInfo.formattedDate}</b> during <b>{scheduleInfo.window}</b>. The operations control tower, vehicle routing, and technician schedule have been synchronized.
              </p>
            </div>
          </div>
        )}

        {/* High Time Consumption / Delay Notice Banner (Wait vs Reschedule Option) */}
        {currentOrder.status !== 'RESCHEDULED' && !currentOrder.recommendedAction?.applied && (
          <>
            {currentOrder.riskLevel === 'CRITICAL' && (
              <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl space-y-3 shadow-xs animate-fade-in">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-red-950">Critical Ground Access Disruption</h4>
                      <span className="bg-red-200 text-red-900 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        +{currentOrder.estimatedDelayMinutes || 45}m Delay (Critical Risk)
                      </span>
                    </div>
                    <p className="text-xs text-red-900 leading-relaxed">
                      Driver {currentOrder.assignedDriverName || 'Santosh Kadam'} reported severe corridor blockage/excavation near {currentOrder.locality}. Calibrated arrival window is now <b>{currentOrder.expectedEta}</b>.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-red-200 space-y-2">
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>Choose your delivery preference:</span>
                    <span className="text-[11px] text-red-600 font-semibold">Priority 1-Tap Reschedule Available</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        setRescheduleSuccess(`Confirmed: Keeping order active. Driver is navigating to your tower with updated ETA (${currentOrder.expectedEta}).`);
                        setTimeout(() => setRescheduleSuccess(null), 5000);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Option 1: Continue Waiting</span>
                    </button>

                    <button
                      onClick={() => setShowRescheduleModal(true)}
                      className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Option 2: Reschedule to Tomorrow (Free)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentOrder.riskLevel === 'HIGH' && (
              <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-3 shadow-xs animate-fade-in">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-amber-950">Ground Delay Intimation</h4>
                      <span className="bg-amber-200 text-amber-900 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        +{currentOrder.estimatedDelayMinutes || 30}m Delay (High Risk)
                      </span>
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed">
                      Driver {currentOrder.assignedDriverName || 'Santosh Kadam'} reported on-site access/road clearance delays near {currentOrder.locality}. Your calibrated window is now <b>{currentOrder.expectedEta}</b>.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-2">
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>Would you like to keep waiting or choose a new time?</span>
                    <span className="text-[11px] text-emerald-600 font-semibold">Free 1-Tap Reschedule</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        setRescheduleSuccess(`Confirmed: Keeping order active. Driver is navigating to your tower with updated ETA (${currentOrder.expectedEta}).`);
                        setTimeout(() => setRescheduleSuccess(null), 5000);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Option 1: Continue Waiting</span>
                    </button>

                    <button
                      onClick={() => setShowRescheduleModal(true)}
                      className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Option 2: Reschedule Delivery</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentOrder.riskLevel === 'MEDIUM' && (
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between gap-3 animate-fade-in text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-950">Slight Transit Buffer Added (+{currentOrder.estimatedDelayMinutes || 15}m)</span>
                      <span className="bg-blue-200 text-blue-900 text-[10px] px-2 py-0.2 rounded-full font-bold">Information Only</span>
                    </div>
                    <span className="text-blue-800 text-[11px] block">Minor road/gate clearance buffer near {currentOrder.locality}. Calibrated arrival window: <b>{currentOrder.expectedEta}</b>.</span>
                  </div>
                </div>
                <span className="text-[11px] text-blue-700 font-semibold bg-white/80 border border-blue-200 px-2.5 py-1 rounded-lg shrink-0">
                  On Track
                </span>
              </div>
            )}
          </>
        )}

        {/* Delivery Progress Stepper */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Live Delivery Status</h3>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <span className="font-bold block">Confirmed</span>
              <span className="text-[11px] text-emerald-700">08:00 AM</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <span className="font-bold block">Dispatched</span>
              <span className="text-[11px] text-emerald-700">09:15 AM</span>
            </div>

            <div className="p-3 rounded-xl bg-indigo-600 text-white font-bold shadow-xs">
              <Truck className="w-4 h-4 mx-auto mb-1 animate-pulse" />
              <span className="block">On The Way</span>
              <span className="text-[11px] text-indigo-100">In Transit</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 text-slate-400 border border-slate-200">
              <Package className="w-4 h-4 mx-auto mb-1" />
              <span className="block">Delivered</span>
              <span className="text-[11px]">Pending</span>
            </div>
          </div>
        </div>

        {/* Reassuring Status Message & Customer Notification Popup */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Live Delivery Intelligence Note</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                currentOrder.customerNotification?.status === 'ACTION_REQUIRED'
                  ? 'bg-amber-100 text-amber-800'
                  : currentOrder.customerNotification?.status === 'POTENTIAL_DELAY'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {currentOrder.riskLevel} RISK
              </span>
            </div>

            <button
              onClick={() => setShowMessageModal(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-indigo-200"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>See Customer Phone Popup (SMS/WhatsApp)</span>
            </button>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-xs text-slate-900">
              {currentOrder.customerNotification?.headline || 'High confidence — on track'}
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {currentOrder.customerNotification?.message ||
                (currentOrder.recommendedAction?.applied
                  ? 'Our dynamic routing team has pre-cleared your society gate and bypassed local corridor traffic to guarantee your delivery arrives on schedule.'
                  : 'Our delivery team is on track for your requested slot. You will receive an SMS when the driver enters your society gate.')}
            </p>
          </div>

          {/* Quick Interactive Customer Phone Notification Bar */}
          <div
            onClick={() => setShowMessageModal(true)}
            className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-800 transition-colors shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs">
                <div className="font-bold flex items-center gap-1.5 text-slate-200">
                  <span>Customer SMS Sent:</span>
                  <span className="text-[10px] text-emerald-400 font-mono">DELIVERED</span>
                </div>
                <div className="text-slate-300 truncate max-w-[280px] sm:max-w-md text-[11px]">
                  {currentOrder.status === 'RESCHEDULED'
                    ? `Hi ${currentOrder.customerName}, delivery slot confirmed for ${currentOrder.deliveryWindow}. Route locked in.`
                    : currentOrder.recommendedAction?.applied
                    ? `Hi ${currentOrder.customerName}, gate access pre-cleared & alternate route active. On track for ${currentOrder.expectedEta}.`
                    : currentOrder.riskLevel === 'CRITICAL'
                    ? `CRITICAL NOTICE: Hi ${currentOrder.customerName}, corridor delay near ${currentOrder.locality} (+${currentOrder.estimatedDelayMinutes || 45}m). Tap to reschedule.`
                    : currentOrder.riskLevel === 'HIGH'
                    ? `Hi ${currentOrder.customerName}, on-site access delay near ${currentOrder.locality} (+${currentOrder.estimatedDelayMinutes || 30}m). ETA: ${currentOrder.expectedEta}.`
                    : currentOrder.riskLevel === 'MEDIUM'
                    ? `Hi ${currentOrder.customerName}, slight traffic buffer (+${currentOrder.estimatedDelayMinutes || 15}m) added near ${currentOrder.locality}. ETA: ${currentOrder.expectedEta}.`
                    : `Hi ${currentOrder.customerName}, delivery confirmed on track for ${currentOrder.expectedEta}. Driver: ${currentOrder.assignedDriverName || 'Santosh Kadam'}.`}
                </div>
              </div>
            </div>

            <span className="text-[11px] font-bold text-indigo-300 underline shrink-0">
              Open Phone View &rarr;
            </span>
          </div>
        </div>

        {/* Destination & Driver Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold block">Delivery Address</span>
              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold">{currentOrder.locality}</span>
            </div>
            <div className="font-bold text-slate-900 text-sm">{currentOrder.societyName}</div>
            <div className="text-slate-600 leading-relaxed">{currentOrder.address}</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold block">Assigned Delivery Partner</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>On Route</span>
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-bold text-slate-900 text-sm">{currentOrder.assignedDriverName || 'Santosh Kadam'}</div>
                <div className="text-slate-600 text-[11px]">{currentOrder.assignedVehicleNumber || currentOrder.assignedVehicleId}</div>
              </div>
              {currentOrder.assignedDriverPhone && (
                <a
                  href={`tel:${currentOrder.assignedDriverPhone}`}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1 border border-emerald-200"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Call Driver</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reschedule Slot Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl text-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Select New Delivery Window</h3>
              <button onClick={() => setShowRescheduleModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Pick a new slot that works best for your schedule. We will coordinate gated society entry and installation.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {upcomingSlots.map((slotObj) => (
                <button
                  key={slotObj.slotId}
                  onClick={() => setSelectedSlotObj(slotObj)}
                  className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                    selectedSlotObj.slotId === slotObj.slotId
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-950 font-bold ring-2 ring-indigo-500 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{slotObj.dayName}, {slotObj.formattedDate}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-normal">
                      Window: {slotObj.timeWindow}
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                    selectedSlotObj.slotId === slotObj.slotId ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {selectedSlotObj.slotId === slotObj.slotId ? 'Selected' : 'Available'}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleSubmit}
                disabled={isRescheduling}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
              >
                {isRescheduling ? 'Confirming...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Customer Notification Popup Modal */}
      {currentOrder && (
        <CustomerMessageModal
          isOpen={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          order={currentOrder}
          onOrderRescheduled={() => onOrderUpdated()}
        />
      )}
    </div>
  );
};
