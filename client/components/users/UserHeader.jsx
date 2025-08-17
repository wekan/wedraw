import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { ReactiveCache } from '/imports/reactiveCache';
import { Utils } from '/imports/utils';

// Import translations and i18n system
import { TAPi18n } from '/imports/i18n';

/**
 * UserHeader Component
 * 
 * Replaces the original Blaze headerUserBar component with a React component.
 * This component provides the main user header bar with profile information,
 * member menu popup, and various user management popups.
 * 
 * Original Blaze component had:
 * - headerUserBar: Main user header bar
 * - memberMenuPopup: User menu with navigation and settings
 * - invitePeoplePopup: People invitation interface
 * - editProfilePopup: Profile editing interface
 * - changePasswordPopup: Password change interface
 * - changeLanguagePopup: Language selection interface
 * - changeSettingsPopup: User settings interface
 * - userDeletePopup: User deletion confirmation
 */
const UserHeader = ({ onClose, onUpdate }) => {
  const [showMemberMenu, setShowMemberMenu] = useState(false);
  const [showInvitePeople, setShowInvitePeople] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showChangeLanguage, setShowChangeLanguage] = useState(false);
  const [showChangeSettings, setShowChangeSettings] = useState(false);
  const [showUserDelete, setShowUserDelete] = useState(false);

  // Helper function to get translations
  const t = (key) => {
    return TAPi18n.__(key);
  };

  // Track reactive data
  const { 
    currentUser, 
    isAdmin, 
    isWorker, 
    isMiniScreen, 
    isSandstorm,
    isSameDomainNameSettingValue,
    isNotOAuth2AuthenticationMethod,
    allowUserNameChange,
    allowEmailChange,
    allowUserDelete,
    showCardsCountAt,
    startDayOfWeek,
    rescueCardDescription,
    weekDays,
    languages,
    currentLanguage,
    boards,
    templatesBoardId,
    templatesBoardSlug
  } = useTracker(() => {
    const user = ReactiveCache.getCurrentUser();
    if (!user) return {
      currentUser: null,
      isAdmin: false,
      isWorker: false,
      isMiniScreen: false,
      isSandstorm: false,
      isSameDomainNameSettingValue: false,
      isNotOAuth2AuthenticationMethod: true,
      allowUserNameChange: true,
      allowEmailChange: true,
      allowUserDelete: false,
      showCardsCountAt: 10,
      startDayOfWeek: 1,
      rescueCardDescription: false,
      weekDays: [],
      languages: [],
      currentLanguage: TAPi18n.getLanguage(),
      boards: [],
      templatesBoardId: null,
      templatesBoardSlug: null
    };

    const adminStatus = user.isAdmin();
    const workerStatus = user.isWorker();
    const miniScreenStatus = Utils.isMiniScreen();

    // TODO: Get these values from ReactiveCache or settings
    const sandstormStatus = false;
    const domainSettingValue = false;
    const oauth2Status = false;
    const userNameChangeAllowed = true;
    const emailChangeAllowed = true;
    const userDeleteAllowed = false;
    const cardsCountSetting = 10;
    const dayOfWeekSetting = 1;
    const rescueCardSetting = false;

    // Mock data for now
    const weekDaysData = [
      { value: 1, name: 'Monday', isSelected: dayOfWeekSetting === 1 },
      { value: 2, name: 'Tuesday', isSelected: dayOfWeekSetting === 2 },
      { value: 3, name: 'Wednesday', isSelected: dayOfWeekSetting === 3 },
      { value: 4, name: 'Thursday', isSelected: dayOfWeekSetting === 4 },
      { value: 5, name: 'Friday', isSelected: dayOfWeekSetting === 5 },
      { value: 6, name: 'Saturday', isSelected: dayOfWeekSetting === 6 },
      { value: 0, name: 'Sunday', isSelected: dayOfWeekSetting === 0 }
    ];

    const languagesData = TAPi18n.getSupportedLanguages();

    const boardsData = ReactiveCache.getBoards() || [];
    const templatesBoard = boardsData.find(board => board.isTemplate);

    return {
      currentUser: user,
      isAdmin: adminStatus,
      isWorker: workerStatus,
      isMiniScreen: miniScreenStatus,
      isSandstorm: sandstormStatus,
      isSameDomainNameSettingValue: domainSettingValue,
      isNotOAuth2AuthenticationMethod: !oauth2Status,
      allowUserNameChange: userNameChangeAllowed,
      allowEmailChange: emailChangeAllowed,
      allowUserDelete: userDeleteAllowed,
      showCardsCountAt: cardsCountSetting,
      startDayOfWeek: dayOfWeekSetting,
      rescueCardDescription: rescueCardSetting,
      weekDays: weekDaysData,
      languages: languagesData,
      currentLanguage: TAPi18n.getLanguage(),
      boards: boardsData,
      templatesBoardId: templatesBoard?._id || null,
      templatesBoardSlug: templatesBoard?.slug || null
    };
  }, []);

  // Toggle member menu
  const toggleMemberMenu = useCallback(() => {
    setShowMemberMenu(prev => !prev);
  }, []);

  // Close all popups
  const closeAllPopups = useCallback(() => {
    setShowMemberMenu(false);
    setShowInvitePeople(false);
    setShowEditProfile(false);
    setShowChangePassword(false);
    setShowChangeLanguage(false);
    setShowChangeSettings(false);
    setShowUserDelete(false);
  }, []);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await Meteor.logout();
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Error logging out:', err);
    }
  }, [onUpdate]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="user-header js-user-header">
      <div id="header-user-bar" className="header-user-bar">
        <button
          className="header-user-bar-name js-open-header-member-menu"
          title={t('memberMenuPopup-title')}
          onClick={toggleMemberMenu}
        >
          <div className="header-user-bar-avatar">
            <UserAvatar userId={currentUser._id} />
          </div>
          
          {!isMiniScreen && !isSandstorm && (
            <span className="user-name">
              {currentUser.profile?.fullname || currentUser.username}
            </span>
          )}
        </button>
      </div>

      {/* Member Menu Popup */}
      {showMemberMenu && (
        <MemberMenuPopup
          currentUser={currentUser}
          isAdmin={isAdmin}
          isWorker={isWorker}
          isSandstorm={isSandstorm}
          isSameDomainNameSettingValue={isSameDomainNameSettingValue}
          isNotOAuth2AuthenticationMethod={isNotOAuth2AuthenticationMethod}
          templatesBoardId={templatesBoardId}
          templatesBoardSlug={templatesBoardSlug}
          onInvitePeople={() => {
            setShowInvitePeople(true);
            setShowMemberMenu(false);
          }}
          onEditProfile={() => {
            setShowEditProfile(true);
            setShowMemberMenu(false);
          }}
          onChangeSettings={() => {
            setShowChangeSettings(true);
            setShowMemberMenu(false);
          }}
          onEditAvatar={() => {
            // TODO: Implement avatar editing
            console.log('Edit avatar clicked');
          }}
          onChangePassword={() => {
            setShowChangePassword(true);
            setShowMemberMenu(false);
          }}
          onChangeLanguage={() => {
            setShowChangeLanguage(true);
            setShowMemberMenu(false);
          }}
          onLogout={handleLogout}
          onClose={closeAllPopups}
        />
      )}

      {/* Invite People Popup */}
      {showInvitePeople && (
        <InvitePeoplePopup
          boards={boards}
          onClose={() => setShowInvitePeople(false)}
          onUpdate={onUpdate}
        />
      )}

      {/* Edit Profile Popup */}
      {showEditProfile && (
        <EditProfilePopup
          currentUser={currentUser}
          allowUserNameChange={allowUserNameChange}
          allowEmailChange={allowEmailChange}
          allowUserDelete={allowUserDelete}
          onClose={() => setShowEditProfile(false)}
          onUpdate={onUpdate}
        />
      )}

      {/* Change Password Popup */}
      {showChangePassword && (
        <ChangePasswordPopup
          onClose={() => setShowChangePassword(false)}
          onUpdate={onUpdate}
        />
      )}

      {/* Change Language Popup */}
      {showChangeLanguage && (
        <ChangeLanguagePopup
          languages={languages}
          currentLanguage={currentLanguage}
          onClose={() => setShowChangeLanguage(false)}
          onUpdate={onUpdate}
        />
      )}

      {/* Change Settings Popup */}
      {showChangeSettings && (
        <ChangeSettingsPopup
          currentUser={currentUser}
          isWorker={isWorker}
          showCardsCountAt={showCardsCountAt}
          startDayOfWeek={startDayOfWeek}
          rescueCardDescription={rescueCardDescription}
          weekDays={weekDays}
          onClose={() => setShowChangeSettings(false)}
          onUpdate={onUpdate}
        />
      )}

      {/* User Delete Popup */}
      {showUserDelete && (
        <UserDeletePopup
          currentUser={currentUser}
          isWorker={isWorker}
          onClose={() => setShowUserDelete(false)}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
};

/**
 * UserAvatar Component
 * 
 * Displays user avatar
 */
const UserAvatar = ({ userId }) => {
  const { user } = useTracker(() => {
    const userData = ReactiveCache.getUser(userId);
    return { user: userData };
  }, [userId]);

  if (!user) {
    return (
      <div className="user-avatar-placeholder">
        <i className="fa fa-user"></i>
      </div>
    );
  }

  const initials = user.profile?.initials || user.username?.substring(0, 2) || 'U';
  const avatarUrl = user.profile?.avatarUrl;

  if (avatarUrl) {
    return (
      <img 
        src={avatarUrl} 
        alt={user.profile?.fullname || user.username}
        className="user-avatar-image"
      />
    );
  }

  return (
    <div className="user-avatar-initials">
      {initials.toUpperCase()}
    </div>
  );
};

/**
 * MemberMenuPopup Component
 * 
 * Main user menu popup
 */
const MemberMenuPopup = ({
  currentUser,
  isAdmin,
  isWorker,
  isSandstorm,
  isSameDomainNameSettingValue,
  isNotOAuth2AuthenticationMethod,
  templatesBoardId,
  templatesBoardSlug,
  onInvitePeople,
  onEditProfile,
  onChangeSettings,
  onEditAvatar,
  onChangePassword,
  onChangeLanguage,
  onLogout,
  onClose
}) => {
  const t = (key) => enTranslations[key] || key;

  return (
    <div className="member-menu-popup js-member-menu-popup">
      <ul className="pop-over-list">
        <li>
          <a href="/my-cards" className="js-my-cards">
            <i className="fa fa-list"></i>
            {t('my-cards')}
          </a>
        </li>
        
        <li>
          <a href="/due-cards" className="js-due-cards">
            <i className="fa fa-calendar"></i>
            {t('dueCards-title')}
          </a>
        </li>
        
        <li>
          <a href="/global-search" className="js-global-search">
            <i className="fa fa-search"></i>
            {t('globalSearch-title')}
          </a>
        </li>
        
        <li>
          <a href="/home">
            <span className="fa fa-home"></span>
            {t('all-boards')}
          </a>
        </li>
        
        <li>
          <a href="/public">
            <span className="fa fa-globe"></span>
            {t('public')}
          </a>
        </li>
        
        <li>
          <button className="board-header-btn js-open-archived-board">
            <i className="fa fa-archive"></i>
            <span>{t('archives')}</span>
          </button>
        </li>
        
        {!isWorker && (
          <ul className="pop-over-list">
            <li>
              <a href={`/board/${templatesBoardId}/${templatesBoardSlug}`}>
                <i className="fa fa-clone"></i>
                {t('templates')}
              </a>
            </li>
          </ul>
        )}
        
        {isAdmin && (
          <li>
            <a href="/setting" className="js-go-setting">
              <i className="fa fa-lock"></i>
              {t('admin-panel')}
            </a>
          </li>
        )}
        
        <hr />
        
        {isSameDomainNameSettingValue && (
          <li>
            <button className="js-invite-people" onClick={onInvitePeople}>
              <i className="fa fa-envelope"></i>
              {t('invite-people')}
            </button>
          </li>
        )}
        
        {isNotOAuth2AuthenticationMethod && (
          <li>
            <button className="js-edit-profile" onClick={onEditProfile}>
              <i className="fa fa-user"></i>
              {t('edit-profile')}
            </button>
          </li>
        )}
        
        <li>
          <button className="js-change-settings" onClick={onChangeSettings}>
            <i className="fa fa-cog"></i>
            {t('change-settings')}
          </button>
        </li>
        
        <li>
          <button className="js-change-avatar" onClick={onEditAvatar}>
            <i className="fa fa-picture-o"></i>
            {t('edit-avatar')}
          </button>
        </li>
        
        {!isSandstorm && isNotOAuth2AuthenticationMethod && (
          <li>
            <button className="js-change-password" onClick={onChangePassword}>
              <i className="fa fa-key"></i>
              {t('changePasswordPopup-title')}
            </button>
          </li>
        )}
        
        <li>
          <button className="js-change-language" onClick={onChangeLanguage}>
            <i className="fa fa-flag"></i>
            {t('changeLanguagePopup-title')}
          </button>
        </li>
      </ul>
      
      {!isSandstorm && (
        <>
          <hr />
          <ul className="pop-over-list">
            <li>
              <button className="js-logout" onClick={onLogout}>
                <i className="fa fa-sign-out"></i>
                {t('log-out')}
              </button>
            </li>
          </ul>
        </>
      )}
      
      <button className="popup-close" onClick={onClose}>
        <i className="fa fa-times"></i>
      </button>
    </div>
  );
};

/**
 * InvitePeoplePopup Component
 * 
 * People invitation interface
 */
const InvitePeoplePopup = ({ boards, onClose, onUpdate }) => {
  const t = (key) => enTranslations[key] || key;
  const [emails, setEmails] = useState('');
  const [selectedBoards, setSelectedBoards] = useState([]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    try {
      // TODO: Implement invitation sending
      // await Meteor.call('sendInvitation', emails, selectedBoards);
      console.log('Sending invitations to:', emails, 'for boards:', selectedBoards);
      
      if (onUpdate) {
        onUpdate();
      }
      
      onClose();
    } catch (err) {
      console.error('Error sending invitations:', err);
    }
  }, [emails, selectedBoards, onUpdate, onClose]);

  const toggleBoardSelection = useCallback((boardId) => {
    setSelectedBoards(prev => 
      prev.includes(boardId) 
        ? prev.filter(id => id !== boardId)
        : [...prev, boardId]
    );
  }, []);

  return (
    <div className="invite-people-popup js-invite-people-popup">
      <ul id="registration-setting" className="setting-detail">
        <li>
          <div id="invite-people-infos">
            <h3>{t('invite-people')}</h3>
          </div>
        </li>
        
        <li>
          <br />
        </li>
        
        <li>
          <div className="invite-people">
            <ul>
              <li>
                <div className="title">{t('invite-people')}</div>
                <textarea
                  id="email-to-invite"
                  className="wekan-form-control"
                  rows="5"
                  placeholder={t('email-addresses')}
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                />
              </li>
              
              <li>
                <div className="title">{t('to-boards')}</div>
                <div className="bg-white">
                  {boards.map(board => (
                    <a
                      key={board._id}
                      className={`option flex js-toggle-board-choose ${selectedBoards.includes(board._id) ? 'selected' : ''}`}
                      id={board._id}
                      onClick={() => toggleBoardSelection(board._id)}
                    >
                      <div 
                        className={`materialCheckBox ${selectedBoards.includes(board._id) ? 'is-checked' : ''}`}
                        data-id={board._id}
                      />
                      <span>{board.title}</span>
                    </a>
                  ))}
                </div>
              </li>
              
              <li>
                <button className="js-email-invite primary btn btn-primary" onClick={handleSubmit}>
                  {t('invite')}
                </button>
              </li>
            </ul>
          </div>
        </li>
      </ul>
      
      <button className="popup-close" onClick={onClose}>
        <i className="fa fa-times"></i>
      </button>
    </div>
  );
};

