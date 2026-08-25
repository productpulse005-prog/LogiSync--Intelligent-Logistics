import React, { useState } from 'react';
import {
  MapPin,
  Truck,
  Activity,
  Sparkles,
  Smartphone,
  UserCheck,
  Brain,
  Sliders,
  ChevronDown,
  PlayCircle,
  RefreshCw,
  Layers,
  Compass,
  Navigation,
  CheckCircle2,
  Globe,
  Radio,
  Calendar,
} from 'lucide-react';
import { CityId, SUPPORTED_CITIES } from '../data/multiCityData';

export type MainNavTab =
  | 'DELIVERIES'
  | 'MAP'
  | 'CUSTOMER_DRIVER'
  | 'INTELLIGENCE'
  | 'GUIDED_DEMO';

export type SubTabOption =
  | 'CUSTOMER'
  | 'DRIVER'
  | 'AB_EXPERIMENT'
  | 'LEARNING'
  | 'CONSTRAINTS';

interface HeaderProps {
  activeTab: MainNavTab;
  setActiveTab: (tab: MainNavTab) => void;
  activeCity: CityId;
  onCityChange: (city: CityId) => void;
  isDetectingLocation: boolean;
  detectedLocationLabel: string | null;
  onDetectLocation: () => void;
  onOpenCopilot: () => void;
  onResetData: () => void;
  isResetting?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeCity,
  onCityChange,
  isDetectingLocation,
  detectedLocationLabel,
  onDetectLocation,
  onOpenCopilot,
  onResetData,
  isResetting,
}) => {
  const [showCityMenu, setShowCityMenu] = useState(false);

  const currentCityConfig = SUPPORTED_CITIES[activeCity] || SUPPORTED_CITIES.PUNE;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Banner: Auto-Location Detection & Hub Switcher */}
      <div className="bg-slate-900 text-slate-200 px-4 py-2 flex flex-wrap items-center justify-between text-xs gap-2">
        <div className="flex flex-wrap items-center gap-3">
          {/* Location Detection Pill */}
          <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700/80 rounded-lg px-2.5 py-1 text-slate-200 shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-emerald-400">GPS Geo-Detect:</span>
            <span className="text-slate-100 font-medium">
              {detectedLocationLabel || `${currentCityConfig.name} (${currentCityConfig.state})`}
            </span>
            <button
              onClick={onDetectLocation}
              disabled={isDetectingLocation}
              title="Click to refresh GPS coordinates"
              className="ml-1 text-[11px] bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white px-2 py-0.5 rounded transition-all flex items-center gap-1 font-medium cursor-pointer"
            >
              <Radio className={`w-3 h-3 text-indigo-400 ${isDetectingLocation ? 'animate-spin' : ''}`} />
              <span>{isDetectingLocation ? 'Locating...' : 'Refresh GPS'}</span>
            </button>
          </div>

          <span className="hidden xl:inline text-slate-400 text-[11px]">
            Ground-Truth Logistics Engine • {currentCityConfig.warehouses.length} Active Hubs Monitored
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Live Runtime Date Pill */}
          <div className="inline-flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 rounded-lg px-2.5 py-1 text-slate-200">
            <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-slate-400 text-[11px] font-medium">Live Ops:</span>
            <span className="font-bold text-emerald-400 text-[11px]">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          {/* Multi-City Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowCityMenu(!showCityMenu)}
              className="flex items-center gap-1.5 text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded-lg font-semibold text-xs shadow-xs transition-all cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-white" />
              <span>Hub: {currentCityConfig.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-indigo-200" />
            </button>

            {showCityMenu && (
              <div className="absolute right-0 mt-1.5 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl py-1.5 z-50 animate-fade-in text-slate-800">
                <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-slate-500">
                    Select Active Metro Hub
                  </span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
                    All 5 Cities Live
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {(Object.keys(SUPPORTED_CITIES) as CityId[]).map((cityId) => {
                    const city = SUPPORTED_CITIES[cityId];
                    const isSelected = cityId === activeCity;
                    return (
                      <button
                        key={cityId}
                        onClick={() => {
                          onCityChange(cityId);
                          setShowCityMenu(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-xs flex flex-col hover:bg-slate-50 transition-colors cursor-pointer ${
                          isSelected ? 'bg-indigo-50/80 text-indigo-900 font-semibold' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold flex items-center gap-1.5">
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                            {city.name}
                          </span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {city.state}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-normal mt-0.5 line-clamp-1">
                          Corridors: {city.localities.slice(0, 4).join(', ')}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Reset Demo Button */}
          <button
            onClick={onResetData}
            disabled={isResetting}
            title="Reset dataset to baseline"
            className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors text-xs font-medium px-2.5 py-1 rounded-lg cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-indigo-400' : ''}`} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 bg-white">
        {/* Brand & City Context */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20 text-white font-black text-lg">
            L
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-slate-900 tracking-tight">LogiSync</span>
              <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold border border-indigo-100">
                Delivery Confidence
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Active Hub: <span className="font-semibold text-slate-800">{currentCityConfig.name}</span> ({currentCityConfig.localities.slice(0, 5).join(' • ')})
            </p>
          </div>
        </div>

        {/* Primary 4-Tab Navigation */}
        <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
          <button
            onClick={() => setActiveTab('DELIVERIES')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'DELIVERIES'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Deliveries &amp; Control</span>
          </button>

          <button
            onClick={() => setActiveTab('MAP')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'MAP'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Ground Map</span>
          </button>

          <button
            onClick={() => setActiveTab('CUSTOMER_DRIVER')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'CUSTOMER_DRIVER'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Customer &amp; Driver</span>
          </button>

          <button
            onClick={() => setActiveTab('INTELLIGENCE')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'INTELLIGENCE'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Intelligence &amp; Learning</span>
          </button>
        </nav>

        {/* Action Buttons: Guided Demo & AI Copilot */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('GUIDED_DEMO')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              activeTab === 'GUIDED_DEMO'
                ? 'bg-amber-500 text-white border-amber-600 shadow-md'
                : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
            }`}
          >
            <PlayCircle className="w-4 h-4 text-amber-600" />
            <span>1-Click Guided Demo</span>
          </button>

          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <span>AI Copilot</span>
          </button>
        </div>
      </div>
    </header>
  );
};
