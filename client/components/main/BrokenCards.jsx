import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { ReactiveCache } from '/imports/reactiveCache';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * BrokenCards Component
 * 
 * Replaces the original Blaze brokenCards component with a React component.
 * This component provides a view for displaying broken cards that need attention.
 * 
 * Original Blaze component had:
 * - brokenCardsHeaderBar: Header bar for broken cards view
 * - brokenCards: Main broken cards display component
 * - CardSearchPagedComponent integration
 */
const BrokenCards = ({ onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [brokenCards, setBrokenCards] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

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
    const session = `brokenCards-${Date.now()}`;

    return {
      currentUser: user,
      sessionId: session
    };
  }, []);

  // Load broken cards
  useEffect(() => {
    if (!currentUser) return;

    const loadBrokenCards = async () => {
      try {
        setLoading(true);
        
        // Subscribe to broken cards
        await new Promise((resolve, reject) => {
          Meteor.subscribe('brokenCards', sessionId, {
            onReady: resolve,
            onError: reject
          });
        });

        // Get broken cards from ReactiveCache
        const cards = ReactiveCache.getBrokenCards() || [];
        setBrokenCards(cards);
        setTotalCount(cards.length);
      } catch (err) {
        console.error('Error loading broken cards:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBrokenCards();
  }, [currentUser, sessionId]);

  // Handle page change
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Handle card click
  const handleCardClick = useCallback((card) => {
    // TODO: Navigate to card or open card details
    console.log('Card clicked:', card);
  }, []);

  if (!currentUser) {
    return (
      <div className="broken-cards error">
        <div className="error-message">
          <i className="fa fa-exclamation-triangle"></i>
          {t('error-notAuthorized')}
        </div>
      </div>
    );
  }

  return (
    <div className="broken-cards js-broken-cards">
      {/* Header Bar */}
      <BrokenCardsHeaderBar 
        totalCount={totalCount}
        currentPage={currentPage}
        onClose={onClose}
      />

      {/* Main Content */}
      <div className="broken-cards-content">
        {loading ? (
          <div className="loading-spinner">
            <i className="fa fa-spinner fa-spin"></i>
            {t('loading')}
          </div>
        ) : (
          <BrokenCardsList 
            cards={brokenCards}
            onCardClick={handleCardClick}
            currentPage={currentPage}
            totalCount={totalCount}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

/**
 * BrokenCardsHeaderBar Component
 * 
 * Header bar for broken cards view
 */
const BrokenCardsHeaderBar = ({ totalCount, currentPage, onClose }) => {
  const t = (key) => enTranslations[key] || key;

  return (
    <div className="broken-cards-header-bar js-broken-cards-header-bar">
      <div className="header-title">
        <i className="fa fa-exclamation-triangle"></i>
        <span>{t('broken-cards')}</span>
        {totalCount > 0 && (
          <span className="card-count">({totalCount})</span>
        )}
      </div>

      <div className="header-actions">
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
 * BrokenCardsList Component
 * 
 * List of broken cards with pagination
 */
const BrokenCardsList = ({ 
  cards, 
  onCardClick, 
  currentPage, 
  totalCount, 
  onPageChange 
}) => {
  const t = (key) => enTranslations[key] || key;

  if (!cards || cards.length === 0) {
    return (
      <div className="no-broken-cards">
        <div className="no-cards-message">
          <i className="fa fa-check-circle"></i>
          <p>{t('no-broken-cards')}</p>
          <small>{t('all-cards-are-healthy')}</small>
        </div>
      </div>
    );
  }

  return (
    <div className="broken-cards-list js-broken-cards-list">
      {/* Cards List */}
      <div className="cards-container">
        {cards.map(card => (
          <BrokenCardItem
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
 * BrokenCardItem Component
 * 
 * Individual broken card item
 */
const BrokenCardItem = ({ card, onClick }) => {
  const t = (key) => enTranslations[key] || key;

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(card);
    }
  }, [card, onClick]);

  return (
    <div className="broken-card-item js-broken-card-item" onClick={handleClick}>
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

        {card.swimlaneTitle && (
          <div className="card-swimlane">
            <i className="fa fa-layer-group"></i>
            {card.swimlaneTitle}
          </div>
        )}
      </div>

      <div className="card-issues">
        {card.issues && card.issues.map((issue, index) => (
          <div key={index} className="card-issue">
            <i className="fa fa-exclamation-circle"></i>
            {t(issue.type) || issue.message}
          </div>
        ))}
      </div>

      <div className="card-actions">
        <button
          className="btn btn-sm btn-primary"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implement fix action
            console.log('Fix card:', card._id);
          }}
        >
          <i className="fa fa-wrench"></i>
          {t('fix')}
        </button>
      </div>
    </div>
  );
};

/**
 * PaginationControls Component
 * 
 * Pagination controls for broken cards list
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

export default BrokenCards;
