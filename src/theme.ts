import { theme, ThemeConfig } from 'antd';

export const luxuryGoldTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    // Primary brand colors from website
    colorPrimary: '#1A237E', // Navy Blue
    colorPrimaryHover: '#47519cff',
    colorPrimaryActive: '#0D47A1',

    // Backgrounds
    colorBgBase: '#FFFFFF',
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#FFFFFF',
    colorBgLayout: '#F5F7FA',

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
      primaryShadow: '0 2px 4px rgba(26, 35, 126, 0.15)',
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
      activeBorderColor: '#1A237E',
      hoverBorderColor: '#1A237E',
    },
    Select: {
      colorBgContainer: '#FFFFFF',
      optionSelectedBg: '#F5F7FA',
    },
    Menu: {
      itemSelectedBg: '#F5F7FA',
      itemSelectedColor: '#1A237E',
      itemHoverBg: '#F9FAFB',
      itemActiveBg: '#F5F7FA',
      itemColor: '#475467',
      itemHoverColor: '#1A237E',
      itemMarginInline: 8,
      itemHeight: 44,
    },
    Layout: {
      siderBg: '#FFFFFF',
      headerBg: '#FFFFFF',
      bodyBg: '#F5F7FA',
    },
    Modal: {
      contentBg: '#FFFFFF',
      headerBg: '#FFFFFF',
    },
    Tabs: {
      inkBarColor: '#1A237E',
      itemActiveColor: '#1A237E',
      itemSelectedColor: '#1A237E',
      itemHoverColor: '#283593',
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
