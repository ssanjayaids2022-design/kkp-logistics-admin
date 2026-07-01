import React, { useState } from 'react';
import { Card as AntdCard, Table, Tag, Input, Select, DatePicker, Row, Col, Typography, Space, Tooltip } from 'antd';
const Card = AntdCard as any;
import { SearchOutlined, AuditOutlined, InfoCircleOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useActivities } from '../services/activityLog';
import type { Role } from '../types';

const { Text } = Typography;
const { RangePicker } = DatePicker;

interface AuditLog {
  key: string;
  timestamp: string;
  user: string;
  role: Role;
  actionType: 'LOAD_ACTION' | 'BID_ACTION' | 'PAYMENT_ACTION' | 'DRIVER_ACTION' | 'SECURITY_ACTION';
  description: string;
  ipAddress: string;
}

const roleTag = (role: Role) => {
  const map: Record<Role, { color: string; label: string }> = {
    CHAIRMAN: { color: 'gold', label: '👑 CHAIRMAN' },
    MANAGER: { color: 'blue', label: '🛡️ MANAGER' },
    LOAD_ADMIN: { color: 'cyan', label: '📋 LOAD ADMIN' },
    TECH_ADMIN: { color: 'purple', label: '🛠️ TECH ADMIN' },
  };
  return map[role] || map.LOAD_ADMIN;
};

const mockAuditLogs: AuditLog[] = [
  { key: '1', timestamp: '2026-05-25 10:15:32', user: 'Chairman', role: 'CHAIRMAN', actionType: 'SECURITY_ACTION', description: 'Updated Access Control Matrix rules', ipAddress: '192.168.1.45' },
  { key: '2', timestamp: '2026-05-25 09:42:10', user: 'General Manager', role: 'MANAGER', actionType: 'LOAD_ACTION', description: 'Created new shipment load LD-1021 (Chennai → Salem)', ipAddress: '192.168.1.112' },
  { key: '3', timestamp: '2026-05-25 09:30:15', user: 'Chairman', role: 'CHAIRMAN', actionType: 'SECURITY_ACTION', description: 'Approved new administrator account (id: USR-003)', ipAddress: '192.168.1.45' },
  { key: '4', timestamp: '2026-05-24 16:20:44', user: 'General Manager', role: 'MANAGER', actionType: 'DRIVER_ACTION', description: 'Verified license document for Suresh Kumar (DR-001)', ipAddress: '192.168.1.112' },
  { key: '5', timestamp: '2026-05-24 14:10:05', user: 'General Manager', role: 'MANAGER', actionType: 'PAYMENT_ACTION', description: 'Authorized advance payment release of ₹21,000 for TX-5001', ipAddress: '192.168.1.112' },
  { key: '6', timestamp: '2026-05-24 11:05:12', user: 'Chairman', role: 'CHAIRMAN', actionType: 'SECURITY_ACTION', description: 'Permanently deleted cancelled load LD-1012', ipAddress: '192.168.1.45' },
  { key: '7', timestamp: '2026-05-23 15:33:22', user: 'General Manager', role: 'MANAGER', actionType: 'BID_ACTION', description: 'Assigned Rajesh Patel to LD-1005 after comparing 6 bids', ipAddress: '192.168.1.112' },
  { key: '8', timestamp: '2026-05-23 10:22:18', user: 'Chairman', role: 'CHAIRMAN', actionType: 'PAYMENT_ACTION', description: 'Discharged payment dispute balance payout for Ravi Shankar (TX-5005)', ipAddress: '192.168.1.45' },
];

