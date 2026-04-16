import React, { useState, useEffect, useCallback } from 'react';
import {
  Row, Col, Card as AntdCard, Typography, Table, Tag, Space, Statistic, Skeleton,
} from 'antd';
const Card = AntdCard as any;
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import {
  FundOutlined, RiseOutlined, DollarOutlined, ReloadOutlined, FallOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import {
  fetchFinancialData,
  type FinancialData,
} from '../services/analyticsService';
import { useLanguage } from '../context/LanguageContext';

const { Title, Text } = Typography;

const cardStyle: React.CSSProperties = {
  borderRadius: 16,
  border: '1px solid #E4E7EC',
  boxShadow: '0 2px 12px rgba(16,24,40,0.06)',
};

const DONUT_COLORS = ['#10B981', '#F59E0B', '#EF4444'];

const REFRESH_INTERVAL = 60_000;

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  title, value, prefix = '', suffix = '', color = '#1A237E', icon, trend, trendUp,
}: {
  title: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  color?: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <Card bordered={false} style={{ ...cardStyle, height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color, fontSize: 18 }}>{icon}</span>
        </div>
        {trend && (
          <Tag color={trendUp ? '#D1FAE5' : '#FEE2E2'} style={{ border: 'none', borderRadius: 6, fontWeight: 700, color: trendUp ? '#065F46' : '#991B1B' }}>
            {trendUp ? <RiseOutlined /> : <FallOutlined />} {trend}
          </Tag>
        )}
      </div>
      <Statistic
        title={<Text style={{ fontSize: 12, color: '#667085', fontWeight: 600 }}>{title}</Text>}
        value={value}
        prefix={prefix}
        suffix={suffix}
        valueStyle={{ color: '#101828', fontSize: 22, fontWeight: 800 }}
      />
    </Card>
  );
}

const driverColumns = [
  { title: '#', render: (_: unknown, __: unknown, i: number) => i + 1, width: 36 },
  { title: 'Driver', dataIndex: 'name', key: 'name', render: (n: string) => <Text strong style={{ fontSize: 13 }}>{n}</Text> },
  { title: 'Route', dataIndex: 'route', key: 'route', render: (r: string) => <Text style={{ fontSize: 12, color: '#667085' }}>{r}</Text> },
  { title: 'Loads', dataIndex: 'loads', key: 'loads', render: (l: number) => <Tag color="#1A237E" style={{ fontWeight: 700 }}>{l}</Tag> },
  {
    title: 'Revenue',
    dataIndex: 'revenue',
    key: 'revenue',
    render: (r: number) => (
      <Text strong style={{ color: '#065F46' }}>₹{r.toLocaleString('en-IN')}</Text>
    ),
  },
];

