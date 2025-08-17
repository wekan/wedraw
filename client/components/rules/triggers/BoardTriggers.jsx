import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { ReactiveCache } from '/imports/reactiveCache';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * BoardTriggers Component
 * 
 * Replaces the original Blaze boardTriggers component with a React component.
 * This component provides comprehensive board trigger configuration for rules,
 * including card creation, movement, and archival triggers.
 * 
 * Original Blaze component had:
 * - boardTriggers: Board trigger configuration interface
 * - Multiple trigger types: card creation, movement, archival
 * - User specification options for each trigger
 * - Card title filtering capabilities
 */
const BoardTriggers = ({ 
  onTriggerAdd, 
  onTriggerChange,
  currentTriggers = [],
  disabled = false 
}) => {
  const [showUserFields, setShowUserFields] = useState({});
  const [userInputs, setUserInputs] = useState({});
  const [showCardTitlePopup, setShowCardTitlePopup] = useState({});
  const [cardTitleFilters, setCardTitleFilters] = useState({});

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Toggle user field visibility
  const toggleUserField = useCallback((triggerId) => {
    setShowUserFields(prev => ({
      ...prev,
      [triggerId]: !prev[triggerId]
    }));
  }, []);

  // Toggle card title popup
  const toggleCardTitlePopup = useCallback((triggerId) => {
    setShowCardTitlePopup(prev => ({
      ...prev,
      [triggerId]: !prev[triggerId]
    }));
  }, []);

  // Handle user input change
  const handleUserInputChange = useCallback((triggerId, value) => {
    setUserInputs(prev => ({
      ...prev,
      [triggerId]: value
    }));
  }, []);

  // Handle card title filter change
  const handleCardTitleFilterChange = useCallback((triggerId, value) => {
    setCardTitleFilters(prev => ({
      ...prev,
      [triggerId]: value
    }));
  }, []);

  // Handle trigger addition
  const handleAddTrigger = useCallback((triggerType, triggerData) => {
    if (onTriggerAdd) {
      const trigger = {
        type: triggerType,
        ...triggerData,
        id: `${triggerType}-${Date.now()}`
      };
      onTriggerAdd(trigger);
    }
  }, [onTriggerAdd]);

  // Handle trigger change
  const handleTriggerChange = useCallback((triggerId, field, value) => {
    if (onTriggerChange) {
      onTriggerChange(triggerId, field, value);
    }
  }, [onTriggerChange]);

  return (
    <div className="board-triggers js-board-triggers">
      {/* Card Creation Trigger */}
      <div className="trigger-item" id="trigger-two">
        <div className="trigger-content">
          <div className="trigger-text">
            {t('r-when-a-card')}
          </div>
          
          <div className="trigger-inline-button js-open-card-title-popup">
            <button
              type="button"
              className="btn btn-sm btn-link"
              onClick={() => toggleCardTitlePopup('create')}
              disabled={disabled}
            >
              <i className="fa fa-filter"></i>
            </button>
          </div>
          
          <div className="trigger-text">
            {t('r-is')}
          </div>
          
          <div className="trigger-text">
            {t('r-added-to')}
          </div>
          
          <div className="trigger-text">
            {t('r-list')}
          </div>
          
          <div className="trigger-dropdown">
            <input
              id="create-list-name"
              type="text"
              className="form-control"
              placeholder={t('r-list-name')}
              onChange={(e) => handleTriggerChange('create', 'listName', e.target.value)}
              disabled={disabled}
            />
          </div>
          
          <div className="trigger-text">
            {t('r-in-swimlane')}
          </div>
          
          <div className="trigger-dropdown">
            <input
              id="create-swimlane-name"
              type="text"
              className="form-control"
              placeholder={t('r-swimlane-name')}
              onChange={(e) => handleTriggerChange('create', 'swimlaneName', e.target.value)}
              disabled={disabled}
            />
          </div>
          
          <div className="trigger-button trigger-button-person js-show-user-field">
            <button
              type="button"
              className="btn btn-sm btn-link"
              onClick={() => toggleUserField('create')}
              disabled={disabled}
            >
              <i className="fa fa-user"></i>
            </button>
          </div>
          
          <div className={`user-details ${showUserFields['create'] ? '' : 'hide-element'}`}>
            <div className="trigger-text">
              {t('r-by')}
            </div>
            <div className="trigger-dropdown">
              <input
                className="user-name form-control"
                type="text"
                placeholder={t('username')}
                value={userInputs['create'] || ''}
                onChange={(e) => handleUserInputChange('create', e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
        
        <div className="trigger-button js-add-create-trigger js-goto-action">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddTrigger('card-creation', {
              listName: '',
              swimlaneName: '',
              user: userInputs['create'] || null,
              cardTitleFilter: cardTitleFilters['create'] || null
            })}
            disabled={disabled}
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>

        {/* Card Title Filter Popup */}
        {showCardTitlePopup['create'] && (
          <CardTitlePopup
            triggerId="create"
            value={cardTitleFilters['create'] || ''}
            onChange={handleCardTitleFilterChange}
            onClose={() => toggleCardTitlePopup('create')}
            disabled={disabled}
          />
        )}
      </div>

      {/* Card Movement Trigger */}
      <div className="trigger-item" id="trigger-three">
        <div className="trigger-content">
          <div className="trigger-text">
            {t('r-when-a-card')}
          </div>
          
          <div className="trigger-inline-button js-open-card-title-popup">
            <button
              type="button"
              className="btn btn-sm btn-link"
              onClick={() => toggleCardTitlePopup('moved')}
              disabled={disabled}
            >
              <i className="fa fa-filter"></i>
            </button>
          </div>
          
          <div className="trigger-text">
            {t('r-is-moved')}
          </div>
          
          <div className="trigger-button trigger-button-person js-show-user-field">
            <button
              type="button"
              className="btn btn-sm btn-link"
              onClick={() => toggleUserField('moved')}
              disabled={disabled}
            >
              <i className="fa fa-user"></i>
            </button>
          </div>
          
          <div className={`user-details ${showUserFields['moved'] ? '' : 'hide-element'}`}>
            <div className="trigger-text">
              {t('r-by')}
            </div>
            <div className="trigger-dropdown">
              <input
                className="user-name form-control"
                type="text"
                placeholder={t('username')}
                value={userInputs['moved'] || ''}
                onChange={(e) => handleUserInputChange('moved', e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
        
        <div className="trigger-button js-add-gen-moved-trigger js-goto-action">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddTrigger('card-movement', {
              user: userInputs['moved'] || null,
              cardTitleFilter: cardTitleFilters['moved'] || null
            })}
            disabled={disabled}
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>

        {/* Card Title Filter Popup */}
        {showCardTitlePopup['moved'] && (
          <CardTitlePopup
            triggerId="moved"
            value={cardTitleFilters['moved'] || ''}
            onChange={handleCardTitleFilterChange}
            onClose={() => toggleCardTitlePopup('moved')}
            disabled={disabled}
          />
        )}
      </div>

      {/* Card List Movement Trigger */}
      <div className="trigger-item" id="trigger-four">
        <div className="trigger-content">
          <div className="trigger-text">
            {t('r-when-a-card')}
          </div>
          
          <div className="trigger-inline-button js-open-card-title-popup">
            <button
              type="button"
              className="btn btn-sm btn-link"
              onClick={() => toggleCardTitlePopup('list-move')}
              disabled={disabled}
            >
              <i className="fa fa-filter"></i>
            </button>
          </div>
          
          <div className="trigger-text">
            {t('r-is')}
          </div>
          
          <div className="trigger-dropdown">
            <select
              id="move-action"
              className="form-control"
              onChange={(e) => handleTriggerChange('list-move', 'action', e.target.value)}
              disabled={disabled}
            >
              <option value="moved-to">{t('r-moved-to')}</option>
              <option value="moved-from">{t('r-moved-from')}</option>
            </select>
          </div>
          
          <div className="trigger-text">
            {t('r-list')}
          </div>
          
          <div className="trigger-dropdown">
            <input
              id="move-list-name"
              type="text"
              className="form-control"
              placeholder={t('r-list-name')}
              onChange={(e) => handleTriggerChange('list-move', 'listName', e.target.value)}
              disabled={disabled}
            />
          </div>
          
          <div className="trigger-text">
            {t('r-in-swimlane')}
          </div>
          
          <div className="trigger-dropdown">
            <input
              id="create-swimlane-name-2"
              type="text"
              className="form-control"
              placeholder={t('r-swimlane-name')}
              onChange={(e) => handleTriggerChange('list-move', 'swimlaneName', e.target.value)}
              disabled={disabled}
            />
          </div>
          
          <div className="trigger-button trigger-button-person js-show-user-field">
            <button
              type="button"
              className="btn btn-sm btn-link"
              onClick={() => toggleUserField('list-move')}
              disabled={disabled}
            >
              <i className="fa fa-user"></i>
            </button>
          </div>
          
          <div className={`user-details ${showUserFields['list-move'] ? '' : 'hide-element'}`}>
            <div className="trigger-text">
              {t('r-by')}
            </div>
            <div className="trigger-dropdown">
              <input
                className="user-name form-control"
                type="text"
                placeholder={t('username')}
                value={userInputs['list-move'] || ''}
                onChange={(e) => handleUserInputChange('list-move', e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
        
        <div className="trigger-button js-add-moved-trigger js-goto-action">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddTrigger('list-movement', {
              action: 'moved-to',
              listName: '',
              swimlaneName: '',
              user: userInputs['list-move'] || null,
              cardTitleFilter: cardTitleFilters['list-move'] || null
            })}
            disabled={disabled}
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>

        {/* Card Title Filter Popup */}
        {showCardTitlePopup['list-move'] && (
          <CardTitlePopup
            triggerId="list-move"
            value={cardTitleFilters['list-move'] || ''}
            onChange={handleCardTitleFilterChange}
            onClose={() => toggleCardTitlePopup('list-move')}
            disabled={disabled}
          />
        )}
      </div>

      {/* Card Archive Trigger */}
      <div className="trigger-item" id="trigger-five">
        <div className="trigger-content">
          <div className="trigger-text">
            {t('r-when-a-card')}
          </div>
          
          <div className="trigger-inline-button js-open-card-title-popup">
            <button
              type="button"
              className="btn btn-sm btn-link"
              onClick={() => toggleCardTitlePopup('archive')}
              disabled={disabled}
            >
              <i className="fa fa-filter"></i>
            </button>
          </div>
          
          <div className="trigger-text">
            {t('r-is')}
          </div>
          
          <div className="trigger-dropdown">
            <select
              id="arch-action"
              className="form-control"
              onChange={(e) => handleTriggerChange('archive', 'action', e.target.value)}
              disabled={disabled}
            >
              <option value="archived">{t('r-archived')}</option>
              <option value="unarchived">{t('r-unarchived')}</option>
            </select>
          </div>
          
          <div className="trigger-button trigger-button-person js-show-user-field">
            <button
              type="button"
              className="btn btn-sm btn-link"
              onClick={() => toggleUserField('archive')}
              disabled={disabled}
            >
              <i className="fa fa-user"></i>
            </button>
          </div>
          
          <div className={`user-details ${showUserFields['archive'] ? '' : 'hide-element'}`}>
            <div className="trigger-text">
              {t('r-by')}
            </div>
            <div className="trigger-dropdown">
              <input
                className="user-name form-control"
                type="text"
                placeholder={t('username')}
                value={userInputs['archive'] || ''}
                onChange={(e) => handleUserInputChange('archive', e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
        
        <div className="trigger-button js-add-arch-trigger js-goto-action">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddTrigger('card-archive', {
              action: 'archived',
              user: userInputs['archive'] || null,
              cardTitleFilter: cardTitleFilters['archive'] || null
            })}
            disabled={disabled}
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>

        {/* Card Title Filter Popup */}
        {showCardTitlePopup['archive'] && (
          <CardTitlePopup
            triggerId="archive"
            value={cardTitleFilters['archive'] || ''}
            onChange={handleCardTitleFilterChange}
            onClose={() => toggleCardTitlePopup('archive')}
            disabled={disabled}
          />
        )}
      </div>

      {/* Board Note Trigger */}
      <div className="trigger-item">
        <div className="trigger-content">
          <div className="trigger-text">
            {t('r-board-note')}
          </div>
        </div>
      </div>

      {/* Current Triggers Display */}
      {currentTriggers.length > 0 && (
        <div className="current-triggers">
          <h4>{t('current-triggers')}</h4>
          <div className="triggers-list">
            {currentTriggers.map(trigger => (
              <div key={trigger.id} className="trigger-display">
                <span className="trigger-type">{trigger.type}</span>
                {trigger.action && (
                  <span className="trigger-action">{trigger.action}</span>
                )}
                {trigger.user && (
                  <span className="trigger-user">by {trigger.user}</span>
                )}
                {trigger.cardTitleFilter && (
                  <span className="trigger-filter">filter: {trigger.cardTitleFilter}</span>
                )}
                <button
                  type="button"
                  className="btn btn-xs btn-danger"
                  onClick={() => onTriggerChange && onTriggerChange(trigger.id, 'remove', null)}
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

/**
 * CardTitlePopup Component
 * 
 * Popup for setting card title filters
 */
const CardTitlePopup = ({ triggerId, value, onChange, onClose, disabled }) => {
  const t = (key) => enTranslations[key] || key;
  const [filterValue, setFilterValue] = useState(value);

  useEffect(() => {
    setFilterValue(value);
  }, [value]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (onChange) {
      onChange(triggerId, filterValue);
    }
    onClose();
  }, [onChange, triggerId, filterValue, onClose]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <div className="card-title-popup js-board-card-title-popup">
      <form onSubmit={handleSubmit}>
        <label className="form-label">
          {t('card-title-filter')}
          <input
            className="js-card-filter-name form-control"
            type="text"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            autoFocus
            disabled={disabled}
          />
        </label>
        
        <div className="form-actions">
          <input
            className="js-card-filter-button primary wide btn btn-primary"
            type="submit"
            value={t('set-filter')}
            disabled={disabled}
          />
          
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
            disabled={disabled}
          >
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BoardTriggers;
