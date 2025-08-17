import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { ReactiveCache } from '/imports/reactiveCache';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * CardActions Component
 * 
 * Replaces the original Blaze cardActions component with a React component.
 * This component provides comprehensive card action configuration for rules,
 * including date setting, label management, member management, and color setting.
 * 
 * Original Blaze component had:
 * - cardActions: Card action configuration interface
 * - setCardActionsColorPopup: Color selection popup for card actions
 * - Multiple action types: date, label, member, color, remove all
 */
const CardActions = ({ 
  onActionAdd, 
  onActionChange,
  currentActions = [],
  disabled = false 
}) => {
  const [showColorPopup, setShowColorPopup] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { labels, colors, currentUser } = useTracker(() => {
    const user = ReactiveCache.getCurrentUser();
    if (!user) return {
      currentUser: null,
      labels: [],
      colors: []
    };

    // Get labels from current board
    const currentBoard = ReactiveCache.getCurrentBoard();
    const boardLabels = currentBoard ? ReactiveCache.getLabels({ boardId: currentBoard._id }) : [];

    // Get available colors
    const availableColors = [
      'green', 'yellow', 'orange', 'red', 'purple', 'blue', 'sky', 'lime', 'pink', 'black'
    ];

    return {
      currentUser: user,
      labels: boardLabels || [],
      colors: availableColors
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

  // Toggle color popup
  const toggleColorPopup = useCallback(() => {
    setShowColorPopup(prev => !prev);
  }, []);

  // Handle color selection
  const handleColorSelect = useCallback((color) => {
    setSelectedColor(color);
  }, []);

  // Handle color save
  const handleColorSave = useCallback(() => {
    if (selectedColor) {
      handleAddAction('set-color', { color: selectedColor });
      setShowColorPopup(false);
      setSelectedColor('');
    }
  }, [selectedColor, handleAddAction]);

  return (
    <div className="card-actions js-card-actions">
      {/* Set Date Action */}
      <div className="trigger-item js-set-date-action">
        <div className="trigger-content">
          <div className="trigger-dropdown">
            <select
              id="setdate-action"
              className="form-control"
              onChange={(e) => handleActionChange('set-date', 'action', e.target.value)}
              disabled={disabled}
            >
              <option value="setDate">{t('r-set')}</option>
              <option value="updateDate">{t('r-update')}</option>
            </select>
          </div>
          
          <div className="trigger-text">
            {t('r-datefield')}
          </div>
          
          <div className="trigger-dropdown">
            <select
              id="setdate-datefield"
              className="form-control"
              onChange={(e) => handleActionChange('set-date', 'dateField', e.target.value)}
              disabled={disabled}
            >
              <option value="startAt">{t('r-df-start-at')}</option>
              <option value="dueAt">{t('r-df-due-at')}</option>
              <option value="endAt">{t('r-df-end-at')}</option>
              <option value="receivedAt">{t('r-df-received-at')}</option>
            </select>
          </div>
          
          <div className="trigger-text">
            {t('r-to-current-datetime')}
          </div>
        </div>
        
        <div className="trigger-button js-set-date-action js-goto-rules">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddAction('set-date', {
              action: 'setDate',
              dateField: 'startAt'
            })}
            disabled={disabled}
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>
      </div>

      {/* Remove Date Value Action */}
      <div className="trigger-item js-remove-datevalue-action">
        <div className="trigger-content">
          <div className="trigger-text">
            {t('r-remove-value-from')}
            {t('r-datefield')}
          </div>
          
          <div className="trigger-dropdown">
            <select
              id="setdate-removedatefieldvalue"
              className="form-control"
              onChange={(e) => handleActionChange('remove-date', 'dateField', e.target.value)}
              disabled={disabled}
            >
              <option value="startAt">{t('r-df-start-at')}</option>
              <option value="dueAt">{t('r-df-due-at')}</option>
              <option value="endAt">{t('r-df-end-at')}</option>
              <option value="receivedAt">{t('r-df-received-at')}</option>
            </select>
          </div>
        </div>
        
        <div className="trigger-button js-remove-datevalue-action js-goto-rules">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddAction('remove-date', {
              dateField: 'startAt'
            })}
            disabled={disabled}
          >
            <i className="fa-plus"></i>
          </button>
        </div>
      </div>

      {/* Label Action */}
      <div className="trigger-item js-add-label-action">
        <div className="trigger-content">
          <div className="trigger-dropdown">
            <select
              id="label-action"
              className="form-control"
              onChange={(e) => handleActionChange('label', 'action', e.target.value)}
              disabled={disabled}
            >
              <option value="add">{t('r-add')}</option>
              <option value="remove">{t('r-remove')}</option>
            </select>
          </div>
          
          <div className="trigger-text">
            {t('r-label')}
          </div>
          
          <div className="trigger-dropdown">
            <select
              id="label-id"
              className="form-control"
              onChange={(e) => handleActionChange('label', 'labelId', e.target.value)}
              disabled={disabled}
            >
              <option value="">{t('select-label')}</option>
              {labels.map(label => (
                <option key={label._id} value={label._id}>
                  {label.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="trigger-button js-add-label-action js-goto-rules">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddAction('label', {
              action: 'add',
              labelId: ''
            })}
            disabled={disabled}
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>
      </div>

      {/* Member Action */}
      <div className="trigger-item js-add-member-action">
        <div className="trigger-content">
          <div className="trigger-dropdown">
            <select
              id="member-action"
              className="form-control"
              onChange={(e) => handleActionChange('member', 'action', e.target.value)}
              disabled={disabled}
            >
              <option value="add">{t('r-add')}</option>
              <option value="remove">{t('r-remove')}</option>
            </select>
          </div>
          
          <div className="trigger-text">
            {t('r-member')}
          </div>
          
          <div className="trigger-dropdown">
            <input
              id="member-name"
              type="text"
              className="form-control"
              placeholder={t('r-name')}
              onChange={(e) => handleActionChange('member', 'memberName', e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
        
        <div className="trigger-button js-add-member-action js-goto-rules">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddAction('member', {
              action: 'add',
              memberName: ''
            })}
            disabled={disabled}
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>
      </div>

      {/* Remove All Action */}
      <div className="trigger-item js-add-removeall-action">
        <div className="trigger-content">
          <div className="trigger-text">
            {t('r-remove-all')}
          </div>
        </div>
        
        <div className="trigger-button js-add-removeall-action js-goto-rules">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddAction('remove-all', {})}
            disabled={disabled}
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>
      </div>

      {/* Set Color Action */}
      <div className="trigger-item js-set-color-action">
        <div className="trigger-content">
          <div className="trigger-text">
            {t('r-set-color')}
          </div>
          
          <button
            className="trigger-button trigger-button-color js-show-color-palette btn btn-sm btn-link"
            id="color-action"
            onClick={toggleColorPopup}
            disabled={disabled}
          >
            <span className="color-preview">
              {selectedColor ? (
                <span className={`card-details-${selectedColor}`}>
                  {t(selectedColor)}
                </span>
              ) : (
                t('select-color')
              )}
            </span>
          </button>
        </div>
        
        <div className="trigger-button js-set-color-action js-goto-rules">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddAction('set-color', {
              color: selectedColor || 'green'
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
                {action.action && (
                  <span className="action-action">{action.action}</span>
                )}
                {action.dateField && (
                  <span className="action-datefield">field: {action.dateField}</span>
                )}
                {action.labelId && (
                  <span className="action-label">label: {action.labelId}</span>
                )}
                {action.memberName && (
                  <span className="action-member">member: {action.memberName}</span>
                )}
                {action.color && (
                  <span className="action-color">color: {action.color}</span>
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

      {/* Color Selection Popup */}
      {showColorPopup && (
        <SetCardActionsColorPopup
          colors={colors}
          selectedColor={selectedColor}
          onColorSelect={handleColorSelect}
          onSave={handleColorSave}
          onClose={() => setShowColorPopup(false)}
          disabled={disabled}
        />
      )}
    </div>
  );
};

/**
 * SetCardActionsColorPopup Component
 * 
 * Color selection popup for card actions
 */
const SetCardActionsColorPopup = ({ 
  colors, 
  selectedColor, 
  onColorSelect, 
  onSave, 
  onClose, 
  disabled 
}) => {
  const t = (key) => enTranslations[key] || key;

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSave();
  }, [onSave]);

  return (
    <div className="set-card-actions-color-popup js-set-card-actions-color-popup">
      <form className="edit-label" onSubmit={handleSubmit}>
        <div className="palette-colors">
          {colors.map(color => (
            <span
              key={color}
              className={`card-label palette-color js-palette-color card-details-${color} ${selectedColor === color ? 'is-selected' : ''}`}
              onClick={() => onColorSelect(color)}
            >
              {selectedColor === color && (
                <i className="fa fa-check"></i>
              )}
            </span>
          ))}
        </div>
        
        <div className="form-actions">
          <button
            type="submit"
            className="primary confirm js-submit btn btn-primary"
            disabled={disabled || !selectedColor}
          >
            {t('save')}
          </button>
          
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={disabled}
          >
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CardActions;
