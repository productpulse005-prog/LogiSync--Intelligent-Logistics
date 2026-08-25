import React, { useState } from 'react';
import {
  Sliders,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Building,
  MapPin,
  Clock,
  Shield,
  Edit2,
  Save,
  X,
  Search,
} from 'lucide-react';
import { LogisticsConstraint, SocietyProfile, DriverReport, ConstraintType } from '../types';
import { api } from '../services/api';

interface AdminConstraintsViewProps {
  constraints: LogisticsConstraint[];
  societies: SocietyProfile[];
  driverReports: DriverReport[];
  onRefreshData: () => void;
}

export const AdminConstraintsView: React.FC<AdminConstraintsViewProps> = ({
  constraints,
  societies,
  driverReports,
  onRefreshData,
}) => {
  const [adminTab, setAdminTab] = useState<'CONSTRAINTS' | 'SOCIETIES' | 'DRIVER_REPORTS'>('CONSTRAINTS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add Constraint Modal State
  const [showAddConstraintModal, setShowAddConstraintModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newType, setNewType] = useState<ConstraintType>('ROAD_BLOCKAGE');
  const [newLocality, setNewLocality] = useState<string>('Hinjewadi');
  const [newSeverity, setNewSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [newDelay, setNewDelay] = useState<number>(30);
  const [newCost, setNewCost] = useState<number>(0);
  const [newNotes, setNewNotes] = useState<string>('');

  // Edit Society State
  const [editingSociety, setEditingSociety] = useState<SocietyProfile | null>(null);
  const [editMathadiProb, setEditMathadiProb] = useState<number>(85);
  const [editMathadiCharge, setEditMathadiCharge] = useState<number>(350);
  const [editSocietyFee, setEditSocietyFee] = useState<number>(0);
  const [editLiftRestriction, setEditLiftRestriction] = useState<string>('');

  const handleCreateConstraint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createConstraint({
        title: newTitle || `${newType} in ${newLocality}`,
        type: newType,
        locality: newLocality as any,
        severity: newSeverity,
        expectedDelayMinutes: Number(newDelay),
        expectedCostInr: Number(newCost),
        notes: newNotes,
        lat: 18.592,
        lng: 73.725,
        radiusMeters: 400,
        status: 'ACTIVE',
        source: 'OPS_DESK',
      });
      setShowAddConstraintModal(false);
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConstraint = async (id: string) => {
    try {
      await api.deleteConstraint(id);
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSociety = async () => {
    if (!editingSociety) return;
    try {
      await api.updateSociety(editingSociety.id, {
        mathadiProbability: Number(editMathadiProb),
        typicalMathadiCharge: Number(editMathadiCharge),
        societyFee: Number(editSocietyFee),
        liftRestrictions: editLiftRestriction,
      });
      setEditingSociety(null);
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 text-sm">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Logistics Rules &amp; Society Memory</h2>
                <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  Admin Master Data
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Manage micro-constraints, gated community access policies, lift blackout schedules, and field reports.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddConstraintModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Urban Constraint</span>
          </button>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => setAdminTab('CONSTRAINTS')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              adminTab === 'CONSTRAINTS'
                ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Corridor Constraints ({constraints.length})
          </button>

          <button
            onClick={() => setAdminTab('SOCIETIES')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              adminTab === 'SOCIETIES'
                ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Gated Societies ({societies.length})
          </button>

          <button
            onClick={() => setAdminTab('DRIVER_REPORTS')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              adminTab === 'DRIVER_REPORTS'
                ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Field Driver Submissions ({driverReports.length})
          </button>
        </div>
      </div>

      {/* Constraints View */}
      {adminTab === 'CONSTRAINTS' && (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Active Urban Logistics Constraints</h3>
            <span className="text-xs text-slate-500 font-medium">{constraints.length} total rules active</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-100/80 text-xs font-bold uppercase text-slate-500 border-b border-slate-200 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Constraint Title &amp; Type</th>
                  <th className="py-3 px-3">Corridor</th>
                  <th className="py-3 px-3">Severity</th>
                  <th className="py-3 px-3">Expected Delay</th>
                  <th className="py-3 px-3">Extra Cost</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {constraints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{c.title}</div>
                      <div className="text-xs text-slate-500">{c.notes}</div>
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-slate-700">{c.locality}</td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          c.severity === 'CRITICAL' || c.severity === 'HIGH'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.severity}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-amber-700">+{c.expectedDelayMinutes} mins</td>

                    <td className="py-3.5 px-3 font-semibold text-slate-800">₹{c.expectedCostInr}</td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteConstraint(c.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50"
                        title="Delete constraint"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Societies View */}
      {adminTab === 'SOCIETIES' && (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Gated Society Profiles &amp; Access Memory</h3>
            <span className="text-xs text-slate-500 font-medium">{societies.length} societies profiled</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-100/80 text-xs font-bold uppercase text-slate-500 border-b border-slate-200 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Society Name</th>
                  <th className="py-3 px-3">Locality</th>
                  <th className="py-3 px-3">Mathadi Prob.</th>
                  <th className="py-3 px-3">Avg Union Charge</th>
                  <th className="py-3 px-3">Unload Time</th>
                  <th className="py-3 px-4 text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {societies.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="text-xs text-slate-500">{s.address}</div>
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-slate-700">{s.locality}</td>

                    <td className="py-3.5 px-3">
                      <span className="font-bold text-slate-900">{s.mathadiProbability}%</span>
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-slate-800">₹{s.typicalMathadiCharge}</td>

                    <td className="py-3.5 px-3 font-semibold text-slate-700">{s.typicalUnloadingMinutes}m</td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setEditingSociety(s);
                          setEditMathadiProb(s.mathadiProbability);
                          setEditMathadiCharge(s.typicalMathadiCharge);
                          setEditSocietyFee(s.societyFee);
                          setEditLiftRestriction(s.liftRestrictions);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Driver Reports View */}
      {adminTab === 'DRIVER_REPORTS' && (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Ground-Truth Driver Field Submissions</h3>
            <span className="text-xs text-slate-500 font-medium">{driverReports.length} reports logged</span>
          </div>

          <div className="divide-y divide-slate-100">
            {driverReports.map((report) => (
              <div key={report.id} className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{report.title}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-bold">
                      {report.driverName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{report.notes}</p>
                  <div className="text-xs text-slate-500">
                    Society: <b>{report.societyName}</b> • Reported Cash: <b>₹{report.amount}</b>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs text-slate-400 block font-mono">
                    {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                    Network Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Society Modal */}
      {editingSociety && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl text-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Edit {editingSociety.name}</h3>
              <button onClick={() => setEditingSociety(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mathadi Union Probability (%)</label>
                <input
                  type="number"
                  value={editMathadiProb}
                  onChange={(e) => setEditMathadiProb(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Typical Mathadi Demand (₹)</label>
                <input
                  type="number"
                  value={editMathadiCharge}
                  onChange={(e) => setEditMathadiCharge(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lift Restrictions Schedule</label>
                <input
                  type="text"
                  value={editLiftRestriction}
                  onChange={(e) => setEditLiftRestriction(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingSociety(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSociety}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Constraint Modal */}
      {showAddConstraintModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <form onSubmit={handleCreateConstraint} className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl text-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add New Urban Constraint</h3>
              <button type="button" onClick={() => setShowAddConstraintModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Metro 3 Pipeline Excavation"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="EXCAVATION">Excavation</option>
                    <option value="MATHADI">Mathadi Demand</option>
                    <option value="ROAD_BLOCKAGE">Road Blockage</option>
                    <option value="BUILDING_ACCESS">Lift / Access</option>
                    <option value="PARKING">Parking</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Corridor</label>
                  <select
                    value={newLocality}
                    onChange={(e) => setNewLocality(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="Hinjewadi">Hinjewadi</option>
                    <option value="Wakad">Wakad</option>
                    <option value="Baner">Baner</option>
                    <option value="Balewadi">Balewadi</option>
                    <option value="Mahalunge">Mahalunge</option>
                  </select>
                </div>
              </div>

              {/* Severity Gauge Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-slate-700">Severity &amp; Risk Level</label>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    newSeverity === 'LOW'
                      ? 'bg-emerald-100 text-emerald-800'
                      : newSeverity === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-800'
                      : newSeverity === 'HIGH'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {newSeverity} IMPACT
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { level: 'LOW', label: 'Low', bars: 1, color: 'bg-emerald-500', activeBg: 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-400' },
                    { level: 'MEDIUM', label: 'Med', bars: 2, color: 'bg-amber-500', activeBg: 'bg-amber-50 border-amber-500 text-amber-950 font-bold ring-1 ring-amber-400' },
                    { level: 'HIGH', label: 'High', bars: 3, color: 'bg-orange-500', activeBg: 'bg-orange-50 border-orange-500 text-orange-950 font-bold ring-1 ring-orange-400' },
                    { level: 'CRITICAL', label: 'Crit', bars: 4, color: 'bg-rose-600', activeBg: 'bg-rose-50 border-rose-500 text-rose-950 font-bold ring-1 ring-rose-400' },
                  ].map((s) => (
                    <button
                      key={s.level}
                      type="button"
                      onClick={() => {
                        setNewSeverity(s.level as any);
                        if (s.level === 'LOW') setNewDelay(10);
                        if (s.level === 'MEDIUM') setNewDelay(20);
                        if (s.level === 'HIGH') setNewDelay(45);
                        if (s.level === 'CRITICAL') setNewDelay(75);
                      }}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer space-y-1 ${
                        newSeverity === s.level
                          ? s.activeBg
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-0.5 justify-center">
                        {[1, 2, 3, 4].map((b) => (
                          <div
                            key={b}
                            className={`h-1.5 w-2 rounded-xs ${
                              b <= s.bars ? s.color : 'bg-slate-200 opacity-60'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-[11px] font-bold">{s.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Est Delay (Mins)</label>
                  <input
                    type="number"
                    value={newDelay}
                    onChange={(e) => setNewDelay(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Est Cost (₹)</label>
                  <input
                    type="number"
                    value={newCost}
                    onChange={(e) => setNewCost(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddConstraintModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
              >
                Add Constraint
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
