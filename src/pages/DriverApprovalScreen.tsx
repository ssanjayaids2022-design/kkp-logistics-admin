import React, { useState } from 'react';
import { Table, Button, Modal, Space, Tag, Select, Row, Col, Input, Badge, Descriptions, message, Popconfirm, Form, Tooltip, Alert, Upload } from 'antd';
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
  PlusOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  DownloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import GoldButton from '../components/GoldButton';
import KPICard from '../components/KPICard';
import StatusTag from '../components/StatusTag';
import { exportToCsv } from '../utils/exportCsv';
import { useLanguage } from '../context/LanguageContext';
import { vehicleTypes } from '../data/mockData';
import type { Driver, DocumentStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';

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

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// antd Form value-getter for an Upload field.
const normFile = (e: any) => (Array.isArray(e) ? e : e?.fileList);

const DOC_LABELS: Record<string, string> = {
  license: 'License', insurance: 'Insurance', registration: 'Registration (RC)', aadhar: 'Aadhar',
};

export default function DriverApprovalScreen() {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [regionFilter, setRegionFilter] = useState<string | null>(null);
  const [vehicleFilter, setVehicleFilter] = useState<string | null>(null);
  const [nearLocation, setNearLocation] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [docModal, setDocModal] = useState<Driver | null>(null);
  const [docPreview, setDocPreview] = useState<{ label: string; url?: string } | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [addForm] = Form.useForm();
  const { t } = useLanguage();
  const location = useLocation();
  const { can } = useAuth();

  const isReadOnly = !can('drivers.approve');

  const loadDrivers = React.useCallback(async () => {
    try {
      setDrivers(await apiService.fetchDrivers());
    } catch (e) {
      message.error(`Failed to load drivers: ${e instanceof Error ? e.message : 'unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadDrivers();
    const timer = setInterval(loadDrivers, 8000);
    return () => clearInterval(timer);
  }, [loadDrivers]);

  React.useEffect(() => {
    if (location.state?.searchText !== undefined) {
      setSearchText(location.state.searchText);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const filteredDrivers = drivers.filter(d => {
    const matchSearch = !searchText ||
      d.name.toLowerCase().includes(searchText.toLowerCase()) ||
      d.phone.includes(searchText) ||
      d.vehicleNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      (d.location || '').toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = !statusFilter || d.status === statusFilter;
    const matchRegion = !regionFilter || d.region === regionFilter;
    const matchVehicle = !vehicleFilter || d.vehicleType === vehicleFilter;
    // "Nearby": driver's manually-entered city OR region matches the source query.
    const q = nearLocation.trim().toLowerCase();
    const matchNear = !q ||
      (d.location || '').toLowerCase().includes(q) ||
      (d.region || '').toLowerCase().includes(q);
    return matchSearch && matchStatus && matchRegion && matchVehicle && matchNear;
  });

  const driverRegions = Array.from(new Set(drivers.map(d => d.region).filter(Boolean))) as string[];

  const REQUIRED_DOCS = ['license', 'insurance', 'registration', 'aadhar'] as const;
  const allDocsVerified = (d: Driver) =>
    REQUIRED_DOCS.every(k => d.documentsStatus[k] === 'verified');

  const handleVerifyDoc = async (
    driver: Driver,
    kind: 'license' | 'insurance' | 'registration' | 'aadhar',
    status: 'verified' | 'rejected',
  ) => {
    try {
      const updated = await apiService.verifyDocument(driver.id, kind, status);
      setDrivers(prev => prev.map(d => (d.id === updated.id ? updated : d)));
      setDocModal(updated); // keep the open modal in sync
      message.success(`${kind} ${status}`);
    } catch (e) {
      message.error(`Failed to update document: ${e instanceof Error ? e.message : 'unknown error'}`);
    }
  };

  const handleApprove = async (driver: Driver) => {
    try {
      await apiService.verifyDriver(driver.id, 'verified');
      message.success(`${driver.name} approved successfully!`);
      await loadDrivers();
    } catch (e) {
      message.error(`Failed to approve: ${e instanceof Error ? e.message : 'unknown error'}`);
    }
  };

  const handleReject = async (driver: Driver) => {
    try {
      await apiService.verifyDriver(driver.id, 'rejected');
      message.error(`${driver.name} rejected.`);
      await loadDrivers();
    } catch (e) {
      message.error(`Failed to reject: ${e instanceof Error ? e.message : 'unknown error'}`);
    }
  };

  const handleCreateDriver = async () => {
    let values;
    try {
      values = await addForm.validateFields();
    } catch {
      return; // validation errors are shown inline
    }
    setSubmitting(true);
    try {
      const region = (values.region || '').trim() ||
        (values.vehicleNumber.split('-')[0] || '').trim();
      // Read any uploaded document files into data URLs.
      const docKinds = ['license', 'insurance', 'registration', 'aadhar'] as const;
      const documents: Partial<Record<typeof docKinds[number], string>> = {};
      for (const k of docKinds) {
        const file = values[k]?.[0]?.originFileObj as File | undefined;
        if (file) documents[k] = await fileToDataUrl(file);
      }
      const created = await apiService.createDriver({
        name: values.name.trim(),
        phone: values.phone.trim(),
        vehicleType: values.vehicleType,
        vehicleNumber: values.vehicleNumber.trim().toUpperCase(),
        region,
        location: (values.location || '').trim(),
        documents,
      });
      message.success(`${created.name} added — now pending verification.`);
      setAddModalOpen(false);
      addForm.resetFields();
      await loadDrivers();
    } catch (e) {
      message.error(`Failed to add driver: ${e instanceof Error ? e.message : 'unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkApprove = async () => {
    const selected = drivers.filter(d => selectedRowKeys.includes(d.id) && d.status === 'pending_approval');
    const ready = selected.filter(allDocsVerified);
    const skipped = selected.length - ready.length;
    await Promise.all(ready.map(d => apiService.verifyDriver(d.id, 'verified').catch(() => null)));
    if (ready.length) message.success(`${ready.length} driver(s) approved!`);
    if (skipped) message.warning(`${skipped} skipped — all 4 documents must be verified first.`);
    setSelectedRowKeys([]);
    await loadDrivers();
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
      title: 'Location',
      key: 'location',
      width: 150,
      responsive: ['lg'],
      render: (_, record) => (
        <div>
          <span className="kkp-text-dark">
            <EnvironmentOutlined style={{ color: '#0B4C8C', marginRight: 4 }} />
            {record.location || '—'}
          </span>
          {record.region && <div className="kkp-text-drab" style={{ fontSize: 12 }}>{record.region}</div>}
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
                backgroundColor: verified === total ? '#12B76A' : verified > 0 ? '#FFC20E' : '#F04438',
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
              {allDocsVerified(record) ? (
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
              ) : (
                <Tooltip title="Verify all 4 documents first">
                  <Button
                    size="small"
                    icon={<FileTextOutlined />}
                    className="kkp-btn-action"
                    onClick={() => setDocModal(record)}
                    style={{ color: '#0B4C8C', borderColor: '#0B4C8C' }}
                  >
                    Review docs
                  </Button>
                </Tooltip>
              )}
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

  const handleExportDrivers = () => {
    exportToCsv('drivers', [
      { header: 'ID', value: d => d.id },
      { header: 'Name', value: d => d.name },
      { header: 'Phone', value: d => d.phone },
      { header: 'Vehicle Type', value: d => d.vehicleType },
      { header: 'Vehicle No', value: d => d.vehicleNumber },
      { header: 'Region', value: d => d.region || '' },
      { header: 'Location', value: d => d.location || '' },
      { header: 'Status', value: d => d.status },
      { header: 'Docs Verified', value: d => `${Object.values(d.documentsStatus).filter(s => s === 'verified').length}/4` },
    ], filteredDrivers);
    message.success(`Exported ${filteredDrivers.length} driver(s) to CSV.`);
  };

  return (
    <div>
      <PageHeader
        title={t('drivers.title')}
        subtitle={t('drivers.summary', { count: drivers.filter(d => d.status === 'pending_approval').length })}
        extra={
          <Space>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExportDrivers}
              className="kkp-btn-rounded kkp-weight-600 kkp-text-dark"
              style={{ borderColor: '#D0D5DD', background: '#FFFFFF' }}
            >
              Export
            </Button>
            {!isReadOnly && (
              <GoldButton icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)}>
                Add Driver
              </GoldButton>
            )}
          </Space>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} md={6}>
          <KPICard
            title="Pending Driver Verif."
            value={drivers.filter(d => d.status === 'pending_approval').length}
            trend="Awaiting review"
            trendUp={false}
            icon={<ClockCircleOutlined />}
            color="#F4811F"
          />
        </Col>
        <Col xs={12} md={6}>
          <KPICard
            title="Active Drivers"
            value={drivers.filter(d => d.status === 'approved').length}
            trend="Verified & active"
            trendUp
            icon={<CheckCircleOutlined />}
            color="#12B76A"
          />
        </Col>
        <Col xs={12} md={6}>
          <KPICard
            title="Rejected Drivers"
            value={drivers.filter(d => d.status === 'rejected').length}
            trend="Verification failed"
            trendUp={false}
            icon={<CloseCircleOutlined />}
            color="#F04438"
          />
        </Col>
        <Col xs={12} md={6}>
          <KPICard
            title="Total Drivers"
            value={drivers.length}
            trend="All registered"
            trendUp
            icon={<TeamOutlined />}
            color="#0B4C8C"
          />
        </Col>
      </Row>

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
          <Input
            placeholder="Near location / city"
            prefix={<EnvironmentOutlined className="kkp-text-drab" />}
            value={nearLocation}
            onChange={(e) => setNearLocation(e.target.value)}
            className="kkp-btn-rounded"
            style={{ background: '#FFFFFF', borderColor: '#E4E7EC' }}
            allowClear
          />
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Select
            placeholder="Region"
            value={regionFilter}
            onChange={setRegionFilter}
            style={{ width: '100%' }}
            allowClear
            options={driverRegions.map(r => ({ value: r, label: r }))}
          />
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Select
            placeholder="Vehicle type"
            value={vehicleFilter}
            onChange={setVehicleFilter}
            style={{ width: '100%' }}
            allowClear
            options={vehicleTypes.map(v => ({ value: v, label: v }))}
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
        rowSelection={isReadOnly ? undefined : {
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        columns={isReadOnly ? columns.filter(c => c.key !== 'actions') : columns}
        dataSource={filteredDrivers}
        loading={loading}
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
              {t('drivers.documents')} — verify all 4 to enable approval
            </h4>
            {(['license', 'insurance', 'registration', 'aadhar'] as const).map((key) => {
              const status = docModal.documentsStatus[key];
              return (
                <div key={key} className="kkp-card kkp-flex-between kkp-items-center kkp-p-10 kkp-mb-8" style={{ background: '#F9FAFB' }}>
                  <Space>
                    {docIcons[key] || <FileTextOutlined />}
                    {status === 'missing' ? (
                      <span className="kkp-text-drab kkp-weight-600">{DOC_LABELS[key]}</span>
                    ) : (
                      <a
                        className="kkp-weight-600"
                        style={{ color: '#0B4C8C' }}
                        onClick={() => setDocPreview({ label: DOC_LABELS[key], url: docModal.documentUrls?.[key] })}
                      >
                        {DOC_LABELS[key]}
                      </a>
                    )}
                    <Tag color={docStatusColors[status]} className="kkp-btn-action" style={{ border: 'none', textTransform: 'uppercase', fontSize: 10 }}>
                      {status}
                    </Tag>
                  </Space>
                  <Space size={4}>
                    <Button
                      size="small"
                      type="text"
                      icon={<EyeOutlined />}
                      disabled={status === 'missing'}
                      onClick={() => setDocPreview({ label: DOC_LABELS[key], url: docModal.documentUrls?.[key] })}
                      style={{ color: '#0B4C8C' }}
                    >
                      View
                    </Button>
                    {!isReadOnly && (
                      <>
                        <Button
                          size="small"
                          type="text"
                          icon={<CheckCircleOutlined />}
                          disabled={status === 'verified' || status === 'missing'}
                          onClick={() => handleVerifyDoc(docModal, key, 'verified')}
                          style={{ color: status === 'verified' ? '#98A2B3' : '#12B76A', fontWeight: 600 }}
                        >
                          Verify
                        </Button>
                        <Button
                          size="small"
                          type="text"
                          danger
                          icon={<CloseCircleOutlined />}
                          disabled={status === 'rejected' || status === 'missing'}
                          onClick={() => handleVerifyDoc(docModal, key, 'rejected')}
                        />
                      </>
                    )}
                  </Space>
                </div>
              );
            })}

            {!isReadOnly && docModal.status === 'pending_approval' && (
              <div style={{ marginTop: 16 }}>
                {allDocsVerified(docModal) ? (
                  <Popconfirm
                    title={`Approve ${docModal.name}?`}
                    onConfirm={() => { const d = docModal; setDocModal(null); handleApprove(d); }}
                    okButtonProps={{ style: { background: '#12B76A', borderColor: '#12B76A' } }}
                  >
                    <GoldButton block icon={<CheckCircleOutlined />}>
                      Approve Driver
                    </GoldButton>
                  </Popconfirm>
                ) : (
                  <Alert
                    type="warning"
                    showIcon
                    message="Approval locked"
                    description="Verify all 4 documents (license, insurance, registration, aadhar) before approving this driver."
                  />
                )}
              </div>
            )}
          </>
        )}
      </Modal>

      {/* Document preview */}
      <Modal
        open={!!docPreview}
        onCancel={() => setDocPreview(null)}
        title={<span className="kkp-text-dark"><FileTextOutlined className="kkp-text-navy" style={{ marginRight: 8 }} />{docPreview?.label}</span>}
        footer={null}
        width={680}
        destroyOnClose
      >
        {docPreview && (() => {
          const url = docPreview.url;
          if (!url || url === '#') {
            return (
              <div className="kkp-text-center kkp-p-24" style={{ color: '#667085' }}>
                No file available to preview (this document was seeded for the demo without an actual file).
              </div>
            );
          }
          const isPdf = url.startsWith('data:application/pdf') || url.toLowerCase().endsWith('.pdf');
          return isPdf ? (
            <iframe title="document" src={url} style={{ width: '100%', height: 480, border: 'none' }} />
          ) : (
            <img alt={docPreview.label} src={url} style={{ width: '100%', borderRadius: 8, objectFit: 'contain' }} />
          );
        })()}
      </Modal>

      <Modal
        open={addModalOpen}
        onCancel={() => { setAddModalOpen(false); addForm.resetFields(); }}
        onOk={handleCreateDriver}
        confirmLoading={submitting}
        title={
          <span className="kkp-text-dark">
            <PlusOutlined className="kkp-text-navy" style={{ marginRight: 8 }} />
            Add Driver
          </span>
        }
        okText="Add Driver"
        okButtonProps={{ style: { background: '#0B4C8C', border: 'none', color: '#FFFFFF', fontWeight: 700 } }}
        width={520}
        destroyOnClose
      >
        <Form form={addForm} layout="vertical" requiredMark="optional" style={{ marginTop: 8 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label={<span className="kkp-text-muted kkp-weight-600">Driver Name</span>}
                rules={[{ required: true, message: 'Please enter the driver name' }]}
              >
                <Input placeholder="e.g. Suresh Kumar" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                label={<span className="kkp-text-muted kkp-weight-600">Phone</span>}
                rules={[
                  { required: true, message: 'Please enter a phone number' },
                  { pattern: /^[+\d][\d\s-]{7,}$/, message: 'Enter a valid phone number' },
                ]}
              >
                <Input placeholder="e.g. +91 98765 43210" allowClear />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="vehicleType"
                label={<span className="kkp-text-muted kkp-weight-600">Vehicle Type</span>}
                rules={[{ required: true, message: 'Please select a vehicle type' }]}
              >
                <Select
                  placeholder="Select vehicle type"
                  options={vehicleTypes.map(v => ({ value: v, label: v }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="vehicleNumber"
                label={<span className="kkp-text-muted kkp-weight-600">Vehicle Number</span>}
                rules={[{ required: true, message: 'Please enter the vehicle number' }]}
              >
                <Input placeholder="e.g. MH-04-AB-1234" allowClear />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="region"
                label={<span className="kkp-text-muted kkp-weight-600">Region</span>}
                extra={<span className="kkp-text-drab" style={{ fontSize: 11 }}>Defaults from the vehicle number if blank.</span>}
              >
                <Input placeholder="e.g. MH" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="location"
                label={<span className="kkp-text-muted kkp-weight-600">Current Location (city)</span>}
              >
                <Input placeholder="e.g. Chennai" prefix={<EnvironmentOutlined className="kkp-text-drab" />} allowClear />
              </Form.Item>
            </Col>
          </Row>

          <h4 className="kkp-text-muted kkp-text-caption kkp-mb-12">Documents (upload — verified by admin later)</h4>
          <Row gutter={16}>
            {(['license', 'insurance', 'registration', 'aadhar'] as const).map((k) => (
              <Col xs={24} sm={12} key={k}>
                <Form.Item
                  name={k}
                  label={<span className="kkp-text-muted kkp-weight-600">{DOC_LABELS[k]}</span>}
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                >
                  <Upload
                    maxCount={1}
                    beforeUpload={() => false}
                    accept="image/*,application/pdf"
                    listType="text"
                  >
                    <Button icon={<UploadOutlined />} size="small">Upload</Button>
                  </Upload>
                </Form.Item>
              </Col>
            ))}
          </Row>

          <div style={{ background: '#F9FAFB', border: '1px solid #E4E7EC', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#667085' }}>
            New drivers start as <strong className="kkp-text-dark">Pending Approval</strong>. Uploaded documents land as <strong>pending</strong> — verify all 4 to approve.
          </div>
        </Form>
      </Modal>
    </div>
  );
}
