import React, { useState, useEffect, useCallback } from 'react';
import {
  Row, Col, Card as AntdCard, Typography, Progress, Tag, Space, Skeleton, Badge,
} from 'antd';
const Card = AntdCard as any;
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
  LineChartOutlined, RobotOutlined, WarningOutlined, ReloadOutlined, ThunderboltOutlined,
} from '@ant-design/icons';
import {
  fetchPredictiveData,
  type PredictiveData,
} from '../services/analyticsService';
import { useLanguage } from '../context/LanguageContext';

const { Title, Text } = Typography;

// ── Skeleton Widget ───────────────────────────────────────────────────────────
const SkeletonCard = ({ rows = 4 }: { rows?: number }) => (
  <Card bordered={false} style={cardStyle}>
    <Skeleton active paragraph={{ rows }} />
  </Card>
);

const cardStyle: React.CSSProperties = {
  borderRadius: 16,
  border: '1px solid #E4E7EC',
  boxShadow: '0 2px 12px rgba(16,24,40,0.06)',
};

const REFRESH_INTERVAL = 60_000;

// ── Risk Gauge ────────────────────────────────────────────────────────────────
function RiskGauge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ fontSize: 13, color: '#344054' }}>{label}</Text>
        <Text style={{ fontSize: 13, fontWeight: 700, color }}>{value}%</Text>
      </div>
      <Progress
        percent={value}
        showInfo={false}
        strokeColor={color}
        trailColor="#F2F4F7"
        strokeWidth={8}
        style={{ borderRadius: 8 }}
      />
    </div>
  );
}

