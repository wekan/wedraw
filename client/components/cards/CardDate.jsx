import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import moment from 'moment';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * CardDate Component
 * 
 * Replaces the original Jade cardDate template with a React component.
 * This component manages card dates, including:
 * - Received date (when card was received)
 * - Start date (when work begins)
 * - Due date (when card is due)
 * - End date (when work is completed)
 * - Date editing and validation
 * 
 * Original Jade template had:
 * - Date display with status indicators
 * - Date editing popups
 * - Date validation and constraints
 * - Status-based styling
 */
const CardDate = ({ card, onDateUpdate }) => {
  const [showDatePicker, setShowDatePicker] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentUser } = useTracker(() => {
    return {
      currentUser: Meteor.user(),
    };
  }, []);

  const now = moment();

  const getDateStatus = (date, type) => {
    if (!date) return '';
    
    const theDate = moment(date);
    let classes = `${type}-date `;
    
    switch (type) {
      case 'received':
        // Received date logic
        if (theDate.isAfter(now)) {
          classes += 'future';
        } else {
          classes += 'current';
        }
        break;
        
      case 'start':
        // Start date logic
        const dueAt = card?.dueAt;
        const endAt = card?.endAt;
        if ((endAt && theDate.isAfter(endAt)) || (dueAt && theDate.isAfter(dueAt))) {
          classes += 'long-overdue';
        } else if (theDate.isAfter(now)) {
          classes += 'future';
        } else {
          classes += 'current';
        }
        break;
        
      case 'due':
        // Due date logic
        const endAtDue = card?.endAt;
        if (endAtDue && theDate.isAfter(endAtDue)) {
          classes += 'current'; // Done early
        } else if (endAtDue) {
          classes += ''; // Don't flag due date if there's an end date
        } else if (now.diff(theDate, 'days') >= 2) {
          classes += 'long-overdue';
        } else if (now.diff(theDate, 'minute') >= 0) {
          classes += 'due';
        } else if (now.diff(theDate, 'days') >= -1) {
          classes += 'almost-due';
        }
        break;
        
      case 'end':
        // End date logic
        const startAt = card?.startAt;
        const dueAtEnd = card?.dueAt;
        if (startAt && theDate.isBefore(startAt)) {
          classes += 'early';
        } else if (dueAtEnd && theDate.isBefore(dueAtEnd)) {
          classes += 'early';
        } else if (dueAtEnd && theDate.isAfter(dueAtEnd)) {
          classes += 'overdue';
        } else {
          classes += 'current';
        }
        break;
        
      default:
        classes += 'current';
    }
    
    return classes.trim();
  };

  const getDateTitle = (date, type) => {
    if (!date) return '';
    
    const typeKey = `card-${type}-on`;
    return `${t(typeKey)} ${moment(date).format('LLLL')}`;
  };

  const handleDateClick = (type) => {
    setShowDatePicker(type);
    setSelectedDate(card?.[`${type}At`] || '');
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleDateSubmit = async () => {
    if (!showDatePicker) return;
    
    setIsSubmitting(true);
    try {
      const dateValue = selectedDate ? moment(selectedDate).toDate() : null;
      
      if (onDateUpdate) {
        await onDateUpdate(showDatePicker, dateValue);
      } else {
        // Default behavior - update card date
        const updateData = {};
        updateData[`${showDatePicker}At`] = dateValue;
        
        await Meteor.call('cards.update', card._id, updateData);
      }
      
      setShowDatePicker(null);
      setSelectedDate(null);
    } catch (error) {
      console.error('Error updating date:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateDelete = async () => {
    if (!showDatePicker) return;
    
    setIsSubmitting(true);
    try {
      if (onDateUpdate) {
        await onDateUpdate(showDatePicker, null);
      } else {
        // Default behavior - unset card date
        const updateData = {};
        updateData[`${showDatePicker}At`] = null;
        
        await Meteor.call('cards.update', card._id, updateData);
      }
      
      setShowDatePicker(null);
      setSelectedDate(null);
    } catch (error) {
      console.error('Error deleting date:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateCancel = () => {
    setShowDatePicker(null);
    setSelectedDate(null);
  };

  const renderDateBadge = (date, type, label) => {
    if (!date) return null;
    
    const statusClass = getDateStatus(date, type);
    const title = getDateTitle(date, type);
    
    return (
      <div 
        key={type}
        className={`date-badge ${statusClass}`}
        title={title}
      >
        <span className="date-label">{label}</span>
        <span className="date-value">
          {moment(date).format('MMM D, YYYY')}
        </span>
        <a 
          className="js-edit-date"
          onClick={() => handleDateClick(type)}
          title={t('edit-date')}
        >
          <i className="fa fa-pencil"></i>
        </a>
      </div>
    );
  };

  const renderDatePicker = () => {
    if (!showDatePicker) return null;
    
    const dateType = showDatePicker;
    const currentDate = card?.[`${dateType}At`];
    const label = t(`card-${dateType}-date`);
    
    return (
      <div className="date-picker-popup">
        <div className="date-picker-header">
          <h3>{t('edit')} {label}</h3>
        </div>
        
        <div className="date-picker-content">
          <div className="form-group">
            <label htmlFor="dateInput">{label}</label>
            <input
              id="dateInput"
              type="datetime-local"
              value={selectedDate ? moment(selectedDate).format('YYYY-MM-DDTHH:mm') : ''}
              onChange={(e) => handleDateChange(e.target.value)}
              className="form-control"
            />
          </div>
          
          <div className="date-picker-actions">
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleDateSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? t('saving') : t('save')}
            </button>
            
            {currentDate && (
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={handleDateDelete}
                disabled={isSubmitting}
              >
                {t('delete')}
              </button>
            )}
            
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleDateCancel}
              disabled={isSubmitting}
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!card) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="card-dates js-card-dates">
      <div className="card-dates-header">
        <h3>
          <i className="fa fa-calendar"></i>
          {t('dates')}
        </h3>
      </div>
      
      <div className="card-dates-content">
        {/* Received Date */}
        {renderDateBadge(card.receivedAt, 'received', t('received'))}
        
        {/* Start Date */}
        {renderDateBadge(card.startAt, 'start', t('start'))}
        
        {/* Due Date */}
        {renderDateBadge(card.dueAt, 'due', t('due'))}
        
        {/* End Date */}
        {renderDateBadge(card.endAt, 'end', t('end'))}
        
        {/* Add Date Button */}
        <div className="add-date-section">
          <a 
            className="js-add-date"
            onClick={() => handleDateClick('due')}
          >
            <i className="fa fa-plus"></i>
            {t('add-date')}
          </a>
        </div>
      </div>
      
      {/* Date Picker Popup */}
      {renderDatePicker()}
    </div>
  );
};

export default CardDate;
