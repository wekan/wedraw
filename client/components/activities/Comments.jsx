import React, { useState, useEffect, useRef } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { ReactiveCache } from '/imports/reactiveCache';
import moment from 'moment';

// Import components
import UserAvatar from '../users/UserAvatar';
import InlinedForm from '../forms/InlinedForm';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * Comments Component
 * 
 * Replaces the original Jade comments template with a React component.
 * This component manages card comments, including:
 * - Displaying existing comments
 * - Adding new comments
 * - Editing and deleting comments
 * - Comment reactions
 * - User avatars and metadata
 * 
 * Original Jade template had:
 * - Comment form for new comments
 * - Comment display with user info
 * - Inline editing of comments
 * - Comment reactions and emojis
 * - Delete confirmation popup
 */
const Comments = ({ cardId, boardId }) => {
  const [commentFormIsOpen, setCommentFormIsOpen] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef(null);

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentUser, comments, card } = useTracker(() => {
    if (!cardId) return { currentUser: null, comments: [], card: null };

    // Subscribe to necessary data
    Meteor.subscribe('cardComments', cardId);
    Meteor.subscribe('card', cardId);

    return {
      currentUser: ReactiveCache.getCurrentUser(),
      comments: ReactiveCache.getCard(cardId)?.comments() || [],
      card: ReactiveCache.getCard(cardId),
    };
  }, [cardId]);

  // Focus textarea when form opens
  useEffect(() => {
    if (commentFormIsOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [commentFormIsOpen]);

  const handleAddComment = async (event) => {
    event.preventDefault();
    const text = newCommentText.trim();
    if (!text) return;

    setIsSubmitting(true);
    try {
      let actualBoardId = boardId;
      let actualCardId = cardId;
      
      if (card?.isLinkedCard()) {
        const linkedCard = ReactiveCache.getCard(card.linkedId);
        actualBoardId = linkedCard.boardId;
        actualCardId = card.linkedId;
      } else if (card?.isLinkedBoard()) {
        actualBoardId = card.linkedId;
      }

      await Meteor.call('cardComments.insert', {
        text,
        boardId: actualBoardId,
        cardId: actualCardId,
      });

      setNewCommentText('');
      setCommentFormIsOpen(false);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId, newText) => {
    const text = newText.trim();
    if (!text) return;

    try {
      await Meteor.call('cardComments.update', commentId, {
        $set: { text },
      });
      setEditingComment(null);
      setEditText('');
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (confirm(t('comment-delete'))) {
      try {
        await Meteor.call('cardComments.delete', commentId);
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const handleKeyDown = (event) => {
    // Ctrl+Enter or Cmd+Enter to submit
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      if (commentFormIsOpen) {
        handleAddComment(event);
      } else if (editingComment) {
        handleEditComment(editingComment, editText);
      }
    }
    
    // Escape to cancel
    if (event.key === 'Escape') {
      if (commentFormIsOpen) {
        setCommentFormIsOpen(false);
        setNewCommentText('');
      } else if (editingComment) {
        setEditingComment(null);
        setEditText('');
      }
    }
  };

  const renderCommentForm = () => (
    <div className={`new-comment js-new-comment ${commentFormIsOpen ? 'is-open' : ''}`}>
      <UserAvatar userId={currentUser?._id} noRemove={true} />
      
      <form className="js-new-comment-form" onSubmit={handleAddComment}>
        <div className="comment-input-wrapper">
          <textarea
            ref={textareaRef}
            className="js-new-comment-input form-control"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('write-comment')}
            rows={3}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="add-controls">
          <button 
            type="submit" 
            className="primary confirm clear js-add-comment"
            disabled={isSubmitting || !newCommentText.trim()}
          >
            {isSubmitting ? t('adding') : t('comment')}
          </button>
        </div>
      </form>
    </div>
  );

  const renderComment = (comment) => {
    const user = ReactiveCache.getUser(comment.userId);
    const isOwner = currentUser?._id === comment.userId;
    const isAdmin = currentUser?.isBoardAdmin;
    const canEdit = isOwner || isAdmin;

    return (
      <div key={comment._id} className="comment js-comment">
        <UserAvatar userId={comment.userId} />
        
        <div className="comment-content">
          {editingComment === comment._id ? (
            <InlinedForm
              isOpen={true}
              className="js-edit-comment"
            >
              <div className="comment-edit-form">
                <textarea
                  className="form-control"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  rows={3}
                />
                <div className="edit-controls">
                  <button 
                    type="button" 
                    className="primary"
                    onClick={() => handleEditComment(comment._id, editText)}
                  >
                    {t('edit')}
                  </button>
                  <button 
                    type="button" 
                    className="secondary"
                    onClick={() => {
                      setEditingComment(null);
                      setEditText('');
                    }}
                  >
                    {t('cancel')}
                  </button>
                </div>
              </div>
            </InlinedForm>
          ) : (
            <>
              <div className="comment-header">
                <span className="comment-member">
                  {user?.username || t('unknown-user')}
                </span>
              </div>
              
              <div className="comment-text">
                {/* This would integrate with a markdown renderer */}
                <div 
                  className="comment-content-text"
                  dangerouslySetInnerHTML={{ 
                    __html: comment.text.replace(/\n/g, '<br>') 
                  }}
                />
              </div>
              
              {/* Comment reactions would go here */}
              <div className="comment-reactions">
                {/* Placeholder for reactions */}
              </div>
              
              <div className="comment-meta">
                <span title={moment(comment.createdAt).format('LLLL')}>
                  {moment(comment.createdAt).fromNow()}
                </span>
                
                {canEdit && (
                  <div className="comment-actions">
                    <a 
                      className="js-open-inlined-form"
                      onClick={() => {
                        setEditingComment(comment._id);
                        setEditText(comment.text);
                      }}
                    >
                      {t('edit')}
                    </a>
                    {' - '}
                    <a 
                      className="js-delete-comment"
                      onClick={() => handleDeleteComment(comment._id)}
                    >
                      {t('delete')}
                    </a>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  if (!currentUser) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="comments js-comments">
      <div className="comments-header">
        <h3>
          <i className="fa fa-comments"></i>
          {t('comments')} ({comments.length})
        </h3>
      </div>
      
      <div className="comments-content">
        {comments.map(comment => renderComment(comment))}
        
        {commentFormIsOpen ? (
          renderCommentForm()
        ) : (
          <div className="add-comment-section">
            <button 
              className="btn btn-primary js-add-comment"
              onClick={() => setCommentFormIsOpen(true)}
            >
              <i className="fa fa-plus"></i>
              {t('add-comment')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comments;
