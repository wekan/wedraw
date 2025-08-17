import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { ReactiveCache } from '/imports/reactiveCache';
import { useNavigate } from 'react-router-dom';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * Subtasks Component
 * 
 * Replaces the original Blaze subtasks components with a React component.
 * This component manages card subtasks, including:
 * - Subtask creation and editing
 * - Subtask deletion and archiving
 * - Subtask navigation and details
 * - Board admin controls
 * - Subtask filtering and exceptions
 * 
 * Original Blaze components had:
 * - subtasks: Main subtask management
 * - subtaskItemDetail: Individual subtask details
 * - subtaskActionsPopup: Subtask actions menu
 * - editSubtaskItemForm: Subtask editing form
 */
const Subtasks = ({ card, onSubtaskUpdate, onClose }) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentUser, subtasks, isBoardAdmin, targetBoard, targetList, targetSwimlane } = useTracker(() => {
    const user = ReactiveCache.getCurrentUser();
    if (!user || !card) return { 
      currentUser: null, 
      subtasks: [], 
      isBoardAdmin: false,
      targetBoard: null,
      targetList: null,
      targetSwimlane: null
    };

    const currentBoard = ReactiveCache.getBoard(card.boardId);
    const adminStatus = user.isBoardAdmin();
    
    // Get subtasks (cards with this card as parent)
    const cardSubtasks = ReactiveCache.getCards({ parentId: card._id });
    
    // Get target board for subtasks
    const subtasksBoard = currentBoard?.getDefaultSubtasksBoard();
    const subtasksList = subtasksBoard?.getDefaultSubtasksListId();
    
    // Get target swimlane
    let targetSwimlaneId = null;
    if (currentBoard && subtasksBoard) {
      const parentSwimlane = ReactiveCache.getSwimlane({
        boardId: currentBoard._id,
        _id: card.swimlaneId,
      });
      
      if (parentSwimlane) {
        const matchingSwimlane = ReactiveCache.getSwimlane({
          boardId: subtasksBoard._id,
          title: parentSwimlane.title,
        });
        
        targetSwimlaneId = matchingSwimlane?._id || subtasksBoard.getDefaultSwimline()?._id;
      }
    }

    return {
      currentUser: user,
      subtasks: cardSubtasks,
      isBoardAdmin: adminStatus,
      targetBoard: subtasksBoard,
      targetList: subtasksList,
      targetSwimlane: targetSwimlaneId,
    };
  }, [card]);

  // Handle adding new subtask
  const handleAddSubtask = useCallback(async (event) => {
    event.preventDefault();
    
    const title = newSubtaskTitle.trim();
    if (!title || !targetBoard || !targetList || !targetSwimlane) return;

    setIsSubmitting(true);
    try {
      const nextCardNumber = targetBoard.getNextCardNumber();
      
      const subtaskId = await Meteor.call('cards.insert', {
        title,
        parentId: card._id,
        members: [],
        labelIds: [],
        customFields: [],
        listId: targetList,
        boardId: targetBoard._id,
        sort: -1,
        swimlaneId: targetSwimlane,
        type: 'cardType-card',
        cardNumber: nextCardNumber
      });

      // Add exception to filter if active
      if (typeof Filter !== 'undefined' && Filter.addException) {
        Filter.addException(subtaskId);
      }

      setNewSubtaskTitle('');
      setIsAddingSubtask(false);
      
      if (onSubtaskUpdate) {
        onSubtaskUpdate();
      }
    } catch (error) {
      console.error('Error adding subtask:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [newSubtaskTitle, targetBoard, targetList, targetSwimlane, card, onSubtaskUpdate]);

  // Handle editing subtask
  const handleEditSubtask = useCallback(async (subtask, newTitle) => {
    const title = newTitle.trim();
    if (!title || title === subtask.title) return;

    try {
      await Meteor.call('cards.update', subtask._id, { title });
      
      if (onSubtaskUpdate) {
        onSubtaskUpdate();
      }
    } catch (error) {
      console.error('Error updating subtask:', error);
    }
  }, [onSubtaskUpdate]);

  // Handle deleting subtask
  const handleDeleteSubtask = useCallback(async (subtask) => {
    if (!subtask || !subtask._id) return;

    if (confirm(t('confirm-delete-subtask'))) {
      try {
        await Meteor.call('cards.archive', subtask._id);
        
        if (onSubtaskUpdate) {
          onSubtaskUpdate();
        }
      } catch (error) {
        console.error('Error deleting subtask:', error);
      }
    }
  }, [onSubtaskUpdate, t]);

  // Handle viewing subtask details
  const handleViewSubtask = useCallback((subtask) => {
    if (!subtask) return;
    
    const board = subtask.board();
    if (board) {
      navigate(`/board/${board._id}/${board.slug}?cardId=${subtask._id}`);
    }
  }, [navigate]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event, action) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      action();
    }
  }, []);

  // Start editing a subtask
  const startEditing = useCallback((subtask) => {
    setEditingSubtaskId(subtask._id);
    setEditingTitle(subtask.title);
  }, []);

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setEditingSubtaskId(null);
    setEditingTitle('');
  }, []);

  // Save editing changes
  const saveEditing = useCallback(async () => {
    if (!editingSubtaskId) return;
    
    const subtask = subtasks.find(s => s._id === editingSubtaskId);
    if (subtask) {
      await handleEditSubtask(subtask, editingTitle);
    }
    
    cancelEditing();
  }, [editingSubtaskId, editingTitle, subtasks, handleEditSubtask, cancelEditing]);

  const renderSubtaskItem = (subtask) => {
    const isEditing = editingSubtaskId === subtask._id;
    const isCompleted = subtask.isCompleted?.() || false;

    return (
      <div key={subtask._id} className={`subtask-item ${isCompleted ? 'completed' : ''}`}>
        <div className="subtask-content">
          {isEditing ? (
            <div className="subtask-edit-form">
              <textarea
                className="form-control js-edit-subtask-item"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, saveEditing)}
                autoFocus
              />
              <div className="subtask-edit-actions">
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={saveEditing}
                >
                  {t('save')}
                </button>
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={cancelEditing}
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          ) : (
            <div className="subtask-display">
              <div className="subtask-title">
                {subtask.title}
              </div>
              
              <div className="subtask-meta">
                <span className="subtask-number">#{subtask.cardNumber}</span>
                {subtask.members?.length > 0 && (
                  <span className="subtask-members">
                    <i className="fa fa-users"></i>
                    {subtask.members.length}
                  </span>
                )}
                {subtask.dueDate && (
                  <span className="subtask-due-date">
                    <i className="fa fa-calendar"></i>
                    {new Date(subtask.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="subtask-actions">
          {!isEditing && (
            <>
              <button 
                className="btn btn-sm js-edit-subtask"
                onClick={() => startEditing(subtask)}
                title={t('edit-subtask')}
              >
                <i className="fa fa-pencil"></i>
              </button>
              
              <button 
                className="btn btn-sm js-view-subtask"
                onClick={() => handleViewSubtask(subtask)}
                title={t('view-subtask')}
              >
                <i className="fa fa-external-link"></i>
              </button>
              
              {isBoardAdmin && (
                <button 
                  className="btn btn-sm btn-danger js-delete-subtask"
                  onClick={() => handleDeleteSubtask(subtask)}
                  title={t('delete-subtask')}
                >
                  <i className="fa fa-trash"></i>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderAddSubtaskForm = () => (
    <div className="add-subtask-form">
      <form onSubmit={handleAddSubtask} className="js-add-subtask">
        <div className="form-group">
          <textarea
            className="form-control js-add-subtask-item"
            placeholder={t('add-subtask-placeholder')}
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, handleAddSubtask)}
            rows={2}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting || !newSubtaskTitle.trim()}
          >
            {isSubmitting ? t('adding') : t('add-subtask')}
          </button>
          
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => {
              setIsAddingSubtask(false);
              setNewSubtaskTitle('');
            }}
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
    <div className="subtasks js-subtasks">
      <div className="subtasks-header">
        <h3>
          <i className="fa fa-tasks"></i>
          {t('subtasks')} ({subtasks.length})
        </h3>
        
        {!isAddingSubtask && (
          <button 
            className="btn btn-sm btn-primary js-add-subtask"
            onClick={() => setIsAddingSubtask(true)}
          >
            <i className="fa fa-plus"></i>
            {t('add-subtask')}
          </button>
        )}
      </div>
      
      <div className="subtasks-content">
        {subtasks.length > 0 ? (
          <div className="subtasks-list">
            {subtasks.map(renderSubtaskItem)}
          </div>
        ) : (
          <div className="no-subtasks">
            <p>{t('no-subtasks')}</p>
          </div>
        )}
        
        {isAddingSubtask && renderAddSubtaskForm()}
      </div>
    </div>
  );
};

export default Subtasks;
