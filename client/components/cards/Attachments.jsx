import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { ReactiveCache } from '/imports/reactiveCache';
import { ObjectID } from 'bson';
import DOMPurify from 'dompurify';
import filesize from 'filesize';
import prettyMilliseconds from 'pretty-ms';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * Attachments Component
 * 
 * Replaces the original Blaze attachments components with a React component.
 * This component manages card attachments, including:
 * - Attachment gallery display
 * - File uploads (drag & drop, clipboard, computer)
 * - Attachment viewer with navigation
 * - Attachment actions (rename, delete, cover, storage)
 * - Touch/swipe support for mobile
 * 
 * Original Blaze components had:
 * - attachmentGallery: Main attachment display
 * - attachmentViewer: Full-screen attachment viewing
 * - cardAttachmentsPopup: Upload interface
 * - previewClipboardImagePopup: Clipboard image preview
 * - attachmentActionsPopup: Attachment actions menu
 * - attachmentRenamePopup: Rename interface
 */
const Attachments = ({ card, onAttachmentUpdate, onClose }) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentAttachmentId, setCurrentAttachmentId] = useState(null);
  const [currentCardId, setCurrentCardId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploads, setUploads] = useState([]);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [touchStartCoords, setTouchStartCoords] = useState(null);
  const [touchEndCoords, setTouchEndCoords] = useState(null);
  const [pastedResults, setPastedResults] = useState(null);

  const fileInputRef = useRef(null);
  const viewerRef = useRef(null);

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentUser, attachments, isBoardAdmin } = useTracker(() => {
    const user = ReactiveCache.getCurrentUser();
    if (!user || !card) return { currentUser: null, attachments: [], isBoardAdmin: false };

    const cardAttachments = ReactiveCache.getAttachments({ 'meta.cardId': card._id });
    const adminStatus = user.isBoardAdmin();

    return {
      currentUser: user,
      attachments: cardAttachments,
      isBoardAdmin: adminStatus,
    };
  }, [card]);

  // Initialize card ID when component mounts
  useEffect(() => {
    if (card) {
      setCurrentCardId(card._id);
    }
  }, [card]);

  // Helper functions
  const getNextAttachmentId = useCallback((currentId, offset = 0) => {
    if (!attachments.length) return null;
    
    let i = 0;
    for (; i < attachments.length; i++) {
      if (attachments[i]._id === currentId) {
        break;
      }
    }
    return attachments[(i + offset + 1 + attachments.length) % attachments.length]._id;
  }, [attachments]);

  const getPrevAttachmentId = useCallback((currentId, offset = 0) => {
    if (!attachments.length) return null;
    
    let i = 0;
    for (; i < attachments.length; i++) {
      if (attachments[i]._id === currentId) {
        break;
      }
    }
    return attachments[(i + offset - 1 + attachments.length) % attachments.length]._id;
  }, [attachments]);

  const attachmentCanBeOpened = useCallback((attachment) => {
    return (
      attachment.isImage ||
      attachment.isPDF ||
      attachment.isText ||
      attachment.isJSON ||
      attachment.isVideo ||
      attachment.isAudio
    );
  }, []);

  const openAttachmentViewer = useCallback((attachmentId) => {
    const attachment = ReactiveCache.getAttachment(attachmentId);
    if (!attachment || !attachmentCanBeOpened(attachment)) {
      return;
    }

    setCurrentAttachmentId(attachmentId);
    setCurrentCardId(card._id);
    setIsViewerOpen(true);
  }, [attachmentCanBeOpened, card]);

  const closeAttachmentViewer = useCallback(() => {
    setIsViewerOpen(false);
    setCurrentAttachmentId(null);
    setCurrentCardId(null);
  }, []);

  const openNextAttachment = useCallback(() => {
    if (!currentAttachmentId) return;
    
    let i = 0;
    while (true) {
      const id = getNextAttachmentId(currentAttachmentId, i);
      if (!id) break;
      
      const attachment = ReactiveCache.getAttachment(id);
      if (attachmentCanBeOpened(attachment)) {
        setCurrentAttachmentId(id);
        break;
      }
      i++;
    }
  }, [currentAttachmentId, getNextAttachmentId, attachmentCanBeOpened]);

  const openPrevAttachment = useCallback(() => {
    if (!currentAttachmentId) return;
    
    let i = 0;
    while (true) {
      const id = getPrevAttachmentId(currentAttachmentId, i);
      if (!id) break;
      
      const attachment = ReactiveCache.getAttachment(id);
      if (attachmentCanBeOpened(attachment)) {
        setCurrentAttachmentId(id);
        break;
      }
      i--;
    }
  }, [currentAttachmentId, getPrevAttachmentId, attachmentCanBeOpened]);

  // Touch/swipe handling
  const handleTouchStart = useCallback((event) => {
    setTouchStartCoords({
      x: event.changedTouches[0].screenX,
      y: event.changedTouches[0].screenY
    });
  }, []);

  const handleTouchEnd = useCallback((event) => {
    setTouchEndCoords({
      x: event.changedTouches[0].screenX,
      y: event.changedTouches[0].screenY
    });
    
    if (touchStartCoords && touchEndCoords) {
      const xDist = touchEndCoords.x - touchStartCoords.x;
      const yDist = touchEndCoords.y - touchStartCoords.y;

      // Left swipe - next attachment
      if (Math.abs(xDist) > Math.abs(yDist) && xDist < 0) {
        openNextAttachment();
      }
      // Right swipe - previous attachment
      else if (Math.abs(xDist) > Math.abs(yDist) && xDist > 0) {
        openPrevAttachment();
      }
      // Up swipe - close viewer
      else if (Math.abs(yDist) > Math.abs(xDist) && yDist < 0) {
        closeAttachmentViewer();
      }
    }
  }, [touchStartCoords, touchEndCoords, openNextAttachment, openPrevAttachment, closeAttachmentViewer]);

  // File upload handling
  const handleFileUpload = useCallback(async (files) => {
    if (!files || !card) return;

    setIsUploading(true);
    let newUploads = [];

    for (const file of files) {
      const fileId = new ObjectID().toString();
      let fileName = DOMPurify.sanitize(file.name);

      if (fileName !== file.name) {
        if (fileName.length === 0) {
          fileName = 'Empty-filename-after-sanitize.txt';
        }
      }

      const config = {
        file: file,
        fileId: fileId,
        fileName: fileName,
        meta: Utils.getCommonAttachmentMetaFrom(card),
        chunkSize: 'dynamic',
      };
      config.meta.fileId = fileId;

      try {
        const uploader = Attachments.insert(config, false);
        
        uploader.on('start', function() {
          newUploads.push(this);
          setUploads([...newUploads]);
        });

        uploader.on('uploaded', (error, fileRef) => {
          if (!error && fileRef.isImage) {
            card.setCover(fileRef._id);
          }
        });

        uploader.on('end', (error, fileRef) => {
          newUploads = newUploads.filter(_upload => _upload.config.fileId !== fileRef._id);
          setUploads([...newUploads]);
          
          if (newUploads.length === 0) {
            setIsUploading(false);
            if (onClose) onClose();
          }
        });

        uploader.start();
      } catch (error) {
        console.error('Error starting upload:', error);
      }
    }
  }, [card, onClose]);

  const handleFileInputChange = useCallback((event) => {
    const files = event.target.files;
    if (files) {
      handleFileUpload(Array.from(files));
    }
  }, [handleFileUpload]);

  const handleComputerUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Attachment actions
  const handleAttachmentAction = useCallback(async (action, attachment) => {
    setSelectedAttachment(attachment);
    
    switch (action) {
      case 'rename':
        setIsRenameOpen(true);
        break;
      case 'delete':
        if (confirm(t('confirm-delete-attachment'))) {
          try {
            await Attachments.remove(attachment._id);
            if (onAttachmentUpdate) onAttachmentUpdate();
          } catch (error) {
            console.error('Error deleting attachment:', error);
          }
        }
        break;
      case 'cover':
        try {
          card.setCover(attachment._id);
          if (onAttachmentUpdate) onAttachmentUpdate();
        } catch (error) {
          console.error('Error setting cover:', error);
        }
        break;
      case 'remove-cover':
        try {
          card.unsetCover();
          if (onAttachmentUpdate) onAttachmentUpdate();
        } catch (error) {
          console.error('Error removing cover:', error);
        }
        break;
      default:
        break;
    }
    
    setIsActionsOpen(false);
  }, [card, onAttachmentUpdate, t]);

  const renderAttachmentGallery = () => (
    <div className="attachment-gallery js-attachment-gallery">
      <div className="attachment-gallery-header">
        <h3>
          <i className="fa fa-paperclip"></i>
          {t('attachments')} ({attachments.length})
        </h3>
        
        <div className="attachment-actions">
          <button 
            className="btn btn-primary js-add-attachment"
            onClick={() => setIsUploading(true)}
          >
            <i className="fa fa-plus"></i>
            {t('add-attachment')}
          </button>
        </div>
      </div>

      <div className="attachment-list">
        {attachments.map(attachment => (
          <div key={attachment._id} className="attachment-item">
            <div className="attachment-thumbnail">
              {attachment.isImage ? (
                <img 
                  src={attachment.link()} 
                  alt={attachment.name}
                  className="attachment-thumbnail-img"
                />
              ) : (
                <div className="attachment-icon">
                  <i className={`fa fa-${getFileIcon(attachment.extension)}`}></i>
                </div>
              )}
            </div>
            
            <div className="attachment-info">
              <div className="attachment-name">
                {DOMPurify.sanitize(attachment.name)}
              </div>
              <div className="attachment-meta">
                <span className="file-size">{filesize(attachment.size)}</span>
                <span className="upload-date">
                  {new Date(attachment.uploadedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="attachment-actions">
              <button 
                className="btn btn-sm js-open-attachment-menu"
                onClick={() => handleAttachmentAction('menu', attachment)}
                title={t('attachment-actions')}
              >
                <i className="fa fa-ellipsis-v"></i>
              </button>
              
              {attachmentCanBeOpened(attachment) && (
                <button 
                  className="btn btn-sm open-preview"
                  onClick={() => openAttachmentViewer(attachment._id)}
                  title={t('open-preview')}
                >
                  <i className="fa fa-eye"></i>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUploadInterface = () => (
    <div className="card-attachments-popup">
      <div className="popup-header">
        <h3>{t('add-attachments')}</h3>
        <button 
          className="btn btn-sm btn-close"
          onClick={() => setIsUploading(false)}
        >
          <i className="fa fa-times"></i>
        </button>
      </div>
      
      <div className="popup-content">
        <div className="upload-methods">
          <button 
            className="btn btn-primary js-computer-upload"
            onClick={handleComputerUpload}
          >
            <i className="fa fa-upload"></i>
            {t('upload-from-computer')}
          </button>
          
          <button 
            className="btn btn-secondary js-upload-clipboard-image"
            onClick={() => {/* TODO: Implement clipboard upload */}}
          >
            <i className="fa fa-paste"></i>
            {t('paste-from-clipboard')}
          </button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="js-attach-file hidden"
          onChange={handleFileInputChange}
        />
        
        {uploads.length > 0 && (
          <div className="upload-progress">
            <h4>{t('uploading')}</h4>
            {uploads.map(upload => (
              <div key={upload.config.fileId} className="upload-item">
                <div className="upload-info">
                  <span className="filename">{upload.config.fileName}</span>
                  <span className="progress">{upload.progress()}%</span>
                </div>
                <div className="upload-stats">
                  <span className="speed">
                    {filesize(upload.estimateSpeed.get(), { round: 0 })}/s
                  </span>
                  <span className="time">
                    {prettyMilliseconds(upload.estimateTime.get())}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderAttachmentViewer = () => {
    if (!isViewerOpen || !currentAttachmentId) return null;
    
    const attachment = ReactiveCache.getAttachment(currentAttachmentId);
    if (!attachment) return null;

    return (
      <div 
        className="attachment-viewer-overlay"
        onClick={closeAttachmentViewer}
      >
        <div 
          ref={viewerRef}
          className="viewer-container"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="viewer-header">
            <span className="attachment-name">{attachment.name}</span>
            <button 
              className="btn btn-sm btn-close"
              onClick={closeAttachmentViewer}
            >
              <i className="fa fa-times"></i>
            </button>
          </div>
          
          <div className="viewer-content">
            {renderViewerContent(attachment)}
          </div>
          
          <div className="viewer-navigation">
            <button 
              className="btn btn-nav prev-attachment"
              onClick={openPrevAttachment}
              disabled={!getPrevAttachmentId(currentAttachmentId)}
            >
              <i className="fa fa-chevron-left"></i>
            </button>
            
            <button 
              className="btn btn-nav next-attachment"
              onClick={openNextAttachment}
              disabled={!getNextAttachmentId(currentAttachmentId)}
            >
              <i className="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderViewerContent = (attachment) => {
    if (attachment.isImage) {
      return <img src={attachment.link()} alt={attachment.name} />;
    } else if (attachment.isPDF) {
      return <embed src={attachment.link()} type="application/pdf" />;
    } else if (attachment.isVideo) {
      return (
        <video controls>
          <source src={attachment.link()} type={attachment.type} />
        </video>
      );
    } else if (attachment.isAudio) {
      return (
        <audio controls>
          <source src={attachment.link()} type={attachment.type} />
        </audio>
      );
    } else if (attachment.isText || attachment.isJSON) {
      return (
        <iframe 
          src={attachment.link()} 
          title={attachment.name}
          className="text-viewer"
        />
      );
    }
    
    return <div className="unsupported-format">{t('unsupported-format')}</div>;
  };

  const getFileIcon = (extension) => {
    const iconMap = {
      pdf: 'file-pdf-o',
      doc: 'file-word-o',
      docx: 'file-word-o',
      xls: 'file-excel-o',
      xlsx: 'file-excel-o',
      txt: 'file-text-o',
      json: 'file-code-o',
      zip: 'file-archive-o',
      rar: 'file-archive-o',
    };
    
    return iconMap[extension?.toLowerCase()] || 'file-o';
  };

  if (!card) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="attachments js-attachments">
      {renderAttachmentGallery()}
      
      {isUploading && renderUploadInterface()}
      
      {renderAttachmentViewer()}
      
      {/* TODO: Add attachment actions popup and rename popup */}
    </div>
  );
};

export default Attachments;