export default function FinancialAnalytics() {
  const { t } = useLanguage();
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const d = await fetchFinancialData();
      setData(d);
      setLastRefresh(new Date());
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(() => load(true), REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [load]);

  const invoiceData = data
    ? [
        { name: 'Paid', value: data.invoiceStatus.paid },
        { name: 'Pending', value: data.invoiceStatus.pending },
        { name: 'Overdue', value: data.invoiceStatus.overdue },
      ]
    : [];

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #CA9D50, #E8B86D)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FundOutlined style={{ color: '#fff', fontSize: 18 }} />
            </div>
            <Title level={4} style={{ margin: 0, color: '#101828' }}>{t('analytics.financial')}</Title>
          </div>
          <Text style={{ color: '#667085', fontSize: 14 }}>
            Real-time financial visibility · Super Admin only · Last: {lastRefresh.toLocaleTimeString()}
          </Text>
        </div>
        <Tag color="#CA9D50" style={{ borderRadius: 8, padding: '4px 10px', cursor: 'pointer', color: '#fff', border: 'none' }} onClick={() => load()}>
          <ReloadOutlined /> Refresh
        </Tag>
      </div>

      {loading ? (
        <Row gutter={[20, 20]}>
          {[...Array(8)].map((_, i) => (
            <Col key={i} xs={24} sm={12} xl={6}><Card bordered={false} style={cardStyle}><Skeleton active paragraph={{ rows: 2 }} /></Card></Col>
          ))}
        </Row>
      ) : data ? (
        <Row gutter={[20, 20]}>

          {/* ── KPI Cards ── */}
          <Col xs={24} sm={12} xl={6}>
            <KpiCard
              title="Total Revenue (MTD)"
              value={`₹${(data.kpis.totalRevenue / 100000).toFixed(1)}L`}
              icon={<DollarOutlined />}
              color="#10B981"
              trend="+12.4%"
              trendUp
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <KpiCard
              title="Platform Commission"
              value={`₹${(data.kpis.platformCommission / 1000).toFixed(0)}K`}
              icon={<FundOutlined />}
              color="#1A237E"
              trend="+10.2%"
              trendUp
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <KpiCard
              title="Avg Revenue / Load"
              value={`₹${data.kpis.avgRevenuePerLoad.toLocaleString('en-IN')}`}
              icon={<RiseOutlined />}
              color="#CA9D50"
              trend="+5.8%"
              trendUp
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <KpiCard
              title="Pending Payments"
              value={`₹${(data.kpis.pendingPayments / 1000).toFixed(0)}K`}
              icon={<FallOutlined />}
              color="#EF4444"
              trend="-3.1%"
              trendUp={false}
            />
          </Col>

          {/* ── Revenue Trend ── */}
          <Col xs={24} xl={16}>
            <Card bordered={false} style={cardStyle} title={
              <Space><RiseOutlined style={{ color: '#1A237E' }} /><Text strong>Revenue & Commission Trend</Text></Space>
            }>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data.revenueTrend} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1A237E" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#1A237E" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#CA9D50" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#CA9D50" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#667085' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#667085' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: '1px solid #E4E7EC', fontSize: 12 }}
                    formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, '']}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#1A237E" fill="url(#revGrad)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="commission" name="Commission" stroke="#CA9D50" fill="url(#commGrad)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* ── Invoice Status Donut ── */}
          <Col xs={24} xl={8}>
            <Card bordered={false} style={cardStyle} title={
              <Space><Text strong>Invoice Status</Text></Space>
            }>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={invoiceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    dataKey="value"
                    label={({ name, value }: { name: string; value: number }) => `${name}: ${value}%`}
                    labelLine={false}
                  >
                    {invoiceData.map((_, i) => (
                      <Cell key={i} fill={DONUT_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v}%`, '']} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 4 }}>
                {invoiceData.map((d, i) => (
                  <div key={d.name} style={{ textAlign: 'center' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: DONUT_COLORS[i], display: 'inline-block', marginRight: 4 }} />
                    <Text style={{ fontSize: 12, color: '#667085' }}>{d.name}</Text>
                    <br />
                    <Text strong style={{ fontSize: 14, color: '#101828' }}>{d.value}%</Text>
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          {/* ── Revenue by Route ── */}
          <Col xs={24} lg={14}>
            <Card bordered={false} style={cardStyle} title={
              <Space><Text strong>Revenue by Route</Text></Space>
            }>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.revenueByRoute} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#667085' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="route" tick={{ fontSize: 11, fill: '#475467' }} width={145} />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, fontSize: 12 }}
                    formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" name="Revenue" fill="#1A237E" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* ── Profit Margin ── */}
          <Col xs={24} lg={10}>
            <Card bordered={false} style={cardStyle} title={
              <Space><Text strong>Profit Margin Trend</Text></Space>
            }>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data.profitMargin} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#667085' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#667085' }} unit="%" />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, fontSize: 12 }}
                    formatter={(v: number) => [`${v}%`, 'Net Margin']}
                  />
                  <Line type="monotone" dataKey="margin" name="Margin %" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4, fill: '#10B981' }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* ── Top Revenue Drivers ── */}
          <Col xs={24}>
            <Card
              bordered={false}
              style={cardStyle}
              title={
                <Space>
                  <TrophyOutlined style={{ color: '#CA9D50' }} />
                  <Text strong>Top Revenue Drivers</Text>
                </Space>
              }
            >
              <Table
                dataSource={data.topDrivers}
                columns={driverColumns}
                rowKey="name"
                pagination={false}
                size="middle"
                rowClassName={(_, i) => i === 0 ? 'ant-table-row-selected' : ''}
              />
            </Card>
          </Col>
        </Row>
      ) : null}
    </div>
  );
}
