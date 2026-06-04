import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  CarOutlined,
  AuditOutlined,
  TeamOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useLanguage } from '../context/LanguageContext';

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const tabs = [
    { key: '/', icon: <DashboardOutlined />, label: t('nav.dashboard') },
    { key: '/loads', icon: <CarOutlined />, label: t('nav.loads') },
    { key: '/bids', icon: <AuditOutlined />, label: t('nav.bids') },
    { key: '/drivers', icon: <TeamOutlined />, label: t('nav.drivers') },
    { key: '/payments', icon: <DollarOutlined />, label: t('nav.payments') },
  ];

  const isActive = (key: string) => {
    if (key === '/') return location.pathname === '/';
    return location.pathname.startsWith(key);
  };

  return (
    <nav className="kkp-glass" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 72,
      borderTop: '1px solid #E4E7EC',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 1000,
      paddingBottom: 8,
      boxShadow: '0 -4px 20px rgba(16, 24, 40, 0.05)',
    }}>
      {tabs.map((tab) => {
        const active = isActive(tab.key);
        return (
          <button
            key={tab.key}
            onClick={() => navigate(tab.key)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '8px 12px',
              borderRadius: 12,
              transition: 'all 0.2s ease',
              color: active ? '#0B4C8C' : '#667085',
              flex: 1,
            }}
          >
            <div style={{
              fontSize: 20,
              padding: '6px 16px',
              borderRadius: 12,
              background: active ? 'rgba(11, 76, 172, 0.08)' : 'transparent',
              transition: 'all 0.2s ease',
              transform: active ? 'scale(1.1)' : 'scale(1)',
            }}>
              {tab.icon}
            </div>
            <span className="kkp-text-caption" style={{ fontSize: 9, color: active ? '#0B4C8C' : '#98A2B3' }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
