import React, { useState } from 'react';
import { Row, Col, Card as AntdCard, Table, Avatar, Tag, Typography, Input, Space } from 'antd';
const Card = AntdCard as any;
import { TrophyOutlined, StarOutlined, SearchOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
import { driverPerformanceData, driverLeaderboardData } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

const { Text } = Typography;

export default function DriverAnalytics() {
  const { t } = useLanguage();
  const [searchText, setSearchText] = useState('');

  const filteredDrivers = React.useMemo(() => {
    return driverPerformanceData.filter(driver =>
      driver.name.toLowerCase().includes(searchText.toLowerCase()) ||
      driver.phone.includes(searchText)
    );
  }, [searchText]);

  // Columns for Driver Performance Table
  const columns = [
    {
      title: 'Driver Info',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#0B4C8C' }} />
          <div>
            <Text strong style={{ color: '#101828', display: 'block' }}>{text}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.phone}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Total Trips',
      dataIndex: 'totalTrips',
      key: 'totalTrips',
      sorter: (a: any, b: any) => a.totalTrips - b.totalTrips,
      render: (val: number) => <Text strong>{val}</Text>,
    },
    {
      title: 'Active Trips',
      dataIndex: 'activeTrips',
      key: 'activeTrips',
      render: (val: number) => <Tag color={val > 0 ? 'blue' : 'default'}>{val} Active</Tag>,
    },
    {
      title: 'Success Rate',
      dataIndex: 'successRate',
      key: 'successRate',
      sorter: (a: any, b: any) => a.successRate - b.successRate,
      render: (val: number) => (
        <span style={{ color: val >= 95 ? '#10B981' : '#F4811F', fontWeight: 700 }}>
          {val}%
        </span>
      ),
    },
    {
      title: 'Avg Trip Value',
      dataIndex: 'avgTripValue',
      key: 'avgTripValue',
      render: (val: number) => `₹${val.toLocaleString()}`,
    },
    {
      title: 'Total Earnings',
      dataIndex: 'totalEarnings',
      key: 'totalEarnings',
      sorter: (a: any, b: any) => a.totalEarnings - b.totalEarnings,
      render: (val: number) => (
        <Text strong style={{ color: '#0B4C8C' }}>
          ₹{(val / 100000).toFixed(2)}L
        </Text>
      ),
    },
    {
      title: 'Last Active',
      dataIndex: 'lastActive',
      key: 'lastActive',
    },
    {
      title: 'Status',
      dataIndex: 'verificationStatus',
      key: 'verificationStatus',
      render: (status: string) => {
        let color = 'gold';
        let label = 'Pending';
        if (status === 'approved') {
          color = 'green';
          label = 'Approved';
        } else if (status === 'rejected') {
          color = 'red';
          label = 'Rejected';
        } else if (status === 'suspended') {
          color = 'volcano';
          label = 'Suspended';
        }
        return <Tag color={color}>{label}</Tag>;
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('analytics.drivers')}
        subtitle="Detailed analysis of driver activity, leaderboard rankings, and performance metrics"
      />

      <Row gutter={[20, 20]} className="kkp-mb-28">
        {/* Driver Leaderboard */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <TrophyOutlined style={{ color: '#FFC20E', fontSize: 18 }} />
                <span className="kkp-text-navy kkp-font-manrope kkp-weight-700">Driver Leaderboard</span>
              </Space>
            }
            className="kkp-card"
            styles={{ body: { padding: '16px 20px' } }}
          >
            <div style={{ maxHeight: 520, overflowY: 'auto' }}>
              {driverLeaderboardData.map((driver, index) => {
                let rankIcon = null;
                let rankColor = '#475467';
                let rankBg = '#F2F4F7';

                if (index === 0) {
                  rankIcon = <TrophyOutlined style={{ color: '#FFC20E' }} />;
                  rankColor = '#0F172A';
                  rankBg = 'rgba(255, 194, 14, 0.2)';
                } else if (index === 1) {
                  rankIcon = <TrophyOutlined style={{ color: '#94A3B8' }} />;
                  rankColor = '#0F172A';
                  rankBg = 'rgba(148, 163, 184, 0.2)';
                } else if (index === 2) {
                  rankIcon = <TrophyOutlined style={{ color: '#B45309' }} />;
                  rankColor = '#0F172A';
                  rankBg = 'rgba(180, 83, 9, 0.15)';
                }

                return (
                  <div
                    key={driver.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 10px',
                      borderRadius: 10,
                      marginBottom: 8,
                      background: index < 3 ? 'rgba(11, 76, 140, 0.03)' : 'transparent',
                      border: index < 3 ? '1px solid rgba(11, 76, 140, 0.08)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: rankBg,
                        color: rankColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 12,
                        marginRight: 12,
                      }}
                    >
                      {rankIcon ? rankIcon : index + 1}
                    </div>
                    <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#0B4C8C', marginRight: 12 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text strong style={{ display: 'block', fontSize: 13, color: '#101828' }}>{driver.name}</Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>{driver.totalTrips} Completed Trips</Text>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Text strong style={{ color: '#0B4C8C', display: 'block', fontSize: 13 }}>
                        ₹{(driver.totalEarnings / 100000).toFixed(1)}L
                      </Text>
                      <Space size={2} style={{ fontSize: 11, color: '#FFC20E' }}>
                        <StarOutlined />
                        <span style={{ fontWeight: 700, color: '#475467' }}>4.8</span>
                      </Space>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>

        {/* Driver Performance Table */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <div className="kkp-flex-between" style={{ width: '100%', flexWrap: 'wrap', gap: 12 }}>
                <span className="kkp-text-navy kkp-font-manrope kkp-weight-700">Driver Performance Register</span>
                <Input
                  placeholder="Search drivers by name or phone..."
                  prefix={<SearchOutlined style={{ color: '#98A2B3' }} />}
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  style={{ maxWidth: 300, borderRadius: 8 }}
                />
              </div>
            }
            className="kkp-card"
          >
            <Table
              columns={columns}
              dataSource={filteredDrivers}
              pagination={{ pageSize: 6 }}
              scroll={{ x: 'max-content' }}
              className="kkp-table"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
