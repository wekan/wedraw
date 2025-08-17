import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { ReactiveCache } from '/imports/reactiveCache';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * TrelloMembersMapper Component
 * 
 * Replaces the original Blaze trelloMembersMapper utility with a React component.
 * This component provides member mapping functionality for Trello imports,
 * allowing users to map Trello members to WeKan users.
 * 
 * Original Blaze utility had:
 * - trelloGetMembersToMap: Function to get members for mapping
 * - Auto-mapping based on username
 * - Member mapping interface
 */
const TrelloMembersMapper = ({ 
  trelloData, 
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

  // Initialize member mapping
  useEffect(() => {
    if (!trelloData || !trelloData.members) return;

    const initializeMapping = () => {
      const members = trelloData.members.map(importedMember => {
        // Auto-map based on username
        const wekanUser = ReactiveCache.getUser({ username: importedMember.username });
        if (wekanUser) {
          importedMember.wekanId = wekanUser._id;
          importedMember.autoMapped = true;
        } else {
          importedMember.wekanId = null;
          importedMember.autoMapped = false;
        }
        return importedMember;
      });

      setMappedMembers(members);
    };

    initializeMapping();
  }, [trelloData]);

  // Handle member mapping change
  const handleMemberMappingChange = useCallback((memberId, wekanUserId) => {
    setMappedMembers(prev => 
      prev.map(member => 
        member.id === memberId 
          ? { ...member, wekanId: wekanUserId, autoMapped: false }
          : member
      )
    );
  }, []);

  // Handle auto-map all
  const handleAutoMapAll = useCallback(() => {
    const updatedMembers = mappedMembers.map(member => {
      if (member.wekanId) return member; // Already mapped
      
      const wekanUser = ReactiveCache.getUser({ username: member.username });
      if (wekanUser) {
        return { ...member, wekanId: wekanUser._id, autoMapped: true };
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
      autoMapped: false
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
      console.log('Mapping completed:', mappedMembers);
      
      if (onMappingComplete) {
        onMappingComplete(mappedMembers);
      }
    } catch (err) {
      console.error('Error completing mapping:', err);
      setError(t('error-completing-mapping'));
    } finally {
      setLoading(false);
    }
  }, [mappedMembers, onMappingComplete, t]);

  if (!currentUser) {
    return (
      <div className="trello-members-mapper error">
        <div className="error-message">
          <i className="fa fa-exclamation-triangle"></i>
          {t('error-notAuthorized')}
        </div>
      </div>
    );
  }

  if (!trelloData || !trelloData.members) {
    return (
      <div className="trello-members-mapper error">
        <div className="error-message">
          <i className="fa fa-exclamation-triangle"></i>
          {t('error-no-trello-data')}
        </div>
      </div>
    );
  }

  return (
    <div className="trello-members-mapper js-trello-members-mapper">
      {/* Header */}
      <div className="mapper-header">
        <h3 className="mapper-title">
          <i className="fa fa-users"></i>
          {t('map-trello-members')}
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
          <div className="header-cell trello-member">{t('trello-member')}</div>
          <div className="header-cell wekan-user">{t('wekan-user')}</div>
          <div className="header-cell status">{t('status')}</div>
          <div className="header-cell actions">{t('actions')}</div>
        </div>

        <div className="table-body">
          {mappedMembers.map(member => (
            <MemberMappingRow
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
 * MemberMappingRow Component
 * 
 * Individual member mapping row
 */
const MemberMappingRow = ({ 
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
      <div className="cell trello-member">
        <div className="member-info">
          <div className="member-avatar">
            {member.avatarUrl ? (
              <img src={member.avatarUrl} alt={member.fullName} />
            ) : (
              <div className="avatar-initials">
                {member.fullName ? member.fullName.charAt(0) : member.username.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="member-details">
            <div className="member-name">{member.fullName || member.username}</div>
            <div className="member-username">@{member.username}</div>
          </div>
        </div>
      </div>

      <div className="cell wekan-user">
        <select
          className="wekan-user-select"
          value={member.wekanId || ''}
          onChange={handleMappingChange}
          disabled={disabled}
        >
          <option value="">{t('select-wekan-user')}</option>
          {wekanUsers.map(user => (
            <option key={user._id} value={user._id}>
              {user.profile?.fullname || user.username}
            </option>
          ))}
        </select>
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

export default TrelloMembersMapper;
