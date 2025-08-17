import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { ReactiveCache } from '/imports/reactiveCache';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * RulesActions Component
 * 
 * Replaces the original Blaze rulesActions component with a React component.
 * This component provides the interface for adding actions to rules,
 * with different action types: board, card, checklist, and mail actions.
 * 
 * Original Blaze component had:
 * - rulesActions: Main rules actions interface
 * - Side menu for selecting action types
 * - Conditional rendering of action components
 * - Back navigation functionality
 */
const RulesActions = ({ 
  ruleName, 
  triggerVar, 
  onBack, 
  onActionAdd,
  onUpdate 
}) => {
  const [currentActions, setCurrentActions] = useState('board');
  const [ruleData, setRuleData] = useState(null);

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentUser, isBoardAdmin } = useTracker(() => {
    const user = ReactiveCache.getCurrentUser();
    if (!user) return {
      currentUser: null,
      isBoardAdmin: false
    };

    const boardAdminStatus = user.isBoardAdmin();

    return {
      currentUser: user,
      isBoardAdmin: boardAdminStatus,
    };
  }, []);

  // Load rule data
  useEffect(() => {
    if (ruleName) {
      // TODO: Load rule data from ReactiveCache
      setRuleData({
        ruleName: ruleName,
        triggerVar: triggerVar
      });
    }
  }, [ruleName, triggerVar]);

  // Handle action type change
  const handleActionTypeChange = useCallback((actionType) => {
    setCurrentActions(actionType);
  }, []);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    }
  }, [onBack]);

  // Handle action addition
  const handleActionAdd = useCallback((actionData) => {
    if (onActionAdd) {
      onActionAdd(actionData);
    }
  }, [onActionAdd]);

  if (!currentUser || !isBoardAdmin) {
    return (
      <div className="rules-actions error">
        <div className="error-message">
          <i className="fa fa-exclamation-triangle"></i>
          {t('error-notAuthorized')}
        </div>
      </div>
    );
  }

  if (!ruleData) {
    return (
      <div className="rules-actions loading">
        <div className="loading-spinner">
          <i className="fa fa-spinner fa-spin"></i>
          {t('loading')}
        </div>
      </div>
    );
  }

  return (
    <div className="rules-actions js-rules-actions">
      <h2 className="rules-actions-title">
        <i className="fa fa-magic"></i>
        {t('r-rule')} "{ruleData.ruleName}" - {t('r-add-action')}
      </h2>

      <div className="triggers-content">
        <div className="triggers-body">
          <div className="triggers-side-menu">
            <ul>
              <li className={currentActions === 'board' ? 'active' : ''}>
                <button
                  className="js-set-board-actions action-type-button"
                  onClick={() => handleActionTypeChange('board')}
                >
                  <i className="fa fa-columns"></i>
                  {t('board-actions')}
                </button>
              </li>
              
              <li className={currentActions === 'card' ? 'active' : ''}>
                <button
                  className="js-set-card-actions action-type-button"
                  onClick={() => handleActionTypeChange('card')}
                >
                  <i className="fa fa-sticky-note"></i>
                  {t('card-actions')}
                </button>
              </li>
              
              <li className={currentActions === 'checklist' ? 'active' : ''}>
                <button
                  className="js-set-checklist-actions action-type-button"
                  onClick={() => handleActionTypeChange('checklist')}
                >
                  <i className="fa fa-check"></i>
                  {t('checklist-actions')}
                </button>
              </li>
              
              <li className={currentActions === 'mail' ? 'active' : ''}>
                <button
                  className="js-set-mail-actions action-type-button"
                  onClick={() => handleActionTypeChange('mail')}
                >
                  <i className="fa fa-at"></i>
                  {t('mail-actions')}
                </button>
              </li>
            </ul>
          </div>

          <div className="triggers-main-body">
            {currentActions === 'board' && (
              <BoardActions
                ruleName={ruleData.ruleName}
                triggerVar={ruleData.triggerVar}
                onActionAdd={handleActionAdd}
                onUpdate={onUpdate}
              />
            )}

            {currentActions === 'card' && (
              <CardActions
                ruleName={ruleData.ruleName}
                triggerVar={ruleData.triggerVar}
                onActionAdd={handleActionAdd}
                onUpdate={onUpdate}
              />
            )}

            {currentActions === 'checklist' && (
              <ChecklistActions
                ruleName={ruleData.ruleName}
                triggerVar={ruleData.triggerVar}
                onActionAdd={handleActionAdd}
                onUpdate={onUpdate}
              />
            )}

            {currentActions === 'mail' && (
              <MailActions
                ruleName={ruleData.ruleName}
                triggerVar={ruleData.triggerVar}
                onActionAdd={handleActionAdd}
                onUpdate={onUpdate}
              />
            )}
          </div>
        </div>
      </div>

      <div className="rules-back">
        <button className="js-goback btn btn-secondary" onClick={handleBack}>
          <i className="fa fa-chevron-left"></i>
          {t('back')}
        </button>
      </div>
    </div>
  );
};

/**
 * BoardActions Component
 * 
 * Board-specific actions configuration
 */
const BoardActions = ({ ruleName, triggerVar, onActionAdd, onUpdate }) => {
  const t = (key) => enTranslations[key] || key;

  return (
    <div className="board-actions js-board-actions">
      <h3>{t('board-actions')}</h3>
      <p>{t('board-actions-description')}</p>
      
      {/* TODO: Implement board actions configuration */}
      <div className="board-actions-config">
        <p>{t('board-actions-coming-soon')}</p>
      </div>
    </div>
  );
};

/**
 * CardActions Component
 * 
 * Card-specific actions configuration
 */
const CardActions = ({ ruleName, triggerVar, onActionAdd, onUpdate }) => {
  const t = (key) => enTranslations[key] || key;

  return (
    <div className="card-actions js-card-actions">
      <h3>{t('card-actions')}</h3>
      <p>{t('card-actions-description')}</p>
      
      {/* TODO: Implement card actions configuration */}
      <div className="card-actions-config">
        <p>{t('card-actions-coming-soon')}</p>
      </div>
    </div>
  );
};

/**
 * ChecklistActions Component
 * 
 * Checklist-specific actions configuration
 */
const ChecklistActions = ({ ruleName, triggerVar, onActionAdd, onUpdate }) => {
  const t = (key) => enTranslations[key] || key;

  return (
    <div className="checklist-actions js-checklist-actions">
      <h3>{t('checklist-actions')}</h3>
      <p>{t('checklist-actions-description')}</p>
      
      {/* TODO: Implement checklist actions configuration */}
      <div className="checklist-actions-config">
        <p>{t('checklist-actions-coming-soon')}</p>
      </div>
    </div>
  );
};

/**
 * MailActions Component
 * 
 * Mail-specific actions configuration
 */
const MailActions = ({ ruleName, triggerVar, onActionAdd, onUpdate }) => {
  const t = (key) => enTranslations[key] || key;

  return (
    <div className="mail-actions js-mail-actions">
      <h3>{t('mail-actions')}</h3>
      <p>{t('mail-actions-description')}</p>
      
      {/* TODO: Implement mail actions configuration */}
      <div className="mail-actions-config">
        <p>{t('mail-actions-coming-soon')}</p>
      </div>
    </div>
  );
};

export default RulesActions;
