import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { ReactiveCache } from '/imports/reactiveCache';

// Import components
import Minicard from '../cards/Minicard';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * SidebarSearches Component
 * 
 * Replaces the original sidebarSearches Blaze component with a React component.
 * This component provides search functionality in the sidebar, including:
 * - Search input for cards and lists
 * - Search results display
 * - Card and list search results
 * - Mini card interactions
 * 
 * Original Blaze component had:
 * - Search term input and form
 * - Card search results with minicards
 * - List search results
 * - Click handling for mini cards
 */
const SidebarSearches = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentBoard, searchResults, isLoading } = useTracker(() => {
    const board = ReactiveCache.getCurrentBoard();
    if (!board) return { currentBoard: null, searchResults: { cards: [], lists: [] }, isLoading: false };

    // Subscribe to necessary data
    Meteor.subscribe('board', board._id);

    return {
      currentBoard: board,
      searchResults: {
        cards: board.searchCards(searchTerm),
        lists: board.searchLists(searchTerm),
      },
      isLoading: false,
    };
  }, [searchTerm]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const term = formData.get('searchTerm')?.trim() || '';
    setSearchTerm(term);
  };

  const handleCardClick = (evt, card) => {
    if (Utils.isMiniScreen()) {
      evt.preventDefault();
      Session.set('popupCardId', card._id);
      openCardDetailsPopup(evt);
    }
  };

  const openCardDetailsPopup = (event) => {
    if (typeof Popup !== 'undefined' && !Popup.isOpen()) {
      Popup.open("cardDetails")(event);
    }
  };

  const renderSearchForm = () => (
    <form className="js-search-term-form" onSubmit={handleSearchSubmit}>
      <div className="search-input-wrapper">
        <input
          type="text"
          name="searchTerm"
          className="form-control"
          placeholder={t('search-cards-and-lists')}
          defaultValue={searchTerm}
        />
        <button type="submit" className="btn btn-primary">
          <i className="fa fa-search"></i>
        </button>
      </div>
    </form>
  );

  const renderCardResults = () => {
    if (!searchResults.cards || searchResults.cards.length === 0) {
      return null;
    }

    return (
      <div className="search-cards-section">
        <h4>
          <i className="fa fa-credit-card"></i>
          {t('cards')} ({searchResults.cards.length})
        </h4>
        <div className="search-cards-content">
          {searchResults.cards.map(card => (
            <div key={card._id} className="search-card-item">
              <a 
                className="js-minicard"
                onClick={(evt) => handleCardClick(evt, card)}
              >
                <Minicard card={card} />
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderListResults = () => {
    if (!searchResults.lists || searchResults.lists.length === 0) {
      return null;
    }

    return (
      <div className="search-lists-section">
        <h4>
          <i className="fa fa-list"></i>
          {t('lists')} ({searchResults.lists.length})
        </h4>
        <div className="search-lists-content">
          {searchResults.lists.map(list => (
            <div key={list._id} className="search-list-item">
              <div className="list-info">
                <span className="list-title">{list.title}</span>
                <span className="list-board">{list.board?.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSearchResults = () => {
    if (!searchTerm) {
      return (
        <div className="search-placeholder">
          <p>{t('search-placeholder-text')}</p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="search-loading">
          <i className="fa fa-spinner fa-spin"></i>
          {t('searching')}
        </div>
      );
    }

    const hasResults = (searchResults.cards && searchResults.cards.length > 0) ||
                     (searchResults.lists && searchResults.lists.length > 0);

    if (!hasResults) {
      return (
        <div className="search-no-results">
          <p>{t('no-search-results')}</p>
          <p className="search-term">{t('search-term')}: "{searchTerm}"</p>
        </div>
      );
    }

    return (
      <div className="search-results">
        {renderCardResults()}
        {renderListResults()}
      </div>
    );
  };

  if (!currentBoard) {
    return (
      <div className="sidebar-searches">
        <div className="sidebar-section-header">
          <h3>
            <i className="fa fa-search"></i>
            {t('search')}
          </h3>
        </div>
        <div className="sidebar-content">
          <p>{t('no-board-selected')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar-searches js-search-sidebar">
      <div className="sidebar-section-header">
        <h3>
          <i className="fa fa-search"></i>
          {t('search')}
        </h3>
      </div>
      
      <div className="sidebar-content">
        {renderSearchForm()}
        {renderSearchResults()}
      </div>
    </div>
  );
};

export default SidebarSearches;
