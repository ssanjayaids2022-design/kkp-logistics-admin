import React, { useMemo } from 'react';
import { Row, Col, Card as AntdCard, Timeline, Button, Typography, Space } from 'antd';
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
} from '@ant-design/icons';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import KPICard from '../components/KPICard';
import GoldButton from '../components/GoldButton';
import { revenueData, volumeData, recentActivity } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

const { Text } = Typography;

const activityIcons: Record<string, React.ReactNode> = {
  load_posted: <FileAddOutlined style={{ color: '#1A237E' }} />,
  bid_received: <ShoppingOutlined style={{ color: '#CA9D50' }} />,
  driver_assigned: <TeamOutlined style={{ color: '#1A237E' }} />,
  delivery_completed: <CheckCircleOutlined style={{ color: '#12B76A' }} />,
  payment_processed: <DollarOutlined style={{ color: '#12B76A' }} />,
};

export default function DashboardScreen() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const quickActions = useMemo(() => [
    { label: t('dashboard.postLoad'), icon: <PlusOutlined />, path: '/loads/new' },
    { label: t('dashboard.pendingBids'), icon: <ClockCircleOutlined />, path: '/bids' },
    { label: t('dashboard.approveDrivers'), icon: <TeamOutlined />, path: '/drivers' },
    { label: t('dashboard.revenue'), icon: <DollarOutlined />, path: '/payments' },
  ], [t]);

  const timelineItems = useMemo(() => 
    recentActivity.slice(0, 8).map((item) => ({
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

  return (
    <div>
      <PageHeader
        title={t('dashboard.title')}
        subtitle={t('dashboard.subtitle')}
        extra={
          <GoldButton
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate('/loads/new')}
          >
            {t('dashboard.createLoad')}
          </GoldButton>
        }
      />

      {/* KPI Cards */}
      <Row gutter={[20, 20]} className="kkp-mb-28">
        <Col xs={12} sm={12} md={6}>
          <KPICard
            title={t('dashboard.totalLoads')}
            value="1,284"
            trend="+12% from last month"
            trendUp={true}
            icon={<ShoppingOutlined />}
            color="#1A237E"
          />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <KPICard
            title={t('dashboard.activeTrips')}
            value="42"
            trend="94% on schedule"
            trendUp={true}
            icon={<ClockCircleOutlined />}
            color="#2E90FA"
          />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <KPICard
            title={t('dashboard.availableTrucks')}
            value="18"
            trend="82% utilized"
            trendUp={false}
            icon={<CarOutlined />}
            color="#12B76A"
          />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <KPICard
            title={t('dashboard.revenue')}
            value="₹28.4L"
            trend="+₹4.2L this week"
            trendUp={true}
            icon={<DollarOutlined />}
            color="#CA9D50"
          />
        </Col>
      </Row>

      {/* Quick Actions */}
      <div className="kkp-mb-28 kkp-overflow-x-auto">
        <Space size={12}>
          {quickActions.map((action) => (
            <Button
              key={action.label}
              icon={action.icon}
              onClick={() => navigate(action.path)}
              className="kkp-btn-rounded kkp-weight-600 kkp-text-dark"
              style={{
                borderColor: '#E4E7EC',
                background: '#FFFFFF',
                height: 42,
              }}
            >
              {action.label}
            </Button>
          ))}
        </Space>
      </div>

      {/* Charts Row */}
      <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
        <Col xs={24} lg={12}>
          <Card
            title={<span className="kkp-text-navy kkp-font-manrope kkp-weight-700">{t('dashboard.monthlyRevenue')}</span>}
            className="kkp-card"
            styles={{ body: { padding: '12px 16px 16px' } }}
          >
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="navyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1A237E" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#1A237E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F7" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#667085', fontSize: 11, fontWeight: 600 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#667085', fontSize: 11 }}
                    tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 10,
                      border: '1px solid #E4E7EC',
                      boxShadow: '0 8px 24px rgba(16, 24, 40, 0.1)',
                      color: '#101828',
                    }}
                    formatter={(value: number) => [`₹${(value / 1000).toFixed(0)}K`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1A237E"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#navyGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={<span className="kkp-text-navy kkp-font-manrope kkp-weight-700">{t('dashboard.loadVolume')}</span>}
            className="kkp-card"
            styles={{ body: { padding: '12px 16px 16px' } }}
          >
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#667085', fontSize: 11, fontWeight: 600 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 10,
                      border: '1px solid #E4E7EC',
                      boxShadow: '0 8px 24px rgba(16, 24, 40, 0.1)',
                      color: '#101828',
                    }}
                  />
                  <Bar dataKey="volume" radius={[6, 6, 0, 0]}>
                    {volumeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.highlight ? '#CA9D50' : '#1A237E'}
                        fillOpacity={entry.highlight ? 1 : 0.6}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Card
        title={
          <div className="kkp-flex-between">
            <span className="kkp-text-navy kkp-font-manrope kkp-weight-700">{t('dashboard.recentActivity')}</span>
            <Button type="link" className="kkp-text-gold kkp-weight-600" icon={<RightOutlined />} iconPosition="end">
              {t('dashboard.viewAll')}
            </Button>
          </div>
        }
        className="kkp-card"
      >
        <Timeline items={timelineItems} />
      </Card>
    </div>
  );
}
