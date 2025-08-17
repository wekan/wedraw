import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import Minicard from './Minicard';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * ResultCard Component
 * 
 * Replaces the original Jade resultCard template with a React component.
 * This component displays a card in search results with context information
 * about the board, swimlane, and list it belongs to.
 * 
 * Original Jade template had:
 * - Card title with minicard display
 * - Board context with archive indicator
 * - Swimlane context with archive indicator  
 * - List context with archive indicator
 * - Context separators between each section
 */
const ResultCard = ({ card }) => {
  const navigate = useNavigate();

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data for board, swimlane, and list
  const { board, swimlane, list } = useTracker(() => {
    // Subscribe to necessary data
    if (card.boardId) {
      Meteor.subscribe('board', card.boardId);
    }
    if (card.swimlaneId) {
      Meteor.subscribe('swimlane', card.swimlaneId);
    }
    if (card.listId) {
      Meteor.subscribe('list', card.listId);
    }

    return {
      board: card.boardId ? ReactiveCache.getBoard(card.boardId) : null,
      swimlane: card.swimlaneId ? ReactiveCache.getSwimlane(card.swimlaneId) : null,
      list: card.listId ? ReactiveCache.getList(card.listId) : null,
    };
  }, [card.boardId, card.swimlaneId, card.listId]);

  const handleCardClick = (evt) => {
    evt.preventDefault();
    const cardId = card._id;
    const boardId = card.boardId;
    
    // Subscribe to popup card data
    Meteor.subscribe('popupCardData', cardId, {
      onReady() {
        Session.set('popupCardId', cardId);
        Session.set('popupCardBoardId', boardId);
        // Open card details popup
        if (typeof Popup !== 'undefined' && !Popup.isOpen()) {
          Popup.open("cardDetails")(evt);
        }
      },
    });
  };

  const renderContextItem = (title, item, itemId, archived) => (
    <li className="result-card-context" title={title}>
      <div className="result-card-block-wrapper">
        {itemId ? (
          <span>{item?.title || 'Loading...'}</span>
        ) : (
          <span className="broken-cards-null">NULL</span>
        )}
      </div>
      {archived && <i className="fa fa-archive"></i>}
    </li>
  );

  const renderSeparator = () => (
    <li className="result-card-context result-card-context-separator">
      {' '}
      {t('context-separator')}
      {' '}
    </li>
  );

  return (
    <div className="result-card-wrapper">
      <a 
        className="minicard-wrapper js-minicard card-title" 
        href={card.originRelativeUrl}
        onClick={handleCardClick}
      >
        <Minicard card={card} />
        {/* Commented out direct title display - using Minicard component instead */}
        {/* {card.title} */}
      </a>
      
      <ul className="result-card-context-list">
        {/* Board Context */}
        {renderContextItem(
          t('board'), 
          board, 
          card.boardId, 
          board?.archived
        )}
        
        {renderSeparator()}
        
        {/* Swimlane Context */}
        {renderContextItem(
          t('swimlane'), 
          swimlane, 
          card.swimlaneId, 
          swimlane?.archived
        )}
        
        {renderSeparator()}
        
        {/* List Context */}
        {renderContextItem(
          t('list'), 
          list, 
          card.listId, 
          list?.archived
        )}
      </ul>
    </div>
  );
};

export default ResultCard;
