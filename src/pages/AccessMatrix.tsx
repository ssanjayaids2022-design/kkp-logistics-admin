import React, { useEffect, useMemo, useState } from 'react';
import { Card as AntdCard, Table, Switch, Button, Typography, Space, message, Tag, Alert } from 'antd';
const Card = AntdCard as any;
import { SafetyCertificateOutlined, SaveOutlined, ReloadOutlined, LockOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import type { Permission, Role, RolePermissions } from '../types';
import { ROLES, ROLE_LABELS, PERMISSION_META, DEFAULT_ROLE_PERMISSIONS } from '../auth/permissions';

const { Text } = Typography;

// Chairman & Manager permissions are fixed — a Technical Admin may not alter
// them (they can only tune Load Admin, and their own row minus the matrix key).
const LOCKED_ROLES: Role[] = ['CHAIRMAN', 'MANAGER'];
const isLockedCell = (role: Role, perm: Permission) =>
  LOCKED_ROLES.includes(role) || (role === 'TECH_ADMIN' && perm === 'access.matrix.edit');

const clone = (rp: RolePermissions): RolePermissions => ({
  CHAIRMAN: [...rp.CHAIRMAN], MANAGER: [...rp.MANAGER], LOAD_ADMIN: [...rp.LOAD_ADMIN], TECH_ADMIN: [...rp.TECH_ADMIN],
});

export default function AccessMatrix() {
  const { can, rolePermissions, updateRolePermissions } = useAuth();
  const editable = can('access.matrix.edit');

  const [draft, setDraft] = useState<RolePermissions>(() => clone(rolePermissions));

  // Re-sync when the saved matrix changes (e.g. another tab, or after save).
  useEffect(() => { setDraft(clone(rolePermissions)); }, [rolePermissions]);

  const hasPerm = (role: Role, perm: Permission) => draft[role].includes(perm);

  const dirty = useMemo(
    () => ROLES.some(r => draft[r].length !== rolePermissions[r].length ||
      draft[r].some(p => !rolePermissions[r].includes(p))),
    [draft, rolePermissions],
  );

  const toggle = (role: Role, perm: Permission, checked: boolean) => {
    if (!editable) { message.error('Only a Technical Admin can change the access matrix.'); return; }
    if (isLockedCell(role, perm)) { message.warning('Technical Admin must keep access-matrix control.'); return; }
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
    // Reset the editable roles to defaults; keep Chairman & Manager as-is (locked).
    setDraft(prev => ({
      ...clone(DEFAULT_ROLE_PERMISSIONS),
      CHAIRMAN: [...prev.CHAIRMAN],
      MANAGER: [...prev.MANAGER],
    }));
    message.info('Load Admin & Technical Admin reverted to defaults (not yet saved).');
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
      title: <Tag color={role === 'TECH_ADMIN' ? 'purple' : role === 'CHAIRMAN' ? 'gold' : role === 'MANAGER' ? 'blue' : 'cyan'}>{ROLE_LABELS[role]}</Tag>,
      key: role,
      align: 'center' as const,
      width: 130,
      render: (_: any, m: typeof PERMISSION_META[number]) => {
        const locked = isLockedCell(role, m.key);
        return (
          <Switch
            checked={hasPerm(role, m.key)}
            disabled={!editable || locked}
            onChange={(val) => toggle(role, m.key, val)}
            checkedChildren={locked ? <LockOutlined /> : 'ON'}
            unCheckedChildren="OFF"
          />
        );
      },
    })),
  ];

  return (
    <div>
      <PageHeader
        title="Access Control Matrix"
        subtitle="Tune Load Admin (and Technical Admin) permissions — Chairman & Manager are fixed"
        extra={editable && (
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>Reset defaults</Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} disabled={!dirty}
              style={{ background: '#F4811F', border: 'none' }}>
              Save matrix
            </Button>
          </Space>
        )}
      />

      {!editable && (
        <Alert
          type="info"
          showIcon
          icon={<LockOutlined />}
          message="Read-only"
          description="Only a Technical Admin can edit the access matrix. You can review the current permissions below."
          style={{ marginBottom: 20, borderRadius: 8 }}
        />
      )}

      <Card
        className="kkp-card"
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
    </div>
  );
}
