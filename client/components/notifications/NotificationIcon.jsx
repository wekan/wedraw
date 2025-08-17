import React from 'react';

/**
 * NotificationIcon Component
 * 
 * Replaces the original Jade notificationIcon template with a React component.
 * This component renders appropriate icons for different activity types in notifications.
 * 
 * Original Jade template had:
 * - Activity type-based icon selection
 * - FontAwesome icons for different activities
 * - Tooltips for accessibility
 * - Fallback icon for unknown activity types
 */
const NotificationIcon = ({ activityType, className = '' }) => {
  const getIconForActivityType = (type) => {
    // Attachment activities
    if (['deleteAttachment', 'addAttachment'].includes(type)) {
      return { icon: 'fa-paperclip', title: 'attachment' };
    }
    
    // Board activities
    if (['createBoard', 'importBoard'].includes(type)) {
      return { icon: 'fa-chalkboard', title: 'board' };
    }
    
    // Card activities
    if (['createCard', 'importCard', 'moveCard', 'moveCardBoard', 'archivedCard', 'restoredCard'].includes(type)) {
      return { icon: 'fa-clone', title: 'card' };
    }
    
    // Checklist activities
    if (['addChecklist', 'removedChecklist', 'completeChecklist', 'uncompleteChecklist'].includes(type)) {
      return { icon: 'fa-list', title: 'checklist' };
    }
    
    // Checklist item activities
    if (['checkedItem', 'uncheckedItem', 'addChecklistItem', 'removedChecklistItem'].includes(type)) {
      return { icon: 'fa-check-square', title: 'checklist item' };
    }
    
    // Comment activities
    if (['addComment'].includes(type)) {
      return { icon: 'fa-comment-o', title: 'comment' };
    }
    
    // Custom field activities
    if (['createCustomField', 'setCustomField', 'unsetCustomField'].includes(type)) {
      return { icon: 'fa-code', title: 'custom field' };
    }
    
    // Label activities
    if (['addedLabel', 'removedLabel'].includes(type)) {
      return { icon: 'fa-tag', title: 'label' };
    }
    
    // Date activities
    if (['a-startAt', 'a-receivedAt', 'a-dueAt', 'a-endAt'].includes(type)) {
      return { icon: 'fa-clock-o', title: 'date' };
    }
    
    // List activities
    if (['createList', 'removeList', 'archivedList', 'importList'].includes(type)) {
      return { icon: 'fa-columns', title: 'list' };
    }
    
    // Member activities
    if (['unjoinMember', 'addBoardMember', 'joinMember', 'removeBoardMember'].includes(type)) {
      return { icon: 'fa-user', title: 'member' };
    }
    
    // Swimlane activities
    if (['createSwimlane', 'archivedSwimlane'].includes(type)) {
      return { icon: 'fa-th-large', title: 'swimlane' };
    }
    
    // Fallback for unknown activity types
    return { icon: 'fa-bug', title: `can't find icon for ${type}` };
  };

  const { icon, title } = getIconForActivityType(activityType);
  const iconClasses = `fa ${icon} activity-type ${className}`.trim();

  return (
    <i className={iconClasses} title={title} />
  );
};

export default NotificationIcon;
