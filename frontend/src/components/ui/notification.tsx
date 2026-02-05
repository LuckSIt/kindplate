import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import type { Notification } from '@/lib/notifications';
import { useNotificationStore } from '@/lib/notifications';

interface NotificationProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export function NotificationComponent({ notification, onRemove }: NotificationProps) {
  const Icon = icons[notification.type];

  const getAccentColor = () => {
    switch (notification.type) {
      case 'success': return '#22C55E';
      case 'error': return '#EF4444';
      case 'warning': return '#F59E0B';
      case 'info': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const accentColor = getAccentColor();

  return (
    <div 
      className="notification-toast animate-in slide-in-from-top-2 fade-in duration-200"
      style={{
        maxWidth: '400px',
        width: '100%',
        background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
        borderRadius: '16px',
        padding: '14px 16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        pointerEvents: 'auto',
        fontFamily: "'Montserrat Alternates', sans-serif",
        borderLeft: `4px solid ${accentColor}`,
        transform: 'translateZ(0)',
        willChange: 'transform, opacity',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* Icon */}
        <div style={{ 
          flexShrink: 0,
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '10px',
          backgroundColor: `${accentColor}20`,
        }}>
          <Icon 
            style={{ 
              width: '18px', 
              height: '18px', 
              color: accentColor,
            }} 
          />
        </div>
        
        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: '15px',
            fontWeight: 600,
            lineHeight: '20px',
            color: '#FFFFFF',
            margin: 0,
            marginBottom: '4px'
          }}>
            {notification.title}
          </p>
          <p style={{
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '18px',
            color: '#FFFFFF',
            opacity: 0.9,
            margin: 0
          }}>
            {notification.message}
          </p>
          {notification.action && (
            <div style={{ marginTop: '10px' }}>
              <button
                onClick={notification.action.onClick}
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: accentColor,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'opacity 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                {notification.action.label}
              </button>
            </div>
          )}
        </div>
        
        {/* Close Button */}
        <div style={{ flexShrink: 0, marginLeft: '8px' }}>
          <button
            onClick={() => onRemove(notification.id)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
            }}
            aria-label="Закрыть"
          >
            <X style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotificationStore();

  if (notifications.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      style={{
        position: 'fixed',
        top: '16px',
        left: '16px',
        right: '16px',
        zIndex: 9999,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        alignItems: 'flex-start',
        maxWidth: '400px'
      }}
    >
      {notifications.map((notification) => (
        <NotificationComponent
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
}
