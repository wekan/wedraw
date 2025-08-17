import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { ReactiveCache } from '/imports/reactiveCache';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * WekanMembersMapper Component
 * 
 * Replaces the original Blaze wekanMembersMapper utility with a React component.
 * This component provides WeKan member mapping functionality for WeKan imports,
 * allowing users to map WeKan members to current WeKan users.
 * 
 * Original Blaze utility had:
 * - wekanGetMembersToMap: Function to get members for mapping from WeKan data
 * - WeKan data parsing and member extraction
 * - Member mapping interface
 */
const WekanMembersMapper = ({ 
  wekanData, 
  onMappingComplete, 
  onCancel 
}) => {
  const [mappedMembers, setMappedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentUser, wekanUsers } = useTracker(() => {
    const user = ReactiveCache.getCurrentUser();
    if (!user) return {
      currentUser: null,
      wekanUsers: []
    };

    // Get all WeKan users for mapping
    const users = ReactiveCache.getUsers({}) || [];

    return {
      currentUser: user,
      wekanUsers: users
    };
  }, []);

  // Initialize WeKan member mapping
  useEffect(() => {
    if (!wekanData || !wekanData.members || !wekanData.users) return;

    const initializeMapping = () => {
      try {
        const membersToMap = wekanData.members;
        const users = wekanData.users;

        // Process members for mapping
        const members = membersToMap.map(importedMember => {
          const memberObj = {
            id: importedMember.userId || importedMember.id,
            originalId: importedMember.userId || importedMember.id,
            username: '',
            fullName: '',
            email: '',
            profile: {}
          };

          // Find corresponding user data
          const user = users.find(user => user._id === memberObj.id);
          if (user) {
            memberObj.username = user.username || '';
            memberObj.fullName = user.profile?.fullname || '';
            memberObj.email = user.emails?.[0]?.address || '';
            memberObj.profile = user.profile || {};
            memberObj.avatarUrl = user.profile?.avatarUrl || '';
          }

          // Auto-map based on username
          const wekanUser = ReactiveCache.getUser({ username: memberObj.username });
          if (wekanUser) {
            memberObj.wekanId = wekanUser._id;
            memberObj.autoMapped = true;
            memberObj.currentUsername = wekanUser.username;
            memberObj.currentFullName = wekanUser.profile?.fullname || '';
          } else {
            memberObj.wekanId = null;
            memberObj.autoMapped = false;
            memberObj.currentUsername = '';
            memberObj.currentFullName = '';
          }

          return memberObj;
        });

        setMappedMembers(members);
      } catch (err) {
        console.error('Error initializing WeKan mapping:', err);
        setError(t('error-initializing-mapping'));
      }
    };

    initializeMapping();
  }, [wekanData, t]);

  // Handle member mapping change
  const handleMemberMappingChange = useCallback((memberId, wekanUserId) => {
    setMappedMembers(prev => 
      prev.map(member => {
        if (member.id === memberId) {
          const wekanUser = wekanUsers.find(user => user._id === wekanUserId);
          return {
            ...member,
            wekanId: wekanUserId,
            autoMapped: false,
            currentUsername: wekanUser?.username || '',
            currentFullName: wekanUser?.profile?.fullname || ''
          };
        }
        return member;
      })
    );
  }, [wekanUsers]);

  // Handle auto-map all
  const handleAutoMapAll = useCallback(() => {
    const updatedMembers = mappedMembers.map(member => {
      if (member.wekanId) return member; // Already mapped
      
      const wekanUser = ReactiveCache.getUser({ username: member.username });
      if (wekanUser) {
        return {
          ...member,
          wekanId: wekanUser._id,
          autoMapped: true,
          currentUsername: wekanUser.username,
          currentFullName: wekanUser.profile?.fullname || ''
        };
      }
      return member;
    });

    setMappedMembers(updatedMembers);
  }, [mappedMembers]);

  // Handle clear all mappings
  const handleClearAllMappings = useCallback(() => {
    const updatedMembers = mappedMembers.map(member => ({
      ...member,
      wekanId: null,
      autoMapped: false,
      currentUsername: '',
      currentFullName: ''
    }));

    setMappedMembers(updatedMembers);
  }, [mappedMembers]);

  // Handle mapping completion
  const handleCompleteMapping = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Validate that all members are mapped
      const unmappedMembers = mappedMembers.filter(member => !member.wekanId);
      if (unmappedMembers.length > 0) {
        setError(t('error-unmapped-members', { count: unmappedMembers.length }));
        return;
      }

      // TODO: Implement actual mapping completion
      console.log('WeKan mapping completed:', mappedMembers);
      
      if (onMappingComplete) {
        onMappingComplete(mappedMembers);
      }
    } catch (err) {
      console.error('Error completing WeKan mapping:', err);
      setError(t('error-completing-mapping'));
    } finally {
      setLoading(false);
    }
  }, [mappedMembers, onMappingComplete, t]);

  // Handle data preview
  const renderDataPreview = () => {
    if (!wekanData || !wekanData.members || !wekanData.users) return null;

    return (
      <div className="wekan-preview">
        <h4 className="preview-title">
          <i className="fa fa-database"></i>
          {t('wekan-data-preview')}
        </h4>
        
        <div className="preview-summary">
          <div className="summary-item">
            <span className="summary-label">{t('total-members')}:</span>
            <span className="summary-value">{wekanData.members.length}</span>
          </div>
          
          <div className="summary-item">
            <span className="summary-label">{t('total-users')}:</span>
            <span className="summary-value">{wekanData.users.length}</span>
          </div>
          
          <div className="summary-item">
            <span className="summary-label">{t('source-system')}:</span>
            <span className="summary-value">{t('wekan-export')}</span>
          </div>
        </div>

        <div className="sample-data">
          <h5>{t('sample-members')}</h5>
          <div className="sample-list">
            {wekanData.members.slice(0, 5).map((member, index) => {
              const user = wekanData.users.find(u => u._id === (member.userId || member.id));
              return (
                <div key={index} className="sample-item">
                  <div className="sample-avatar">
                    {user?.profile?.avatarUrl ? (
                      <img src={user.profile.avatarUrl} alt={user.profile.fullname || user.username} />
                    ) : (
                      <div className="avatar-initials">
                        {(user?.profile?.fullname || user?.username || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="sample-info">
                    <div className="sample-name">{user?.profile?.fullname || user?.username || 'Unknown'}</div>
                    <div className="sample-username">@{user?.username || 'unknown'}</div>
                  </div>
                </div>
              );
            })}
            {wekanData.members.length > 5 && (
              <div className="sample-more">
                <i className="fa fa-ellipsis-h"></i>
                {t('and-more-members', { count: wekanData.members.length - 5 })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!currentUser) {
    return (
      <div className="wekan-members-mapper error">
        <div className="error-message">
          <i className="fa fa-exclamation-triangle"></i>
          {t('error-notAuthorized')}
        </div>
      </div>
    );
  }

  if (!wekanData || !wekanData.members || !wekanData.users) {
    return (
      <div className="wekan-members-mapper error">
        <div className="error-message">
          <i className="fa fa-exclamation-triangle"></i>
          {t('error-no-wekan-data')}
        </div>
      </div>
    );
  }

  return (
    <div className="wekan-members-mapper js-wekan-members-mapper">
      {/* Header */}
      <div className="mapper-header">
        <h3 className="mapper-title">
          <i className="fa fa-database"></i>
          {t('map-wekan-members')}
        </h3>
        
        <div className="mapper-actions">
          <button
            className="btn btn-sm btn-secondary"
            onClick={handleAutoMapAll}
            disabled={loading}
            title={t('auto-map-all')}
          >
            <i className="fa fa-magic"></i>
            {t('auto-map-all')}
          </button>

          <button
            className="btn btn-sm btn-secondary"
            onClick={handleClearAllMappings}
            disabled={loading}
            title={t('clear-all-mappings')}
          >
            <i className="fa fa-eraser"></i>
            {t('clear-all')}
          </button>
        </div>
      </div>

      {/* Data Preview */}
      {renderDataPreview()}

      {/* Error Display */}
      {error && (
        <div className="mapper-error">
          <div className="error-message">
            <i className="fa fa-exclamation-triangle"></i>
            {error}
          </div>
        </div>
      )}

      {/* Members Mapping Table */}
      <div className="members-mapping-table">
        <div className="table-header">
          <div className="header-cell wekan-member">{t('wekan-member')}</div>
          <div className="header-cell current-user">{t('current-user')}</div>
          <div className="header-cell status">{t('status')}</div>
          <div className="header-cell actions">{t('actions')}</div>
        </div>

        <div className="table-body">
          {mappedMembers.map(member => (
            <WekanMemberMappingRow
              key={member.id}
              member={member}
              wekanUsers={wekanUsers}
              onMappingChange={handleMemberMappingChange}
              disabled={loading}
            />
          ))}
        </div>
      </div>

      {/* Mapping Summary */}
      <div className="mapping-summary">
        <div className="summary-item">
          <span className="summary-label">{t('total-members')}:</span>
          <span className="summary-value">{mappedMembers.length}</span>
        </div>
        
        <div className="summary-item">
          <span className="summary-label">{t('mapped-members')}:</span>
          <span className="summary-value">
            {mappedMembers.filter(m => m.wekanId).length}
          </span>
        </div>
        
        <div className="summary-item">
          <span className="summary-label">{t('unmapped-members')}:</span>
          <span className="summary-value">
            {mappedMembers.filter(m => !m.wekanId).length}
          </span>
        </div>
        
        <div className="summary-item">
          <span className="summary-label">{t('auto-mapped')}:</span>
          <span className="summary-value">
            {mappedMembers.filter(m => m.autoMapped).length}
          </span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mapper-footer">
        <button
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          <i className="fa fa-times"></i>
          {t('cancel')}
        </button>

        <button
          className="btn btn-primary"
          onClick={handleCompleteMapping}
          disabled={loading || mappedMembers.filter(m => !m.wekanId).length > 0}
        >
          <i className="fa fa-check"></i>
          {t('complete-mapping')}
        </button>
      </div>
    </div>
  );
};

/**
 * WekanMemberMappingRow Component
 * 
 * Individual WeKan member mapping row
 */
const WekanMemberMappingRow = ({ 
  member, 
  wekanUsers, 
  onMappingChange, 
  disabled 
}) => {
  const t = (key) => enTranslations[key] || key;

  const handleMappingChange = useCallback((event) => {
    const wekanUserId = event.target.value || null;
    onMappingChange(member.id, wekanUserId);
  }, [member.id, onMappingChange]);

  // Get WeKan user for display
  const getWekanUser = (wekanId) => {
    if (!wekanId) return null;
    return wekanUsers.find(user => user._id === wekanId);
  };

  const wekanUser = getWekanUser(member.wekanId);

  return (
    <div className={`mapping-row ${member.autoMapped ? 'auto-mapped' : ''}`}>
      <div className="cell wekan-member">
        <div className="member-info">
          <div className="member-avatar">
            {member.avatarUrl ? (
              <img src={member.avatarUrl} alt={member.fullName || member.username} />
            ) : (
              <div className="avatar-initials">
                {(member.fullName || member.username || '?').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="member-details">
            <div className="member-name">{member.fullName || member.username}</div>
            <div className="member-username">@{member.username}</div>
            <div className="member-original">
              <small>{t('original-id')}: {member.originalId}</small>
            </div>
          </div>
        </div>
      </div>

      <div className="cell current-user">
        <select
          className="wekan-user-select"
          value={member.wekanId || ''}
          onChange={handleMappingChange}
          disabled={disabled}
        >
          <option value="">{t('select-current-user')}</option>
          {wekanUsers.map(user => (
            <option key={user._id} value={user._id}>
              {user.profile?.fullname || user.username}
            </option>
          ))}
        </select>
        
        {member.wekanId && (
          <div className="current-user-info">
            <small>
              <strong>{t('current')}:</strong> {member.currentFullName || member.currentUsername}
            </small>
          </div>
        )}
      </div>

      <div className="cell status">
        <div className={`status-indicator ${member.wekanId ? 'mapped' : 'unmapped'}`}>
          <i className={`fa ${member.wekanId ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
          <span className="status-text">
            {member.wekanId 
              ? (member.autoMapped ? t('auto-mapped') : t('manually-mapped'))
              : t('unmapped')
            }
          </span>
        </div>
      </div>

      <div className="cell actions">
        {member.wekanId && (
          <button
            className="btn btn-xs btn-secondary"
            onClick={() => onMappingChange(member.id, null)}
            disabled={disabled}
            title={t('clear-mapping')}
          >
            <i className="fa fa-times"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default WekanMembersMapper;
