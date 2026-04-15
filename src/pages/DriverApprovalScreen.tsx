import React, { useState } from 'react';
import { Table, Button, Modal, Space, Tag, Select, Row, Col, Input, Badge, Descriptions, message, Popconfirm } from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  CarOutlined,
  FileProtectOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '../components/PageHeader';
import StatusTag from '../components/StatusTag';
import { drivers } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import type { Driver, DocumentStatus } from '../types';

const docStatusColors: Record<DocumentStatus, string> = {
  verified: 'success',
  pending: 'gold',
  rejected: 'error',
  missing: 'default',
};

const docIcons: Record<string, React.ReactNode> = {
  license: <IdcardOutlined />,
  insurance: <SafetyCertificateOutlined />,
  registration: <CarOutlined />,
  aadhar: <FileProtectOutlined />,
};

export default function DriverApprovalScreen() {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [docModal, setDocModal] = useState<Driver | null>(null);
  const { t } = useLanguage();

  const filteredDrivers = drivers.filter(d => {
    const matchSearch = !searchText ||
      d.name.toLowerCase().includes(searchText.toLowerCase()) ||
      d.phone.includes(searchText) ||
      d.vehicleNumber.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = !statusFilter || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleApprove = (driver: Driver) => {
    message.success(`${driver.name} approved successfully!`);
  };

  const handleReject = (driver: Driver) => {
    message.error(`${driver.name} rejected.`);
  };

  const handleBulkApprove = () => {
    message.success(`${selectedRowKeys.length} drivers approved!`);
    setSelectedRowKeys([]);
  };

  const columns: ColumnsType<Driver> = [
    {
      title: t('nav.drivers'),
      key: 'name',
      width: 200,
      render: (_, record) => (
        <div>
          <span className="kkp-text-dark kkp-weight-600">{record.name}</span>
          <div className="kkp-text-drab" style={{ fontSize: 12 }}>{record.phone}</div>
        </div>
      ),
    },
    {
      title: t('loads.vehicle'),
      key: 'vehicle',
      width: 180,
      responsive: ['md'],
      render: (_, record) => (
        <div>
          <span className="kkp-text-dark">{record.vehicleType}</span>
          <div className="kkp-text-drab" style={{ fontSize: 12 }}>{record.vehicleNumber}</div>
        </div>
      ),
    },
    {
      title: t('drivers.documents'),
      key: 'docs',
      width: 160,
      render: (_, record) => {
        const statuses = Object.values(record.documentsStatus);
        const verified = statuses.filter(s => s === 'verified').length;
        const total = statuses.length;
        return (
          <div className="kkp-items-center kkp-gap-8">
            <Badge
              count={`${verified}/${total}`}
              style={{
                backgroundColor: verified === total ? '#12B76A' : verified > 0 ? '#CA9D50' : '#F04438',
                fontWeight: 700,
                fontSize: 11,
              }}
            />
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setDocModal(record)}
              className="kkp-text-gold"
              style={{ fontSize: 12, padding: '0 4px' }}
            >
              {t('drivers.details')}
            </Button>
          </div>
        );
      },
    },
    {
      title: t('drivers.rating'),
      dataIndex: 'rating',
      key: 'rating',
      width: 80,
      responsive: ['lg'],
      sorter: (a, b) => a.rating - b.rating,
      render: (r) => (
        <span className="kkp-text-gold kkp-weight-700">
          {r > 0 ? `★ ${r}` : '—'}
        </span>
      ),
    },
    {
      title: t('drivers.trips'),
      dataIndex: 'totalTrips',
      key: 'totalTrips',
      width: 70,
      render: (trips) => <span className="kkp-text-dark">{trips}</span>,
      responsive: ['lg'],
      sorter: (a, b) => a.totalTrips - b.totalTrips,
    },
    {
      title: t('loads.status'),
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => <StatusTag status={status as any} />,
    },
    {
      title: '',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size={4}>
          {record.status === 'pending_approval' && (
            <>
              <Popconfirm
                title={`Approve ${record.name}?`}
                onConfirm={() => handleApprove(record)}
                okButtonProps={{ style: { background: '#12B76A', borderColor: '#12B76A' } }}
              >
                <Button
                  size="small"
                  icon={<CheckCircleOutlined />}
                  className="kkp-btn-action"
                  style={{ color: '#12B76A', borderColor: '#12B76A' }}
                >
                  {t('drivers.approve')}
                </Button>
              </Popconfirm>
              <Popconfirm
                title={`Reject ${record.name}?`}
                onConfirm={() => handleReject(record)}
              >
                <Button
                  size="small"
                  danger
                  icon={<CloseCircleOutlined />}
                  className="kkp-btn-action"
                />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('drivers.title')}
        subtitle={`${drivers.filter(d => d.status === 'pending_approval').length} ${t('drivers.pending')}`}
      />

      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={8}>
          <Input
            placeholder={t('drivers.searchPlaceholder')}
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
              { value: 'pending_approval', label: t('status.pending') },
              { value: 'approved', label: t('status.active') },
              { value: 'rejected', label: t('status.cancelled') },
            ]}
          />
        </Col>
      </Row>

      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        columns={columns}
        dataSource={filteredDrivers}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 800 }}
      />

      <Modal
        open={!!docModal}
        onCancel={() => setDocModal(null)}
        title={
          <span className="kkp-text-dark">
            <FileTextOutlined className="kkp-text-navy" style={{ marginRight: 8 }} />
            {docModal?.name} — {t('drivers.documents')}
          </span>
        }
        footer={null}
        width={520}
      >
        {docModal && (
          <>
            <Descriptions column={1} className="kkp-mb-20"
              labelStyle={{ color: '#475467', fontWeight: 600 }}
              contentStyle={{ color: '#101828' }}
            >
              <Descriptions.Item label="Phone">{docModal.phone}</Descriptions.Item>
              <Descriptions.Item label={t('loads.vehicle')}>{docModal.vehicleType} — {docModal.vehicleNumber}</Descriptions.Item>
            </Descriptions>

            <h4 className="kkp-text-muted kkp-text-caption kkp-mb-12">
              {t('drivers.documents')}
            </h4>
            {Object.entries(docModal.documentsStatus).map(([key, status]) => (
              <div key={key} className="kkp-card kkp-flex-between kkp-items-center kkp-p-10 kkp-mb-8" style={{
                background: '#F9FAFB',
              }}>
                <Space>
                  {docIcons[key] || <FileTextOutlined />}
                  <span className="kkp-text-dark kkp-weight-600" style={{ textTransform: 'capitalize' }}>{key}</span>
                </Space>
                <Tag color={docStatusColors[status as DocumentStatus]} className="kkp-btn-action" style={{ border: 'none', textTransform: 'uppercase', fontSize: 10 }}>
                  {status}
                </Tag>
              </div>
            ))}
          </>
        )}
      </Modal>
    </div>
  );
}
