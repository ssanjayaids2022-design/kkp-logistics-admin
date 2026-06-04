import React, { useState, useEffect } from 'react';
import { Card as AntdCard, Table, Button, Tag, Space, Avatar, Input, Modal, Form, Select, message, Tooltip, Typography } from 'antd';
const Card = AntdCard as any;
import { UserAddOutlined, EditOutlined, StopOutlined, CheckCircleOutlined, DeleteOutlined, SearchOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';

const { Text } = Typography;

interface AdminAccount {
  key: string;
  name: string;
  email: string;
  role: 'CHAIRMAN' | 'MANAGER' | 'LOAD_ADMIN';
  scope: string;
  status: 'Active' | 'Suspended';
  username?: string;
  password?: string;
}

export default function AdminManagement() {
  const { user } = useAuth();
  const isChairman = user?.role === 'CHAIRMAN';

  const [admins, setAdmins] = useState<AdminAccount[]>(() => {
    const stored = localStorage.getItem('kkp_users');
    if (stored) {
      const usersList = JSON.parse(stored);
      return usersList.map((u: any) => ({
        key: u.data.id,
        name: u.data.name,
        email: u.data.email,
        role: u.data.role,
        scope: u.data.scope || (u.data.role === 'SUPER_ADMIN' ? 'National (Full Access)' : 'South Region (Chennai/Cbe)'),
        status: u.data.status || 'Active',
        username: u.username || u.data.email.split('@')[0],
        password: u.password || 'admin123',
      }));
    }
    return [];
  });

  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState<string | null>(null);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'kkp_users') {
        const stored = localStorage.getItem('kkp_users');
        if (stored) {
          const usersList = JSON.parse(stored);
          setAdmins(usersList.map((u: any) => ({
            key: u.data.id,
            name: u.data.name,
            email: u.data.email,
            role: u.data.role,
            scope: u.data.scope || (u.data.role === 'SUPER_ADMIN' ? 'National (Full Access)' : 'South Region (Chennai/Cbe)'),
            status: u.data.status || 'Active',
            username: u.username || u.data.email.split('@')[0],
            password: u.password || 'admin123',
          })));
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

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
        role: 'ADMIN',
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
    if (targetAdmin?.role === 'CHAIRMAN') {
      message.error('Cannot suspend a Chairman account.');
      return;
    }
    const updatedList = admins.map(item => {
      if (item.key === key) {
        const newStatus = item.status === 'Active' ? 'Suspended' : 'Active';
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
    if (targetAdmin?.role === 'CHAIRMAN') {
      message.error('Cannot delete a Chairman account.');
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
          <Avatar style={{ backgroundColor: record.role === 'CHAIRMAN' ? '#FFC20E' : record.role === 'MANAGER' ? '#0B4C8C' : '#0EA5E9', color: record.role === 'CHAIRMAN' ? '#0F172A' : '#FFFFFF', fontWeight: 700 }}>
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
        <Tag color={role === 'CHAIRMAN' ? 'gold' : role === 'MANAGER' ? 'blue' : 'cyan'} style={{ fontWeight: 700 }}>
          {role === 'CHAIRMAN' ? '👑 CHAIRMAN' : role === 'MANAGER' ? '🛡️ MANAGER' : '📋 LOAD ADMIN'}
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
      title: 'Actions',
      key: 'actions',
      render: (_, record: AdminAccount) => (
        <Space size={12}>
          <Tooltip title="Edit Scope & Details">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#0B4C8C' }} />}
              onClick={() => handleOpenModal(record)}
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
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Admin Users Directory"
        subtitle="Manage administrator accounts, assign regional scopes, and control system credentials"
        extra={
          !isChairman && (
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
          columns={isChairman ? columns.filter(c => c.key !== 'actions') : columns}
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
            initialValue="LOAD_ADMIN"
          >
            <Select
              options={[
                { value: 'LOAD_ADMIN', label: 'Load Admin (Operational)' },
                { value: 'MANAGER', label: 'Manager (Full Access)' },
                { value: 'CHAIRMAN', label: 'Chairman (Read-Only CEO)' },
              ]}
            />
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
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
