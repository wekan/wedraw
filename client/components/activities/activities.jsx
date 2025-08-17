import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { ReactiveCache } from '/imports/reactiveCache';
import { Utils } from '/imports/utils';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * Activities Component
 * 
 * Replaces the original Blaze activities component with a React component.
 * This component provides comprehensive activity display for boards and cards,
 * including various activity types like attachments, board operations, card operations,
 * checklists, comments, dates, custom fields, labels, lists, members, and swimlanes.
 * 
 * Original Blaze component had:
 * - activities: Main activities container with conditional rendering
 * - boardActivities: Board-specific activities display
 * - cardActivities: Card-specific activities display
 * - activity: Individual activity item with type-specific rendering
 */
const Activities = ({ 
  mode = 'board',
  card = null,
  showActivities = true,
  onUpdate 
}) => {
  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentBoard, currentUser, activities } = useTracker(() => {
    const user = ReactiveCache.getCurrentUser();
    if (!user) return {
      currentUser: null,
      currentBoard: null,
      activities: []
    };

    const board = Utils.getCurrentBoard();
    let boardActivities = [];
    let cardActivities = [];

    if (board) {
      boardActivities = board.activities || [];
    }

    if (card) {
      cardActivities = card.activities || [];
    }

    return {
      currentUser: user,
      currentBoard: board,
      activities: mode === 'board' ? boardActivities : cardActivities
    };
  }, [mode, card]);

  if (!showActivities) {
    return null;
  }

  return (
    <div className="activities js-sidebar-activities">
      {mode === 'board' ? (
        <BoardActivities 
          activities={activities}
          currentBoard={currentBoard}
          mode={mode}
          onUpdate={onUpdate}
        />
      ) : (
        <CardActivities 
          activities={activities}
          card={card}
          mode={mode}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
};

/**
 * BoardActivities Component
 * 
 * Displays board-specific activities
 */
const BoardActivities = ({ activities, currentBoard, mode, onUpdate }) => {
  const t = (key) => enTranslations[key] || key;

  if (!activities || activities.length === 0) {
    return (
      <div className="no-activities">
        <p>{t('no-activities')}</p>
      </div>
    );
  }

  return (
    <div className="board-activities js-board-activities">
      {activities.map(activityData => (
        <Activity
          key={activityData._id}
          activity={activityData}
          card={null}
          mode={mode}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
};

/**
 * CardActivities Component
 * 
 * Displays card-specific activities
 */
const CardActivities = ({ activities, card, mode, onUpdate }) => {
  const t = (key) => enTranslations[key] || key;

  if (!activities || activities.length === 0) {
    return (
      <div className="no-activities">
        <p>{t('no-activities')}</p>
      </div>
    );
  }

  return (
    <div className="card-activities js-card-activities">
      {activities.map(activityData => (
        <Activity
          key={activityData._id}
          activity={activityData}
          card={card}
          mode={mode}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
};

/**
 * Activity Component
 * 
 * Individual activity item with type-specific rendering
 */
const Activity = ({ activity, card, mode, onUpdate }) => {
  const t = (key) => enTranslations[key] || key;

  // Track reactive data for activity
  const { user, attachment, checklist, checklistItem, comment } = useTracker(() => {
    if (!activity) return {
      user: null,
      attachment: null,
      checklist: null,
      checklistItem: null,
      comment: null
    };

    const userData = activity.user ? ReactiveCache.getUser(activity.user._id) : null;
    const attachmentData = activity.attachment || null;
    const checklistData = activity.checklist || null;
    const checklistItemData = activity.checklistItem || null;
    const commentData = activity.comment || null;

    return {
      user: userData,
      attachment: attachmentData,
      checklist: checklistData,
      checklistItem: checklistItemData,
      comment: commentData
    };
  }, [activity]);

  // Render activity description based on type
  const renderActivityDescription = () => {
    const activityType = activity.activityType;

    switch (activityType) {
      // Attachment activities
      case 'deleteAttachment':
        return (
          <span>
            {t('activity-delete-attach')} {renderCardLink()}.
          </span>
        );

      case 'addAttachment':
        return (
          <span>
            {t('activity-attached')} {renderAttachmentLink()} {renderCardLink()}.
            {mode !== 'board' && attachment?.isImage && (
              <img 
                className="attachment-image-preview" 
                src={attachment.url} 
                alt={t('attachment-preview')}
              />
            )}
          </span>
        );

      // Board activities
      case 'createBoard':
        return (
          <span>
            {t('activity-created')} {renderBoardLabelLink()}.
          </span>
        );

      case 'importBoard':
        return (
          <span>
            {t('activity-imported-board')} {renderBoardLabelLink()} {renderSourceLink()}.
          </span>
        );

      case 'addBoardMember':
        return (
          <span>
            {t('activity-added')} {renderMemberLink()} {renderBoardLabelLink()}.
          </span>
        );

      case 'removeBoardMember':
        return (
          <span>
            {t('activity-excluded')} {renderMemberLink()} {renderBoardLabelLink()}.
          </span>
        );

      // Card activities
      case 'createCard':
        if (mode === 'card') {
          return (
            <span>
              {t('activity-added')} {renderCardLabelLink()} {renderSanitizedText(activity.listName)}.
            </span>
          );
        } else {
          return (
            <span>
              {t('activity-added')} {renderCardLabelLink()} {renderBoardLabelLink()}.
            </span>
          );
        }

      case 'importCard':
        return (
          <span>
            {t('activity-imported')} {renderCardLink()} {renderBoardLabelLink()} {renderSourceLink()}.
          </span>
        );

      case 'moveCard':
        return (
          <span>
            {t('activity-moved')} {renderCardLabelLink()} {renderSanitizedText(activity.oldList?.title)} {renderSanitizedText(activity.list?.title)}.
          </span>
        );

      case 'moveCardBoard':
        return (
          <span>
            {t('activity-moved')} {renderCardLink()} {renderSanitizedText(activity.oldBoardName)} {renderSanitizedText(activity.boardName)}.
          </span>
        );

      case 'archivedCard':
        return (
          <span>
            {t('activity-archived')} {renderCardLink()}.
          </span>
        );

      case 'restoredCard':
        return (
          <span>
            {t('activity-sent')} {renderCardLink()} {renderBoardLabelLink()}.
          </span>
        );

      // Checklist activities
      case 'addChecklist':
        return (
          <span>
            {t('activity-checklist-added')} {renderCardLink()}.
            {mode === 'card' ? (
              <div className="activity-checklist">
                {renderViewer(checklist?.title)}
              </div>
            ) : (
              <a className="activity-checklist" href={activity.card?.originRelativeUrl}>
                {renderViewer(checklist?.title)}
              </a>
            )}
          </span>
        );

      case 'removedChecklist':
        return (
          <span>
            {t('activity-checklist-removed')} {renderCardLink()}.
          </span>
        );

      case 'completeChecklist':
        return (
          <span>
            {t('activity-checklist-completed')} {renderSanitizedText(checklist?.title)} {renderCardLink()}.
          </span>
        );

      case 'uncompleteChecklist':
        return (
          <span>
            {t('activity-checklist-uncompleted')} {renderSanitizedText(checklist?.title)} {renderCardLink()}.
          </span>
        );

      case 'checkedItem':
        return (
          <span>
            {t('activity-checked-item')} {renderSanitizedText(activity.checkItem)} {renderSanitizedText(checklist?.title)} {renderCardLink()}.
          </span>
        );

      case 'uncheckedItem':
        return (
          <span>
            {t('activity-unchecked-item')} {renderSanitizedText(activity.checkItem)} {renderSanitizedText(checklist?.title)} {renderCardLink()}.
          </span>
        );

      case 'addChecklistItem':
        return (
          <span>
            {t('activity-checklist-item-added')} {renderSanitizedText(checklist?.title)} {renderCardLink()}.
            <div className="activity-checklist" href={activity.card?.originRelativeUrl}>
              {renderViewer(checklistItem?.title)}
            </div>
          </span>
        );

      case 'removedChecklistItem':
        return (
          <span>
            {t('activity-checklist-item-removed')} {renderSanitizedText(checklist?.title)} {renderCardLink()}.
          </span>
        );

      // Comment activities
      case 'deleteComment':
        return (
          <span>
            {t('activity-deleteComment')} {activity.commentId}.
          </span>
        );

      case 'editComment':
        return (
          <span>
            {t('activity-editComment')} {activity.commentId}.
          </span>
        );

      case 'addComment':
        return (
          <span>
            {t('activity-on')} {renderCardLink()}
            <a className="activity-comment" href={activity.card?.originRelativeUrl}>
              {renderViewer(comment?.text)}
            </a>
          </span>
        );

      // Date activities
      case 'a-receivedAt':
        return (
          <span>
            {t('activity-receivedDate')} {renderSanitizedText(activity.receivedDate)} {renderCardLink()}.
          </span>
        );

      case 'a-startAt':
        return (
          <span>
            {t('activity-startDate')} {renderSanitizedText(activity.startDate)} {renderCardLink()}.
          </span>
        );

      case 'a-dueAt':
        return (
          <span>
            {t('activity-dueDate')} {renderSanitizedText(activity.dueDate)} {renderCardLink()}.
          </span>
        );

      case 'a-endAt':
        return (
          <span>
            {t('activity-endDate')} {renderSanitizedText(activity.endDate)} {renderCardLink()}.
          </span>
        );

      // Custom field activities
      case 'createCustomField':
        return (
          <span>
            {t('activity-customfield-created')} {activity.customField}.
          </span>
        );

      case 'setCustomField':
        return (
          <span>
            {t('activity-set-customfield')} {renderSanitizedText(activity.lastCustomField)} {renderSanitizedText(activity.lastCustomFieldValue)} {renderCardLink()}.
          </span>
        );

      case 'unsetCustomField':
        return (
          <span>
            {t('activity-unset-customfield')} {renderSanitizedText(activity.lastCustomField)} {renderCardLink()}.
          </span>
        );

      // Label activities
      case 'addedLabel':
        return (
          <span>
            {t('activity-added-label')} {renderSanitizedText(activity.lastLabel)} {renderCardLink()}.
          </span>
        );

      case 'removedLabel':
        return (
          <span>
            {t('activity-removed-label')} {renderSanitizedText(activity.lastLabel)} {renderCardLink()}.
          </span>
        );

      // List activities
      case 'createList':
        if (mode !== 'card') {
          return (
            <span>
              {t('activity-added')} {renderListLabel()} {renderBoardLabelLink()}.
            </span>
          );
        }
        break;

      case 'importList':
        if (mode !== 'card') {
          return (
            <span>
              {t('activity-imported')} {renderListLabel()} {renderBoardLabelLink()} {renderSourceLink()}.
            </span>
          );
        }
        break;

      case 'removeList':
        if (mode !== 'card') {
          return (
            <span>
              {t('activity-removed')} {renderSanitizedText(activity.title)} {renderBoardLabelLink()}.
            </span>
          );
        }
        break;

      case 'archivedList':
        if (mode !== 'card') {
          return (
            <span>
              {t('activity-archived')} {renderListLabel()}.
            </span>
          );
        }
        break;

      case 'changedListTitle':
        if (mode !== 'card') {
          return (
            <span>
              {t('activity-changedListTitle')} {renderListLabel()} {renderBoardLabelLink()}.
            </span>
          );
        }
        break;

      // Member activities
      case 'joinMember':
        if (currentUser?._id === activity.member?._id) {
          return (
            <span>
              {t('activity-joined')} {renderCardLink()}.
            </span>
          );
        } else {
          return (
            <span>
              {t('activity-added')} {renderMemberLink()} {renderCardLink()}.
            </span>
          );
        }

      case 'unjoinMember':
        if (currentUser?._id === activity.member?._id) {
          return (
            <span>
              {t('activity-unjoined')} {renderCardLink()}.
            </span>
          );
        } else {
          return (
            <span>
              {t('activity-removed')} {renderMemberLink()} {renderCardLink()}.
            </span>
          );
        }

      // Swimlane activities
      case 'createSwimlane':
        return (
          <span>
            {t('activity-added')} {renderSanitizedText(activity.swimlane?.title)} {renderBoardLabelLink()}.
          </span>
        );

      case 'archivedSwimlane':
        return (
          <span>
            {t('activity-archived')} {renderSanitizedText(activity.swimlane?.title)}.
          </span>
        );

      default:
        return (
          <span>
            {t(activityType)} {activity.currentData?.timeValue}
          </span>
        );
    }

    return null;
  };

  // Helper render functions
  const renderUserAvatar = (userId) => {
    if (!userId) return null;
    const user = ReactiveCache.getUser(userId);
    if (!user) return null;

    const initials = user.profile?.initials || user.username?.substring(0, 2) || 'U';
    const avatarUrl = user.profile?.avatarUrl;

    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt={user.profile?.fullname || user.username}
          className="user-avatar"
        />
      );
    }

    return (
      <div className="user-avatar-initials">
        {initials.toUpperCase()}
      </div>
    );
  };

  const renderMemberName = (user) => {
    if (!user) return 'Unknown User';
    return user.profile?.fullname || user.username;
  };

  const renderCardLink = () => {
    if (!card) return t('card');
    return (
      <a href={card.originRelativeUrl} className="card-link">
        {card.title}
      </a>
    );
  };

  const renderCardLabelLink = () => {
    if (!card) return t('card');
    return (
      <a href={card.originRelativeUrl} className="card-label-link">
        {card.title}
      </a>
    );
  };

  const renderBoardLabelLink = () => {
    if (!currentBoard) return t('board');
    return (
      <a href={`/board/${currentBoard._id}/${currentBoard.slug}`} className="board-label-link">
        {currentBoard.title}
      </a>
    );
  };

  const renderAttachmentLink = () => {
    if (!attachment) return t('attachment');
    return (
      <a href={attachment.url} className="attachment-link" target="_blank" rel="noopener noreferrer">
        {attachment.name || t('attachment')}
      </a>
    );
  };

  const renderMemberLink = () => {
    if (!user) return t('member');
    return (
      <span className="member-link">
        {renderMemberName(user)}
      </span>
    );
  };

  const renderSourceLink = () => {
    if (!activity.source) return t('source');
    return (
      <a href={activity.source} className="source-link" target="_blank" rel="noopener noreferrer">
        {t('source')}
      </a>
    );
  };

  const renderListLabel = () => {
    if (!activity.list) return t('list');
    return (
      <span className="list-label">
        {activity.list.title}
      </span>
    );
  };

  const renderSanitizedText = (text) => {
    if (!text) return '';
    return (
      <span className="sanitized-text">
        {text}
      </span>
    );
  };

  const renderViewer = (content) => {
    if (!content) return '';
    return (
      <span className="viewer-content">
        {content}
      </span>
    );
  };

  // Render time information
  const renderTimeInfo = () => {
    if (activity.currentData?.timeKey) {
      return (
        <span>
          {t(activity.activityType)}
          {' '}
          <i title={activity.currentData.timeValue} className="activity-meta">
            {Utils.moment(activity.currentData.timeValue, 'LLL')}
          </i>
          {activity.currentData.timeOldValue && (
            <>
              {' '}
              {t('previous_as')}
              {' '}
              <i title={activity.currentData.timeOldValue} className="activity-meta">
                {Utils.moment(activity.currentData.timeOldValue, 'LLL')}
              </i>
              {' @'}
            </>
          )}
        </span>
      );
    } else if (activity.currentData?.timeValue) {
      return (
        <span>
          {t(activity.activityType, activity.currentData.timeValue)}
        </span>
      );
    }

    return null;
  };

  if (!activity) return null;

  return (
    <div className="activity js-activity" data-id={activity._id}>
      {renderUserAvatar(user?._id)}
      
      <p className="activity-desc">
        <span className="activity-member">
          {renderMemberName(user)}
        </span>
        {' '}
        
        {renderActivityDescription()}
        
        {renderTimeInfo()}
        
        <div title={activity.createdAt} className="activity-meta">
          {Utils.moment(activity.createdAt)}
        </div>
      </p>
    </div>
  );
};

export default Activities;