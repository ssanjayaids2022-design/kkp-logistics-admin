import React, { useState, useEffect, useCallback } from 'react';
import {
  Row, Col, Card as AntdCard, Typography, Tag, Space, Statistic, Skeleton, Progress,
} from 'antd';
const Card = AntdCard as any;
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList,
} from 'recharts';
import {
  BarChartOutlined, ReloadOutlined, CheckCircleOutlined, ClockCircleOutlined,
  ApartmentOutlined, ThunderboltOutlined,
} from '@ant-design/icons';
import {
  fetchLoadData,
  type LoadData,
} from '../services/analyticsService';

const { Title, Text } = Typography;

const cardStyle: React.CSSProperties = {
  borderRadius: 16,
  border: '1px solid #E4E7EC',
  boxShadow: '0 2px 12px rgba(16,24,40,0.06)',
};

const REFRESH_INTERVAL = 60_000;

// ── Metric Card ───────────────────────────────────────────────────────────────
function MetricCard({
  title, value, suffix = '', color = '#1A237E', icon,
}: {
  title: string; value: number | string; suffix?: string; color?: string; icon: React.ReactNode;
}) {
  return (
    <Card bordered={false} style={{ ...cardStyle, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color, fontSize: 16 }}>{icon}</span>
        </div>
        <Text style={{ fontSize: 12, color: '#667085', fontWeight: 600 }}>{title}</Text>
      </div>
      <Statistic
        value={value}
        suffix={suffix}
        valueStyle={{ color: '#101828', fontSize: 22, fontWeight: 800 }}
      />
    </Card>
  );
}

