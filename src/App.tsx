import React, { useState, useEffect, useCallback } from 'react';
import { Header, MainNavTab } from './components/Header';
import { OperationsControlTower } from './components/OperationsControlTower';
import { LogisticsMap } from './components/LogisticsMap';
import { DriverReportingApp } from './components/DriverReportingApp';
import { CustomerDeliveryConfidence } from './components/CustomerDeliveryConfidence';
import { ActualVsPredictedLearning } from './components/ActualVsPredictedLearning';
import { AdminConstraintsView } from './components/AdminConstraintsView';
import { ExperimentControlVsPilot } from './components/ExperimentControlVsPilot';
import { InteractiveDemoRunner } from './components/InteractiveDemoRunner';
import { AiCopilotDrawer } from './components/AiCopilotDrawer';
import {
  Order,
  SocietyProfile,
  LogisticsConstraint,
  DriverReport,
  LearningRecord,
  OperationsKpis,
  ExperimentMetrics,
  Vehicle,
} from './types';
import { api } from './services/api';
import { CityId, SUPPORTED_CITIES, detectClosestCity } from './data/multiCityData';
import {
  RefreshCw,
  AlertCircle,
  Smartphone,
  UserCheck,
  Layers,
  Brain,
  Sliders,
  Radio,
  MapPin,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainNavTab>('DELIVERIES');
  const [customerDriverSubTab, setCustomerDriverSubTab] = useState<'CUSTOMER' | 'DRIVER'>('CUSTOMER');
  const [intelligenceSubTab, setIntelligenceSubTab] = useState<'AB_EXPERIMENT' | 'LEARNING' | 'CONSTRAINTS'>('AB_EXPERIMENT');

  // Multi-City & Location Detection State
  const [activeCity, setActiveCity] = useState<CityId>('PUNE');
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [detectedLocationLabel, setDetectedLocationLabel] = useState<string | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [societies, setSocieties] = useState<SocietyProfile[]>([]);
  const [constraints, setConstraints] = useState<LogisticsConstraint[]>([]);
  const [kpis, setKpis] = useState<OperationsKpis | null>(null);
  const [experimentMetrics, setExperimentMetrics] = useState<ExperimentMetrics | null>(null);
  const [driverReports, setDriverReports] = useState<DriverReport[]>([]);
  const [learningRecords, setLearningRecords] = useState<LearningRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [copilotInitialQuery, setCopilotInitialQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load all system data for active city
  const loadData = useCallback(async (cityOverride?: CityId) => {
    const targetCity = cityOverride || activeCity;
    try {
      setError(null);
      api.setCity(targetCity);

      const [
        ordersRes,
        socRes,
        constRes,
        kpiRes,
        expRes,
        repRes,
        learnRes,
        fleetRes,
      ] = await Promise.all([
        api.getOrders({ limit: 1000, city: targetCity }),
        api.getSocieties({ city: targetCity }),
        api.getConstraints({ city: targetCity }),
        api.getKpis(targetCity),
        api.getExperimentMetrics(targetCity),
        api.getDriverReports(targetCity),
        api.getLearningRecords(targetCity),
        api.getFleet(targetCity),
      ]);

      setOrders(ordersRes.orders);
      setSocieties(socRes);
      setConstraints(constRes);
      setKpis(kpiRes);
      setExperimentMetrics(expRes);
      setDriverReports(repRes);
      setLearningRecords(learnRes);
      setVehicles(fleetRes.vehicles);

      // Keep selected order in sync if currently selected
      if (selectedOrder) {
        const updated = ordersRes.orders.find((o) => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
        else setSelectedOrder(ordersRes.orders[0] || null);
      }
    } catch (err: any) {
      console.error('Failed to load logistics data:', err);
      setError(err?.message || 'Failed to initialize logistics platform');
    } finally {
      setIsLoading(false);
    }
  }, [activeCity, selectedOrder]);

  // Geolocation detection handler
  const detectUserLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setDetectedLocationLabel('Geolocation not available in browser');
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const detected = detectClosestCity(latitude, longitude);
        const cityConfig = SUPPORTED_CITIES[detected];

        setActiveCity(detected);
        api.setCity(detected);
        setDetectedLocationLabel(`GPS: ${cityConfig.name} Hub (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E)`);
        setIsDetectingLocation(false);
        loadData(detected);
      },
      (geoError) => {
        console.warn('Geolocation permission/error:', geoError.message);
        setIsDetectingLocation(false);
        setDetectedLocationLabel(`Pune Hub (Default)`);
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  }, [loadData]);

  // Run location detection on initial app mount
  useEffect(() => {
    detectUserLocation();
    loadData('PUNE');
  }, []);

  // Handle manual city switch
  const handleCityChange = (newCity: CityId) => {
    setActiveCity(newCity);
    api.setCity(newCity);
    setSelectedOrder(null);
    setDetectedLocationLabel(`Manual Hub: ${SUPPORTED_CITIES[newCity].name}`);
    loadData(newCity);
  };

  // Action Handlers
  const handleApplyAction = async (orderId: string) => {
    const res = await api.applyOrderAction(orderId, activeCity);
    if (res.success) {
      await loadData();
    }
  };

  const handleRescheduleSlot = async (orderId: string, newSlot: string) => {
    const res = await api.rescheduleSlot(orderId, newSlot, undefined, activeCity);
    if (res.success) {
      await loadData();
    }
  };

  const handleCompleteDelivery = async (orderId: string, actuals: any) => {
    const res = await api.completeDelivery(orderId, { ...actuals, city: activeCity });
    if (res.success) {
      await loadData();
    }
  };

  const handleTriggerDisruption = async () => {
    await api.triggerDemoDisruption(activeCity);
    await loadData();
  };

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await api.resetDemo(activeCity);
      await loadData();
    } finally {
      setIsResetting(false);
    }
  };

  const handleViewOnMap = (order: Order) => {
    setSelectedOrder(order);
    setActiveTab('MAP');
  };

  const handleOpenCopilotWithQuery = (query: string) => {
    setCopilotInitialQuery(query);
    setIsCopilotOpen(true);
  };

  if (isLoading || !kpis || !experimentMetrics) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800 space-y-4 p-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 text-white">
          <RefreshCw className="w-7 h-7 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-base font-bold text-slate-900">Loading LogiSync Intelligence</h2>
          <p className="text-xs text-slate-500">Detecting location &amp; preparing urban micro-constraints...</p>
        </div>
      </div>
    );
  }

  const currentCityConfig = SUPPORTED_CITIES[activeCity] || SUPPORTED_CITIES.PUNE;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Global Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeCity={activeCity}
        onCityChange={handleCityChange}
        isDetectingLocation={isDetectingLocation}
        detectedLocationLabel={detectedLocationLabel}
        onDetectLocation={detectUserLocation}
        onOpenCopilot={() => {
          setCopilotInitialQuery('');
          setIsCopilotOpen(true);
        }}
        onResetData={handleResetDemo}
        isResetting={isResetting}
      />

      {/* Error Notice */}
      {error && (
        <div className="bg-rose-50 border-b border-rose-200 text-rose-800 px-4 py-2 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-700 hover:text-rose-900 font-bold cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Tab Content */}
      <main className="flex-1">
        {activeTab === 'DELIVERIES' && (
          <OperationsControlTower
            orders={orders}
            kpis={kpis}
            societies={societies}
            constraints={constraints}
            activeCity={activeCity}
            onSelectOrder={(order) => setSelectedOrder(order)}
            onApplyAction={handleApplyAction}
            onRescheduleSlot={handleRescheduleSlot}
            onCompleteDelivery={handleCompleteDelivery}
            onRefresh={() => loadData(activeCity)}
            selectedOrder={selectedOrder}
            onCloseDrawer={() => setSelectedOrder(null)}
            onViewOnMap={handleViewOnMap}
            onOpenCopilotWithQuery={handleOpenCopilotWithQuery}
          />
        )}

        {activeTab === 'MAP' && (
          <LogisticsMap
            societies={societies}
            constraints={constraints}
            orders={orders}
            vehicles={vehicles}
            selectedOrder={selectedOrder}
            activeCity={activeCity}
            onSelectOrder={(order) => setSelectedOrder(order)}
          />
        )}

        {activeTab === 'CUSTOMER_DRIVER' && (
          <div className="space-y-4">
            {/* Sub-Switch Bar for Customer & Driver */}
            <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-center gap-2">
              <button
                onClick={() => setCustomerDriverSubTab('CUSTOMER')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  customerDriverSubTab === 'CUSTOMER'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Customer Delivery Confidence Tracker</span>
              </button>

              <button
                onClick={() => setCustomerDriverSubTab('DRIVER')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  customerDriverSubTab === 'DRIVER'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Driver Ground-Truth Quick Report</span>
              </button>
            </div>

            {customerDriverSubTab === 'CUSTOMER' ? (
              <CustomerDeliveryConfidence
                orders={orders}
                selectedOrderId={selectedOrder?.id || orders[0]?.id}
                onSelectOrder={(order) => setSelectedOrder(order)}
                onOrderUpdated={() => loadData()}
              />
            ) : (
              <DriverReportingApp
                societies={societies}
                orders={orders}
                selectedOrderId={selectedOrder?.id || orders[0]?.id}
                onSelectOrder={(order) => setSelectedOrder(order)}
                onReportSubmitted={() => loadData()}
              />
            )}
          </div>
        )}

        {activeTab === 'INTELLIGENCE' && (
          <div className="space-y-4">
            {/* Sub-Switch Bar for Intelligence */}
            <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-center gap-2">
              <button
                onClick={() => setIntelligenceSubTab('AB_EXPERIMENT')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  intelligenceSubTab === 'AB_EXPERIMENT'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>A/B Pilot Validation</span>
              </button>

              <button
                onClick={() => setIntelligenceSubTab('LEARNING')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  intelligenceSubTab === 'LEARNING'
                    ? 'bg-violet-50 text-violet-800 border border-violet-200 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Brain className="w-4 h-4" />
                <span>Closed-Loop Learning</span>
              </button>

              <button
                onClick={() => setIntelligenceSubTab('CONSTRAINTS')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  intelligenceSubTab === 'CONSTRAINTS'
                    ? 'bg-slate-100 text-slate-900 border border-slate-300 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Master Society &amp; Constraint Rules</span>
              </button>
            </div>

            {intelligenceSubTab === 'AB_EXPERIMENT' && (
              <ExperimentControlVsPilot metrics={experimentMetrics} activeCity={activeCity} />
            )}

            {intelligenceSubTab === 'LEARNING' && (
              <ActualVsPredictedLearning
                learningRecords={learningRecords}
                societies={societies}
              />
            )}

            {intelligenceSubTab === 'CONSTRAINTS' && (
              <AdminConstraintsView
                constraints={constraints}
                societies={societies}
                driverReports={driverReports}
                onRefreshData={() => loadData()}
              />
            )}
          </div>
        )}

        {activeTab === 'GUIDED_DEMO' && (
          <InteractiveDemoRunner
            orders={orders}
            societies={societies}
            constraints={constraints}
            onTriggerDisruption={handleTriggerDisruption}
            onApplyMitigation={handleApplyAction}
            onCompleteDelivery={handleCompleteDelivery}
            onResetDemo={handleResetDemo}
            onViewOrder={(order) => setSelectedOrder(order)}
            onNavigateToTab={(tab) => {
              if (tab === 'DELIVERIES' || tab === 'OPERATIONS') setActiveTab('DELIVERIES');
              else if (tab === 'MAP') setActiveTab('MAP');
              else if (tab === 'CUSTOMER_TRACKING' || tab === 'DRIVER_APP') {
                setActiveTab('CUSTOMER_DRIVER');
                setCustomerDriverSubTab(tab === 'CUSTOMER_TRACKING' ? 'CUSTOMER' : 'DRIVER');
              } else if (tab === 'LEARNING' || tab === 'ADMIN_CONSTRAINTS' || tab === 'EXPERIMENT_AB') {
                setActiveTab('INTELLIGENCE');
                setIntelligenceSubTab(
                  tab === 'LEARNING' ? 'LEARNING' : tab === 'ADMIN_CONSTRAINTS' ? 'CONSTRAINTS' : 'AB_EXPERIMENT'
                );
              }
            }}
          />
        )}
      </main>

      {/* AI Operations Copilot Drawer */}
      <AiCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        initialQuery={copilotInitialQuery}
        activeCity={activeCity}
      />
    </div>
  );
}
