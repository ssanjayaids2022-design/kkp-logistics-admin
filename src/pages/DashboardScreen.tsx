import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { Row, Col, Card as AntdCard, Timeline, Button, Typography, Space, Tag, DatePicker, Select, Tooltip, Badge, Statistic, Modal, Table, InputNumber, Switch, message, Input } from 'antd';
const Card = AntdCard as any;
import {
  ShoppingOutlined,
  ClockCircleOutlined,
  CarOutlined,
  DollarOutlined,
  PlusOutlined,
  RightOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  SyncOutlined,
  FileAddOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  AuditOutlined,
  FundOutlined,
  LineChartOutlined,
  SafetyCertificateOutlined,
  ReloadOutlined,
  BarChartOutlined,
  RiseOutlined,
  FallOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend, Area, AreaChart
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import GoldButton from '../components/GoldButton';
import StatusTag from '../components/StatusTag';
import { useAuth } from '../context/AuthContext';
import { useLoads } from '../context/LoadsContext';
import type { Load } from '../types';
import {
  revenueData,
  recentActivity,
  topRoutesByVolume,
} from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import { useActivities, relativeTime } from '../services/activityLog';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const activityIcons: Record<string, React.ReactNode> = {
  load_posted: <FileAddOutlined style={{ color: '#0B4C8C' }} />,
  load_cancelled: <CloseCircleOutlined style={{ color: '#F04438' }} />,
  bid_received: <ShoppingOutlined style={{ color: '#F4811F' }} />,
  driver_assigned: <TeamOutlined style={{ color: '#0B4C8C' }} />,
  driver_added: <TeamOutlined style={{ color: '#0B4C8C' }} />,
  delivery_completed: <CheckCircleOutlined style={{ color: '#12B76A' }} />,
  payment_processed: <DollarOutlined style={{ color: '#12B76A' }} />,
};

const tripStatusBreakdownData = [
  { name: 'Completed', value: 1682, color: '#10B981' },
  { name: 'Active', value: 42, color: '#0B4C8C' },
  { name: 'In Transit', value: 112, color: '#FFC20E' },
  { name: 'Delayed', value: 6, color: '#F4811F' },
];

// Animated counter hook
function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

// Individual animated KPI card
function AnimatedKPICard({ title, numericValue, displayValue, trend, trendUp, icon, color, onClick, active = false }: {
  title: string; numericValue: number; displayValue: string; trend: string;
  trendUp: boolean; icon: React.ReactNode; color: string; onClick: () => void; active?: boolean;
}) {
  const animated = useCountUp(numericValue);
  const [hovered, setHovered] = useState(false);
  const lit = hovered || active;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFFFFF',
        borderRadius: 12,
        border: `1px solid ${lit ? color : '#E4E7EC'}`,
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: active ? `0 0 0 2px ${color}33` : hovered ? `0 12px 24px rgba(0,0,0,0.1), 0 0 0 1px ${color}22` : '0 1px 3px rgba(16,24,40,0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Color accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 3, background: color, opacity: hovered ? 1 : 0.4, transition: 'opacity 0.25s' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color }}>
          {icon}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: trendUp ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', padding: '2px 7px', borderRadius: 12 }}>
          {trendUp ? <RiseOutlined style={{ color: '#10B981', fontSize: 10 }} /> : <FallOutlined style={{ color: '#EF4444', fontSize: 10 }} />}
          <span style={{ fontSize: 10, fontWeight: 700, color: trendUp ? '#10B981' : '#EF4444' }}>{trend.split(' ')[0]}</span>
        </div>
      </div>

      <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#101828', lineHeight: 1.1, marginBottom: 4 }}>
        {displayValue.match(/[₹%]/) ? displayValue : animated.toLocaleString()}
      </div>
      <div style={{ fontSize: 12, color: '#667085', fontWeight: 600 }}>{title}</div>

      {/* Drill-down hint */}
      <div style={{ marginTop: 10, fontSize: 11, color, fontWeight: 700, opacity: hovered ? 1 : 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', gap: 4 }}>
        View Details <RightOutlined style={{ fontSize: 9 }} />
      </div>
    </div>
  );
}

export default function DashboardScreen() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, can } = useAuth();
  const { loads, updatePricing } = useLoads();
  const liveActivity = useActivities();

  type Draft = { quotedAmount: number; kkpPrice: number; bidAmount: number | null; offeredAmount: number; amountVisible: boolean };
  const [pricing, setPricing] = useState<Record<string, Draft>>({});

  // Loads Ledger filters (mirror the Load page).
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerVehicle, setLedgerVehicle] = useState<string | null>(null);
  const [ledgerRoute, setLedgerRoute] = useState<string | null>(null);
  const [ledgerStatus, setLedgerStatus] = useState<string | null>(null);
  const ledgerRef = useRef<HTMLDivElement>(null);

  // KPI card click → filter the Loads Ledger to that status and scroll to it.
  const showLedgerFor = (status: string) => {
    setLedgerStatus(prev => (prev === status ? null : status));
    setTimeout(() => ledgerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  // Seed the editable draft for any load we haven't tracked yet (don't clobber in-progress edits).
  useEffect(() => {
    setPricing(prev => {
      const next = { ...prev };
      let changed = false;
      for (const l of loads) {
        if (!next[l.id]) {
          next[l.id] = {
            quotedAmount: l.quotedAmount ?? l.budget ?? 0,
            kkpPrice: l.kkpPrice ?? l.budget ?? 0,
            bidAmount: l.bidAmount ?? null,
            offeredAmount: l.offeredAmount ?? 0,
            amountVisible: l.amountVisible !== false,
          };
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [loads]);

  const money = (n?: number | null) => (n || n === 0 ? `₹${Number(n).toLocaleString('en-IN')}` : '—');
  const isAssigned = (l: Load) => !!l.assignedDriver;
  const getP = (id: string): Draft => pricing[id] || { quotedAmount: 0, kkpPrice: 0, bidAmount: null, offeredAmount: 0, amountVisible: true };
  const setField = (id: string, field: keyof Draft, value: any) =>
    setPricing(prev => ({ ...prev, [id]: { ...getP(id), [field]: value } }));
  const saveField = (id: string, patch: Partial<Draft>) =>
    updatePricing(id, patch).catch(() => message.error('Failed to save pricing'));

  const editNum = (id: string, field: 'quotedAmount' | 'kkpPrice' | 'bidAmount' | 'offeredAmount') => (
    <InputNumber
      size="small"
      value={getP(id)[field] as number | null}
      min={0}
      controls={false}
      disabled={!canPricing}
      style={{ width: 96 }}
      prefix="₹"
      formatter={(v: any) => (v == null || v === '' ? '' : `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','))}
      parser={(v: any) => (v ? Number(String(v).replace(/[^\d]/g, '')) : 0) as any}
      onChange={(v) => setField(id, field, v == null ? (field === 'bidAmount' ? null : 0) : Number(v))}
      onBlur={() => saveField(id, { [field]: getP(id)[field] })}
    />
  );

  const loadLedgerColumns = [
    { title: 'Load No', dataIndex: 'id', key: 'id', width: 96, fixed: 'left' as const,
      render: (id: string) => <span className="kkp-text-gold kkp-weight-700">{id}</span> },
    { title: 'Route', key: 'route', width: 180,
      render: (_: any, l: Load) => <span className="kkp-text-dark">{l.source} → {l.destination}</span> },
    { title: 'Handling', key: 'handling', width: 160,
      render: (_: any, l: Load) => l.handling
        ? <Tag color={/fragile|hazmat|perishable|liquid|temperature/i.test(l.handling) ? 'red' : 'blue'} style={{ borderRadius: 6, whiteSpace: 'normal', margin: 0 }}>{l.handling}</Tag>
        : <span className="kkp-text-drab">—</span> },
    { title: 'Assignment', key: 'assigned', width: 110,
      render: (_: any, l: Load) => (
        <Tag color={isAssigned(l) ? 'success' : 'default'} style={{ borderRadius: 6, fontWeight: 600 }}>
          {isAssigned(l) ? 'Assigned' : 'Unassigned'}
        </Tag>
      ) },
    { title: 'Driver', key: 'driver', width: 130,
      render: (_: any, l: Load) => l.assignedDriver
        ? <span className="kkp-text-dark">{l.assignedDriver}</span>
        : <span className="kkp-text-drab">—</span> },
    { title: 'Quoted', key: 'quoted', width: 120, render: (_: any, l: Load) => {
        // Quoted shows the running total = base quote + driver's offered extra.
        // Editing it sets the base (total − offered); editing Offered bumps this up.
        const p = getP(l.id);
        const total = (p.quotedAmount || 0) + (p.offeredAmount || 0);
        return (
          <InputNumber
            size="small"
            value={total}
            min={0}
            controls={false}
            disabled={!canPricing}
            style={{ width: 96 }}
            prefix="₹"
            formatter={(v: any) => (v == null || v === '' ? '' : `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','))}
            parser={(v: any) => (v ? Number(String(v).replace(/[^\d]/g, '')) : 0) as any}
            onChange={(v) => setField(l.id, 'quotedAmount', Math.max(0, (Number(v) || 0) - (p.offeredAmount || 0)))}
            onBlur={() => saveField(l.id, { quotedAmount: getP(l.id).quotedAmount })}
          />
        );
      } },
    { title: 'KKP Price', key: 'kkp', width: 120, render: (_: any, l: Load) => editNum(l.id, 'kkpPrice') },
    { title: 'Offered', key: 'offered', width: 120, render: (_: any, l: Load) => editNum(l.id, 'offeredAmount') },
    { title: 'Final', key: 'final', width: 110, align: 'right' as const,
      render: (_: any, l: Load) => {
        const p = getP(l.id);
        // Final = Quoted + Offered (load-giver's amount plus the driver's extra charge).
        return <span className="kkp-weight-800" style={{ color: '#12B76A' }}>{money((p.quotedAmount || 0) + (p.offeredAmount || 0))}</span>;
      } },
    { title: 'Trip Status', dataIndex: 'status', key: 'status', width: 120,
      render: (s: string) => <StatusTag status={s as any} /> },
    { title: 'Show to driver', key: 'visible', width: 120, align: 'center' as const,
      render: (_: any, l: Load) => (
        <Switch
          size="small"
          checked={getP(l.id).amountVisible}
          disabled={!canPricing}
          onChange={(c) => { setField(l.id, 'amountVisible', c); saveField(l.id, { amountVisible: c }); }}
        />
      ) },
  ];
  const isChairman = user?.role === 'CHAIRMAN';
  const isManager = user?.role === 'MANAGER';
  const isLoadAdmin = user?.role === 'LOAD_ADMIN';
  const isTechAdmin = user?.role === 'TECH_ADMIN';
  const canPricing = can('loads.pricing.edit');
  const showFinancials = can('analytics.financial');
  const isSystemAdmin = can('audit.all');

  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [revenueChartType, setRevenueChartType] = useState<'bar' | 'area'>('bar');
  const [drillDownModal, setDrillDownModal] = useState<{ title: string; content: React.ReactNode } | null>(null);

  // Simulated live metrics with slight random variation after refresh
  const [tickSeed, setTickSeed] = useState(0);

  const metrics = useMemo(() => {
    const base = isSystemAdmin
      ? { trips: 42, loads: 18, verif: 4, pod: 12, pay: 7, drivers: 145, todayRev: '₹1.8L', payouts: '₹2.4L', monthRev: '₹28.4L', avgTrip: '₹32,500' }
      : { trips: 15, loads: 6, verif: 1, pod: 4, pay: 2, drivers: 55, todayRev: '₹0.7L', payouts: '₹0.9L', monthRev: '₹11.2L', avgTrip: '₹30,800' };
    // Add small variation on refresh
    return { ...base, trips: base.trips + (tickSeed % 3), loads: base.loads + (tickSeed % 2) };
  }, [isSystemAdmin, tickSeed]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setTickSeed(s => s + 1);
      setLastRefreshed(new Date());
      setRefreshing(false);
    }, 1200);
  }, []);

  // Auto-refresh every 60s
  useEffect(() => {
    const timer = setInterval(handleRefresh, 60000);
    return () => clearInterval(timer);
  }, [handleRefresh]);

  const openDrillDown = (title: string, rows: { label: string; value: string; color?: string }[]) => {
    setDrillDownModal({
      title,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#F9FAFB', borderRadius: 8, borderLeft: `4px solid ${r.color || '#0B4C8C'}` }}>
              <Text style={{ color: '#475467', fontSize: 13 }}>{r.label}</Text>
              <Text strong style={{ fontSize: 15, color: '#101828' }}>{r.value}</Text>
            </div>
          ))}
        </div>
      ),
    });
  };

  const kpiCards = useMemo(() => {
    // Category-specific KPIs now live on their feature pages (Loads / Drivers /
    // Payments). The dashboard keeps a small cross-cutting operations overview.
    const list = [
      { title: 'Active Trips', numericValue: metrics.trips, displayValue: String(metrics.trips), trend: '+4% from yesterday', trendUp: true, icon: <CarOutlined />, color: '#0B4C8C', filterStatus: 'in_transit',
        drill: [{ label: 'On-Time', value: `${metrics.trips - 2}`, color: '#10B981' }, { label: 'Delayed', value: '2', color: '#F4811F' }, { label: 'Critical', value: '0', color: '#EF4444' }], visible: true },
      { title: 'Pending POD Reviews', numericValue: metrics.pod, displayValue: String(metrics.pod), trend: '+3 from yesterday', trendUp: false, icon: <AuditOutlined />, color: '#0B4C8C', filterStatus: 'delivered',
        drill: [{ label: 'Under Review', value: String(metrics.pod), color: '#0B4C8C' }, { label: 'Cleared Today', value: '7', color: '#10B981' }], visible: !isLoadAdmin && !isTechAdmin },
    ];
    return list.filter(c => c.visible);
  }, [metrics, isLoadAdmin, isTechAdmin]);

  // Live in-app events first (posting/cancelling loads, …), then seed activity.
  const timelineItems = useMemo(() => {
    const liveItems = liveActivity.map((a) => ({
      dot: activityIcons[a.type] || <SyncOutlined />,
      children: (
        <div className="kkp-mt-4">
          <Text className="kkp-text-dark" style={{ fontSize: 13 }}>{a.message}</Text>
          <br />
          <Text className="kkp-text-drab" style={{ fontSize: 11 }}>{relativeTime(a.at)}</Text>
        </div>
      ),
    }));
    const seedItems = recentActivity.slice(0, Math.max(0, 6 - liveItems.length)).map((item) => ({
      dot: activityIcons[item.type] || <SyncOutlined />,
      children: (
        <div className="kkp-mt-4">
          <Text className="kkp-text-dark" style={{ fontSize: 13 }}>{item.message}</Text>
          <br />
          <Text className="kkp-text-drab" style={{ fontSize: 11 }}>{item.time}</Text>
        </div>
      ),
    }));
    return [...liveItems.slice(0, 6), ...seedItems];
  }, [liveActivity]);

  const adminAuditItems = useMemo(() => [
    { dot: <SafetyCertificateOutlined style={{ color: '#FFC20E' }} />, children: <div className="kkp-mt-4"><Text className="kkp-text-dark" style={{ fontSize: 13 }}>Super Admin updated Access Matrix</Text><br /><Text className="kkp-text-drab" style={{ fontSize: 11 }}>15 mins ago</Text></div> },
    { dot: <FileAddOutlined style={{ color: '#0B4C8C' }} />, children: <div className="kkp-mt-4"><Text className="kkp-text-dark" style={{ fontSize: 13 }}>Admin User posted load LD-1021</Text><br /><Text className="kkp-text-drab" style={{ fontSize: 11 }}>48 mins ago</Text></div> },
    { dot: <TeamOutlined style={{ color: '#F4811F' }} />, children: <div className="kkp-mt-4"><Text className="kkp-text-dark" style={{ fontSize: 13 }}>Super Admin created Admin account (Priya Sharma)</Text><br /><Text className="kkp-text-drab" style={{ fontSize: 11 }}>2 hours ago</Text></div> },
    { dot: <DollarOutlined style={{ color: '#10B981' }} />, children: <div className="kkp-mt-4"><Text className="kkp-text-dark" style={{ fontSize: 13 }}>Admin User approved advance for TX-5001</Text><br /><Text className="kkp-text-drab" style={{ fontSize: 11 }}>4 hours ago</Text></div> }
  ], []);

  const quickActions = useMemo(() => {
    const list = [
      { label: t('dashboard.postLoad'), icon: <PlusOutlined />, path: '/loads/new', color: '#F4811F', visible: can('loads.post') },
      { label: 'Match Loads', icon: <ThunderboltOutlined />, path: '/match', color: '#0B4C8C', visible: can('match.view') },
      { label: t('dashboard.approveDrivers'), icon: <TeamOutlined />, path: '/drivers', color: '#10B981', visible: can('drivers.approve') },
      { label: t('dashboard.revenue'), icon: <DollarOutlined />, path: '/payments', color: '#FFC20E', visible: can('payments.edit') },
    ];
    return list.filter(a => a.visible);
  }, [can, t]);

  // Loads Ledger filter options + filtered rows (same behaviour as the Load page).
  const ledgerVehicleOptions = Array.from(new Set(loads.map(l => l.vehicleType))).map(v => ({ value: v, label: v }));
  const ledgerRouteOptions = Array.from(new Set(loads.map(l => `${l.source} → ${l.destination}`))).map(r => ({ value: r, label: r }));
  const filteredLedger = loads.filter(l => {
    const q = ledgerSearch.toLowerCase();
    const matchSearch = !ledgerSearch ||
      l.id.toLowerCase().includes(q) ||
      l.source.toLowerCase().includes(q) ||
      l.destination.toLowerCase().includes(q) ||
      `${l.source} → ${l.destination}`.toLowerCase().includes(q) ||
      (l.assignedDriver || '').toLowerCase().includes(q) ||
      l.vehicleType.toLowerCase().includes(q);
    const matchVehicle = !ledgerVehicle || l.vehicleType === ledgerVehicle;
    const matchRoute = !ledgerRoute || `${l.source} → ${l.destination}` === ledgerRoute;
    const matchStatus = !ledgerStatus || l.status === ledgerStatus;
    return matchSearch && matchVehicle && matchRoute && matchStatus;
  });

  return (
    <div>
      <PageHeader
        title={t('dashboard.title')}
        subtitle={t('dashboard.subtitle')}
        extra={
          <Space wrap>
            <RangePicker size="middle" style={{ borderRadius: 8 }} />
            <Select
              defaultValue="today"
              size="middle"
              style={{ width: 120, borderRadius: 8 }}
              options={[
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
                { value: 'quarter', label: 'This Quarter' },
              ]}
            />
            <Tooltip title={`Last refreshed: ${lastRefreshed.toLocaleTimeString()}`}>
              <Button
                icon={<ReloadOutlined spin={refreshing} />}
                onClick={handleRefresh}
                loading={refreshing}
                style={{ borderRadius: 8 }}
              >
                Refresh
              </Button>
            </Tooltip>
            {can('loads.post') && (
              <GoldButton size="large" icon={<PlusOutlined />} onClick={() => navigate('/loads/new')}>
                {t('dashboard.createLoad')}
              </GoldButton>
            )}
          </Space>
        }
      />

      {/* Scope Banner */}
      <div className="kkp-mb-20" style={{
        background: isSystemAdmin ? 'rgba(255, 194, 14, 0.04)' : 'rgba(11, 76, 140, 0.03)',
        border: `1px solid ${isSystemAdmin ? 'rgba(255, 194, 14, 0.3)' : 'rgba(11, 76, 140, 0.15)'}`,
        padding: '10px 16px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8
      }}>
        <Space>
          <SafetyCertificateOutlined style={{ color: isSystemAdmin ? '#FFC20E' : '#0B4C8C', fontSize: 16 }} />
          <Text strong style={{ color: '#101828', fontSize: 13 }}>
            {isSystemAdmin ? 'Global System Scope: National (All Regions & Admin Activity)' : 'Scoped Access: South Region (Chennai & Coimbatore Operational Data)'}
          </Text>
        </Space>
        <Space>
          <Badge status="processing" color={isSystemAdmin ? '#FFC20E' : '#0B4C8C'} text={<Text style={{ fontSize: 11, color: '#667085' }}>Auto-refreshing every 60s</Text>} />
          <Tag color={isChairman ? 'gold' : isManager ? 'blue' : isTechAdmin ? 'purple' : 'cyan'} style={{ fontWeight: 700 }}>
            {isChairman ? '👑 CHAIRMAN MODE' : isManager ? '🛡️ MANAGER MODE' : isTechAdmin ? '🛠️ TECHNICAL ADMIN' : '📋 LOAD ADMIN MODE'}
          </Tag>
        </Space>
      </div>

      {/* KPI Cards Grid — Clickable with drill-down */}
      <div className="kkp-mb-28">
        <Text strong className="kkp-text-navy kkp-font-manrope" style={{ fontSize: 15, display: 'block', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          📊 Live Operations Metrics <Text style={{ fontSize: 11, color: '#98A2B3', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}> — Click any card for details</Text>
        </Text>
        <Row gutter={[16, 16]}>
          {kpiCards.map((card) => {
            const fs = (card as any).filterStatus as string | undefined;
            return (
              <Col key={card.title} xs={12} sm={12} md={8} lg={6} xl={4} style={{ minWidth: 160 }}>
                <AnimatedKPICard
                  {...card}
                  active={!!fs && ledgerStatus === fs}
                  onClick={() => (fs ? showLedgerFor(fs) : openDrillDown(card.title, card.drill))}
                />
              </Col>
            );
          })}
        </Row>
      </div>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div className="kkp-mb-28 kkp-overflow-x-auto">
          <Space size={12}>
            {quickActions.map((action) => (
              <Button
                key={action.label}
                icon={action.icon}
                onClick={() => navigate(action.path)}
                className="kkp-btn-rounded kkp-weight-600"
                style={{ borderColor: action.color, color: action.color, background: `${action.color}10`, height: 42, transition: 'all 0.2s' }}
              >
                {action.label}
              </Button>
            ))}
          </Space>
        </div>
      )}

      {/* Loads Ledger Table */}
      <div ref={ledgerRef} style={{ scrollMarginTop: 80 }} />
      <Card
        className="kkp-card kkp-mb-28"
        title={
          <div className="kkp-flex-between" style={{ width: '100%' }}>
            <span className="kkp-text-navy kkp-font-manrope kkp-weight-700">Loads Ledger</span>
            <Button type="link" className="kkp-text-gold kkp-weight-600" icon={<RightOutlined />} iconPosition="end" onClick={() => navigate('/loads')}>
              View all
            </Button>
          </div>
        }
        styles={{ body: { padding: '8px 8px 0' } }}
      >
        {/* Filters — same set as the Load page */}
        <Row gutter={[8, 8]} style={{ padding: '4px 8px 12px' }}>
          <Col xs={24} sm={12} md={7}>
            <Input
              placeholder="Search load, route, driver…"
              prefix={<SearchOutlined className="kkp-text-drab" />}
              value={ledgerSearch}
              onChange={(e) => setLedgerSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} md={5}>
            <Select placeholder="Vehicle" value={ledgerVehicle} onChange={setLedgerVehicle} allowClear showSearch style={{ width: '100%' }} options={ledgerVehicleOptions} />
          </Col>
          <Col xs={12} sm={6} md={6}>
            <Select placeholder="Route" value={ledgerRoute} onChange={setLedgerRoute} allowClear showSearch style={{ width: '100%' }} options={ledgerRouteOptions} />
          </Col>
          <Col xs={12} sm={6} md={6}>
            <Select
              placeholder="Status"
              value={ledgerStatus}
              onChange={setLedgerStatus}
              allowClear
              style={{ width: '100%' }}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'in_transit', label: 'In Transit' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'completed', label: 'Completed' },
                { value: 'delayed', label: 'Delayed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
          </Col>
        </Row>
        <Table
          columns={loadLedgerColumns}
          dataSource={filteredLedger}
          rowKey="id"
          size="middle"
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1000 }}
          locale={{ emptyText: 'No loads match these filters.' }}
          onRow={(record) => ({
            style: { cursor: 'pointer' },
            onClick: (e) => {
              // Let the inline pricing inputs / switch handle their own clicks;
              // clicking anywhere else on the row opens that load on the Load page.
              const el = e.target as HTMLElement;
              if (el.closest('input, button, .ant-input-number, .ant-switch, .ant-select')) return;
              navigate('/loads', { state: { searchText: record.id } });
            },
          })}
        />
      </Card>

      {/* Charts */}
      <Row gutter={[20, 20]} className="kkp-mb-28">

        {/* Donut Chart — Trip Status */}
        <Col xs={24} lg={12} xl={8}>
          <Card
            title={<span className="kkp-text-navy kkp-font-manrope kkp-weight-700">Trip Status Breakdown</span>}
            className="kkp-card"
            styles={{ body: { padding: '16px' } }}
          >
            <div style={{ height: 260, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tripStatusBreakdownData}
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={75}
                      paddingAngle={4} dataKey="value"
                      animationBegin={0} animationDuration={900}
                    >
                      {tripStatusBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} cursor="pointer" />
                      ))}
                    </Pie>
                    <ChartTooltip formatter={(value) => [value, 'Trips']} contentStyle={{ borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 16px', marginTop: 12 }}>
                {tripStatusBreakdownData.map((item) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                    onClick={() => openDrillDown('Trip Status: ' + item.name, [{ label: 'Count', value: String(item.value), color: item.color }, { label: 'Share', value: `${Math.round(item.value / 1842 * 100)}%`, color: item.color }])}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                    <span style={{ fontSize: 11, color: '#475467', fontWeight: 600 }}>{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>

        {/* Revenue Bar / Area Chart */}
        {showFinancials && (
          <Col xs={24} lg={12}>
            <Card
              title={<span className="kkp-text-navy kkp-font-manrope kkp-weight-700">Revenue & Commission Trend</span>}
              className="kkp-card"
              styles={{ body: { padding: '16px' } }}
              extra={
                <Space size={4}>
                  <Button size="small" icon={<BarChartOutlined />} type={revenueChartType === 'bar' ? 'primary' : 'default'} onClick={() => setRevenueChartType('bar')} style={{ borderRadius: 6, fontSize: 11 }}>Bar</Button>
                  <Button size="small" icon={<LineChartOutlined />} type={revenueChartType === 'area' ? 'primary' : 'default'} onClick={() => setRevenueChartType('area')} style={{ borderRadius: 6, fontSize: 11 }}>Area</Button>
                </Space>
              }
            >
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  {revenueChartType === 'area' ? (
                    <AreaChart data={revenueData} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0B4C8C" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#0B4C8C" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F7" />
                      <XAxis dataKey="month" tick={{ fill: '#667085', fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fill: '#667085', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                      <ChartTooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: 8 }} />
                      <Area type="monotone" dataKey="revenue" stroke="#0B4C8C" strokeWidth={2.5} fill="url(#revGrad)" animationDuration={700} />
                    </AreaChart>
                  ) : (
                    <BarChart data={revenueData} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F7" />
                      <XAxis dataKey="month" tick={{ fill: '#667085', fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fill: '#667085', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                      <ChartTooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: 8 }} />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Bar dataKey="revenue" name="Total Revenue" fill="#0B4C8C" radius={[4, 4, 0, 0]} animationDuration={700} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        )}

        {/* Top Routes Bar */}
        <Col xs={24} lg={showFinancials ? 12 : 24}>
          <Card
            title={<span className="kkp-text-navy kkp-font-manrope kkp-weight-700">Top Routes by Volume</span>}
            className="kkp-card"
            styles={{ body: { padding: '16px' } }}
          >
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topRoutesByVolume} layout="vertical" margin={{ top: 0, right: 12, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F2F4F7" />
                  <XAxis type="number" tick={{ fill: '#667085', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="route" tick={{ fill: '#475467', fontSize: 10, fontWeight: 600 }} width={120} tickLine={false} axisLine={false} />
                  <ChartTooltip formatter={(value) => [value, 'Trips']} contentStyle={{ borderRadius: 8 }} />
                  <Bar dataKey="volume" name="Trip Volume" radius={[0, 4, 4, 0]} animationDuration={900} cursor="pointer">
                    {topRoutesByVolume.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={index < 3 ? '#F4811F' : '#0B4C8C'} fillOpacity={1 - index * 0.07} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Activity Feed */}
        <Col xs={24} lg={24}>
          <Card
            title={
              <div className="kkp-flex-between">
                <span className="kkp-text-navy kkp-font-manrope kkp-weight-700">{t('dashboard.recentActivity')}</span>
                <Button type="link" className="kkp-text-gold kkp-weight-600" icon={<RightOutlined />} iconPosition="end" onClick={() => navigate('/audit-logs')}>
                  {t('dashboard.viewAll')}
                </Button>
              </div>
            }
            className="kkp-card"
            styles={{ body: { padding: '24px' } }}
          >
            <Timeline items={timelineItems} />
          </Card>
        </Col>

        {isSystemAdmin && (
          <Col xs={24} lg={12}>
            <Card
              title={
                <div className="kkp-flex-between">
                  <span className="kkp-text-navy kkp-font-manrope kkp-weight-700">👑 Recent Admin Audit Logs</span>
                  <Button type="link" className="kkp-text-gold kkp-weight-600" icon={<RightOutlined />} iconPosition="end" onClick={() => navigate('/audit-logs')}>
                    View Audit Logs
                  </Button>
                </div>
              }
              className="kkp-card"
              styles={{ body: { padding: '24px' } }}
            >
              <Timeline items={adminAuditItems} />
            </Card>
          </Col>
        )}
      </Row>

      {/* Drill-down Modal */}
      <Modal
        title={<span className="kkp-text-navy kkp-font-manrope kkp-weight-700">{drillDownModal?.title}</span>}
        open={!!drillDownModal}
        onCancel={() => setDrillDownModal(null)}
        footer={<Button type="primary" onClick={() => setDrillDownModal(null)} style={{ background: '#0B4C8C' }}>Close</Button>}
        width={420}
      >
        <div style={{ paddingTop: 12 }}>
          {drillDownModal?.content}
        </div>
      </Modal>
    </div>
  );
}
