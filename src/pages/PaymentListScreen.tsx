import React, { useState } from 'react';
import { Table, Select, Button, Row, Col, Card as AntdCard, Statistic, Space, Input, message, Modal, Form, DatePicker, InputNumber, Tag } from 'antd';
const Card = AntdCard as any;
import {
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  PlusOutlined,
  WalletOutlined,
  DollarOutlined,
  FundOutlined,
  ClockCircleOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import GoldButton from '../components/GoldButton';
import KPICard from '../components/KPICard';
import StatusTag from '../components/StatusTag';
import { payments as seedPayments } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import type { Payment } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLoads } from '../context/LoadsContext';
import { useNotifications } from '../context/NotificationContext';
import { exportToCsv } from '../utils/exportCsv';
import dayjs, { type Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const OUTSIDE_METHODS = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Other'];

export default function PaymentListScreen() {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [payments, setPayments] = useState<Payment[]>(seedPayments);
  const [outsideModalOpen, setOutsideModalOpen] = useState(false);
  const [outsideForm] = Form.useForm();
  const { t } = useLanguage();
  const location = useLocation();
  const { user } = useAuth();
  const { loads } = useLoads();
  const { addNotification } = useNotifications();

  const isChairman = user?.role === 'CHAIRMAN';

  // Surface overdue payments as notifications (once per overdue id, persisted so
  // reloads don't re-spam the bell).
  const notifiedOverdue = React.useRef<Set<string>>(
    new Set(JSON.parse(localStorage.getItem('kkp_overdue_notified') || '[]'))
  );
  React.useEffect(() => {
    let changed = false;
    payments.filter(p => p.status === 'overdue').forEach(p => {
      if (notifiedOverdue.current.has(p.id)) return;
      notifiedOverdue.current.add(p.id);
      changed = true;
      addNotification({
        title: 'Payment overdue',
        message: `${p.loadId} — ₹${p.amount.toLocaleString()} to ${p.driverName} is overdue (due ${p.dueDate}).`,
        type: 'payment',
      });
    });
    if (changed) localStorage.setItem('kkp_overdue_notified', JSON.stringify([...notifiedOverdue.current]));
  }, [payments, addNotification]);

  // Outside-payment auto-fill: typing a load id pulls driver/amount/route from
  // an existing payment or the load record.
  const autofillFromLoad = (rawId: string) => {
    const id = (rawId || '').trim().toUpperCase();
    if (!id) return;
    const pay = payments.find(p => p.loadId.toUpperCase() === id);
    const load = loads.find(l => l.id.toUpperCase() === id);
    if (!pay && !load) return;
    const patch: Record<string, unknown> = { paidDate: dayjs() };
    const driverName = pay?.driverName || load?.assignedDriver;
    if (driverName) patch.driverName = driverName;
    const amount = pay?.amount ?? load?.budget;
    if (amount) patch.amount = amount;
    const route = pay?.route || (load ? `${load.source} → ${load.destination}` : '');
    if (route) patch.route = route;
    outsideForm.setFieldsValue(patch);
  };

  React.useEffect(() => {
    if (location.state?.searchText !== undefined) {
      setSearchText(location.state.searchText);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleMarkPaid = (record: Payment) => {
    setPayments(prev => prev.map(p =>
      p.id === record.id
        ? { ...p, status: 'paid' as const, paidDate: new Date().toISOString().slice(0, 10) }
        : p
    ));
    message.success(`Payment marked as paid for ${record.loadId}`);
  };

  const handleRecordOutside = async () => {
    let values;
    try {
      values = await outsideForm.validateFields();
    } catch {
      return;
    }
    const seq = payments.length + 1;
    const newPayment: Payment = {
      id: `PAY-${String(seq).padStart(3, '0')}-EXT`,
      loadId: values.loadId.trim().toUpperCase(),
      driverName: values.driverName.trim(),
      driverId: '—',
      amount: values.amount,
      status: 'paid',
      dueDate: values.paidDate.format('YYYY-MM-DD'),
      paidDate: values.paidDate.format('YYYY-MM-DD'),
      route: (values.route || '').trim() || '—',
      paymentMethod: values.paymentMethod,
      isOutside: true,
      notes: values.notes?.trim() || undefined,
    };
    setPayments(prev => [newPayment, ...prev]);
    message.success(`Outside payment of ₹${newPayment.amount.toLocaleString()} recorded for ${newPayment.loadId}.`);
    setOutsideModalOpen(false);
    outsideForm.resetFields();
  };

  const filteredPayments = payments.filter(p => {
    const matchSearch = !searchText ||
      p.loadId.toLowerCase().includes(searchText.toLowerCase()) ||
      p.driverName.toLowerCase().includes(searchText.toLowerCase()) ||
      p.route.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = !statusFilter || p.status === statusFilter;
    const matchDate = !dateRange || (() => {
      const d = dayjs(p.dueDate);
      return d.isAfter(dateRange[0].startOf('day').subtract(1, 'ms')) &&
             d.isBefore(dateRange[1].endOf('day').add(1, 'ms'));
    })();
    return matchSearch && matchStatus && matchDate;
  });

  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);
  const overdueCount = payments.filter(p => p.status === 'overdue').length;

  const handleExport = () => {
    exportToCsv('payments', [
      { header: 'Load ID', value: p => p.loadId },
      { header: 'Driver', value: p => p.driverName },
      { header: 'Route', value: p => p.route },
      { header: 'Amount', value: p => p.amount },
      { header: 'Status', value: p => p.status },
      { header: 'Due Date', value: p => p.dueDate },
      { header: 'Paid Date', value: p => p.paidDate || '' },
      { header: 'Method', value: p => p.paymentMethod || '' },
      { header: 'Outside', value: p => (p.isOutside ? 'Yes' : 'No') },
    ], filteredPayments);
    message.success(`Exported ${filteredPayments.length} payment(s) to CSV.`);
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
      width: 150,
      responsive: ['lg'],
      render: (method, record) => (
        <Space size={4}>
          <span className="kkp-text-drab">{method || '—'}</span>
          {record.isOutside && (
            <Tag color="purple" style={{ margin: 0, fontSize: 9, borderRadius: 4, border: 'none', fontWeight: 700, textTransform: 'uppercase' }}>
              Outside
            </Tag>
          )}
        </Space>
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
              onClick={() => handleMarkPaid(record)}
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
        subtitle={t('payments.summary', { count: payments.length })}
        extra={
          <Space>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
              className="kkp-btn-rounded kkp-weight-600 kkp-text-dark"
              style={{ borderColor: '#D0D5DD', background: '#FFFFFF' }}
            >
              {t('payments.exportExcel')}
            </Button>
            {!isChairman && (
              <GoldButton icon={<PlusOutlined />} onClick={() => setOutsideModalOpen(true)}>
                Record Outside Payment
              </GoldButton>
            )}
          </Space>
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

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={6}>
          <KPICard title="Today's Revenue" value="₹1.8L" trend="+20% vs avg" trendUp icon={<DollarOutlined />} color="#0B4C8C" />
        </Col>
        <Col xs={12} md={6}>
          <KPICard title="Month Revenue" value="₹28.4L" trend="+12% vs last month" trendUp icon={<FundOutlined />} color="#12B76A" />
        </Col>
        <Col xs={12} md={6}>
          <KPICard title="Pending Payouts" value="₹2.4L" trend="₹1.2L due today" trendUp={false} icon={<ClockCircleOutlined />} color="#F4811F" />
        </Col>
        <Col xs={12} md={6}>
          <KPICard title="Avg Trip Value" value="₹32,500" trend="+1.5% this month" trendUp icon={<LineChartOutlined />} color="#FFC20E" />
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
        <Col xs={24} sm={12} md={8}>
          <RangePicker
            value={dateRange as any}
            onChange={(v) => setDateRange(v as [Dayjs, Dayjs] | null)}
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            placeholder={['Due from', 'Due to']}
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

      <Modal
        open={outsideModalOpen}
        onCancel={() => { setOutsideModalOpen(false); outsideForm.resetFields(); }}
        onOk={handleRecordOutside}
        title={
          <span className="kkp-text-dark">
            <WalletOutlined className="kkp-text-navy" style={{ marginRight: 8 }} />
            Record Outside Payment
          </span>
        }
        okText="Record Payment"
        okButtonProps={{ style: { background: '#0B4C8C', border: 'none', color: '#FFFFFF', fontWeight: 700 } }}
        width={560}
        destroyOnClose
      >
        <p className="kkp-text-drab" style={{ fontSize: 12, marginTop: 0, marginBottom: 16 }}>
          Log a payment that was settled outside the platform (cash, direct UPI, cheque, etc.).
          It will be added to the ledger as <strong className="kkp-text-dark">Paid</strong>.
        </p>
        <Form form={outsideForm} layout="vertical" requiredMark="optional" initialValues={{ paymentMethod: 'Cash' }}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="loadId"
                label={<span className="kkp-text-muted kkp-weight-600">Load ID</span>}
                rules={[{ required: true, message: 'Please enter the load ID' }]}
                extra={<span className="kkp-text-drab" style={{ fontSize: 11 }}>Driver, amount &amp; route auto-fill from the load.</span>}
              >
                <Input
                  placeholder="e.g. LD-1003"
                  allowClear
                  onBlur={(e) => autofillFromLoad(e.target.value)}
                  onPressEnter={(e) => autofillFromLoad((e.target as HTMLInputElement).value)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="driverName"
                label={<span className="kkp-text-muted kkp-weight-600">Driver Name</span>}
                rules={[{ required: true, message: 'Please enter the driver name' }]}
              >
                <Input placeholder="e.g. Suresh Kumar" allowClear />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="amount"
                label={<span className="kkp-text-muted kkp-weight-600">Amount (₹)</span>}
                rules={[{ required: true, message: 'Please enter the amount' }]}
              >
                <InputNumber
                  min={1}
                  placeholder="e.g. 28000"
                  style={{ width: '100%' }}
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/₹\s?|(,*)/g, '') as any}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="paymentMethod"
                label={<span className="kkp-text-muted kkp-weight-600">Method</span>}
                rules={[{ required: true, message: 'Please select a method' }]}
              >
                <Select options={OUTSIDE_METHODS.map(m => ({ value: m, label: m }))} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="paidDate"
                label={<span className="kkp-text-muted kkp-weight-600">Paid Date</span>}
                rules={[{ required: true, message: 'Please select the paid date' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="route"
                label={<span className="kkp-text-muted kkp-weight-600">Route</span>}
              >
                <Input placeholder="e.g. Kolkata → Guwahati" allowClear />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="notes"
            label={<span className="kkp-text-muted kkp-weight-600">Notes</span>}
          >
            <Input.TextArea rows={2} placeholder="Optional reference / remarks" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
