import React from 'react';
import { Row, Col, Card as AntdCard, Table, Tag, Typography, Space } from 'antd';
const Card = AntdCard as any;
import { DollarOutlined, ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
import { paymentPipelineData, paymentDetailsData, payoutMetrics } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

const { Text } = Typography;

export default function PaymentAnalyticsPage() {
  const { t } = useLanguage();

  const pipelineColumns = [
    {
      title: 'Pipeline Stage',
      dataIndex: 'stage',
      key: 'stage',
      render: (text: string) => <Text strong style={{ color: '#0B4C8C' }}>{text}</Text>,
    },
    {
      title: 'Active Invoices',
      dataIndex: 'count',
      key: 'count',
      align: 'center' as const,
      render: (val: number) => <Tag color="blue">{val} loads</Tag>,
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right' as const,
      render: (val: number) => `₹${val.toLocaleString()}`,
    },
  ];

  const detailColumns = [
    {
      title: 'Trip ID',
      dataIndex: 'assignmentId',
      key: 'assignmentId',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Driver',
      dataIndex: 'driverName',
      key: 'driverName',
      render: (text: string) => <Text style={{ color: '#101828', fontWeight: 600 }}>{text}</Text>,
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val: number) => `₹${val.toLocaleString()}`,
    },
    {
      title: 'Advance Paid',
      dataIndex: 'advancePaid',
      key: 'advancePaid',
      render: (val: number) => `₹${val.toLocaleString()}`,
    },
    {
      title: 'Advance Status',
      dataIndex: 'advanceStatus',
      key: 'advanceStatus',
      render: (status: string) => {
        let color = 'default';
        if (status === 'Paid') color = 'success';
        else if (status === 'Pending') color = 'warning';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Balance Status',
      dataIndex: 'balanceStatus',
      key: 'balanceStatus',
      render: (status: string) => {
        let color = 'default';
        if (status === 'Paid') color = 'success';
        else if (status === 'Pending POD') color = 'warning';
        else if (status === 'Disputed') color = 'error';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Invoice Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
    },
    {
      title: 'Paid Date',
      dataIndex: 'paidDate',
      key: 'paidDate',
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('analytics.payments-analytics')}
        subtitle="Financial pipelines, balance dispersals, processing times, and dispute resolution tracking"
      />

      {/* Financial KPIs */}
      <Row gutter={[20, 20]} className="kkp-mb-28">
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="kkp-card" styles={{ body: { padding: 20 } }}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text className="kkp-text-muted kkp-text-caption">Paid Out (This Month)</Text>
              <div className="kkp-flex-between kkp-items-center">
                <Text strong style={{ fontSize: 24, color: '#101828', fontFamily: '"Manrope", sans-serif' }}>
                  ₹{(payoutMetrics.totalPaidOutMonth / 100000).toFixed(2)}L
                </Text>
                <div style={{ padding: 8, borderRadius: 8, background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                  <CheckCircleOutlined style={{ fontSize: 18 }} />
                </div>
              </div>
              <Text style={{ fontSize: 11, color: '#667085', marginTop: 12 }}>
                Target: <Text strong>98%</Text> disbursement success
              </Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="kkp-card" styles={{ body: { padding: 20 } }}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text className="kkp-text-muted kkp-text-caption">Pending Payouts</Text>
              <div className="kkp-flex-between kkp-items-center">
                <Text strong style={{ fontSize: 24, color: '#101828', fontFamily: '"Manrope", sans-serif' }}>
                  ₹{(payoutMetrics.totalPendingPayouts / 100000).toFixed(2)}L
                </Text>
                <div style={{ padding: 8, borderRadius: 8, background: 'rgba(244,129,31,0.1)', color: '#F4811F' }}>
                  <ClockCircleOutlined style={{ fontSize: 18 }} />
                </div>
              </div>
              <Text style={{ fontSize: 11, color: '#667085', marginTop: 12 }}>
                POD validation waiting
              </Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="kkp-card" styles={{ body: { padding: 20 } }}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text className="kkp-text-muted kkp-text-caption">Average Release Time</Text>
              <div className="kkp-flex-between kkp-items-center">
                <Text strong style={{ fontSize: 24, color: '#101828', fontFamily: '"Manrope", sans-serif' }}>
                  {payoutMetrics.avgDaysToPayment} days
                </Text>
                <div style={{ padding: 8, borderRadius: 8, background: 'rgba(11,76,140,0.1)', color: '#0B4C8C' }}>
                  <ClockCircleOutlined style={{ fontSize: 18 }} />
                </div>
              </div>
              <Text style={{ fontSize: 11, color: '#667085', marginTop: 12 }}>
                SLA target: <Text strong>&lt;5.0 days</Text> limit
              </Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="kkp-card" styles={{ body: { padding: 20 } }}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text className="kkp-text-muted kkp-text-caption">Dispute Register</Text>
              <div className="kkp-flex-between kkp-items-center">
                <Text strong style={{ fontSize: 24, color: '#E63F3F', fontFamily: '"Manrope", sans-serif' }}>
                  {payoutMetrics.paymentDisputeCount} Active
                </Text>
                <div style={{ padding: 8, borderRadius: 8, background: 'rgba(230,63,63,0.1)', color: '#E63F3F' }}>
                  <ExclamationCircleOutlined style={{ fontSize: 18 }} />
                </div>
              </div>
              <Text style={{ fontSize: 11, color: '#667085', marginTop: 12 }}>
                SLA resolution limit: <Text strong>24 hours</Text>
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]} className="kkp-mb-28">
        {/* Payment Pipeline stage card */}
        <Col xs={24} xl={8}>
          <Card
            title={<span className="kkp-text-navy kkp-font-manrope kkp-weight-700">Financial Pipeline Stages</span>}
            className="kkp-card"
          >
            <Table
              columns={pipelineColumns}
              dataSource={paymentPipelineData}
              pagination={false}
              className="kkp-table"
            />
          </Card>
        </Col>

        {/* Detailed payment ledger */}
        <Col xs={24} xl={16}>
          <Card
            title={<span className="kkp-text-navy kkp-font-manrope kkp-weight-700">Recent Balances & Disbursements Ledger</span>}
            className="kkp-card"
          >
            <Table
              columns={detailColumns}
              dataSource={paymentDetailsData}
              pagination={{ pageSize: 4 }}
              scroll={{ x: 'max-content' }}
              className="kkp-table"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
