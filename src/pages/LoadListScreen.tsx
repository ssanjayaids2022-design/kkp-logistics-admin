import React, { useState } from 'react';
import { Table, Input, Select, DatePicker, Button, Space, Tag, Dropdown, Row, Col } from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatusTag from '../components/StatusTag';
import GoldButton from '../components/GoldButton';
import { useLoads } from '../context/LoadsContext';
import { useLanguage } from '../context/LanguageContext';
import { UserOutlined } from '@ant-design/icons';
import type { Load } from '../types';

const { RangePicker } = DatePicker;

export default function LoadListScreen() {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const navigate = useNavigate();
  const { loads } = useLoads();
  const { t } = useLanguage();

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
          <UserOutlined style={{ color: '#1A237E' }} />
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
          background: count > 0 ? 'rgba(26,35,126,0.08)' : '#F9FAFB',
          color: count > 0 ? '#1A237E' : '#98A2B3',
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
      dataIndex: 'budget',
      key: 'budget',
      width: 110,
      responsive: ['md'],
      render: (b) => <span className="kkp-text-navy kkp-weight-600">₹{b.toLocaleString()}</span>,
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
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', icon: <EyeOutlined />, label: t('loads.viewBids'), onClick: () => navigate('/bids') },
              { key: 'edit', icon: <EditOutlined />, label: t('loads.editLoad') },
              { type: 'divider' },
              { key: 'delete', icon: <DeleteOutlined />, label: t('loads.cancelLoad'), danger: true },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} className="kkp-text-drab" />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('loads.title')}
        subtitle={`${loads.length} ${t('loads.totalLoads')} — ${loads.filter(l => l.status === 'active').length} ${t('loads.active')}`}
        extra={
          <GoldButton icon={<PlusOutlined />} onClick={() => navigate('/loads/new')}>
            {t('loads.postNew')}
          </GoldButton>
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
    </div>
  );
}