export default function AuditLogs() {
  const { user, can } = useAuth();
  const { t } = useLanguage();
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [adminFilter, setAdminFilter] = useState<string | null>(null);

  const isSuper = can('audit.all');
  const live = useActivities();

  // Live in-app events (newest first) mapped into audit rows, then seed history.
  const liveLogs: AuditLog[] = live.map(a => ({
    key: a.id,
    timestamp: new Date(a.at).toLocaleString('en-GB'),
    user: a.user,
    role: a.role,
    actionType: a.actionType,
    description: a.description,
    ipAddress: 'local',
  }));
  const allLogs: AuditLog[] = [...liveLogs, ...mockAuditLogs];

  // Distinct admins for the actor filter: from the logs + registered admin accounts.
  const adminNames = React.useMemo(() => {
    const fromLogs = allLogs.map(l => l.user);
    let fromUsers: string[] = [];
    try {
      fromUsers = (JSON.parse(localStorage.getItem('kkp_users') || '[]') as any[])
        .map(u => u?.data?.name).filter(Boolean);
    } catch { /* ignore */ }
    return Array.from(new Set([...fromLogs, ...fromUsers]));
  }, [live]);

  // Filter logs. If the logged in user is regular ADMIN, only display logs matching their name.
  // Super Admin can view all.
  const filteredLogs = allLogs.filter(log => {
    // Role scope filtering
    const matchesUserScope = isSuper || log.user === user?.name;

    const matchesSearch = !searchText ||
      log.description.toLowerCase().includes(searchText.toLowerCase()) ||
      log.user.toLowerCase().includes(searchText.toLowerCase());

    const matchesCategory = !categoryFilter || log.actionType === categoryFilter;
    const matchesAdmin = !adminFilter || log.user === adminFilter;

    return matchesUserScope && matchesSearch && matchesCategory && matchesAdmin;
  });

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 160,
      render: (text: string) => <Text strong type="secondary">{text}</Text>,
    },
    {
      title: 'User Profile',
      key: 'user',
      width: 180,
      render: (_, record: AuditLog) => (
        <div>
          <Text strong style={{ color: '#101828', display: 'block' }}>{record.user}</Text>
          <Tag color={roleTag(record.role).color} style={{ fontSize: 10, borderRadius: 4 }}>
            {roleTag(record.role).label}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Action Category',
      dataIndex: 'actionType',
      key: 'actionType',
      width: 150,
      render: (type: string) => {
        let color = 'default';
        if (type === 'LOAD_ACTION') color = 'blue';
        else if (type === 'BID_ACTION') color = 'cyan';
        else if (type === 'PAYMENT_ACTION') color = 'green';
        else if (type === 'DRIVER_ACTION') color = 'purple';
        else if (type === 'SECURITY_ACTION') color = 'red';
        return <Tag color={color}>{type.replace('_', ' ')}</Tag>;
      },
    },
    {
      title: 'Action Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => <Text style={{ color: '#344054', fontWeight: 500 }}>{text}</Text>,
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 130,
      responsive: ['md'] as any,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        subtitle={isSuper ? "Complete system-wide security and operations ledger" : "Your administrative activity history log"}
      />

      {/* Scope Disclaimer banner */}
      <div className="kkp-mb-20" style={{ background: '#F8F9FC', borderLeft: '4px solid #0B4C8C', padding: '12px 16px', borderRadius: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
        <InfoCircleOutlined style={{ color: '#0B4C8C', fontSize: 18 }} />
        <Text style={{ fontSize: 13, color: '#475467' }}>
          {isSuper 
            ? "Showing system-wide audit records. All critical deletions, permission overrides, and payments are permanently captured." 
            : "Showing limited scope view. Regular administrators can only view logs of actions they personally initiated."
          }
        </Text>
      </div>

      {/* Filter Toolbar */}
      <Row gutter={[12, 12]} className="kkp-mb-20">
        <Col xs={24} sm={12} md={7}>
          <Input
            placeholder="Search logs by keyword..."
            prefix={<SearchOutlined style={{ color: '#98A2B3' }} />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ borderRadius: 8 }}
            allowClear
          />
        </Col>
        <Col xs={12} sm={6} md={5}>
          <Select
            placeholder="Admin"
            value={adminFilter}
            onChange={setAdminFilter}
            style={{ width: '100%' }}
            allowClear
            showSearch
            options={adminNames.map(n => ({ value: n, label: n }))}
          />
        </Col>
        <Col xs={12} sm={6} md={5}>
          <Select
            placeholder="Category Filter"
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: '100%' }}
            allowClear
            options={[
              { value: 'LOAD_ACTION', label: 'Load Actions' },
              { value: 'BID_ACTION', label: 'Bid Actions' },
              { value: 'PAYMENT_ACTION', label: 'Payment Actions' },
              { value: 'DRIVER_ACTION', label: 'Driver Actions' },
              { value: 'SECURITY_ACTION', label: 'Security & Access' },
            ]}
          />
        </Col>
        <Col xs={24} sm={12} md={7}>
          <RangePicker style={{ width: '100%', borderRadius: 8 }} />
        </Col>
      </Row>

      <Card className="kkp-card">
        <Table
          columns={columns}
          dataSource={filteredLogs}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
          className="kkp-table"
        />
      </Card>
    </div>
  );
}
