import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { ReactiveCache } from '/imports/reactiveCache';
import { Session } from 'meteor/session';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * SidebarArchives Component
 * 
 * Replaces the original Blaze sidebarArchives component with a React component.
 * This component manages archived items in the sidebar, including:
 * - Archived cards, lists, and swimlanes
 * - Restore and delete functionality
 * - Tab-based navigation
 * - Board-specific archives
 * - Admin controls and permissions
 * 
 * Original Blaze component had:
 * - archivesSidebar: Main archives sidebar
 * - Tab navigation (cards, lists, swimlanes)
 * - Archive management (restore, delete)
 * - Board-specific data loading
 * - Permission checks
 */
const SidebarArchives = ({ onClose, onItemUpdate }) => {
  const [activeTab, setActiveTab] = useState('cards');
  const [isLoading, setIsLoading] = useState(true);
  const [isArchiveReady, setIsArchiveReady] = useState(false);

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentUser, currentBoard, isBoardAdmin, isWorker } = useTracker(() => {
    const user = ReactiveCache.getCurrentUser();
    if (!user) return { 
      currentUser: null, 
      currentBoard: null, 
      isBoardAdmin: false, 
      isWorker: false 
    };

    const boardId = Session.get('currentBoard');
    const board = boardId ? ReactiveCache.getBoard(boardId) : null;
    const adminStatus = board ? board.hasAdmin(user._id) : false;
    const workerStatus = board ? board.hasWorker(user._id) : false;

    return {
      currentUser: user,
      currentBoard: board,
      isBoardAdmin: adminStatus,
      isWorker: workerStatus,
    };
  }, []);

  // Subscribe to board data
  useEffect(() => {
    if (!currentBoard) return;

    const subscription = Meteor.subscribe('board', currentBoard._id, true, {
      onReady: () => {
        setIsArchiveReady(true);
        setIsLoading(false);
      },
    });

    return () => {
      subscription.stop();
    };
  }, [currentBoard]);

  // Tab configuration
  const tabs = [
    { name: t('cards'), slug: 'cards' },
    { name: t('lists'), slug: 'lists' },
    { name: t('swimlanes'), slug: 'swimlanes' },
  ];

  // Get archived items based on active tab
  const getArchivedItems = useCallback(() => {
    if (!currentBoard) return [];

    const boardId = currentBoard._id;
    const sortOptions = { sort: { archivedAt: -1, modifiedAt: -1 } };

    switch (activeTab) {
      case 'cards':
        return ReactiveCache.getCards(
          { archived: true, boardId },
          sortOptions
        );
      case 'lists':
        return ReactiveCache.getLists(
          { archived: true, boardId },
          sortOptions
        );
      case 'swimlanes':
        return ReactiveCache.getSwimlanes(
          { archived: true, boardId },
          sortOptions
        );
      default:
        return [];
    }
  }, [activeTab, currentBoard]);

  // Handle restore item
  const handleRestoreItem = useCallback(async (item) => {
    try {
      if (item.canBeRestored && item.canBeRestored()) {
        await item.restore();
        if (onItemUpdate) onItemUpdate();
      }
    } catch (error) {
      console.error('Error restoring item:', error);
    }
  }, [onItemUpdate]);

  // Handle restore all items
  const handleRestoreAll = useCallback(async () => {
    const items = getArchivedItems();
    
    try {
      for (const item of items) {
        if (item.canBeRestored && item.canBeRestored()) {
          await item.restore();
        }
      }
      if (onItemUpdate) onItemUpdate();
    } catch (error) {
      console.error('Error restoring all items:', error);
    }
  }, [getArchivedItems, onItemUpdate]);

  // Handle delete item
  const handleDeleteItem = useCallback(async (item) => {
    if (!confirm(t('confirm-delete-item'))) return;

    try {
      if (activeTab === 'cards') {
        await Meteor.call('cards.remove', item._id);
      } else if (activeTab === 'lists') {
        await item.remove();
      } else if (activeTab === 'swimlanes') {
        await item.remove();
      }
      
      if (onItemUpdate) onItemUpdate();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }, [activeTab, onItemUpdate, t]);

  // Handle delete all items
  const handleDeleteAll = useCallback(async () => {
    const items = getArchivedItems();
    if (!confirm(t('confirm-delete-all-items'))) return;

    try {
      for (const item of items) {
        if (activeTab === 'cards') {
          await Meteor.call('cards.remove', item._id);
        } else if (activeTab === 'lists') {
          await item.remove();
        } else if (activeTab === 'swimlanes') {
          await item.remove();
        }
      }
      
      if (onItemUpdate) onItemUpdate();
    } catch (error) {
      console.error('Error deleting all items:', error);
    }
  }, [getArchivedItems, activeTab, onItemUpdate, t]);

  // Render archived cards
  const renderArchivedCards = () => {
    const cards = getArchivedItems();
    
    return (
      <div className="archived-cards">
        <div className="archived-header">
          <h4>{t('archived-cards')} ({cards.length})</h4>
          <div className="archived-actions">
            <button 
              className="btn btn-sm btn-primary js-restore-all-cards"
              onClick={handleRestoreAll}
              disabled={cards.length === 0}
            >
              <i className="fa fa-undo"></i>
              {t('restore-all')}
            </button>
            {isBoardAdmin && (
              <button 
                className="btn btn-sm btn-danger js-delete-all-cards"
                onClick={handleDeleteAll}
                disabled={cards.length === 0}
              >
                <i className="fa fa-trash"></i>
                {t('delete-all')}
              </button>
            )}
          </div>
        </div>
        
        <div className="archived-list">
          {cards.map(card => (
            <div key={card._id} className="archived-item card-item">
              <div className="item-info">
                <div className="item-title">{card.title}</div>
                <div className="item-meta">
                  <span className="archived-date">
                    {new Date(card.archivedAt).toLocaleDateString()}
                  </span>
                  {card.list && (
                    <span className="list-name">
                      {card.list().title}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="item-actions">
                <button 
                  className="btn btn-sm btn-primary js-restore-card"
                  onClick={() => handleRestoreItem(card)}
                  title={t('restore-card')}
                >
                  <i className="fa fa-undo"></i>
                </button>
                
                {isBoardAdmin && (
                  <button 
                    className="btn btn-sm btn-danger js-delete-card"
                    onClick={() => handleDeleteItem(card)}
                    title={t('delete-card')}
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {cards.length === 0 && (
            <div className="no-archived-items">
              <p>{t('no-archived-cards')}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render archived lists
  const renderArchivedLists = () => {
    const lists = getArchivedItems();
    
    return (
      <div className="archived-lists">
        <div className="archived-header">
          <h4>{t('archived-lists')} ({lists.length})</h4>
          <div className="archived-actions">
            <button 
              className="btn btn-sm btn-primary js-restore-all-lists"
              onClick={handleRestoreAll}
              disabled={lists.length === 0}
            >
              <i className="fa fa-undo"></i>
              {t('restore-all')}
            </button>
            {isBoardAdmin && (
              <button 
                className="btn btn-sm btn-danger js-delete-all-lists"
                onClick={handleDeleteAll}
                disabled={lists.length === 0}
              >
                <i className="fa fa-trash"></i>
                {t('delete-all')}
              </button>
            )}
          </div>
        </div>
        
        <div className="archived-list">
          {lists.map(list => (
            <div key={list._id} className="archived-item list-item">
              <div className="item-info">
                <div className="item-title">{list.title}</div>
                <div className="item-meta">
                  <span className="archived-date">
                    {new Date(list.archivedAt).toLocaleDateString()}
                  </span>
                  <span className="card-count">
                    {list.cards().length} {t('cards')}
                  </span>
                </div>
              </div>
              
              <div className="item-actions">
                <button 
                  className="btn btn-sm btn-primary js-restore-list"
                  onClick={() => handleRestoreItem(list)}
                  title={t('restore-list')}
                >
                  <i className="fa fa-undo"></i>
                </button>
                
                {isBoardAdmin && (
                  <button 
                    className="btn btn-sm btn-danger js-delete-list"
                    onClick={() => handleDeleteItem(list)}
                    title={t('delete-list')}
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {lists.length === 0 && (
            <div className="no-archived-items">
              <p>{t('no-archived-lists')}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render archived swimlanes
  const renderArchivedSwimlanes = () => {
    const swimlanes = getArchivedItems();
    
    return (
      <div className="archived-swimlanes">
        <div className="archived-header">
          <h4>{t('archived-swimlanes')} ({swimlanes.length})</h4>
          <div className="archived-actions">
            <button 
              className="btn btn-sm btn-primary js-restore-all-swimlanes"
              onClick={handleRestoreAll}
              disabled={swimlanes.length === 0}
            >
              <i className="fa fa-undo"></i>
              {t('restore-all')}
            </button>
            {isBoardAdmin && (
              <button 
                className="btn btn-sm btn-danger js-delete-all-swimlanes"
                onClick={handleDeleteAll}
                disabled={swimlanes.length === 0}
              >
                <i className="fa fa-trash"></i>
                {t('delete-all')}
              </button>
            )}
          </div>
        </div>
        
        <div className="archived-list">
          {swimlanes.map(swimlane => (
            <div key={swimlane._id} className="archived-item swimlane-item">
              <div className="item-info">
                <div className="item-title">{swimlane.title}</div>
                <div className="item-meta">
                  <span className="archived-date">
                    {new Date(swimlane.archivedAt).toLocaleDateString()}
                  </span>
                  <span className="list-count">
                    {swimlane.lists().length} {t('lists')}
                  </span>
                </div>
              </div>
              
              <div className="item-actions">
                <button 
                  className="btn btn-sm btn-primary js-restore-swimlane"
                  onClick={() => handleRestoreItem(swimlane)}
                  title={t('restore-swimlane')}
                >
                  <i className="fa fa-undo"></i>
                </button>
                
                {isBoardAdmin && (
                  <button 
                    className="btn btn-sm btn-danger js-delete-swimlane"
                    onClick={() => handleDeleteItem(swimlane)}
                    title={t('delete-swimlane')}
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {swimlanes.length === 0 && (
            <div className="no-archived-items">
              <p>{t('no-archived-swimlanes')}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'cards':
        return renderArchivedCards();
      case 'lists':
        return renderArchivedLists();
      case 'swimlanes':
        return renderArchivedSwimlanes();
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="sidebar-archives loading">
        <div className="loading-spinner">
          <i className="fa fa-spinner fa-spin"></i>
          <p>{t('loading-archives')}</p>
        </div>
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="sidebar-archives no-board">
        <div className="no-board-message">
          <i className="fa fa-exclamation-triangle"></i>
          <p>{t('no-board-selected')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar-archives js-sidebar-archives">
      <div className="archives-header">
        <h3>
          <i className="fa fa-archive"></i>
          {t('archives')}
        </h3>
        
        <div className="archives-actions">
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
      
      <div className="archives-tabs">
        {tabs.map(tab => (
          <button
            key={tab.slug}
            className={`tab-button ${activeTab === tab.slug ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.slug)}
          >
            {tab.name}
          </button>
        ))}
      </div>
      
      <div className="archives-content">
        {renderTabContent()}
      </div>
      
      <div className="archives-footer">
        <p className="note">
          <i className="fa fa-info-circle"></i>
          {t('archives-note')}
        </p>
      </div>
    </div>
  );
};

export default SidebarArchives;
