import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Row, Col, Card as AntdCard, Timeline, Button, Typography, Space, Progress, Tag, DatePicker, Select, Tooltip, Badge, Statistic, Modal } from 'antd';
const Card = AntdCard as any;
import {
  ShoppingOutlined,
  ClockCircleOutlined,
  CarOutlined,
  DollarOutlined,
  PlusOutlined,
  RightOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  FileAddOutlined,
  TeamOutlined,
  AuditOutlined,
  FundOutlined,
  LineChartOutlined,
  SafetyCertificateOutlined,
  ReloadOutlined,
  BarChartOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import {
  XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend, LineChart, Line, Area, AreaChart
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import GoldButton from '../components/GoldButton';
import { useAuth } from '../context/AuthContext';
import {
  revenueData,
  recentActivity,
  dailyTripCompletionsTrend,
  topRoutesByVolume,
  loadBiddingMetrics,
} from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const activityIcons: Record<string, React.ReactNode> = {
  load_posted: <FileAddOutlined style={{ color: '#0B4C8C' }} />,
  bid_received: <ShoppingOutlined style={{ color: '#F4811F' }} />,
  driver_assigned: <TeamOutlined style={{ color: '#0B4C8C' }} />,
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
function AnimatedKPICard({ title, numericValue, displayValue, trend, trendUp, icon, color, onClick }: {
  title: string; numericValue: number; displayValue: string; trend: string;
  trendUp: boolean; icon: React.ReactNode; color: string; onClick: () => void;
}) {
  const animated = useCountUp(numericValue);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFFFFF',
        borderRadius: 12,
        border: `1px solid ${hovered ? color : '#E4E7EC'}`,
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? `0 12px 24px rgba(0,0,0,0.1), 0 0 0 1px ${color}22` : '0 1px 3px rgba(16,24,40,0.08)',
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
  const { user } = useAuth();
  const isChairman = user?.role === 'CHAIRMAN';
  const isManager = user?.role === 'MANAGER';
  const isLoadAdmin = user?.role === 'LOAD_ADMIN';
  const showFinancials = isChairman || isManager;
  const isSystemAdmin = isChairman || isManager;

  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [revenueChartType, setRevenueChartType] = useState<'bar' | 'area'>('bar');
  const [tripChartType, setTripChartType] = useState<'line' | 'area'>('line');
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
    const list = [
      { title: 'Active Trips', numericValue: metrics.trips, displayValue: String(metrics.trips), trend: '+4% from yesterday', trendUp: true, icon: <CarOutlined />, color: '#0B4C8C',
        drill: [{ label: 'On-Time', value: `${metrics.trips - 2}`, color: '#10B981' }, { label: 'Delayed', value: '2', color: '#F4811F' }, { label: 'Critical', value: '0', color: '#EF4444' }], visible: true },
      { title: 'Available Loads', numericValue: metrics.loads, displayValue: String(metrics.loads), trend: '+10% from yesterday', trendUp: true, icon: <ShoppingOutlined />, color: '#FFC20E',
        drill: [{ label: 'Posted Today', value: '5', color: '#0B4C8C' }, { label: 'Bidding Open', value: `${metrics.loads - 2}`, color: '#FFC20E' }, { label: 'Assigned', value: '8', color: '#10B981' }], visible: true },
      { title: 'Pending Driver Verif.', numericValue: metrics.verif, displayValue: String(metrics.verif), trend: '-2 from yesterday', trendUp: false, icon: <TeamOutlined />, color: '#F4811F',
        drill: [{ label: 'Document Pending', value: String(metrics.verif), color: '#F4811F' }, { label: 'Approved Today', value: '3', color: '#10B981' }], visible: !isLoadAdmin },
      { title: 'Pending POD Reviews', numericValue: metrics.pod, displayValue: String(metrics.pod), trend: '+3 from yesterday', trendUp: false, icon: <AuditOutlined />, color: '#0B4C8C',
        drill: [{ label: 'Under Review', value: String(metrics.pod), color: '#0B4C8C' }, { label: 'Cleared Today', value: '7', color: '#10B981' }], visible: !isLoadAdmin },
      { title: 'Pending Payments', numericValue: metrics.pay, displayValue: String(metrics.pay), trend: '-1 from yesterday', trendUp: false, icon: <DollarOutlined />, color: '#EF4444',
        drill: [{ label: 'Overdue > 7d', value: '2', color: '#EF4444' }, { label: 'Due Today', value: `${metrics.pay - 2}`, color: '#F4811F' }], visible: showFinancials },
      { title: 'Active Drivers', numericValue: metrics.drivers, displayValue: String(metrics.drivers), trend: '+8 this week', trendUp: true, icon: <TeamOutlined />, color: '#10B981',
        drill: [{ label: 'On Trip', value: String(metrics.trips), color: '#0B4C8C' }, { label: 'Available', value: String(metrics.drivers - metrics.trips), color: '#10B981' }, { label: 'Offline', value: '12', color: '#98A2B3' }], visible: true },
      { title: "Today's Revenue", numericValue: 180000, displayValue: metrics.todayRev, trend: '+20% vs avg', trendUp: true, icon: <DollarOutlined />, color: '#0B4C8C',
        drill: [{ label: 'Freight Collected', value: '₹1.5L', color: '#0B4C8C' }, { label: 'Commission', value: '₹0.3L', color: '#FFC20E' }], visible: showFinancials },
      { title: 'Pending Payouts', numericValue: 240000, displayValue: metrics.payouts, trend: '₹1.2L due today', trendUp: false, icon: <ClockCircleOutlined />, color: '#F4811F',
        drill: [{ label: 'Drivers Awaiting', value: '14', color: '#F4811F' }, { label: 'Amount Queued', value: metrics.payouts, color: '#EF4444' }], visible: showFinancials },
      { title: 'Month Revenue', numericValue: 2840000, displayValue: metrics.monthRev, trend: '+12% vs last month', trendUp: true, icon: <FundOutlined />, color: '#10B981',
        drill: [{ label: 'Gross Revenue', value: metrics.monthRev, color: '#10B981' }, { label: 'Net Margin', value: '18.4%', color: '#0B4C8C' }], visible: showFinancials },
      { title: 'Avg Trip Value', numericValue: 32500, displayValue: metrics.avgTrip, trend: '+1.5% this month', trendUp: true, icon: <LineChartOutlined />, color: '#FFC20E',
        drill: [{ label: 'Short Haul Avg', value: '₹18,200', color: '#0B4C8C' }, { label: 'Long Haul Avg', value: '₹48,700', color: '#FFC20E' }], visible: showFinancials },
    ];
    return list.filter(c => c.visible);
  }, [metrics, isLoadAdmin, showFinancials]);

  const timelineItems = useMemo(() =>
    recentActivity.slice(0, 6).map((item) => ({
      dot: activityIcons[item.type] || <SyncOutlined />,
      children: (
        <div className="kkp-mt-4">
          <Text className="kkp-text-dark" style={{ fontSize: 13 }}>{item.message}</Text>
          <br />
          <Text className="kkp-text-drab" style={{ fontSize: 11 }}>{item.time}</Text>
        </div>
      ),
    })),
  [recentActivity]);

  const adminAuditItems = useMemo(() => [
    { dot: <SafetyCertificateOutlined style={{ color: '#FFC20E' }} />, children: <div className="kkp-mt-4"><Text className="kkp-text-dark" style={{ fontSize: 13 }}>Super Admin updated Access Matrix</Text><br /><Text className="kkp-text-drab" style={{ fontSize: 11 }}>15 mins ago</Text></div> },
    { dot: <FileAddOutlined style={{ color: '#0B4C8C' }} />, children: <div className="kkp-mt-4"><Text className="kkp-text-dark" style={{ fontSize: 13 }}>Admin User posted load LD-1021</Text><br /><Text className="kkp-text-drab" style={{ fontSize: 11 }}>48 mins ago</Text></div> },
    { dot: <TeamOutlined style={{ color: '#F4811F' }} />, children: <div className="kkp-mt-4"><Text className="kkp-text-dark" style={{ fontSize: 13 }}>Super Admin created Admin account (Priya Sharma)</Text><br /><Text className="kkp-text-drab" style={{ fontSize: 11 }}>2 hours ago</Text></div> },
    { dot: <DollarOutlined style={{ color: '#10B981' }} />, children: <div className="kkp-mt-4"><Text className="kkp-text-dark" style={{ fontSize: 13 }}>Admin User approved advance for TX-5001</Text><br /><Text className="kkp-text-drab" style={{ fontSize: 11 }}>4 hours ago</Text></div> }
  ], []);

  const quickActions = useMemo(() => {
    const list = [
      { label: t('dashboard.postLoad'), icon: <PlusOutlined />, path: '/loads/new', color: '#F4811F', visible: !isChairman },
      { label: t('dashboard.pendingBids'), icon: <ClockCircleOutlined />, path: '/bids', color: '#0B4C8C', visible: true },
      { label: t('dashboard.approveDrivers'), icon: <TeamOutlined />, path: '/drivers', color: '#10B981', visible: !isChairman && !isLoadAdmin },
      { label: t('dashboard.revenue'), icon: <DollarOutlined />, path: '/payments', color: '#FFC20E', visible: showFinancials && !isChairman },
    ];
    return list.filter(a => a.visible);
  }, [isChairman, isLoadAdmin, showFinancials, t]);

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
            {!isChairman && (
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
          <Tag color={isChairman ? 'gold' : isManager ? 'blue' : 'cyan'} style={{ fontWeight: 700 }}>
            {isChairman ? '👑 CHAIRMAN MODE' : isManager ? '🛡️ MANAGER MODE' : '📋 LOAD ADMIN MODE'}
          </Tag>
        </Space>
      </div>

      {/* KPI Cards Grid — Clickable with drill-down */}
      <div className="kkp-mb-28">
        <Text strong className="kkp-text-navy kkp-font-manrope" style={{ fontSize: 15, display: 'block', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          📊 Live Operations Metrics <Text style={{ fontSize: 11, color: '#98A2B3', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}> — Click any card for details</Text>
        </Text>
        <Row gutter={[16, 16]}>
          {kpiCards.map((card) => (
            <Col key={card.title} xs={12} sm={12} md={8} lg={6} xl={4} style={{ minWidth: 160 }}>
              <AnimatedKPICard
                {...card}
                onClick={() => openDrillDown(card.title, card.drill)}
              />
            </Col>
          ))}
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

        {/* Line / Area Chart — Trip Completions */}
        <Col xs={24} lg={12} xl={16}>
          <Card
            title={<span className="kkp-text-navy kkp-font-manrope kkp-weight-700">Daily Trip Completions (Last 30 Days)</span>}
            className="kkp-card"
            styles={{ body: { padding: '16px' } }}
            extra={
              <Space size={4}>
                <Button size="small" type={tripChartType === 'line' ? 'primary' : 'default'} onClick={() => setTripChartType('line')} style={{ borderRadius: 6, fontSize: 11 }}>Line</Button>
                <Button size="small" type={tripChartType === 'area' ? 'primary' : 'default'} onClick={() => setTripChartType('area')} style={{ borderRadius: 6, fontSize: 11 }}>Area</Button>
              </Space>
            }
          >
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                {tripChartType === 'area' ? (
                  <AreaChart data={dailyTripCompletionsTrend} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tripGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0B4C8C" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="#0B4C8C" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F7" />
                    <XAxis dataKey="date" tick={{ fill: '#667085', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: '#667085', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <ChartTooltip contentStyle={{ borderRadius: 8 }} formatter={(v) => [v, 'Completed Trips']} />
                    <Area type="monotone" dataKey="trips" stroke="#0B4C8C" strokeWidth={2.5} fill="url(#tripGrad)" dot={{ r: 3 }} activeDot={{ r: 5 }} animationDuration={700} />
                  </AreaChart>
                ) : (
                  <LineChart data={dailyTripCompletionsTrend} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F7" />
                    <XAxis dataKey="date" tick={{ fill: '#667085', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: '#667085', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <ChartTooltip contentStyle={{ borderRadius: 8 }} formatter={(v) => [v, 'Completed Trips']} />
                    <Line type="monotone" dataKey="trips" stroke="#0B4C8C" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} animationDuration={700} />
                  </LineChart>
                )}
              </ResponsiveContainer>
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

        {/* Bidding Gauge */}
        <Col xs={24} lg={12}>
          <Card
            title={<span className="kkp-text-navy kkp-font-manrope kkp-weight-700">Bid Competitiveness Gauge</span>}
            className="kkp-card"
            styles={{ body: { padding: '24px 16px' } }}
          >
            <Row align="middle" justify="center" style={{ minHeight: 220 }}>
              <Col xs={24} sm={10} style={{ textAlign: 'center', marginBottom: 16 }}>
                <Progress
                  type="dashboard"
                  percent={80}
                  strokeColor={{ '0%': '#FFC20E', '50%': '#F4811F', '100%': '#0B4C8C' }}
                  format={() => `${loadBiddingMetrics.avgBidsPerLoad}`}
                  strokeWidth={8}
                  size={150}
                />
                <div style={{ marginTop: 8 }}>
                  <Text strong style={{ fontSize: 15, color: '#101828' }}>Avg Bids / Load</Text>
                </div>
              </Col>
              <Col xs={24} sm={14} style={{ paddingLeft: 12 }}>
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  {[
                    { label: 'Bid Acceptance Rate', value: `${loadBiddingMetrics.bidAcceptanceRate}%`, color: '#0B4C8C' },
                    { label: 'Avg Savings vs Budget', value: `${Math.abs(loadBiddingMetrics.avgBidVsBaseDiff)}% Lower`, color: '#F4811F' },
                    { label: 'Avg Time to Assign', value: loadBiddingMetrics.bidToAssignmentTime, color: '#FFC20E' },
                  ].map((item, i) => (
                    <div key={i} style={{ background: '#F8F9FC', padding: '10px 14px', borderRadius: 8, borderLeft: `4px solid ${item.color}`, cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = `${item.color}12`)}
                      onMouseLeave={e => (e.currentTarget.style.background = '#F8F9FC')}>
                      <Text style={{ fontSize: 11, color: '#667085', display: 'block', textTransform: 'uppercase' }}>{item.label}</Text>
                      <Text strong style={{ fontSize: 18, color: '#101828' }}>{item.value}</Text>
                    </div>
                  ))}
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Activity Feed */}
        <Col xs={24} lg={isSystemAdmin ? 12 : 24}>
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
