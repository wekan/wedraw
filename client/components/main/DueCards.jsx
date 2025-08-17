import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { ReactiveCache } from '/imports/reactiveCache';
import { Utils } from '/imports/utils';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * DueCards Component
 * 
 * Replaces the original Blaze dueCards component with a React component.
 * This component provides a view for displaying cards with due dates,
 * with filtering options for personal vs. all cards and sorting capabilities.
 * 
 * Original Blaze component had:
 * - dueCardsHeaderBar: Header bar for due cards view
 * - dueCards: Main due cards display component
 * - dueCardsViewChangePopup: View change popup
 * - CardSearchPagedComponent integration
 */
const DueCards = ({ onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [dueCards, setDueCards] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState('me');

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentUser, sessionId } = useTracker(() => {
    const user = ReactiveCache.getCurrentUser();
    if (!user) return {
      currentUser: null,
      sessionId: null
    };

    // Generate session ID for this component instance
    const session = `dueCards-${Date.now()}`;

    return {
      currentUser: user,
      sessionId: session
    };
  }, []);

  // Load due cards
  useEffect(() => {
    if (!currentUser) return;

    const loadDueCards = async () => {
      try {
        setLoading(true);
        
        // Build query parameters for due cards
        const queryParams = {
          hasDueAt: true,
          sortBy: 'dueAt',
          sortOrder: 'ascending',
          viewMode: viewMode
        };

        // If view mode is 'me', filter by current user
        if (viewMode !== 'all') {
          queryParams.userId = currentUser._id;
        }

        // TODO: Implement due cards search using Meteor methods
        // For now, we'll simulate loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get due cards from ReactiveCache or search results
        const cards = await searchDueCards(queryParams);
        setDueCards(cards);
        setTotalCount(cards.length);
      } catch (err) {
        console.error('Error loading due cards:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDueCards();
  }, [currentUser, sessionId, viewMode]);

  // Search for due cards
  const searchDueCards = async (queryParams) => {
    // TODO: Implement actual due cards search
    // This would typically use Meteor.call or ReactiveCache methods
    
    // Simulate search results for now
    const mockCards = [
      {
        _id: '1',
        title: 'Sample Due Card 1',
        dueAt: new Date(Date.now() + 86400000), // Tomorrow
        boardTitle: 'Sample Board',
        listTitle: 'Sample List',
        cardNumber: '001',
        isOverdue: false
      },
      {
        _id: '2',
        title: 'Sample Due Card 2',
        dueAt: new Date(Date.now() - 86400000), // Yesterday
        boardTitle: 'Sample Board',
        listTitle: 'Sample List',
        cardNumber: '002',
        isOverdue: true
      }
    ];

    return mockCards;
  };

  // Handle page change
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Handle view mode change
  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
    setCurrentPage(1); // Reset to first page
  }, []);

  // Handle card click
  const handleCardClick = useCallback((card) => {
    // TODO: Navigate to card or open card details
    console.log('Card clicked:', card);
  }, []);

  if (!currentUser) {
    return (
      <div className="due-cards error">
        <div className="error-message">
          <i className="fa fa-exclamation-triangle"></i>
          {t('error-notAuthorized')}
        </div>
      </div>
    );
  }

  return (
    <div className="due-cards js-due-cards">
      {/* Header Bar */}
      <DueCardsHeaderBar 
        totalCount={totalCount}
        currentPage={currentPage}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onClose={onClose}
      />

      {/* Main Content */}
      <div className="due-cards-content">
        {loading ? (
          <div className="loading-spinner">
            <i className="fa fa-spinner fa-spin"></i>
            {t('loading')}
          </div>
        ) : (
          <DueCardsList 
            cards={dueCards}
            onCardClick={handleCardClick}
            currentPage={currentPage}
            totalCount={totalCount}
            onPageChange={handlePageChange}
            viewMode={viewMode}
          />
        )}
      </div>

      {/* View Change Popup */}
      <DueCardsViewChangePopup
        currentViewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onClose={() => {}}
      />
    </div>
  );
};

/**
 * DueCardsHeaderBar Component
 * 
 * Header bar for due cards view
 */
const DueCardsHeaderBar = ({ 
  totalCount, 
  currentPage, 
  viewMode, 
  onViewModeChange, 
  onClose 
}) => {
  const t = (key) => enTranslations[key] || key;

  const handleViewChangeClick = useCallback(() => {
    // TODO: Open view change popup
    console.log('Open view change popup');
  }, []);

  return (
    <div className="due-cards-header-bar js-due-cards-header-bar">
      <div className="header-title">
        <i className="fa fa-clock"></i>
        <span>{t('due-cards')}</span>
        {totalCount > 0 && (
          <span className="card-count">({totalCount})</span>
        )}
      </div>

      <div className="header-actions">
        <button
          className="js-due-cards-view-change btn btn-sm btn-secondary"
          onClick={handleViewChangeClick}
          title={t('change-view')}
        >
          <i className="fa fa-eye"></i>
          {viewMode === 'me' ? t('my-cards') : t('all-cards')}
        </button>

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
  );
};

/**
 * DueCardsList Component
 * 
 * List of due cards with pagination
 */
const DueCardsList = ({ 
  cards, 
  onCardClick, 
  currentPage, 
  totalCount, 
  onPageChange,
  viewMode 
}) => {
  const t = (key) => enTranslations[key] || key;

  if (!cards || cards.length === 0) {
    return (
      <div className="no-due-cards">
        <div className="no-cards-message">
          <i className="fa fa-check-circle"></i>
          <p>{t('no-due-cards')}</p>
          <small>
            {viewMode === 'me' 
              ? t('you-have-no-due-cards') 
              : t('no-cards-have-due-dates')
            }
          </small>
        </div>
      </div>
    );
  }

  // Sort cards by due date
  const sortedCards = [...cards].sort((a, b) => {
    const x = a.dueAt === null ? new Date('2100-12-31') : new Date(a.dueAt);
    const y = b.dueAt === null ? new Date('2100-12-31') : new Date(b.dueAt);
    return x - y;
  });

  return (
    <div className="due-cards-list js-due-cards-list">
      {/* Cards List */}
      <div className="cards-container">
        {sortedCards.map(card => (
          <DueCardItem
            key={card._id}
            card={card}
            onClick={onCardClick}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalCount > 10 && (
        <div className="pagination">
          <PaginationControls
            currentPage={currentPage}
            totalCount={totalCount}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

/**
 * DueCardItem Component
 * 
 * Individual due card item
 */
const DueCardItem = ({ card, onClick }) => {
  const t = (key) => enTranslations[key] || key;

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(card);
    }
  }, [card, onClick]);

  // Calculate due status
  const getDueStatus = () => {
    if (!card.dueAt) return 'no-due-date';
    
    const now = new Date();
    const dueDate = new Date(card.dueAt);
    const diffMs = dueDate - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMs < 0) return 'overdue';
    if (diffDays === 0) return 'due-today';
    if (diffDays === 1) return 'due-tomorrow';
    if (diffDays <= 7) return 'due-soon';
    return 'due-later';
  };

  const dueStatus = getDueStatus();
  const isOverdue = dueStatus === 'overdue';

  // Format due date
  const formatDueDate = () => {
    if (!card.dueAt) return t('no-due-date');
    
    const dueDate = new Date(card.dueAt);
    const now = new Date();
    const diffMs = dueDate - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMs < 0) {
      const overdueDays = Math.abs(diffDays);
      return t('overdue-by-days', { days: overdueDays });
    }
    
    if (diffDays === 0) return t('due-today');
    if (diffDays === 1) return t('due-tomorrow');
    if (diffDays <= 7) return t('due-in-days', { days: diffDays });
    
    return dueDate.toLocaleDateString();
  };

  return (
    <div 
      className={`due-card-item js-due-card-item ${dueStatus}`}
      onClick={handleClick}
    >
      <div className="card-header">
        <div className="card-title">
          {card.title || t('untitled-card')}
        </div>
        <div className="card-id">
          #{card.cardNumber || card._id}
        </div>
      </div>

      <div className="card-details">
        <div className="card-board">
          <i className="fa fa-columns"></i>
          {card.boardTitle || t('unknown-board')}
        </div>
        
        <div className="card-list">
          <i className="fa fa-list"></i>
          {card.listTitle || t('unknown-list')}
        </div>
      </div>

      <div className="card-due-info">
        <div className={`due-status ${dueStatus}`}>
          <i className={`fa ${isOverdue ? 'fa-exclamation-triangle' : 'fa-clock'}`}></i>
          <span className="due-text">{formatDueDate()}</span>
        </div>

        {card.dueAt && (
          <div className="due-time">
            {new Date(card.dueAt).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        )}
      </div>

      <div className="card-actions">
        <button
          className="btn btn-sm btn-primary"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implement mark as done or extend due date
            console.log('Card action:', card._id);
          }}
        >
          <i className="fa fa-check"></i>
          {isOverdue ? t('mark-done') : t('extend')}
        </button>
      </div>
    </div>
  );
};

/**
 * DueCardsViewChangePopup Component
 * 
 * Popup for changing due cards view mode
 */
const DueCardsViewChangePopup = ({ currentViewMode, onViewModeChange, onClose }) => {
  const t = (key) => enTranslations[key] || key;

  const handleViewModeChange = useCallback((mode) => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
    if (onClose) {
      onClose();
    }
  }, [onViewModeChange, onClose]);

  return (
    <div className="due-cards-view-change-popup js-due-cards-view-change-popup">
      <div className="popup-header">
        <h3>{t('change-due-cards-view')}</h3>
      </div>

      <div className="popup-content">
        <button
          className={`js-due-cards-view-me btn btn-block ${currentViewMode === 'me' ? 'active' : ''}`}
          onClick={() => handleViewModeChange('me')}
        >
          <i className="fa fa-user"></i>
          {t('my-due-cards')}
        </button>

        <button
          className={`js-due-cards-view-all btn btn-block ${currentViewMode === 'all' ? 'active' : ''}`}
          onClick={() => handleViewModeChange('all')}
        >
          <i className="fa fa-globe"></i>
          {t('all-due-cards')}
        </button>
      </div>

      <div className="popup-footer">
        <button
          className="btn btn-secondary"
          onClick={onClose}
        >
          {t('cancel')}
        </button>
      </div>
    </div>
  );
};

/**
 * PaginationControls Component
 * 
 * Pagination controls for due cards list
 */
const PaginationControls = ({ currentPage, totalCount, onPageChange }) => {
  const t = (key) => enTranslations[key] || key;
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePageChange = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  }, [onPageChange, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="pagination-controls">
      <button
        className="btn btn-sm btn-secondary"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <i className="fa fa-chevron-left"></i>
        {t('previous')}
      </button>

      <span className="page-info">
        {t('page')} {currentPage} {t('of')} {totalPages}
      </span>

      <button
        className="btn btn-sm btn-secondary"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        {t('next')}
        <i className="fa fa-chevron-right"></i>
      </button>
    </div>
  );
};

export default DueCards;