/**
 * EditProfilePopup Component
 * 
 * Profile editing interface
 */
const EditProfilePopup = ({ 
  currentUser, 
  allowUserNameChange, 
  allowEmailChange, 
  allowUserDelete, 
  onClose, 
  onUpdate 
}) => {
  const t = (key) => enTranslations[key] || key;
  const [formData, setFormData] = useState({
    fullname: currentUser.profile?.fullname || '',
    username: currentUser.username || '',
    initials: currentUser.profile?.initials || '',
    email: currentUser.emails?.[0]?.address || ''
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    try {
      // TODO: Implement profile update
      // await Meteor.call('updateProfile', formData);
      console.log('Updating profile:', formData);
      
      if (onUpdate) {
        onUpdate();
      }
      
      onClose();
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  }, [formData, onUpdate, onClose]);

  const handleDelete = useCallback(async () => {
    try {
      // TODO: Implement user deletion
      // await Meteor.call('deleteUser', currentUser._id);
      console.log('Deleting user:', currentUser._id);
      
      if (onUpdate) {
        onUpdate();
      }
      
      onClose();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  }, [currentUser._id, onUpdate, onClose]);

  return (
    <div className="edit-profile-popup js-edit-profile-popup">
      <form onSubmit={handleSubmit}>
        <label className="form-label">
          {t('fullname')}
          <input
            className="js-profile-fullname form-control"
            type="text"
            value={formData.fullname}
            onChange={(e) => setFormData(prev => ({ ...prev, fullname: e.target.value }))}
            autoFocus
          />
        </label>
        
        <label className="form-label">
          {t('username')}
          <span className={`error ${errors.username ? '' : 'hide'} username-taken`}>
            {t('error-username-taken')}
          </span>
          <input
            className="js-profile-username form-control"
            type="text"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            readOnly={!allowUserNameChange}
          />
        </label>
        
        <label className="form-label">
          {t('initials')}
          <input
            className="js-profile-initials form-control"
            type="text"
            value={formData.initials}
            onChange={(e) => setFormData(prev => ({ ...prev, initials: e.target.value }))}
          />
        </label>
        
        <label className="form-label">
          {t('email')}
          <span className={`error ${errors.email ? '' : 'hide'} email-taken`}>
            {t('error-email-taken')}
          </span>
          <input
            className="js-profile-email form-control"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            readOnly={!allowEmailChange}
          />
        </label>
        
        <div className="buttonsContainer">
          <input
            className="primary wide btn btn-primary"
            type="submit"
            value={t('save')}
          />
          
          {allowUserDelete && (
            <div>
              <input
                id="deleteButton"
                className="primary wide btn btn-danger"
                type="button"
                value={t('delete')}
                onClick={handleDelete}
              />
            </div>
          )}
          
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
};

/**
 * ChangePasswordPopup Component
 * 
 * Password change interface
 */
const ChangePasswordPopup = ({ onClose, onUpdate }) => {
  const t = (key) => enTranslations[key] || key;

  return (
    <div className="change-password-popup js-change-password-popup">
      <p>{t('change-password-coming-soon')}</p>
      <button className="btn btn-secondary" onClick={onClose}>
        {t('close')}
      </button>
    </div>
  );
};

/**
 * ChangeLanguagePopup Component
 * 
 * Language selection interface
 */
const ChangeLanguagePopup = ({ languages, currentLanguage, onClose, onUpdate }) => {
  const t = (key) => TAPi18n.__(key);

  const handleLanguageChange = useCallback(async (languageCode) => {
    try {
      // Change the language using the i18n system
      await TAPi18n.setLanguage(languageCode);
      
      if (onUpdate) {
        onUpdate();
      }
      
      onClose();
    } catch (err) {
      console.error('Error changing language:', err);
    }
  }, [onUpdate, onClose]);

  return (
    <div className="change-language-popup js-change-language-popup">
      <ul className="pop-over-list">
        {languages.map(language => (
          <li key={language.code} className={language.code === currentLanguage ? 'active' : ''}>
            <button
              className="js-set-language language-option"
              onClick={() => handleLanguageChange(language.code)}
            >
              {language.name}
              {language.code === currentLanguage && (
                <i className="fa fa-check"></i>
              )}
            </button>
          </li>
        ))}
      </ul>
      
      <button className="popup-close" onClick={onClose}>
        <i className="fa fa-times"></i>
      </button>
    </div>
  );
};

/**
 * ChangeSettingsPopup Component
 * 
 * User settings interface
 */
const ChangeSettingsPopup = ({ 
  currentUser, 
  isWorker, 
  showCardsCountAt, 
  startDayOfWeek, 
  rescueCardDescription, 
  weekDays, 
  onClose, 
  onUpdate 
}) => {
  const t = (key) => TAPi18n.__(key);
  const [settings, setSettings] = useState({
    showCardsCountAt,
    startDayOfWeek,
    rescueCardDescription
  });

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    try {
      // TODO: Implement settings update
      // await Meteor.call('updateUserSettings', settings);
      console.log('Updating settings:', settings);
      
      if (onUpdate) {
        onUpdate();
      }
      
      onClose();
    } catch (err) {
      console.error('Error updating settings:', err);
    }
  }, [settings, onUpdate, onClose]);

  return (
    <div className="change-settings-popup js-change-settings-popup">
      <ul className="pop-over-list">
        {!isWorker && (
          <>
            <li>
              <label className="bold clear">
                <i className="fa fa-sort-numeric-asc"></i>
                {t('show-cards-minimum-count')}
              </label>
              <input
                id="show-cards-count-at"
                className="inline-input left form-control"
                type="number"
                value={settings.showCardsCountAt}
                onChange={(e) => setSettings(prev => ({ ...prev, showCardsCountAt: parseInt(e.target.value) }))}
                min="-1"
              />
            </li>
            
            <li>
              <label className="bold clear">
                <i className="fa fa-calendar"></i>
                {t('start-day-of-week')}
              </label>
              <select
                id="start-day-of-week"
                className="inline-input left form-control"
                value={settings.startDayOfWeek}
                onChange={(e) => setSettings(prev => ({ ...prev, startDayOfWeek: parseInt(e.target.value) }))}
              >
                {weekDays.map(day => (
                  <option key={day.value} value={day.value}>
                    {day.name}
                  </option>
                ))}
              </select>
            </li>
            
            <li>
              <label className="bold clear">{t('card-settings')}</label>
              <ul id="cards" className="card-description-rescued">
                <a className="flex js-rescue-card-description" title={t('rescue-card-description')}>
                  <b>&nbsp;</b>
                  <div
                    id="rescue-card-description"
                    className={`materialCheckBox left ${settings.rescueCardDescription ? 'is-checked' : ''}`}
                    onClick={() => setSettings(prev => ({ ...prev, rescueCardDescription: !prev.rescueCardDescription }))}
                  />
                  <span>{t('rescue-card-description')}</span>
                </a>
              </ul>
            </li>
            
            <li>
              <input
                className="js-apply-user-settings left btn btn-primary"
                type="submit"
                value={t('apply')}
                onClick={handleSubmit}
              />
            </li>
          </>
        )}
      </ul>
      
      <button className="popup-close" onClick={onClose}>
        <i className="fa fa-times"></i>
      </button>
    </div>
  );
};

/**
 * UserDeletePopup Component
 * 
 * User deletion confirmation
 */
const UserDeletePopup = ({ currentUser, isWorker, onClose, onUpdate }) => {
  const t = (key) => enTranslations[key] || key;

  const handleDelete = useCallback(async () => {
    try {
      // TODO: Implement user deletion
      // await Meteor.call('deleteUser', currentUser._id);
      console.log('Deleting user:', currentUser._id);
      
      if (onUpdate) {
        onUpdate();
      }
      
      onClose();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  }, [currentUser._id, onUpdate, onClose]);

  if (isWorker) {
    return null;
  }

  return (
    <div className="user-delete-popup js-user-delete-popup">
      <p>{t('delete-user-confirm-popup')}</p>
      <button className="js-confirm negate full btn btn-danger" onClick={handleDelete}>
        {t('delete')}
      </button>
      <button className="btn btn-secondary" onClick={onClose}>
        {t('cancel')}
      </button>
    </div>
  );
};

export default UserHeader;
