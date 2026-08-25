import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Layers,
  MapPin,
  AlertTriangle,
  Truck,
  Building,
  Navigation,
  Info,
  Flame,
  Shield,
  Eye,
  RotateCcw,
  X,
  Compass,
} from 'lucide-react';
import {
  SocietyProfile,
  LogisticsConstraint,
  Order,
  Vehicle,
  LocalityType,
} from '../types';
import { CityId, SUPPORTED_CITIES } from '../data/multiCityData';

interface LogisticsMapProps {
  societies: SocietyProfile[];
  constraints: LogisticsConstraint[];
  orders: Order[];
  vehicles: Vehicle[];
  selectedOrder: Order | null;
  activeCity?: CityId;
  onSelectOrder: (order: Order) => void;
  onSelectSociety?: (society: SocietyProfile) => void;
}

export const LogisticsMap: React.FC<LogisticsMapProps> = ({
  societies,
  constraints,
  orders,
  vehicles,
  selectedOrder,
  activeCity = 'PUNE',
  onSelectOrder,
  onSelectSociety,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<{
    constraints: L.LayerGroup;
    societies: L.LayerGroup;
    vehicles: L.LayerGroup;
    routes: L.LayerGroup;
    heatmaps: L.LayerGroup;
  } | null>(null);

  const currentCityConfig = SUPPORTED_CITIES[activeCity] || SUPPORTED_CITIES.PUNE;

  // Layer Visibility Toggles
  const [showConstraints, setShowConstraints] = useState(true);
  const [showSocieties, setShowSocieties] = useState(true);
  const [showVehicles, setShowVehicles] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showMathadiHotspots, setShowMathadiHotspots] = useState(true);

  // Selected item inspector in sidebar
  const [inspectedItem, setInspectedItem] = useState<{
    type: 'SOCIETY' | 'CONSTRAINT' | 'ORDER';
    data: any;
  } | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Map instance
    const map = L.map(mapContainerRef.current, {
      center: [currentCityConfig.center.lat, currentCityConfig.center.lng],
      zoom: currentCityConfig.center.zoom,
      zoomControl: false,
    });

    // Clean, crisp Voyager Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initialize layer groups
    const constraintGroup = L.layerGroup().addTo(map);
    const societyGroup = L.layerGroup().addTo(map);
    const vehicleGroup = L.layerGroup().addTo(map);
    const routeGroup = L.layerGroup().addTo(map);
    const heatmapGroup = L.layerGroup().addTo(map);

    layerGroupsRef.current = {
      constraints: constraintGroup,
      societies: societyGroup,
      vehicles: vehicleGroup,
      routes: routeGroup,
      heatmaps: heatmapGroup,
    };

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Re-center map when active city changes
  useEffect(() => {
    if (mapInstanceRef.current && currentCityConfig) {
      mapInstanceRef.current.flyTo(
        [currentCityConfig.center.lat, currentCityConfig.center.lng],
        currentCityConfig.center.zoom,
        { duration: 1.2 }
      );
    }
  }, [activeCity, currentCityConfig]);

  // Update Layers whenever data or toggle states change
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupsRef.current) return;
    const { constraints: cGroup, societies: sGroup, vehicles: vGroup, routes: rGroup, heatmaps: hGroup } = layerGroupsRef.current;

    // 1. Render Constraints
    cGroup.clearLayers();
    if (showConstraints) {
      constraints.forEach((c) => {
        if (c.status !== 'ACTIVE') return;

        const color = c.severity === 'CRITICAL' ? '#e11d48' : c.severity === 'HIGH' ? '#ea580c' : '#ca8a04';

        // Hazard Circle
        const circle = L.circle([c.lat, c.lng], {
          radius: c.radiusMeters || 350,
          color: color,
          fillColor: color,
          fillOpacity: 0.2,
          weight: 2,
          dashArray: '4, 4',
        });

        // Center Icon Marker
        const icon = L.divIcon({
          className: 'custom-constraint-icon',
          html: `
            <div style="background-color: ${color}; color: white; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: bold; box-shadow: 0 2px 6px rgba(0,0,0,0.3); border: 2px solid white; cursor: pointer;">
              !
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([c.lat, c.lng], { icon });

        marker.on('click', () => {
          setInspectedItem({ type: 'CONSTRAINT', data: c });
        });

        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; padding: 2px;">
            <strong style="color: ${color}; font-size: 13px;">${c.title}</strong><br/>
            <span style="color: #64748b;">${c.locality} • ${c.type}</span><br/>
            <div style="margin-top: 4px; font-weight: 600;">Expected Delay: +${c.expectedDelayMinutes} min</div>
            <div style="color: #475569; font-size: 11px;">${c.notes}</div>
          </div>
        `);

        cGroup.addLayer(circle);
        cGroup.addLayer(marker);
      });
    }

    // 2. Render Gated Societies
    sGroup.clearLayers();
    if (showSocieties) {
      societies.forEach((soc) => {
        const hasHighMathadi = soc.mathadiProbability >= 70;
        const iconColor = hasHighMathadi ? '#7c3aed' : '#059669';

        const icon = L.divIcon({
          className: 'custom-society-icon',
          html: `
            <div style="background-color: white; border: 2px solid ${iconColor}; color: ${iconColor}; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.15); cursor: pointer;">
              ${soc.mathadiProbability > 50 ? 'M' : 'S'}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([soc.lat, soc.lng], { icon });

        marker.on('click', () => {
          setInspectedItem({ type: 'SOCIETY', data: soc });
          if (onSelectSociety) onSelectSociety(soc);
        });

        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; padding: 2px;">
            <strong style="font-size: 13px; color: #0f172a;">${soc.name}</strong><br/>
            <span style="color: #64748b;">${soc.locality} • Conf: ${soc.confidenceScore}%</span><br/>
            <div style="margin-top: 4px;">
              ${soc.mathadiProbability > 0 ? `<strong>Mathadi Risk:</strong> ${soc.mathadiProbability}% (₹${soc.typicalMathadiCharge})<br/>` : ''}
              <strong>Service Lift:</strong> ${soc.serviceLiftAvailability ? 'Available' : 'Stairs Only'}<br/>
              <strong>Gate Window:</strong> ${soc.deliveryWindow}
            </div>
          </div>
        `);

        sGroup.addLayer(marker);
      });
    }

    // 3. Render Fleet Vehicles
    vGroup.clearLayers();
    if (showVehicles) {
      vehicles.forEach((veh) => {
        const icon = L.divIcon({
          className: 'custom-vehicle-icon',
          html: `
            <div style="background-color: #2563eb; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 4px 8px rgba(37,99,235,0.4); border: 2px solid white; cursor: pointer;">
              🚚
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([veh.currentLat, veh.currentLng], { icon });
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px;">
            <strong style="color: #1e40af;">${veh.vehicleNumber}</strong><br/>
            <span>${veh.model}</span><br/>
            <span>Active Orders: ${veh.activeOrdersCount}</span>
          </div>
        `);
        vGroup.addLayer(marker);
      });
    }

    // 4. Render Active Routes & Waypoints
    rGroup.clearLayers();
    if (showRoutes && selectedOrder && selectedOrder.routeWaypoints) {
      // Standard / Primary Route
      const primaryPolyline = L.polyline(selectedOrder.routeWaypoints, {
        color: '#dc2626',
        weight: 4,
        dashArray: '6, 8',
        opacity: 0.8,
      });

      rGroup.addLayer(primaryPolyline);

      // Alternate / Mitigated Route
      if (selectedOrder.alternateRouteWaypoints) {
        const altPolyline = L.polyline(selectedOrder.alternateRouteWaypoints, {
          color: '#059669',
          weight: 5,
          opacity: 0.9,
        });
        rGroup.addLayer(altPolyline);
      }
    }

    // 5. Mathadi / Union Risk Hotspot Rings
    hGroup.clearLayers();
    if (showMathadiHotspots) {
      societies.forEach((soc) => {
        if (soc.mathadiProbability >= 70) {
          const halo = L.circle([soc.lat, soc.lng], {
            radius: 500,
            color: '#7c3aed',
            fillColor: '#8b5cf6',
            fillOpacity: 0.12,
            weight: 1,
          });
          hGroup.addLayer(halo);
        }
      });
    }
  }, [
    societies,
    constraints,
    vehicles,
    orders,
    selectedOrder,
    showConstraints,
    showSocieties,
    showVehicles,
    showRoutes,
    showMathadiHotspots,
  ]);

  // Jump to Preset Zone
  const handleZoneJump = (zone: { lat: number; lng: number; zoom: number }) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([zone.lat, zone.lng], zone.zoom, { duration: 1 });
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-125px)] bg-slate-100 relative overflow-hidden">
      {/* Map Canvas */}
      <div className="flex-1 relative h-full">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Top Floating Zone Selector */}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-lg border border-slate-200">
          <span className="text-[11px] uppercase font-bold text-slate-500 flex items-center gap-1 mr-1">
            <Compass className="w-3.5 h-3.5 text-indigo-600" />
            {currentCityConfig.name} Corridors:
          </span>
          {currentCityConfig.zones.map((zone) => (
            <button
              key={zone.name}
              onClick={() => handleZoneJump(zone)}
              className="text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              {zone.name}
            </button>
          ))}
        </div>

        {/* Floating Layer Controls */}
        <div className="absolute top-16 left-3 z-10 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-slate-200 text-xs space-y-2 w-56">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Intelligence Layers
            </span>
          </div>

          <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-medium hover:text-slate-900">
            <input
              type="checkbox"
              checked={showConstraints}
              onChange={(e) => setShowConstraints(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              Road &amp; Access Blocks
            </span>
          </label>

          <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-medium hover:text-slate-900">
            <input
              type="checkbox"
              checked={showSocieties}
              onChange={(e) => setShowSocieties(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-600"></span>
              Gated High-Rises ({societies.length})
            </span>
          </label>

          <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-medium hover:text-slate-900">
            <input
              type="checkbox"
              checked={showMathadiHotspots}
              onChange={(e) => setShowMathadiHotspots(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-600"></span>
              Union / Handling Hotspots
            </span>
          </label>

          <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-medium hover:text-slate-900">
            <input
              type="checkbox"
              checked={showVehicles}
              onChange={(e) => setShowVehicles(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="flex items-center gap-1">🚚 Fleet Telematics ({vehicles.length})</span>
          </label>

          <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-medium hover:text-slate-900">
            <input
              type="checkbox"
              checked={showRoutes}
              onChange={(e) => setShowRoutes(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="flex items-center gap-1">🛣️ Reroute Paths</span>
          </label>
        </div>

        {/* Bottom Legend */}
        <div className="absolute bottom-4 left-3 z-10 bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2 rounded-xl text-xs flex flex-wrap items-center gap-4 shadow-xl">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-600"></span>
            <span>Road Block / Excavation Hazard</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-violet-600"></span>
            <span>Mathadi Union Hotspot (&gt;70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-emerald-600"></span>
            <span>Gated High-Rise Society</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 bg-emerald-600"></span>
            <span>AI Dynamic Reroute Bypass</span>
          </div>
        </div>
      </div>

      {/* Right Sidebar Inspector Panel */}
      <div className="w-full md:w-96 bg-white border-t md:border-t-0 md:border-l border-slate-200 flex flex-col h-72 md:h-full z-10 overflow-y-auto shadow-lg">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Location Inspector</h3>
          </div>
          {inspectedItem && (
            <button
              onClick={() => setInspectedItem(null)}
              className="text-xs text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="p-4 space-y-4 flex-1 text-sm text-slate-700">
          {/* If Society is clicked */}
          {inspectedItem?.type === 'SOCIETY' && (
            <div className="space-y-3 animate-fade-in">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[11px] uppercase font-bold text-indigo-700">Society Profile</span>
                <h4 className="font-bold text-slate-900 text-base">{inspectedItem.data.name}</h4>
                <p className="text-slate-500 text-xs">{inspectedItem.data.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px] block font-medium">Mathadi Probability</span>
                  <span className="font-bold text-amber-700 text-sm">{inspectedItem.data.mathadiProbability}%</span>
                  <span className="text-[11px] text-slate-500 block">Avg: ₹{inspectedItem.data.typicalMathadiCharge}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px] block font-medium">Society Gate Fee</span>
                  <span className="font-bold text-slate-900 text-sm">₹{inspectedItem.data.societyFee}</span>
                  <span className="text-[11px] text-slate-500 block">Delivery token</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px] block font-medium">Service Lift</span>
                  <span className="font-bold text-emerald-700 text-xs">
                    {inspectedItem.data.serviceLiftAvailability ? 'Available' : 'Stairs Only'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px] block font-medium">Max Vehicle Size</span>
                  <span className="font-bold text-slate-900 text-xs">{inspectedItem.data.maxVehicleSize}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="text-slate-700 font-semibold text-[11px] uppercase block">Lift Restrictions:</span>
                <p className="text-slate-600">{inspectedItem.data.liftRestrictions}</p>
              </div>
            </div>
          )}

          {/* If Constraint is clicked */}
          {inspectedItem?.type === 'CONSTRAINT' && (
            <div className="space-y-3 animate-fade-in">
              <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold text-rose-800">Micro-Constraint</span>
                  <span className="text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                    {inspectedItem.data.severity}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{inspectedItem.data.title}</h4>
                <p className="text-slate-600 text-xs">{inspectedItem.data.notes}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px] block font-medium">Expected Delay</span>
                  <span className="font-bold text-amber-700 text-sm">+{inspectedItem.data.expectedDelayMinutes} mins</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px] block font-medium">Expected Cost</span>
                  <span className="font-bold text-slate-900 text-sm">₹{inspectedItem.data.expectedCostInr}</span>
                </div>
              </div>
            </div>
          )}

          {/* Default view */}
          {!inspectedItem && (
            <div className="space-y-4 text-slate-500">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                <MapPin className="w-8 h-8 text-indigo-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">{currentCityConfig.name} GIS Ground Map</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Click on any disruption marker (!), high-rise society pin (S/M), or vehicle marker (🚚) to inspect ground micro-constraints in {currentCityConfig.name}.
                </p>
              </div>

              {selectedOrder && (
                <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 space-y-1.5 text-xs">
                  <span className="text-[11px] uppercase font-bold text-indigo-900 block">Selected Focus Order</span>
                  <div className="font-bold text-slate-900">{selectedOrder.id} • {selectedOrder.customerName}</div>
                  <div className="text-slate-600">{selectedOrder.societyName}</div>
                  <div className="text-amber-800 font-semibold">ETA: {selectedOrder.expectedEta} (+{selectedOrder.estimatedDelayMinutes}m delay)</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