// ── Custom Funnel Step ────────────────────────────────────────────────────────
function FunnelStep({ stage, count, pct, color, isLast }: {
  stage: string; count: number; pct: number; color: string; isLast: boolean; [key: string]: unknown;
}) {
  const width = `${pct}%`;
  return (
    <div style={{ position: 'relative', marginBottom: 6, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
      <div style={{ width, background: color, borderRadius: 8, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', transition: 'width 0.6s', minWidth: 120 }}>
        <Text style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{stage}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 600 }}>{count}</Text>
      </div>
      {!isLast && (
        <div style={{ width: 0, height: 0, borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderTop: `10px solid ${color}`, opacity: 0.5 }} />
      )}
    </div>
  );
}

const FUNNEL_COLORS = ['#1A237E', '#283593', '#3949AB', '#5C6BC0', '#10B981'];

export default function LoadAnalytics() {
  const [data, setData] = useState<LoadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const d = await fetchLoadData();
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

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #1A237E, #10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChartOutlined style={{ color: '#fff', fontSize: 18 }} />
            </div>
            <Title level={4} style={{ margin: 0, color: '#101828' }}>Load Management Analytics</Title>
          </div>
          <Text style={{ color: '#667085', fontSize: 14 }}>
            Load lifecycle efficiency · Admin + Super Admin · Last: {lastRefresh.toLocaleTimeString()}
          </Text>
        </div>
        <Tag color="#1A237E" style={{ borderRadius: 8, padding: '4px 10px', cursor: 'pointer' }} onClick={() => load()}>
          <ReloadOutlined /> Refresh
        </Tag>
      </div>

      {loading ? (
        <Row gutter={[20, 20]}>
          {[...Array(8)].map((_, i) => (
            <Col key={i} xs={24} sm={12} xl={6}>
              <Card bordered={false} style={cardStyle}><Skeleton active paragraph={{ rows: 2 }} /></Card>
            </Col>
          ))}
        </Row>
      ) : data ? (
        <Row gutter={[20, 20]}>

          {/* ── Metrics ── */}
          <Col xs={24} sm={12} lg={6}>
            <MetricCard title="Loads Posted" value={data.metrics.loadsPosted} icon={<ApartmentOutlined />} color="#1A237E" />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <MetricCard title="Loads Matched" value={data.metrics.loadsMatched} icon={<CheckCircleOutlined />} color="#10B981" />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <MetricCard title="Avg Match Time" value={data.metrics.avgMatchTimeHours} suffix=" hrs" icon={<ClockCircleOutlined />} color="#CA9D50" />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <MetricCard title="Rejection Rate" value={`${data.metrics.rejectionRate}%`} icon={<ThunderboltOutlined />} color="#EF4444" />
          </Col>

          {/* ── Load Lifecycle Funnel ── */}
          <Col xs={24} lg={10}>
            <Card bordered={false} style={cardStyle} title={
              <Space><ApartmentOutlined style={{ color: '#1A237E' }} /><Text strong>Load Lifecycle Funnel</Text></Space>
            }>
              <div style={{ padding: '8px 0' }}>
                {data.funnel.map((stage, i) => (
                  <FunnelStep
                    key={stage.stage}
                    stage={stage.stage}
                    count={stage.count}
                    pct={stage.pct}
                    color={FUNNEL_COLORS[i]}
                    isLast={i === data.funnel.length - 1}
                  />
                ))}
              </div>
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#F9FAFB', borderRadius: 10 }}>
                <Text style={{ fontSize: 13, color: '#475467' }}>
                  Completion Rate: <Text strong style={{ color: '#10B981' }}>{data.funnel[data.funnel.length - 1].pct}%</Text>
                </Text>
              </div>
            </Card>
          </Col>

          {/* ── Matching Performance + Status Pie ── */}
          <Col xs={24} lg={14}>
            <Row gutter={[16, 16]}>
              {/* Matching Performance */}
              <Col xs={24}>
                <Card bordered={false} style={cardStyle} title={
                  <Space><ThunderboltOutlined style={{ color: '#CA9D50' }} /><Text strong>Matching Performance</Text></Space>
                }>
                  <Row gutter={24} align="middle">
                    <Col xs={24} sm={12}>
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <Text style={{ fontSize: 13, color: '#344054' }}>Auto Match</Text>
                          <Text strong style={{ color: '#1A237E' }}>{data.matchingPerf.autoMatch}%</Text>
                        </div>
                        <Progress percent={data.matchingPerf.autoMatch} strokeColor="#1A237E" trailColor="#F2F4F7" showInfo={false} strokeWidth={12} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <Text style={{ fontSize: 13, color: '#344054' }}>Manual Match</Text>
                          <Text strong style={{ color: '#CA9D50' }}>{data.matchingPerf.manualMatch}%</Text>
                        </div>
                        <Progress percent={data.matchingPerf.manualMatch} strokeColor="#CA9D50" trailColor="#F2F4F7" showInfo={false} strokeWidth={12} />
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <ResponsiveContainer width="100%" height={140}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Auto', value: data.matchingPerf.autoMatch },
                              { name: 'Manual', value: data.matchingPerf.manualMatch },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            dataKey="value"
                          >
                            <Cell fill="#1A237E" />
                            <Cell fill="#CA9D50" />
                          </Pie>
                          <Tooltip formatter={(v: number) => [`${v}%`, '']} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Col>
                  </Row>
                </Card>
              </Col>

              {/* Load Status Pie */}
              <Col xs={24}>
                <Card bordered={false} style={cardStyle} title={
                  <Space><Text strong>Load Status Distribution</Text></Space>
                }>
                  <Row gutter={16} align="middle">
                    <Col xs={14}>
                      <ResponsiveContainer width="100%" height={140}>
                        <PieChart>
                          <Pie data={data.statusDist} cx="50%" cy="50%" outerRadius={64} dataKey="count">
                            {data.statusDist.map((s, i) => (
                              <Cell key={i} fill={s.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v: number, name: string) => [v, name]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Col>
                    <Col xs={10}>
                      {data.statusDist.map(s => (
                        <div key={s.status} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                          <Text style={{ fontSize: 12, color: '#475467' }}>{s.status}</Text>
                          <Text strong style={{ fontSize: 12, marginLeft: 'auto' }}>{s.count}</Text>
                        </div>
                      ))}
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </Col>

          {/* ── Average Match Time Trend ── */}
          <Col xs={24} lg={12}>
            <Card bordered={false} style={cardStyle} title={
              <Space><ClockCircleOutlined style={{ color: '#10B981' }} /><Text strong>Average Matching Time (Weeks)</Text></Space>
            }>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.matchTimeTrend} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#667085' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#667085' }} unit=" hrs" />
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} formatter={(v: number) => [`${v} hrs`, 'Avg Match Time']} />
                  <Line type="monotone" dataKey="avgHours" stroke="#10B981" strokeWidth={2.5} dot={{ r: 5, fill: '#10B981' }} name="avgHours" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* ── Route Demand Heatmap ── */}
          <Col xs={24} lg={12}>
            <Card bordered={false} style={cardStyle} title={
              <Space><Text strong>Route Demand Analysis</Text></Space>
            }>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.routeDemand} layout="vertical" margin={{ left: 10, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#667085' }} />
                  <YAxis type="category" dataKey="route" tick={{ fontSize: 11, fill: '#475467' }} width={120} />
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} formatter={(v: number) => [v, 'Loads']} />
                  <Bar dataKey="demand" name="Loads" fill="#1A237E" radius={[0, 6, 6, 0]}>
                    {data.routeDemand.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? '#CA9D50' : '#1A237E'} fillOpacity={1 - i * 0.12} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* ── Peak Booking Time ── */}
          <Col xs={24}>
            <Card bordered={false} style={cardStyle} title={
              <Space><ThunderboltOutlined style={{ color: '#1A237E' }} /><Text strong>Peak Booking Time Analysis</Text></Space>
            }>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.peakBooking} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#667085' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#667085' }} />
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} formatter={(v: number) => [v, 'Bookings']} />
                  <Bar dataKey="count" name="Bookings" radius={[4, 4, 0, 0]}>
                    {data.peakBooking.map((p, i) => (
                      <Cell key={i} fill={p.count >= 70 ? '#CA9D50' : p.count >= 50 ? '#1A237E' : '#ADB5BD'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
                <Space><div style={{ width: 12, height: 12, background: '#CA9D50', borderRadius: 3 }} /><Text style={{ fontSize: 12, color: '#667085' }}>Peak (≥70)</Text></Space>
                <Space><div style={{ width: 12, height: 12, background: '#1A237E', borderRadius: 3 }} /><Text style={{ fontSize: 12, color: '#667085' }}>High (50-69)</Text></Space>
                <Space><div style={{ width: 12, height: 12, background: '#ADB5BD', borderRadius: 3 }} /><Text style={{ fontSize: 12, color: '#667085' }}>Normal</Text></Space>
              </div>
            </Card>
          </Col>
        </Row>
      ) : null}
    </div>
  );
}
