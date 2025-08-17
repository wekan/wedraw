import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { ReactiveCache } from '/imports/reactiveCache';
import { Utils } from '/imports/utils';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * PeopleBody Component
 * 
 * Replaces the original Blaze peopleBody component with a React component.
 * This component manages people, organizations, and teams for administrators.
 * 
 * Original Blaze component had:
 * - people: Main people management component
 * - orgGeneral: Organization management
 * - teamGeneral: Team management
 * - peopleGeneral: User management
 * - Various popup components for editing
 */
const PeopleBody = ({ onClose, onUpdate }) => {
  const [currentView, setCurrentView] = useState('org-setting');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentUser, isAdmin, isMiniScreen } = useTracker(() => {
    const user = ReactiveCache.getCurrentUser();
    if (!user) return { 
      currentUser: null, 
      isAdmin: false, 
      isMiniScreen: false
    };

    const adminStatus = user.isAdmin();
    const miniScreenStatus = Utils.isMiniScreen();

    return {
      currentUser: user,
      isAdmin: adminStatus,
      isMiniScreen: miniScreenStatus,
    };
  }, []);

  // Handle view changes
  const handleViewChange = useCallback((viewId) => {
    setCurrentView(viewId);
  }, []);

  if (!currentUser || !isAdmin) {
    return (
      <div className="people-body error">
        <div className="error-message">
          <i className="fa fa-exclamation-triangle"></i>
          {t('error-notAuthorized')}
        </div>
      </div>
    );
  }

  return (
    <div className="setting-content js-people-body">
      <div className="content-title ext-box">
        <div className="ext-box-left">
          {isLoading ? (
            <div className="loading-spinner">
              <i className="fa fa-spinner fa-spin"></i>
            </div>
          ) : (
            <>
              {currentView === 'org-setting' && (
                <div className="view-header">
                  <span>
                    <i className="fa fa-sitemap"></i>
                    {!isMiniScreen && t('organizations')}
                  </span>
                  <div className="search-controls">
                    <input
                      id="searchOrgInput"
                      placeholder={t('search')}
                      className="search-input"
                    />
                    <button id="searchOrgButton" className="search-button">
                      <i className="fa fa-search"></i>
                      {t('search')}
                    </button>
                  </div>
                  <div className="ext-box-right">
                    {!isMiniScreen && (
                      <span>{t('org-number')}: {/* TODO: Add org count */}</span>
                    )}
                  </div>
                </div>
              )}
              
              {currentView === 'team-setting' && (
                <div className="view-header">
                  <span>
                    <i className="fa fa-users"></i>
                    {!isMiniScreen && t('teams')}
                  </span>
                  <div className="search-controls">
                    <input
                      id="searchTeamInput"
                      placeholder={t('search')}
                      className="search-input"
                    />
                    <button id="searchTeamButton" className="search-button">
                      <i className="fa fa-search"></i>
                      {t('search')}
                    </button>
                  </div>
                  <div className="ext-box-right">
                    {!isMiniScreen && (
                      <span>{t('team-number')}: {/* TODO: Add team count */}</span>
                    )}
                  </div>
                </div>
              )}
              
              {currentView === 'people-setting' && (
                <div className="view-header">
                  <span>
                    <i className="fa fa-user"></i>
                    {!isMiniScreen && t('people')}
                  </span>
                  <div className="search-controls">
                    <input
                      id="searchInput"
                      placeholder={t('search')}
                      className="search-input"
                    />
                    <button id="searchButton" className="search-button">
                      <i className="fa fa-search"></i>
                      {t('search')}
                    </button>
                  </div>
                  <div className="ext-box-right">
                    {!isMiniScreen && (
                      <span>{t('people-number')}: {/* TODO: Add people count */}</span>
                    )}
                  </div>
                  <div className="divAddOrRemoveTeam" id="divAddOrRemoveTeam">
                    <button id="addOrRemoveTeam" className="team-management-button">
                      <i className="fa fa-edit"></i>
                      {t('add')} / {t('delete')} {t('teams')}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
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
            <li className={currentView === 'org-setting' ? 'active' : ''}>
              <a 
                className="js-org-menu"
                data-id="org-setting"
                onClick={() => handleViewChange('org-setting')}
              >
                <i className="fa fa-sitemap"></i>
                {t('organizations')}
              </a>
            </li>
            
            <li className={currentView === 'team-setting' ? 'active' : ''}>
              <a 
                className="js-team-menu"
                data-id="team-setting"
                onClick={() => handleViewChange('team-setting')}
              >
                <i className="fa fa-users"></i>
                {t('teams')}
              </a>
            </li>
            
            <li className={currentView === 'people-setting' ? 'active' : ''}>
              <a 
                className="js-people-menu"
                data-id="people-setting"
                onClick={() => handleViewChange('people-setting')}
              >
                <i className="fa fa-user"></i>
                {t('people')}
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
              {currentView === 'org-setting' && (
                <OrgGeneral onUpdate={onUpdate} />
              )}
              
              {currentView === 'team-setting' && (
                <TeamGeneral onUpdate={onUpdate} />
              )}
              
              {currentView === 'people-setting' && (
                <PeopleGeneral onUpdate={onUpdate} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * OrgGeneral Component
 * 
 * Organization management table
 */
const OrgGeneral = ({ onUpdate }) => {
  const t = (key) => enTranslations[key] || key;

  return (
    <div className="org-general js-org-general">
      <table className="org-table">
        <thead>
          <tr>
            <th>{t('displayName')}</th>
            <th>{t('description')}</th>
            <th>{t('shortName')}</th>
            <th>{t('autoAddUsersWithDomainName')}</th>
            <th>{t('website')}</th>
            <th>{t('createdAt')}</th>
            <th>{t('active')}</th>
            <th>
              <button className="new-org btn btn-sm btn-primary">
                <i className="fa fa-plus-square"></i>
                {t('new')}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {/* TODO: Add organization rows */}
          <tr>
            <td colSpan="8" className="no-data">
              {t('no-organizations')}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

/**
 * TeamGeneral Component
 * 
 * Team management table
 */
const TeamGeneral = ({ onUpdate }) => {
  const t = (key) => enTranslations[key] || key;

  return (
    <div className="team-general js-team-general">
      <table className="team-table">
        <thead>
          <tr>
            <th>{t('displayName')}</th>
            <th>{t('description')}</th>
            <th>{t('shortName')}</th>
            <th>{t('website')}</th>
            <th>{t('createdAt')}</th>
            <th>{t('active')}</th>
            <th>
              <button className="new-team btn btn-sm btn-primary">
                <i className="fa fa-plus-square"></i>
                {t('new')}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {/* TODO: Add team rows */}
          <tr>
            <td colSpan="7" className="no-data">
              {t('no-teams')}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

/**
 * PeopleGeneral Component
 * 
 * User management table
 */
const PeopleGeneral = ({ onUpdate }) => {
  const t = (key) => enTranslations[key] || key;

  return (
    <div className="people-general js-people-general">
      <div id="divAddOrRemoveTeamContainer">
        {/* TODO: Add modify teams users component */}
        <p>{t('team-management-coming-soon')}</p>
      </div>
      
      <table className="people-table">
        <thead>
          <tr>
            <th>
              <div className="select-all-container">
                {t('dueCardsViewChange-choice-all')}
                <input
                  type="checkbox"
                  id="chkSelectAll"
                  className="allUserChkBox"
                />
              </div>
            </th>
            <th>{t('username')}</th>
            <th>{t('fullname')}</th>
            <th>{t('initials')}</th>
            <th>{t('admin')}</th>
            <th>{t('email')}</th>
            <th>{t('verified')}</th>
            <th>{t('createdAt')}</th>
            <th>{t('active')}</th>
            <th>{t('authentication-method')}</th>
            <th>{t('import-usernames')}</th>
            <th>{t('organizations')}</th>
            <th>{t('teams')}</th>
            <th>
              <button className="new-user btn btn-sm btn-primary">
                <i className="fa fa-plus-square"></i>
                {t('new')}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {/* TODO: Add user rows */}
          <tr>
            <td colSpan="14" className="no-data">
              {t('no-users')}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PeopleBody;
