import React, { useState, useEffect } from 'react';
import { Card as AntdCard, Table, Button, Tag, Space, Avatar, Input, Modal, Form, Select, message, Tooltip, Typography } from 'antd';
const Card = AntdCard as any;
import { UserAddOutlined, EditOutlined, StopOutlined, CheckCircleOutlined, DeleteOutlined, SearchOutlined, SafetyCertificateOutlined, KeyOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useAuth, type PasswordResetRequest } from '../context/AuthContext';
import type { Role } from '../types';

const { Text } = Typography;

interface AdminAccount {
  key: string;
  name: string;
  email: string;
  role: Role;
  scope: string;
  status: 'Active' | 'Suspended';
  username?: string;
  password?: string;
  lastLogin?: string;
}

const mapUsers = (usersList: any[]): AdminAccount[] => usersList.map((u: any) => ({
  key: u.data.id,
  name: u.data.name,
  email: u.data.email,
  role: u.data.role,
  scope: u.data.scope || 'South Region (Chennai/Cbe)',
  status: u.data.status || 'Active',
  username: u.username || u.data.email.split('@')[0],
  password: u.password || 'admin123',
  lastLogin: u.data.lastLogin,
}));

const fmtLogin = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
};

export default function AdminManagement() {
  const { changePassword, can, user } = useAuth();
  const canManage = can('admin.manage');
  const isTechAdmin = user?.role === 'TECH_ADMIN';

  // Technical Admin is the superior role: creates every account type (incl. Chairman).
  // Manager creates Agents only.
  const roleOptions = isTechAdmin
    ? [
        { value: 'AGENT', label: 'Agent (Field ops)' },
        { value: 'MANAGER', label: 'Manager (Operations)' },
        { value: 'CHAIRMAN', label: 'Chairman (Oversight)' },
        { value: 'TECH_ADMIN', label: 'Technical Admin (Superior)' },
      ]
    : [{ value: 'AGENT', label: 'Agent (Field ops)' }];
  // Technical Admin manages all accounts; Manager only Agent accounts.
  const canActOn = (role: Role) => (isTechAdmin ? true : role === 'AGENT');

  const readAdmins = () => mapUsers(JSON.parse(localStorage.getItem('kkp_users') || '[]'));
  const readRequests = (): PasswordResetRequest[] =>
    JSON.parse(localStorage.getItem('kkp_pwd_requests') || '[]');

  const [admins, setAdmins] = useState<AdminAccount[]>(readAdmins);
  const [requests, setRequests] = useState<PasswordResetRequest[]>(readRequests);

  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState<string | null>(null);

  // Change-password modal
  const [pwTarget, setPwTarget] = useState<AdminAccount | null>(null);
  const [pwForm] = Form.useForm();

  const reloadAdmins = () => setAdmins(readAdmins());

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'kkp_users') setAdmins(readAdmins());
      if (e.key === 'kkp_pwd_requests') setRequests(readRequests());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Deep-link from the Access Matrix "Create Agent / Manager" buttons.
  const location = useLocation();
  useEffect(() => {
    const createRole = (location.state as any)?.createRole as Role | undefined;
    if (createRole && canManage && roleOptions.some(o => o.value === createRole)) {
      setEditingKey(null);
      form.resetFields();
      form.setFieldsValue({ role: createRole, scope: 'South Region (Chennai/Cbe)', password: 'admin123' });
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openChangePassword = (record: AdminAccount) => {
    pwForm.resetFields();
    setPwTarget(record);
  };

  const handleChangePassword = () => {
    pwForm.validateFields().then(({ newPassword }) => {
      if (!pwTarget) return;
      changePassword(pwTarget.key, newPassword);
      // Mark any matching pending reset request resolved.
      const reqs = readRequests().map(r =>
        r.userId === pwTarget.key && r.status === 'pending' ? { ...r, status: 'resolved' as const } : r);
      localStorage.setItem('kkp_pwd_requests', JSON.stringify(reqs));
      setRequests(reqs);
      reloadAdmins();
      message.success(`Password updated for ${pwTarget.name}.`);
      setPwTarget(null);
    });
  };

  const handleFormValuesChange = (changedValues: any, allValues: any) => {
    if (changedValues.email && !editingKey) {
      const emailVal = changedValues.email;
      const calculatedUsername = emailVal.split('@')[0];
      form.setFieldsValue({ username: calculatedUsername });
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchText.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleOpenModal = (record?: AdminAccount) => {
    if (record) {
      setEditingKey(record.key);
      form.setFieldsValue({
        name: record.name,
        email: record.email,
        role: record.role,
        scope: record.scope,
        username: record.username,
        password: record.password,
      });
    } else {
      setEditingKey(null);
      form.resetFields();
      form.setFieldsValue({
        role: 'AGENT',
        scope: 'South Region (Chennai/Cbe)',
        password: 'admin123',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      let updatedList: AdminAccount[] = [];
      if (editingKey !== null) {
        updatedList = admins.map(item => (item.key === editingKey ? { ...item, ...values } : item));
        setAdmins(updatedList);
        
        // Update in localStorage kkp_users
        const currentUsers = JSON.parse(localStorage.getItem('kkp_users') || '[]');
        const updatedUsers = currentUsers.map((u: any) => {
          if (u.data.id === editingKey) {
            return {
              ...u,
              username: values.username || u.username,
              password: values.password || u.password,
              data: {
                ...u.data,
                name: values.name,
                email: values.email,
                role: values.role,
                scope: values.scope,
              }
            };
          }
          return u;
        });
        localStorage.setItem('kkp_users', JSON.stringify(updatedUsers));
        message.success('Admin account details updated successfully.');
      } else {
        const newId = `USR-${Date.now()}`;
        const newAdmin: AdminAccount = {
          key: newId,
          name: values.name,
          email: values.email,
          role: values.role,
          scope: values.scope,
          status: 'Active',
          username: values.username,
          password: values.password,
        };
        updatedList = [...admins, newAdmin];
        setAdmins(updatedList);

        // Update in localStorage kkp_users
        const newAdminUser = {
          username: values.username,
          password: values.password,
          data: {
            id: newId,
            name: values.name,
            email: values.email,
            role: values.role,
            scope: values.scope,
            status: 'Active',
          }
        };
        const currentUsers = JSON.parse(localStorage.getItem('kkp_users') || '[]');
        localStorage.setItem('kkp_users', JSON.stringify([...currentUsers, newAdminUser]));
        message.success('New Admin account provisioned successfully.');
      }
      setIsModalOpen(false);
    });
  };

  const handleToggleStatus = (key: string) => {
    const targetAdmin = admins.find(a => a.key === key);
    if (targetAdmin?.role === 'CHAIRMAN' || targetAdmin?.role === 'TECH_ADMIN') {
      message.error(`Cannot suspend a ${targetAdmin.role === 'CHAIRMAN' ? 'Chairman' : 'Technical Admin'} account.`);
      return;
    }
    const updatedList = admins.map(item => {
      if (item.key === key) {
        const newStatus: 'Active' | 'Suspended' = item.status === 'Active' ? 'Suspended' : 'Active';
        message.info(`Admin account status set to ${newStatus}.`);
        return { ...item, status: newStatus };
      }
      return item;
    });
    setAdmins(updatedList);

    // Update in localStorage kkp_users
    const currentUsers = JSON.parse(localStorage.getItem('kkp_users') || '[]');
    const updatedUsers = currentUsers.map((u: any) => {
      if (u.data.id === key) {
        return { ...u, data: { ...u.data, status: u.data.status === 'Active' ? 'Suspended' : 'Active' } };
      }
      return u;
    });
    localStorage.setItem('kkp_users', JSON.stringify(updatedUsers));
  };

  const handleDelete = (key: string) => {
    const targetAdmin = admins.find(a => a.key === key);
    if (targetAdmin?.role === 'CHAIRMAN' || targetAdmin?.role === 'TECH_ADMIN') {
      message.error(`Cannot delete a ${targetAdmin.role === 'CHAIRMAN' ? 'Chairman' : 'Technical Admin'} account.`);
      return;
    }
    Modal.confirm({
      title: 'Delete Admin Account',
      content: 'Are you sure you want to permanently delete this administrative account? They will lose all access immediately.',
      okText: 'Permanently Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        setAdmins(prev => prev.filter(item => item.key !== key));
        
        // Update in localStorage kkp_users
        const currentUsers = JSON.parse(localStorage.getItem('kkp_users') || '[]');
        const updatedUsers = currentUsers.filter((u: any) => u.data.id !== key);
        localStorage.setItem('kkp_users', JSON.stringify(updatedUsers));
        message.success('Admin account deleted.');
      },
    });
  };

  const columns = [
    {
      title: 'Administrator Details',
      key: 'name',
      render: (_, record: AdminAccount) => (
        <Space>
          <Avatar style={{ backgroundColor: record.role === 'CHAIRMAN' ? '#FFC20E' : record.role === 'MANAGER' ? '#0B4C8C' : record.role === 'TECH_ADMIN' ? '#7C3AED' : '#0EA5E9', color: record.role === 'CHAIRMAN' ? '#0F172A' : '#FFFFFF', fontWeight: 700 }}>
            {record.name.charAt(0)}
          </Avatar>
          <div>
            <Text strong style={{ color: '#101828', display: 'block' }}>{record.name}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Login Credentials',
      key: 'credentials',
      render: (_, record: AdminAccount) => (
        <div>
          <div>
            <Text type="secondary" style={{ fontSize: 11 }}>ID: </Text>
            <Text code style={{ fontWeight: 600 }}>{record.username}</Text>
          </div>
          <div style={{ marginTop: 2 }}>
            <Text type="secondary" style={{ fontSize: 11 }}>Pass: </Text>
            <Text code copyable>{record.password}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'System Access Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'CHAIRMAN' ? 'gold' : role === 'MANAGER' ? 'blue' : role === 'TECH_ADMIN' ? 'purple' : 'cyan'} style={{ fontWeight: 700 }}>
          {role === 'CHAIRMAN' ? '👑 CHAIRMAN' : role === 'MANAGER' ? '🛡️ MANAGER' : role === 'TECH_ADMIN' ? '🛠️ TECH ADMIN' : '📋 AGENT'}
        </Tag>
      ),
    },
    {
      title: 'Assigned Operational Scope',
      dataIndex: 'scope',
      key: 'scope',
    },
    {
      title: 'Account Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Last Login',
      key: 'lastLogin',
      render: (_, record: AdminAccount) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          <ClockCircleOutlined style={{ marginRight: 4, color: '#0B4C8C' }} />{fmtLogin(record.lastLogin)}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: AdminAccount) => (
        !canActOn(record.role) ? (
          <Text type="secondary" style={{ fontSize: 12 }}>—</Text>
        ) : (
        <Space size={12}>
          <Tooltip title="Edit Scope & Details">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#0B4C8C' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Change Password">
            <Button
              type="text"
              icon={<KeyOutlined style={{ color: '#7C3AED' }} />}
              onClick={() => openChangePassword(record)}
            />
          </Tooltip>
          <Tooltip title={record.status === 'Active' ? 'Suspend Account' : 'Activate Account'}>
            <Button
              type="text"
              icon={record.status === 'Active' ? <StopOutlined style={{ color: '#F4811F' }} /> : <CheckCircleOutlined style={{ color: '#10B981' }} />}
              onClick={() => handleToggleStatus(record.key)}
            />
          </Tooltip>
          <Tooltip title="Permanently Delete">
            <Button
              type="text"
              icon={<DeleteOutlined style={{ color: '#E63F3F' }} />}
              onClick={() => handleDelete(record.key)}
            />
          </Tooltip>
        </Space>
        )
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Admin Users Directory"
        subtitle="Manage administrator accounts, assign regional scopes, and control system credentials"
        extra={
          canManage && (
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => handleOpenModal()}
              className="kkp-btn-gold"
              style={{ background: '#F4811F', border: 'none' }}
            >
              Create Admin User
            </Button>
          )
        }
      />

      {canManage && requests.filter(r => r.status === 'pending').length > 0 && (
        <Card
          className="kkp-card"
          style={{ marginBottom: 16, borderLeft: '4px solid #F4811F' }}
          title={<Space><KeyOutlined style={{ color: '#F4811F' }} /><span className="kkp-text-navy kkp-weight-700">Password Reset Requests ({requests.filter(r => r.status === 'pending').length})</span></Space>}
        >
          {requests.filter(r => r.status === 'pending').map(r => (
            <div key={r.id} className="kkp-flex-between kkp-items-center" style={{ padding: '8px 0', borderBottom: '1px solid #F2F4F7' }}>
              <div>
                <Text strong style={{ color: '#101828' }}>{r.name}</Text> <Text type="secondary">({r.username})</Text>
                <div><Text type="secondary" style={{ fontSize: 12 }}>{r.reason || 'Requested a password change'} · {fmtLogin(r.at)}</Text></div>
              </div>
              <Button
                size="small"
                icon={<KeyOutlined />}
                onClick={() => { const a = admins.find(x => x.key === r.userId); if (a) openChangePassword(a); }}
              >
                Set new password
              </Button>
            </div>
          ))}
        </Card>
      )}

      <Card
        className="kkp-card"
        title={
          <div className="kkp-flex-between" style={{ width: '100%', flexWrap: 'wrap', gap: 12 }}>
            <Space>
              <SafetyCertificateOutlined style={{ color: '#0B4C8C', fontSize: 18 }} />
              <span className="kkp-text-navy kkp-font-manrope kkp-weight-700">Administrator Accounts Registry</span>
            </Space>
            <Input
              placeholder="Search by name or email..."
              prefix={<SearchOutlined style={{ color: '#98A2B3' }} />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ maxWidth: 280, borderRadius: 8 }}
            />
          </div>
        }
      >
        <Table
          columns={canManage ? columns : columns.filter(c => c.key !== 'actions')}
          dataSource={filteredAdmins}
          pagination={false}
          className="kkp-table"
        />
      </Card>

      <Modal
        title={editingKey !== null ? 'Modify Admin Account Scope' : 'Provision New Administrative Account'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        okText={editingKey !== null ? 'Save Changes' : 'Create Account'}
        okButtonProps={{ className: 'kkp-btn-gold', style: { background: '#F4811F', border: 'none' } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }} onValuesChange={handleFormValuesChange}>
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter name' }]}
          >
            <Input placeholder="e.g. Arun Kumar" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Corporate Email Address"
            rules={[{ required: true, type: 'email', message: 'Please enter valid corporate email' }]}
          >
            <Input placeholder="e.g. arun.k@kkptransports.com" />
          </Form.Item>

          <Form.Item
            name="username"
            label="Login ID (Username)"
            rules={[
              { required: true, message: 'Please enter a login username' },
              { pattern: /^[a-zA-Z0-9_.-]+$/, message: 'Username can only contain alphanumeric characters, dots, underscores, and hyphens' }
            ]}
            extra="This is the ID used to log in. It will auto-populate from the email prefix but can be customized."
          >
            <Input placeholder="e.g. arun.k" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Login Password"
            rules={[{ required: true, message: 'Please enter password' }]}
          >
            <Input.Password placeholder="e.g. admin123" />
          </Form.Item>

          <Form.Item
            name="role"
            label="System Role Permissions"
            rules={[{ required: true }]}
            initialValue="AGENT"
          >
            <Select options={roleOptions} />
          </Form.Item>

          <Form.Item
            name="scope"
            label="Assigned Regional Scope"
            rules={[{ required: true, message: 'Please select operational scope' }]}
            initialValue="South Region (Chennai/Cbe)"
          >
            <Select
              options={[
                { value: 'National (Full Access)', label: 'National (Full Access)' },
                { value: 'South Region (Chennai/Cbe)', label: 'South Region (Chennai/Cbe)' },
                { value: 'Tamil Nadu Operations', label: 'Tamil Nadu Operations' },
                { value: 'North Region (Delhi)', label: 'North Region (Delhi)' },
                { value: 'System', label: 'System (Technical Admin)' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<span className="kkp-text-dark"><KeyOutlined style={{ color: '#7C3AED', marginRight: 8 }} />Change Password — {pwTarget?.name}</span>}
        open={!!pwTarget}
        onOk={handleChangePassword}
        onCancel={() => setPwTarget(null)}
        okText="Update Password"
        okButtonProps={{ style: { background: '#0B4C8C', border: 'none' } }}
        destroyOnClose
      >
        <Form form={pwForm} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[{ required: true, message: 'Enter a new password' }, { min: 4, message: 'At least 4 characters' }]}
          >
            <Input.Password placeholder="New password" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
