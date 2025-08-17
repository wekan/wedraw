import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

const Minicard = ({ card, currentBoard, onOpenDetails }) => {
  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const {
    currentUser,
    canModifyCard,
    isTouchScreenOrShowDesktopDragHandles,
    cover,
    labels,
    customFieldsWD,
    parentCard,
    isLinkedCard,
    isLinkedBoard,
    getArchived
  } = useTracker(() => {
    return {
      currentUser: Meteor.user(),
      canModifyCard: card.canModifyCard || false,
      isTouchScreenOrShowDesktopDragHandles: card.isTouchScreenOrShowDesktopDragHandles || false,
      cover: card.cover,
      labels: card.labels || [],
      customFieldsWD: card.customFieldsWD || [],
      parentCard: card.parentCard,
      isLinkedCard: card.isLinkedCard || false,
      isLinkedBoard: card.isLinkedBoard || false,
      getArchived: card.getArchived || false
    };
  }, [card]);

  const handleOpenDetails = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onOpenDetails) {
      onOpenDetails(card);
    }
  };

  const getCardNumber = () => {
    return card.getCardNumber || card.cardNumber || '';
  };

  const getTitle = () => {
    return card.getTitle || card.title || '';
  };

  const getReceived = () => {
    return card.getReceived || card.receivedAt;
  };

  const getStart = () => {
    return card.getStart || card.startAt;
  };

  const getDue = () => {
    return card.getDue || card.dueAt;
  };

  const getEnd = () => {
    return card.getEnd || card.endAt;
  };

  const getSpentTime = () => {
    return card.getSpentTime || card.spentTime;
  };

  const parentString = (separator) => {
    if (!parentCard) return '';
    // This would need to be implemented based on the parent card hierarchy
    return parentCard.title || '';
  };

  const parentCardName = () => {
    if (!parentCard) return '';
    return parentCard.title || '';
  };

  const formattedCurrencyCustomFieldValue = (definition) => {
    // This would need to be implemented based on the custom field value formatting
    return card.customFields?.[definition._id] || '';
  };

  const formattedStringtemplateCustomFieldValue = (definition) => {
    // This would need to be implemented based on the custom field value formatting
    return card.customFields?.[definition._id] || '';
  };

  const renderCustomField = (customField) => {
    const { definition, trueValue, value } = customField;
    
    if (!definition.showOnCard || !trueValue) {
      return null;
    }

    if (definition.showLabelOnMiniCard) {
      return (
        <div key={definition._id} className="minicard-custom-field">
          <div className="minicard-custom-field-item">
            {definition.name}
          </div>
          <div className="minicard-custom-field-item">
            {definition.type === 'currency' && (
              <span>{formattedCurrencyCustomFieldValue(definition)}</span>
            )}
            {definition.type === 'date' && (
              <div className="date">
                {/* MinicardCustomFieldDate component would go here */}
                <span>{trueValue}</span>
              </div>
            )}
            {definition.type === 'checkbox' && (
              <div className={`materialCheckBox ${value ? 'is-checked' : ''}`}></div>
            )}
            {definition.type === 'stringtemplate' && (
              <span>{formattedStringtemplateCustomFieldValue(definition)}</span>
            )}
            {!['currency', 'date', 'checkbox', 'stringtemplate'].includes(definition.type) && (
              <span>{trueValue}</span>
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div key={definition._id} className="minicard-custom-field">
          <div className="minicard-custom-field-item-fullwidth">
            {definition.type === 'currency' && (
              <span>{formattedCurrencyCustomFieldValue(definition)}</span>
            )}
            {definition.type === 'date' && (
              <div className="date">
                {/* MinicardCustomFieldDate component would go here */}
                <span>{trueValue}</span>
              </div>
            )}
            {definition.type === 'checkbox' && (
              <div className={`materialCheckBox ${value ? 'is-checked' : ''}`}></div>
            )}
            {definition.type === 'stringtemplate' && (
              <span>{formattedStringtemplateCustomFieldValue(definition)}</span>
            )}
            {!['currency', 'date', 'checkbox', 'stringtemplate'].includes(definition.type) && (
              <span>{trueValue}</span>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <div 
      className={`minicard nodragscroll ${isLinkedCard ? 'linked-card' : ''} ${isLinkedBoard ? 'linked-board' : ''} ${card.colorClass ? `minicard-${card.colorClass}` : ''}`}
    >
      {/* Card Actions */}
      {canModifyCard && (
        <>
          {isTouchScreenOrShowDesktopDragHandles ? (
            <>
              <a 
                className="fa fa-navicon minicard-details-menu-with-handle js-open-minicard-details-menu"
                title={t('cardDetailsActionsPopup-title')}
                onClick={handleOpenDetails}
              ></a>
              <div className="handle">
                <div className="fa fa-arrows"></div>
              </div>
            </>
          ) : (
            <a 
              className="fa fa-navicon minicard-details-menu js-open-minicard-details-menu"
              title={t('cardDetailsActionsPopup-title')}
              onClick={handleOpenDetails}
            ></a>
          )}
        </>
      )}

      {/* Dates */}
      <div className="dates">
        {getReceived && !getStart && !getDue && !getEnd && (
          <div className="date">
            {/* MinicardReceivedDate component would go here */}
            <span>Received: {new Date(getReceived).toLocaleDateString()}</span>
          </div>
        )}
        {getStart && (
          <div className="date">
            {/* MinicardStartDate component would go here */}
            <span>Start: {new Date(getStart).toLocaleDateString()}</span>
          </div>
        )}
        {getDue && (
          <div className="date">
            {/* MinicardDueDate component would go here */}
            <span>Due: {new Date(getDue).toLocaleDateString()}</span>
          </div>
        )}
        {getEnd && (
          <div className="date">
            {/* MinicardEndDate component would go here */}
            <span>End: {new Date(getEnd).toLocaleDateString()}</span>
          </div>
        )}
        {getSpentTime && (
          <div className="date">
            {/* CardSpentTime component would go here */}
            <span>Spent: {getSpentTime}</span>
          </div>
        )}
      </div>

      {/* Cover Image */}
      {cover && currentBoard?.allowsCoverAttachmentOnMinicard && (
        <div 
          className="minicard-cover"
          style={{ backgroundImage: `url('${cover.link('original')}?dummyReloadAfterSessionEstablished=${Session.get('sess')}')` }}
        ></div>
      )}

      {/* Card Title */}
      <div className="minicard-title">
        {/* Parent Task Prefix */}
        {currentBoard?.presentParentTask === 'prefix-with-full-path' && (
          <div className="parent-prefix">
            {parentString(' > ')}
          </div>
        )}
        {currentBoard?.presentParentTask === 'prefix-with-parent' && (
          <div className="parent-prefix">
            {parentCardName()}
          </div>
        )}

        {/* Linked Icons */}
        {isLinkedBoard && (
          <a className="js-linked-link">
            <span className="linked-icon fa fa-folder"></span>
          </a>
        )}
        {isLinkedCard && (
          <a className="js-linked-link">
            <span className="linked-icon fa fa-id-card"></span>
          </a>
        )}
        {getArchived && (
          <span className="linked-icon linked-archived fa fa-archive"></span>
        )}

        {/* Card Content */}
        <div>
          {currentBoard?.allowsCardNumber && (
            <span className="card-number">
              ##{getCardNumber()}
            </span>
          )}
          {getTitle()}
        </div>

        {/* Parent Task Subtext */}
        {currentBoard?.presentParentTask === 'subtext-with-full-path' && (
          <div className="parent-subtext">
            {parentString(' > ')}
          </div>
        )}
        {currentBoard?.presentParentTask === 'subtext-with-parent' && (
          <div className="parent-subtext">
            {parentCardName()}
          </div>
        )}
      </div>

      {/* Labels */}
      {labels && labels.length > 0 && (
        <div className={`minicard-labels ${currentBoard?.hiddenMinicardLabelText ? 'minicard-labels-no-text' : ''}`}>
          {labels.map((label) => (
            <span 
              key={label._id} 
              className={`js-card-label card-label card-label-${label.color}`} 
              title={label.name}
            >
              {!currentBoard?.hiddenMinicardLabelText ? (
                <span>{label.name}</span>
              ) : (
                <div className={`minicard-label card-label-${label.color}`} title={label.name}></div>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Custom Fields */}
      <div className="minicard-custom-fields">
        {customFieldsWD.map(renderCustomField)}
      </div>

      {/* Members */}
      {card.members && card.members.length > 0 && (
        <div className="minicard-members">
          {card.members.map((member) => (
            <div key={member._id} className="minicard-member">
              {/* UserAvatar component would go here */}
              <span className="user-avatar">{member.username}</span>
            </div>
          ))}
        </div>
      )}

      {/* Attachments */}
      {card.attachments && card.attachments.length > 0 && (
        <div className="minicard-attachments">
          <span className="fa fa-paperclip"></span>
          <span className="attachment-count">{card.attachments.length}</span>
        </div>
      )}

      {/* Comments */}
      {card.commentCount > 0 && (
        <div className="minicard-comments">
          <span className="fa fa-comment"></span>
          <span className="comment-count">{card.commentCount}</span>
        </div>
      )}

      {/* Subtasks */}
      {card.subtasks && card.subtasks.length > 0 && (
        <div className="minicard-subtasks">
          <span className="fa fa-tasks"></span>
          <span className="subtask-count">
            {card.subtasks.filter(st => st.isFinished).length}/{card.subtasks.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default Minicard;
