import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, message, Modal, Space } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const { Title, Text, Link } = Typography;

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const { login, requestPasswordReset } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [forgotForm] = Form.useForm();

  const onFinish = async (values: { username: string; password: string; remember: boolean }) => {
    setLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    const success = login(values.username, values.password);
    setLoading(false);

    if (success) {
      message.success('Welcome back to KKP Logistics Command');
      navigate('/');
    } else {
      message.error('Invalid username or password. Please try again.');
    }
  };

  const handleForgotPassword = async (values: { email: string }) => {
    setForgotLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    const ok = requestPasswordReset(values.email, 'Forgot password (from login)');
    setForgotLoading(false);
    if (ok) {
      addNotification({
        title: 'Password reset requested',
        message: `${values.email} requested a password reset. Resolve it in Admin Management.`,
        type: 'system',
      });
      message.success('Your request has been sent to the Manager.');
      setIsForgotModalOpen(false);
      forgotForm.resetFields();
    } else {
      message.error('No account found for that email or username.');
    }
  };

  return (
    <div className="kkp-login-bg kkp-flex-center kkp-h-screen kkp-overflow-hidden" style={{
      padding: 20,
      position: 'relative',
    }}>
      {/* Decorative background elements */}
      <div className="kkp-pos-absolute" style={{
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(11,76,172,0.1) 0%, transparent 70%)',
        top: '-15%',
        right: '-10%',
      }} />
      <div className="kkp-pos-absolute" style={{
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(244,129,31,0.05) 0%, transparent 70%)',
        bottom: '-10%',
        left: '-5%',
      }} />

      {/* Login Card */}
      <div className="kkp-login-card kkp-w-full" style={{
        maxWidth: 420,
        padding: '48px 40px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Gold glow top border */}
        <div className="kkp-pos-absolute" style={{
          top: 0,
          left: '20%',
          right: '20%',
          height: 3,
          background: 'linear-gradient(90deg, transparent, #F4811F, transparent)',
          borderRadius: '0 0 50% 50%',
        }} />

        {/* Logo & Branding */}
        <div className="kkp-text-center kkp-mb-36">
          <img
            src="/logo.png"
            alt="KKP Transports"
            className="kkp-mb-16"
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 12px rgba(11,76,172,0.15))',
            }}
          />
          <Title level={3} className="kkp-text-navy kkp-font-manrope kkp-weight-800" style={{
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            KKP Transports
          </Title>
          <Text className="kkp-text-gold kkp-text-caption" style={{ letterSpacing: '0.2em' }}>
            Logistics Command Center
          </Text>
        </div>

        {/* Login Form */}
        <Form
          name="login"
          onFinish={onFinish}
          size="large"
          layout="vertical"
          initialValues={{ remember: true }}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please enter your username' }]}
          >
            <Input
              prefix={<UserOutlined className="kkp-text-drab" />}
              placeholder="Username"
              className="kkp-btn-rounded"
              style={{
                background: '#F9FAFB',
                borderColor: '#D0D5DD',
                height: 48,
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="kkp-text-drab" />}
              placeholder="Password"
              className="kkp-btn-rounded"
              style={{
                background: '#F9FAFB',
                borderColor: '#D0D5DD',
                height: 48,
              }}
            />
          </Form.Item>

          <Form.Item>
            <div className="kkp-flex-between">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox style={{ color: '#475467' }}>Remember me</Checkbox>
              </Form.Item>
              <Link 
                className="kkp-text-gold" 
                style={{ fontSize: 13, fontWeight: 600 }}
                onClick={() => setIsForgotModalOpen(true)}
              >
                Forgot password?
              </Link>
            </div>
          </Form.Item>

          <Form.Item className="kkp-mb-16">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="kkp-btn-gold kkp-btn-rounded"
              style={{
                height: 48,
                fontSize: 15,
                letterSpacing: '0.03em',
              }}
            >
              Sign In
            </Button>
          </Form.Item>

          <div className="kkp-text-center">
            <Text className="kkp-text-drab" style={{ fontSize: 12 }}>
              Account secured with enterprise-grade encryption
            </Text>
          </div>
        </Form>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        title={<span className="kkp-text-navy kkp-font-manrope kkp-weight-800">Forgot Password</span>}
        open={isForgotModalOpen}
        onCancel={() => {
          setIsForgotModalOpen(false);
          forgotForm.resetFields();
        }}
        onOk={() => forgotForm.submit()}
        okText="Send Request to Manager"
        okButtonProps={{ loading: forgotLoading, className: 'kkp-btn-gold', style: { background: '#F4811F', border: 'none' } }}
      >
        <div style={{ marginTop: 16 }}>
          <Text style={{ display: 'block', marginBottom: 16 }}>
            Enter your registered email or username. A password-reset request will be sent to your Manager, who can set a new password for you.
          </Text>
          <Form form={forgotForm} layout="vertical" onFinish={handleForgotPassword}>
            <Form.Item
              name="email"
              label="Email or Username"
              rules={[{ required: true, message: 'Please enter your email or username' }]}
            >
              <Input
                prefix={<MailOutlined className="kkp-text-drab" />}
                placeholder="e.g. loadadmin or employee@kkptransports.com"
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
}
