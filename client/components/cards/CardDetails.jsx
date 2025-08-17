import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { ReactiveCache } from '/imports/reactiveCache';
import moment from 'moment/min/moment-with-locales';
import { DatePicker } from '/client/lib/datepicker';
import { ALLOWED_COLORS } from '/config/const';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * CardDetails Component
 * 
 * Replaces the original Blaze cardDetails component with a React component.
 * This component manages the detailed view of a card, including:
 * - Card title and description editing
 * - Member and assignee management
 * - Voting and planning poker
 * - Custom fields integration
 * - Card actions and settings
 * - Date management
 * - Card color and styling
 * 
 * Original Blaze component had:
 * - cardDetails: Main card details component
 * - Various popup components for editing
 * - Drag and drop functionality for checklists and subtasks
 * - Voting and planning poker systems
 * - Card export functionality
 */
const CardDetails = ({ card, onClose, onUpdate }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [showActivities, setShowActivities] = useState(false);
  const [hideCheckedChecklistItems, setHideCheckedChecklistItems] = useState(false);
  const [customFieldsGrid, setCustomFieldsGrid] = useState(false);
  const [cardMaximized, setCardMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const cardElementRef = useRef(null);

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentUser, currentBoard, isBoardAdmin, isBoardMember } = useTracker(() => {
    const user = ReactiveCache.getCurrentUser();
    if (!user || !card) return { 
      currentUser: null, 
      currentBoard: null, 
      isBoardAdmin: false, 
      isBoardMember: false 
    };

    const board = ReactiveCache.getBoard(card.boardId);
    const adminStatus = board ? board.hasAdmin(user._id) : false;
    const memberStatus = board ? board.hasMember(user._id) : false;

    return {
      currentUser: user,
      currentBoard: board,
      isBoardAdmin: adminStatus,
      isBoardMember: memberStatus,
    };
  }, [card]);

  // Subscribe to unsaved edits
  useEffect(() => {
    const subscription = Meteor.subscribe('unsaved-edits');
    return () => {
      subscription.stop();
    };
  }, []);

  // Handle card loaded state
  useEffect(() => {
    const handleTransitionEnd = () => setIsLoaded(true);
    const handleAnimationEnd = () => setIsLoaded(true);

    const cardElement = cardElementRef.current;
    if (cardElement) {
      cardElement.addEventListener('transitionend', handleTransitionEnd);
      cardElement.addEventListener('animationend', handleAnimationEnd);
    }

    return () => {
      if (cardElement) {
        cardElement.removeEventListener('transitionend', handleTransitionEnd);
        cardElement.removeEventListener('animationend', handleAnimationEnd);
      }
    };
  }, []);

  // Handle mouse events for dragging
  const handleMouseDown = useCallback(() => {
    setIsMouseDown(true);
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(() => {
    if (isMouseDown) {
      setIsDragging(true);
    }
  }, [isMouseDown]);

  const handleMouseUp = useCallback(() => {
    setIsMouseDown(false);
    setIsDragging(false);
  }, []);

  // Handle card close
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      // Navigate back to board
      // Utils.goBoardId(card.boardId);
    }
  }, [card, onClose]);

  // Handle card title update
  const handleTitleUpdate = useCallback(async (newTitle) => {
    try {
      if (onUpdate) {
        await onUpdate('title', newTitle.trim());
      } else {
        await Meteor.call('cards.update', card._id, {
          title: newTitle.trim(),
        });
      }
    } catch (err) {
      console.error('Error updating card title:', err);
    }
  }, [card, onUpdate]);

  // Handle card description update
  const handleDescriptionUpdate = useCallback(async (newDescription) => {
    try {
      if (onUpdate) {
        await onUpdate('description', newDescription);
      } else {
        await Meteor.call('cards.update', card._id, {
          description: newDescription,
        });
      }
    } catch (err) {
      console.error('Error updating card description:', err);
    }
  }, [card, onUpdate]);

  // Handle card assigner update
  const handleAssignerUpdate = useCallback(async (newAssigner) => {
    try {
      if (onUpdate) {
        await onUpdate('assignedBy', newAssigner.trim());
      } else {
        await Meteor.call('cards.update', card._id, {
          assignedBy: newAssigner.trim(),
        });
      }
    } catch (err) {
      console.error('Error updating card assigner:', err);
    }
  }, [card, onUpdate]);

  // Handle card requester update
  const handleRequesterUpdate = useCallback(async (newRequester) => {
    try {
      if (onUpdate) {
        await onUpdate('requestedBy', newRequester.trim());
      } else {
        await Meteor.call('cards.update', card._id, {
          requestedBy: newRequester.trim(),
        });
      }
    } catch (err) {
      console.error('Error updating card requester:', err);
    }
  }, [card, onUpdate]);

  // Handle card sort update
  const handleSortUpdate = useCallback(async (newSort) => {
    try {
      const sortValue = parseFloat(newSort.trim());
      if (!Number.isNaN(sortValue)) {
        if (onUpdate) {
          await onUpdate('sort', sortValue);
        } else {
          // Move card to new position
          // card.move(card.boardId, card.swimlaneId, card.listId, sortValue);
        }
      }
    } catch (err) {
      console.error('Error updating card sort:', err);
    }
  }, [card, onUpdate]);

  // Handle list change
  const handleListChange = useCallback(async (newListId) => {
    try {
      if (onUpdate) {
        await onUpdate('listId', newListId);
      } else {
        // Move card to new list
        // const minOrder = card.getMinSort(newListId, card.swimlaneId);
        // card.move(card.boardId, card.swimlaneId, newListId, minOrder - 1);
      }
    } catch (err) {
      console.error('Error updating card list:', err);
    }
  }, [card, onUpdate]);

  // Handle voting
  const handleVote = useCallback(async (forIt) => {
    try {
      const currentVoteState = card.voteState();
      let newState = null;
      
      if (
        currentVoteState === null ||
        (currentVoteState === false && forIt) ||
        (currentVoteState === true && !forIt)
      ) {
        newState = forIt;
      }
      
      if (onUpdate) {
        await onUpdate('vote', { userId: currentUser._id, state: newState });
      } else {
        // card.setVote(currentUser._id, newState);
      }
    } catch (err) {
      console.error('Error updating vote:', err);
    }
  }, [card, currentUser, onUpdate]);

  // Handle planning poker
  const handlePoker = useCallback(async (voteValue) => {
    try {
      if (onUpdate) {
        await onUpdate('poker', { userId: currentUser._id, vote: voteValue });
      } else {
        // card.setPoker(currentUser._id, voteValue);
      }
    } catch (err) {
      console.error('Error updating poker vote:', err);
    }
  }, [card, currentUser, onUpdate]);

  // Handle poker finish
  const handlePokerFinish = useCallback(async () => {
    try {
      const now = moment().format('YYYY-MM-DD HH:mm');
      if (onUpdate) {
        await onUpdate('pokerEnd', now);
      } else {
        // card.setPokerEnd(now);
      }
    } catch (err) {
      console.error('Error finishing poker:', err);
    }
  }, [card, onUpdate]);

  // Handle poker replay
  const handlePokerReplay = useCallback(async () => {
    try {
      if (onUpdate) {
        await onUpdate('pokerReplay', true);
      } else {
        // card.replayPoker();
        // card.unsetPokerEnd();
        // card.unsetPokerEstimation();
      }
    } catch (err) {
      console.error('Error replaying poker:', err);
    }
  }, [card, onUpdate]);

  // Handle poker estimation
  const handlePokerEstimation = useCallback(async (estimation) => {
    try {
      if (estimation && estimation !== '') {
        const estimationValue = parseInt(estimation, 10);
        if (onUpdate) {
          await onUpdate('pokerEstimation', estimationValue);
        } else {
          // card.setPokerEstimation(estimationValue);
        }
      }
    } catch (err) {
      console.error('Error updating poker estimation:', err);
    }
  }, [card, onUpdate]);

  // Handle toggle activities
  const handleToggleActivities = useCallback(() => {
    setShowActivities(prev => !prev);
  }, []);

  // Handle toggle checked checklist items
  const handleToggleCheckedChecklistItems = useCallback(() => {
    setHideCheckedChecklistItems(prev => !prev);
  }, []);

  // Handle toggle custom fields grid
  const handleToggleCustomFieldsGrid = useCallback(async () => {
    try {
      await Meteor.call('toggleCustomFieldsGrid');
      setCustomFieldsGrid(prev => !prev);
    } catch (err) {
      console.error('Error toggling custom fields grid:', err);
    }
  }, []);

  // Handle toggle card maximized
  const handleToggleCardMaximized = useCallback(async () => {
    try {
      await Meteor.call('toggleCardMaximized');
      setCardMaximized(prev => !prev);
    } catch (err) {
      console.error('Error toggling card maximized:', err);
    }
  }, []);

  // Handle copy link
  const handleCopyLink = useCallback(async (event) => {
    event.preventDefault();
    try {
      await navigator.clipboard.writeText(event.target.href);
      // Show copied tooltip
      // Utils.showCopied(promise, tooltip);
    } catch (err) {
      console.error('Error copying link:', err);
    }
  }, []);

  // Handle open card details menu
  const handleOpenCardDetailsMenu = useCallback(() => {
    // TODO: Open card details actions popup
    // Popup.open('cardDetailsActions');
  }, []);

  // Handle member click
  const handleMemberClick = useCallback((memberId) => {
    // TODO: Open card member popup
    // Popup.open('cardMember');
  }, []);

  // Handle add members click
  const handleAddMembersClick = useCallback(() => {
    // TODO: Open card members popup
    // Popup.open('cardMembers');
  }, []);

  // Handle assignee click
  const handleAssigneeClick = useCallback((assigneeId) => {
    // TODO: Open card assignee popup
    // Popup.open('cardAssignee');
  }, []);

  // Handle add assignees click
  const handleAddAssigneesClick = useCallback(() => {
    // TODO: Open card assignees popup
    // Popup.open('cardAssignees');
  }, []);

  // Handle add labels click
  const handleAddLabelsClick = useCallback(() => {
    // TODO: Open card labels popup
    // Popup.open('cardLabels');
  }, []);

  // Handle received date click
  const handleReceivedDateClick = useCallback(() => {
    // TODO: Open edit card received date popup
    // Popup.open('editCardReceivedDate');
  }, []);

  // Handle start date click
  const handleStartDateClick = useCallback(() => {
    // TODO: Open edit card start date popup
    // Popup.open('editCardStartDate');
  }, []);

  // Handle due date click
  const handleDueDateClick = useCallback(() => {
    // TODO: Open edit card due date popup
    // Popup.open('editCardDueDate');
  }, []);

  // Handle end date click
  const handleEndDateClick = useCallback(() => {
    // TODO: Open edit card end date popup
    // Popup.open('editCardEndDate');
  }, []);

  // Handle show positive votes click
  const handleShowPositiveVotesClick = useCallback(() => {
    // TODO: Open positive vote members popup
    // Popup.open('positiveVoteMembers');
  }, []);

  // Handle show negative votes click
  const handleShowNegativeVotesClick = useCallback(() => {
    // TODO: Open negative vote members popup
    // Popup.open('negativeVoteMembers');
  }, []);

  // Handle custom fields click
  const handleCustomFieldsClick = useCallback(() => {
    // TODO: Open card custom fields popup
    // Popup.open('cardCustomFields');
  }, []);

  // Handle go to linked card
  const handleGoToLinkedCard = useCallback(() => {
    if (card.linkedId) {
      // TODO: Navigate to linked card
      // Utils.goCardId(card.linkedId);
    }
  }, [card]);

  // Check if voting buttons should be shown
  const showVotingButtons = () => {
    return (
      (isBoardMember || (currentUser && card.voteAllowNonBoardMembers())) &&
      !card.expiredVote()
    );
  };

  // Check if planning poker buttons should be shown
  const showPlanningPokerButtons = () => {
    return (
      (isBoardMember || (currentUser && card.pokerAllowNonBoardMembers())) &&
      !card.expiredPoker()
    );
  };

  // Check if vertical scrollbars should be shown
  const isVerticalScrollbars = () => {
    return currentUser && currentUser.isVerticalScrollbars();
  };

  // Check if list ID is current list ID
  const isCurrentListId = (listId) => {
    return card.listId === listId;
  };

  // Get link for card
  const getLinkForCard = () => {
    if (currentBoard) {
      // TODO: Generate proper card link
      return `#`;
    }
    return '#';
  };

  // Get present parent task
  const getPresentParentTask = () => {
    let result = currentBoard?.presentParentTask;
    if (result === null || result === undefined) {
      result = 'no-parent';
    }
    return result;
  };

  if (!card || !currentUser) {
    return (
      <div className="card-details loading">
        <div className="loading-spinner">
          <i className="fa fa-spinner fa-spin"></i>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`js-card-details card-details ${isLoaded ? 'loaded' : ''} ${cardMaximized ? 'maximized' : ''}`}
      ref={cardElementRef}
      onMouseEnter={() => {/* TODO: Handle mouse enter */}}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Card Details Header */}
      <div className="card-details-header">
        <div className="card-details-header-left">
          <button 
            className="js-close-card-details btn btn-sm btn-close"
            onClick={handleClose}
            title={t('close')}
          >
            <i className="fa fa-times"></i>
          </button>
          
          <div className="card-details-title">
            <h2>{card.title}</h2>
          </div>
        </div>
        
        <div className="card-details-header-right">
          <button 
            className="js-copy-link btn btn-sm btn-link"
            onClick={handleCopyLink}
            title={t('copy-link')}
          >
            <i className="fa fa-link"></i>
          </button>
          
          <button 
            className="js-open-card-details-menu btn btn-sm btn-link"
            onClick={handleOpenCardDetailsMenu}
            title={t('card-actions')}
          >
            <i className="fa fa-ellipsis-h"></i>
          </button>
        </div>
      </div>

      {/* Card Details Content */}
      <div className="card-details-content">
        {/* Card Title Editor */}
        <div className="card-title-editor">
          <form className="js-card-details-title" onSubmit={(e) => {
            e.preventDefault();
            const title = e.target.title.value.trim();
            if (title) {
              handleTitleUpdate(title);
            }
          }}>
            <textarea
              name="title"
              className="form-control js-edit-card-title"
              defaultValue={card.title}
              placeholder={t('card-title')}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <i className="fa fa-check"></i>
            </button>
          </form>
        </div>

        {/* Card Description Editor */}
        <div className="card-description-editor">
          <form className="js-card-description" onSubmit={(e) => {
            e.preventDefault();
            const description = e.target.description.value;
            handleDescriptionUpdate(description);
          }}>
            <textarea
              name="description"
              className="form-control js-edit-card-description"
              defaultValue={card.description || ''}
              placeholder={t('card-description')}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <i className="fa fa-check"></i>
            </button>
          </form>
        </div>

        {/* Card Assigner Editor */}
        <div className="card-assigner-editor">
          <form className="js-card-details-assigner" onSubmit={(e) => {
            e.preventDefault();
            const assigner = e.target.assigner.value.trim();
            handleAssignerUpdate(assigner);
          }}>
            <input
              name="assigner"
              type="text"
              className="form-control js-edit-card-assigner"
              defaultValue={card.assignedBy || ''}
              placeholder={t('assigned-by')}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <i className="fa fa-check"></i>
            </button>
          </form>
        </div>

        {/* Card Requester Editor */}
        <div className="card-requester-editor">
          <form className="js-card-details-requester" onSubmit={(e) => {
            e.preventDefault();
            const requester = e.target.requester.value.trim();
            handleRequesterUpdate(requester);
          }}>
            <input
              name="requester"
              type="text"
              className="form-control js-edit-card-requester"
              defaultValue={card.requestedBy || ''}
              placeholder={t('requested-by')}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <i className="fa fa-check"></i>
            </button>
          </form>
        </div>

        {/* Card Sort Editor */}
        <div className="card-sort-editor">
          <form className="js-card-details-sort" onSubmit={(e) => {
            e.preventDefault();
            const sort = e.target.sort.value.trim();
            handleSortUpdate(sort);
          }}>
            <input
              name="sort"
              type="number"
              className="form-control js-edit-card-sort"
              defaultValue={card.sort || 0}
              placeholder={t('card-sort')}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <i className="fa fa-check"></i>
            </button>
          </form>
        </div>

        {/* Card List Selector */}
        <div className="card-list-selector">
          <select 
            className="js-select-card-details-lists form-control"
            onChange={(e) => handleListChange(e.target.value)}
            value={card.listId}
          >
            {currentBoard?.lists?.map(list => (
              <option key={list._id} value={list._id}>
                {list.title}
              </option>
            ))}
          </select>
        </div>

        {/* Card Members */}
        <div className="card-members">
          <div className="card-members-header">
            <h3>{t('members')}</h3>
            <button 
              className="js-add-members btn btn-sm btn-primary"
              onClick={handleAddMembersClick}
            >
              <i className="fa fa-plus"></i>
            </button>
          </div>
          
          <div className="card-members-list">
            {card.getMembers?.()?.map(memberId => (
              <div key={memberId} className="card-member">
                <button 
                  className="js-member btn btn-sm btn-link"
                  onClick={() => handleMemberClick(memberId)}
                >
                  {/* TODO: Add UserAvatar component */}
                  <span>{memberId}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Card Assignees */}
        <div className="card-assignees">
          <div className="card-assignees-header">
            <h3>{t('assignees')}</h3>
            <button 
              className="js-add-assignees btn btn-sm btn-primary"
              onClick={handleAddAssigneesClick}
            >
              <i className="fa fa-plus"></i>
            </button>
          </div>
          
          <div className="card-assignees-list">
            {card.getAssignees?.()?.map(assigneeId => (
              <div key={assigneeId} className="card-assignee">
                <button 
                  className="js-assignee btn btn-sm btn-link"
                  onClick={() => handleAssigneeClick(assigneeId)}
                >
                  {/* TODO: Add UserAvatar component */}
                  <span>{assigneeId}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Card Labels */}
        <div className="card-labels">
          <div className="card-labels-header">
            <h3>{t('labels')}</h3>
            <button 
              className="js-add-labels btn btn-sm btn-primary"
              onClick={handleAddLabelsClick}
            >
              <i className="fa fa-plus"></i>
            </button>
          </div>
          
          <div className="card-labels-list">
            {/* TODO: Add Labels component */}
          </div>
        </div>

        {/* Card Dates */}
        <div className="card-dates">
          <div className="card-date received-date">
            <span className="date-label">{t('received-date')}:</span>
            <button 
              className="js-received-date btn btn-sm btn-link"
              onClick={handleReceivedDateClick}
            >
              {card.receivedAt ? moment(card.receivedAt).format('L') : t('no-date')}
            </button>
          </div>
          
          <div className="card-date start-date">
            <span className="date-label">{t('start-date')}:</span>
            <button 
              className="js-start-date btn btn-sm btn-link"
              onClick={handleStartDateClick}
            >
              {card.startAt ? moment(card.startAt).format('L') : t('no-date')}
            </button>
          </div>
          
          <div className="card-date due-date">
            <span className="date-label">{t('due-date')}:</span>
            <button 
              className="js-due-date btn btn-sm btn-link"
              onClick={handleDueDateClick}
            >
              {card.dueAt ? moment(card.dueAt).format('L') : t('no-date')}
            </button>
          </div>
          
          <div className="card-date end-date">
            <span className="date-label">{t('end-date')}:</span>
            <button 
              className="js-end-date btn btn-sm btn-link"
              onClick={handleEndDateClick}
            >
              {card.endAt ? moment(card.endAt).format('L') : t('no-date')}
            </button>
          </div>
        </div>

        {/* Card Voting */}
        {showVotingButtons() && (
          <div className="card-voting">
            <div className="voting-header">
              <h3>{t('voting')}</h3>
            </div>
            
            <div className="voting-buttons">
              <button 
                className={`js-vote js-vote-positive btn btn-sm ${card.voteState() === true ? 'active' : ''}`}
                onClick={() => handleVote(true)}
                title={t('vote-positive')}
              >
                <i className="fa fa-thumbs-up"></i>
                <span className="vote-count">{card.positiveVotes?.length || 0}</span>
              </button>
              
              <button 
                className={`js-vote js-vote-negative btn btn-sm ${card.voteState() === false ? 'active' : ''}`}
                onClick={() => handleVote(false)}
                title={t('vote-negative')}
              >
                <i className="fa fa-thumbs-down"></i>
                <span className="vote-count">{card.negativeVotes?.length || 0}</span>
              </button>
            </div>
            
            <div className="voting-details">
              <button 
                className="js-show-positive-votes btn btn-sm btn-link"
                onClick={handleShowPositiveVotesClick}
              >
                {t('show-positive-votes')}
              </button>
              
              <button 
                className="js-show-negative-votes btn btn-sm btn-link"
                onClick={handleShowNegativeVotesClick}
              >
                {t('show-negative-votes')}
              </button>
            </div>
          </div>
        )}

        {/* Card Planning Poker */}
        {showPlanningPokerButtons() && (
          <div className="card-planning-poker">
            <div className="poker-header">
              <h3>{t('planning-poker')}</h3>
            </div>
            
            <div className="poker-buttons">
              {['one', 'two', 'three', 'five', 'eight', 'thirteen', 'twenty', 'forty', 'oneHundred', 'unsure'].map(value => (
                <button 
                  key={value}
                  className={`js-poker js-poker-vote-${value} btn btn-sm`}
                  onClick={() => handlePoker(value)}
                  title={t(`poker-vote-${value}`)}
                >
                  {value === 'oneHundred' ? '100' : value === 'unsure' ? '?' : value}
                </button>
              ))}
            </div>
            
            <div className="poker-actions">
              <button 
                className="js-poker-finish btn btn-sm btn-primary"
                onClick={handlePokerFinish}
              >
                {t('finish-poker')}
              </button>
              
              <button 
                className="js-poker-replay btn btn-sm btn-secondary"
                onClick={handlePokerReplay}
              >
                {t('replay-poker')}
              </button>
            </div>
            
            <div className="poker-estimation">
              <input
                id="pokerEstimation"
                type="number"
                className="form-control"
                placeholder={t('poker-estimation')}
              />
              <button 
                className="js-poker-estimation btn btn-sm btn-primary"
                onClick={() => {
                  const input = document.getElementById('pokerEstimation');
                  handlePokerEstimation(input.value);
                  input.value = '';
                }}
              >
                {t('set-estimation')}
              </button>
            </div>
          </div>
        )}

        {/* Card Custom Fields */}
        <div className="card-custom-fields">
          <div className="custom-fields-header">
            <h3>{t('custom-fields')}</h3>
            <button 
              className="js-custom-fields btn btn-sm btn-primary"
              onClick={handleCustomFieldsClick}
            >
              <i className="fa fa-cog"></i>
            </button>
          </div>
          
          <div className="custom-fields-content">
            {/* TODO: Add CardCustomFields component */}
          </div>
        </div>

        {/* Card Actions */}
        <div className="card-actions">
          <div className="action-buttons">
            <button 
              className="js-toggle-show-activities btn btn-sm btn-secondary"
              onClick={handleToggleActivities}
            >
              {showActivities ? t('hide-activities') : t('show-activities')}
            </button>
            
            <button 
              className="js-toggle-hide-checked-checklist-items btn btn-sm btn-secondary"
              onClick={handleToggleCheckedChecklistItems}
            >
              {hideCheckedChecklistItems ? t('show-checked-items') : t('hide-checked-items')}
            </button>
            
            <button 
              className="js-toggle-custom-fields-grid-button btn btn-sm btn-secondary"
              onClick={handleToggleCustomFieldsGrid}
            >
              {customFieldsGrid ? t('hide-custom-fields-grid') : t('show-custom-fields-grid')}
            </button>
            
            <button 
              className="js-maximize-card-details btn btn-sm btn-secondary"
              onClick={handleToggleCardMaximized}
            >
              {cardMaximized ? t('minimize') : t('maximize')}
            </button>
          </div>
        </div>

        {/* Linked Card */}
        {card.linkedId && (
          <div className="linked-card">
            <span className="linked-label">{t('linked-card')}:</span>
            <button 
              className="js-go-to-linked-card btn btn-sm btn-link"
              onClick={handleGoToLinkedCard}
            >
              {t('go-to-linked-card')}
            </button>
          </div>
        )}

        {/* Parent Task */}
        {getPresentParentTask() !== 'no-parent' && (
          <div className="parent-task">
            <span className="parent-label">{t('parent-task')}:</span>
            <span className="parent-value">{getPresentParentTask()}</span>
          </div>
        )}
      </div>

      {/* Card Details Footer */}
      <div className="card-details-footer">
        <div className="card-info">
          <span className="card-id">ID: {card._id}</span>
          <span className="card-link">
            <a href={getLinkForCard()} className="js-copy-link">
              {t('copy-link')}
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default CardDetails;
