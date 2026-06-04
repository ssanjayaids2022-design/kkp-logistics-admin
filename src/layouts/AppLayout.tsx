import React, { useState, useMemo } from 'react';
import { Layout, Menu, Button, Badge, Dropdown, Avatar, Grid, Drawer, Input, Typography, List, Tag, AutoComplete } from 'antd';
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
import { useLoads } from '../context/LoadsContext';
import { drivers, payments } from '../data/mockData';

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

  const isChairman = user?.role === 'CHAIRMAN';
  const isManager = user?.role === 'MANAGER';
  const isLoadAdmin = user?.role === 'LOAD_ADMIN';

  const { loads } = useLoads();
  const [searchValue, setSearchValue] = useState('');

  const handleSearchSelect = (value: string) => {
    try {
      const data = JSON.parse(value);
      if (data.type === 'page') {
        navigate(data.path);
      } else if (data.type === 'bid') {
        navigate(data.path, { state: { selectedLoadId: data.search } });
      } else {
        navigate(data.path, { state: { searchText: data.search } });
      }
      setSearchValue('');
    } catch (e) {
      console.error(e);
    }
  };

  const getPageIcon = (path: string) => {
    switch (path) {
      case '/': return <DashboardOutlined style={{ color: '#0B4C8C', marginRight: 8 }} />;
      case '/loads': return <CarOutlined style={{ color: '#0B4C8C', marginRight: 8 }} />;
      case '/loads/new': return <FormOutlined style={{ color: '#0B4C8C', marginRight: 8 }} />;
      case '/bids': return <AuditOutlined style={{ color: '#0B4C8C', marginRight: 8 }} />;
      case '/drivers': return <TeamOutlined style={{ color: '#0B4C8C', marginRight: 8 }} />;
      case '/payments': return <DollarOutlined style={{ color: '#0B4C8C', marginRight: 8 }} />;
      case '/profile': return <UserOutlined style={{ color: '#0B4C8C', marginRight: 8 }} />;
      case '/settings': return <SettingOutlined style={{ color: '#0B4C8C', marginRight: 8 }} />;
      case '/analytics/predictive': return <CrownOutlined style={{ color: '#FFC20E', marginRight: 8 }} />;
      case '/analytics/financial': return <LineChartOutlined style={{ color: '#0B4C8C', marginRight: 8 }} />;
      case '/admin-users': return <TeamOutlined style={{ color: '#FFC20E', marginRight: 8 }} />;
      case '/access-matrix': return <SettingOutlined style={{ color: '#FFC20E', marginRight: 8 }} />;
      case '/audit-logs': return <AuditOutlined style={{ color: '#667085', marginRight: 8 }} />;
      default: return <LineChartOutlined style={{ color: '#0B4C8C', marginRight: 8 }} />;
    }
  };

  const searchOptions = useMemo(() => {
    if (!searchValue.trim()) {
      const quickNavOptions = [
        { value: JSON.stringify({ type: 'page', path: '/' }), label: <div className="kkp-items-center"><DashboardOutlined style={{ color: '#0B4C8C', marginRight: 8 }} /><span style={{ color: '#101828', fontWeight: 500 }}>Dashboard</span></div> },
        { value: JSON.stringify({ type: 'page', path: '/loads' }), label: <div className="kkp-items-center"><CarOutlined style={{ color: '#0B4C8C', marginRight: 8 }} /><span style={{ color: '#101828', fontWeight: 500 }}>Loads Ledger</span></div> },
      ];
      if (!isChairman) {
        quickNavOptions.push(
          { value: JSON.stringify({ type: 'page', path: '/loads/new' }), label: <div className="kkp-items-center"><FormOutlined style={{ color: '#0B4C8C', marginRight: 8 }} /><span style={{ color: '#101828', fontWeight: 500 }}>Post New Load</span></div> }
        );
      }
      quickNavOptions.push(
        { value: JSON.stringify({ type: 'page', path: '/bids' }), label: <div className="kkp-items-center"><AuditOutlined style={{ color: '#0B4C8C', marginRight: 8 }} /><span style={{ color: '#101828', fontWeight: 500 }}>Bids Comparison</span></div> },
        { value: JSON.stringify({ type: 'page', path: '/drivers' }), label: <div className="kkp-items-center"><TeamOutlined style={{ color: '#0B4C8C', marginRight: 8 }} /><span style={{ color: '#101828', fontWeight: 500 }}>Driver Approvals</span></div> }
      );
      if (isChairman || isManager) {
        quickNavOptions.push(
          { value: JSON.stringify({ type: 'page', path: '/payments' }), label: <div className="kkp-items-center"><DollarOutlined style={{ color: '#0B4C8C', marginRight: 8 }} /><span style={{ color: '#101828', fontWeight: 500 }}>Payments Ledger</span></div> }
        );
      }
      return [
        {
          label: <span style={{ fontWeight: 800, color: '#475467', fontSize: 10, letterSpacing: '0.08em' }}>QUICK NAVIGATION</span>,
          options: quickNavOptions,
        },
      ];
    }

    const query = searchValue.toLowerCase().trim();

    // 1. Pages
    const pages = [
      { name: 'Dashboard', path: '/' },
      { name: 'Loads List', path: '/loads' },
    ];
    if (!isChairman) {
      pages.push({ name: 'Post New Load', path: '/loads/new' });
    }
    pages.push(
      { name: 'Bids Comparison', path: '/bids' },
      { name: 'Driver Directory / Approvals', path: '/drivers' },
      { name: 'Driver Analytics', path: '/analytics/drivers' },
      { name: 'Load Analytics', path: '/analytics/loads' },
      { name: 'Trip Analytics', path: '/analytics/trips' },
      { name: 'Operations Analytics', path: '/analytics/operations' },
      { name: 'Route Analytics', path: '/analytics/routes' },
      { name: 'Profile Screen', path: '/profile' },
      { name: 'Settings Screen', path: '/settings' }
    );
    if (isChairman || isManager) {
      pages.push(
        { name: 'Payments Ledger', path: '/payments' },
        { name: 'Payment Analytics', path: '/analytics/payments-analytics' },
        { name: 'Predictive Analytics', path: '/analytics/predictive' },
        { name: 'Financial Analytics', path: '/analytics/financial' },
        { name: 'Admin Management', path: '/admin-users' },
        { name: 'Access Matrix', path: '/access-matrix' },
        { name: 'Audit Logs', path: '/audit-logs' }
      );
    }
    const matchedPages = pages
      .filter((p) => p.name.toLowerCase().includes(query))
      .map((p) => ({
        value: JSON.stringify({ type: 'page', path: p.path }),
        label: (
          <div className="kkp-items-center">
            {getPageIcon(p.path)}
            <span style={{ color: '#101828', fontWeight: 500 }}>{p.name}</span>
          </div>
        ),
      }));

    // 2. Loads
    const matchedLoads = loads
      .filter((l) =>
        l.id.toLowerCase().includes(query) ||
        l.source.toLowerCase().includes(query) ||
        l.destination.toLowerCase().includes(query) ||
        (l.assignedDriver && l.assignedDriver.toLowerCase().includes(query)) ||
        l.vehicleType.toLowerCase().includes(query) ||
        l.status.toLowerCase().includes(query)
      )
      .slice(0, 5)
      .map((l) => ({
        value: JSON.stringify({ type: 'load', path: '/loads', search: l.id }),
        label: (
          <div className="kkp-flex-between" style={{ width: '100%' }}>
            <span className="kkp-items-center">
              <CarOutlined style={{ color: '#0B4C8C', marginRight: 8, fontSize: 13 }} />
              <strong style={{ color: '#0B4C8C', marginRight: 6, fontSize: 12 }}>{l.id}</strong>
              <span style={{ color: '#344054', fontSize: 12 }}>{l.source} → {l.destination}</span>
            </span>
            <Tag color={l.status === 'active' ? 'blue' : l.status === 'delivered' || l.status === 'completed' || l.status === 'in_transit' ? 'success' : 'warning'} style={{ margin: 0, fontSize: 9, borderRadius: 4, textTransform: 'uppercase', border: 'none', fontWeight: 700 }}>
              {l.status.replace('_', ' ')}
            </Tag>
          </div>
        ),
      }));

    // 3. Drivers
    const matchedDrivers = drivers
      .filter((d) =>
        d.id.toLowerCase().includes(query) ||
        d.name.toLowerCase().includes(query) ||
        d.phone.includes(query) ||
        d.vehicleNumber.toLowerCase().includes(query) ||
        d.vehicleType.toLowerCase().includes(query) ||
        d.status.toLowerCase().includes(query)
      )
      .slice(0, 5)
      .map((d) => ({
        value: JSON.stringify({ type: 'driver', path: '/drivers', search: d.name }),
        label: (
          <div className="kkp-flex-between" style={{ width: '100%' }}>
            <span className="kkp-items-center">
              <UserOutlined style={{ color: '#F4811F', marginRight: 8, fontSize: 13 }} />
              <strong style={{ color: '#101828', marginRight: 6, fontSize: 12 }}>{d.name}</strong>
              <span style={{ color: '#667085', fontSize: 11 }}>({d.vehicleNumber})</span>
            </span>
            <Tag color={d.status === 'approved' ? 'success' : d.status === 'pending_approval' ? 'warning' : 'error'} style={{ margin: 0, fontSize: 9, borderRadius: 4, textTransform: 'uppercase', border: 'none', fontWeight: 700 }}>
              {d.status.replace('_', ' ')}
            </Tag>
          </div>
        ),
      }));

    // 4. Payments
    let matchedPayments: any[] = [];
    if (isChairman || isManager) {
      matchedPayments = payments
        .filter((p) =>
          p.loadId.toLowerCase().includes(query) ||
          p.driverName.toLowerCase().includes(query) ||
          p.route.toLowerCase().includes(query) ||
          p.status.toLowerCase().includes(query)
        )
        .slice(0, 5)
        .map((p) => ({
          value: JSON.stringify({ type: 'payment', path: '/payments', search: p.loadId }),
          label: (
            <div className="kkp-flex-between" style={{ width: '100%' }}>
              <span className="kkp-items-center">
                <DollarOutlined style={{ color: '#12B76A', marginRight: 8, fontSize: 13 }} />
                <strong style={{ color: '#101828', marginRight: 6, fontSize: 12 }}>{p.loadId}</strong>
                <span style={{ color: '#344054', fontSize: 12 }}>{p.driverName} - <strong style={{ color: '#0B4C8C' }}>₹{p.amount.toLocaleString()}</strong></span>
              </span>
              <Tag color={p.status === 'paid' ? 'success' : p.status === 'pending' || p.status === 'processing' ? 'warning' : 'error'} style={{ margin: 0, fontSize: 9, borderRadius: 4, textTransform: 'uppercase', border: 'none', fontWeight: 700 }}>
                {p.status}
              </Tag>
            </div>
          ),
        }));
    }

    const results = [];
    if (matchedPages.length > 0) {
      results.push({
        label: <span style={{ fontWeight: 800, color: '#475467', fontSize: 10, letterSpacing: '0.08em' }}>PAGES</span>,
        options: matchedPages,
      });
    }
    if (matchedLoads.length > 0) {
      results.push({
        label: <span style={{ fontWeight: 800, color: '#475467', fontSize: 10, letterSpacing: '0.08em' }}>LOADS</span>,
        options: matchedLoads,
      });
    }
    if (matchedDrivers.length > 0) {
      results.push({
        label: <span style={{ fontWeight: 800, color: '#475467', fontSize: 10, letterSpacing: '0.08em' }}>DRIVERS</span>,
        options: matchedDrivers,
      });
    }
    if (matchedPayments.length > 0) {
      results.push({
        label: <span style={{ fontWeight: 800, color: '#475467', fontSize: 10, letterSpacing: '0.08em' }}>PAYMENTS & DISBURSEMENTS</span>,
        options: matchedPayments,
      });
    }

    return results;
  }, [searchValue, loads, isChairman, isManager]);

  const menuItems = useMemo(() => {
    const items = [
      { key: '/', icon: <DashboardOutlined />, label: t('nav.dashboard') || 'Dashboard' },
      { key: '/loads', icon: <CarOutlined />, label: t('nav.loads') },
    ];

    if (!isChairman) {
      items.push({ key: '/loads/new', icon: <FormOutlined />, label: t('nav.postLoad') });
    }

    items.push(
      { key: '/bids', icon: <AuditOutlined />, label: t('nav.bids') },
      { key: '/drivers', icon: <TeamOutlined />, label: t('nav.drivers') }
    );

    if (isChairman || isManager) {
      items.push({ key: '/payments', icon: <DollarOutlined />, label: t('nav.payments') });
    }

    if (isChairman || isManager) {
      const systemAdminChildren = [
        { key: '/admin-users', label: t('nav.adminUsers') || 'Admin Directory' },
        { key: '/access-matrix', label: t('nav.accessMatrix') || 'Access Matrix' },
        { key: '/audit-logs', label: t('nav.auditLogs') || 'Audit Logs' }
      ];

      items.push({
        key: 'system-admin-submenu',
        icon: <SettingOutlined />,
        label: t('nav.systemAdmin') || 'Administration',
        children: systemAdminChildren,
      } as any);
    }

    return items;
  }, [t, isChairman, isManager]);

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
          style={{ color: '#0B4C8C', fontSize: 12 }}
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

  const roleBadgeColor = isChairman ? '#FFC20E' : isManager ? '#0B4C8C' : '#0EA5E9';
  const roleLabel = isChairman ? 'Chairman' : isManager ? 'Manager' : 'Load Admin';

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
                <Text strong className="kkp-font-manrope" style={{ fontSize: 16, lineHeight: 1.2, color: '#FFFFFF' }}>
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
            style={{ color: '#94A3B8', fontSize: 18, marginLeft: collapsed ? 0 : 'auto' }}
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
            background: isChairman ? 'rgba(244,129,31,0.08)' : isManager ? 'rgba(10,85,165,0.06)' : 'rgba(14,165,233,0.06)',
            border: `1px solid ${isChairman ? 'rgba(244,129,31,0.25)' : isManager ? 'rgba(10,85,165,0.15)' : 'rgba(14,165,233,0.15)'}`,
          }}>
            {isChairman && <CrownOutlined style={{ color: '#FFC20E', fontSize: 12 }} />}
            <Text style={{ fontSize: 11, fontWeight: 700, color: roleBadgeColor, letterSpacing: '0.08em' }}>
              {roleLabel.toUpperCase()} PORTAL
            </Text>
          </div>
        </div>
      )}

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => handleMenuClick(key)}
        items={menuItems}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '0 8px',
        }}
      />

      {!collapsed && (
        <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div className="kkp-user-badge kkp-items-center" style={{ background: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.08)', gap: '12px', display: 'flex', alignItems: 'center' }}>
            <Avatar
              size={36}
              src={user?.avatar}
              style={{ backgroundColor: roleBadgeColor, color: '#0F172A', fontWeight: 700 }}
            >
              {!user?.avatar && (user?.name?.charAt(0) || 'A')}
            </Avatar>
            <div className="kkp-flex-col" style={{ flex: 1, minWidth: 0 }}>
              <Text strong style={{ fontSize: 13, display: 'block', color: '#FFFFFF' }}>
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
            background: 'linear-gradient(160deg, #021B3A 0%, #04508F 40%, #0498D9 75%, #08A9E6 100%)',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
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
            body: { padding: 0, background: 'linear-gradient(160deg, #021B3A 0%, #04508F 40%, #0498D9 75%, #08A9E6 100%)', height: '100%' },
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
                className="kkp-header-btn"
                style={{ fontSize: 18 }}
              />
            )}
            {isMobile && (
              <img src="/logo.png" alt="KKP" className="kkp-btn-rounded" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            )}
          </div>

          {!isMobile && (
            <AutoComplete
              popupClassName="kkp-search-dropdown"
              style={{ width: '100%', maxWidth: 380 }}
              options={searchOptions}
              onSelect={handleSearchSelect}
              value={searchValue}
              onSearch={(value) => setSearchValue(value)}
            >
              <Input
                placeholder={t('header.search')}
                prefix={<SearchOutlined className="kkp-search-icon" style={{ fontSize: 15 }} />}
                className="kkp-search-input"
                bordered={false}
                allowClear
              />
            </AutoComplete>
          )}

          <div className="kkp-items-center kkp-gap-8">
            {/* Role badge in header */}
            {!isMobile && (
              <Tag
                className={isChairman ? 'kkp-role-tag-chairman' : isManager ? 'kkp-role-tag-manager' : 'kkp-role-tag-loadadmin'}
                bordered={false}
              >
                {isChairman ? '👑 Chairman' : isManager ? '🛡️ Manager' : '📋 Load Admin'}
              </Tag>
            )}

            <Dropdown menu={{ items: languageMenuItems }} placement="bottomRight" trigger={['click']}>
              <Button type="text" icon={<GlobalOutlined />} className="kkp-header-action-btn">
                {!isMobile && <span style={{ fontSize: 12, fontWeight: 700 }}>{language.toUpperCase()}</span>}
              </Button>
            </Dropdown>

            <Dropdown dropdownRender={() => notificationContent} placement="bottomRight" trigger={['click']}>
              <Badge count={unreadCount} size="small" color="#0B4C8C" offset={[-2, 2]}>
                <Button type="text" icon={<BellOutlined />} className="kkp-header-btn" />
              </Badge>
            </Dropdown>

            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenu }} placement="bottomRight">
              <Avatar
                size={34}
                src={user?.avatar}
                className="kkp-avatar-btn"
                style={{ backgroundColor: roleBadgeColor, color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
              >
                {!user?.avatar && (user?.name?.charAt(0) || 'A')}
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
