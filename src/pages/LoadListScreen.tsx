import React, { useState } from 'react';
import { Table, Input, Select, DatePicker, Button, Space, Dropdown, Row, Col, Modal, message, Checkbox, Typography, Alert, InputNumber, Switch, Tag } from 'antd';
import {
  SearchOutlined,
  ThunderboltOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  PlusOutlined,
  UserOutlined,
  ShoppingOutlined,
  CarOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import KPICard from '../components/KPICard';
import { exportToCsv } from '../utils/exportCsv';
import StatusTag from '../components/StatusTag';
import GoldButton from '../components/GoldButton';
import { useLoads } from '../context/LoadsContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import type { Load } from '../types';

const { RangePicker } = DatePicker;
const { Text } = Typography;

export default function LoadListScreen() {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [vehicleFilter, setVehicleFilter] = useState<string | null>(null);
  const [routeFilter, setRouteFilter] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [loadToDelete, setLoadToDelete] = useState<Load | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteRiskCheckbox, setDeleteRiskCheckbox] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { loads, cancelLoad, loading, error, refresh, updatePricing } = useLoads();
  const { t } = useLanguage();
  const { can } = useAuth();

  const canPricing = can('loads.pricing.edit');

  // ── Pricing worksheet (mirrors the dashboard Loads Ledger) ──
  type Draft = { quotedAmount: number; kkpPrice: number; bidAmount: number | null; offeredAmount: number; amountVisible: boolean };
  const [pricing, setPricing] = useState<Record<string, Draft>>({});
  React.useEffect(() => {
    setPricing(prev => {
      const next = { ...prev };
      let changed = false;
      for (const l of loads) {
        if (!next[l.id]) {
          next[l.id] = {
            quotedAmount: l.quotedAmount ?? l.budget ?? 0,
            kkpPrice: l.kkpPrice ?? l.budget ?? 0,
            bidAmount: l.bidAmount ?? null,
            offeredAmount: l.offeredAmount ?? 0,
            amountVisible: l.amountVisible !== false,
          };
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [loads]);

  const money = (n?: number | null) => (n || n === 0 ? `₹${Number(n).toLocaleString('en-IN')}` : '—');
  const isAssigned = (l: Load) => !!l.assignedDriver;
  const getP = (id: string): Draft => pricing[id] || { quotedAmount: 0, kkpPrice: 0, bidAmount: null, offeredAmount: 0, amountVisible: true };
  const setField = (id: string, field: keyof Draft, value: any) =>
    setPricing(prev => ({ ...prev, [id]: { ...getP(id), [field]: value } }));
  const saveField = (id: string, patch: Partial<Draft>) =>
    updatePricing(id, patch).catch(() => message.error('Failed to save pricing'));

  const editNum = (id: string, field: 'kkpPrice' | 'offeredAmount') => (
    <InputNumber
      size="small"
      value={getP(id)[field] as number}
      min={0}
      controls={false}
      disabled={!canPricing}
      style={{ width: 96 }}
      prefix="₹"
      formatter={(v: any) => (v == null || v === '' ? '' : `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','))}
      parser={(v: any) => (v ? Number(String(v).replace(/[^\d]/g, '')) : 0) as any}
      onChange={(v) => setField(id, field, v == null ? 0 : Number(v))}
      onBlur={() => saveField(id, { [field]: getP(id)[field] })}
    />
  );

  // Distinct vehicle types & routes present in the current loads (for filters).
  const vehicleOptions = Array.from(new Set(loads.map(l => l.vehicleType))).map(v => ({ value: v, label: v }));
  const routeOptions = Array.from(new Set(loads.map(l => `${l.source} → ${l.destination}`))).map(r => ({ value: r, label: r }));

  React.useEffect(() => {
    if (location.state?.searchText !== undefined) {
      setSearchText(location.state.searchText);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const canPost = can('loads.post');
  const canDelete = can('loads.delete');
  const canMatch = can('match.view');

  const filteredLoads = loads.filter(load => {
    const q = searchText.toLowerCase();
    const matchSearch = !searchText ||
      load.id.toLowerCase().includes(q) ||
      load.source.toLowerCase().includes(q) ||
      load.destination.toLowerCase().includes(q) ||
      `${load.source} → ${load.destination}`.toLowerCase().includes(q) ||
      (load.assignedDriver || '').toLowerCase().includes(q) ||
      load.vehicleType.toLowerCase().includes(q);
    const matchStatus = !statusFilter || load.status === statusFilter;
    const matchVehicle = !vehicleFilter || load.vehicleType === vehicleFilter;
    const matchRoute = !routeFilter || `${load.source} → ${load.destination}` === routeFilter;
    return matchSearch && matchStatus && matchVehicle && matchRoute;
  });

  const columns: ColumnsType<Load> = [
    {
      title: t('loads.loadId'),
      dataIndex: 'id',
      key: 'id',
      width: 110,
      render: (id) => <span className="kkp-text-gold kkp-weight-700">{id}</span>,
    },
    {
      title: t('loads.route'),
      key: 'route',
      width: 240,
      render: (_, record) => (
        <div>
          <div className="kkp-text-dark kkp-weight-600">{record.source}</div>
          <div className="kkp-text-drab" style={{ fontSize: 12 }}>→ {record.destination}</div>
        </div>
      ),
    },
    {
      title: 'Handling',
      key: 'handling',
      width: 160,
      responsive: ['lg'],
      render: (_, record) => record.handling
        ? <Tag color={/fragile|hazmat|perishable|liquid|temperature/i.test(record.handling) ? 'red' : 'blue'} style={{ borderRadius: 6, whiteSpace: 'normal', margin: 0 }}>{record.handling}</Tag>
        : <span className="kkp-text-drab">—</span>,
    },
    {
      title: t('loads.vehicle'),
      dataIndex: 'vehicleType',
      key: 'vehicleType',
      width: 140,
      responsive: ['md'],
    },
    {
      title: t('loads.driver') || 'Driver',
      key: 'driver',
      width: 150,
      responsive: ['md'],
      render: (_, record) => record.assignedDriver ? (
        <Space>
          <UserOutlined style={{ color: '#0B4C8C' }} />
          <span className="kkp-text-dark">{record.assignedDriver}</span>
        </Space>
      ) : (
        <span className="kkp-text-drab">—</span>
      ),
    },
    {
      title: 'Assignment',
      key: 'assigned',
      width: 120,
      render: (_, record) => (
        <Tag color={isAssigned(record) ? 'success' : 'default'} style={{ borderRadius: 6, fontWeight: 600 }}>
          {isAssigned(record) ? 'Assigned' : 'Unassigned'}
        </Tag>
      ),
    },
    {
      title: t('loads.weight'),
      dataIndex: 'weight',
      key: 'weight',
      width: 100,
      responsive: ['lg'],
      render: (w) => <span className="kkp-text-dark kkp-weight-600">{w > 100 ? (w / 1000).toFixed(1) : w}T</span>,
    },
    {
      title: 'Quoted',
      key: 'quoted',
      width: 120,
      render: (_, record) => {
        // Quoted shows the running total = base quote + driver's offered extra.
        const p = getP(record.id);
        const total = (p.quotedAmount || 0) + (p.offeredAmount || 0);
        return (
          <InputNumber
            size="small"
            value={total}
            min={0}
            controls={false}
            disabled={!canPricing}
            style={{ width: 96 }}
            prefix="₹"
            formatter={(v: any) => (v == null || v === '' ? '' : `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','))}
            parser={(v: any) => (v ? Number(String(v).replace(/[^\d]/g, '')) : 0) as any}
            onChange={(v) => setField(record.id, 'quotedAmount', Math.max(0, (Number(v) || 0) - (p.offeredAmount || 0)))}
            onBlur={() => saveField(record.id, { quotedAmount: getP(record.id).quotedAmount })}
          />
        );
      },
    },
    { title: 'KKP Price', key: 'kkp', width: 120, render: (_, record) => editNum(record.id, 'kkpPrice') },
    { title: 'Offered', key: 'offered', width: 120, render: (_, record) => editNum(record.id, 'offeredAmount') },
    {
      title: 'Final',
      key: 'final',
      width: 110,
      align: 'right',
      render: (_, record) => {
        const p = getP(record.id);
        return <span className="kkp-weight-800" style={{ color: '#12B76A' }}>{money((p.quotedAmount || 0) + (p.offeredAmount || 0))}</span>;
      },
    },
    {
      title: t('loads.status'),
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => <StatusTag status={status as any} />,
    },
    {
      title: t('loads.budget'),
      key: 'budget',
      width: 140,
      responsive: ['md'],
      render: (_, record) => {
        if (record.priceType === 'per_ton') {
          return (
            <div>
              <span className="kkp-text-navy kkp-weight-700">₹{(record.ratePerTon || 0).toLocaleString()}/T</span>
              <div className="kkp-text-drab" style={{ fontSize: 11, fontWeight: 500 }}>
                Total: ₹{(record.budget || 0).toLocaleString()}
              </div>
            </div>
          );
        }
        return (
          <div>
            <span className="kkp-text-navy kkp-weight-700">₹{record.budget.toLocaleString()}</span>
            <div className="kkp-text-drab" style={{ fontSize: 11, fontWeight: 500 }}>Fixed Price</div>
          </div>
        );
      },
    },
    {
      title: 'Show to driver',
      key: 'visible',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Switch
          size="small"
          checked={getP(record.id).amountVisible}
          disabled={!canPricing}
          onChange={(c) => { setField(record.id, 'amountVisible', c); saveField(record.id, { amountVisible: c }); }}
        />
      ),
    },
    {
      title: t('loads.date'),
      dataIndex: 'postedDate',
      key: 'postedDate',
      width: 110,
      responsive: ['lg'],
      render: (d) => <span className="kkp-text-drab">{d}</span>,
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => {
        const menuItems: any[] = [];
        if (canMatch) {
          menuItems.push({ key: 'view', icon: <ThunderboltOutlined />, label: 'Find Drivers', onClick: () => navigate(`/match/${record.id}`) });
        }
        if (canPost) {
          menuItems.push({ key: 'edit', icon: <EditOutlined />, label: t('loads.editLoad') } as any);
        }
        if (canDelete) {
          menuItems.push(
            { type: 'divider' } as any,
            { key: 'delete', icon: <DeleteOutlined />, label: t('loads.cancelLoad'), danger: true, onClick: () => handleDeleteClick(record) } as any
          );
        }
        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined />} className="kkp-text-drab" />
          </Dropdown>
        );
      },
    },
  ];

  const handleDeleteClick = (load: Load) => {
    if (!canDelete) {
      Modal.error({
        title: 'Access Restricted',
        content: 'You do not have permission to delete or cancel loads.',
      });
      return;
    }
    if (!canDelete) {
      Modal.error({
        title: 'Access Restricted',
        content: 'Unauthorized Operation: Deleting or cancelling load records is restricted.',
      });
      return;
    }
    setLoadToDelete(load);
    setDeleteConfirmText('');
    setDeleteRiskCheckbox(false);
    setDeleteModalOpen(true);
  };

  const handleExportLoads = () => {
    exportToCsv('loads', [
      { header: 'Load ID', value: l => l.id },
      { header: 'Source', value: l => l.source },
      { header: 'Destination', value: l => l.destination },
      { header: 'Vehicle', value: l => l.vehicleType },
      { header: 'Handling', value: l => l.handling || '' },
      { header: 'Weight', value: l => l.weight },
      { header: 'Status', value: l => l.status },
      { header: 'Driver', value: l => l.assignedDriver || '' },
      { header: 'Assignment', value: l => (l.assignedDriver ? 'Assigned' : 'Unassigned') },
      { header: 'Quoted', value: l => (getP(l.id).quotedAmount || 0) + (getP(l.id).offeredAmount || 0) },
      { header: 'KKP Price', value: l => getP(l.id).kkpPrice },
      { header: 'Offered', value: l => getP(l.id).offeredAmount },
      { header: 'Final', value: l => (getP(l.id).quotedAmount || 0) + (getP(l.id).offeredAmount || 0) },
      { header: 'Show to driver', value: l => (getP(l.id).amountVisible ? 'Yes' : 'No') },
      { header: 'Budget', value: l => l.budget },
      { header: 'Posted', value: l => l.postedDate },
    ], filteredLoads);
    message.success(`Exported ${filteredLoads.length} load(s) to CSV.`);
  };

  const handleConfirmDelete = async () => {
    if (loadToDelete && deleteConfirmText === 'DELETE CONFIRM' && deleteRiskCheckbox) {
      try {
        await cancelLoad(loadToDelete.id);
        message.success(`Load ${loadToDelete.id} cancelled.`);
        setDeleteModalOpen(false);
      } catch (e) {
        message.error(`Failed to cancel load: ${e instanceof Error ? e.message : 'unknown error'}`);
      }
    }
  };

  return (
    <div>
      <PageHeader
        title={t('loads.title')}
        subtitle={t('loads.summary', { total: loads.length, active: loads.filter(l => l.status === 'active').length })}
        extra={
          <Space>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExportLoads}
              className="kkp-btn-rounded kkp-weight-600 kkp-text-dark"
              style={{ borderColor: '#D0D5DD', background: '#FFFFFF' }}
            >
              Export
            </Button>
            {canPost && (
              <GoldButton icon={<PlusOutlined />} onClick={() => navigate('/loads/new')}>
                {t('loads.postNew')}
              </GoldButton>
            )}
          </Space>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} md={8}>
          <KPICard
            title="Available Loads"
            value={loads.filter(l => l.status === 'active').length}
            trend="Open for matching"
            trendUp
            icon={<ShoppingOutlined />}
            color="#FFC20E"
            active={statusFilter === 'active'}
            onClick={() => setStatusFilter(statusFilter === 'active' ? null : 'active')}
          />
        </Col>
        <Col xs={12} md={8}>
          <KPICard
            title="In Transit"
            value={loads.filter(l => l.status === 'in_transit').length}
            trend="On the road"
            trendUp
            icon={<CarOutlined />}
            color="#0B4C8C"
            active={statusFilter === 'in_transit'}
            onClick={() => setStatusFilter(statusFilter === 'in_transit' ? null : 'in_transit')}
          />
        </Col>
        <Col xs={12} md={8}>
          <KPICard
            title="Delivered"
            value={loads.filter(l => l.status === 'delivered' || l.status === 'completed').length}
            trend="Completed"
            trendUp
            icon={<CheckCircleOutlined />}
            color="#12B76A"
            active={statusFilter === 'delivered'}
            onClick={() => setStatusFilter(statusFilter === 'delivered' ? null : 'delivered')}
          />
        </Col>
      </Row>

      {error && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16, borderRadius: 10 }}
          message="Couldn't reach the loads service"
          description={error}
          action={<Button size="small" onClick={refresh}>Retry</Button>}
        />
      )}

      {/* Filters */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={6}>
          <Input
            placeholder={t('loads.searchPlaceholder')}
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
            placeholder="Vehicle"
            value={vehicleFilter}
            onChange={setVehicleFilter}
            style={{ width: '100%', borderRadius: 10 }}
            allowClear
            showSearch
            options={vehicleOptions}
          />
        </Col>
        <Col xs={12} sm={6} md={5}>
          <Select
            placeholder="Route"
            value={routeFilter}
            onChange={setRouteFilter}
            style={{ width: '100%', borderRadius: 10 }}
            allowClear
            showSearch
            options={routeOptions}
          />
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Select
            placeholder={t('common.filter')}
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: '100%', borderRadius: 10 }}
            allowClear
            options={[
              { value: 'active', label: t('status.active') },
              { value: 'in_transit', label: t('status.inTransit') },
              { value: 'delivered', label: t('status.delivered') },
              { value: 'completed', label: t('status.completed') },
              { value: 'delayed', label: t('status.delayed') },
              { value: 'cancelled', label: t('status.cancelled') },
            ]}
          />
        </Col>
        <Col xs={12} sm={6} md={5}>
          <RangePicker style={{ width: '100%', borderRadius: 10 }} />
        </Col>
      </Row>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredLoads}
        rowKey="id"
        loading={loading && loads.length === 0}
        locale={{ emptyText: loading ? 'Loading loads…' : 'No loads yet — post one to get started.' }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => <span className="kkp-text-drab">{t('common.total')} {total}</span>,
        }}
        style={{ borderRadius: 14, overflow: 'hidden' }}
        scroll={{ x: 2000 }}
      />

      {/* Secure Deletion Modal */}
      <Modal
        title={<span style={{ color: '#E63F3F', fontWeight: 800 }}>⚠️ Critical Data Deletion Confirmation</span>}
        open={deleteModalOpen}
        onOk={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
        okText="Permanently Delete"
        okButtonProps={{ 
          danger: true, 
          disabled: deleteConfirmText !== 'DELETE CONFIRM' || !deleteRiskCheckbox,
          className: 'kkp-btn-gold',
          style: { background: '#E63F3F', border: 'none' }
        }}
      >
        <div style={{ marginTop: 12, marginBottom: 16 }}>
          <Text style={{ display: 'block', marginBottom: 12, fontSize: 13 }}>
            You are about to permanently delete load <Text strong>{loadToDelete?.id}</Text> (<Text strong>{loadToDelete?.source} → {loadToDelete?.destination}</Text>). This action cannot be undone and will automatically cancel any active trips or driver assignments associated with this load.
          </Text>

          <div style={{ marginBottom: 16 }}>
            <Checkbox 
              checked={deleteRiskCheckbox} 
              onChange={e => setDeleteRiskCheckbox(e.target.checked)}
            >
              <Text strong style={{ color: '#E63F3F', fontSize: 12 }}>I confirm that this is a critical operation and I accept all operational risks.</Text>
            </Checkbox>
          </div>

          <Text style={{ display: 'block', marginBottom: 6, fontSize: 12 }}>To proceed, please type <Text strong style={{ color: '#E63F3F' }}>DELETE CONFIRM</Text> below:</Text>
          <Input 
            placeholder="Type DELETE CONFIRM" 
            value={deleteConfirmText} 
            onChange={e => setDeleteConfirmText(e.target.value)} 
          />
        </div>
      </Modal>
    </div>
  );
}
