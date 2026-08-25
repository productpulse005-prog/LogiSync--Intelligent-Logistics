import {
  Order,
  SocietyProfile,
  LogisticsConstraint,
  DriverReport,
  LearningRecord,
  OperationsKpis,
  ExperimentMetrics,
  Vehicle,
  Driver,
  Technician,
} from '../types';
import { CityId } from '../data/multiCityData';

let currentCity: CityId = 'PUNE';

function getCityHeaders(): Record<string, string> {
  return {
    'x-city': currentCity,
  };
}

export const api = {
  setCity(city: CityId) {
    currentCity = city;
  },

  getCity(): CityId {
    return currentCity;
  },

  async getKpis(city?: CityId): Promise<OperationsKpis> {
    const targetCity = city || currentCity;
    const res = await fetch(`/api/kpis?city=${targetCity}`, {
      headers: { 'x-city': targetCity },
    });
    if (!res.ok) throw new Error('Failed to fetch KPIs');
    return res.json();
  },

  async getOrders(params?: {
    locality?: string;
    riskLevel?: string;
    confidenceTier?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
    city?: CityId;
  }): Promise<{ total: number; limit: number; offset: number; orders: Order[]; city: CityId }> {
    const targetCity = params?.city || currentCity;
    const searchParams = new URLSearchParams();
    searchParams.set('city', targetCity);
    if (params?.locality) searchParams.set('locality', params.locality);
    if (params?.riskLevel) searchParams.set('riskLevel', params.riskLevel);
    if (params?.confidenceTier) searchParams.set('confidenceTier', params.confidenceTier);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));

    const res = await fetch(`/api/orders?${searchParams.toString()}`, {
      headers: { 'x-city': targetCity },
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async getOrderById(id: string, city?: CityId): Promise<{ order: Order; society: SocietyProfile; activeConstraints: LogisticsConstraint[] }> {
    const targetCity = city || currentCity;
    const res = await fetch(`/api/orders/${id}?city=${targetCity}`, {
      headers: { 'x-city': targetCity },
    });
    if (!res.ok) throw new Error('Failed to fetch order');
    return res.json();
  },

  async updateOrder(id: string, data: Partial<Order>, city?: CityId): Promise<{ success: boolean; order: Order; message: string }> {
    const targetCity = city || currentCity;
    const res = await fetch(`/api/orders/${id}?city=${targetCity}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-city': targetCity },
      body: JSON.stringify({ ...data, city: targetCity }),
    });
    if (!res.ok) throw new Error('Failed to update order');
    return res.json();
  },

  async applyOrderAction(id: string, city?: CityId): Promise<{ success: boolean; order: Order; message: string }> {
    const targetCity = city || currentCity;
    const res = await fetch(`/api/orders/${id}/apply-action?city=${targetCity}`, {
      method: 'POST',
      headers: { 'x-city': targetCity, 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to apply recommended action');
    return res.json();
  },

  async rescheduleSlot(id: string, newSlot: string, newDate?: string, city?: CityId): Promise<{ success: boolean; order: Order; message: string }> {
    const targetCity = city || currentCity;
    const res = await fetch(`/api/orders/${id}/reschedule-slot?city=${targetCity}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-city': targetCity },
      body: JSON.stringify({ newSlot, newDate, city: targetCity }),
    });
    if (!res.ok) throw new Error('Failed to reschedule slot');
    return res.json();
  },

  async completeDelivery(id: string, actuals: {
    actualDelayMinutes: number;
    actualCost: number;
    actualMathadi: number;
    actualSocietyFee: number;
    actualUnloadingMinutes: number;
    driverFeedback?: string;
    city?: CityId;
  }): Promise<{ success: boolean; order: Order; learningRecord: LearningRecord; updatedSociety?: SocietyProfile; message: string }> {
    const targetCity = actuals.city || currentCity;
    const res = await fetch(`/api/orders/${id}/complete-delivery?city=${targetCity}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-city': targetCity },
      body: JSON.stringify({ ...actuals, city: targetCity }),
    });
    if (!res.ok) throw new Error('Failed to complete delivery');
    return res.json();
  },

  async getSocieties(params?: { locality?: string; search?: string; city?: CityId }): Promise<SocietyProfile[]> {
    const targetCity = params?.city || currentCity;
    const searchParams = new URLSearchParams();
    searchParams.set('city', targetCity);
    if (params?.locality) searchParams.set('locality', params.locality);
    if (params?.search) searchParams.set('search', params.search);

    const res = await fetch(`/api/societies?${searchParams.toString()}`, {
      headers: { 'x-city': targetCity },
    });
    if (!res.ok) throw new Error('Failed to fetch societies');
    return res.json();
  },

  async getSocietyById(id: string, city?: CityId): Promise<{ society: SocietyProfile; recentOrders: Order[]; recentLearning: LearningRecord[] }> {
    const targetCity = city || currentCity;
    const res = await fetch(`/api/societies/${id}?city=${targetCity}`, {
      headers: { 'x-city': targetCity },
    });
    if (!res.ok) throw new Error('Failed to fetch society');
    return res.json();
  },

  async updateSociety(id: string, data: Partial<SocietyProfile>, city?: CityId): Promise<{ success: boolean; society: SocietyProfile }> {
    const targetCity = city || currentCity;
    const res = await fetch(`/api/societies/${id}?city=${targetCity}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-city': targetCity },
      body: JSON.stringify({ ...data, city: targetCity }),
    });
    if (!res.ok) throw new Error('Failed to update society');
    return res.json();
  },

  async getConstraints(params?: { locality?: string; type?: string; status?: string; city?: CityId }): Promise<LogisticsConstraint[]> {
    const targetCity = params?.city || currentCity;
    const searchParams = new URLSearchParams();
    searchParams.set('city', targetCity);
    if (params?.locality) searchParams.set('locality', params.locality);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.status) searchParams.set('status', params.status);

    const res = await fetch(`/api/constraints?${searchParams.toString()}`, {
      headers: { 'x-city': targetCity },
    });
    if (!res.ok) throw new Error('Failed to fetch constraints');
    return res.json();
  },

  async createConstraint(data: Partial<LogisticsConstraint>, city?: CityId): Promise<{ success: boolean; constraint: LogisticsConstraint }> {
    const targetCity = city || currentCity;
    const res = await fetch(`/api/constraints?city=${targetCity}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-city': targetCity },
      body: JSON.stringify({ ...data, city: targetCity }),
    });
    if (!res.ok) throw new Error('Failed to create constraint');
    return res.json();
  },

  async updateConstraint(id: string, data: Partial<LogisticsConstraint>, city?: CityId): Promise<{ success: boolean; constraint: LogisticsConstraint }> {
    const targetCity = city || currentCity;
    const res = await fetch(`/api/constraints/${id}?city=${targetCity}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-city': targetCity },
      body: JSON.stringify({ ...data, city: targetCity }),
    });
    if (!res.ok) throw new Error('Failed to update constraint');
    return res.json();
  },

  async deleteConstraint(id: string, city?: CityId): Promise<{ success: boolean }> {
    const targetCity = city || currentCity;
    const res = await fetch(`/api/constraints/${id}?city=${targetCity}`, {
      method: 'DELETE',
      headers: { 'x-city': targetCity },
    });
    if (!res.ok) throw new Error('Failed to delete constraint');
    return res.json();
  },

  async getDriverReports(city?: CityId): Promise<DriverReport[]> {
    const targetCity = city || currentCity;
    const res = await fetch(`/api/driver-reports?city=${targetCity}`, {
      headers: { 'x-city': targetCity },
    });
    if (!res.ok) throw new Error('Failed to fetch driver reports');
    return res.json();
  },

  async submitDriverReport(data: Partial<DriverReport>, city?: CityId): Promise<{ success: boolean; report: DriverReport; createdConstraint?: LogisticsConstraint; message: string }> {
    const targetCity = city || currentCity;
    const res = await fetch(`/api/driver-reports?city=${targetCity}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-city': targetCity },
      body: JSON.stringify({ ...data, city: targetCity }),
    });
    if (!res.ok) throw new Error('Failed to submit driver report');
    return res.json();
  },

  async getLearningRecords(city?: CityId): Promise<LearningRecord[]> {
    const targetCity = city || currentCity;
    const res = await fetch(`/api/learning-records?city=${targetCity}`, {
      headers: { 'x-city': targetCity },
    });
    if (!res.ok) throw new Error('Failed to fetch learning records');
    return res.json();
  },

  async getExperimentMetrics(city?: CityId): Promise<ExperimentMetrics> {
    const targetCity = city || currentCity;
    const res = await fetch(`/api/experiment-metrics?city=${targetCity}`, {
      headers: { 'x-city': targetCity },
    });
    if (!res.ok) throw new Error('Failed to fetch experiment metrics');
    return res.json();
  },

  async getFleet(city?: CityId): Promise<{
    vehicles: Vehicle[];
    drivers: Driver[];
    technicians: Technician[];
    warehouses: any[];
  }> {
    const targetCity = city || currentCity;
    const res = await fetch(`/api/fleet?city=${targetCity}`, {
      headers: { 'x-city': targetCity },
    });
    if (!res.ok) throw new Error('Failed to fetch fleet');
    return res.json();
  },

  async queryAiCopilot(query: string, city?: CityId): Promise<{ response: string; source: string }> {
    const targetCity = city || currentCity;
    const res = await fetch(`/api/ai/operations-copilot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-city': targetCity },
      body: JSON.stringify({ query, city: targetCity }),
    });
    if (!res.ok) throw new Error('AI Copilot request failed');
    return res.json();
  },

  async parseDriverNote(rawNote: string, driverLocality?: string, city?: CityId): Promise<{ parsed: any }> {
    const targetCity = city || currentCity;
    const res = await fetch('/api/ai/parse-driver-note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-city': targetCity },
      body: JSON.stringify({ rawNote, driverLocality, city: targetCity }),
    });
    if (!res.ok) throw new Error('Failed to parse driver note');
    return res.json();
  },

  async analyzeHazardPhoto(photoDataUrl: string, currentNote?: string, city?: CityId): Promise<{ analysis: any }> {
    const targetCity = city || currentCity;
    const res = await fetch('/api/ai/analyze-hazard-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-city': targetCity },
      body: JSON.stringify({ photoDataUrl, currentNote, city: targetCity }),
    });
    if (!res.ok) throw new Error('Failed to analyze hazard photo');
    return res.json();
  },

  async generateCustomerNote(internalReason: string, orderId?: string, city?: CityId): Promise<{ customerNote: string }> {
    const targetCity = city || currentCity;
    const res = await fetch('/api/ai/generate-customer-note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-city': targetCity },
      body: JSON.stringify({ internalReason, orderId, city: targetCity }),
    });
    if (!res.ok) throw new Error('Failed to generate customer note');
    return res.json();
  },

  async triggerDemoDisruption(city?: CityId): Promise<{ success: boolean; order: Order; constraint: LogisticsConstraint; message: string }> {
    const targetCity = city || currentCity;
    const res = await fetch(`/api/demo/trigger-disruption?city=${targetCity}`, {
      method: 'POST',
      headers: { 'x-city': targetCity },
    });
    if (!res.ok) throw new Error('Failed to trigger demo disruption');
    return res.json();
  },

  async resetDemo(city?: CityId): Promise<{ success: boolean; message: string }> {
    const targetCity = city || currentCity;
    const res = await fetch(`/api/demo/reset?city=${targetCity}`, {
      method: 'POST',
      headers: { 'x-city': targetCity },
    });
    if (!res.ok) throw new Error('Failed to reset demo');
    return res.json();
  },
};
