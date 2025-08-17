import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { ReactiveCache } from '/imports/reactiveCache';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * SettingBody Component
 * 
 * Replaces the original Blaze settingBody component with a React component.
 * This component manages admin settings including:
 * - Registration settings
 * - Email settings
 * - Account settings
 * - Table visibility mode settings
 * - Announcement settings
 * - Accessibility settings
 * - Layout settings
 * - Webhook settings
 * 
 * Original Blaze component had:
 * - setting: Main settings component
 * - Various sub-components for different setting categories
 */
const SettingBody = ({ onClose, onUpdate }) => {
  const [currentView, setCurrentView] = useState('registration-setting');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentUser, isAdmin, isSandstorm, currentSetting, currentAnnouncements, currentAccessibility } = useTracker(() => {
    const user = ReactiveCache.getCurrentUser();
    if (!user) return { 
      currentUser: null, 
      isAdmin: false, 
      isSandstorm: false,
      currentSetting: null,
      currentAnnouncements: null,
      currentAccessibility: null
    };

    const adminStatus = user.isAdmin();
    
    // Check if running on Sandstorm
    const sandstormStatus = window.location.hostname.includes('sandstorm') || 
                           window.location.hostname.includes('sandcats');

    const setting = ReactiveCache.getCurrentSetting();
    const announcements = ReactiveCache.getCurrentAnnouncements();
    const accessibility = ReactiveCache.getCurrentAccessibility();

    return {
      currentUser: user,
      isAdmin: adminStatus,
      isSandstorm: sandstormStatus,
      currentSetting: setting,
      currentAnnouncements: announcements,
      currentAccessibility: accessibility,
    };
  }, []);

  // Handle view changes
  const handleViewChange = useCallback((viewId) => {
    setCurrentView(viewId);
  }, []);

  if (!currentUser || !isAdmin) {
    return (
      <div className="setting-body error">
        <div className="error-message">
          <i className="fa fa-exclamation-triangle"></i>
          {t('error-notAuthorized')}
        </div>
      </div>
    );
  }

  return (
    <div className="setting-content js-setting-body">
      <div className="content-title">
        <i className="fa fa-cog"></i>
        <span>{t('settings')}</span>
        
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
            <li className={currentView === 'registration-setting' ? 'active' : ''}>
              <a 
                className="js-setting-menu"
                data-id="registration-setting"
                onClick={() => handleViewChange('registration-setting')}
              >
                <i className="fa fa-sign-in"></i>
                {t('registration')}
              </a>
            </li>
            
            {!isSandstorm && (
              <li className={currentView === 'email-setting' ? 'active' : ''}>
                <a 
                  className="js-setting-menu"
                  data-id="email-setting"
                  onClick={() => handleViewChange('email-setting')}
                >
                  <i className="fa fa-envelope"></i>
                  {t('email')}
                </a>
              </li>
            )}
            
            <li className={currentView === 'account-setting' ? 'active' : ''}>
              <a 
                className="js-setting-menu"
                data-id="account-setting"
                onClick={() => handleViewChange('account-setting')}
              >
                <i className="fa fa-users"></i>
                {t('accounts')}
              </a>
            </li>
            
            <li className={currentView === 'tableVisibilityMode-setting' ? 'active' : ''}>
              <a 
                className="js-setting-menu"
                data-id="tableVisibilityMode-setting"
                onClick={() => handleViewChange('tableVisibilityMode-setting')}
              >
                <i className="fa fa-eye"></i>
                {t('tableVisibilityMode')}
              </a>
            </li>
            
            <li className={currentView === 'announcement-setting' ? 'active' : ''}>
              <a 
                className="js-setting-menu"
                data-id="announcement-setting"
                onClick={() => handleViewChange('announcement-setting')}
              >
                <i className="fa fa-bullhorn"></i>
                {t('admin-announcement')}
              </a>
            </li>
            
            <li className={currentView === 'layout-setting' ? 'active' : ''}>
              <a 
                className="js-setting-menu"
                data-id="layout-setting"
                onClick={() => handleViewChange('layout-setting')}
              >
                <i className="fa fa-object-group"></i>
                {t('layout')}
              </a>
            </li>
            
            <li className={currentView === 'webhook-setting' ? 'active' : ''}>
              <a 
                className="js-setting-menu"
                data-id="webhook-setting"
                onClick={() => handleViewChange('webhook-setting')}
              >
                <i className="fa fa-globe"></i>
                {t('global-webhook')}
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
              {currentView === 'registration-setting' && (
                <GeneralSettings 
                  currentSetting={currentSetting}
                  onUpdate={onUpdate}
                />
              )}
              
              {currentView === 'email-setting' && !isSandstorm && (
                <EmailSettings 
                  currentSetting={currentSetting}
                  onUpdate={onUpdate}
                />
              )}
              
              {currentView === 'account-setting' && (
                <AccountSettings 
                  currentSetting={currentSetting}
                  onUpdate={onUpdate}
                />
              )}
              
              {currentView === 'tableVisibilityMode-setting' && (
                <TableVisibilityModeSettings 
                  currentSetting={currentSetting}
                  onUpdate={onUpdate}
                />
              )}
              
              {currentView === 'announcement-setting' && (
                <AnnouncementSettings 
                  currentSetting={currentSetting}
                  currentAnnouncements={currentAnnouncements}
                  onUpdate={onUpdate}
                />
              )}
              
              {currentView === 'layout-setting' && (
                <LayoutSettings 
                  currentSetting={currentSetting}
                  onUpdate={onUpdate}
                />
              )}
              
              {currentView === 'webhook-setting' && (
                <WebhookSettings 
                  currentSetting={currentSetting}
                  onUpdate={onUpdate}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * GeneralSettings Component
 * 
 * Registration and general settings
 */
const GeneralSettings = ({ currentSetting, onUpdate }) => {
  const t = (key) => enTranslations[key] || key;

  const [disableForgotPassword, setDisableForgotPassword] = useState(false);
  const [disableRegistration, setDisableRegistration] = useState(false);
  const [emailToInvite, setEmailToInvite] = useState('');
  const [selectedBoards, setSelectedBoards] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentSetting) {
      setDisableForgotPassword(currentSetting.disableForgotPassword || false);
      setDisableRegistration(currentSetting.disableRegistration || false);
    }
  }, [currentSetting]);

  const handleToggleForgotPassword = useCallback(async () => {
    try {
      setIsSubmitting(true);
      const newValue = !disableForgotPassword;
      setDisableForgotPassword(newValue);
      
      if (onUpdate) {
        await onUpdate('disableForgotPassword', newValue);
      } else {
        await Meteor.call('setting.update', 'disableForgotPassword', newValue);
      }
    } catch (err) {
      console.error('Error updating disable forgot password:', err);
      setDisableForgotPassword(!disableForgotPassword); // Revert on error
    } finally {
      setIsSubmitting(false);
    }
  }, [disableForgotPassword, onUpdate]);

  const handleToggleRegistration = useCallback(async () => {
    try {
      setIsSubmitting(true);
      const newValue = !disableRegistration;
      setDisableRegistration(newValue);
      
      if (onUpdate) {
        await onUpdate('disableRegistration', newValue);
      } else {
        await Meteor.call('setting.update', 'disableRegistration', newValue);
      }
    } catch (err) {
      console.error('Error updating disable registration:', err);
      setDisableRegistration(!disableRegistration); // Revert on error
    } finally {
      setIsSubmitting(false);
    }
  }, [disableRegistration, onUpdate]);

  const handleEmailInvite = useCallback(async () => {
    if (!emailToInvite.trim() || selectedBoards.length === 0) return;

    try {
      setIsSubmitting(true);
      
      if (onUpdate) {
        await onUpdate('sendInvitation', { emails: emailToInvite, boards: selectedBoards });
      } else {
        await Meteor.call('sendInvitation', emailToInvite, selectedBoards);
      }
      
      setEmailToInvite('');
      setSelectedBoards([]);
    } catch (err) {
      console.error('Error sending invitation:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [emailToInvite, selectedBoards, onUpdate]);

  return (
    <ul id="registration-setting" className="setting-detail">
      <li>
        <a className="flex js-toggle-forgot-password" onClick={handleToggleForgotPassword}>
          <div className={`materialCheckBox ${disableForgotPassword ? 'is-checked' : ''}`}></div>
          <span>{t('disable-forgot-password')}</span>
        </a>
      </li>
      
      <li>
        <a className="flex js-toggle-registration" onClick={handleToggleRegistration}>
          <div className={`materialCheckBox ${disableRegistration ? 'is-checked' : ''}`}></div>
          <span>{t('disable-self-registration')}</span>
        </a>
      </li>
      
      {!disableRegistration && (
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
                  value={emailToInvite}
                  onChange={(e) => setEmailToInvite(e.target.value)}
                />
              </li>
              
              <li>
                <div className="title">{t('to-boards')}</div>
                <div className="bg-white">
                  {/* TODO: Add board selection */}
                  <p>{t('board-selection-coming-soon')}</p>
                </div>
              </li>
              
              <li>
                <button 
                  className="js-email-invite primary btn btn-primary"
                  onClick={handleEmailInvite}
                  disabled={isSubmitting || !emailToInvite.trim()}
                >
                  {isSubmitting ? t('sending') : t('invite')}
                </button>
              </li>
            </ul>
          </div>
        </li>
      )}
    </ul>
  );
};

/**
 * EmailSettings Component
 * 
 * Email configuration settings
 */
const EmailSettings = ({ currentSetting, onUpdate }) => {
  const t = (key) => enTranslations[key] || key;

  const handleSendTestEmail = useCallback(async () => {
    try {
      if (onUpdate) {
        await onUpdate('sendTestEmail');
      } else {
        await Meteor.call('sendTestEmail');
      }
    } catch (err) {
      console.error('Error sending test email:', err);
    }
  }, [onUpdate]);

  return (
    <ul id="email-setting" className="setting-detail">
      <li>
        <button 
          className="js-send-smtp-test-email primary btn btn-primary"
          onClick={handleSendTestEmail}
        >
          {t('send-smtp-test')}
        </button>
      </li>
    </ul>
  );
};

/**
 * AccountSettings Component
 * 
 * Account management settings
 */
const AccountSettings = ({ currentSetting, onUpdate }) => {
  const t = (key) => enTranslations[key] || key;

  const [allowEmailChange, setAllowEmailChange] = useState(true);
  const [allowUserNameChange, setAllowUserNameChange] = useState(true);
  const [allowUserDelete, setAllowUserDelete] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentSetting) {
      setAllowEmailChange(currentSetting.allowEmailChange !== false);
      setAllowUserNameChange(currentSetting.allowUserNameChange !== false);
      setAllowUserDelete(currentSetting.allowUserDelete !== false);
    }
  }, [currentSetting]);

  const handleSave = useCallback(async () => {
    try {
      setIsSubmitting(true);
      
      if (onUpdate) {
        await onUpdate('accountSettings', {
          allowEmailChange,
          allowUserNameChange,
          allowUserDelete,
        });
      } else {
        await Meteor.call('setting.update', 'allowEmailChange', allowEmailChange);
        await Meteor.call('setting.update', 'allowUserNameChange', allowUserNameChange);
        await Meteor.call('setting.update', 'allowUserDelete', allowUserDelete);
      }
    } catch (err) {
      console.error('Error updating account settings:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [allowEmailChange, allowUserNameChange, allowUserDelete, onUpdate]);

  return (
    <ul id="account-setting" className="setting-detail">
      <li className="accounts-form">
        <div className="title">{t('accounts-allowEmailChange')}</div>
        <div className="form-group flex">
          <input
            type="radio"
            name="allowEmailChange"
            value="true"
            checked={allowEmailChange}
            onChange={() => setAllowEmailChange(true)}
          />
          <label>{t('yes')}</label>
          <input
            type="radio"
            name="allowEmailChange"
            value="false"
            checked={!allowEmailChange}
            onChange={() => setAllowEmailChange(false)}
          />
          <label>{t('no')}</label>
        </div>
        
        <div className="title">{t('accounts-allowUserNameChange')}</div>
        <div className="form-group flex">
          <input
            type="radio"
            name="allowUserNameChange"
            value="true"
            checked={allowUserNameChange}
            onChange={() => setAllowUserNameChange(true)}
          />
          <label>{t('yes')}</label>
          <input
            type="radio"
            name="allowUserNameChange"
            value="false"
            checked={!allowUserNameChange}
            onChange={() => setAllowUserNameChange(false)}
          />
          <label>{t('no')}</label>
        </div>
        
        <div className="title">{t('accounts-allowUserDelete')}</div>
        <div className="form-group flex">
          <input
            type="radio"
            name="allowUserDelete"
            value="true"
            checked={allowUserDelete}
            onChange={() => setAllowUserDelete(true)}
          />
          <label>{t('yes')}</label>
          <input
            type="radio"
            name="allowUserDelete"
            value="false"
            checked={!allowUserDelete}
            onChange={() => setAllowUserDelete(false)}
          />
          <label>{t('no')}</label>
        </div>
        
        <button 
          className="js-accounts-save primary btn btn-primary"
          onClick={handleSave}
          disabled={isSubmitting}
        >
          {isSubmitting ? t('saving') : t('save')}
        </button>
      </li>
    </ul>
  );
};

/**
 * TableVisibilityModeSettings Component
 * 
 * Table visibility mode settings
 */
const TableVisibilityModeSettings = ({ currentSetting, onUpdate }) => {
  const t = (key) => enTranslations[key] || key;

  const [allowPrivateOnly, setAllowPrivateOnly] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentSetting) {
      setAllowPrivateOnly(currentSetting.allowPrivateOnly || false);
    }
  }, [currentSetting]);

  const handleSave = useCallback(async () => {
    try {
      setIsSubmitting(true);
      
      if (onUpdate) {
        await onUpdate('allowPrivateOnly', allowPrivateOnly);
      } else {
        await Meteor.call('setting.update', 'allowPrivateOnly', allowPrivateOnly);
      }
    } catch (err) {
      console.error('Error updating table visibility mode:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [allowPrivateOnly, onUpdate]);

  return (
    <ul id="tableVisibilityMode-setting" className="setting-detail">
      <li className="tableVisibilityMode-form">
        <div className="title">{t('tableVisibilityMode-allowPrivateOnly')}</div>
        <div className="form-group flex">
          <input
            type="radio"
            name="allowPrivateOnly"
            value="true"
            checked={allowPrivateOnly}
            onChange={() => setAllowPrivateOnly(true)}
          />
          <label>{t('yes')}</label>
          <input
            type="radio"
            name="allowPrivateOnly"
            value="false"
            checked={!allowPrivateOnly}
            onChange={() => setAllowPrivateOnly(false)}
          />
          <label>{t('no')}</label>
        </div>
        <button 
          className="js-tableVisibilityMode-save primary btn btn-primary"
          onClick={handleSave}
          disabled={isSubmitting}
        >
          {isSubmitting ? t('saving') : t('save')}
        </button>
      </li>
    </ul>
  );
};

/**
 * AnnouncementSettings Component
 * 
 * Admin announcement settings
 */
const AnnouncementSettings = ({ currentSetting, currentAnnouncements, onUpdate }) => {
  const t = (key) => enTranslations[key] || key;

  const [enabled, setEnabled] = useState(false);
  const [announcementBody, setAnnouncementBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentAnnouncements) {
      setEnabled(currentAnnouncements.enabled || false);
      setAnnouncementBody(currentAnnouncements.body || '');
    }
  }, [currentAnnouncements]);

  const handleToggleActive = useCallback(async () => {
    try {
      setIsSubmitting(true);
      const newValue = !enabled;
      setEnabled(newValue);
      
      if (onUpdate) {
        await onUpdate('announcementEnabled', newValue);
      } else {
        await Meteor.call('setting.update', 'announcementEnabled', newValue);
      }
    } catch (err) {
      console.error('Error updating announcement enabled:', err);
      setEnabled(!enabled); // Revert on error
    } finally {
      setIsSubmitting(false);
    }
  }, [enabled, onUpdate]);

  const handleSave = useCallback(async () => {
    try {
      setIsSubmitting(true);
      
      if (onUpdate) {
        await onUpdate('announcementBody', announcementBody);
      } else {
        await Meteor.call('setting.update', 'announcementBody', announcementBody);
      }
    } catch (err) {
      console.error('Error updating announcement body:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [announcementBody, onUpdate]);

  return (
    <ul id="announcement-setting" className="setting-detail">
      <li>
        <a className="flex js-toggle-activemessage" onClick={handleToggleActive}>
          <div className={`materialCheckBox ${enabled ? 'is-checked' : ''}`}></div>
          <span>{t('admin-announcement-active')}</span>
        </a>
      </li>
      
      {enabled && (
        <li>
          <div className="admin-announcement">
            <ul>
              <li>
                <div className="title">{t('admin-announcement-title')}</div>
                <textarea
                  id="admin-announcement"
                  className="wekan-form-control"
                  value={announcementBody}
                  onChange={(e) => setAnnouncementBody(e.target.value)}
                />
              </li>
              <li>
                <button 
                  className="js-announcement-save primary btn btn-primary"
                  onClick={handleSave}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('saving') : t('save')}
                </button>
              </li>
            </ul>
          </div>
        </li>
      )}
    </ul>
  );
};

/**
 * LayoutSettings Component
 * 
 * Layout and appearance settings
 */
const LayoutSettings = ({ currentSetting, onUpdate }) => {
  const t = (key) => enTranslations[key] || key;

  const [oidcBtnText, setOidcBtnText] = useState('');
  const [mailDomainName, setMailDomainName] = useState('');
  const [legalNotice, setLegalNotice] = useState('');
  const [displayAuthenticationMethod, setDisplayAuthenticationMethod] = useState(false);
  const [defaultAuthenticationMethod, setDefaultAuthenticationMethod] = useState('password');
  const [spinnerName, setSpinnerName] = useState('spinner');
  const [productName, setProductName] = useState('');
  const [hideLogo, setHideLogo] = useState(false);
  const [customLoginLogoImageUrl, setCustomLoginLogoImageUrl] = useState('');
  const [customLoginLogoLinkUrl, setCustomLoginLogoLinkUrl] = useState('');
  const [customHelpLinkUrl, setCustomHelpLinkUrl] = useState('');
  const [textBelowCustomLoginLogo, setTextBelowCustomLoginLogo] = useState('');
  const [customTopLeftCornerLogoImageUrl, setCustomTopLeftCornerLogoImageUrl] = useState('');
  const [customTopLeftCornerLogoLinkUrl, setCustomTopLeftCornerLogoLinkUrl] = useState('');
  const [customTopLeftCornerLogoHeight, setCustomTopLeftCornerLogoHeight] = useState('');
  const [automaticLinkedUrlSchemes, setAutomaticLinkedUrlSchemes] = useState('');
  const [hideCardCounterList, setHideCardCounterList] = useState(false);
  const [hideBoardMemberList, setHideBoardMemberList] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentSetting) {
      setOidcBtnText(currentSetting.oidcBtnText || '');
      setMailDomainName(currentSetting.mailDomainName || '');
      setLegalNotice(currentSetting.legalNotice || '');
      setDisplayAuthenticationMethod(currentSetting.displayAuthenticationMethod || false);
      setDefaultAuthenticationMethod(currentSetting.defaultAuthenticationMethod || 'password');
      setSpinnerName(currentSetting.spinnerName || 'spinner');
      setProductName(currentSetting.productName || '');
      setHideLogo(currentSetting.hideLogo || false);
      setCustomLoginLogoImageUrl(currentSetting.customLoginLogoImageUrl || '');
      setCustomLoginLogoLinkUrl(currentSetting.customLoginLogoLinkUrl || '');
      setCustomHelpLinkUrl(currentSetting.customHelpLinkUrl || '');
      setTextBelowCustomLoginLogo(currentSetting.textBelowCustomLoginLogo || '');
      setCustomTopLeftCornerLogoImageUrl(currentSetting.customTopLeftCornerLogoImageUrl || '');
      setCustomTopLeftCornerLogoLinkUrl(currentSetting.customTopLeftCornerLogoLinkUrl || '');
      setCustomTopLeftCornerLogoHeight(currentSetting.customTopLeftCornerLogoHeight || '');
      setAutomaticLinkedUrlSchemes(currentSetting.automaticLinkedUrlSchemes || '');
      setHideCardCounterList(currentSetting.hideCardCounterList || false);
      setHideBoardMemberList(currentSetting.hideBoardMemberList || false);
    }
  }, [currentSetting]);

  const handleSave = useCallback(async () => {
    try {
      setIsSubmitting(true);
      
      const settings = {
        oidcBtnText,
        mailDomainName,
        legalNotice,
        displayAuthenticationMethod,
        defaultAuthenticationMethod,
        spinnerName,
        productName,
        hideLogo,
        customLoginLogoImageUrl,
        customLoginLogoLinkUrl,
        customHelpLinkUrl,
        textBelowCustomLoginLogo,
        customTopLeftCornerLogoImageUrl,
        customTopLeftCornerLogoLinkUrl,
        customTopLeftCornerLogoHeight,
        automaticLinkedUrlSchemes,
        hideCardCounterList,
        hideBoardMemberList,
      };
      
      if (onUpdate) {
        await onUpdate('layoutSettings', settings);
      } else {
        // Update each setting individually
        for (const [key, value] of Object.entries(settings)) {
          await Meteor.call('setting.update', key, value);
        }
      }
    } catch (err) {
      console.error('Error updating layout settings:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    oidcBtnText, mailDomainName, legalNotice, displayAuthenticationMethod,
    defaultAuthenticationMethod, spinnerName, productName, hideLogo,
    customLoginLogoImageUrl, customLoginLogoLinkUrl, customHelpLinkUrl,
    textBelowCustomLoginLogo, customTopLeftCornerLogoImageUrl,
    customTopLeftCornerLogoLinkUrl, customTopLeftCornerLogoHeight,
    automaticLinkedUrlSchemes, hideCardCounterList, hideBoardMemberList, onUpdate
  ]);

  return (
    <ul id="layout-setting" className="setting-detail">
      <li>
        <button className="js-all-boards-hide-activities primary btn btn-primary">
          {t('hide-activities-of-all-boards')}
        </button>
      </li>
      
      <li className="layout-form">
        <div className="title">{t('oidc-button-text')}</div>
        <div className="form-group">
          <input
            type="text"
            className="wekan-form-control"
            value={oidcBtnText}
            onChange={(e) => setOidcBtnText(e.target.value)}
          />
        </div>
      </li>
      
      <li className="layout-form">
        <div className="title">{t('can-invite-if-same-mailDomainName')}</div>
        <div className="form-group">
          <input
            type="text"
            className="wekan-form-control"
            value={mailDomainName}
            onChange={(e) => setMailDomainName(e.target.value)}
          />
        </div>
      </li>
      
      <li className="layout-form">
        <div className="title">{t('custom-legal-notice-link-url')}</div>
        <div className="form-group">
          <input
            type="text"
            className="wekan-form-control"
            value={legalNotice}
            onChange={(e) => setLegalNotice(e.target.value)}
          />
        </div>
      </li>
      
      <li className="layout-form">
        <div className="title">{t('display-authentication-method')}</div>
        <div className="form-group flex">
          <input
            type="radio"
            name="displayAuthenticationMethod"
            value="true"
            checked={displayAuthenticationMethod}
            onChange={() => setDisplayAuthenticationMethod(true)}
          />
          <label>{t('yes')}</label>
          <input
            type="radio"
            name="displayAuthenticationMethod"
            value="false"
            checked={!displayAuthenticationMethod}
            onChange={() => setDisplayAuthenticationMethod(false)}
          />
          <label>{t('no')}</label>
        </div>
      </li>
      
      <li className="layout-form">
        <div className="title">{t('default-authentication-method')}</div>
        <div className="form-group">
          <select
            value={defaultAuthenticationMethod}
            onChange={(e) => setDefaultAuthenticationMethod(e.target.value)}
          >
            <option value="password">{t('password')}</option>
            <option value="oauth2">{t('oauth2')}</option>
            <option value="oidc">{t('oidc')}</option>
          </select>
        </div>
      </li>
      
      <li className="layout-form">
        <div className="title">{t('wait-spinner')}</div>
        <div className="form-group">
          <select
            value={spinnerName}
            onChange={(e) => setSpinnerName(e.target.value)}
          >
            <option value="spinner">{t('spinner')}</option>
            <option value="dots">{t('dots')}</option>
            <option value="none">{t('none')}</option>
          </select>
        </div>
      </li>
      
      <li className="layout-form">
        <div className="title">{t('custom-product-name')}</div>
        <div className="form-group">
          <input
            type="text"
            className="wekan-form-control"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>
      </li>
      
      <li className="layout-form">
        <div className="title">{t('hide-logo')}</div>
        <div className="form-group flex">
          <input
            type="radio"
            name="hideLogo"
            value="true"
            checked={hideLogo}
            onChange={() => setHideLogo(true)}
          />
          <label>{t('yes')}</label>
          <input
            type="radio"
            name="hideLogo"
            value="false"
            checked={!hideLogo}
            onChange={() => setHideLogo(false)}
          />
          <label>{t('no')}</label>
        </div>
      </li>
      
      <li className="layout-form">
        <div className="title">{t('custom-login-logo-image-url')}</div>
        <div className="form-group">
          <input
            type="text"
            className="wekan-form-control"
            value={customLoginLogoImageUrl}
            onChange={(e) => setCustomLoginLogoImageUrl(e.target.value)}
          />
        </div>
      </li>
      
      <li className="layout-form">
        <div className="title">{t('custom-login-logo-link-url')}</div>
        <div className="form-group">
          <input
            type="text"
            className="wekan-form-control"
            value={customLoginLogoLinkUrl}
            onChange={(e) => setCustomLoginLogoLinkUrl(e.target.value)}
          />
        </div>
      </li>
      
      <li className="layout-form">
        <div className="title">{t('custom-help-link-url')}</div>
        <div className="form-group">
          <input
            type="text"
            className="wekan-form-control"
            value={customHelpLinkUrl}
            onChange={(e) => setCustomHelpLinkUrl(e.target.value)}
          />
        </div>
      </li>
      
      <li className="layout-form">
        <div className="title">{t('text-below-custom-login-logo')}</div>
        <div className="form-group">
          <textarea
            className="wekan-form-control"
            value={textBelowCustomLoginLogo}
            onChange={(e) => setTextBelowCustomLoginLogo(e.target.value)}
          />
        </div>
      </li>
      
      <li className="layout-form">
        <div className="title">{t('custom-top-left-corner-logo-image-url')}</div>
        <div className="form-group">
          <input
            type="text"
            className="wekan-form-control"
            value={customTopLeftCornerLogoImageUrl}
            onChange={(e) => setCustomTopLeftCornerLogoImageUrl(e.target.value)}
          />
        </div>
      </li>
      
      <li className="layout-form">
        <div className="title">{t('custom-top-left-corner-logo-link-url')}</div>
        <div className="form-group">
          <input
            type="text"
            className="wekan-form-control"
            value={customTopLeftCornerLogoLinkUrl}
            onChange={(e) => setCustomTopLeftCornerLogoLinkUrl(e.target.value)}
          />
        </div>
      </li>
      
      <li className="layout-form">
        <div className="title">{t('custom-top-left-corner-logo-height')}</div>
        <div className="form-group">
          <input
            type="text"
            className="wekan-form-control"
            value={customTopLeftCornerLogoHeight}
            onChange={(e) => setCustomTopLeftCornerLogoHeight(e.target.value)}
          />
        </div>
      </li>
      
      <li className="layout-form">
        <div className="title">{t('automatic-linked-url-schemes')}</div>
        <div className="form-group">
          <textarea
            className="wekan-form-control"
            value={automaticLinkedUrlSchemes}
            onChange={(e) => setAutomaticLinkedUrlSchemes(e.target.value)}
          />
        </div>
      </li>
      
      <li className="layout-form">
        <div className="title">{t('hide-card-counter-list')}</div>
        <div className="form-group flex">
          <input
            type="radio"
            name="hideCardCounterList"
            value="true"
            checked={hideCardCounterList}
            onChange={() => setHideCardCounterList(true)}
          />
          <label>{t('yes')}</label>
          <input
            type="radio"
            name="hideCardCounterList"
            value="false"
            checked={!hideCardCounterList}
            onChange={() => setHideCardCounterList(false)}
          />
          <label>{t('no')}</label>
        </div>
      </li>
      
      <li className="layout-form">
        <div className="title">{t('hide-board-member-list')}</div>
        <div className="form-group flex">
          <input
            type="radio"
            name="hideBoardMemberList"
            value="true"
            checked={hideBoardMemberList}
            onChange={() => setHideBoardMemberList(true)}
          />
          <label>{t('yes')}</label>
          <input
            type="radio"
            name="hideBoardMemberList"
            value="false"
            checked={!hideBoardMemberList}
            onChange={() => setHideBoardMemberList(false)}
          />
          <label>{t('no')}</label>
        </div>
      </li>
      
      <li>
        <button 
          className="js-save-layout primary btn btn-primary"
          onClick={handleSave}
          disabled={isSubmitting}
        >
          {isSubmitting ? t('saving') : t('save')}
        </button>
      </li>
    </ul>
  );
};

/**
 * WebhookSettings Component
 * 
 * Global webhook settings
 */
const WebhookSettings = ({ currentSetting, onUpdate }) => {
  const t = (key) => enTranslations[key] || key;

  return (
    <div id="webhook-setting" className="setting-detail">
      <span>
        {/* TODO: Add outgoing webhooks popup component */}
        <p>{t('webhook-components-coming-soon')}</p>
      </span>
    </div>
  );
};

export default SettingBody;
