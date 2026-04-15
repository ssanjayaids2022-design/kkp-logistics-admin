import React, { ReactNode } from 'react';
import { Typography } from 'antd';

const { Title, Text } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
}

export default function PageHeader({ title, subtitle, extra }: PageHeaderProps) {
  return (
    <div className="kkp-flex-between kkp-mb-28" style={{ alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
      <div>
        <Title
          level={3}
          className="kkp-text-navy kkp-font-manrope"
          style={{
            margin: 0,
            fontWeight: 800,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </Title>
        {subtitle && (
          <Text className="kkp-text-muted" style={{ fontSize: 14, marginTop: 4, display: 'block' }}>
            {subtitle}
          </Text>
        )}
      </div>
      {extra && <div>{extra}</div>}
    </div>
  );
}
