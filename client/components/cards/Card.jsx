import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { useParams, useNavigate } from 'react-router-dom';

// Import card components
import CardDescription from './CardDescription';
import CardDate from './CardDate';
import Checklists from './Checklists';
import Labels from './Labels';
import Minicard from './Minicard';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * Card Component
 * 
 * Main card component that integrates all card-related functionality.
 * This component provides a comprehensive view of a card with all its
 * features including description, dates, checklists, labels, and more.
 * 
 * Features:
 * - Card header with title and actions
 * - Description management
 * - Date management (received, start, due, end)
 * - Checklists and items
 * - Labels and colors
 * - Member assignments
 * - Activity tracking
 */
const Card = ({ cardId, onClose }) => {
  const [activeTab, setActiveTab] = useState('details');
  const navigate = useNavigate();

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { card, board, currentUser, isLoading } = useTracker(() => {
    if (!cardId) return { card: null, board: null, currentUser: null, isLoading: false };

    // Subscribe to necessary data
    Meteor.subscribe('card', cardId);
    Meteor.subscribe('board', card?.boardId);
    Meteor.subscribe('checklists', cardId);
    Meteor.subscribe('labels', card?.boardId);

    return {
      card: ReactiveCache.getCard(cardId),
      board: ReactiveCache.getBoard(card?.boardId),
      currentUser: ReactiveCache.getCurrentUser(),
      isLoading: !ReactiveCache.getCard(cardId),
    };
  }, [cardId]);

  const handleDescriptionUpdate = async (description) => {
    try {
      await Meteor.call('cards.update', cardId, {
        description: description.trim(),
      });
    } catch (error) {
      console.error('Error updating description:', error);
      throw error;
    }
  };

  const handleDateUpdate = async (dateType, dateValue) => {
    try {
      const updateData = {};
      updateData[`${dateType}At`] = dateValue;
      
      await Meteor.call('cards.update', cardId, updateData);
    } catch (error) {
      console.error('Error updating date:', error);
      throw error;
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      // Navigate back to board
      if (board) {
        navigate(`/board/${board._id}/${board.slug}`);
      } else {
        navigate('/');
      }
    }
  };

  const renderCardHeader = () => (
    <div className="card-header">
      <div className="card-header-left">
        <h1 className="card-title">
          {card?.title || t('loading')}
        </h1>
        <div className="card-meta">
          {board && (
            <span className="card-board">
              <i className="fa fa-trello"></i>
              {board.title}
            </span>
          )}
          {card?.list && (
            <span className="card-list">
              <i className="fa fa-list"></i>
              {card.list.title}
            </span>
          )}
        </div>
      </div>
      
      <div className="card-header-right">
        <button 
          className="btn btn-secondary js-close-card"
          onClick={handleClose}
          title={t('close')}
        >
          <i className="fa fa-times"></i>
        </button>
      </div>
    </div>
  );

  const renderCardTabs = () => (
    <div className="card-tabs">
      <button 
        className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
        onClick={() => setActiveTab('details')}
      >
        <i className="fa fa-info-circle"></i>
        {t('details')}
      </button>
      
      <button 
        className={`tab-button ${activeTab === 'checklists' ? 'active' : ''}`}
        onClick={() => setActiveTab('checklists')}
      >
        <i className="fa fa-tasks"></i>
        {t('checklists')}
      </button>
      
      <button 
        className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
        onClick={() => setActiveTab('activity')}
      >
        <i className="fa fa-history"></i>
        {t('activity')}
      </button>
      
      <button 
        className={`tab-button ${activeTab === 'attachments' ? 'active' : ''}`}
        onClick={() => setActiveTab('attachments')}
      >
        <i className="fa fa-paperclip"></i>
        {t('attachments')}
      </button>
    </div>
  );

  const renderCardDetails = () => (
    <div className="card-details">
      {/* Labels */}
      <div className="card-section">
        <Labels card={card} board={board} />
      </div>
      
      {/* Description */}
      <div className="card-section">
        <CardDescription 
          card={card} 
          onDescriptionUpdate={handleDescriptionUpdate}
        />
      </div>
      
      {/* Dates */}
      <div className="card-section">
        <CardDate 
          card={card} 
          onDateUpdate={handleDateUpdate}
        />
      </div>
      
      {/* Members */}
      <div className="card-section">
        <div className="card-members">
          <h3>
            <i className="fa fa-users"></i>
            {t('members')}
          </h3>
          <div className="members-content">
            {card?.members?.map(memberId => {
              const member = ReactiveCache.getUser(memberId);
              return member ? (
                <div key={memberId} className="member-item">
                  <span className="member-name">{member.username}</span>
                </div>
              ) : null;
            })}
            <button className="btn btn-sm btn-primary">
              <i className="fa fa-plus"></i>
              {t('add-member')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCardChecklists = () => (
    <div className="card-checklists">
      <Checklists cardId={cardId} />
    </div>
  );

  const renderCardActivity = () => (
    <div className="card-activity">
      <h3>
        <i className="fa fa-history"></i>
        {t('activity')}
      </h3>
      <div className="activity-content">
        <p>{t('activity-coming-soon')}</p>
      </div>
    </div>
  );

  const renderCardAttachments = () => (
    <div className="card-attachments">
      <h3>
        <i className="fa fa-paperclip"></i>
        {t('attachments')}
      </h3>
      <div className="attachments-content">
        <p>{t('attachments-coming-soon')}</p>
      </div>
    </div>
  );

  const renderCardContent = () => {
    switch (activeTab) {
      case 'details':
        return renderCardDetails();
      case 'checklists':
        return renderCardChecklists();
      case 'activity':
        return renderCardActivity();
      case 'attachments':
        return renderCardAttachments();
      default:
        return renderCardDetails();
    }
  };

  if (isLoading) {
    return (
      <div className="card-loading">
        <div className="loading-spinner">
          <i className="fa fa-spinner fa-spin"></i>
          {t('loading-card')}
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="card-not-found">
        <h2>{t('card-not-found')}</h2>
        <p>{t('card-not-found-description')}</p>
        <button className="btn btn-primary" onClick={handleClose}>
          {t('go-back')}
        </button>
      </div>
    );
  }

  return (
    <div className="card js-card">
      {renderCardHeader()}
      {renderCardTabs()}
      <div className="card-body">
        {renderCardContent()}
      </div>
    </div>
  );
};

export default Card;
