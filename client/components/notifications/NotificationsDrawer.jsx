import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { ReactiveCache } from '/imports/reactiveCache';

// Import components
import Notification from './Notification';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * NotificationsDrawer Component
 * 
 * Replaces the original Jade notificationsDrawer template with a React component.
 * This component provides a drawer interface for notifications with:
 * - Toggle between read/unread notifications
 * - Mark all as read functionality
 * - Remove all read notifications
 * - Individual notification management
 * 
 * Original Jade template had:
 * - Header with toggle and close buttons
 * - Notifications list
 * - Mark all as read button
 * - Remove all read button
 */
const NotificationsDrawer = ({ onClose, isOpen }) => {
  const [showReadNotifications, setShowReadNotifications] = useState(false);

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentUser, notifications, unreadCount, readCount, isLoading } = useTracker(() => {
    // Subscribe to necessary data
    Meteor.subscribe('notificationActivities');
    Meteor.subscribe('notificationCards');
    Meteor.subscribe('notificationUsers');
    Meteor.subscribe('notificationsAttachments');
    Meteor.subscribe('notificationChecklistItems');
    Meteor.subscribe('notificationChecklists');
    Meteor.subscribe('notificationComments');
    Meteor.subscribe('notificationLists');
    Meteor.subscribe('notificationSwimlanes');

    const user = ReactiveCache.getCurrentUser();
    if (!user) return { currentUser: null, notifications: [], unreadCount: 0, readCount: 0, isLoading: false };

    const userNotifications = user.profile?.notifications || [];
    const unreadNotifications = userNotifications.filter(n => !n.read);
    const readNotifications = userNotifications.filter(n => n.read);

    return {
      currentUser: user,
      notifications: showReadNotifications ? userNotifications : unreadNotifications,
      unreadCount: unreadNotifications.length,
      readCount: readNotifications.length,
      isLoading: false,
    };
  }, [showReadNotifications]);

  const handleToggleRead = () => {
    setShowReadNotifications(!showReadNotifications);
  };

  const handleMarkAllAsRead = async () => {
    try {
      const notifications = currentUser.profile.notifications;
      for (const index in notifications) {
        if (notifications.hasOwnProperty(index) && !notifications[index].read) {
          const update = {};
          update[`profile.notifications.${index}.read`] = Date.now();
          await Meteor.call('users.update', Meteor.userId(), { $set: update });
        }
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleRemoveAllRead = async () => {
    try {
      for (const notification of currentUser.profile.notifications) {
        if (notification.read) {
          await currentUser.removeNotification(notification.activity);
        }
      }
    } catch (error) {
      console.error('Error removing read notifications:', error);
    }
  };

  const handleNotificationUpdate = (notificationId, isRead) => {
    // This would update the local state if needed
    console.log('Notification updated:', notificationId, isRead);
  };

  const handleNotificationRemove = async (activityId) => {
    try {
      await currentUser.removeNotification(activityId);
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  };

  const renderHeader = () => (
    <div className="header">
      <button 
        className="toggle-read"
        onClick={handleToggleRead}
      >
        {showReadNotifications ? t('filter-by-unread') : t('view-all')}
      </button>
      
      <h5>
        {t('notifications')}
        {unreadCount > 0 && `(${unreadCount})`}
      </h5>
      
      <button 
        className="fa fa-times-thin close"
        onClick={onClose}
        title={t('close')}
      />
    </div>
  );

  const renderNotificationsList = () => (
    <ul className="notifications">
      {notifications.map((notification, index) => (
        <Notification
          key={`${notification.activityData?._id}-${index}`}
          notification={notification}
          index={index}
          onUpdate={handleNotificationUpdate}
          onRemove={handleNotificationRemove}
        />
      ))}
      
      {notifications.length === 0 && (
        <li className="no-notifications">
          <p className="text-muted">
            {showReadNotifications ? t('no-notifications') : t('no-unread-notifications')}
          </p>
        </li>
      )}
    </ul>
  );

  const renderActions = () => (
    <div className="notifications-actions">
      {unreadCount > 0 && (
        <button 
          className="all-read"
          onClick={handleMarkAllAsRead}
        >
          {t('mark-all-as-read')}
        </button>
      )}
      
      {showReadNotifications && readCount > 0 && (
        <button 
          className="remove-read"
          onClick={handleRemoveAllRead}
        >
          <i className="fa fa-trash"></i>
          {t('remove-all-read')}
        </button>
      )}
    </div>
  );

  if (!isOpen) {
    return null;
  }

  if (isLoading) {
    return (
      <section id="notifications-drawer" className="loading">
        <div className="drawer-loading">
          <i className="fa fa-spinner fa-spin"></i>
          {t('loading')}
        </div>
      </section>
    );
  }

  return (
    <section 
      id="notifications-drawer" 
      className={showReadNotifications ? 'show-read' : ''}
    >
      {renderHeader()}
      {renderNotificationsList()}
      {renderActions()}
    </section>
  );
};

export default NotificationsDrawer;
