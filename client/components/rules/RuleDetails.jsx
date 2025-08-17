import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { ReactiveCache } from '/imports/reactiveCache';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * RuleDetails Component
 * 
 * Replaces the original Blaze ruleDetails component with a React component.
 * This component displays detailed information about a specific rule including
 * its trigger and action components.
 * 
 * Original Blaze component had:
 * - ruleDetails: Rule details display with trigger and action information
 * - Back navigation functionality
 */
const RuleDetails = ({ 
  ruleId, 
  onBack, 
  onEdit, 
  onDelete,
  onClose 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentUser, currentBoard, rule, isBoardAdmin } = useTracker(() => {
    const user = ReactiveCache.getCurrentUser();
    if (!user) return { 
      currentUser: null, 
      currentBoard: null,
      rule: null,
      isBoardAdmin: false
    };

    const boardId = ruleId ? ReactiveCache.getBoardByRuleId(ruleId) : null;
    const board = boardId ? ReactiveCache.getBoard(boardId) : null;
    const ruleData = ruleId ? ReactiveCache.getRule(ruleId) : null;
    const adminStatus = board ? board.hasAdmin(user._id) : false;

    return {
      currentUser: user,
      currentBoard: board,
      rule: ruleData,
      isBoardAdmin: adminStatus,
    };
  }, [ruleId]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    }
  }, [onBack]);

  // Handle edit rule
  const handleEdit = useCallback(() => {
    if (onEdit && rule) {
      onEdit(rule);
    }
  }, [onEdit, rule]);

  // Handle delete rule
  const handleDelete = useCallback(async () => {
    if (!rule || !confirm(t('confirm-delete-rule'))) return;

    try {
      if (onDelete) {
        await onDelete(rule);
      } else {
        // TODO: Implement direct Meteor call if no callback provided
        console.log('Delete rule:', rule._id);
      }
    } catch (err) {
      console.error('Error deleting rule:', err);
      setError(err.message);
    }
  }, [rule, onDelete, t]);

  if (!currentUser) {
    return (
      <div className="rule-details error">
        <div className="error-message">
          <i className="fa fa-exclamation-triangle"></i>
          {t('error-notAuthorized')}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rule-details loading">
        <div className="loading-spinner">
          <i className="fa fa-spinner fa-spin"></i>
          {t('loading-rule')}
        </div>
      </div>
    );
  }

  if (!rule) {
    return (
      <div className="rule-details not-found">
        <div className="not-found-message">
          <i className="fa fa-question-circle"></i>
          <h3>{t('rule-not-found')}</h3>
          <p>{t('rule-not-found-description')}</p>
          <button 
            className="btn btn-primary"
            onClick={handleBack}
          >
            {t('back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rules js-rule-details">
      <div className="rule-header">
        <h2>
          <i className="fa fa-magic"></i>
          {t('r-rule-details')}
        </h2>
        
        <div className="rule-actions">
          {isBoardAdmin && (
            <>
              <button 
                className="btn btn-sm btn-primary js-edit-rule"
                onClick={handleEdit}
                title={t('edit-rule')}
              >
                <i className="fa fa-edit"></i>
                {t('edit')}
              </button>
              
              <button 
                className="btn btn-sm btn-danger js-delete-rule"
                onClick={handleDelete}
                title={t('delete-rule')}
              >
                <i className="fa fa-trash-o"></i>
                {t('delete')}
              </button>
            </>
          )}
          
          {onClose && (
            <button 
              className="btn btn-sm btn-close"
              onClick={onClose}
              title={t('close')}
            >
              <i className="fa fa-times"></i>
            </button>
          )}
        </div>
      </div>

      <div className="rule-content">
        <div className="triggers-content">
          <div className="triggers-body">
            <div className="triggers-main-body">
              <h4>
                <i className="fa fa-bolt"></i>
                {t('r-trigger')}
              </h4>
              
              <div className="trigger-item">
                <div className="trigger-content">
                  <div className="trigger-text">
                    {rule.trigger ? (
                      <div className="trigger-details">
                        <div className="trigger-type">
                          <strong>{t('trigger-type')}:</strong> {rule.trigger.type || t('not-specified')}
                        </div>
                        
                        {rule.trigger.conditions && (
                          <div className="trigger-conditions">
                            <strong>{t('conditions')}:</strong>
                            <ul>
                              {rule.trigger.conditions.map((condition, index) => (
                                <li key={index}>
                                  {condition.field} {condition.operator} {condition.value}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {rule.trigger.description && (
                          <div className="trigger-description">
                            <strong>{t('description')}:</strong> {rule.trigger.description}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="no-trigger">
                        {t('no-trigger-configured')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <h4>
                <i className="fa fa-cog"></i>
                {t('r-action')}
              </h4>
              
              <div className="action-item">
                <div className="action-content">
                  <div className="action-text">
                    {rule.action ? (
                      <div className="action-details">
                        <div className="action-type">
                          <strong>{t('action-type')}:</strong> {rule.action.type || t('not-specified')}
                        </div>
                        
                        {rule.action.parameters && (
                          <div className="action-parameters">
                            <strong>{t('parameters')}:</strong>
                            <ul>
                              {Object.entries(rule.action.parameters).map(([key, value]) => (
                                <li key={key}>
                                  <strong>{key}:</strong> {String(value)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {rule.action.description && (
                          <div className="action-description">
                            <strong>{t('description')}:</strong> {rule.action.description}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="no-action">
                        {t('no-action-configured')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {rule.description && (
          <div className="rule-description">
            <h4>
              <i className="fa fa-info-circle"></i>
              {t('description')}
            </h4>
            <p>{rule.description}</p>
          </div>
        )}

        {rule.enabled !== undefined && (
          <div className="rule-status">
            <h4>
              <i className="fa fa-toggle-on"></i>
              {t('status')}
            </h4>
            <div className={`status-badge ${rule.enabled ? 'enabled' : 'disabled'}`}>
              {rule.enabled ? t('enabled') : t('disabled')}
            </div>
          </div>
        )}

        {rule.createdAt && (
          <div className="rule-meta">
            <h4>
              <i className="fa fa-calendar"></i>
              {t('metadata')}
            </h4>
            <div className="meta-info">
              <div className="meta-item">
                <strong>{t('created')}:</strong> {new Date(rule.createdAt).toLocaleString()}
              </div>
              {rule.updatedAt && (
                <div className="meta-item">
                  <strong>{t('updated')}:</strong> {new Date(rule.updatedAt).toLocaleString()}
                </div>
              )}
              {rule.createdBy && (
                <div className="meta-item">
                  <strong>{t('created-by')}:</strong> {rule.createdBy}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <i className="fa fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      <div className="rules-back">
        <button 
          className="js-goback btn btn-secondary"
          onClick={handleBack}
        >
          <i className="fa fa-chevron-left"></i>
          {t('back')}
        </button>
      </div>
    </div>
  );
};

export default RuleDetails;
