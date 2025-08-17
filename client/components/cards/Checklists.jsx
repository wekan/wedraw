import React, { useState, useEffect, useRef } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { ReactiveCache } from '/imports/reactiveCache';
import { TAPi18n } from '/imports/i18n';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * Checklists Component
 * 
 * Replaces the original Jade checklists template with a React component.
 * This component manages checklists for cards, including:
 * - Adding/editing checklists
 * - Adding/editing checklist items
 * - Drag and drop sorting
 * - Progress tracking
 * - Converting items to cards
 * 
 * Original Jade template had:
 * - Checklist management interface
 * - Item management interface
 * - Progress indicators
 * - Action menus and forms
 */
const Checklists = ({ cardId, position = 'bottom' }) => {
  const [editingChecklist, setEditingChecklist] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [showAddChecklist, setShowAddChecklist] = useState(false);
  const [showAddItem, setShowAddItem] = useState(null);
  const itemsDomRef = useRef(null);

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { card, checklists, currentUser } = useTracker(() => {
    // Subscribe to necessary data
    Meteor.subscribe('card', cardId);
    Meteor.subscribe('checklists', cardId);

    return {
      card: ReactiveCache.getCard(cardId),
      checklists: ReactiveCache.getCard(cardId)?.checklists() || [],
      currentUser: ReactiveCache.getCurrentUser(),
    };
  }, [cardId]);

  // Initialize sorting when component mounts
  useEffect(() => {
    if (itemsDomRef.current) {
      initSorting(itemsDomRef.current);
    }
  }, [checklists]);

  const initSorting = (itemsDom) => {
    // This would need to be implemented with a modern drag-and-drop library
    // like react-beautiful-dnd or @dnd-kit/core
    console.log('Sorting initialized for:', itemsDom);
  };

  const handleAddChecklist = (event) => {
    event.preventDefault();
    const title = newChecklistTitle.trim();
    if (!title) return;

    let actualCardId = cardId;
    if (card?.isLinkedCard()) {
      actualCardId = card.linkedId;
    }

    let sortIndex;
    if (position === 'top') {
      sortIndex = Utils.calculateIndexData(null, card?.firstChecklist()).base;
    } else {
      sortIndex = Utils.calculateIndexData(card?.lastChecklist(), null).base;
    }

    // Add checklist using Meteor method
    Meteor.call('checklists.insert', {
      cardId: actualCardId,
      title: title,
      sort: sortIndex,
    });

    setNewChecklistTitle('');
    setShowAddChecklist(false);
  };

  const handleEditChecklist = (checklistId, newTitle) => {
    if (!newTitle.trim()) return;

    Meteor.call('checklists.update', checklistId, {
      title: newTitle.trim(),
    });

    setEditingChecklist(null);
  };

  const handleDeleteChecklist = (checklistId) => {
    if (confirm(t('delete-checklist-confirmation'))) {
      Meteor.call('checklists.delete', checklistId);
    }
  };

  const handleAddChecklistItem = (checklistId, event) => {
    event.preventDefault();
    const title = newItemTitle.trim();
    if (!title) return;

    let actualCardId = cardId;
    if (card?.isLinkedCard()) {
      actualCardId = card.linkedId;
    }

    const checklist = checklists.find(c => c._id === checklistId);
    const sortIndex = Utils.calculateIndexData(checklist?.lastItem(), null).base;

    Meteor.call('checklistItems.insert', {
      checklistId: checklistId,
      cardId: actualCardId,
      title: title,
      sort: sortIndex,
    });

    setNewItemTitle('');
    setShowAddItem(null);
  };

  const handleEditChecklistItem = (itemId, newTitle) => {
    if (!newTitle.trim()) return;

    Meteor.call('checklistItems.update', itemId, {
      title: newTitle.trim(),
    });

    setEditingItem(null);
  };

  const handleDeleteChecklistItem = (itemId) => {
    if (confirm(t('delete-checklist-item-confirmation'))) {
      Meteor.call('checklistItems.delete', itemId);
    }
  };

  const handleToggleChecklistItem = (itemId, isFinished) => {
    Meteor.call('checklistItems.update', itemId, {
      isFinished: !isFinished,
    });
  };

  const handleConvertToCard = (itemId) => {
    // This would open a popup to convert checklist item to card
    if (typeof Popup !== 'undefined') {
      Popup.open('convertChecklistItemToCard')({ itemId });
    }
  };

  const renderChecklistItem = (item, checklist) => (
    <div key={item._id} className="checklist-item js-checklist-item">
      <div className="checklist-item-handle">
        <i className="fa fa-grip-vertical"></i>
      </div>
      
      <div className="checklist-item-content">
        {editingItem === item._id ? (
          <form onSubmit={(e) => {
            e.preventDefault();
            handleEditChecklistItem(item._id, newItemTitle);
          }}>
            <input
              type="text"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              onBlur={() => setEditingItem(null)}
              autoFocus
            />
          </form>
        ) : (
          <div className="checklist-item-title">
            <input
              type="checkbox"
              checked={item.isFinished}
              onChange={() => handleToggleChecklistItem(item._id, item.isFinished)}
            />
            <span 
              className={item.isFinished ? 'finished' : ''}
              onDoubleClick={() => {
                setEditingItem(item._id);
                setNewItemTitle(item.title);
              }}
            >
              {item.title}
            </span>
          </div>
        )}
      </div>

      <div className="checklist-item-actions">
        <a 
          className="js-convert-checklist-item-to-card"
          title={t('convert-checklist-item-to-card')}
          onClick={() => handleConvertToCard(item._id)}
        >
          <i className="fa fa-external-link"></i>
        </a>
        <a 
          className="js-delete-checklist-item"
          title={t('delete')}
          onClick={() => handleDeleteChecklistItem(item._id)}
        >
          <i className="fa fa-trash"></i>
        </a>
      </div>
    </div>
  );

  const renderChecklist = (checklist) => (
    <div key={checklist._id} className="checklist js-checklist">
      <div className="checklist-header">
        {editingChecklist === checklist._id ? (
          <form onSubmit={(e) => {
            e.preventDefault();
            handleEditChecklist(checklist._id, newChecklistTitle);
          }}>
            <input
              type="text"
              value={newChecklistTitle}
              onChange={(e) => setNewChecklistTitle(e.target.value)}
              onBlur={() => setEditingChecklist(null)}
              autoFocus
            />
          </form>
        ) : (
          <div className="checklist-title">
            <span 
              onDoubleClick={() => {
                setEditingChecklist(checklist._id);
                setNewChecklistTitle(checklist.title);
              }}
            >
              {checklist.title}
            </span>
            <div className="checklist-actions">
              <a 
                className="js-open-checklist-details-menu"
                title={t('checklist-actions')}
                onClick={() => {
                  if (typeof Popup !== 'undefined') {
                    Popup.open('checklistActions')({ checklistId: checklist._id });
                  }
                }}
              >
                <i className="fa fa-cog"></i>
              </a>
              <a 
                className="js-delete-checklist"
                title={t('delete')}
                onClick={() => handleDeleteChecklist(checklist._id)}
              >
                <i className="fa fa-trash"></i>
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="checklist-progress">
        <div className="checklist-progress-bar">
          <div 
            className="checklist-progress-fill"
            style={{ width: `${checklist.finishedPercent()}%` }}
          ></div>
        </div>
        <span className="checklist-progress-text">
          {checklist.finishedCount()}/{checklist.itemCount()}
        </span>
      </div>

      <div className="checklist-items js-checklist-items" ref={itemsDomRef}>
        {checklist.items().map(item => renderChecklistItem(item, checklist))}
        
        {showAddItem === checklist._id && (
          <form 
            className="js-add-checklist-item"
            onSubmit={(e) => handleAddChecklistItem(checklist._id, e)}
          >
            <input
              type="text"
              placeholder={t('add-checklist-item')}
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn btn-primary">
              {t('add')}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => setShowAddItem(null)}
            >
              {t('cancel')}
            </button>
          </form>
        )}
      </div>

      <div className="checklist-footer">
        <a 
          className="js-add-checklist-item"
          onClick={() => setShowAddItem(checklist._id)}
        >
          <i className="fa fa-plus"></i>
          {t('add-checklist-item')}
        </a>
      </div>
    </div>
  );

  if (!card) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="checklists js-checklists">
      <div className="checklists-header">
        <h3>{t('checklists')}</h3>
        <div className="checklists-actions">
          <label className="checkbox">
            <input
              type="checkbox"
              id="toggleHideFinishedChecklist"
              checked={card.hideFinishedChecklist}
              onChange={() => card.toggleHideFinishedChecklist()}
            />
            {t('hide-finished-checklist')}
          </label>
        </div>
      </div>

      <div className="checklists-content">
        {checklists.map(checklist => renderChecklist(checklist))}
        
        {showAddChecklist && (
          <form className="js-add-checklist" onSubmit={handleAddChecklist}>
            <input
              type="text"
              placeholder={t('add-checklist')}
              value={newChecklistTitle}
              onChange={(e) => setNewChecklistTitle(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn btn-primary">
              {t('add')}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => setShowAddChecklist(false)}
            >
              {t('cancel')}
            </button>
          </form>
        )}
      </div>

      <div className="checklists-footer">
        <a 
          className="js-add-checklist"
          onClick={() => setShowAddChecklist(true)}
        >
          <i className="fa fa-plus"></i>
          {t('add-checklist')}
        </a>
      </div>
    </div>
  );
};

export default Checklists;
