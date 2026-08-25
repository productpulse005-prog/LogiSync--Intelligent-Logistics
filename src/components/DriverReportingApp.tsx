import React, { useState, useRef } from 'react';
import {
  Smartphone,
  Mic,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Truck,
  Sparkles,
  Send,
  Building,
  Layers,
  ChevronRight,
  Shield,
  X,
  Image as ImageIcon,
  Trash2,
  MessageSquare,
  Upload,
  Calendar,
  Loader2,
} from 'lucide-react';
import { SocietyProfile, Order, ConstraintType } from '../types';
import { api } from '../services/api';
import { CameraCaptureModal } from './CameraCaptureModal';
import { VoiceMicRecorder } from './VoiceMicRecorder';
import { CustomerMessageModal } from './CustomerMessageModal';
import { formatDeliverySchedule } from '../utils/dateScheduleUtils';

interface DriverReportingAppProps {
  societies: SocietyProfile[];
  orders: Order[];
  selectedOrderId?: string;
  onSelectOrder?: (order: Order) => void;
  onReportSubmitted: () => void;
}

export const DriverReportingApp: React.FC<DriverReportingAppProps> = ({
  societies,
  orders,
  selectedOrderId: propSelectedOrderId,
  onSelectOrder,
  onReportSubmitted,
}) => {
  const [selectedType, setSelectedType] = useState<ConstraintType>('MATHADI');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    propSelectedOrderId || orders[0]?.id || 'RM-82931'
  );
  const [selectedSocietyId, setSelectedSocietyId] = useState<string>(
    orders.find((o) => o.id === propSelectedOrderId)?.societyId || orders[0]?.societyId || societies[0]?.id || 'SOC-001'
  );
  const [amount, setAmount] = useState<string>('');
  const [impact, setImpact] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>(
    orders.find((o) => o.id === propSelectedOrderId)?.riskLevel || orders[0]?.riskLevel || 'LOW'
  );

  // Keep internal state synced when prop changes
  React.useEffect(() => {
    if (propSelectedOrderId) {
      setSelectedOrderId(propSelectedOrderId);
      const ord = orders.find((o) => o.id === propSelectedOrderId);
      if (ord) {
        setSelectedSocietyId(ord.societyId);
        if (ord.riskLevel) {
          setImpact(ord.riskLevel);
        }
      }
    }
  }, [propSelectedOrderId, orders]);

  const activeOrder =
    orders.find((o) => o.id === (propSelectedOrderId || selectedOrderId)) ||
    orders.find((o) => o.id === selectedOrderId) ||
    orders.find((o) => o.societyId === selectedSocietyId) ||
    orders[0];

  const handleOrderChange = (orderId: string) => {
    setSelectedOrderId(orderId);
    const ord = orders.find((o) => o.id === orderId);
    if (ord) {
      setSelectedSocietyId(ord.societyId);
      if (ord.riskLevel) {
        setImpact(ord.riskLevel);
      }
      if (onSelectOrder) {
        onSelectOrder(ord);
      }
    }
  };

  const handleSocietyChange = (socId: string) => {
    setSelectedSocietyId(socId);
    const matchingOrder = orders.find((o) => o.societyId === socId);
    if (matchingOrder) {
      setSelectedOrderId(matchingOrder.id);
      if (onSelectOrder) {
        onSelectOrder(matchingOrder);
      }
    }
  };
  
  // Clean default text (blank initially until driver types, dictates voice, or AI photo detects)
  const [driverNotes, setDriverNotes] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoAiAnalysis, setPhotoAiAnalysis] = useState<any | null>(null);
  const [isDetectingPhoto, setIsDetectingPhoto] = useState<boolean>(false);
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isParsingAi, setIsParsingAi] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCustomerPopupPreview, setShowCustomerPopupPreview] = useState<boolean>(false);
  
  // Camera & File input state
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Visual Impact Configurations with Colored Gauge Bars
  const IMPACT_CONFIGS: {
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    label: string;
    delayRange: string;
    bars: number;
    colorHex: string;
    activeClass: string;
    badgeClass: string;
    barColor: string;
    description: string;
    actionPreview: string;
  }[] = [
    {
      level: 'LOW',
      label: 'Low',
      delayRange: '+5–15 min',
      bars: 1,
      colorHex: '#10b981',
      activeClass: 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-400 shadow-xs',
      badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      barColor: 'bg-emerald-500',
      description: 'Minor crawl or minor gate wait. Route remains viable with minor buffer.',
      actionPreview: 'Telematics alert logged • ETA padded by 10 mins',
    },
    {
      level: 'MEDIUM',
      label: 'Medium',
      delayRange: '+15–30 min',
      bars: 2,
      colorHex: '#f59e0b',
      activeClass: 'bg-amber-50 border-amber-500 text-amber-950 font-bold ring-2 ring-amber-400 shadow-xs',
      badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200',
      barColor: 'bg-amber-500',
      description: 'Moderate gate queue or lift delay. Customer window needs proactive notification.',
      actionPreview: 'Risk score elevated to 45 • Customer ETA updated (+20m)',
    },
    {
      level: 'HIGH',
      label: 'High',
      delayRange: '+30–60 min',
      bars: 3,
      colorHex: '#f97316',
      activeClass: 'bg-orange-50 border-orange-500 text-orange-950 font-bold ring-2 ring-orange-400 shadow-xs',
      badgeClass: 'bg-orange-100 text-orange-800 border border-orange-200',
      barColor: 'bg-orange-500',
      description: 'Significant blockage, excavation, or Mathadi union standoff halting delivery.',
      actionPreview: 'Risk score spikes to 76 • Real-time customer wait vs reschedule notice sent',
    },
    {
      level: 'CRITICAL',
      label: 'Critical',
      delayRange: '>60 min / Block',
      bars: 4,
      colorHex: '#e11d48',
      activeClass: 'bg-rose-50 border-rose-500 text-rose-950 font-bold ring-2 ring-rose-400 shadow-xs',
      badgeClass: 'bg-rose-100 text-rose-800 border border-rose-200',
      barColor: 'bg-rose-600',
      description: 'Total corridor shutdown, bridge excavation block, or vehicle impound risk.',
      actionPreview: 'Risk score 95/100 (CRITICAL) • Emergency customer reschedule flow triggered',
    },
  ];

  const currentImpactConfig = IMPACT_CONFIGS.find((c) => c.level === impact) || IMPACT_CONFIGS[2];
  const isHighTimeConsumption = impact === 'HIGH' || impact === 'CRITICAL';

  // 6 1-Tap Quick Presets
  const REPORT_PRESETS: {
    type: ConstraintType;
    label: string;
    icon: string;
    defaultAmount: number;
    defaultImpact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    defaultNote: string;
  }[] = [
    {
      type: 'MATHADI',
      label: 'Mathadi Union Demand',
      icon: '🚩',
      defaultAmount: 350,
      defaultImpact: 'HIGH',
      defaultNote: 'Mathadi union stopped vehicle at society gate demanding ₹350 cash per heavy item.',
    },
    {
      type: 'EXCAVATION',
      label: 'Road Digging / Metro',
      icon: '🚧',
      defaultAmount: 0,
      defaultImpact: 'HIGH',
      defaultNote: 'Road excavation & pipeline digging blocking heavy truck access near society entry.',
    },
    {
      type: 'ROAD_BLOCKAGE',
      label: 'Traffic Jam / Blockage',
      icon: '⛔',
      defaultAmount: 0,
      defaultImpact: 'MEDIUM',
      defaultNote: 'Heavy traffic congestion / breakdown blocking approach lane.',
    },
    {
      type: 'SOCIETY_FEE',
      label: 'Society Entry Fee',
      icon: '🏢',
      defaultAmount: 200,
      defaultImpact: 'MEDIUM',
      defaultNote: 'Security gate demanding ₹200 society gate maintenance pass fee.',
    },
    {
      type: 'BUILDING_ACCESS',
      label: 'Service Lift Shutdown',
      icon: '🛑',
      defaultAmount: 0,
      defaultImpact: 'HIGH',
      defaultNote: 'Tower service elevator undergoing maintenance. Freight restricted to manual stairs.',
    },
    {
      type: 'PARKING',
      label: 'Truck Parking Blocked',
      icon: '🅿️',
      defaultAmount: 0,
      defaultImpact: 'LOW',
      defaultNote: 'Unloading bay occupied by resident cars. Waiting for security clearance.',
    },
  ];

  // AI Multimodal Photo Detection Handler
  const handlePhotoCapturedOrSelected = async (dataUrl: string) => {
    setPhotoUrl(dataUrl);
    setIsDetectingPhoto(true);
    try {
      const res = await api.analyzeHazardPhoto(dataUrl, driverNotes);
      if (res.analysis) {
        setPhotoAiAnalysis(res.analysis);
        if (res.analysis.type) setSelectedType(res.analysis.type);
        if (res.analysis.severity) setImpact(res.analysis.severity);
        if (res.analysis.amount && res.analysis.amount > 0) setAmount(String(res.analysis.amount));
        
        // Auto fill driver notes if blank or short
        if (!driverNotes.trim() && res.analysis.suggestedNote) {
          setDriverNotes(res.analysis.suggestedNote);
        }
      }
    } catch (err) {
      console.error('Photo AI detection failed:', err);
    } finally {
      setIsDetectingPhoto(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        handlePhotoCapturedOrSelected(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // AI Auto-Parsing of voice or raw text note
  const handleAiParse = async (customNote?: string) => {
    const textToParse = customNote || driverNotes;
    if (!textToParse.trim()) return;
    try {
      setIsParsingAi(true);
      const selectedSoc = societies.find((s) => s.id === selectedSocietyId);
      const res = await api.parseDriverNote(textToParse, selectedSoc?.locality || 'Hinjewadi');
      if (res.parsed) {
        if (res.parsed.type) setSelectedType(res.parsed.type);
        if (res.parsed.amount) setAmount(String(res.parsed.amount));
        if (res.parsed.severity) setImpact(res.parsed.severity);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsParsingAi(false);
    }
  };

  // Voice dictation transcribed handler (fills notes when spoken)
  const handleTranscriptionReceived = (transcriptText: string) => {
    setDriverNotes(transcriptText);
    handleAiParse(transcriptText);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const selectedSoc = societies.find((s) => s.id === selectedSocietyId);

      await api.submitDriverReport({
        driverId: activeOrder?.assignedDriverId || 'DRV-02',
        driverName: activeOrder?.assignedDriverName || 'Santosh Kadam',
        orderId: activeOrder?.id || 'RM-82931',
        societyId: selectedSocietyId,
        societyName: selectedSoc?.name || 'Selected Society',
        type: selectedType,
        title: `${selectedType} reported at ${selectedSoc?.name?.split('-')[0]}`,
        amount: Number(amount) || 0,
        impact,
        notes: driverNotes || `${selectedType} logged by driver at ${selectedSoc?.name?.split('-')[0]}`,
        lat: selectedSoc?.lat || 18.5831,
        lng: selectedSoc?.lng || 73.6872,
        photoUrl: photoUrl || undefined,
      });

      setSuccessMessage('Ground-truth submitted! Real-time runtime updates synced for all customers, all drivers, all locations, and Operations KPIs.');
      onReportSubmitted();
      setTimeout(() => setSuccessMessage(null), 7000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto space-y-6">
      {/* Hidden File Input for Gallery / Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Driver Ground-Truth Quick-Report (&lt;20s)</h2>
              <span className="text-xs text-slate-600 font-semibold">
                {activeOrder?.assignedDriverName || 'Santosh Kadam'} ({activeOrder?.assignedVehicleNumber || activeOrder?.assignedVehicleId || 'MH-12-RN-8821'})
              </span>
            </div>
          </div>
          <span className="bg-emerald-50 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold border border-emerald-200">
            Active Route
          </span>
        </div>
        <p className="text-xs text-slate-600">
          Capture sudden road obstacles, gate demands, or lift issues in under 20 seconds. Use your <b>Camera</b> for photo proof (AI auto-detected) and <b>Voice Dictation</b> for hands-free notes.
        </p>
      </div>

      {/* Success Notification with Customer Message Intimation Trigger */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl shadow-xs space-y-3 animate-fade-in text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setShowCustomerPopupPreview(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] whitespace-nowrap transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              See Customer Message Popup &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Main Reporting Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-xs text-sm">
        {/* 1. Quick Presets */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider">
            1. Tap Hazard / Constraint Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {REPORT_PRESETS.map((preset) => {
              const isSelected = selectedType === preset.type;
              return (
                <button
                  type="button"
                  key={preset.type}
                  onClick={() => {
                    setSelectedType(preset.type);
                    setAmount(preset.defaultAmount > 0 ? String(preset.defaultAmount) : '');
                    setImpact(preset.defaultImpact);
                    if (!driverNotes.trim()) {
                      setDriverNotes(preset.defaultNote);
                    }
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-400'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-2xl mb-1">{preset.icon}</span>
                  <span className="text-xs">{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Customer Order & Target Location */}
        <div className="space-y-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider flex items-center justify-between">
              <span>2. Active Customer Order</span>
              {activeOrder && (
                <span className="text-[11px] text-indigo-700 font-bold">
                  Driver: {activeOrder.assignedDriverName}
                </span>
              )}
            </label>
            <select
              value={selectedOrderId}
              onChange={(e) => handleOrderChange(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-indigo-600"
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.customerName} ({o.id}) — {o.societyName.split('-')[0]} [Driver: {o.assignedDriverName}]
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase text-slate-500 tracking-wider">
              Society / Gate Location
            </label>
            <select
              value={selectedSocietyId}
              onChange={(e) => handleSocietyChange(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-2 text-xs font-medium focus:outline-none focus:border-indigo-600"
            >
              {societies.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.locality})
                </option>
              ))}
            </select>
          </div>

          {activeOrder && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer Target:</span>
                <span className="font-bold text-slate-800">{activeOrder.customerName}</span>
                <span className="text-slate-500 block">{activeOrder.customerPhone}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-indigo-600" />
                  <span>Scheduled Delivery:</span>
                </span>
                <span className="font-bold text-indigo-900">
                  {formatDeliverySchedule(activeOrder.deliveryDate, activeOrder.deliveryWindow).dayName}, {formatDeliverySchedule(activeOrder.deliveryDate, activeOrder.deliveryWindow).formattedDate}
                </span>
                <span className="text-slate-500 block">
                  Window: {formatDeliverySchedule(activeOrder.deliveryDate, activeOrder.deliveryWindow).window}
                  {activeOrder.status === 'RESCHEDULED' && (
                    <b className="text-emerald-700 ml-1 font-bold">[Rescheduled]</b>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 3. Camera Photo Capture with AI Visual Detection */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
              <span>3. Ground Photo Proof (AI Detectable)</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                <span>Upload</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{photoUrl ? 'Retake' : 'Open Camera'}</span>
              </button>
            </div>
          </div>

          {photoUrl ? (
            <div className="space-y-2">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 group aspect-16/7 bg-slate-900">
                <img
                  src={photoUrl}
                  alt="Ground Proof"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between p-3">
                  <span className="text-white text-xs font-bold bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                    Photo Attached
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoUrl(null);
                      setPhotoAiAnalysis(null);
                    }}
                    className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* AI Detection Result Badge & Extracted Details */}
              {isDetectingPhoto ? (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                  <span>Gemini 3.7 AI is inspecting photo for receipts, barricades, or gate restrictions...</span>
                </div>
              ) : photoAiAnalysis ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1.5 text-xs text-emerald-950 animate-fade-in">
                  <div className="flex items-center justify-between font-bold text-emerald-900">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>AI Visual Detection: Verified Ground Obstacle</span>
                    </div>
                    <span className="bg-emerald-200 text-emerald-900 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      98% Confidence
                    </span>
                  </div>
                  {photoAiAnalysis.detectedElements && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {photoAiAnalysis.detectedElements.map((elem: string, idx: number) => (
                        <span key={idx} className="bg-white border border-emerald-300 text-emerald-800 text-[10px] px-2 py-0.5 rounded-md font-semibold">
                          ✓ {elem}
                        </span>
                      ))}
                    </div>
                  )}
                  {photoAiAnalysis.suggestedTitle && (
                    <p className="text-[11px] text-slate-700">
                      <b>Identified:</b> {photoAiAnalysis.suggestedTitle}
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="py-3 px-3 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/50 text-slate-700 hover:text-emerald-900 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>Snap Live Camera</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-3 px-3 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-900 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>Upload Proof Photo</span>
              </button>
            </div>
          )}
        </div>

        {/* 4. Microphone Voice Dictation Integration */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <VoiceMicRecorder
            onTranscriptionComplete={handleTranscriptionReceived}
            placeholder="Tap 'Start Speaking' to dictate road work, gate demand, or lift delay..."
          />
        </div>

        {/* 5. Voice or Text Notes Input (Starts clean, fills on type or speak) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider">
              4. Driver Notes (Clean by default • Fills on dictation/typing)
            </label>
            {driverNotes.trim() && (
              <button
                type="button"
                onClick={() => handleAiParse()}
                disabled={isParsingAi}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isParsingAi ? 'AI Parsing...' : 'AI Auto-Extract'}</span>
              </button>
            )}
          </div>
          <textarea
            rows={2}
            value={driverNotes}
            onChange={(e) => setDriverNotes(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:border-indigo-600"
            placeholder="Clean field. Type or speak what happened at the gate/road..."
          />
        </div>

        {/* 6. Impact / Severity Level Selector with Visual Gauges & Colored Bars */}
        <div className="space-y-3 pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>5. Delay Severity &amp; Time Consumption</span>
            </label>
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${currentImpactConfig.badgeClass}`}>
              {currentImpactConfig.label.toUpperCase()} IMPACT ({currentImpactConfig.delayRange})
            </span>
          </div>

          {/* 4-Level Visual Cards Grid with Segmented Gauge Bars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {IMPACT_CONFIGS.map((cfg) => {
              const isSelected = impact === cfg.level;
              return (
                <button
                  type="button"
                  key={cfg.level}
                  onClick={() => setImpact(cfg.level)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? cfg.activeClass
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {/* Visual 4-Segment Colored Gauge Bars */}
                  <div className="flex items-center gap-1 w-full">
                    {[1, 2, 3, 4].map((barIndex) => {
                      const isBarFilled = barIndex <= cfg.bars;
                      return (
                        <div
                          key={barIndex}
                          className={`h-2 flex-1 rounded-sm transition-all ${
                            isBarFilled
                              ? cfg.barColor
                              : 'bg-slate-200 opacity-50'
                          }`}
                        />
                      );
                    })}
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{cfg.label}</span>
                      <span className="text-[10px] font-mono font-bold opacity-75">
                        {cfg.bars}/4
                      </span>
                    </div>
                    <span className="text-[11px] opacity-80 block font-medium">
                      {cfg.delayRange}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dynamic Customer Intimation Rule Box for Selected Severity */}
          {impact === 'LOW' && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Low Impact: Reassuring On-Track Customer Message</span>
                </div>
                <span className="bg-emerald-200 text-emerald-900 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {currentImpactConfig.delayRange}
                </span>
              </div>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                Because you marked minimal impact, the customer tracking remains in <b>High Confidence (Normal)</b> status with confirmed on-track arrival and driver details.
              </p>
              <button
                type="button"
                onClick={() => setShowCustomerPopupPreview(true)}
                className="w-full py-2 rounded-xl bg-white hover:bg-emerald-100 text-emerald-950 font-bold text-xs border border-emerald-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
                <span>Preview Low-Risk Customer Message &rarr;</span>
              </button>
            </div>
          )}

          {impact === 'MEDIUM' && (
            <div className="p-3.5 bg-blue-50 border border-blue-300 rounded-2xl space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-blue-950 text-xs">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Medium Impact: Minor Transit Buffer Notification</span>
                </div>
                <span className="bg-blue-200 text-blue-900 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {currentImpactConfig.delayRange}
                </span>
              </div>
              <p className="text-[11px] text-blue-900 leading-relaxed">
                A brief 15–20 min buffer will be added to the customer's arrival window without alarming them with high-risk alerts.
              </p>
              <button
                type="button"
                onClick={() => setShowCustomerPopupPreview(true)}
                className="w-full py-2 rounded-xl bg-white hover:bg-blue-100 text-blue-950 font-bold text-xs border border-blue-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Smartphone className="w-3.5 h-3.5 text-blue-700" />
                <span>Preview Medium-Risk Customer Message &rarr;</span>
              </button>
            </div>
          )}

          {impact === 'HIGH' && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-amber-950 text-xs">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>High Impact: Customer Choice Intimation Active</span>
                </div>
                <span className="bg-amber-200 text-amber-900 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {currentImpactConfig.delayRange}
                </span>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                Because you marked significant time consumption, an automated notice will go to the customer giving them the clear choice to <b>continue waiting</b> or <b>reschedule delivery</b> to tomorrow with zero cancellation fee.
              </p>
              <button
                type="button"
                onClick={() => setShowCustomerPopupPreview(true)}
                className="w-full py-2 rounded-xl bg-white hover:bg-amber-100 text-amber-950 font-bold text-xs border border-amber-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-700" />
                <span>Preview High-Risk Customer Wait / Reschedule Message &rarr;</span>
              </button>
            </div>
          )}

          {impact === 'CRITICAL' && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-rose-950 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Critical Impact: Emergency Access Notice</span>
                </div>
                <span className="bg-rose-200 text-rose-900 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {currentImpactConfig.delayRange}
                </span>
              </div>
              <p className="text-[11px] text-rose-900 leading-relaxed">
                A critical corridor disruption alert is triggered. The customer will immediately receive an emergency status update with priority 1-tap rescheduling.
              </p>
              <button
                type="button"
                onClick={() => setShowCustomerPopupPreview(true)}
                className="w-full py-2 rounded-xl bg-white hover:bg-rose-100 text-rose-950 font-bold text-xs border border-rose-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Smartphone className="w-3.5 h-3.5 text-rose-700" />
                <span>Preview Critical-Risk Customer Message &rarr;</span>
              </button>
            </div>
          )}
        </div>

        {/* 7. Demand Amount (if Mathadi / Gate fee) */}
        {(selectedType === 'MATHADI' || selectedType === 'SOCIETY_FEE') && (
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider">
              Cash Demand Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                value={amount}
                placeholder="350"
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl pl-8 pr-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? 'Transmitting Ground-Truth...' : 'Submit Ground-Truth Report (<20s)'}</span>
        </button>
      </form>

      {/* Live Camera Viewfinder Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onPhotoCaptured={(dataUrl) => handlePhotoCapturedOrSelected(dataUrl)}
        title="Capture Ground Hazard / Gate Proof"
      />

      {/* Customer Notification Popup Modal */}
      {orders[0] && (
        <CustomerMessageModal
          isOpen={showCustomerPopupPreview}
          onClose={() => setShowCustomerPopupPreview(false)}
          order={activeOrder || orders[0]}
          overrideRiskLevel={impact}
          overrideDelayMinutes={impact === 'CRITICAL' ? 55 : impact === 'HIGH' ? 35 : impact === 'MEDIUM' ? 15 : 5}
          onOrderRescheduled={() => onReportSubmitted()}
        />
      )}
    </div>
  );
};
