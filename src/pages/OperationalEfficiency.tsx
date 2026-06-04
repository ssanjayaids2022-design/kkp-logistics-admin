import React from 'react';
import { Row, Col, Card as AntdCard, Table, Tag, Typography, Progress, Space } from 'antd';
const Card = AntdCard as any;
import { CheckCircleOutlined, InfoCircleOutlined, HourglassOutlined, DashboardOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
import { adminWorkloadData, slaMetrics } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

const { Text } = Typography;

export default function OperationalEfficiency() {
  const { t } = useLanguage();

  const columns = [
    {
      title: 'Task Type / Queue Name',
      dataIndex: 'taskType',
      key: 'taskType',
      render: (text: string) => <Text strong style={{ color: '#0B4C8C' }}>{text}</Text>,
    },
    {
      title: 'Pending Queue Count',
      dataIndex: 'pendingCount',
      key: 'pendingCount',
      render: (val: number) => {
        let color = 'green';
        if (val > 10) color = 'red';
        else if (val > 5) color = 'orange';
        return <Tag color={color} style={{ fontSize: 13, padding: '2px 8px' }}>{val} Pending</Tag>;
      },
    },
    {
      title: 'Avg. Processing Time',
      dataIndex: 'avgTimeToComplete',
      key: 'avgTimeToComplete',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'SLA Target Limit',
      dataIndex: 'slaTarget',
      key: 'slaTarget',
      render: (text: string) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'SLA Status',
      key: 'slaStatus',
      render: (_: any, record: any) => {
        const avg = parseInt(record.avgTimeToComplete);
        const target = parseInt(record.slaTarget);
        const percent = Math.round((avg / target) * 100);
        let status = 'success';
        if (percent > 90) status = 'exception';
        else if (percent > 70) status = 'normal';

        return (
          <Space size={8} style={{ width: '100%' }}>
            <Progress
              percent={percent}
              size="small"
              status={status as any}
              strokeColor={percent > 90 ? '#E63F3F' : percent > 70 ? '#F4811F' : '#10B981'}
              showInfo={false}
              style={{ width: 80 }}
            />
            <Text style={{ fontSize: 12, fontWeight: 700 }}>
              {percent}% of SLA
            </Text>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('analytics.operations')}
        subtitle="Operational velocity, admin workloads, and service level agreement (SLA) conformance statistics"
      />

      {/* SLA Metric Cards */}
      <Row gutter={[20, 20]} className="kkp-mb-28">
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="kkp-card" styles={{ body: { padding: 20 } }}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text className="kkp-text-muted kkp-text-caption">Driver Verification SLA</Text>
              <div className="kkp-flex-between kkp-items-center">
                <Text strong style={{ fontSize: 24, color: '#101828', fontFamily: '"Manrope", sans-serif' }}>
                  {slaMetrics.driverVerificationAvgTime}
                </Text>
                <div style={{ padding: 8, borderRadius: 8, background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                  <CheckCircleOutlined style={{ fontSize: 18 }} />
                </div>
              </div>
              <Text style={{ fontSize: 11, color: '#667085', marginTop: 12 }}>
                SLA target: <Text strong>30 mins</Text> (Within SLA)
              </Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="kkp-card" styles={{ body: { padding: 20 } }}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text className="kkp-text-muted kkp-text-caption">POD Review SLA</Text>
              <div className="kkp-flex-between kkp-items-center">
                <Text strong style={{ fontSize: 24, color: '#101828', fontFamily: '"Manrope", sans-serif' }}>
                  {slaMetrics.podReviewAvgTime}
                </Text>
                <div style={{ padding: 8, borderRadius: 8, background: 'rgba(244,129,31,0.1)', color: '#F4811F' }}>
                  <HourglassOutlined style={{ fontSize: 18 }} />
                </div>
              </div>
              <Text style={{ fontSize: 11, color: '#667085', marginTop: 12 }}>
                SLA target: <Text strong>60 mins</Text> (Within SLA)
              </Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="kkp-card" styles={{ body: { padding: 20 } }}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text className="kkp-text-muted kkp-text-caption">Bid Review SLA</Text>
              <div className="kkp-flex-between kkp-items-center">
                <Text strong style={{ fontSize: 24, color: '#101828', fontFamily: '"Manrope", sans-serif' }}>
                  {slaMetrics.bidReviewAvgTime}
                </Text>
                <div style={{ padding: 8, borderRadius: 8, background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                  <CheckCircleOutlined style={{ fontSize: 18 }} />
                </div>
              </div>
              <Text style={{ fontSize: 11, color: '#667085', marginTop: 12 }}>
                SLA target: <Text strong>15 mins</Text> (Within SLA)
              </Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="kkp-card" styles={{ body: { padding: 20 } }}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text className="kkp-text-muted kkp-text-caption">Payment Release SLA</Text>
              <div className="kkp-flex-between kkp-items-center">
                <Text strong style={{ fontSize: 24, color: '#101828', fontFamily: '"Manrope", sans-serif' }}>
                  {slaMetrics.paymentReleaseAvgTime}
                </Text>
                <div style={{ padding: 8, borderRadius: 8, background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                  <CheckCircleOutlined style={{ fontSize: 18 }} />
                </div>
              </div>
              <Text style={{ fontSize: 11, color: '#667085', marginTop: 12 }}>
                SLA target: <Text strong>30 mins</Text> (Within SLA)
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Admin Workload Queue Table */}
      <Card
        title={
          <Space>
            <DashboardOutlined style={{ color: '#0B4C8C', fontSize: 18 }} />
            <span className="kkp-text-navy kkp-font-manrope kkp-weight-700">Admin Operational Queue Workload</span>
          </Space>
        }
        className="kkp-card"
      >
        <Table
          columns={columns}
          dataSource={adminWorkloadData}
          pagination={false}
          className="kkp-table"
        />
        <div style={{ marginTop: 16, background: '#F8F9FC', padding: '12px 16px', borderRadius: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
          <InfoCircleOutlined style={{ color: '#0B4C8C', fontSize: 16 }} />
          <Text style={{ fontSize: 12, color: '#475467' }}>
            Queue levels are monitored in real-time. Workloads exceeding 10 items trigger system alerts to regional managers.
          </Text>
        </div>
      </Card>
    </div>
  );
}
