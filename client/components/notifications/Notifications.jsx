import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { ReactiveCache } from '/imports/reactiveCache';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * Notifications Component
 * 
 * Replaces the original Blaze notifications component with a React component.
 * This component provides a notifications drawer toggle and display system
 * with unread notification indicators.
 * 
 * Original Blaze component had:
 * - notifications: Main notifications container with toggle button
 * - notificationsDrawer: Notifications drawer display
 * - Unread notification count display
 */
const Notifications = ({ onUpdate }) => {
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentUser, unreadNotifications } = useTracker(() => {
    const user = ReactiveCache.getCurrentUser();
    if (!user) return {
      currentUser: null,
      unreadNotifications: 0
    };

    // Get unread notifications count
    const unreadCount = user.unreadNotifications ? user.unreadNotifications.length : 0;

    return {
      currentUser: user,
      unreadNotifications: unreadCount
    };
  }, []);

  // Handle notifications drawer toggle
  const handleToggleDrawer = useCallback(() => {
    setShowNotificationsDrawer(prev => !prev);
  }, []);

  // Handle notification click
  const handleNotificationClick = useCallback((notification) => {
    // TODO: Handle notification click - mark as read, navigate, etc.
    console.log('Notification clicked:', notification);
    if (onUpdate) onUpdate();
  }, [onUpdate]);

  // Handle mark all as read
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      // TODO: Implement mark all as read functionality
      console.log('Mark all notifications as read');
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  }, [onUpdate]);

  if (!currentUser) {
    return null;
  }

  return (
    <div id="notifications" className="board-header-btns right">
      {/* Notifications Toggle Button */}
      <button
        className={`notifications-drawer-toggle fa fa-bell ${unreadNotifications > 0 ? 'alert' : ''}`}
        onClick={handleToggleDrawer}
        title={t('notifications')}
        aria-label={t('notifications')}
      >
        {unreadNotifications > 0 && (
          <span className="notification-badge">
            {unreadNotifications > 99 ? '99+' : unreadNotifications}
          </span>
        )}
      </button>

      {/* Notifications Drawer */}
      {showNotificationsDrawer && (
        <NotificationsDrawer
          unreadNotifications={unreadNotifications}
          onNotificationClick={handleNotificationClick}
          onMarkAllAsRead={handleMarkAllAsRead}
          onClose={() => setShowNotificationsDrawer(false)}
        />
      )}
    </div>
  );
};

/**
 * NotificationsDrawer Component
 * 
 * Notifications drawer display with notification list
 */
const NotificationsDrawer = ({ 
  unreadNotifications, 
  onNotificationClick, 
  onMarkAllAsRead, 
  onClose 
}) => {
  const t = (key) => enTranslations[key] || key;

  // Track reactive data for notifications
  const { notifications, loading } = useTracker(() => {
    const user = ReactiveCache.getCurrentUser();
    if (!user) return {
      notifications: [],
      loading: false
    };

    // Get user notifications
    const userNotifications = user.notifications || [];
    
    return {
      notifications: userNotifications,
      loading: false
    };
  }, []);

  // Handle notification click
  const handleNotificationClick = useCallback((notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  }, [onNotificationClick]);

  // Handle mark all as read
  const handleMarkAllAsRead = useCallback(() => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
  }, [onMarkAllAsRead]);

  return (
    <div className="notifications-drawer js-notifications-drawer">
      {/* Drawer Header */}
      <div className="drawer-header">
        <h3 className="drawer-title">
          <i className="fa fa-bell"></i>
          {t('notifications')}
          {unreadNotifications > 0 && (
            <span className="unread-count">({unreadNotifications})</span>
          )}
        </h3>

        <div className="drawer-actions">
          {unreadNotifications > 0 && (
            <button
              className="btn btn-sm btn-secondary mark-all-read"
              onClick={handleMarkAllAsRead}
              title={t('mark-all-as-read')}
            >
              {t('mark-all-read')}
            </button>
          )}

          <button
            className="btn btn-sm btn-close"
            onClick={onClose}
            title={t('close')}
          >
            <i className="fa fa-times"></i>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="notifications-content">
        {loading ? (
          <div className="loading-spinner">
            <i className="fa fa-spinner fa-spin"></i>
            {t('loading')}
          </div>
        ) : notifications.length === 0 ? (
          <div className="no-notifications">
            <i className="fa fa-check-circle"></i>
            <p>{t('no-notifications')}</p>
            <small>{t('all-caught-up')}</small>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map(notification => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onClick={handleNotificationClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Drawer Footer */}
      <div className="drawer-footer">
        <button
          className="btn btn-primary view-all-notifications"
          onClick={() => {
            // TODO: Navigate to full notifications page
            console.log('View all notifications');
            onClose();
          }}
        >
          {t('view-all-notifications')}
        </button>
      </div>
    </div>
  );
};

/**
 * NotificationItem Component
 * 
 * Individual notification item display
 */
const NotificationItem = ({ notification, onClick }) => {
  const t = (key) => enTranslations[key] || key;

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(notification);
    }
  }, [notification, onClick]);

  // Get notification icon based on type
  const getNotificationIcon = () => {
    const type = notification.type || 'default';
    
    switch (type) {
      case 'card':
        return 'fa-credit-card';
      case 'board':
        return 'fa-columns';
      case 'comment':
        return 'fa-comment';
      case 'member':
        return 'fa-user';
      case 'due':
        return 'fa-clock';
      case 'mention':
        return 'fa-at';
      default:
        return 'fa-bell';
    }
  };

  // Get notification time
  const getNotificationTime = () => {
    if (!notification.createdAt) return '';
    
    const now = new Date();
    const created = new Date(notification.createdAt);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('just-now');
    if (diffMins < 60) return t('minutes-ago', { count: diffMins });
    if (diffHours < 24) return t('hours-ago', { count: diffHours });
    if (diffDays < 7) return t('days-ago', { count: diffDays });
    
    return created.toLocaleDateString();
  };

  return (
    <div 
      className={`notification-item js-notification-item ${notification.read ? 'read' : 'unread'}`}
      onClick={handleClick}
    >
      <div className="notification-icon">
        <i className={`fa ${getNotificationIcon()}`}></i>
      </div>

      <div className="notification-content">
        <div className="notification-text">
          {notification.message || t('notification-message')}
        </div>

        <div className="notification-meta">
          <span className="notification-time">
            {getNotificationTime()}
          </span>

          {notification.source && (
            <span className="notification-source">
              {notification.source}
            </span>
          )}
        </div>
      </div>

      {!notification.read && (
        <div className="notification-status">
          <div className="unread-indicator"></div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
