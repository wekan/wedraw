import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { ReactiveCache } from '/imports/reactiveCache';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * RulesMain Component
 * 
 * Replaces the original Jade rulesMain template with a React component.
 * This component manages the rules system with tab-based navigation:
 * - Rules list view
 * - Trigger configuration
 * - Action configuration
 * - Rule details view
 * 
 * Original Jade template had:
 * - Tab-based navigation between rules views
 * - Conditional rendering of different components
 * - State management for current tab and rule data
 */
const RulesMain = () => {
  const [currentTab, setCurrentTab] = useState('rulesList');
  const [ruleName, setRuleName] = useState('');
  const [triggerVar, setTriggerVar] = useState({});
  const [ruleId, setRuleId] = useState('');

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentUser, rules } = useTracker(() => {
    // Subscribe to necessary data
    Meteor.subscribe('rules');
    Meteor.subscribe('actions');
    Meteor.subscribe('triggers');

    return {
      currentUser: ReactiveCache.getCurrentUser(),
      rules: ReactiveCache.getRules() || [],
    };
  }, []);

  const sanitizeObject = (obj) => {
    const sanitized = { ...obj };
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === '' || sanitized[key] === undefined) {
        sanitized[key] = '*';
      }
    });
    return sanitized;
  };

  const handleDeleteRule = async (rule) => {
    if (confirm(t('delete-rule-confirmation'))) {
      try {
        await Meteor.call('rules.delete', rule._id);
        await Meteor.call('actions.delete', rule.actionId);
        await Meteor.call('triggers.delete', rule.triggerId);
      } catch (error) {
        console.error('Error deleting rule:', error);
      }
    }
  };

  const handleGotoTrigger = (ruleTitle) => {
    if (ruleTitle && ruleTitle.trim() !== '') {
      setRuleName(ruleTitle.trim());
      setCurrentTab('trigger');
    }
  };

  const handleGotoAction = (username) => {
    let trigger = { ...triggerVar };
    
    // Set user ID
    if (username) {
      const userFound = ReactiveCache.getUser({ username });
      if (userFound) {
        trigger.userId = userFound._id;
      } else {
        trigger.userId = '*';
      }
    } else {
      trigger.userId = '*';
    }
    
    // Sanitize trigger
    trigger = sanitizeObject(trigger);
    setTriggerVar(trigger);
    setCurrentTab('action');
  };

  const handleGotoRules = () => {
    setCurrentTab('rulesList');
  };

  const handleGoback = () => {
    if (currentTab === 'trigger' || currentTab === 'ruleDetails') {
      setCurrentTab('rulesList');
    } else if (currentTab === 'action') {
      setCurrentTab('trigger');
    }
  };

  const handleGotoDetails = (rule) => {
    setRuleId(rule._id);
    setCurrentTab('ruleDetails');
  };

  const renderRulesList = () => (
    <div className="rules-list">
      <h2>{t('rules')}</h2>
      <div className="rules-content">
        {rules.map(rule => (
          <div key={rule._id} className="rule-item">
            <div className="rule-header">
              <h3>{rule.title}</h3>
              <div className="rule-actions">
                <button 
                  className="btn btn-primary js-goto-details"
                  onClick={() => handleGotoDetails(rule)}
                >
                  {t('details')}
                </button>
                <button 
                  className="btn btn-danger js-delete-rule"
                  onClick={() => handleDeleteRule(rule)}
                >
                  {t('delete')}
                </button>
              </div>
            </div>
            <div className="rule-info">
              <p><strong>{t('trigger')}:</strong> {rule.triggerType}</p>
              <p><strong>{t('action')}:</strong> {rule.actionType}</p>
            </div>
          </div>
        ))}
        
        <div className="add-rule-section">
          <form onSubmit={(e) => {
            e.preventDefault();
            const ruleTitle = e.target.ruleTitle.value;
            handleGotoTrigger(ruleTitle);
          }}>
            <div className="form-group">
              <input
                id="ruleTitle"
                type="text"
                placeholder={t('enter-rule-title')}
                className="form-control"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              {t('create-rule')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  const renderTrigger = () => (
    <div className="rules-trigger">
      <div className="trigger-header">
        <h2>{t('configure-trigger')}</h2>
        <p>{t('rule-name')}: {ruleName}</p>
      </div>
      
      <div className="trigger-content">
        {/* This would integrate with the existing rulesTriggers component */}
        <p>{t('trigger-configuration-coming-soon')}</p>
      </div>
      
      <div className="trigger-actions">
        <button 
          className="btn btn-secondary js-goback"
          onClick={handleGoback}
        >
          {t('back')}
        </button>
        <button 
          className="btn btn-primary"
          onClick={() => setCurrentTab('action')}
        >
          {t('next')}
        </button>
      </div>
    </div>
  );

  const renderAction = () => (
    <div className="rules-action">
      <div className="action-header">
        <h2>{t('configure-action')}</h2>
        <p>{t('rule-name')}: {ruleName}</p>
      </div>
      
      <div className="action-content">
        {/* This would integrate with the existing rulesActions component */}
        <p>{t('action-configuration-coming-soon')}</p>
      </div>
      
      <div className="action-actions">
        <button 
          className="btn btn-secondary js-goback"
          onClick={handleGoback}
        >
          {t('back')}
        </button>
        <button 
          className="btn btn-primary"
          onClick={() => {
            // Save rule logic would go here
            setCurrentTab('rulesList');
          }}
        >
          {t('save-rule')}
        </button>
      </div>
    </div>
  );

  const renderRuleDetails = () => (
    <div className="rule-details">
      <div className="details-header">
        <h2>{t('rule-details')}</h2>
      </div>
      
      <div className="details-content">
        {/* This would integrate with the existing ruleDetails component */}
        <p>{t('rule-details-coming-soon')}</p>
      </div>
      
      <div className="details-actions">
        <button 
          className="btn btn-secondary js-goback"
          onClick={handleGoback}
        >
          {t('back')}
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentTab) {
      case 'rulesList':
        return renderRulesList();
      case 'trigger':
        return renderTrigger();
      case 'action':
        return renderAction();
      case 'ruleDetails':
        return renderRuleDetails();
      default:
        return renderRulesList();
    }
  };

  if (!currentUser) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="rules-main js-rules-main">
      <div className="rules-header">
        <h1>
          <i className="fa fa-cogs"></i>
          {t('rules-system')}
        </h1>
      </div>
      
      <div className="rules-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default RulesMain;
