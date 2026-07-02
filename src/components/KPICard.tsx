import React, { ReactNode } from 'react';
import { Card as AntdCard, Statistic } from 'antd';
const Card = AntdCard as any;
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface KPICardProps {
  title: string;
  value: string | number;
  trend: string;
  trendUp?: boolean;
  icon: ReactNode;
  color?: string;
  onClick?: () => void;
  active?: boolean;
}

export default function KPICard({ title, value, trend, trendUp = true, icon, color = '#0B4C8C', onClick, active = false }: KPICardProps) {
  return (
    <Card
      hoverable
      onClick={onClick}
      className="kkp-card-dynamic"
      style={{
        ['--kkp-color' as any]: color,
        cursor: onClick ? 'pointer' : undefined,
        borderColor: active ? color : undefined,
        boxShadow: active ? `0 0 0 2px ${color}33` : undefined,
      }}
      styles={{
        body: { padding: 24, position: 'relative', zIndex: 1 },
      }}
    >
      <div className="kkp-flex-between kkp-mb-16">
        <span className="kkp-text-muted kkp-text-caption">
          {title}
        </span>
        <div className="kkp-flex-center" style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          background: `${color}10`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
          fontSize: 18,
        }}>
          {icon}
        </div>
      </div>

      <Statistic
        value={value}
        valueStyle={{
          fontSize: 28,
          fontWeight: 800,
          color: '#0B4C8C',
          fontFamily: '"Manrope", sans-serif',
          lineHeight: 1,
        }}
      />

      <div className="kkp-gap-4 kkp-mt-8" style={{
        fontSize: 11,
        fontWeight: 700,
        color: trendUp ? '#12B76A' : '#667085',
        display: 'flex',
        alignItems: 'center',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        {trendUp && <ArrowUpOutlined style={{ fontSize: 10 }} />}
        {!trendUp && trend.includes('-') && <ArrowDownOutlined style={{ fontSize: 10 }} />}
        <span style={{ marginLeft: 4 }}>{trend}</span>
      </div>
    </Card>
  );
}
