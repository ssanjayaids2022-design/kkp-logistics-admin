import React, { useState } from 'react';
import { Card as AntdCard, Typography, Row, Col, Avatar, Divider, Descriptions, Button, Modal, Form, Input, message } from 'antd';
const Card = AntdCard as any;
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserOutlined, MailOutlined, PhoneOutlined, SafetyCertificateOutlined, EditOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';

const { Title, Text } = Typography;

const PRESET_AVATARS = [
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="50" fill="%230B4C8C"/><circle cx="50" cy="40" r="20" fill="%23FFFFFF"/><path d="M15 80 C 15 55, 85 55, 85 80 Z" fill="%23FFFFFF"/></svg>`,
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="50" fill="%23F4811F"/><path d="M25 40 L50 25 L75 40 L75 75 L25 75 Z" fill="%23FFFFFF"/><path d="M50 25 L50 75" stroke="%23F4811F" stroke-width="3"/></svg>`,
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="50" fill="%2310B981"/><circle cx="50" cy="40" r="18" fill="%23FFFFFF"/><path d="M20 78 C 20 60, 80 60, 80 78 Z" fill="%23FFFFFF"/><circle cx="50" cy="40" r="8" fill="%2310B981"/></svg>`,
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="50" fill="%23FFC20E"/><path d="M30 35 L45 20 L55 20 L70 35 L60 65 L40 65 Z" fill="%230F172A"/><circle cx="50" cy="80" r="10" fill="%230F172A"/></svg>`
];

export default function ProfileScreen() {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string | undefined>(user?.avatar);
  const [form] = Form.useForm();

  const handleEditClick = () => {
    setLocalAvatar(user?.avatar);
    form.setFieldsValue({
      name: user?.name,
      email: user?.email,
    });
    setIsModalVisible(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        message.error('Profile image must be smaller than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        setLocalAvatar(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (values: any) => {
    updateUser({
      name: values.name,
      email: values.email,
      avatar: localAvatar,
    });
    message.success('Profile updated successfully!');
    setIsModalVisible(false);
  };

  return (
    <div>
      <PageHeader title={t('header.profile')} subtitle={t('profile.subtitle')} />
      <Card className="kkp-card" style={{ maxWidth: 800 }}>
        <Row gutter={[24, 24]} align="middle">
          <Col>
            <Avatar size={100} src={user?.avatar} style={{ backgroundColor: '#0B4C8C', fontSize: 40, fontWeight: 700 }}>
              {!user?.avatar && (user?.name?.charAt(0).toUpperCase() || 'A')}
            </Avatar>
          </Col>
          <Col flex="auto">
            <Title level={3} style={{ margin: 0, color: '#101828', textTransform: 'capitalize' }}>
              {user?.name || 'Admin User'}
            </Title>
            <Text style={{ color: '#667085', fontSize: 16 }}>
              {user?.role === 'CHAIRMAN' ? '👑 Chairman (CEO)' : user?.role === 'MANAGER' ? '🛡️ General Manager' : '📋 Load Dispatch Administrator'}
            </Text>
          </Col>
          <Col>
             <Button icon={<EditOutlined />} type="primary" onClick={handleEditClick} style={{ background: '#F4811F', borderColor: '#F4811F', color: '#fff' }}>
               {t('profile.edit')}
             </Button>
          </Col>
        </Row>
        <Divider />
        <Descriptions title={t('profile.persInfo')} bordered column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}>
          <Descriptions.Item label={<div><MailOutlined /> {t('profile.email')}</div>}>
            {user?.email || 'admin@kkptransports.com'}
          </Descriptions.Item>
          <Descriptions.Item label={<div><PhoneOutlined /> {t('profile.phone')}</div>}>
            +91 98765 43210
          </Descriptions.Item>
          <Descriptions.Item label={<div><SafetyCertificateOutlined /> {t('profile.role')}</div>}>
            <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>
              {user?.role?.toLowerCase().replace('_', ' ')}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label={t('profile.accStatus')}>
             <span style={{ color: '#10B981', fontWeight: 'bold' }}>{t('profile.active')}</span>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Modal
        title={t('profile.edit')}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        okText="Save Changes"
        okButtonProps={{ style: { background: '#0B4C8C', borderColor: '#0B4C8C' } }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item label="Profile Picture">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
              <Avatar size={72} src={localAvatar} style={{ backgroundColor: '#0B4C8C', fontSize: 28, fontWeight: 700 }}>
                {!localAvatar && (user?.name?.charAt(0).toUpperCase() || 'A')}
              </Avatar>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button 
                    type="default" 
                    size="small" 
                    onClick={() => document.getElementById('avatar-file-input')?.click()}
                  >
                    Upload Photo
                  </Button>
                  {localAvatar && (
                    <Button 
                      type="text" 
                      danger 
                      size="small" 
                      onClick={() => setLocalAvatar(undefined)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <input 
                  type="file" 
                  id="avatar-file-input" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange} 
                />
                <Text type="secondary" style={{ fontSize: 11 }}>Supports JPG, PNG (Max 2MB)</Text>
              </div>
            </div>

            <div>
              <Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 8 }}>Or select a preset avatar:</Text>
              <div style={{ display: 'flex', gap: 12 }}>
                {PRESET_AVATARS.map((preset, index) => (
                  <div 
                    key={index} 
                    onClick={() => setLocalAvatar(preset)}
                    style={{ 
                      cursor: 'pointer',
                      borderRadius: '50%',
                      padding: 2,
                      border: localAvatar === preset ? '2px solid #F4811F' : '2px solid transparent',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Avatar size={40} src={preset} />
                  </div>
                ))}
              </div>
            </div>
          </Form.Item>

          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input your name!' }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Please input a valid email!' }]}>
            <Input size="large" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
