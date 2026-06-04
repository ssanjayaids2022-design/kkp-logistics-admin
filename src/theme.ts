import { theme, ThemeConfig } from 'antd';

export const luxuryGoldTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    // Primary brand colors from website
    colorPrimary: '#0B4C8C', // Brand Cobalt Royal Blue
    colorPrimaryHover: '#0E60B0',
    colorPrimaryActive: '#083B6B',

    // Backgrounds
    colorBgBase: '#FFFFFF',
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#FFFFFF',
    colorBgLayout: '#FFF5E6', // Smooth warm orange-cream layout background

    // Text
    colorText: '#101828',
    colorTextSecondary: '#475467',
    colorTextTertiary: '#667085',
    colorTextQuaternary: '#98A2B3',

    // Borders
    colorBorder: '#E4E7EC',
    colorBorderSecondary: '#F2F4F7',

    // Status colors
    colorSuccess: '#12B76A',
    colorWarning: '#F79009',
    colorError: '#F04438',
    colorInfo: '#2E90FA',

    // Typography
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,
    borderRadius: 8,
    borderRadiusLG: 12,
  },
  components: {
    Button: {
      primaryShadow: '0 2px 4px rgba(11, 76, 172, 0.15)',
      fontWeight: 600,
      defaultBorderColor: '#D0D5DD',
      defaultColor: '#344054',
    },
    Card: {
      colorBgContainer: '#FFFFFF',
      boxShadowTertiary: '0 1px 3px rgba(16, 24, 40, 0.1), 0 1px 2px rgba(16, 24, 40, 0.06)',
      paddingLG: 24,
    },
    Table: {
      headerBg: '#F9FAFB',
      headerColor: '#475467',
      rowHoverBg: '#F9FAFB',
      borderColor: '#EAECF0',
    },
    Input: {
      colorBgContainer: '#FFFFFF',
      activeBorderColor: '#0B4C8C',
      hoverBorderColor: '#0B4C8C',
    },
    Select: {
      colorBgContainer: '#FFFFFF',
      optionSelectedBg: '#FFEEDD', // Soft warm orange for active items
    },
    Menu: {
      itemSelectedBg: 'rgba(8, 169, 230, 0.15)', // Subtle Cyan glow
      itemSelectedColor: '#08A9E6', // Cyan Highlight
      itemHoverBg: 'rgba(255, 255, 255, 0.04)',
      itemActiveBg: 'rgba(8, 169, 230, 0.2)',
      itemColor: '#94A3B8', // Cool gray text for dark menu
      itemHoverColor: '#08A9E6', // Cyan Highlight on hover
      itemMarginInline: 8,
      itemHeight: 44,
    },
    Layout: {
      siderBg: '#04508F',
      headerBg: 'rgba(220, 53, 69, 0.08)', // Light transparent red header
      bodyBg: '#FFF5E6',
    },
    Modal: {
      contentBg: '#FFFFFF',
      headerBg: '#FFFFFF',
    },
    Tabs: {
      inkBarColor: '#0B4C8C',
      itemActiveColor: '#0B4C8C',
      itemSelectedColor: '#0B4C8C',
      itemHoverColor: '#0E60B0',
    },
    Form: {
      labelColor: '#344054',
      verticalLabelPadding: '0 0 6px',
    },
    Pagination: {
      itemActiveBg: '#F9FAFB',
    },
  },
};

export const luxuryGoldDarkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#0B4C8C',
    colorPrimaryHover: '#0E60B0',
    colorPrimaryActive: '#083B6B',
    colorBgBase: '#0B0F19',
    colorBgContainer: '#1E293B',
    colorBgElevated: '#1E293B',
    colorBgLayout: '#0B0F19',
    colorText: '#F8FAFC',
    colorTextSecondary: '#94A3B8',
    colorTextTertiary: '#64748B',
    colorTextQuaternary: '#475569',
    colorBorder: '#334155',
    colorBorderSecondary: '#1E293B',
    colorSuccess: '#10B981',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
    colorInfo: '#3B82F6',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,
    borderRadius: 8,
    borderRadiusLG: 12,
  },
  components: {
    Button: {
      primaryShadow: '0 2px 4px rgba(11, 76, 172, 0.3)',
      fontWeight: 600,
      defaultBorderColor: '#334155',
      defaultColor: '#E2E8F0',
    },
    Card: {
      colorBgContainer: '#1E293B',
      boxShadowTertiary: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
      paddingLG: 24,
    },
    Table: {
      headerBg: '#0F172A',
      headerColor: '#94A3B8',
      rowHoverBg: '#1E293B',
      borderColor: '#334155',
    },
    Input: {
      colorBgContainer: '#1E293B',
      activeBorderColor: '#08A9E6',
      hoverBorderColor: '#0E60B0',
    },
    Select: {
      colorBgContainer: '#1E293B',
      optionSelectedBg: '#0B4C8C33',
    },
    Menu: {
      itemSelectedBg: 'rgba(8, 169, 230, 0.2)',
      itemSelectedColor: '#08A9E6',
      itemHoverBg: 'rgba(255, 255, 255, 0.06)',
      itemActiveBg: 'rgba(8, 169, 230, 0.25)',
      itemColor: '#94A3B8',
      itemHoverColor: '#08A9E6',
      itemMarginInline: 8,
      itemHeight: 44,
    },
    Layout: {
      siderBg: '#0F172A',
      headerBg: 'rgba(30, 41, 59, 0.8)',
      bodyBg: '#0B0F19',
    },
    Modal: {
      contentBg: '#1E293B',
      headerBg: '#1E293B',
    },
    Tabs: {
      inkBarColor: '#0B4C8C',
      itemActiveColor: '#0B4C8C',
      itemSelectedColor: '#0B4C8C',
      itemHoverColor: '#0E60B0',
    },
    Form: {
      labelColor: '#94A3B8',
      verticalLabelPadding: '0 0 6px',
    },
    Pagination: {
      itemActiveBg: '#1E293B',
    },
  },
};
