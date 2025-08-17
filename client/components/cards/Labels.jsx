import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { ReactiveCache } from '/imports/reactiveCache';
import { Boards } from '/models/boards';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * Labels Component
 * 
 * Replaces the original Jade labels template with a React component.
 * This component manages card labels, including:
 * - Displaying labels on cards
 * - Adding/removing labels from cards
 * - Creating new labels
 * - Editing existing labels
 * - Drag and drop reordering
 * 
 * Original Jade template had:
 * - Label display with colors
 * - Label management interface
 * - Color palette selection
 * - Drag and drop functionality
 */
const Labels = ({ card, board, onLabelToggle, onLabelEdit, onLabelAdd }) => {
  const [currentColor, setCurrentColor] = useState('');
  const [showCreateLabel, setShowCreateLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('');

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { labelColors, currentUser } = useTracker(() => {
    // Get label colors from board schema
          const colors = Boards.easySchema()._schema['labels.$.color']?.allowedValues || [
      'green', 'yellow', 'orange', 'red', 'purple', 'blue', 'sky', 'lime', 'pink', 'black'
    ];

    return {
      labelColors: colors,
      currentUser: ReactiveCache.getCurrentUser(),
    };
  }, []);

  // Set default color when component mounts
  useEffect(() => {
    if (labelColors.length > 0 && !newLabelColor) {
      const usedColors = board?.labels?.map(label => label.color) || [];
      const availableColors = labelColors.filter(color => !usedColors.includes(color));
      setNewLabelColor(availableColors.length > 0 ? availableColors[0] : labelColors[0]);
    }
  }, [labelColors, board, newLabelColor]);

  const handleLabelToggle = (labelId) => {
    if (onLabelToggle) {
      onLabelToggle(labelId);
    } else {
      // Default behavior
      card.toggleLabel(labelId);
    }
  };

  const handleCreateLabel = (event) => {
    event.preventDefault();
    const name = newLabelName.trim();
    const color = newLabelColor;
    
    if (!name || !color) return;

    // Create label using Meteor method
    Meteor.call('labels.insert', {
      boardId: board._id,
      name: name,
      color: color,
    });

    setNewLabelName('');
    setShowCreateLabel(false);
  };

  const handleEditLabel = (labelId) => {
    if (onLabelEdit) {
      onLabelEdit(labelId);
    } else {
      // Default behavior - open edit popup
      if (typeof Popup !== 'undefined') {
        Popup.open('editLabel')({ labelId });
      }
    }
  };

  const handleAddLabel = () => {
    if (onLabelAdd) {
      onLabelAdd();
    } else {
      setShowCreateLabel(true);
    }
  };

  const renderLabel = (label) => (
    <div 
      key={label._id} 
      className={`card-label card-label-${label.color} js-card-label-item`}
      title={label.name}
    >
      <div className="label-handle">
        <i className="fa fa-grip-vertical"></i>
      </div>
      
      <div className="label-content">
        <span className="label-name">{label.name}</span>
      </div>

      <div className="label-actions">
        <a 
          className="js-edit-label"
          title={t('edit')}
          onClick={() => handleEditLabel(label._id)}
        >
          <i className="fa fa-pencil"></i>
        </a>
      </div>
    </div>
  );

  const renderColorPalette = () => (
    <div className="label-color-palette">
      {labelColors.map(color => (
        <div
          key={color}
          className={`palette-color js-palette-color ${color} ${newLabelColor === color ? 'selected' : ''}`}
          onClick={() => setNewLabelColor(color)}
          title={color}
        ></div>
      ))}
    </div>
  );

  const renderCreateLabelForm = () => (
    <div className="create-label-form">
      <h3>{t('create-label')}</h3>
      <form onSubmit={handleCreateLabel}>
        <div className="form-group">
          <label htmlFor="labelName">{t('label-name')}</label>
          <input
            id="labelName"
            type="text"
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            placeholder={t('enter-label-name')}
            autoFocus
            required
          />
        </div>
        
        <div className="form-group">
          <label>{t('label-color')}</label>
          {renderColorPalette()}
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {t('create')}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => setShowCreateLabel(false)}
          >
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  );

  const renderCardLabels = () => {
    if (!card.labels || card.labels.length === 0) {
      return (
        <div className="no-labels">
          {t('no-labels')}
        </div>
      );
    }

    return (
      <div className="card-labels">
        {card.labels.map(labelId => {
          const label = board.labels?.find(l => l._id === labelId);
          if (!label) return null;
          
          return (
            <div
              key={label._id}
              className={`card-label card-label-${label.color}`}
              title={label.name}
              onClick={() => handleLabelToggle(labelId)}
            >
              <span className="label-name">{label.name}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderLabelSelector = () => (
    <div className="label-selector">
      <h3>{t('select-labels')}</h3>
      
      <div className="available-labels">
        {board.labels?.map(label => (
          <div
            key={label._id}
            className={`label-option ${card.labels?.includes(label._id) ? 'selected' : ''}`}
            onClick={() => handleLabelToggle(label._id)}
          >
            <div className={`label-color ${label.color}`}></div>
            <span className="label-name">{label.name}</span>
            {card.labels?.includes(label._id) && (
              <i className="fa fa-check"></i>
            )}
          </div>
        ))}
      </div>
      
      <div className="label-actions">
        <button 
          className="btn btn-secondary js-edit-label"
          onClick={() => handleEditLabel()}
        >
          <i className="fa fa-pencil"></i>
          {t('edit-labels')}
        </button>
        
        <button 
          className="btn btn-primary js-add-label"
          onClick={handleAddLabel}
        >
          <i className="fa fa-plus"></i>
          {t('add-label')}
        </button>
      </div>
    </div>
  );

  if (!board) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="labels-component">
      {/* Display labels on card */}
      {renderCardLabels()}
      
      {/* Label selector popup content */}
      {renderLabelSelector()}
      
      {/* Create label form */}
      {showCreateLabel && renderCreateLabelForm()}
    </div>
  );
};

export default Labels;
