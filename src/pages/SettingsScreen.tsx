import React from 'react';
import { Card, Typography, List, Switch, Select, Button, Divider, Avatar } from 'antd';
import { useLanguage } from '../context/LanguageContext';
import { GlobalOutlined, BellOutlined, SecurityScanOutlined, MoonOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';

const { Title, Text } = Typography;
const { Option } = Select;

export default function SettingsScreen() {
  const { t, language, setLanguage } = useLanguage();

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
              avatar={<Avatar style={{ backgroundColor: '#1A237E18', color: '#1A237E' }} icon={<GlobalOutlined />} />}
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
          
          <List.Item actions={[<Switch key="theme-switch" />]}>
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
      </Card>
    </div>
  );
}
