import React, { useState, useEffect, useRef } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * CardDescription Component
 * 
 * Replaces the original Jade cardDescription template with a React component.
 * This component manages card descriptions, including:
 * - Displaying existing descriptions
 * - Editing descriptions inline
 * - Markdown support
 * - Keyboard shortcuts (Ctrl+Enter to submit)
 * 
 * Original Jade template had:
 * - Description display with markdown rendering
 * - Inline editing form
 * - Submit and cancel actions
 * - Keyboard shortcuts support
 */
const CardDescription = ({ card, onDescriptionUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef(null);

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentDescription } = useTracker(() => {
    return {
      currentDescription: card?.description || '',
    };
  }, [card?.description]);

  // Update local state when card description changes
  useEffect(() => {
    setDescription(currentDescription);
  }, [currentDescription]);

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Set cursor to end of text
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  const handleEditClick = () => {
    setIsEditing(true);
    setDescription(currentDescription);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setDescription(currentDescription);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!description.trim() && !currentDescription) {
      // Don't save empty descriptions
      setIsEditing(false);
      return;
    }

    setIsSubmitting(true);
    try {
      if (onDescriptionUpdate) {
        await onDescriptionUpdate(description);
      } else {
        // Default behavior - update card description
        await Meteor.call('cards.update', card._id, {
          description: description.trim(),
        });
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating description:', error);
      // Revert to original description on error
      setDescription(currentDescription);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (event) => {
    // Ctrl+Enter or Cmd+Enter to submit
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      handleSubmit(event);
    }
    
    // Escape to cancel
    if (event.key === 'Escape') {
      handleCancel();
    }
  };

  const renderDescription = () => {
    if (!currentDescription) {
      return (
        <div className="card-description-empty">
          <p className="text-muted">
            {t('no-description')}
            <a 
              className="js-edit-description"
              onClick={handleEditClick}
            >
              {t('add-description')}
            </a>
          </p>
        </div>
      );
    }

    return (
      <div className="card-description-content">
        <div className="description-text">
          {/* This would integrate with a markdown renderer */}
          <div 
            className="markdown-content"
            dangerouslySetInnerHTML={{ 
              __html: currentDescription.replace(/\n/g, '<br>') 
            }}
          />
        </div>
        <div className="description-actions">
          <a 
            className="js-edit-description"
            onClick={handleEditClick}
          >
            <i className="fa fa-pencil"></i>
            {t('edit')}
          </a>
        </div>
      </div>
    );
  };

  const renderEditForm = () => (
    <form 
      className="js-card-description description-edit-form"
      onSubmit={handleSubmit}
    >
      <div className="form-group">
        <textarea
          ref={textareaRef}
          className="js-new-description-input form-control"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('enter-description')}
          rows={4}
          disabled={isSubmitting}
        />
      </div>
      
      <div className="form-actions">
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? t('saving') : t('save')}
        </button>
        <button 
          type="button" 
          className="btn btn-secondary"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          {t('cancel')}
        </button>
      </div>
      
      <div className="form-help">
        <small className="text-muted">
          {t('description-help')} {t('use-ctrl-enter-to-save')}
        </small>
      </div>
    </form>
  );

  return (
    <div className="card-description js-card-description">
      <div className="card-description-header">
        <h3>
          <i className="fa fa-align-left"></i>
          {t('description')}
        </h3>
      </div>
      
      <div className="card-description-body">
        {isEditing ? renderEditForm() : renderDescription()}
      </div>
    </div>
  );
};

export default CardDescription;
