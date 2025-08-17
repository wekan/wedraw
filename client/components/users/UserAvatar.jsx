import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

const UserAvatar = ({ 
  userId, 
  userData, 
  isAssignee = false, 
  showStatus = false, 
  showEdit = false,
  size = 'medium',
  className = ''
}) => {
  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const {
    currentUser,
    user,
    presenceStatusClassName,
    memberType
  } = useTracker(() => {
    // Subscribe to user data
    Meteor.subscribe('user', userId);

    const user = userData || Meteor.users.findOne(userId);
    const presenceStatus = user?.status?.online ? 'online' : 'offline';
    const presenceStatusClassName = `presence-${presenceStatus}`;
    const memberType = isAssignee ? t('assignee') : t('member');

    return {
      currentUser: Meteor.user(),
      user,
      presenceStatusClassName,
      memberType
    };
  }, [userId, userData, isAssignee]);

  if (!user) {
    return <div className={`avatar avatar-placeholder ${className}`}></div>;
  }

  const fullName = user.profile?.fullname || user.username;
  const username = user.username;
  const avatarUrl = user.profile?.avatarUrl;
  const isSandstorm = Meteor.settings.public?.sandstorm;
  const canEdit = showEdit && currentUser?._id === user._id;

  const handleChangeAvatar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement avatar change functionality
    console.log('Change avatar clicked');
  };

  const getInitials = () => {
    if (fullName && fullName !== username) {
      return fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
    return username.substring(0, 2).toUpperCase();
  };

  const getViewPortWidth = () => {
    switch (size) {
      case 'small': return 20;
      case 'large': return 40;
      default: return 30;
    }
  };

  return (
    <a 
      className={`member js-${isAssignee ? 'assignee' : 'member'} ${className}`}
      title={`${fullName} (${username}) ${memberType}`}
    >
      {avatarUrl ? (
        <img 
          className="avatar avatar-image" 
          src={avatarUrl} 
          alt={fullName}
        />
      ) : (
        <UserAvatarInitials 
          initials={getInitials()} 
          viewPortWidth={getViewPortWidth()} 
        />
      )}

      {showStatus && (
        <>
          <span className={`member-presence-status ${presenceStatusClassName}`}></span>
          <span className="member-type">{memberType}</span>
        </>
      )}

      {!isSandstorm && canEdit && (
        <a className="edit-avatar js-change-avatar" onClick={handleChangeAvatar}>
          <i className="fa fa-pencil"></i>
        </a>
      )}
    </a>
  );
};

// UserAvatarInitials Component
const UserAvatarInitials = ({ initials, viewPortWidth = 30 }) => {
  return (
    <svg className="avatar avatar-initials" viewBox={`0 0 ${viewPortWidth} 15`}>
      <text x="50%" y="13" textAnchor="middle">{initials}</text>
    </svg>
  );
};

// OrgAvatar Component
const OrgAvatar = ({ orgData, className = '' }) => {
  return (
    <a className={`member orgOrTeamMember js-member ${className}`} title={orgData.orgDisplayName}>
      <BoardOrgName orgId={orgData._id} orgName={orgData.orgDisplayName} />
    </a>
  );
};

// BoardOrgName Component
const BoardOrgName = ({ orgId, orgName, viewPortWidth = 30 }) => {
  return (
    <svg className="avatar avatar-initials" viewBox={`0 0 ${viewPortWidth} 15`}>
      <text x="50%" y="13" textAnchor="middle">{orgName}</text>
    </svg>
  );
};

// TeamAvatar Component
const TeamAvatar = ({ teamData, className = '' }) => {
  return (
    <a className={`member orgOrTeamMember js-member ${className}`} title={teamData.teamDisplayName}>
      <BoardTeamName teamId={teamData._id} teamName={teamData.teamDisplayName} />
    </a>
  );
};

// BoardTeamName Component
const BoardTeamName = ({ teamId, teamName, viewPortWidth = 30 }) => {
  return (
    <svg className="avatar avatar-initials" viewBox={`0 0 ${viewPortWidth} 15`}>
      <text x="50%" y="13" textAnchor="middle">{teamName}</text>
    </svg>
  );
};

// UserPopup Component
const UserPopup = ({ user, className = '' }) => {
  return (
    <div className={`board-member-menu ${className}`}>
      <div className="mini-profile-info">
        <UserAvatar userId={user._id} />
        <div className="info">
          <h3>{user.profile?.fullname || user.username}</h3>
          <p className="quiet">@{user.username}</p>
        </div>
      </div>
    </div>
  );
};

// MemberName Component
const MemberName = ({ user, showBoth = false, className = '' }) => {
  const fullName = user.profile?.fullname;
  const username = user.username;

  if (showBoth && fullName) {
    return (
      <span className={className}>
        {fullName} ({username})
      </span>
    );
  } else if (fullName) {
    return <span className={className}>{fullName}</span>;
  } else {
    return <span className={className}>{username}</span>;
  }
};

// ChangeAvatarPopup Component
const ChangeAvatarPopup = ({ 
  uploadedAvatars = [], 
  selectedAvatarId, 
  onSelectAvatar, 
  onDeleteAvatar,
  error = null,
  className = ''
}) => {
  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  const handleSelectAvatar = (avatarId) => {
    if (onSelectAvatar) {
      onSelectAvatar(avatarId);
    }
  };

  const handleDeleteAvatar = (avatarId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDeleteAvatar) {
      onDeleteAvatar(avatarId);
    }
  };

  const handleSelectInitials = () => {
    if (onSelectAvatar) {
      onSelectAvatar('initials');
    }
  };

  return (
    <div className={`change-avatar-popup ${className}`}>
      {error && (
        <div className="warning">{t(error)}</div>
      )}
      
      <ul className="pop-over-list">
        {uploadedAvatars.map((avatar) => (
          <li key={avatar._id}>
            <a className="js-select-avatar" onClick={() => handleSelectAvatar(avatar._id)}>
              <div className="member">
                <img 
                  className="avatar avatar-image" 
                  src={`${avatar.link}?auth=false&brokenIsFine=true`} 
                  alt={avatar.name}
                />
              </div>
              {t('uploaded-avatar')}
              {selectedAvatarId === avatar._id && (
                <i className="fa fa-check"></i>
              )}
              <p className="sub-name">
                {selectedAvatarId !== avatar._id && (
                  <>
                    <a 
                      className="js-delete-avatar" 
                      onClick={(e) => handleDeleteAvatar(avatar._id, e)}
                    >
                      {t('delete')}
                    </a>
                    {' - '}
                  </>
                )}
                {avatar.name}
              </p>
            </a>
          </li>
        ))}
        
        <li>
          <a className="js-select-initials" onClick={handleSelectInitials}>
            <div className="member">
              <UserAvatarInitials userId={Meteor.userId()} />
            </div>
            {t('initials')}
          </a>
        </li>
      </ul>
    </div>
  );
};

export {
  UserAvatar,
  UserAvatarInitials,
  OrgAvatar,
  BoardOrgName,
  TeamAvatar,
  BoardTeamName,
  UserPopup,
  MemberName,
  ChangeAvatarPopup
};

export default UserAvatar;
