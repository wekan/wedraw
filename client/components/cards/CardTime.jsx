import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { ReactiveCache } from '/imports/reactiveCache';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * CardTime Component
 * 
 * Replaces the original Blaze cardTime components with a React component.
 * This component manages card time tracking, including:
 * - Spent time display and editing
 * - Overtime tracking
 * - Time validation and storage
 * - Time deletion
 * 
 * Original Blaze components had:
 * - editCardSpentTimePopup: Time editing popup
 * - timeBadge: Time display badge
 * - Overtime toggle functionality
 * - Time validation and storage
 */
const CardTime = ({ card, onTimeUpdate, onTimeDelete, onClose }) => {
  const [spentTime, setSpentTime] = useState('');
  const [isOvertime, setIsOvertime] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentUser } = useTracker(() => {
    return {
      currentUser: ReactiveCache.getCurrentUser(),
    };
  }, []);

  // Initialize state from card data
  useEffect(() => {
    if (card) {
      setSpentTime(card.getSpentTime() || '');
      setIsOvertime(card.getIsOvertime() || false);
    }
  }, [card]);

  const handleTimeSubmit = async (event) => {
    event.preventDefault();
    
    const timeValue = parseFloat(spentTime);
    if (timeValue < 0) {
      setError('invalid-time');
      return;
    }

    setIsSubmitting(true);
    try {
      if (onTimeUpdate) {
        await onTimeUpdate(timeValue, isOvertime);
      } else {
        // Default behavior - update card time
        await Meteor.call('cards.update', card._id, {
          spentTime: timeValue,
          isOvertime: isOvertime,
        });
      }
      
      setIsEditing(false);
      setError('');
      if (onClose) onClose();
    } catch (error) {
      console.error('Error updating card time:', error);
      setError('update-failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimeDelete = async () => {
    setIsSubmitting(true);
    try {
      if (onTimeDelete) {
        await onTimeDelete();
      } else {
        // Default behavior - delete card time
        await Meteor.call('cards.update', card._id, {
          spentTime: null,
          isOvertime: false,
        });
      }
      
      setSpentTime('');
      setIsOvertime(false);
      setIsEditing(false);
      if (onClose) onClose();
    } catch (error) {
      console.error('Error deleting card time:', error);
      setError('delete-failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleOvertime = () => {
    setIsOvertime(!isOvertime);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setError('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    // Reset to original values
    setSpentTime(card?.getSpentTime() || '');
    setIsOvertime(card?.getIsOvertime() || false);
  };

  const renderTimeBadge = () => {
    const currentSpentTime = card?.getSpentTime();
    const currentIsOvertime = card?.getIsOvertime();

    if (!currentSpentTime) {
      return (
        <div className="time-badge no-time">
          <span className="time-label">{t('no-time-tracked')}</span>
          <a 
            className="js-edit-time"
            onClick={handleEditClick}
            title={t('add-time')}
          >
            <i className="fa fa-plus"></i>
          </a>
        </div>
      );
    }

    const title = currentIsOvertime
      ? `${t('overtime')} ${currentSpentTime} ${t('hours')}`
      : `${t('card-spent')} ${currentSpentTime} ${t('hours')}`;

    return (
      <div className={`time-badge ${currentIsOvertime ? 'overtime' : 'normal'}`}>
        <span className="time-value">
          {currentSpentTime} {t('hours')}
        </span>
        
        {currentIsOvertime && (
          <span className="overtime-indicator">
            <i className="fa fa-exclamation-triangle"></i>
          </span>
        )}
        
        <a 
          className="js-edit-time"
          onClick={handleEditClick}
          title={t('edit-time')}
        >
          <i className="fa fa-pencil"></i>
        </a>
      </div>
    );
  };

  const renderEditForm = () => (
    <div className="edit-time-form">
      <h3>{t('edit-spent-time')}</h3>
      
      <form onSubmit={handleTimeSubmit}>
        <div className="form-group">
          <label htmlFor="timeInput">{t('spent-time-hours')}</label>
          <input
            id="timeInput"
            type="number"
            name="time"
            className="form-control"
            value={spentTime}
            onChange={(e) => setSpentTime(e.target.value)}
            step="0.5"
            min="0"
            required
            autoFocus
          />
        </div>
        
        <div className="form-group">
          <label className="checkbox">
            <input
              type="checkbox"
              checked={isOvertime}
              onChange={handleToggleOvertime}
            />
            <span className="checkbox-label">{t('mark-as-overtime')}</span>
          </label>
        </div>
        
        {error && (
          <div className="form-error">
            <p className="text-danger">{t(error)}</p>
          </div>
        )}
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('saving') : t('save')}
          </button>
          
          {card?.getSpentTime() && (
            <button 
              type="button" 
              className="btn btn-danger js-delete-time"
              onClick={handleTimeDelete}
              disabled={isSubmitting}
            >
              {t('delete')}
            </button>
          )}
          
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  );

  if (!card) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="card-time js-card-time">
      <div className="card-time-header">
        <h3>
          <i className="fa fa-clock-o"></i>
          {t('spent-time')}
        </h3>
      </div>
      
      <div className="card-time-content">
        {isEditing ? renderEditForm() : renderTimeBadge()}
      </div>
    </div>
  );
};

export default CardTime;
