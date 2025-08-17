import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { ReactiveCache } from '/imports/reactiveCache';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * Attachments Component
 * 
 * Replaces the original Blaze attachments component with a React component.
 * This component provides comprehensive attachment storage management for administrators.
 * 
 * Original Blaze component had:
 * - attachments: Main attachments management component
 * - moveAttachments: Attachment storage migration interface
 * - moveBoardAttachments: Board-specific attachment management
 * - moveAttachment: Individual attachment version management
 */
const Attachments = ({ onClose, onUpdate }) => {
  const [currentView, setCurrentView] = useState('move-attachments');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentUser, isAdmin } = useTracker(() => {
    const user = ReactiveCache.getCurrentUser();
    if (!user) return { 
      currentUser: null, 
      isAdmin: false
    };

    const adminStatus = user.isAdmin();

    return {
      currentUser: user,
      isAdmin: adminStatus,
    };
  }, []);

  // Handle view changes
  const handleViewChange = useCallback((viewId) => {
    setCurrentView(viewId);
  }, []);

  if (!currentUser || !isAdmin) {
    return (
      <div className="attachments error">
        <div className="error-message">
          <i className="fa fa-exclamation-triangle"></i>
          {t('error-notAuthorized')}
        </div>
      </div>
    );
  }

  return (
    <div className="setting-content attachments-content js-attachments">
      <div className="content-title">
        <span>
          <i className="fa fa-paperclip"></i>
          {t('attachments')}
        </span>
        
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
      
      <div className="content-body">
        <div className="side-menu">
          <ul>
            <li className={currentView === 'move-attachments' ? 'active' : ''}>
              <a 
                className="js-move-attachments"
                data-id="move-attachments"
                onClick={() => handleViewChange('move-attachments')}
              >
                <i className="fa fa-arrow-right"></i>
                {t('attachment-move')}
              </a>
            </li>
          </ul>
        </div>
        
        <div className="main-body">
          {isLoading ? (
            <div className="loading-spinner">
              <i className="fa fa-spinner fa-spin"></i>
              {t('loading')}
            </div>
          ) : (
            <>
              {currentView === 'move-attachments' && (
                <MoveAttachments onUpdate={onUpdate} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * MoveAttachments Component
 * 
 * Main attachment storage migration interface
 */
const MoveAttachments = ({ onUpdate }) => {
  const t = (key) => enTranslations[key] || key;
  const [isMoving, setIsMoving] = useState(false);
  const [moveStatus, setMoveStatus] = useState('');

  // Track boards with attachments
  const { boardsWithAttachments } = useTracker(() => {
    const boards = ReactiveCache.getBoards() || [];
    const boardsWithAttachments = boards.filter(board => {
      // TODO: Check if board has attachments
      return true; // Placeholder
    });

    return { boardsWithAttachments: boardsWithAttachments.slice(0, 10) }; // Limit for performance
  }, []);

  // Handle move all attachments to filesystem
  const handleMoveAllToFS = useCallback(async () => {
    if (!confirm(t('confirm-move-all-to-fs'))) return;

    setIsMoving(true);
    setMoveStatus(t('moving-to-filesystem'));
    
    try {
      await Meteor.call('moveAllAttachmentsToFS');
      setMoveStatus(t('move-completed'));
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error moving attachments to FS:', err);
      setMoveStatus(t('move-failed'));
    } finally {
      setIsMoving(false);
    }
  }, [onUpdate, t]);

  // Handle move all attachments to GridFS
  const handleMoveAllToGridFS = useCallback(async () => {
    if (!confirm(t('confirm-move-all-to-gridfs'))) return;

    setIsMoving(true);
    setMoveStatus(t('moving-to-gridfs'));
    
    try {
      await Meteor.call('moveAllAttachmentsToGridFS');
      setMoveStatus(t('move-completed'));
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error moving attachments to GridFS:', err);
      setMoveStatus(t('move-failed'));
    } finally {
      setIsMoving(false);
    }
  }, [onUpdate, t]);

  // Handle move all attachments to S3
  const handleMoveAllToS3 = useCallback(async () => {
    if (!confirm(t('confirm-move-all-to-s3'))) return;

    setIsMoving(true);
    setMoveStatus(t('moving-to-s3'));
    
    try {
      await Meteor.call('moveAllAttachmentsToS3');
      setMoveStatus(t('move-completed'));
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error moving attachments to S3:', err);
      setMoveStatus(t('move-failed'));
    } finally {
      setIsMoving(false);
    }
  }, [onUpdate, t]);

  return (
    <div className="move-attachments js-move-attachments">
      <div className="move-attachment-buttons">
        <div className="js-move-attachment">
          <button 
            className="js-move-all-attachments-to-fs btn btn-primary"
            onClick={handleMoveAllToFS}
            disabled={isMoving}
          >
            <i className="fa fa-arrow-right"></i>
            {t('move-all-attachments-to-fs')}
          </button>
        </div>
        
        <div className="js-move-attachment">
          <button 
            className="js-move-all-attachments-to-gridfs btn btn-secondary"
            onClick={handleMoveAllToGridFS}
            disabled={isMoving}
          >
            <i className="fa fa-arrow-right"></i>
            {t('move-all-attachments-to-gridfs')}
          </button>
        </div>
        
        <div className="js-move-attachment">
          <button 
            className="js-move-all-attachments-to-s3 btn btn-secondary"
            onClick={handleMoveAllToS3}
            disabled={isMoving}
          >
            <i className="fa fa-arrow-right"></i>
            {t('move-all-attachments-to-s3')}
          </button>
        </div>
      </div>

      {moveStatus && (
        <div className="move-status">
          <p className={`status-message ${moveStatus.includes('completed') ? 'success' : 'info'}`}>
            {moveStatus}
          </p>
        </div>
      )}

      {boardsWithAttachments.map(board => (
        <MoveBoardAttachments key={board._id} board={board} onUpdate={onUpdate} />
      ))}
    </div>
  );
};

/**
 * MoveBoardAttachments Component
 * 
 * Board-specific attachment management
 */
const MoveBoardAttachments = ({ board, onUpdate }) => {
  const t = (key) => enTranslations[key] || key;
  const [isMoving, setIsMoving] = useState(false);
  const [attachments, setAttachments] = useState([]);

  // Fetch board attachments
  useEffect(() => {
    const fetchAttachments = async () => {
      try {
        // TODO: Implement attachment fetching for board
        // const result = await Meteor.call('getBoardAttachments', board._id);
        // setAttachments(result.attachments || []);
        setAttachments([]); // Placeholder
      } catch (err) {
        console.error('Error fetching board attachments:', err);
      }
    };

    fetchAttachments();
  }, [board._id]);

  // Handle move board attachments to filesystem
  const handleMoveBoardToFS = useCallback(async () => {
    if (!confirm(t('confirm-move-board-to-fs'))) return;

    setIsMoving(true);
    try {
      await Meteor.call('moveBoardAttachmentsToFS', board._id);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error moving board attachments to FS:', err);
    } finally {
      setIsMoving(false);
    }
  }, [board._id, onUpdate, t]);

  // Handle move board attachments to GridFS
  const handleMoveBoardToGridFS = useCallback(async () => {
    if (!confirm(t('confirm-move-board-to-gridfs'))) return;

    setIsMoving(true);
    try {
      await Meteor.call('moveBoardAttachmentsToGridFS', board._id);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error moving board attachments to GridFS:', err);
    } finally {
      setIsMoving(false);
    }
  }, [board._id, onUpdate, t]);

  // Handle move board attachments to S3
  const handleMoveBoardToS3 = useCallback(async () => {
    if (!confirm(t('confirm-move-board-to-s3'))) return;

    setIsMoving(true);
    try {
      await Meteor.call('moveBoardAttachmentsToS3', board._id);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error moving board attachments to S3:', err);
    } finally {
      setIsMoving(false);
    }
  }, [board._id, onUpdate, t]);

  return (
    <div className="move-board-attachments js-move-board-attachments">
      <hr />
      
      <div className="board-description">
        <table className="board-info-table">
          <tbody>
            <tr>
              <th>{t('board')} ID</th>
              <th>{t('board-title')}</th>
            </tr>
            <tr>
              <td>{board._id}</td>
              <td>{board.title}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="move-attachment-buttons">
        <div className="js-move-attachment">
          <button 
            className="js-move-all-attachments-of-board-to-fs btn btn-sm btn-primary"
            onClick={handleMoveBoardToFS}
            disabled={isMoving}
          >
            <i className="fa fa-arrow-right"></i>
            {t('move-all-attachments-of-board-to-fs')}
          </button>
        </div>
        
        <div className="js-move-attachment">
          <button 
            className="js-move-all-attachments-of-board-to-gridfs btn btn-sm btn-secondary"
            onClick={handleMoveBoardToGridFS}
            disabled={isMoving}
          >
            <i className="fa fa-arrow-right"></i>
            {t('move-all-attachments-of-board-to-gridfs')}
          </button>
        </div>
        
        <div className="js-move-attachment">
          <button 
            className="js-move-all-attachments-of-board-to-s3 btn btn-sm btn-secondary"
            onClick={handleMoveBoardToS3}
            disabled={isMoving}
          >
            <i className="fa fa-arrow-right"></i>
            {t('move-all-attachments-of-board-to-s3')}
          </button>
        </div>
      </div>

      <div className="board-attachments">
        <table className="attachments-table">
          <thead>
            <tr>
              <th>{t('card')}-Id</th>
              <th>{t('attachment')}-Id</th>
              <th>{t('name')}</th>
              <th>{t('path')}</th>
              <th>{t('version-name')}</th>
              <th>{t('size')}</th>
              <th>GridFsFileId</th>
              <th>S3FileId</th>
              <th>{t('storage')}</th>
              <th>{t('action')}</th>
            </tr>
          </thead>
          <tbody>
            {attachments.map(attachment => (
              <MoveAttachment key={attachment._id} attachment={attachment} onUpdate={onUpdate} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * MoveAttachment Component
 * 
 * Individual attachment version management
 */
const MoveAttachment = ({ attachment, onUpdate }) => {
  const t = (key) => enTranslations[key] || key;

  const formatFileSize = (size) => {
    if (!size) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let index = 0;
    let fileSize = size;
    
    while (fileSize >= 1024 && index < units.length - 1) {
      fileSize /= 1024;
      index++;
    }
    
    return `${fileSize.toFixed(2)} ${units[index]}`;
  };

  const handleMoveToFS = useCallback(async () => {
    if (!confirm(t('confirm-move-attachment-to-fs'))) return;

    try {
      await Meteor.call('moveAttachmentToFS', attachment._id);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error moving attachment to FS:', err);
    }
  }, [attachment._id, onUpdate, t]);

  const handleMoveToGridFS = useCallback(async () => {
    if (!confirm(t('confirm-move-attachment-to-gridfs'))) return;

    try {
      await Meteor.call('moveAttachmentToGridFS', attachment._id);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error moving attachment to GridFS:', err);
    }
  }, [attachment._id, onUpdate, t]);

  const handleMoveToS3 = useCallback(async () => {
    if (!confirm(t('confirm-move-attachment-to-s3'))) return;

    try {
      await Meteor.call('moveAttachmentToS3', attachment._id);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error moving attachment to S3:', err);
    }
  }, [attachment._id, onUpdate, t]);

  // Flatten versions for display
  const flatVersions = attachment.versions || [attachment];

  return (
    <>
      {flatVersions.map((version, index) => (
        <tr key={`${attachment._id}-${index}`}>
          <td>{attachment.meta?.cardId}</td>
          <td>{attachment._id}</td>
          <td>{attachment.name}</td>
          <td>{version.path}</td>
          <td>{version.versionName}</td>
          <td>{formatFileSize(version.size)}</td>
          <td>{version.meta?.gridFsFileId || '-'}</td>
          <td>{version.meta?.s3FileId || '-'}</td>
          <td>{version.storageName || '-'}</td>
          <td>
            {version.storageName !== 'fs' && (
              <button 
                className="js-move-storage-fs btn btn-xs btn-primary"
                onClick={handleMoveToFS}
                title={t('attachment-move-storage-fs')}
              >
                <i className="fa fa-arrow-right"></i>
                {t('attachment-move-storage-fs')}
              </button>
            )}

            {version.storageName !== 'gridfs' && version.storageName && (
              <button 
                className="js-move-storage-gridfs btn btn-xs btn-secondary"
                onClick={handleMoveToGridFS}
                title={t('attachment-move-storage-gridfs')}
              >
                <i className="fa fa-arrow-right"></i>
                {t('attachment-move-storage-gridfs')}
              </button>
            )}

            {version.storageName !== 's3' && version.storageName && (
              <button 
                className="js-move-storage-s3 btn btn-xs btn-secondary"
                onClick={handleMoveToS3}
                title={t('attachment-move-storage-s3')}
              >
                <i className="fa fa-arrow-right"></i>
                {t('attachment-move-storage-s3')}
              </button>
            )}
          </td>
        </tr>
      ))}
    </>
  );
};

export default Attachments;
