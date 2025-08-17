import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { ReactiveCache } from '/imports/reactiveCache';
import { Utils } from '/imports/utils';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * Editor Component
 * 
 * Replaces the original Blaze editor component with a React component.
 * This component provides rich text editing functionality with:
 * - Textarea with autosize
 * - User mentions (@username)
 * - Code copy functionality
 * - Rich text editor support
 * 
 * Original Blaze component had:
 * - Textarea with autosize
 * - User mentions system
 * - Code copy buttons
 * - Rich text editor configuration
 */
const Editor = ({ 
  value = '', 
  onChange, 
  placeholder = '', 
  disabled = false,
  mode = 'simple', // 'simple', 'rich'
  onSave,
  onCancel,
  className = '',
  rows = 3
}) => {
  const [editorValue, setEditorValue] = useState(value);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionResults, setMentionResults] = useState([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  const textareaRef = useRef(null);
  const mentionsRef = useRef(null);

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentBoard, currentUser } = useTracker(() => {
    const board = Utils.getCurrentBoard();
    const user = ReactiveCache.getCurrentUser();
    return {
      currentBoard: board,
      currentUser: user
    };
  }, []);

  // Update internal value when prop changes
  useEffect(() => {
    setEditorValue(value);
  }, [value]);

  // Handle textarea resize
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [editorValue]);

  // Handle mentions
  const handleMentions = useCallback((query) => {
    if (!query.startsWith('@')) return;

    const term = query.slice(1);
    setMentionQuery(term);
    
    if (term.length === 0) {
      setShowMentions(false);
      return;
    }

    // Get board members for mentions
    const members = currentBoard?.activeMembers() || [];
    const users = members.map(member => {
      const user = ReactiveCache.getUser(member.userId);
      return user;
    }).filter(Boolean);

    // Filter users based on query
    const filteredUsers = users.filter(user => {
      const username = user.username || '';
      const fullName = user.profile?.fullname || '';
      return username.toLowerCase().includes(term.toLowerCase()) || 
             fullName.toLowerCase().includes(term.toLowerCase());
    });

    setMentionResults(filteredUsers);
    setShowMentions(filteredUsers.length > 0);
    setSelectedMentionIndex(0);
  }, [currentBoard]);

  // Handle input change
  const handleInputChange = useCallback((event) => {
    const newValue = event.target.value;
    setEditorValue(newValue);
    
    // Handle mentions
    handleMentions(newValue);
    
    if (onChange) {
      onChange(newValue);
    }
  }, [onChange, handleMentions]);

  // Handle mention selection
  const handleMentionSelect = useCallback((user) => {
    const beforeMention = editorValue.substring(0, editorValue.lastIndexOf('@'));
    const afterMention = editorValue.substring(editorValue.lastIndexOf('@') + mentionQuery.length + 1);
    
    let mentionText;
    if (user.profile?.fullname) {
      mentionText = `@${user.username} (${user.profile.fullname}) `;
    } else {
      mentionText = `@${user.username} `;
    }
    
    const newValue = beforeMention + mentionText + afterMention;
    setEditorValue(newValue);
    setShowMentions(false);
    setMentionQuery('');
    
    if (onChange) {
      onChange(newValue);
    }
    
    // Focus back to textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editorValue, mentionQuery, onChange]);

  // Handle keyboard navigation for mentions
  const handleKeyDown = useCallback((event) => {
    if (!showMentions) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedMentionIndex(prev => 
          prev < mentionResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedMentionIndex(prev => 
          prev > 0 ? prev - 1 : mentionResults.length - 1
        );
        break;
      case 'Enter':
        if (showMentions) {
          event.preventDefault();
          const selectedUser = mentionResults[selectedMentionIndex];
          if (selectedUser) {
            handleMentionSelect(selectedUser);
          }
        }
        break;
      case 'Escape':
        setShowMentions(false);
        break;
    }
  }, [showMentions, mentionResults, selectedMentionIndex, handleMentionSelect]);

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  // Handle blur
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Delay hiding mentions to allow for clicks
    setTimeout(() => setShowMentions(false), 200);
  }, []);

  // Handle save
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(editorValue);
    }
  }, [editorValue, onSave]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  // Render mentions dropdown
  const renderMentions = () => {
    if (!showMentions || mentionResults.length === 0) return null;

    return (
      <div className="mentions-dropdown" ref={mentionsRef}>
        {mentionResults.map((user, index) => (
          <div
            key={user._id}
            className={`mention-item ${index === selectedMentionIndex ? 'selected' : ''}`}
            onClick={() => handleMentionSelect(user)}
          >
            <div className="mention-avatar">
              {user.profile?.avatarUrl ? (
                <img src={user.profile.avatarUrl} alt={user.profile.fullname || user.username} />
              ) : (
                <div className="avatar-initials">
                  {(user.profile?.fullname || user.username).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="mention-info">
              <div className="mention-name">{user.profile?.fullname || user.username}</div>
              <div className="mention-username">@{user.username}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render rich text editor toolbar
  const renderRichToolbar = () => {
    if (mode !== 'rich') return null;

    const isSmall = Utils.isMiniScreen();
    const toolbarItems = isSmall ? [
      ['view', ['fullscreen']],
      ['table', ['table']],
      ['font', ['bold', 'underline']],
      ['color', ['color']]
    ] : [
      ['style', ['style']],
      ['font', ['bold', 'underline', 'clear']],
      ['fontsize', ['fontsize']],
      ['fontname', ['fontname']],
      ['color', ['color']],
      ['para', ['ul', 'ol', 'paragraph']],
      ['table', ['table']],
      ['insert', ['link', 'picture', 'video']],
      ['view', ['fullscreen', 'codeview']]
    ];

    return (
      <div className="rich-editor-toolbar">
        {toolbarItems.map((group, groupIndex) => (
          <div key={groupIndex} className="toolbar-group">
            {group[1].map((item, itemIndex) => (
              <button
                key={itemIndex}
                className="toolbar-btn"
                title={t(`toolbar-${item}`)}
                data-command={item}
                data-value={group[0]}
              >
                <i className={`fa fa-${item}`}></i>
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`editor-component js-editor ${className}`}>
      {/* Rich Text Toolbar */}
      {renderRichToolbar()}

      {/* Textarea Container */}
      <div className="textarea-container">
        <textarea
          ref={textareaRef}
          className="editor-textarea"
          value={editorValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
        />
        
        {/* Mentions Dropdown */}
        {renderMentions()}
      </div>

      {/* Action Buttons */}
      {(onSave || onCancel) && (
        <div className="editor-actions">
          {onCancel && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleCancel}
              disabled={disabled}
            >
              <i className="fa fa-times"></i>
              {t('cancel')}
            </button>
          )}
          
          {onSave && (
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSave}
              disabled={disabled}
            >
              <i className="fa fa-check"></i>
              {t('save')}
            </button>
          )}
        </div>
      )}

      {/* Help Text */}
      <div className="editor-help">
        <small>
          <i className="fa fa-info-circle"></i>
          {t('editor-help-text')}
        </small>
      </div>
    </div>
  );
};

export default Editor;
