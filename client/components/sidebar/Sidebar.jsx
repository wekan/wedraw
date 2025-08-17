import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { ReactiveCache } from '/imports/reactiveCache';
import { Utils } from '/imports/utils';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * Sidebar Component
 * 
 * Replaces the original Blaze sidebar component with a React component.
 * This component provides the main board sidebar functionality with multiple views,
 * including home, filter, search, multiselection, custom fields, and archives.
 * 
 * Original Blaze component had:
 * - sidebar: Main sidebar component with view management
 * - homeSidebar: Home view with board information
 * - Multiple popup components for board management
 * - Member and label management
 * - Board settings and configuration
 */
const Sidebar = ({ 
  onClose, 
  onUpdate,
  defaultView = 'home'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState(defaultView);
  const [hideCardCounterList, setHideCardCounterList] = useState(false);
  const [hideBoardMemberList, setHideBoardMemberList] = useState(false);

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { 
    currentUser, 
    currentBoard, 
    isBoardAdmin,
    isBoardMember,
    isMiniScreen 
  } = useTracker(() => {
    const user = ReactiveCache.getCurrentUser();
    if (!user) return {
      currentUser: null,
      currentBoard: null,
      isBoardAdmin: false,
      isBoardMember: false,
      isMiniScreen: false
    };

    const board = Utils.getCurrentBoard();
    const boardAdminStatus = board ? user.isBoardAdmin() : false;
    const boardMemberStatus = board ? user.isBoardMember() : false;
    const miniScreenStatus = Utils.isMiniScreen();

    return {
      currentUser: user,
      currentBoard: board,
      isBoardAdmin: boardAdminStatus,
      isBoardMember: boardMemberStatus,
      isMiniScreen: miniScreenStatus
    };
  }, []);

  // View titles mapping
  const viewTitles = {
    filter: 'filter-cards',
    search: 'search-cards',
    multiselection: 'multi-selection',
    customFields: 'custom-fields',
    archives: 'archives',
  };

  // Handle sidebar open/close
  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleOpen = useCallback(() => {
    if (!isOpen) {
      setIsOpen(true);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (isOpen) {
      setIsOpen(false);
    }
  }, [isOpen]);

  // Handle view change
  const handleViewChange = useCallback((view) => {
    const newView = typeof view === 'string' ? view : defaultView;
    if (currentView !== newView) {
      setCurrentView(newView);
      handleOpen();
    }
  }, [currentView, defaultView, handleOpen]);

  // Check if tongue should be hidden
  const isTongueHidden = isOpen && currentView !== defaultView;

  // Get view title
  const getViewTitle = () => {
    return t(viewTitles[currentView] || currentView);
  };

  // Get tongue title
  const getTongueTitle = () => {
    if (isOpen) return t('sidebar-close');
    return t('sidebar-open');
  };

  // Check user preferences
  const isKeyboardShortcuts = currentUser?.isKeyboardShortcuts();
  const isVerticalScrollbars = currentUser?.isVerticalScrollbars();

  // Handle keyboard shortcuts toggle
  const handleKeyboardShortcutsToggle = useCallback(() => {
    if (currentUser) {
      currentUser.toggleKeyboardShortcuts();
    }
  }, [currentUser]);

  // Handle vertical scrollbars toggle
  const handleVerticalScrollbarsToggle = useCallback(() => {
    if (currentUser) {
      currentUser.toggleVerticalScrollbars();
    }
  }, [currentUser]);

  // Handle show week of year toggle
  const handleShowWeekOfYearToggle = useCallback(() => {
    if (currentUser) {
      currentUser.toggleShowWeekOfYear();
    }
  }, [currentUser]);

  // Handle minicard label text toggle
  const handleMinicardLabelTextToggle = useCallback(() => {
    if (currentUser) {
      Meteor.call('toggleMinicardLabelText');
    } else if (window.localStorage.getItem('hiddenMinicardLabelText')) {
      window.localStorage.removeItem('hiddenMinicardLabelText');
      location.reload();
    } else {
      window.localStorage.setItem('hiddenMinicardLabelText', 'true');
      location.reload();
    }
  }, [currentUser]);

  // Handle shortcuts navigation
  const handleShortcuts = useCallback(() => {
    // TODO: Implement shortcuts navigation
    console.log('Navigate to shortcuts');
  }, []);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="sidebar js-sidebar">
      {/* Sidebar Toggle Button */}
      <button
        className="js-toggle-sidebar sidebar-toggle"
        onClick={handleToggle}
        title={getTongueTitle()}
      >
        <i className="fa fa-bars"></i>
      </button>

      {/* Sidebar Content */}
      {isOpen && (
        <div className="sidebar-content js-board-sidebar-content">
          {/* Sidebar Header */}
          <div className="sidebar-header">
            <div className="sidebar-header-title">
              {currentView === defaultView ? (
                <span>{t('sidebar')}</span>
              ) : (
                <span>{getViewTitle()}</span>
              )}
            </div>

            <div className="sidebar-header-actions">
              {currentView !== defaultView && (
                <button
                  className="js-back-home sidebar-back-btn"
                  onClick={() => handleViewChange(defaultView)}
                  title={t('back-to-home')}
                >
                  <i className="fa fa-home"></i>
                </button>
              )}

              <button
                className="js-close-sidebar sidebar-close-btn"
                onClick={handleClose}
                title={t('close')}
              >
                <i className="fa fa-times"></i>
              </button>
            </div>
          </div>

          {/* Sidebar Body */}
          <div className="sidebar-body">
            {currentView === 'home' && (
              <HomeSidebar
                currentBoard={currentBoard}
                isBoardAdmin={isBoardAdmin}
                isBoardMember={isBoardMember}
                isMiniScreen={isMiniScreen}
                hideCardCounterList={hideCardCounterList}
                hideBoardMemberList={hideBoardMemberList}
                onViewChange={handleViewChange}
                onUpdate={onUpdate}
              />
            )}

            {currentView === 'filter' && (
              <FilterSidebar
                currentBoard={currentBoard}
                onUpdate={onUpdate}
              />
            )}

            {currentView === 'search' && (
              <SearchSidebar
                currentBoard={currentBoard}
                onUpdate={onUpdate}
              />
            )}

            {currentView === 'multiselection' && (
              <MultiselectionSidebar
                currentBoard={currentBoard}
                onUpdate={onUpdate}
              />
            )}

            {currentView === 'customFields' && (
              <CustomFieldsSidebar
                currentBoard={currentBoard}
                isBoardAdmin={isBoardAdmin}
                onUpdate={onUpdate}
              />
            )}

            {currentView === 'archives' && (
              <ArchivesSidebar
                currentBoard={currentBoard}
                isBoardAdmin={isBoardAdmin}
                onUpdate={onUpdate}
              />
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="sidebar-footer">
            <div className="sidebar-settings">
              <button
                className="js-keyboard-shortcuts-toggle sidebar-setting-btn"
                onClick={handleKeyboardShortcutsToggle}
                title={t('keyboard-shortcuts')}
              >
                <i className={`fa fa-keyboard ${isKeyboardShortcuts ? 'active' : ''}`}></i>
              </button>

              <button
                className="js-vertical-scrollbars-toggle sidebar-setting-btn"
                onClick={handleVerticalScrollbarsToggle}
                title={t('vertical-scrollbars')}
              >
                <i className={`fa fa-arrows-v ${isVerticalScrollbars ? 'active' : ''}`}></i>
              </button>

              <button
                className="js-show-week-of-year-toggle sidebar-setting-btn"
                onClick={handleShowWeekOfYearToggle}
                title={t('show-week-of-year')}
              >
                <i className="fa fa-calendar"></i>
              </button>

              <button
                className="js-toggle-minicard-label-text sidebar-setting-btn"
                onClick={handleMinicardLabelTextToggle}
                title={t('toggle-minicard-label-text')}
              >
                <i className="fa fa-tag"></i>
              </button>

              <button
                className="js-shortcuts sidebar-setting-btn"
                onClick={handleShortcuts}
                title={t('shortcuts')}
              >
                <i className="fa fa-question-circle"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * HomeSidebar Component
 * 
 * Home view sidebar with board information and member management
 */
const HomeSidebar = ({ 
  currentBoard, 
  isBoardAdmin, 
  isBoardMember, 
  isMiniScreen,
  hideCardCounterList,
  hideBoardMemberList,
  onViewChange,
  onUpdate 
}) => {
  const t = (key) => enTranslations[key] || key;

  // Check if minicard label text is hidden
  const hiddenMinicardLabelText = currentBoard?.profile?.hiddenMinicardLabelText || 
    window.localStorage.getItem('hiddenMinicardLabelText');

  // Check board settings
  const isVerticalScrollbars = currentBoard?.isVerticalScrollbars();
  const isShowWeekOfYear = currentBoard?.isShowWeekOfYear();
  const showActivities = currentBoard?.showActivities ?? false;

  // Handle show activities toggle
  const handleShowActivitiesToggle = useCallback(() => {
    if (currentBoard) {
      currentBoard.toggleShowActivities();
      if (onUpdate) onUpdate();
    }
  }, [currentBoard, onUpdate]);

  return (
    <div className="home-sidebar js-home-sidebar">
      {/* Board Information */}
      {currentBoard && (
        <div className="board-info">
          <h3 className="board-title">{currentBoard.title}</h3>
          
          {!isMiniScreen && (
            <div className="board-stats">
              <div className="board-stat">
                <i className="fa fa-list"></i>
                <span>{t('lists')}: {currentBoard.lists?.length || 0}</span>
              </div>
              
              <div className="board-stat">
                <i className="fa fa-credit-card"></i>
                <span>{t('cards')}: {currentBoard.cards?.length || 0}</span>
              </div>
              
              <div className="board-stat">
                <i className="fa fa-users"></i>
                <span>{t('members')}: {currentBoard.members?.length || 0}</span>
              </div>
            </div>
          )}

          {/* Board Settings */}
          {isBoardAdmin && (
            <div className="board-settings">
              <button
                className="js-custom-fields sidebar-nav-btn"
                onClick={() => onViewChange('customFields')}
              >
                <i className="fa fa-cogs"></i>
                {t('custom-fields')}
              </button>

              <button
                className="js-open-archives sidebar-nav-btn"
                onClick={() => onViewChange('archives')}
              >
                <i className="fa fa-archive"></i>
                {t('archives')}
              </button>

              <button
                className="js-open-rules-view sidebar-nav-btn"
                onClick={() => {
                  // TODO: Open rules view
                  console.log('Open rules view');
                }}
              >
                <i className="fa fa-magic"></i>
                {t('rules')}
              </button>
            </div>
          )}

          {/* Member Management */}
          {isBoardMember && (
            <div className="member-management">
              <button
                className="js-manage-board-members sidebar-nav-btn"
                onClick={() => {
                  // TODO: Open member management
                  console.log('Open member management');
                }}
              >
                <i className="fa fa-user-plus"></i>
                {t('manage-members')}
              </button>

              <button
                className="js-manage-board-addOrg sidebar-nav-btn"
                onClick={() => {
                  // TODO: Open organization management
                  console.log('Open organization management');
                }}
              >
                <i className="fa fa-building"></i>
                {t('manage-organizations')}
              </button>

              <button
                className="js-manage-board-addTeam sidebar-nav-btn"
                onClick={() => {
                  // TODO: Open team management
                  console.log('Open team management');
                }}
              >
                <i className="fa fa-users"></i>
                {t('manage-teams')}
              </button>
            </div>
          )}

          {/* Board Actions */}
          <div className="board-actions">
            <button
              className="js-import sidebar-action-btn"
              onClick={() => {
                // TODO: Open import dialog
                console.log('Open import dialog');
              }}
            >
              <i className="fa fa-download"></i>
              {t('import')}
            </button>

            <button
              className="js-export sidebar-action-btn"
              onClick={() => {
                // TODO: Open export dialog
                console.log('Open export dialog');
              }}
            >
              <i className="fa fa-upload"></i>
              {t('export')}
            </button>
          </div>
        </div>
      )}

      {/* Activities Toggle */}
      {isBoardAdmin && (
        <div className="activities-toggle">
          <label className="sidebar-checkbox">
            <input
              type="checkbox"
              id="toggleShowActivitiesBoard"
              checked={showActivities}
              onChange={handleShowActivitiesToggle}
            />
            <span className="checkmark"></span>
            {t('show-activities')}
          </label>
        </div>
      )}
    </div>
  );
};

/**
 * FilterSidebar Component
 * 
 * Filter view sidebar for card filtering
 */
const FilterSidebar = ({ currentBoard, onUpdate }) => {
  const t = (key) => enTranslations[key] || key;

  return (
    <div className="filter-sidebar js-filter-sidebar">
      <h3>{t('filter-cards')}</h3>
      <p>{t('filter-sidebar-coming-soon')}</p>
    </div>
  );
};

/**
 * SearchSidebar Component
 * 
 * Search view sidebar for card search
 */
const SearchSidebar = ({ currentBoard, onUpdate }) => {
  const t = (key) => enTranslations[key] || key;

  return (
    <div className="search-sidebar js-search-sidebar">
      <h3>{t('search-cards')}</h3>
      <p>{t('search-sidebar-coming-soon')}</p>
    </div>
  );
};

/**
 * MultiselectionSidebar Component
 * 
 * Multiselection view sidebar for bulk operations
 */
const MultiselectionSidebar = ({ currentBoard, onUpdate }) => {
  const t = (key) => enTranslations[key] || key;

  return (
    <div className="multiselection-sidebar js-multiselection-sidebar">
      <h3>{t('multi-selection')}</h3>
      <p>{t('multiselection-sidebar-coming-soon')}</p>
    </div>
  );
};

/**
 * CustomFieldsSidebar Component
 * 
 * Custom fields view sidebar for field management
 */
const CustomFieldsSidebar = ({ currentBoard, isBoardAdmin, onUpdate }) => {
  const t = (key) => enTranslations[key] || key;

  if (!isBoardAdmin) {
    return (
      <div className="custom-fields-sidebar error">
        <div className="error-message">
          <i className="fa fa-exclamation-triangle"></i>
          {t('error-notAuthorized')}
        </div>
      </div>
    );
  }

  return (
    <div className="custom-fields-sidebar js-custom-fields-sidebar">
      <h3>{t('custom-fields')}</h3>
      <p>{t('custom-fields-sidebar-coming-soon')}</p>
    </div>
  );
};

/**
 * ArchivesSidebar Component
 * 
 * Archives view sidebar for archived content
 */
const ArchivesSidebar = ({ currentBoard, isBoardAdmin, onUpdate }) => {
  const t = (key) => enTranslations[key] || key;

  if (!isBoardAdmin) {
    return (
      <div className="archives-sidebar error">
        <div className="error-message">
          <i className="fa fa-exclamation-triangle"></i>
          {t('error-notAuthorized')}
        </div>
      </div>
    );
  }

  return (
    <div className="archives-sidebar js-archives-sidebar">
      <h3>{t('archives')}</h3>
      <p>{t('archives-sidebar-coming-soon')}</p>
    </div>
  );
};

export default Sidebar;
