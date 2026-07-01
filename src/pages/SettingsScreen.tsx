import React from 'react';
import { Card as AntdCard, Typography, List, Switch, Select, Button, Divider, Avatar } from 'antd';
const Card = AntdCard as any;
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { GlobalOutlined, BellOutlined, SecurityScanOutlined, MoonOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';

const { Title, Text } = Typography;
const Option = Select.Option as any;

export default function SettingsScreen() {
  const { t, language, setLanguage } = useLanguage();
  const { can } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();

  // Enterprise/system settings belong to the Technical Admin.
  const showEnterpriseSettings = can('settings.enterprise');
  const isChairman = false; // enterprise settings are only shown to editors now

  return (
    <div>
      <PageHeader title={t('header.settings')} subtitle={t('settings.subtitle')} />
      
      <Card className="kkp-card" style={{ maxWidth: 800 }}>
        <List itemLayout="horizontal">
          <List.Item actions={[
            <Select key="lang-select" value={language} onChange={setLanguage} style={{ width: 120 }}>
              <Option value="en">English</Option>
              <Option value="ta">Tamil (தமிழ்)</Option>
            </Select>
          ]}>
            <List.Item.Meta
              avatar={<Avatar style={{ backgroundColor: '#0B4C8C18', color: '#0B4C8C' }} icon={<GlobalOutlined />} />}
              title={<Text strong>{t('settings.language')}</Text>}
              description={t('settings.languageDesc')}
            />
          </List.Item>

          <List.Item actions={[<Switch key="notify-switch" defaultChecked />]}>
            <List.Item.Meta
              avatar={<Avatar style={{ backgroundColor: '#10B98118', color: '#10B981' }} icon={<BellOutlined />} />}
              title={<Text strong>{t('settings.pushNotifications')}</Text>}
              description={t('settings.pushNotificationsDesc')}
            />
          </List.Item>
          
          <List.Item actions={[<Switch key="theme-switch" checked={isDarkMode} onChange={toggleDarkMode} />]}>
            <List.Item.Meta
              avatar={<Avatar style={{ backgroundColor: '#66708518', color: '#667085' }} icon={<MoonOutlined />} />}
              title={<Text strong>{t('settings.darkMode')}</Text>}
              description={t('settings.darkModeDesc')}
            />
          </List.Item>
        </List>

        <Divider />
        <Title level={5}>{t('settings.security')}</Title>
        <List itemLayout="horizontal">
          <List.Item actions={[<Button key="pwd-btn" type="default">{t('settings.changePassword')}</Button>]}>
            <List.Item.Meta
              avatar={<Avatar style={{ backgroundColor: '#EF444418', color: '#EF4444' }} icon={<SecurityScanOutlined />} />}
              title={<Text strong>{t('settings.password')}</Text>}
              description={t('settings.passwordDesc')}
            />
          </List.Item>
        </List>

        {showEnterpriseSettings ? (
          <>
            <Divider />
            <Title level={5} style={{ color: '#0B4C8C', marginBottom: isChairman ? 4 : 16 }}>⚙️ Enterprise System Settings</Title>
            {isChairman && (
              <div style={{ color: '#D46B08', background: '#FFF2E8', border: '1px solid #FFC069', padding: '6px 12px', borderRadius: 6, fontSize: 12, marginBottom: 16, display: 'inline-block' }}>
                Read-Only: Chairman credentials cannot edit global configurations
              </div>
            )}
            <List itemLayout="horizontal">
              <List.Item actions={[<Switch key="webhook-switch" defaultChecked disabled={isChairman} />]}>
                <List.Item.Meta
                  avatar={<Avatar style={{ backgroundColor: '#F4811F18', color: '#F4811F' }} icon={<GlobalOutlined />} />}
                  title={<Text strong>Slack Webhook Integrations</Text>}
                  description="Publish live status alerts for delays and critical payouts to Slack channel"
                />
              </List.Item>
              <List.Item actions={[
                <Select key="retention-select" defaultValue="90" style={{ width: 140 }} disabled={isChairman}>
                  <Option value="30">30 Days</Option>
                  <Option value="90">90 Days</Option>
                  <Option value="365">365 Days</Option>
                </Select>
              ]}>
                <List.Item.Meta
                  avatar={<Avatar style={{ backgroundColor: '#FFC20E18', color: '#FFC20E' }} icon={<SecurityScanOutlined />} />}
                  title={<Text strong>Database Audit Logs Retention</Text>}
                  description="Specify duration to keep security log entries in active storage"
                />
              </List.Item>
              <List.Item actions={[<Switch key="backup-switch" defaultChecked disabled={isChairman} />]}>
                <List.Item.Meta
                  avatar={<Avatar style={{ backgroundColor: '#0B4C8C18', color: '#0B4C8C' }} icon={<GlobalOutlined />} />}
                  title={<Text strong>Daily Automated Cloud Backup</Text>}
                  description="Perform database backups at 02:00 IST to secure AWS S3 instance"
                />
              </List.Item>
            </List>
          </>
        ) : (
          <>
            <Divider />
            <div style={{ background: '#F8F9FC', padding: 20, borderRadius: 10, textAlign: 'center', border: '1px dashed #D0D5DD' }}>
              <SecurityScanOutlined style={{ fontSize: 28, color: '#98A2B3', marginBottom: 8 }} />
              <Title level={5} style={{ margin: 0, color: '#475467' }}>Enterprise System Settings Restricted</Title>
              <Text type="secondary" style={{ fontSize: 13 }}>Only Super Administrators have access to change global configurations.</Text>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
