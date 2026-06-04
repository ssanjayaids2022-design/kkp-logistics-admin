import React, { useState } from 'react';
import { Card as AntdCard, Table, Switch, Button, Typography, Space, message, Tag, Alert } from 'antd';
const Card = AntdCard as any;
import { SafetyCertificateOutlined, SaveOutlined, ReloadOutlined, CrownOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const { Text } = Typography;

interface PermissionRow {
  key: string;
  area: string;
  description: string;
  chairman: boolean;
  manager: boolean;
  loadAdmin: boolean;
}

const initialPermissions: PermissionRow[] = [
  { key: '1', area: 'Dashboard overview', description: 'Can view operational and system-wide KPI metrics', chairman: true, manager: true, loadAdmin: true },
  { key: '2', area: 'Post loads', description: 'Create, edit, publish, and cancel shipment loads', chairman: false, manager: true, loadAdmin: true },
  { key: '3', area: 'View driver bids', description: 'Review submitted driver bids and compare financial offers', chairman: true, manager: true, loadAdmin: true },
  { key: '4', area: 'Assign trips', description: 'Approve bids and assign driver to loads', chairman: false, manager: true, loadAdmin: false },
  { key: '5', area: 'Approve pickup/delivery POD', description: 'Verify and approve Proof of Delivery documents', chairman: false, manager: true, loadAdmin: false },
  { key: '6', area: 'Mark payment status', description: 'Update advance and balance disbursement status', chairman: false, manager: true, loadAdmin: false },
  { key: '7', area: 'Driver management / approvals', description: 'Verify documentation, rating, and block/unblock status', chairman: false, manager: true, loadAdmin: false },
  { key: '8', area: 'Create admin users', description: 'Provision new administrative accounts', chairman: false, manager: true, loadAdmin: false },
  { key: '9', area: 'Edit admin roles/permissions', description: 'Modify operational scopes and matrix policies', chairman: false, manager: true, loadAdmin: false },
  { key: '10', area: 'System settings (Edit)', description: 'Access enterprise SLA limits, DB backups, and webhooks', chairman: false, manager: true, loadAdmin: false },
  { key: '11', area: 'Audit logs', description: 'View full system-wide history of administrator actions', chairman: true, manager: true, loadAdmin: false },
  { key: '12', area: 'Access control matrix', description: 'Read and write permissions mapping configurations', chairman: true, manager: true, loadAdmin: false },
  { key: '13', area: 'Delete critical data', description: 'Permanently remove loads, driver accounts, or transactions', chairman: false, manager: true, loadAdmin: false },
];

export default function AccessMatrix() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<PermissionRow[]>(initialPermissions);
  const [saving, setSaving] = useState(false);

  const isChairman = user?.role === 'CHAIRMAN';

  const handleToggle = (rowKey: string, role: 'chairman' | 'manager' | 'loadAdmin', checked: boolean) => {
    if (isChairman) {
      message.error('Permissions are read-only for Chairman.');
      return;
    }
    // Chairman role must always be read-only in the application, block modifications to Chairman permissions here
    if (role === 'chairman') {
      message.warning('Chairman permissions are read-only and cannot be enabled for write operations.');
      return;
    }
    setPermissions(prev =>
      prev.map(row => (row.key === rowKey ? { ...row, [role]: checked } : row))
    );
  };

  const handleSave = () => {
    if (isChairman) {
      message.error('You do not have permission to save settings.');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      message.success('Access control matrix saved and synchronized successfully!');
    }, 1000);
  };

  const handleReset = () => {
    if (isChairman) {
      message.error('You do not have permission to reset settings.');
      return;
    }
    setPermissions(initialPermissions);
    message.info('Access matrix reset to default definitions.');
  };

  const columns = [
    {
      title: 'Operational Capability Area',
      dataIndex: 'area',
      key: 'area',
      width: 250,
      render: (text: string, record: PermissionRow) => (
        <div>
          <Text strong style={{ color: '#0B4C8C', display: 'block' }}>{text}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{record.description}</Text>
        </div>
      ),
    },
    {
      title: <Tag className="kkp-role-tag-chairman">👑 Chairman</Tag>,
      dataIndex: 'chairman',
      key: 'chairman',
      align: 'center' as const,
      width: 120,
      render: (checked: boolean, record: PermissionRow) => (
        <Switch
          checked={checked}
          disabled={true}
          checkedChildren="ON"
          unCheckedChildren="OFF"
        />
      ),
    },
    {
      title: <Tag className="kkp-role-tag-manager">🛡️ Manager</Tag>,
      dataIndex: 'manager',
      key: 'manager',
      align: 'center' as const,
      width: 120,
      render: (checked: boolean, record: PermissionRow) => (
        <Switch
          checked={checked}
          disabled={isChairman}
          onChange={(val) => handleToggle(record.key, 'manager', val)}
          checkedChildren="ON"
          unCheckedChildren="OFF"
        />
      ),
    },
    {
      title: <Tag className="kkp-role-tag-loadadmin">📋 Load Admin</Tag>,
      dataIndex: 'loadAdmin',
      key: 'loadAdmin',
      align: 'center' as const,
      width: 120,
      render: (checked: boolean, record: PermissionRow) => (
        <Switch
          checked={checked}
          disabled={isChairman}
          onChange={(val) => handleToggle(record.key, 'loadAdmin', val)}
          checkedChildren="ON"
          unCheckedChildren="OFF"
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Access Control Matrix"
        subtitle="Configure role-based access control (RBAC) scopes and restrict operation endpoints"
        extra={
          !isChairman && (
            <Space>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                Reset Defaults
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving}
                onClick={handleSave}
                className="kkp-btn-gold"
                style={{ background: '#F4811F', border: 'none' }}
              >
                Save Matrix Changes
              </Button>
            </Space>
          )
        }
      />

      {isChairman && (
        <Alert
          message="Read-Only Mode Enabled"
          description="As Chairman, you have full audit access to view the global access control matrix, but permissions changes are restricted."
          type="info"
          showIcon
          icon={<CrownOutlined style={{ color: '#F4811F' }} />}
          style={{ marginBottom: 20, borderRadius: 8 }}
        />
      )}

      <Card
        className="kkp-card"
        title={
          <Space>
            <SafetyCertificateOutlined style={{ color: '#0B4C8C', fontSize: 18 }} />
            <span className="kkp-text-navy kkp-font-manrope kkp-weight-700">Global Permissions Mapping Grid</span>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={permissions}
          pagination={false}
          scroll={{ x: 'max-content' }}
          className="kkp-table"
        />
      </Card>
    </div>
  );
}
