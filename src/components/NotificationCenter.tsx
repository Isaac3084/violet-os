import React, { useState } from 'react';
import { 
  Bell, 
  Calendar, 
  Mail, 
  MessageSquare, 
  X,
  Settings,
  Clock
} from 'lucide-react';

interface Notification {
  id: string;
  app: string;
  title: string;
  subtitle?: string;
  time: string;
  icon: React.ElementType;
  isRead: boolean;
}

interface NotificationCenterProps {
  isVisible: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isVisible, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      app: 'Mail',
      title: 'New message from John Doe',
      subtitle: 'Hey! How are you doing? Let\'s catch up soon.',
      time: '2m ago',
      icon: Mail,
      isRead: false
    },
    {
      id: '2',
      app: 'Calendar',
      title: 'Meeting in 30 minutes',
      subtitle: 'Team standup - Conference Room A',
      time: '30m ago',
      icon: Calendar,
      isRead: false
    },
    {
      id: '3',
      app: 'Messages',
      title: 'Sarah Johnson',
      subtitle: 'Thanks for your help yesterday!',
      time: '1h ago',
      icon: MessageSquare,
      isRead: true
    },
    {
      id: '4',
      app: 'System',
      title: 'Software Update Available',
      subtitle: 'macOS 26.1 is ready to install',
      time: '2h ago',
      icon: Settings,
      isRead: true
    },
    {
      id: '5',
      app: 'Reminders',
      title: 'Buy groceries',
      subtitle: 'Milk, eggs, bread, fruits',
      time: '3h ago',
      icon: Clock,
      isRead: true
    }
  ]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isVisible) return null;

  return (
    <div className="notification-center-overlay" onClick={onClose}>
      <div className="notification-center-container" onClick={(e) => e.stopPropagation()}>
        <style>{`
          .notification-center-overlay {
            position: fixed;
            top: 28px;
            right: 20px;
            z-index: 9998;
            animation: notificationSlideIn 0.3s ease-out;
          }

          @keyframes notificationSlideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          .notification-center-container {
            width: 360px;
            max-height: 600px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px) saturate(180%);
            border-radius: 16px;
            box-shadow: 
              0 20px 60px rgba(0, 0, 0, 0.3),
              0 0 0 1px rgba(255, 255, 255, 0.2) inset;
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }

          .notification-center-header {
            padding: 16px 20px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .notification-center-title {
            font-size: 16px;
            font-weight: 600;
            color: #333;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .notification-center-badge {
            background: #FF3B30;
            color: white;
            font-size: 12px;
            font-weight: 600;
            padding: 2px 6px;
            border-radius: 10px;
            min-width: 18px;
            text-align: center;
          }

          .notification-center-actions {
            display: flex;
            gap: 8px;
          }

          .notification-center-button {
            background: none;
            border: none;
            color: #007AFF;
            font-size: 14px;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
            transition: background-color 0.2s ease;
          }

          .notification-center-button:hover {
            background: rgba(0, 122, 255, 0.1);
          }

          .notification-center-content {
            flex: 1;
            overflow-y: auto;
            padding: 8px 0;
          }

          .notification-center-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 40px 20px;
            color: #666;
          }

          .notification-center-empty-icon {
            font-size: 48px;
            margin-bottom: 16px;
            opacity: 0.5;
          }

          .notification-center-empty-text {
            font-size: 16px;
            text-align: center;
          }

          .notification-item {
            display: flex;
            padding: 12px 20px;
            cursor: pointer;
            transition: background-color 0.2s ease;
            position: relative;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          }

          .notification-item:hover {
            background: rgba(0, 0, 0, 0.05);
          }

          .notification-item.unread {
            background: rgba(0, 122, 255, 0.05);
          }

          .notification-item.unread::before {
            content: '';
            position: absolute;
            left: 6px;
            top: 50%;
            transform: translateY(-50%);
            width: 6px;
            height: 6px;
            background: #007AFF;
            border-radius: 50%;
          }

          .notification-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            flex-shrink: 0;
          }

          .notification-icon.mail {
            background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%);
            color: white;
          }

          .notification-icon.calendar {
            background: linear-gradient(135deg, #FF3B30 0%, #D70015 100%);
            color: white;
          }

          .notification-icon.messages {
            background: linear-gradient(135deg, #34C759 0%, #248A3D 100%);
            color: white;
          }

          .notification-icon.system {
            background: linear-gradient(135deg, #8E8E93 0%, #636366 100%);
            color: white;
          }

          .notification-icon.reminders {
            background: linear-gradient(135deg, #FF9500 0%, #FF6B00 100%);
            color: white;
          }

          .notification-content {
            flex: 1;
            min-width: 0;
          }

          .notification-app {
            font-size: 12px;
            font-weight: 600;
            color: #666;
            margin-bottom: 2px;
          }

          .notification-title {
            font-size: 14px;
            font-weight: 500;
            color: #333;
            margin-bottom: 2px;
            line-height: 1.3;
          }

          .notification-subtitle {
            font-size: 13px;
            color: #666;
            line-height: 1.3;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .notification-time {
            font-size: 11px;
            color: #999;
            margin-top: 4px;
          }

          .notification-close {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.1);
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: all 0.2s ease;
            margin-left: 8px;
            flex-shrink: 0;
          }

          .notification-item:hover .notification-close {
            opacity: 1;
          }

          .notification-close:hover {
            background: rgba(255, 59, 48, 0.2);
            color: #FF3B30;
          }
        `}</style>

        <div className="notification-center-header">
          <div className="notification-center-title">
            <Bell size={18} />
            Notifications
            {unreadCount > 0 && (
              <span className="notification-center-badge">{unreadCount}</span>
            )}
          </div>
          <div className="notification-center-actions">
            {notifications.length > 0 && (
              <button className="notification-center-button" onClick={clearAll}>
                Clear All
              </button>
            )}
            <button className="notification-center-button" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="notification-center-content">
          {notifications.length === 0 ? (
            <div className="notification-center-empty">
              <Bell className="notification-center-empty-icon" size={48} />
              <div className="notification-center-empty-text">
                No notifications
              </div>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className={`notification-icon ${notification.app.toLowerCase()}`}>
                    <Icon size={20} />
                  </div>
                  <div className="notification-content">
                    <div className="notification-app">{notification.app}</div>
                    <div className="notification-title">{notification.title}</div>
                    {notification.subtitle && (
                      <div className="notification-subtitle">{notification.subtitle}</div>
                    )}
                    <div className="notification-time">{notification.time}</div>
                  </div>
                  <button
                    className="notification-close"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(notification.id);
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
