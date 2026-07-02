import { Card as AntdCard, List, Button, Tag, Empty, Typography } from 'antd';
const Card = AntdCard as any;
import {
  CarOutlined, DollarOutlined, TeamOutlined, ThunderboltOutlined, BellOutlined, CheckOutlined,
} from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
import { useNotifications } from '../context/NotificationContext';

const { Text } = Typography;

const typeMeta: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  load: { color: '#0B4C8C', icon: <CarOutlined />, label: 'Load' },
  driver: { color: '#F4811F', icon: <TeamOutlined />, label: 'Driver' },
  payment: { color: '#12B76A', icon: <DollarOutlined />, label: 'Payment' },
  bid: { color: '#7C3AED', icon: <ThunderboltOutlined />, label: 'Match' },
  system: { color: '#667085', icon: <BellOutlined />, label: 'System' },
};

export default function NotificationsScreen() {
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${notifications.length} total · ${unreadCount} unread`}
        extra={
          <Button icon={<CheckOutlined />} onClick={markAllRead} disabled={unreadCount === 0}>
            Mark all read
          </Button>
        }
      />

      <Card className="kkp-card" styles={{ body: { padding: 0 } }}>
        {notifications.length === 0 ? (
          <div style={{ padding: 48 }}><Empty description="No notifications yet." /></div>
        ) : (
          <List
            dataSource={notifications}
            renderItem={(item) => {
              const meta = typeMeta[item.type] || typeMeta.system;
              return (
                <List.Item
                  onClick={() => markAsRead(item.id)}
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #F2F4F7',
                    cursor: 'pointer',
                    background: item.read ? 'transparent' : 'rgba(11, 76, 140, 0.04)',
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <div className="kkp-flex-center" style={{ width: 40, height: 40, borderRadius: 10, background: `${meta.color}18`, color: meta.color, fontSize: 18 }}>
                        {meta.icon}
                      </div>
                    }
                    title={
                      <div className="kkp-items-center kkp-gap-8" style={{ flexWrap: 'wrap' }}>
                        <Text style={{ color: item.read ? '#667085' : '#101828', fontSize: 14, fontWeight: item.read ? 500 : 700 }}>{item.title}</Text>
                        <Tag color={meta.color} style={{ margin: 0, fontSize: 10, borderRadius: 4 }}>{meta.label}</Tag>
                        {!item.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0B4C8C', display: 'inline-block' }} />}
                      </div>
                    }
                    description={
                      <div>
                        <Text style={{ color: '#475467', fontSize: 13, display: 'block' }}>{item.message}</Text>
                        <Text style={{ color: '#98A2B3', fontSize: 11 }}>{item.time}</Text>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </Card>
    </div>
  );
}
