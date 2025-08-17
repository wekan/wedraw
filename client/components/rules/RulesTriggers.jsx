import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { ReactiveCache } from '/imports/reactiveCache';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

// Import trigger components
import BoardTriggers from './triggers/BoardTriggers';
import CardTriggers from './triggers/CardTriggers';
import ChecklistTriggers from './triggers/ChecklistTriggers';

/**
 * RulesTriggers Component
 * 
 * Replaces the original Blaze rulesTriggers component with a React component.
 * This component provides the interface for adding triggers to rules,
 * with different trigger types: board, card, and checklist triggers.
 * 
 * Original Blaze component had:
 * - rulesTriggers: Main rules triggers interface
 * - Side menu for selecting trigger types
 * - Conditional rendering of trigger components
 * - Back navigation functionality
 */
const RulesTriggers = ({ 
  ruleName, 
  onBack, 
  onTriggerAdd,
  onUpdate 
}) => {
  const [currentTriggerType, setCurrentTriggerType] = useState('board');
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
        ruleName: ruleName
      });
    }
  }, [ruleName]);

  // Handle trigger type change
  const handleTriggerTypeChange = useCallback((triggerType) => {
    setCurrentTriggerType(triggerType);
  }, []);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    }
  }, [onBack]);

  // Handle trigger addition
  const handleTriggerAdd = useCallback((triggerData) => {
    if (onTriggerAdd) {
      onTriggerAdd(triggerData);
    }
  }, [onTriggerAdd]);

  if (!currentUser || !isBoardAdmin) {
    return (
      <div className="rules-triggers error">
        <div className="error-message">
          <i className="fa fa-exclamation-triangle"></i>
          {t('error-notAuthorized')}
        </div>
      </div>
    );
  }

  if (!ruleData) {
    return (
      <div className="rules-triggers loading">
        <div className="loading-spinner">
          <i className="fa fa-spinner fa-spin"></i>
          {t('loading')}
        </div>
      </div>
    );
  }

  return (
    <div className="rules-triggers js-rules-triggers">
      <h2 className="rules-triggers-title">
        <i className="fa fa-magic"></i>
        {t('r-rule')} "{ruleData.ruleName}" - {t('r-add-trigger')}
      </h2>

      <div className="triggers-content">
        <div className="triggers-body">
          <div className="triggers-side-menu">
            <ul>
              <li className={currentTriggerType === 'board' ? 'active' : ''}>
                <button
                  className="js-set-board-triggers trigger-type-button"
                  onClick={() => handleTriggerTypeChange('board')}
                >
                  <i className="fa fa-columns"></i>
                  {t('board-triggers')}
                </button>
              </li>
              
              <li className={currentTriggerType === 'card' ? 'active' : ''}>
                <button
                  className="js-set-card-triggers trigger-type-button"
                  onClick={() => handleTriggerTypeChange('card')}
                >
                  <i className="fa fa-sticky-note"></i>
                  {t('card-triggers')}
                </button>
              </li>
              
              <li className={currentTriggerType === 'checklist' ? 'active' : ''}>
                <button
                  className="js-set-checklist-triggers trigger-type-button"
                  onClick={() => handleTriggerTypeChange('checklist')}
                >
                  <i className="fa fa-check"></i>
                  {t('checklist-triggers')}
                </button>
              </li>
            </ul>
          </div>

          <div className="triggers-main-body">
            {currentTriggerType === 'board' && (
              <BoardTriggers
                onTriggerAdd={handleTriggerAdd}
                onTriggerChange={() => {}}
                currentTriggers={[]}
                disabled={false}
              />
            )}

            {currentTriggerType === 'card' && (
              <CardTriggers
                onTriggerAdd={handleTriggerAdd}
                onTriggerChange={() => {}}
                currentTriggers={[]}
                disabled={false}
              />
            )}

            {currentTriggerType === 'checklist' && (
              <ChecklistTriggers
                onTriggerAdd={handleTriggerAdd}
                onTriggerChange={() => {}}
                currentTriggers={[]}
                disabled={false}
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

export default RulesTriggers;
