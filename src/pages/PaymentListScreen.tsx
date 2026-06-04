import React, { useState } from 'react';
import { Table, Select, Button, Row, Col, Card as AntdCard, Statistic, Space, Input, message } from 'antd';
const Card = AntdCard as any;
import {
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatusTag from '../components/StatusTag';
import { payments } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import type { Payment } from '../types';
import { useAuth } from '../context/AuthContext';

export default function PaymentListScreen() {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { t } = useLanguage();
  const location = useLocation();
  const { user } = useAuth();

  const isChairman = user?.role === 'CHAIRMAN';

  React.useEffect(() => {
    if (location.state?.searchText !== undefined) {
      setSearchText(location.state.searchText);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const filteredPayments = payments.filter(p => {
    const matchSearch = !searchText ||
      p.loadId.toLowerCase().includes(searchText.toLowerCase()) ||
      p.driverName.toLowerCase().includes(searchText.toLowerCase()) ||
      p.route.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);
  const overdueCount = payments.filter(p => p.status === 'overdue').length;

  const handleExport = () => {
    message.success('Payment report exported to Excel!');
  };

  const columns: ColumnsType<Payment> = [
    {
      title: t('payments.loadId'),
      dataIndex: 'loadId',
      key: 'loadId',
      width: 100,
      render: (id) => <span className="kkp-text-gold kkp-weight-700">{id}</span>,
    },
    {
      title: t('loads.route'),
      dataIndex: 'route',
      key: 'route',
      width: 220,
      render: (route) => <span className="kkp-text-dark">{route}</span>,
    },
    {
      title: t('payments.driver'),
      dataIndex: 'driverName',
      key: 'driverName',
      width: 160,
    },
    {
      title: t('payments.amount'),
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      sorter: (a, b) => a.amount - b.amount,
      render: (amount) => (
        <span className="kkp-text-navy kkp-font-manrope kkp-weight-700">
          ₹{amount.toLocaleString()}
        </span>
      ),
    },
    {
      title: t('loads.status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => <StatusTag status={status as any} />,
    },
    {
      title: t('payments.dueDate'),
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 110,
      sorter: (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      render: (date, record) => (
        <span className={record.status === 'overdue' ? 'kkp-text-error' : 'kkp-text-drab'}>
          {date}
        </span>
      ),
    },
    {
      title: t('payments.method'),
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 110,
      responsive: ['lg'],
      render: (method) => (
        <span className="kkp-text-drab">{method || '—'}</span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Space>
          {(record.status === 'pending' || record.status === 'overdue') && (
            <Button
              size="small"
              onClick={() => message.success(`Payment marked as paid for ${record.loadId}`)}
              disabled={isChairman}
              style={{
                borderRadius: 8,
                background: 'rgba(11,76,172,0.05)',
                borderColor: '#0B4C8C',
                color: '#0B4C8C',
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              {t('payments.pay')}
            </Button>
          )}
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            style={{ color: '#5A4F42' }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('payments.title')}
        subtitle={`${payments.length} ${t('payments.totalTracked')}`}
        extra={
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExport}
            className="kkp-btn-rounded kkp-weight-600 kkp-text-dark"
            style={{ borderColor: '#D0D5DD', background: '#FFFFFF' }}
          >
            {t('payments.exportExcel')}
          </Button>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={8} md={6}>
          <Card className="kkp-card kkp-text-center" styles={{ body: { padding: 16 } }}>
            <Statistic
              title={<span className="kkp-text-drab kkp-text-caption">{t('payments.totalPaid')}</span>}
              value={totalPaid}
              prefix="₹"
              valueStyle={{ color: '#12B76A', fontSize: 18, fontWeight: 800, fontFamily: '"Manrope", sans-serif' }}
              formatter={(v) => Number(v).toLocaleString()}
            />
          </Card>
        </Col>
        <Col xs={8} md={6}>
          <Card className="kkp-card kkp-text-center" styles={{ body: { padding: 16 } }}>
            <Statistic
              title={<span className="kkp-text-drab kkp-text-caption">{t('payments.pendingAmount')}</span>}
              value={totalPending}
              prefix="₹"
              valueStyle={{ color: '#FFC20E', fontSize: 18, fontWeight: 800, fontFamily: '"Manrope", sans-serif' }}
              formatter={(v) => Number(v).toLocaleString()}
            />
          </Card>
        </Col>
        <Col xs={8} md={6}>
          <Card className="kkp-card kkp-text-center" styles={{ body: { padding: 16 } }}>
            <Statistic
              title={<span className="kkp-text-drab kkp-text-caption">{t('payments.overdue')} ({overdueCount})</span>}
              value={totalOverdue}
              prefix="₹"
              valueStyle={{ color: '#F04438', fontSize: 18, fontWeight: 800, fontFamily: '"Manrope", sans-serif' }}
              formatter={(v) => Number(v).toLocaleString()}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={8}>
          <Input
            placeholder={t('payments.searchPlaceholder')}
            prefix={<SearchOutlined className="kkp-text-drab" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="kkp-btn-rounded"
            style={{ background: '#FFFFFF', borderColor: '#E4E7EC' }}
            allowClear
          />
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Select
            placeholder={t('common.filter')}
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: '100%' }}
            allowClear
            options={[
              { value: 'pending', label: t('status.pending') },
              { value: 'paid', label: t('status.paid') },
              { value: 'overdue', label: t('status.overdue') },
              { value: 'processing', label: t('status.processing') },
            ]}
          />
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filteredPayments}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (t_val) => <span className="kkp-text-drab">{t('common.total')} {t_val}</span>,
        }}
        scroll={{ x: 800 }}
      />
    </div>
  );
}
