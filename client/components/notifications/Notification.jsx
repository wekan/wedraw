import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { ReactiveCache } from '/imports/reactiveCache';

// Import components
import NotificationIcon from './NotificationIcon';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * Notification Component
 * 
 * Replaces the original Jade notification template with a React component.
 * This component displays individual notifications with:
 * - Read/unread status
 * - Activity type icons
 * - Activity details
 * - Remove functionality
 * 
 * Original Jade template had:
 * - Read status checkbox
 * - Notification icon based on activity type
 * - Activity details display
 * - Remove button for read notifications
 */
const Notification = ({ notification, index, onUpdate, onRemove }) => {
  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentUser, activity } = useTracker(() => {
    return {
      currentUser: ReactiveCache.getCurrentUser(),
      activity: ReactiveCache.getActivity(notification.activityData?._id),
    };
  }, [notification.activityData?._id]);

  const handleReadStatusToggle = async () => {
    try {
      const update = {};
      update[`profile.notifications.${index}.read`] = notification.read
        ? null
        : Date.now();
      
      await Meteor.call('users.update', Meteor.userId(), { $set: update });
      
      if (onUpdate) {
        onUpdate(notification._id, !notification.read);
      }
    } catch (error) {
      console.error('Error updating notification status:', error);
    }
  };

  const handleRemove = async () => {
    try {
      if (onRemove) {
        await onRemove(notification.activityData._id);
      } else {
        // Default behavior
        await currentUser.removeNotification(notification.activityData._id);
      }
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  };

  const renderReadStatus = () => (
    <div className="read-status">
      <div 
        className={`materialCheckBox ${notification.read ? 'is-checked' : ''}`}
        onClick={handleReadStatusToggle}
        title={notification.read ? t('mark-as-unread') : t('mark-as-read')}
      >
        {notification.read && <i className="fa fa-check"></i>}
      </div>
      
      <NotificationIcon 
        activityType={activity?.activityType || 'unknown'} 
      />
    </div>
  );

  const renderActivityDetails = () => (
    <div className="details">
      {/* This would integrate with the existing activity component */}
      <div className="activity-content">
        <span className="activity-text">
          {activity?.description || t('activity-description-unavailable')}
        </span>
        
        {activity?.userId && (
          <span className="activity-user">
            {t('by')} {ReactiveCache.getUser(activity.userId)?.username || t('unknown-user')}
          </span>
        )}
        
        {activity?.createdAt && (
          <span className="activity-time">
            {new Date(activity.createdAt).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );

  const renderRemoveButton = () => {
    if (!notification.read) return null;

    return (
      <div className="remove">
        <a 
          className="fa fa-trash"
          onClick={handleRemove}
          title={t('remove-notification')}
        />
      </div>
    );
  };

  return (
    <li className={`notification ${notification.read ? 'read' : ''}`}>
      {renderReadStatus()}
      {renderActivityDetails()}
      {renderRemoveButton()}
    </li>
  );
};

export default Notification;
