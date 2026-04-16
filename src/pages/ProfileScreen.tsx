import React, { useState } from 'react';
import { Card, Typography, Row, Col, Avatar, Divider, Descriptions, Button, Modal, Form, Input, message } from 'antd';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserOutlined, MailOutlined, PhoneOutlined, SafetyCertificateOutlined, EditOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';

const { Title, Text } = Typography;

export default function ProfileScreen() {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleEditClick = () => {
    form.setFieldsValue({
      name: user?.name,
      email: user?.email,
    });
    setIsModalVisible(true);
  };

  const handleSave = (values: any) => {
    updateUser({
      name: values.name,
      email: values.email,
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
            <Avatar size={100} icon={<UserOutlined />} style={{ backgroundColor: '#1A237E' }} />
          </Col>
          <Col flex="auto">
            <Title level={3} style={{ margin: 0, color: '#101828', textTransform: 'capitalize' }}>
              {user?.name || 'Admin User'}
            </Title>
            <Text style={{ color: '#667085', fontSize: 16 }}>
              {user?.role === 'SUPER_ADMIN' ? '👑 Super Administrator' : 'Administrator'}
            </Text>
          </Col>
          <Col>
             <Button icon={<EditOutlined />} type="primary" onClick={handleEditClick} style={{ background: '#CA9D50', borderColor: '#CA9D50', color: '#fff' }}>
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
        okButtonProps={{ style: { background: '#1A237E', borderColor: '#1A237E' } }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
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
