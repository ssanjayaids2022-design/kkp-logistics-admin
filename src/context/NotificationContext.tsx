import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'load' | 'bid' | 'driver' | 'payment' | 'system';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  addNotification: (notif: Omit<Notification, 'id' | 'read' | 'time'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const initialNotifications: Notification[] = [
  { id: 'N-001', title: 'Driver Raised Hand', message: 'Suresh Kumar raised their hand for LD-1001 — ready to match.', time: '5 min ago', read: false, type: 'driver' },
  { id: 'N-002', title: 'Load Delivered', message: 'LD-1005 has been delivered successfully at Jaipur.', time: '1 hr ago', read: false, type: 'load' },
  { id: 'N-003', title: 'Payment Overdue', message: 'Payment of ₹38,000 for LD-1010 is overdue.', time: '2 hrs ago', read: false, type: 'payment' },
];

// One-time cleanup: rewrite the old "bidding" wording in any notifications that
// were already saved to localStorage before the terminology change.
const migrate = (list: Notification[]): Notification[] =>
  list.map(n => ({
    ...n,
    title: n.title === 'New Bid Received' ? 'Driver Raised Hand' : n.title,
    message: n.message
      .replace(/is now live for bidding\.?/i, 'is now live — drivers can raise their hands to be matched.')
      .replace(/\bfor bidding\b/gi, 'for driver matching')
      .replace(/\bbidding\b/gi, 'matching')
      .replace(/placed a bid of (\S+) on (\S+)/i, 'raised their hand for $2'),
    type: n.type === 'bid' ? 'driver' : n.type,
  }));

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('kkp_notifications');
    return migrate(saved ? JSON.parse(saved) : initialNotifications);
  });

  useEffect(() => {
    localStorage.setItem('kkp_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addNotification = (notif: Omit<Notification, 'id' | 'read' | 'time'>) => {
    const newNotif: Notification = {
      ...notif,
      id: `N-${Date.now()}`,
      time: 'Just now',
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllRead, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
