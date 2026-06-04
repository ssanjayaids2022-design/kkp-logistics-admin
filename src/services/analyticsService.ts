// ─── Analytics Mock Service ───────────────────────────────────────────────────
// Simulates aggregated API responses for analytics modules.
// All data here is derived from aggregated queries, not raw transactional data.

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DemandForecastPoint { date: string; expected: number; actual?: number }
export interface DriverZone { zone: string; availability: number; demand: number }
export interface PricePoint { route: string; market: number; suggested: number }
export interface RiskIndicator { route: string; cancellationRisk: number; delayProbability: number }
export interface AIInsight { id: string; category: string; insight: string; confidence: number }

export interface PredictiveData {
  demandForecast: DemandForecastPoint[];
  driverZones: DriverZone[];
  priceRecommendations: PricePoint[];
  riskIndicators: RiskIndicator[];
  aiInsights: AIInsight[];
}

export interface RevenueTrend { date: string; revenue: number; commission: number }
export interface RevenueByRoute { route: string; revenue: number }
export interface InvoiceStatus { paid: number; pending: number; overdue: number }
export interface ProfitMargin { month: string; revenue: number; cost: number; margin: number }
export interface TopDriver { name: string; loads: number; revenue: number; route: string }

export interface FinancialKPIs {
  totalRevenue: number;
  platformCommission: number;
  avgRevenuePerLoad: number;
  pendingPayments: number;
  monthlyGrowthRate: number;
}

export interface FinancialData {
  kpis: FinancialKPIs;
  revenueTrend: RevenueTrend[];
  revenueByRoute: RevenueByRoute[];
  invoiceStatus: InvoiceStatus;
  profitMargin: ProfitMargin[];
  topDrivers: TopDriver[];
}

export interface LoadFunnelStage { stage: string; count: number; pct: number }
export interface MatchingPerf { autoMatch: number; manualMatch: number }
export interface LoadStatusDist { status: string; count: number; color: string }
export interface MatchTimeTrend { week: string; avgHours: number }
export interface RouteDemand { route: string; demand: number }
export interface PeakBooking { hour: string; count: number }

export interface LoadMetrics {
  loadsPosted: number;
  loadsMatched: number;
  loadsCompleted: number;
  avgMatchTimeHours: number;
  rejectionRate: number;
}

export interface LoadData {
  metrics: LoadMetrics;
  funnel: LoadFunnelStage[];
  matchingPerf: MatchingPerf;
  statusDist: LoadStatusDist[];
  matchTimeTrend: MatchTimeTrend[];
  routeDemand: RouteDemand[];
  peakBooking: PeakBooking[];
}

// ─── Simple Memory Cache ──────────────────────────────────────────────────────
const cache: Map<string, { data: unknown; ts: number }> = new Map();
const CACHE_TTL_MS = 60_000;

function fromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL_MS) return entry.data as T;
  return null;
}

function toCache(key: string, data: unknown) {
  cache.set(key, { data, ts: Date.now() });
}

// ─── Simulated API Delay ─────────────────────────────────────────────────────
const delay = (ms = 600) => new Promise(res => setTimeout(res, ms));

// ─── Predictive Analytics ─────────────────────────────────────────────────────
export async function fetchPredictiveData(): Promise<PredictiveData> {
  const key = 'predictive';
  const cached = fromCache<PredictiveData>(key);
  if (cached) return cached;
  await delay();

  const today = new Date();
  const demandForecast: DemandForecastPoint[] = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() - 7 + i);
    const actual = i < 7 ? Math.round(80 + Math.random() * 60) : undefined;
    return {
      date: d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
      expected: Math.round(90 + Math.random() * 50 + i * 3),
      actual,
    };
  });

  const data: PredictiveData = {
    demandForecast,
    driverZones: [
      { zone: 'Chennai', availability: 78, demand: 92 },
      { zone: 'Coimbatore', availability: 55, demand: 70 },
      { zone: 'Madurai', availability: 40, demand: 65 },
      { zone: 'Salem', availability: 62, demand: 55 },
      { zone: 'Trichy', availability: 48, demand: 68 },
      { zone: 'Tirunelveli', availability: 35, demand: 50 },
      { zone: 'Erode', availability: 70, demand: 62 },
      { zone: 'Vellore', availability: 58, demand: 74 },
    ],
    priceRecommendations: [
      { route: 'Chennai → Coimbatore', market: 18500, suggested: 17200 },
      { route: 'Madurai → Chennai', market: 16000, suggested: 16800 },
      { route: 'Salem → Trichy', market: 9500, suggested: 8900 },
      { route: 'Coimbatore → Salem', market: 8000, suggested: 8400 },
      { route: 'Chennai → Madurai', market: 20000, suggested: 19200 },
    ],
    riskIndicators: [
      { route: 'Chennai → Coimbatore', cancellationRisk: 18, delayProbability: 32 },
      { route: 'Madurai → Chennai', cancellationRisk: 42, delayProbability: 55 },
      { route: 'Salem → Trichy', cancellationRisk: 12, delayProbability: 28 },
      { route: 'Coimbatore → Salem', cancellationRisk: 8, delayProbability: 15 },
    ],
    aiInsights: [
      { id: 'AI-1', category: 'Demand', insight: 'Demand on Chennai → Coimbatore route expected to surge 35% next week due to seasonal patterns.', confidence: 87 },
      { id: 'AI-2', category: 'Supply', insight: 'Driver availability in Madurai zone critically low. Consider incentive programs to attract more drivers.', confidence: 92 },
      { id: 'AI-3', category: 'Pricing', insight: 'Suggested prices are 6% below market average. Platform can increase revenue by adjusting floor pricing.', confidence: 79 },
      { id: 'AI-4', category: 'Risk', insight: 'Madurai → Chennai route shows high cancellation risk. Recommend pre-screening driver commitment.', confidence: 84 },
    ],
  };

  toCache(key, data);
  return data;
}

