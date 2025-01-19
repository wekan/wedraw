import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import { ReactiveCache } from '/imports/reactiveCache';
import { TAPi18n } from '/imports/i18n';
import moment from 'moment';
import DOMPurify from 'dompurify';
import UserAvatar from '../UserAvatar';
import Viewer from '../Viewer';

// Activity type components
const ActivityContent = ({ activity, mode, card }) => {
  const getActivityContent = () => {
    switch (activity.activityType) {
      case 'deleteAttachment':
        return <>{TAPi18n.__('activity-delete-attach', { cardLink: createCardLink(card) })}</>;
        
      case 'addAttachment':
        return (
          <>
            {TAPi18n.__('activity-attached', {
              attachmentLink: createAttachmentLink(activity),
              cardLink: createCardLink(card)
            })}
            {mode !== 'board' && activity.attachment?.isImage && (
              <img className="attachment-image-preview" src={activity.attachment.url} />
            )}
          </>
        );
        
      case 'createBoard':
        return <>{TAPi18n.__('activity-created', { boardLink: createBoardLink(activity.board()) })}</>;
      
      // Add all other activity types from jade template...
    }
  };

  return getActivityContent();
};

export const Activities = ({ mode = 'board', card }) => {
  const showActivities = useTracker(() => {
    if (mode === 'linkedcard' || mode === 'linkedboard') {
      return Utils.getCurrentCard()?.showActivities ?? false;
    } 
    if (mode === 'card') {
      return card?.showActivities ?? false;
    }
    return Utils.getCurrentBoard()?.showActivities ?? false;
  });

  if (!showActivities) return null;
  
  return (
    <div className="activities js-sidebar-activities">
      {mode === 'board' ? (
        <BoardActivities />
      ) : (
        <CardActivities card={card} mode={mode} />
      )}
    </div>
  );
};

const Activity = ({ activity, mode, card }) => {
  return (
    <div className="activity" data-id={activity._id}>
      <UserAvatar userId={activity.user._id} />
      <p className="activity-desc">
        <span className="activity-member">
          <MemberName user={activity.user} />
        </span>
        <ActivityContent 
          activity={activity}
          mode={mode}
          card={card}
        />
        <div className="activity-meta" title={activity.createdAt}>
          {moment(activity.createdAt).fromNow()}
        </div>
      </p>
    </div>
  );
};

// Utility components and functions follow...

const createCardLink = (card, board) => {
  if (!card) return '';
  let text = card.title;
  if (board) text = `${board} > ${text}`;
  return card ? (
    <a href={card.originRelativeUrl()} className="action-card">
      {DOMPurify.sanitize(text, { ALLOW_UNKNOWN_PROTOCOLS: true })}
    </a>
  ) : null;
};

const createBoardLink = (board, list) => {
  let text = board.title;
  if (list) text += `: ${list}`;
  return board ? (
    <a href={board.originRelativeUrl()} className="action-board">
      {DOMPurify.sanitize(text, { ALLOW_UNKNOWN_PROTOCOLS: true })}
    </a>
  ) : null;
};

const BoardActivities = () => {
  const currentBoard = useTracker(() => {
    return ReactiveCache.getBoard(Session.get('currentBoard')); 
  });

  return currentBoard?.activities?.map(activity => (
    <Activity 
      key={activity._id}
      activity={activity}
      mode="board"
    />
  ));
};

const CardActivities = ({ activities, card, mode }) => {
  return activities.map(activity => (
    <Activity 
      key={activity._id}
      activity={activity}
      card={card}
      mode={mode} 
    />
  ));
};