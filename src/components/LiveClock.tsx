import { useEffect, useState } from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useTheme } from '../context/ThemeContext';

/** Live date + time shown in the top header on every page. */
export default function LiveClock({ compact = false }: { compact?: boolean }) {
  const [now, setNow] = useState(new Date());
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  const date = now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });

  // Theme-aware colors so the time is readable on both light and dark headers.
  const timeColor = isDarkMode ? '#F1F5F9' : '#101828';
  const dateColor = isDarkMode ? '#94A3B8' : '#98A2B3';
  const iconColor = isDarkMode ? '#94A3B8' : '#98A2B3';

  if (compact) {
    return (
      <span style={{ color: isDarkMode ? '#E2E8F0' : '#344054', fontSize: 13, fontWeight: 700, fontFamily: '"Manrope", sans-serif' }}>
        {time}
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <ClockCircleOutlined style={{ color: iconColor, fontSize: 15 }} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: timeColor, fontFamily: '"Manrope", sans-serif', letterSpacing: '0.01em' }}>
          {time}
        </span>
        <span style={{ fontSize: 11, color: dateColor, fontWeight: 500 }}>
          {date}
        </span>
      </div>
    </div>
  );
}
