import React, { ReactNode } from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

interface PageHeaderProps {
  // `title` is kept for compatibility but no longer rendered here — the page
  // name now lives in the top app header. We only show the description + actions.
  title?: string;
  subtitle?: string;
  extra?: ReactNode;
}

export default function PageHeader({ subtitle, extra }: PageHeaderProps) {
  if (!subtitle && !extra) return null;
  return (
    <div className="kkp-flex-between kkp-mb-24" style={{ alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
      <div>
        {subtitle && (
          <Text className="kkp-text-muted" style={{ fontSize: 14, display: 'block' }}>
            {subtitle}
          </Text>
        )}
      </div>
      {extra && <div>{extra}</div>}
    </div>
  );
}