// ─── Financial Analytics ──────────────────────────────────────────────────────
export async function fetchFinancialData(): Promise<FinancialData> {
  const key = 'financial';
  const cached = fromCache<FinancialData>(key);
  if (cached) return cached;
  await delay();

  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const data: FinancialData = {
    kpis: {
      totalRevenue: 8_42_500,
      platformCommission: 84_250,
      avgRevenuePerLoad: 16_850,
      pendingPayments: 1_12_000,
      monthlyGrowthRate: 12.4,
    },
    revenueTrend: months.map((m, i) => ({
      date: m,
      revenue: 90000 + i * 15000 + Math.round(Math.random() * 20000),
      commission: 9000 + i * 1500 + Math.round(Math.random() * 2000),
    })),
    revenueByRoute: [
      { route: 'Chennai → Coimbatore', revenue: 185000 },
      { route: 'Madurai → Chennai', revenue: 142000 },
      { route: 'Salem → Trichy', revenue: 98000 },
      { route: 'Coimbatore → Salem', revenue: 75000 },
      { route: 'Chennai → Madurai', revenue: 210000 },
      { route: 'Trichy → Madurai', revenue: 65000 },
    ],
    invoiceStatus: { paid: 68, pending: 22, overdue: 10 },
    profitMargin: months.map((m, i) => {
      const revenue = 90000 + i * 15000;
      const cost = revenue * (0.72 - i * 0.01);
      return { month: m, revenue, cost: Math.round(cost), margin: Math.round(((revenue - cost) / revenue) * 100) };
    }),
    topDrivers: [
      { name: 'Rajesh Kumar', loads: 48, revenue: 82000, route: 'Chennai → Cbe' },
      { name: 'Senthil Vel', loads: 42, revenue: 71500, route: 'Madurai → Chennai' },
      { name: 'Murugan P', loads: 39, revenue: 66300, route: 'Salem → Trichy' },
      { name: 'Anand Raj', loads: 36, revenue: 61200, route: 'Chennai → Madurai' },
      { name: 'Karthik S', loads: 33, revenue: 56100, route: 'Cbe → Salem' },
    ],
  };

  toCache(key, data);
  return data;
}

// ─── Load Analytics ───────────────────────────────────────────────────────────
export async function fetchLoadData(): Promise<LoadData> {
  const key = 'load';
  const cached = fromCache<LoadData>(key);
  if (cached) return cached;
  await delay();

  const data: LoadData = {
    metrics: {
      loadsPosted: 842,
      loadsMatched: 718,
      loadsCompleted: 682,
      avgMatchTimeHours: 2.4,
      rejectionRate: 8.7,
    },
    funnel: [
      { stage: 'Posted', count: 842, pct: 100 },
      { stage: 'Prospect', count: 776, pct: 92 },
      { stage: 'Accepted', count: 730, pct: 87 },
      { stage: 'Approved', count: 718, pct: 85 },
      { stage: 'Completed', count: 682, pct: 81 },
    ],
    matchingPerf: { autoMatch: 68, manualMatch: 32 },
    statusDist: [
      { status: 'Completed', count: 682, color: '#10B981' },
      { status: 'In Transit', count: 48, color: '#0B4C8C' },
      { status: 'Pending', count: 72, color: '#F59E0B' },
      { status: 'Cancelled', count: 24, color: '#EF4444' },
      { status: 'Delayed', count: 16, color: '#8B5CF6' },
    ],
    matchTimeTrend: [
      { week: 'Wk 1', avgHours: 3.8 },
      { week: 'Wk 2', avgHours: 3.2 },
      { week: 'Wk 3', avgHours: 2.9 },
      { week: 'Wk 4', avgHours: 2.4 },
      { week: 'Wk 5', avgHours: 2.1 },
      { week: 'Wk 6', avgHours: 1.8 },
    ],
    routeDemand: [
      { route: 'Chennai → Cbe', demand: 185 },
      { route: 'Chennai → Mdurai', demand: 142 },
      { route: 'Madurai → Chennai', demand: 128 },
      { route: 'Salem → Trichy', demand: 98 },
      { route: 'Cbe → Salem', demand: 86 },
      { route: 'Trichy → Mdurai', demand: 74 },
    ],
    peakBooking: [
      { hour: '06:00', count: 18 },
      { hour: '07:00', count: 32 },
      { hour: '08:00', count: 58 },
      { hour: '09:00', count: 72 },
      { hour: '10:00', count: 86 },
      { hour: '11:00', count: 64 },
      { hour: '12:00', count: 48 },
      { hour: '13:00', count: 52 },
      { hour: '14:00', count: 68 },
      { hour: '15:00', count: 74 },
      { hour: '16:00', count: 62 },
      { hour: '17:00', count: 45 },
      { hour: '18:00', count: 38 },
      { hour: '19:00', count: 22 },
    ],
  };

  toCache(key, data);
  return data;
}
