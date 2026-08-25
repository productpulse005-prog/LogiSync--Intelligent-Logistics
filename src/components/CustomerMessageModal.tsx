import React, { useState } from 'react';
import {
  MessageSquare,
  Smartphone,
  Bell,
  CheckCircle2,
  Clock,
  Shield,
  Sparkles,
  X,
  Send,
  Truck,
  Building,
  Copy,
  Check,
  Calendar,
  RotateCcw,
} from 'lucide-react';
import { Order } from '../types';
import { api } from '../services/api';
import { formatDeliverySchedule, getUpcomingScheduleSlots } from '../utils/dateScheduleUtils';

interface CustomerMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  overrideRiskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  overrideDelayMinutes?: number;
  onOrderRescheduled?: () => void;
}

export const CustomerMessageModal: React.FC<CustomerMessageModalProps> = ({
  isOpen,
  onClose,
  order,
  overrideRiskLevel,
  overrideDelayMinutes,
  onOrderRescheduled,
}) => {
  const [activeChannel, setActiveChannel] = useState<'SMS' | 'WHATSAPP' | 'PUSH'>('SMS');
  const [copied, setCopied] = useState<boolean>(false);
  const [customerChoice, setCustomerChoice] = useState<'NONE' | 'WAIT' | 'RESCHEDULE'>('NONE');
  const upcomingSlots = getUpcomingScheduleSlots();
  const [selectedSlotObj, setSelectedSlotObj] = useState(upcomingSlots[0]);
  const [isRescheduling, setIsRescheduling] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const scheduleInfo = formatDeliverySchedule(order.deliveryDate, order.deliveryWindow);

  // Determine realistic message context based on order status, risk levels (LOW, MEDIUM, HIGH, CRITICAL), and applied mitigations
  const isMitigated = order.recommendedAction?.applied;
  const isRescheduled = order.status === 'RESCHEDULED';
  const riskLevel = overrideRiskLevel || order.riskLevel || 'LOW';
  const delayMin = overrideDelayMinutes !== undefined ? overrideDelayMinutes : (order.estimatedDelayMinutes || 0);
  const isExtendedDelay = (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') && !isRescheduled && !isMitigated;
  const driverName = order.assignedDriverName || 'Santosh Kadam';
  const vehicleId = order.assignedVehicleNumber || order.assignedVehicleId || 'MH-12-RN-8821';
  const locality = order.locality || 'your locality';
  const society = order.societyName ? order.societyName.split('-')[0].trim() : 'your society';

  let smsBody = '';
  let whatsappBody = '';
  let pushTitle = '';
  let pushBody = '';

  if (isRescheduled) {
    smsBody = `Hi ${order.customerName}, your delivery slot for Order ${order.id} is confirmed for ${scheduleInfo.dayName}, ${scheduleInfo.formattedDate} (${scheduleInfo.window}). Dispatch route, vehicle allocation, and technician assignment are locked in. Live tracking: https://track.logisync.delivery/${order.id}`;
    whatsappBody = `📅 *LogiSync Delivery Rescheduled & Confirmed*\n\nHi *${order.customerName}*, your new delivery slot for Order *${order.id}* is confirmed.\n\n⏱ *Scheduled Date & Window:* ${scheduleInfo.dayName}, ${scheduleInfo.formattedDate} (${scheduleInfo.window})\n🏢 *Address:* ${society}\n🚚 *Assigned Team:* ${driverName} (${vehicleId})\n\nTrack updates: https://track.logisync.delivery/${order.id}`;
    pushTitle = `Delivery Window Confirmed (${scheduleInfo.dayName}, ${scheduleInfo.formattedDate})`;
    pushBody = `Your order ${order.id} is scheduled for ${scheduleInfo.dayName}, ${scheduleInfo.formattedDate} • ${scheduleInfo.window}. Route and technician assigned.`;
  } else if (isMitigated) {
    smsBody = `Hi ${order.customerName}, your delivery team has cleared society gate access & engaged an alternate corridor route for ${scheduleInfo.dayName}, ${scheduleInfo.formattedDate}. Driver ${driverName} (${vehicleId}) is on track for arrival at ${order.expectedEta}. Live track: https://track.logisync.delivery/${order.id}`;
    whatsappBody = `📦 *LogiSync Delivery Protected & On Track*\n\nGreat news *${order.customerName}*! Gate access has been pre-cleared for *${society}* on *${scheduleInfo.dayName}, ${scheduleInfo.formattedDate}* and local corridor traffic bypassed.\n\n⏱ *Expected Arrival:* ${order.expectedEta}\n🚚 *Driver:* ${driverName} (${vehicleId})\n\nLive tracking: https://track.logisync.delivery/${order.id}`;
    pushTitle = `Delivery On Track (${order.expectedEta})`;
    pushBody = `Gate access pre-authorized for ${scheduleInfo.dayName}. Driver ${driverName} is on schedule for ${order.expectedEta}.`;
  } else if (riskLevel === 'CRITICAL') {
    smsBody = `CRITICAL NOTICE: Hi ${order.customerName}, severe access/corridor bottleneck near ${locality} is causing an estimated +${delayMin || 45}m delay on ${scheduleInfo.dayName}, ${scheduleInfo.formattedDate} (ETA: ${order.expectedEta}). Our team is coordinating clearance. Please confirm if you wish to continue waiting or pick a guaranteed slot tomorrow: https://track.logisync.delivery/${order.id}/choice`;
    whatsappBody = `🚨 *LogiSync Critical Ground Notice*\n\nHi *${order.customerName}*, a severe ground bottleneck near *${locality}* is impacting your delivery route on *${scheduleInfo.dayName}, ${scheduleInfo.formattedDate}*.\n\n⏱ *Current Calibrated ETA:* ${order.expectedEta} (+${delayMin || 45}m delay)\n🏢 *Society:* ${society}\n🚚 *Assigned Driver:* ${driverName} (${vehicleId})\n\n*Action Requested:*\n1️⃣ Continue waiting (Priority team on standby)\n2️⃣ Reschedule to tomorrow (Guaranteed slot, zero fee)\n\n👉 Confirm choice here: https://track.logisync.delivery/${order.id}/choice`;
    pushTitle = `Critical Access Notice (+${delayMin || 45}m delay)`;
    pushBody = `Corridor bottleneck near ${locality}. Driver ${driverName} on standby. Tap to choose action.`;
  } else if (riskLevel === 'HIGH') {
    smsBody = `Hi ${order.customerName}, your delivery on ${scheduleInfo.dayName}, ${scheduleInfo.formattedDate} is taking longer due to on-site access/lift clearance near ${locality} (+${delayMin || 30}m buffer). Calibrated arrival window: ${order.expectedEta}. Driver: ${driverName}. You can keep waiting or choose a new slot: https://track.logisync.delivery/${order.id}/choice`;
    whatsappBody = `⚠️ *LogiSync Delivery Delay Update*\n\nHi *${order.customerName}*, your delivery is encountering building/corridor clearance delays near *${locality}* (+${delayMin || 30}m buffer) on *${scheduleInfo.dayName}, ${scheduleInfo.formattedDate}*.\n\n⏱ *Calibrated Arrival:* ${order.expectedEta}\n🚚 *Driver:* ${driverName} (${vehicleId})\n\n*Please choose your preference:*\n1️⃣ Keep order active & continue waiting\n2️⃣ 1-Tap free reschedule to tomorrow\n\nTap to confirm: https://track.logisync.delivery/${order.id}/choice`;
    pushTitle = `Delivery Delay Intimation (${order.expectedEta})`;
    pushBody = `Access delay near ${locality} (+${delayMin || 30}m). Tap to keep waiting or select a new delivery window.`;
  } else if (riskLevel === 'MEDIUM') {
    smsBody = `Hi ${order.customerName}, we added a brief +${delayMin || 15}m buffer for local traffic variance near ${locality} on ${scheduleInfo.dayName}, ${scheduleInfo.formattedDate}. Driver ${driverName} is en route. Calibrated arrival: ${order.expectedEta}. Track: https://track.logisync.delivery/${order.id}`;
    whatsappBody = `ℹ️ *LogiSync Transit Update*\n\nHi *${order.customerName}*, we are monitoring slight corridor traffic near *${locality}* for your delivery on *${scheduleInfo.dayName}, ${scheduleInfo.formattedDate}*. Your arrival window has been calibrated to *${order.expectedEta}* (+${delayMin || 15}m transit buffer).\n\n🚚 *Driver:* ${driverName} (${vehicleId})\n\nTrack progress: https://track.logisync.delivery/${order.id}`;
    pushTitle = `Transit Buffer Added (${order.expectedEta})`;
    pushBody = `Slight traffic buffer (+${delayMin || 15}m) added near ${locality}. Arrival expected around ${order.expectedEta}.`;
  } else {
    // LOW Risk
    smsBody = `Hi ${order.customerName}, your delivery for Order ${order.id} is confirmed on track for ${scheduleInfo.dayName}, ${scheduleInfo.formattedDate} at ${order.expectedEta}. Assigned driver: ${driverName} (${vehicleId}). Building access verified. Track: https://track.logisync.delivery/${order.id}`;
    whatsappBody = `✅ *LogiSync Delivery Confirmed & On Track*\n\nHi *${order.customerName}*, your order *${order.id}* is on schedule for *${society}* on *${scheduleInfo.dayName}, ${scheduleInfo.formattedDate}*.\n\n⏱ *Expected Arrival:* ${order.expectedEta}\n🚚 *Assigned Driver:* ${driverName} (${vehicleId})\n\nLive tracking: https://track.logisync.delivery/${order.id}`;
    pushTitle = `Delivery On Track (${order.expectedEta})`;
    pushBody = `Your order ${order.id} is on schedule for ${scheduleInfo.dayName}, ${scheduleInfo.formattedDate} • ${order.expectedEta} with ${driverName}.`;
  }

  const activeMessageText =
    activeChannel === 'SMS' ? smsBody : activeChannel === 'WHATSAPP' ? whatsappBody : pushBody;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeMessageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmWait = () => {
    setCustomerChoice('WAIT');
    setActionFeedback(`Customer confirmed: Continuing to wait. Live tracking active with calibrated ETA (${order.expectedEta}).`);
  };

  const handleExecuteReschedule = async () => {
    try {
      setIsRescheduling(true);
      await api.rescheduleSlot(order.id, selectedSlotObj.timeWindow, selectedSlotObj.dateStr);
      setCustomerChoice('RESCHEDULE');
      setActionFeedback(`Delivery rescheduled successfully for ${selectedSlotObj.dayName}, ${selectedSlotObj.formattedDate} (${selectedSlotObj.timeWindow}). System updated.`);
      if (onOrderRescheduled) onOrderRescheduled();
    } catch (e) {
      console.error(e);
    } finally {
      setIsRescheduling(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in text-slate-800">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl space-y-0 text-xs">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm text-white">Customer Notification &amp; Intimation</h3>
                <span className="bg-indigo-500/30 text-indigo-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-indigo-400/20">
                  {order.id}
                </span>
                {isRescheduled ? (
                  <span className="bg-emerald-500/30 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-400/20">
                    RESCHEDULED
                  </span>
                ) : isMitigated ? (
                  <span className="bg-indigo-500/30 text-indigo-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-indigo-400/20">
                    MITIGATED &amp; CLEARED
                  </span>
                ) : riskLevel === 'CRITICAL' ? (
                  <span className="bg-red-500/30 text-red-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-red-400/20">
                    CRITICAL RISK (+{delayMin || 45}m)
                  </span>
                ) : riskLevel === 'HIGH' ? (
                  <span className="bg-amber-500/30 text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-400/20">
                    HIGH RISK (+{delayMin || 30}m)
                  </span>
                ) : riskLevel === 'MEDIUM' ? (
                  <span className="bg-blue-500/30 text-blue-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-blue-400/20">
                    MEDIUM RISK (+{delayMin || 15}m)
                  </span>
                ) : (
                  <span className="bg-emerald-500/30 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-400/20">
                    LOW RISK (ON TRACK)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Recipient: <b className="text-white">{order.customerName}</b> ({order.customerPhone}) • ETA: <b className="text-indigo-300">{order.expectedEta}</b>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 bg-slate-50/60 overflow-y-auto">
          {/* Channel Selector Tabs */}
          <div className="grid grid-cols-3 gap-1.5 bg-slate-200/70 p-1 rounded-2xl">
            <button
              onClick={() => setActiveChannel('SMS')}
              className={`py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeChannel === 'SMS'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>SMS</span>
            </button>

            <button
              onClick={() => setActiveChannel('WHATSAPP')}
              className={`py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeChannel === 'WHATSAPP'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={() => setActiveChannel('PUSH')}
              className={`py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeChannel === 'PUSH'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-indigo-600" />
              <span>App Push</span>
            </button>
          </div>

          {/* Smartphone Simulator Preview Frame */}
          <div className="bg-slate-900 rounded-3xl p-4 text-white shadow-md border border-slate-800 space-y-3">
            {/* Phone Top Notch Bar */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 border-b border-slate-800 pb-2">
              <span>9:41 AM</span>
              <div className="flex items-center gap-1.5">
                <span>LogiSync 5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* Rendered Channel UI */}
            {activeChannel === 'SMS' && (
              <div className="space-y-2 py-1">
                <div className="text-center text-[10px] text-slate-400">SMS from +91-LOGISYNC-EXPRESS</div>
                <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-xs text-xs space-y-1.5 shadow-xs leading-relaxed max-w-[92%] ml-auto">
                  <p>{smsBody}</p>
                  <span className="text-[10px] text-blue-200 block text-right">Just now • Delivered</span>
                </div>
              </div>
            )}

            {activeChannel === 'WHATSAPP' && (
              <div className="space-y-2 py-1">
                <div className="flex items-center gap-2 bg-emerald-950/80 p-2 rounded-xl border border-emerald-800/40">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-black">
                    L
                  </div>
                  <div>
                    <div className="font-bold text-white text-[11px]">LogiSync Official</div>
                    <div className="text-[9px] text-emerald-400">Verified Business Account</div>
                  </div>
                </div>

                <div className="bg-[#1f2c34] text-slate-100 p-3.5 rounded-2xl rounded-tl-xs text-xs space-y-2.5 shadow-xs leading-relaxed border border-slate-700/50">
                  <div className="whitespace-pre-line font-sans text-[11px]">{whatsappBody}</div>

                  {/* Interactive WhatsApp Quick Action Buttons Simulator */}
                  {isExtendedDelay && !isMitigated && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/60">
                      <button
                        onClick={handleConfirmWait}
                        className="py-1.5 px-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-emerald-300 font-bold text-[10px] text-center border border-slate-600 transition-colors cursor-pointer"
                      >
                        ⏳ Continue Waiting
                      </button>
                      <button
                        onClick={() => setCustomerChoice('RESCHEDULE')}
                        className="py-1.5 px-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-indigo-300 font-bold text-[10px] text-center border border-slate-600 transition-colors cursor-pointer"
                      >
                        📅 Reschedule Slot
                      </button>
                    </div>
                  )}

                  <span className="text-[9px] text-slate-400 block text-right">9:41 AM ✓✓</span>
                </div>
              </div>
            )}

            {activeChannel === 'PUSH' && (
              <div className="space-y-2 py-2">
                <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-3 space-y-1.5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-[10px] uppercase">
                      <Bell className="w-3 h-3" />
                      <span>LogiSync Delivery</span>
                    </div>
                    <span className="text-[10px] text-slate-400">now</span>
                  </div>
                  <div className="font-bold text-white text-xs">{pushTitle}</div>
                  <p className="text-[11px] text-slate-300 leading-snug">{pushBody}</p>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Action Simulator (Choice to Continue Waiting OR Reschedule) - Strictly for HIGH and CRITICAL risks */}
          {isExtendedDelay ? (
            <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-amber-950 text-xs">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Interactive Customer Choice Simulator:</span>
                </div>
                <span className="bg-amber-200 text-amber-900 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  +{delayMin || 35}m Delay ({riskLevel} Risk)
                </span>
              </div>

              <p className="text-[11px] text-amber-900 leading-relaxed">
                Because this delivery is flagged with <b>{riskLevel}</b> time consumption, the customer receives interactive options to <b>continue waiting</b> or <b>reschedule</b> to a guaranteed slot:
              </p>

              {customerChoice === 'NONE' && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleConfirmWait}
                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Option 1: Continue Waiting</span>
                  </button>

                  <button
                    onClick={() => setCustomerChoice('RESCHEDULE')}
                    className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Option 2: Reschedule Slot</span>
                  </button>
                </div>
              )}

              {customerChoice === 'RESCHEDULE' && (
                <div className="bg-white p-3 rounded-xl border border-amber-300 space-y-2.5 animate-fade-in">
                  <span className="font-bold text-slate-900 block text-xs">Select Preferred Reschedule Window (Date &amp; Day Included):</span>
                  <select
                    value={selectedSlotObj.slotId}
                    onChange={(e) => {
                      const found = upcomingSlots.find((s) => s.slotId === e.target.value);
                      if (found) setSelectedSlotObj(found);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl p-2 text-xs font-semibold"
                  >
                    {upcomingSlots.map((slot) => (
                      <option key={slot.slotId} value={slot.slotId}>
                        {slot.displayLabel}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleExecuteReschedule}
                      disabled={isRescheduling}
                      className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {isRescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
                    </button>
                    <button
                      onClick={() => setCustomerChoice('NONE')}
                      className="py-2 px-3 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer hover:bg-slate-200"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}

              {actionFeedback && (
                <div className="bg-white p-2.5 rounded-xl border border-emerald-300 text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionFeedback}</span>
                </div>
              )}
            </div>
          ) : !isRescheduled && !isMitigated ? (
            <div className={`p-4 rounded-2xl border space-y-2 animate-fade-in ${
              riskLevel === 'MEDIUM' 
                ? 'bg-blue-50/80 border-blue-200 text-blue-950' 
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  {riskLevel === 'MEDIUM' ? <Clock className="w-4 h-4 text-blue-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  <span>{riskLevel === 'MEDIUM' ? 'Informational Status Notice (Medium Risk)' : 'Informational On-Track Notice (Low Risk)'}</span>
                </div>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                  riskLevel === 'MEDIUM' ? 'bg-blue-200 text-blue-900' : 'bg-emerald-200 text-emerald-900'
                }`}>
                  {riskLevel === 'MEDIUM' ? `+${delayMin || 15}m Transit Buffer` : 'On Schedule'}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                {riskLevel === 'MEDIUM' 
                  ? 'Customer receives a calibrated transit buffer notification (+15m). Reschedule options are not shown for low or medium risk.' 
                  : 'Customer receives an on-time confirmation with driver & vehicle verification. No action or rescheduling required.'}
              </p>
            </div>
          ) : null}

          {/* Key Communication Guarantees Banner */}
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-1.5 text-[11px] text-indigo-950">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Brand Trust Protection Rules:</span>
            </div>
            <ul className="space-y-1 text-slate-600 pl-4 list-disc">
              <li>Internal vendor or Mathadi union disputes are <b>automatically suppressed into polite access phrasing</b>.</li>
              <li>When time consumption is high, customer gets a <b>direct 1-tap option to continue waiting or reschedule</b>.</li>
              <li>Calibrated arrival range guarantees customer satisfaction without cold cancellation calls.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

