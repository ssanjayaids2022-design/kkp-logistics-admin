import React, { useState } from 'react';
import { Row, Col, Card as AntdCard, Table, Tag, Typography, Progress, Space, Input, Select } from 'antd';
const Card = AntdCard as any;
import { ClockCircleOutlined, CheckCircleOutlined, SearchOutlined, AuditOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
import { tripDetailsData, tripPerformanceSummary, podMetrics } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

const { Text } = Typography;
const { Option } = Select as any;

export default function TripAnalytics() {
  const { t } = useLanguage();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredTrips = React.useMemo(() => {
    return tripDetailsData.filter(trip => {
      const matchesSearch = trip.driverName.toLowerCase().includes(searchText.toLowerCase()) ||
                            trip.route.toLowerCase().includes(searchText.toLowerCase()) ||
                            trip.assignmentId.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || trip.status.toUpperCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchText, statusFilter]);

  const columns = [
    {
      title: 'Trip ID',
      dataIndex: 'assignmentId',
      key: 'assignmentId',
      render: (val: string) => <Text strong>{val}</Text>,
    },
    {
      title: 'Driver',
      dataIndex: 'driverName',
      key: 'driverName',
      render: (val: string) => <Text style={{ color: '#101828', fontWeight: 600 }}>{val}</Text>,
    },
    {
      title: 'Route',
      dataIndex: 'route',
      key: 'route',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'Completed') color = 'success';
        else if (status === 'Active') color = 'processing';
        else if (status === 'In Transit') color = 'warning';
        else if (status === 'Delayed') color = 'error';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: 'Est. Duration',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Agreed Price',
      dataIndex: 'agreedPrice',
      key: 'agreedPrice',
      render: (val: number) => `₹${val.toLocaleString()}`,
    },
    {
      title: 'POD Status',
      dataIndex: 'podStatus',
      key: 'podStatus',
      render: (status: string) => {
        let color = 'gold';
        let label = 'Pending';
        let icon = <ClockCircleOutlined />;

        if (status === 'approved') {
          color = 'green';
          label = 'Approved';
          icon = <CheckCircleOutlined />;
        } else if (status === 'rejected') {
          color = 'red';
          label = 'Rejected';
          icon = <CloseCircleOutlined />;
        } else if (status === 'missing') {
          color = 'volcano';
          label = 'Missing';
          icon = <ExclamationCircleOutlined />;
        }

        return (
          <Tag color={color} icon={icon}>
            {label.toUpperCase()}
          </Tag>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('analytics.trips')}
        subtitle="Trip completion statistics, cycle times, and Proof of Delivery (POD) approval pipelines"
      />

      {/* Overview Metrics Grid */}
      <Row gutter={[20, 20]} className="kkp-mb-28">
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="kkp-card" styles={{ body: { padding: 20 } }}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text className="kkp-text-muted kkp-text-caption">Total Logged Trips</Text>
              <div className="kkp-flex-between kkp-items-center">
                <Text strong style={{ fontSize: 24, color: '#101828', fontFamily: '"Manrope", sans-serif' }}>
                  {tripPerformanceSummary.totalTrips}
                </Text>
                <div style={{ padding: 8, borderRadius: 8, background: 'rgba(11,76,140,0.1)', color: '#0B4C8C' }}>
                  <AuditOutlined style={{ fontSize: 18 }} />
                </div>
              </div>
              <div className="kkp-mt-8">
                <Progress percent={tripPerformanceSummary.completionRate} size="small" strokeColor="#10B981" />
                <Text style={{ fontSize: 11, color: '#667085' }} className="kkp-mt-4">
                  Completion Rate: <Text strong>{tripPerformanceSummary.completionRate}%</Text>
                </Text>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="kkp-card" styles={{ body: { padding: 20 } }}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text className="kkp-text-muted kkp-text-caption">Average Trip Duration</Text>
              <div className="kkp-flex-between kkp-items-center">
                <Text strong style={{ fontSize: 24, color: '#101828', fontFamily: '"Manrope", sans-serif' }}>
                  {podMetrics.avgTripDuration}
                </Text>
                <div style={{ padding: 8, borderRadius: 8, background: 'rgba(244,129,31,0.1)', color: '#F4811F' }}>
                  <ClockCircleOutlined style={{ fontSize: 18 }} />
                </div>
              </div>
              <Text style={{ fontSize: 11, color: '#667085', marginTop: 12 }}>
                SLA target: <Text strong>24 hours</Text> max
              </Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="kkp-card" styles={{ body: { padding: 20 } }}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text className="kkp-text-muted kkp-text-caption">POD 1st Time Approval</Text>
              <div className="kkp-flex-between kkp-items-center">
                <Text strong style={{ fontSize: 24, color: '#101828', fontFamily: '"Manrope", sans-serif' }}>
                  {podMetrics.podFirstTimeApprovalRate}%
                </Text>
                <div style={{ padding: 8, borderRadius: 8, background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                  <CheckCircleOutlined style={{ fontSize: 18 }} />
                </div>
              </div>
              <Text style={{ fontSize: 11, color: '#667085', marginTop: 12 }}>
                Target threshold: <Text strong>&gt;85%</Text>
              </Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="kkp-card" styles={{ body: { padding: 20 } }}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text className="kkp-text-muted kkp-text-caption">Avg POD Review SLA</Text>
              <div className="kkp-flex-between kkp-items-center">
                <Text strong style={{ fontSize: 24, color: '#101828', fontFamily: '"Manrope", sans-serif' }}>
                  {podMetrics.avgPodReviewTime}
                </Text>
                <div style={{ padding: 8, borderRadius: 8, background: 'rgba(255,194,14,0.1)', color: '#FFC20E' }}>
                  <AuditOutlined style={{ fontSize: 18 }} />
                </div>
              </div>
              <Text style={{ fontSize: 11, color: '#667085', marginTop: 12 }}>
                SLA target: <Text strong>60 mins</Text> limit
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Trips register */}
      <Card
        title={
          <div className="kkp-flex-between" style={{ width: '100%', flexWrap: 'wrap', gap: 12 }}>
            <span className="kkp-text-navy kkp-font-manrope kkp-weight-700">Trip & POD Verification register</span>
            <Space size={12}>
              <Input
                placeholder="Search trip ID, driver, route..."
                prefix={<SearchOutlined style={{ color: '#98A2B3' }} />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: 260, borderRadius: 8 }}
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 140 }}
                className="kkp-select"
              >
                <Option value="ALL">All Statuses</Option>
                <Option value="ACTIVE">Active</Option>
                <Option value="COMPLETED">Completed</Option>
                <Option value="IN TRANSIT">In Transit</Option>
                <Option value="DELAYED">Delayed</Option>
              </Select>
            </Space>
          </div>
        }
        className="kkp-card"
      >
        <Table
          columns={columns}
          dataSource={filteredTrips}
          pagination={{ pageSize: 6 }}
          scroll={{ x: 'max-content' }}
          className="kkp-table"
        />
      </Card>
    </div>
  );
}
