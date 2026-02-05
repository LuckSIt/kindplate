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

  return (
    <div 
      className="notification-toast animate-in slide-in-from-top-2 fade-in duration-200"
      style={{
        maxWidth: '400px',
        width: '100%',
        backgroundColor: '#000019',
        borderRadius: '12px',
        padding: '14px 16px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        pointerEvents: 'auto',
        fontFamily: "'Montserrat Alternates', sans-serif",
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(8px)',
        transform: 'translateZ(0)',
        willChange: 'transform, opacity',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* Icon */}
        <div style={{ 
          flexShrink: 0,
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: '2px solid #FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent'
          }}>
            <Icon 
              style={{ 
                width: '12px', 
                height: '12px', 
                color: '#FFFFFF',
                strokeWidth: '3'
              }} 
            />
          </div>
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
            <div style={{ marginTop: '12px' }}>
              <button
                onClick={notification.action.onClick}
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
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
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              opacity: 0.8
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
            aria-label="Закрыть"
          >
            <X style={{ width: '18px', height: '18px' }} />
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