// ── Availability Heatmap ──────────────────────────────────────────────────────
function AvailabilityHeatmap({ zones }: { zones: PredictiveData['driverZones'] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10 }}>
      {zones.map(z => {
        const ratio = z.availability / z.demand;
        const bg = ratio >= 1 ? '#D1FAE5' : ratio >= 0.7 ? '#FEF3C7' : '#FEE2E2';
        const textColor = ratio >= 1 ? '#065F46' : ratio >= 0.7 ? '#92400E' : '#991B1B';
        const label = ratio >= 1 ? 'Surplus' : ratio >= 0.7 ? 'Tight' : 'Short';
        return (
          <div
            key={z.zone}
            style={{
              background: bg,
              borderRadius: 12,
              padding: '12px 10px',
              textAlign: 'center',
              border: `1px solid ${textColor}30`,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: 700, color: textColor, display: 'block' }}>{z.zone}</Text>
            <Text style={{ fontSize: 10, color: textColor }}>{label}</Text>
            <div style={{ fontSize: 11, color: '#475467', marginTop: 4 }}>
              {z.availability}% avail.
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PredictiveAnalytics() {
  const { t } = useLanguage();
  const [data, setData] = useState<PredictiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const d = await fetchPredictiveData();
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
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #1A237E, #283593)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LineChartOutlined style={{ color: '#fff', fontSize: 18 }} />
            </div>
            <Title level={4} style={{ margin: 0, color: '#101828' }}>{t('analytics.predictive')}</Title>
          </div>
          <Text style={{ color: '#667085', fontSize: 14 }}>
            Future operational intelligence · Auto-refreshes every 60s · Last: {lastRefresh.toLocaleTimeString()}
          </Text>
        </div>
        <Tag color="#1A237E" style={{ borderRadius: 8, padding: '4px 10px', cursor: 'pointer' }} onClick={() => load()}>
          <ReloadOutlined /> Refresh
        </Tag>
      </div>

      {loading ? (
        <Row gutter={[20, 20]}>
          {[...Array(6)].map((_, i) => <Col key={i} xs={24} md={12} xl={i < 2 ? 24 : 12}><SkeletonCard /></Col>)}
        </Row>
      ) : data ? (
        <Row gutter={[20, 20]}>

          {/* ── Demand Forecast ── */}
          <Col xs={24}>
            <Card bordered={false} style={cardStyle} title={
              <Space>
                <LineChartOutlined style={{ color: '#1A237E' }} />
                <Text strong style={{ color: '#101828' }}>Demand Forecast — Next 14 Days</Text>
              </Space>
            }>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.demandForecast} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#667085' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#667085' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: '1px solid #E4E7EC', fontSize: 13 }}
                    formatter={(v: number, name: string) => [v, name === 'expected' ? 'Expected Loads' : 'Actual Loads']}
                  />
                  <Legend formatter={(v) => v === 'expected' ? 'Forecast' : 'Actual'} />
                  <Line type="monotone" dataKey="expected" stroke="#1A237E" strokeWidth={2.5} dot={false} strokeDasharray="5 3" name="expected" />
                  <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} name="actual" connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* ── Driver Availability Heatmap ── */}
          <Col xs={24} lg={12}>
            <Card
              bordered={false}
              style={{ ...cardStyle, height: '100%' }}
              title={
                <Space>
                  <ThunderboltOutlined style={{ color: '#F59E0B' }} />
                  <Text strong style={{ color: '#101828' }}>Driver Availability by Zone</Text>
                </Space>
              }
              extra={
                <Space>
                  <Badge color="#D1FAE5" text="Surplus" />
                  <Badge color="#FEF3C7" text="Tight" />
                  <Badge color="#FEE2E2" text="Short" />
                </Space>
              }
            >
              <AvailabilityHeatmap zones={data.driverZones} />
            </Card>
          </Col>

          {/* ── Price Recommendation ── */}
          <Col xs={24} lg={12}>
            <Card
              bordered={false}
              style={{ ...cardStyle, height: '100%' }}
              title={
                <Space>
                  <Text strong style={{ color: '#101828' }}>💡 Smart Price Recommendation</Text>
                </Space>
              }
            >
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.priceRecommendations} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#667085' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="route" tick={{ fontSize: 10, fill: '#475467' }} width={130} />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: '1px solid #E4E7EC', fontSize: 12 }}
                    formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, '']}
                  />
                  <Legend />
                  <Bar dataKey="market" name="Market Price" fill="#E4E7EC" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="suggested" name="Suggested Price" fill="#CA9D50" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* ── Load Risk Indicators ── */}
          <Col xs={24} lg={12}>
            <Card
              bordered={false}
              style={cardStyle}
              title={
                <Space>
                  <WarningOutlined style={{ color: '#EF4444' }} />
                  <Text strong style={{ color: '#101828' }}>Load Risk Indicators</Text>
                </Space>
              }
            >
              {data.riskIndicators.map(r => (
                <div key={r.route} style={{ marginBottom: 16, padding: 12, background: '#F9FAFB', borderRadius: 10 }}>
                  <Text style={{ fontSize: 12, fontWeight: 700, color: '#344054', display: 'block', marginBottom: 8 }}>{r.route}</Text>
                  <RiskGauge label="Cancellation Risk" value={r.cancellationRisk} color={r.cancellationRisk > 35 ? '#EF4444' : '#F59E0B'} />
                  <RiskGauge label="Delay Probability" value={r.delayProbability} color={r.delayProbability > 40 ? '#8B5CF6' : '#1A237E'} />
                </div>
              ))}
            </Card>
          </Col>

          {/* ── Driver Radar (Zone Comparison) ── */}
          <Col xs={24} lg={12}>
            <Card bordered={false} style={cardStyle} title={
              <Space>
                <Text strong style={{ color: '#101828' }}>Zone Compare — Availability vs. Demand</Text>
              </Space>
            }>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={data.driverZones}>
                  <PolarGrid stroke="#E4E7EC" />
                  <PolarAngleAxis dataKey="zone" tick={{ fontSize: 11, fill: '#667085' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#98A2B3' }} />
                  <Radar name="Availability" dataKey="availability" stroke="#1A237E" fill="#1A237E" fillOpacity={0.25} />
                  <Radar name="Demand" dataKey="demand" stroke="#CA9D50" fill="#CA9D50" fillOpacity={0.2} />
                  <Legend />
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* ── AI Insight Panel ── */}
          <Col xs={24}>
            <Card
              bordered={false}
              style={{ ...cardStyle, background: 'linear-gradient(135deg, #0D1B6E 0%, #1A237E 60%, #1E3A5F 100%)' }}
              title={
                <Space>
                  <RobotOutlined style={{ color: '#CA9D50', fontSize: 18 }} />
                  <Text strong style={{ color: '#FFFFFF', fontSize: 16 }}>AI Insight Panel</Text>
                  <Tag color="gold" style={{ borderRadius: 6, fontSize: 10 }}>Live Intelligence</Tag>
                </Space>
              }
            >
              <Row gutter={[16, 16]}>
                {data.aiInsights.map(insight => (
                  <Col xs={24} sm={12} key={insight.id}>
                    <div style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: 12,
                      padding: 16,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Tag color="rgba(202,157,80,0.25)" style={{ border: '1px solid #CA9D50', color: '#CA9D50', fontSize: 10, borderRadius: 5 }}>
                          {insight.category}
                        </Tag>
                        <Text style={{ fontSize: 11, color: '#98A2B3' }}>{insight.confidence}% confidence</Text>
                      </div>
                      <Text style={{ color: '#E4E7EC', fontSize: 13, lineHeight: 1.6 }}>{insight.insight}</Text>
                      <Progress
                        percent={insight.confidence}
                        showInfo={false}
                        strokeColor="#CA9D50"
                        trailColor="rgba(255,255,255,0.1)"
                        strokeWidth={4}
                        style={{ marginTop: 10 }}
                      />
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
      ) : null}
    </div>
  );
}
