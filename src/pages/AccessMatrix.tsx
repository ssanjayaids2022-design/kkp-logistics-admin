import React, { useEffect, useMemo, useState } from 'react';
import { Card as AntdCard, Table, Switch, Button, Typography, Space, message, Tag, Alert, List, Avatar, Row, Col } from 'antd';
const Card = AntdCard as any;
import { SafetyCertificateOutlined, SaveOutlined, ReloadOutlined, LockOutlined, TeamOutlined, UserAddOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import type { Permission, Role, RolePermissions } from '../types';
import { ROLES, ROLE_LABELS, PERMISSION_META, DEFAULT_ROLE_PERMISSIONS } from '../auth/permissions';

const { Text } = Typography;

const clone = (rp: RolePermissions): RolePermissions => ({
  CHAIRMAN: [...rp.CHAIRMAN], MANAGER: [...rp.MANAGER], AGENT: [...rp.AGENT], TECH_ADMIN: [...rp.TECH_ADMIN],
});

// Who governs each role's column, and the caption shown under the header.
const CONTROLLER: Record<Role, string> = {
  CHAIRMAN: 'by Technical Admin',
  MANAGER: 'by Technical Admin',
  TECH_ADMIN: 'superior — full access',
  AGENT: 'by Manager',
};

interface Account { id: string; name: string; role: Role; scope?: string; status?: string; }
const readAccounts = (): Account[] => {
  try {
    return (JSON.parse(localStorage.getItem('kkp_users') || '[]') as any[])
      .map(u => ({ id: u?.data?.id, name: u?.data?.name, role: u?.data?.role, scope: u?.data?.scope, status: u?.data?.status }))
      .filter(a => a.id && a.role);
  } catch { return []; }
};

export default function AccessMatrix() {
  const { can, user, rolePermissions, updateRolePermissions } = useAuth();
  const navigate = useNavigate();
  const myRole = user?.role;

  // Technical Admin is superior: governs Chairman/Manager/Agent columns (its own
  // column is fixed at full access). Manager governs the Agent column.
  const canEditColumn = (role: Role): boolean => {
    if (role === 'TECH_ADMIN') return false;               // superior column is fixed (full access)
    if (myRole === 'TECH_ADMIN') return true;              // superior edits everyone else
    if (myRole === 'MANAGER') return role === 'AGENT'; // manager governs Agents
    return false;
  };
  const editable = can('access.matrix.edit') && ROLES.some(r => canEditColumn(r));

  const [draft, setDraft] = useState<RolePermissions>(() => clone(rolePermissions));
  const [accounts] = useState<Account[]>(readAccounts);
  useEffect(() => { setDraft(clone(rolePermissions)); }, [rolePermissions]);

  const hasPerm = (role: Role, perm: Permission) => draft[role].includes(perm);

  const dirty = useMemo(
    () => ROLES.some(r => draft[r].length !== rolePermissions[r].length ||
      draft[r].some(p => !rolePermissions[r].includes(p))),
    [draft, rolePermissions],
  );

  const toggle = (role: Role, perm: Permission, checked: boolean) => {
    if (!canEditColumn(role)) {
      message.warning(role === 'TECH_ADMIN' ? 'Technical Admin is the superior role — always full access.' : 'You cannot change this column.');
      return;
    }
    setDraft(prev => {
      const cur = prev[role];
      const next = checked ? (cur.includes(perm) ? cur : [...cur, perm]) : cur.filter(p => p !== perm);
      return { ...prev, [role]: next };
    });
  };

  const handleSave = () => {
    ROLES.forEach(r => updateRolePermissions(r, draft[r]));
    message.success('Access matrix saved — changes apply immediately across the app.');
  };

  const handleReset = () => {
    setDraft(prev => {
      const next = clone(prev);
      ROLES.forEach(r => { if (canEditColumn(r)) next[r] = [...DEFAULT_ROLE_PERMISSIONS[r]]; });
      return next;
    });
    message.info('Editable columns reverted to defaults (not yet saved).');
  };

  const columns = [
    {
      title: 'Capability',
      dataIndex: 'label',
      key: 'label',
      width: 300,
      render: (_: any, m: typeof PERMISSION_META[number]) => (
        <div>
          <Text strong style={{ color: '#0B4C8C', display: 'block' }}>{m.label}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{m.description}</Text>
        </div>
      ),
    },
    ...ROLES.map((role) => ({
      title: (
        <div style={{ textAlign: 'center' }}>
          <Tag color={role === 'TECH_ADMIN' ? 'purple' : role === 'CHAIRMAN' ? 'gold' : role === 'MANAGER' ? 'blue' : 'cyan'} style={{ margin: 0 }}>{ROLE_LABELS[role]}</Tag>
          <div style={{ fontSize: 9, color: '#98A2B3', marginTop: 2 }}>{CONTROLLER[role]}</div>
        </div>
      ),
      key: role,
      align: 'center' as const,
      width: 130,
      render: (_: any, m: typeof PERMISSION_META[number]) => {
        const locked = !canEditColumn(role);
        // Technical Admin (superior) always has every capability.
        const checked = role === 'TECH_ADMIN' ? true : hasPerm(role, m.key);
        return (
          <Switch
            checked={checked}
            disabled={locked}
            onChange={(val) => toggle(role, m.key, val)}
            checkedChildren={locked ? <LockOutlined /> : 'ON'}
            unCheckedChildren="OFF"
          />
        );
      },
    })),
  ];

  const techAdmins = accounts.filter(a => a.role === 'TECH_ADMIN');
  const agents = accounts.filter(a => a.role === 'AGENT');

  const accountList = (title: string, controller: string, list: Account[], color: string) => (
    <Card className="kkp-card" title={<Space><TeamOutlined style={{ color }} /><span className="kkp-text-navy kkp-weight-700">{title} ({list.length})</span><Text type="secondary" style={{ fontSize: 12 }}>— {controller}</Text></Space>}>
      <List
        dataSource={list}
        locale={{ emptyText: `No ${title.toLowerCase()} yet.` }}
        renderItem={(a) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar style={{ background: color, color: '#fff', fontWeight: 700 }}>{a.name?.charAt(0)}</Avatar>}
              title={<span className="kkp-text-dark kkp-weight-600">{a.name} <Text code style={{ fontSize: 11 }}>{a.id}</Text></span>}
              description={<Text type="secondary" style={{ fontSize: 12 }}>{a.scope || '—'} · {a.status || 'Active'}</Text>}
            />
          </List.Item>
        )}
      />
    </Card>
  );

  return (
    <div>
      <PageHeader
        title="Access Control Matrix"
        extra={
          <Space wrap>
            {(myRole === 'MANAGER' || myRole === 'TECH_ADMIN') && (
              <Button icon={<UserAddOutlined />} onClick={() => navigate('/admin-users', { state: { createRole: 'AGENT' } })}>
                Create Agent
              </Button>
            )}
            {myRole === 'TECH_ADMIN' && (
              <Button icon={<UserAddOutlined />} onClick={() => navigate('/admin-users', { state: { createRole: 'MANAGER' } })}>
                Create Manager
              </Button>
            )}
            {editable && (
              <>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>Reset defaults</Button>
                <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} disabled={!dirty}
                  style={{ background: '#F4811F', border: 'none' }}>
                  Save matrix
                </Button>
              </>
            )}
          </Space>
        }
      />

      {!editable && (
        <Alert
          type="info"
          showIcon
          icon={<LockOutlined />}
          message="Read-only"
          description="You can review the current permissions below, but only a Manager (Technical Admins) or a Technical Admin (Agents) can edit them."
          style={{ marginBottom: 20, borderRadius: 8 }}
        />
      )}

      <Card
        className="kkp-card"
        style={{ marginBottom: 20 }}
        title={
          <Space>
            <SafetyCertificateOutlined style={{ color: '#0B4C8C', fontSize: 18 }} />
            <span className="kkp-text-navy kkp-font-manrope kkp-weight-700">Role × Capability Grid</span>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={PERMISSION_META.map(m => ({ ...m, key: m.key }))}
          pagination={false}
          scroll={{ x: 'max-content' }}
          className="kkp-table"
          rowClassName={(_, i) => (i % 2 ? 'kkp-row-alt' : '')}
        />
      </Card>

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={12}>{accountList('Technical Admins', '(superior — full access)', techAdmins, '#7C3AED')}</Col>
        <Col xs={24} lg={12}>{accountList('Agents', 'by Manager', agents, '#0EA5E9')}</Col>
      </Row>
    </div>
  );
}
