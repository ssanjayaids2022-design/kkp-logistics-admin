import React, { useState } from 'react';
import { Table, Input, Select, DatePicker, Button, Space, Tag, Dropdown, Row, Col, Modal, message, Checkbox, Typography } from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
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
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [loadToDelete, setLoadToDelete] = useState<Load | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteRiskCheckbox, setDeleteRiskCheckbox] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { loads, deleteLoad } = useLoads();
  const { t } = useLanguage();
  const { user } = useAuth();

  React.useEffect(() => {
    if (location.state?.searchText !== undefined) {
      setSearchText(location.state.searchText);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const isChairman = user?.role === 'CHAIRMAN';
  const canDelete = user?.role === 'MANAGER' || user?.role === 'LOAD_ADMIN';

  const filteredLoads = loads.filter(load => {
    const matchSearch = !searchText ||
      load.id.toLowerCase().includes(searchText.toLowerCase()) ||
      load.source.toLowerCase().includes(searchText.toLowerCase()) ||
      load.destination.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = !statusFilter || load.status === statusFilter;
    return matchSearch && matchStatus;
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
      title: t('loads.weight'),
      dataIndex: 'weight',
      key: 'weight',
      width: 100,
      responsive: ['lg'],
      render: (w) => <span className="kkp-text-dark kkp-weight-600">{w > 100 ? (w / 1000).toFixed(1) : w}T</span>,
    },
    {
      title: t('loads.status'),
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => <StatusTag status={status as any} />,
    },
    {
      title: t('loads.bids'),
      dataIndex: 'bidsCount',
      key: 'bidsCount',
      width: 70,
      align: 'center',
      render: (count) => (
        <Tag style={{
          borderRadius: 20,
          fontWeight: 700,
          background: count > 0 ? 'rgba(11,76,172,0.08)' : '#F9FAFB',
          color: count > 0 ? '#0B4C8C' : '#98A2B3',
          border: 'none',
          minWidth: 32,
          textAlign: 'center',
        }}>
          {count}
        </Tag>
      ),
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
        const menuItems = [
          { key: 'view', icon: <EyeOutlined />, label: t('loads.viewBids'), onClick: () => navigate('/bids') },
        ];
        if (!isChairman) {
          menuItems.push(
            { key: 'edit', icon: <EditOutlined />, label: t('loads.editLoad') } as any,
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
    if (isChairman) {
      Modal.error({
        title: 'Access Restricted',
        content: 'As Chairman, you have read-only auditor access and cannot delete or cancel loads.',
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

  const handleConfirmDelete = () => {
    if (loadToDelete && deleteConfirmText === 'DELETE CONFIRM' && deleteRiskCheckbox) {
      deleteLoad(loadToDelete.id);
      message.success(`Load ${loadToDelete.id} permanently deleted.`);
      setDeleteModalOpen(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={t('loads.title')}
        subtitle={`${loads.length} ${t('loads.totalLoads')} — ${loads.filter(l => l.status === 'active').length} ${t('loads.active')}`}
        extra={
          !isChairman && (
            <GoldButton icon={<PlusOutlined />} onClick={() => navigate('/loads/new')}>
              {t('loads.postNew')}
            </GoldButton>
          )
        }
      />

      {/* Filters */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={8}>
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
            placeholder={t('common.filter')}
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: '100%', borderRadius: 10 }}
            allowClear
            options={[
              { value: 'pending', label: t('status.pending') },
              { value: 'active', label: t('status.active') },
              { value: 'in_transit', label: t('status.inTransit') },
              { value: 'delivered', label: t('status.delivered') },
              { value: 'completed', label: t('status.completed') },
              { value: 'delayed', label: t('status.delayed') },
              { value: 'cancelled', label: t('status.cancelled') },
            ]}
          />
        </Col>
        <Col xs={12} sm={6} md={4}>
          <RangePicker style={{ width: '100%', borderRadius: 10 }} />
        </Col>
      </Row>

      {/* Table */}
      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        columns={columns}
        dataSource={filteredLoads}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => <span className="kkp-text-drab">{t('common.total')} {total}</span>,
        }}
        style={{ borderRadius: 14, overflow: 'hidden' }}
        scroll={{ x: 800 }}
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
            You are about to permanently delete load <Text strong>{loadToDelete?.id}</Text> (<Text strong>{loadToDelete?.source} → {loadToDelete?.destination}</Text>). This action cannot be undone and will automatically cancel any active trips or driver bidding assignments associated with this load.
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
