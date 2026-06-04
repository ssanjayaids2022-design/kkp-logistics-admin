import React from 'react';
import { Row, Col, Card as AntdCard, Table, Tag, Typography, Space } from 'antd';
const Card = AntdCard as any;
import { EnvironmentOutlined, GlobalOutlined, LineChartOutlined } from '@ant-design/icons';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import PageHeader from '../components/PageHeader';
import { routePerformanceMatrix, cityActivityData } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

const { Text } = Typography;

export default function RouteAnalytics() {
  const { t } = useLanguage();

  const routeColumns = [
    {
      title: 'Origin',
      dataIndex: 'origin',
      key: 'origin',
      render: (text: string) => (
        <Space>
          <EnvironmentOutlined style={{ color: '#0B4C8C' }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Destination',
      dataIndex: 'destination',
      key: 'destination',
      render: (text: string) => (
        <Space>
          <EnvironmentOutlined style={{ color: '#F4811F' }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Avg. Bids / Load',
      dataIndex: 'avgBids',
      key: 'avgBids',
      sorter: (a: any, b: any) => a.avgBids - b.avgBids,
      render: (val: number) => <Tag color="blue">{val} Bids</Tag>,
    },
    {
      title: 'Avg. Bid Amount',
      dataIndex: 'avgBidAmount',
      key: 'avgBidAmount',
      sorter: (a: any, b: any) => a.avgBidAmount - b.avgBidAmount,
      render: (val: number) => `₹${val.toLocaleString()}`,
    },
    {
      title: 'Avg. Trip Duration',
      dataIndex: 'avgDuration',
      key: 'avgDuration',
    },
    {
      title: 'Total Logged Trips',
      dataIndex: 'totalTrips',
      key: 'totalTrips',
      sorter: (a: any, b: any) => a.totalTrips - b.totalTrips,
      render: (val: number) => <Text strong style={{ color: '#0B4C8C' }}>{val}</Text>,
    },
  ];

  const cityColumns = [
    {
      title: 'City Name',
      dataIndex: 'city',
      key: 'city',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Departures (As Origin)',
      dataIndex: 'asOriginCount',
      key: 'asOriginCount',
      sorter: (a: any, b: any) => a.asOriginCount - b.asOriginCount,
    },
    {
      title: 'Arrivals (As Destination)',
      dataIndex: 'asDestinationCount',
      key: 'asDestinationCount',
      sorter: (a: any, b: any) => a.asDestinationCount - b.asDestinationCount,
    },
    {
      title: 'Total Cargo Volume',
      dataIndex: 'totalVolume',
      key: 'totalVolume',
      sorter: (a: any, b: any) => a.totalVolume - b.totalVolume,
      render: (val: number) => <Tag color="purple" style={{ fontWeight: 700 }}>{val} Units</Tag>,
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('analytics.routes')}
        subtitle="Geographical distribution, lane densities, route pricing metrics, and transit analysis"
      />

      {/* Row 1: Route performance table + City Activity Chart */}
      <Row gutter={[20, 20]} className="kkp-mb-28">
        <Col xs={24} xl={15}>
          <Card
            title={
              <Space>
                <LineChartOutlined style={{ color: '#0B4C8C', fontSize: 18 }} />
                <span className="kkp-text-navy kkp-font-manrope kkp-weight-700">Route Performance & Density Matrix</span>
              </Space>
            }
            className="kkp-card"
          >
            <Table
              columns={routeColumns}
              dataSource={routePerformanceMatrix}
              pagination={{ pageSize: 5 }}
              scroll={{ x: 'max-content' }}
              className="kkp-table"
            />
          </Card>
        </Col>

        <Col xs={24} xl={9}>
          <Card
            title={
              <Space>
                <GlobalOutlined style={{ color: '#F4811F', fontSize: 18 }} />
                <span className="kkp-text-navy kkp-font-manrope kkp-weight-700">City Inbound vs Outbound Volumes</span>
              </Space>
            }
            className="kkp-card"
            styles={{ body: { padding: '16px' } }}
          >
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityActivityData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F7" />
                  <XAxis dataKey="city" tick={{ fill: '#667085', fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#667085', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8 }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="asOriginCount" name="Outbound" fill="#0B4C8C" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="asDestinationCount" name="Inbound" fill="#F4811F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Row 2: City Activity Table */}
      <Card
        title={
          <Space>
            <EnvironmentOutlined style={{ color: '#0B4C8C', fontSize: 18 }} />
            <span className="kkp-text-navy kkp-font-manrope kkp-weight-700">City Activity Register</span>
          </Space>
        }
        className="kkp-card"
      >
        <Table
          columns={cityColumns}
          dataSource={cityActivityData}
          pagination={{ pageSize: 5 }}
          className="kkp-table"
        />
      </Card>
    </div>
  );
}
