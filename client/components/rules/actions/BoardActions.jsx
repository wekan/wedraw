import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { ReactiveCache } from '/imports/reactiveCache';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * BoardActions Component
 * 
 * Replaces the original Blaze boardActions component with a React component.
 * This component provides comprehensive board action configuration for rules,
 * including card movement, archival, swimlane creation, card creation, and linking.
 * 
 * Original Blaze component had:
 * - boardActions: Board action configuration interface
 * - Multiple action types: move, archive, swimlane, create card, link card
 */
const BoardActions = ({ 
  onActionAdd, 
  onActionChange,
  currentActions = [],
  disabled = false 
}) => {
  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { boards, currentBoard, currentUser } = useTracker(() => {
    const user = ReactiveCache.getCurrentUser();
    if (!user) return {
      currentUser: null,
      boards: [],
      currentBoard: null
    };

    const userBoards = ReactiveCache.getBoards() || [];
    const currentBoardData = ReactiveCache.getCurrentBoard();

    return {
      currentUser: user,
      boards: userBoards,
      currentBoard: currentBoardData
    };
  }, []);

  // Handle action addition
  const handleAddAction = useCallback((actionType, actionData) => {
    if (onActionAdd) {
      const action = {
        type: actionType,
        ...actionData,
        id: `${actionType}-${Date.now()}`
      };
      onActionAdd(action);
    }
  }, [onActionAdd]);

  // Handle action change
  const handleActionChange = useCallback((actionId, field, value) => {
    if (onActionChange) {
      onActionChange(actionId, field, value);
    }
  }, [onActionChange]);

  return (
    <div className="board-actions js-board-actions">
      {/* General Move Action */}
      <div className="trigger-item js-general-move-action">
        <div className="trigger-content">
          <div className="trigger-text">
            {t('r-move-card-to')}
          </div>
          
          <div className="trigger-dropdown">
            <select
              id="move-gen-action"
              className="form-control"
              onChange={(e) => handleActionChange('general-move', 'position', e.target.value)}
              disabled={disabled}
            >
              <option value="top">{t('r-top-of')}</option>
              <option value="bottom">{t('r-bottom-of')}</option>
            </select>
          </div>
          
          <div className="trigger-text">
            {t('r-its-list')}
          </div>
        </div>
        
        <div className="trigger-button js-add-gen-move-action js-goto-rules">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddAction('general-move', {
              position: 'top'
            })}
            disabled={disabled}
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>
      </div>

      {/* Specific Move Action */}
      <div className="trigger-item js-specific-move-action">
        <div className="trigger-content">
          <div className="trigger-text">
            {t('r-move-card-to')}
          </div>
          
          <div className="trigger-dropdown">
            <select
              id="move-spec-action"
              className="form-control"
              onChange={(e) => handleActionChange('specific-move', 'position', e.target.value)}
              disabled={disabled}
            >
              <option value="top">{t('r-top-of')}</option>
              <option value="bottom">{t('r-bottom-of')}</option>
            </select>
          </div>
          
          <div className="trigger-text">
            {t('r-the-board')}
          </div>
          
          <div className="trigger-dropdown">
            <select
              id="board-id"
              className="form-control"
              onChange={(e) => handleActionChange('specific-move', 'boardId', e.target.value)}
              disabled={disabled}
            >
              {boards.map(board => (
                <option 
                  key={board._id} 
                  value={board._id}
                  selected={board._id === currentBoard?._id}
                >
                  {board._id === currentBoard?._id ? t('current') : board.title}
                </option>
              ))}
            </select>
          </div>
          
          <div className="trigger-text">
            {t('r-in-list')}
          </div>
          
          <div className="trigger-dropdown">
            <input
              id="listName"
              type="text"
              className="form-control"
              placeholder={t('r-name')}
              onChange={(e) => handleActionChange('specific-move', 'listName', e.target.value)}
              disabled={disabled}
            />
          </div>
          
          <div className="trigger-text">
            {t('r-in-swimlane')}
          </div>
          
          <div className="trigger-dropdown">
            <input
              id="swimlaneName"
              type="text"
              className="form-control"
              placeholder={t('r-name')}
              onChange={(e) => handleActionChange('specific-move', 'swimlaneName', e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
        
        <div className="trigger-button js-add-spec-move-action js-goto-rules">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddAction('specific-move', {
              position: 'top',
              boardId: currentBoard?._id || '',
              listName: '',
              swimlaneName: ''
            })}
            disabled={disabled}
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>
      </div>

      {/* Archive Action */}
      <div className="trigger-item js-archive-action">
        <div className="trigger-content">
          <div className="trigger-dropdown">
            <select
              id="arch-action"
              className="form-control"
              onChange={(e) => handleActionChange('archive', 'action', e.target.value)}
              disabled={disabled}
            >
              <option value="archive">{t('r-archive')}</option>
              <option value="unarchive">{t('r-unarchive')}</option>
            </select>
          </div>
          
          <div className="trigger-text">
            {t('r-card')}
          </div>
        </div>
        
        <div className="trigger-button js-add-arch-action js-goto-rules">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddAction('archive', {
              action: 'archive'
            })}
            disabled={disabled}
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>
      </div>

      {/* Add Swimlane Action */}
      <div className="trigger-item js-add-swimlane-action">
        <div className="trigger-content">
          <div className="trigger-text">
            {t('r-add-swimlane')}
          </div>
          
          <div className="trigger-dropdown">
            <input
              id="swimlane-name"
              type="text"
              className="form-control"
              placeholder={t('r-name')}
              onChange={(e) => handleActionChange('add-swimlane', 'swimlaneName', e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
        
        <div className="trigger-button js-add-swimlane-action js-goto-rules">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddAction('add-swimlane', {
              swimlaneName: ''
            })}
            disabled={disabled}
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>
      </div>

      {/* Create Card Action */}
      <div className="trigger-item js-create-card-action">
        <div className="trigger-content">
          <div className="trigger-text">
            {t('r-create-card')}
          </div>
          
          <div className="trigger-dropdown">
            <input
              id="card-name"
              type="text"
              className="form-control"
              placeholder={t('r-name')}
              onChange={(e) => handleActionChange('create-card', 'cardName', e.target.value)}
              disabled={disabled}
            />
          </div>
          
          <div className="trigger-text">
            {t('r-in-list')}
          </div>
          
          <div className="trigger-dropdown">
            <input
              id="list-name"
              type="text"
              className="form-control"
              placeholder={t('r-name')}
              onChange={(e) => handleActionChange('create-card', 'listName', e.target.value)}
              disabled={disabled}
            />
          </div>
          
          <div className="trigger-text">
            {t('r-in-swimlane')}
          </div>
          
          <div className="trigger-dropdown">
            <input
              id="swimlane-name2"
              type="text"
              className="form-control"
              placeholder={t('r-name')}
              onChange={(e) => handleActionChange('create-card', 'swimlaneName', e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
        
        <div className="trigger-button js-create-card-action js-goto-rules">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddAction('create-card', {
              cardName: '',
              listName: '',
              swimlaneName: ''
            })}
            disabled={disabled}
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>
      </div>

      {/* Link Card Action */}
      <div className="trigger-item js-link-card-action">
        <div className="trigger-content">
          <div className="trigger-text">
            {t('r-link-card')}
          </div>
          
          <div className="trigger-text">
            {t('r-the-board')}
          </div>
          
          <div className="trigger-dropdown">
            <select
              id="board-id-link"
              className="form-control"
              onChange={(e) => handleActionChange('link-card', 'boardId', e.target.value)}
              disabled={disabled}
            >
              {boards.map(board => (
                <option 
                  key={board._id} 
                  value={board._id}
                  selected={board._id === currentBoard?._id}
                >
                  {board._id === currentBoard?._id ? t('current') : board.title}
                </option>
              ))}
            </select>
          </div>
          
          <div className="trigger-text">
            {t('r-in-list')}
          </div>
          
          <div className="trigger-dropdown">
            <input
              id="listName-link"
              type="text"
              className="form-control"
              placeholder={t('r-name')}
              onChange={(e) => handleActionChange('link-card', 'listName', e.target.value)}
              disabled={disabled}
            />
          </div>
          
          <div className="trigger-text">
            {t('r-in-swimlane')}
          </div>
          
          <div className="trigger-dropdown">
            <input
              id="swimlaneName-link"
              type="text"
              className="form-control"
              placeholder={t('r-name')}
              onChange={(e) => handleActionChange('link-card', 'swimlaneName', e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
        
        <div className="trigger-button js-link-card-action js-goto-rules">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddAction('link-card', {
              boardId: currentBoard?._id || '',
              listName: '',
              swimlaneName: ''
            })}
            disabled={disabled}
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>
      </div>

      {/* Current Actions Display */}
      {currentActions.length > 0 && (
        <div className="current-actions">
          <h4>{t('current-actions')}</h4>
          <div className="actions-list">
            {currentActions.map(action => (
              <div key={action.id} className="action-display">
                <span className="action-type">{action.type}</span>
                {action.position && (
                  <span className="action-position">position: {action.position}</span>
                )}
                {action.action && (
                  <span className="action-action">{action.action}</span>
                )}
                {action.boardId && (
                  <span className="action-board">board: {action.boardId}</span>
                )}
                {action.listName && (
                  <span className="action-list">list: {action.listName}</span>
                )}
                {action.swimlaneName && (
                  <span className="action-swimlane">swimlane: {action.swimlaneName}</span>
                )}
                {action.cardName && (
                  <span className="action-card">card: {action.cardName}</span>
                )}
                <button
                  type="button"
                  className="btn btn-xs btn-danger"
                  onClick={() => onActionChange && onActionChange(action.id, 'remove', null)}
                  disabled={disabled}
                >
                  <i className="fa fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardActions;
