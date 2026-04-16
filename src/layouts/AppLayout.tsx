import React, { useState, useMemo } from 'react';
import { Layout, Menu, Button, Badge, Dropdown, Avatar, Grid, Drawer, Input, Typography, List, Tag } from 'antd';
import {
  DashboardOutlined,
  CarOutlined,
  FormOutlined,
  AuditOutlined,
  TeamOutlined,
  DollarOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  GlobalOutlined,
  UserOutlined,
  LineChartOutlined,
  BarChartOutlined,
  FundOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import MobileBottomNav from '../components/MobileBottomNav';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const isMobile = !screens.lg;

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAdmin = user?.role === 'ADMIN' || isSuperAdmin;

  const menuItems = useMemo(() => {
    const adminItems = [
      { key: '/', icon: <DashboardOutlined />, label: t('nav.dashboard') },
      { key: '/loads', icon: <CarOutlined />, label: t('nav.loads') },
      { key: '/loads/new', icon: <FormOutlined />, label: t('nav.postLoad') },
      { key: '/bids', icon: <AuditOutlined />, label: t('nav.bids') },
      { key: '/drivers', icon: <TeamOutlined />, label: t('nav.drivers') },
      { key: '/payments', icon: <DollarOutlined />, label: t('nav.payments') },
    ];

    if (isAdmin) {
      adminItems.push({
        key: '/analytics/loads',
        icon: <BarChartOutlined />,
        label: t('analytics.load'),
      });
    }

    if (isSuperAdmin) {
      adminItems.push(
        { key: '/analytics/predictive', icon: <LineChartOutlined />, label: t('analytics.predictive') },
        { key: '/analytics/financial', icon: <FundOutlined />, label: t('analytics.financial') }
      );
    }

    return adminItems;
  }, [t, isAdmin, isSuperAdmin]);

  const handleMenuClick = (key: string) => {
    navigate(key);
    if (isMobile) setMobileDrawerOpen(false);
  };

  const userMenuItems = useMemo(() => [
    { key: 'profile', icon: <UserOutlined />, label: t('header.profile') },
    { key: 'settings', icon: <SettingOutlined />, label: t('header.settings') },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: t('header.logout'), danger: true },
  ], [t]);

  const handleUserMenu = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout();
    } else if (key === 'profile') {
      navigate('/profile');
    } else if (key === 'settings') {
      navigate('/settings');
    }
  };

  const languageMenuItems = useMemo(() => [
    { key: 'en', label: 'English', onClick: () => setLanguage('en') },
    { key: 'ta', label: 'Tamil (தமிழ்)', onClick: () => setLanguage('ta') },
  ], [setLanguage]);

  const notificationContent = (
    <div className="kkp-card kkp-flex-col" style={{ width: 320, boxShadow: '0 8px 32px rgba(16, 24, 40, 0.1)', overflow: 'hidden' }}>
      <div className="kkp-flex-between kkp-p-12" style={{ borderBottom: '1px solid #F2F4F7', background: '#F9FAFB' }}>
        <Text strong className="kkp-text-navy">{t('notifications.title')}</Text>
        <Button 
          type="link" 
          size="small" 
          onClick={markAllRead}
          style={{ color: '#1A237E', fontSize: 12 }}
        >
          {t('notifications.markAllRead')}
        </Button>
      </div>
      <List
        dataSource={notifications.slice(0, 5)}
        renderItem={(item) => (
          <List.Item 
            style={{ 
              padding: '12px 16px', 
              borderBottom: '1px solid #F2F4F7', 
              cursor: 'pointer',
              background: item.read ? 'transparent' : 'rgba(26, 35, 126, 0.05)',
              transition: 'all 0.3s'
            }}
          >
            <List.Item.Meta
              title={<Text style={{ color: item.read ? '#667085' : '#101828', fontSize: 13, fontWeight: item.read ? 400 : 700 }}>{item.title}</Text>}
              description={
                <div>
                  <Text style={{ color: '#475467', fontSize: 11, display: 'block' }}>{item.message}</Text>
                  <Text style={{ color: '#98A2B3', fontSize: 10 }}>{item.time}</Text>
                </div>
              }
            />
          </List.Item>
        )}
        locale={{ emptyText: <div className="kkp-p-24" style={{ textAlign: 'center', color: '#5A4F42' }}>{t('notifications.noNew')}</div> }}
      />
    </div>
  );

  const roleBadgeColor = isSuperAdmin ? '#CA9D50' : '#1A237E';
  const roleLabel = isSuperAdmin ? 'Super Admin' : 'Admin';

  const sidebarContent = (
    <>
      <div className="kkp-sidebar-header kkp-items-center kkp-gap-12" style={{
        padding: collapsed ? '20px 12px' : '20px 20px',
      }}>
        <div className="kkp-flex-between kkp-items-center" style={{ width: '100%' }}>
          <div className="kkp-items-center kkp-gap-12">
            <img
              src="/logo.png"
              alt="KKP Transports"
              style={{
                width: collapsed ? 36 : 44,
                height: collapsed ? 36 : 44,
                borderRadius: 10,
                objectFit: 'contain',
                transition: 'all 0.3s',
              }}
            />
            {!collapsed && (
              <div className="kkp-flex-col">
                <Text strong className="kkp-text-navy kkp-font-manrope" style={{ fontSize: 16, lineHeight: 1.2 }}>
                  KKP Transports
                </Text>
                <Text className="kkp-text-gold kkp-text-caption">
                  {t('brand.tagline')}
                </Text>
              </div>
            )}
          </div>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => isMobile ? setMobileDrawerOpen(false) : setCollapsed(!collapsed)}
            style={{ color: '#1A237E', fontSize: 18, marginLeft: collapsed ? 0 : 'auto' }}
          />
        </div>
      </div>

      {/* Role indicator strip */}
      {!collapsed && (
        <div style={{ padding: '0 16px 12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 8,
            background: isSuperAdmin ? 'rgba(202,157,80,0.08)' : 'rgba(26,35,126,0.06)',
            border: `1px solid ${isSuperAdmin ? 'rgba(202,157,80,0.25)' : 'rgba(26,35,126,0.15)'}`,
          }}>
            {isSuperAdmin && <CrownOutlined style={{ color: '#CA9D50', fontSize: 12 }} />}
            <Text style={{ fontSize: 11, fontWeight: 700, color: roleBadgeColor, letterSpacing: '0.08em' }}>
              {roleLabel.toUpperCase()} PORTAL
            </Text>
          </div>
        </div>
      )}

      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems.map(item => ({
          ...item,
          onClick: () => handleMenuClick(item.key),
        }))}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '0 8px',
        }}
      />

      {!collapsed && (
        <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid #F2F4F7' }}>
          <div className="kkp-user-badge kkp-items-center kkp-gap-10">
            <Avatar
              size={36}
              style={{ backgroundColor: roleBadgeColor, color: '#FFFFFF', fontWeight: 700 }}
            >
              {user?.name?.charAt(0) || 'A'}
            </Avatar>
            <div className="kkp-flex-col" style={{ flex: 1, minWidth: 0 }}>
              <Text strong className="kkp-text-dark" style={{ fontSize: 13, display: 'block' }}>
                {user?.name || 'Admin'}
              </Text>
              <Text className="kkp-text-drab kkp-text-caption" style={{ letterSpacing: '0.1em', fontSize: 9 }}>
                {roleLabel}
              </Text>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={260}
          collapsedWidth={72}
          style={{
            background: '#FFFFFF',
            borderRight: '1px solid #E4E7EC',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
            overflow: 'auto',
          }}
          trigger={null}
        >
          <div className="kkp-flex-col" style={{ height: '100%' }}>
            {sidebarContent}
          </div>
        </Sider>
      )}

      {isMobile && (
        <Drawer
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          placement="left"
          width={280}
          styles={{
            body: { padding: 0, background: '#FFFFFF', height: '100%' },
            header: { display: 'none' },
          }}
        >
          <div className="kkp-flex-col" style={{ height: '100%' }}>
            {sidebarContent}
          </div>
        </Drawer>
      )}

      <Layout style={{
        marginLeft: isMobile ? 0 : (collapsed ? 72 : 260),
        transition: 'margin-left 0.3s',
      }}>
        <Header className="kkp-glass kkp-items-center kkp-flex-between" style={{
          padding: '0 24px',
          borderBottom: '1px solid #E4E7EC',
          position: 'sticky',
          top: 0,
          zIndex: 99,
          height: 64,
          gap: 16,
        }}>
          <div className="kkp-items-center kkp-gap-12">
            {isMobile && (
              <Button
                type="text"
                icon={<MenuUnfoldOutlined />}
                onClick={() => setMobileDrawerOpen(true)}
                style={{ color: '#1A237E', fontSize: 18 }}
              />
            )}
            {isMobile && (
              <img src="/logo.png" alt="KKP" className="kkp-btn-rounded" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            )}
          </div>

          {!isMobile && (
            <Input
              placeholder={t('header.search')}
              prefix={<SearchOutlined style={{ color: '#98A2B3' }} />}
              style={{
                maxWidth: 400,
                background: '#F9FAFB',
                borderColor: '#E4E7EC',
                borderRadius: 20,
              }}
            />
          )}

          <div className="kkp-items-center kkp-gap-8">
            {/* Role badge in header */}
            {!isMobile && (
              <Tag
                color={isSuperAdmin ? '#CA9D50' : '#1A237E'}
                style={{ borderRadius: 6, fontSize: 11, fontWeight: 700, border: 'none' }}
              >
                {isSuperAdmin ? '👑 Super Admin' : 'Admin'}
              </Tag>
            )}

            <Dropdown menu={{ items: languageMenuItems }} placement="bottomRight" trigger={['click']}>
              <Button type="text" icon={<GlobalOutlined />} style={{ color: '#475467' }}>
                {!isMobile && <span style={{ fontSize: 12, fontWeight: 700 }}>{language.toUpperCase()}</span>}
              </Button>
            </Dropdown>

            <Dropdown dropdownRender={() => notificationContent} placement="bottomRight" trigger={['click']}>
              <Badge count={unreadCount} size="small" color="#1A237E">
                <Button type="text" icon={<BellOutlined />} style={{ color: '#475467' }} />
              </Badge>
            </Dropdown>

            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenu }} placement="bottomRight">
              <Avatar
                size={34}
                style={{ backgroundColor: roleBadgeColor, color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
              >
                {user?.name?.charAt(0) || 'A'}
              </Avatar>
            </Dropdown>
          </div>
        </Header>

        <Content style={{
          padding: isMobile ? '20px 16px 88px 16px' : '28px 32px 32px 32px',
          minHeight: 'calc(100vh - 64px)',
        }}>
          <div className="kkp-max-width">
            <Outlet />
          </div>
        </Content>
      </Layout>

      {isMobile && <MobileBottomNav />}
    </Layout>
  );
}
