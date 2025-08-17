import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { ReactiveCache } from '/imports/reactiveCache';
import { Utils } from '/imports/utils';

// Import global collections
// import { Announcements } from '/models/announcements';

// Import translations and i18n system
import { TAPi18n } from '/imports/i18n';

/**
 * Header Component
 * 
 * If the user is connected we display a small "quick-access" top bar that
 * list all starred boards with a link to go there. This is inspired by the
 * Reddit "subreddit" bar.
 * The first link goes to the boards page.
 */
const Header = () => {
  const navigate = useNavigate();
  const [currentSetting, setCurrentSetting] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDesktopDragHandles, setShowDesktopDragHandles] = useState(false);

  // Helper function to get translations
  const t = (key) => {
    return TAPi18n.__(key);
  };

  // Track reactive data
  const {
    currentUser,
    currentBoard,
    currentList,
    isMiniScreen,
    appIsOffline,
    hasAnnouncement,
    announcement
  } = useTracker(() => {
    // Subscribe to necessary data
    Meteor.subscribe('user-admin');
    Meteor.subscribe('boards');
    Meteor.subscribe('setting');
    Meteor.subscribe('announcements');

    return {
      currentUser: Meteor.user(),
      currentBoard: Session.get('currentBoard'),
      currentList: Session.get('currentList'),
      isMiniScreen: Utils?.isMiniScreen ? Utils.isMiniScreen() : false,
      appIsOffline: !Meteor.status().connected,
      hasAnnouncement: false, // Temporarily disabled
      announcement: '' // Temporarily disabled
    };
  }, []);

  useEffect(() => {
    // Load settings
    Meteor.subscribe('setting', {
      onReady() {
        const setting = ReactiveCache.getCurrentSetting();
        setCurrentSetting(setting);
        
        // Handle logo display logic
        const headerElement = document.getElementById("headerIsSettingDatabaseCallDone");
        if (headerElement) {
          if (setting?.customLoginLogoImageUrl !== undefined) {
            headerElement.style.display = 'none';
          } else {
            headerElement.style.display = 'block';
          }
        }
      },
    });

    // Check localStorage for drag handles setting
    const dragHandles = window.localStorage.getItem('showDesktopDragHandles');
    setShowDesktopDragHandles(!!dragHandles);
  }, []);

  const handleCreateBoard = () => {
    // TODO: Implement create board popup
    console.log('Create board clicked');
  };

  const handleToggleDesktopDragHandles = () => {
    if (window.localStorage.getItem('showDesktopDragHandles')) {
      window.localStorage.removeItem('showDesktopDragHandles');
      setShowDesktopDragHandles(false);
      location.reload();
    } else {
      window.localStorage.setItem('showDesktopDragHandles', 'true');
      setShowDesktopDragHandles(true);
      location.reload();
    }
  };

  const handleSelectList = (listId) => {
    Session.set('currentList', listId);
    Session.set('currentCard', null);
  };

  const handleCloseAnnouncement = () => {
    const announcementEl = document.querySelector('.announcement');
    if (announcementEl) {
      announcementEl.style.display = 'none';
    }
  };

  const handleReconnect = (e) => {
    e.preventDefault();
    Meteor.reconnect();
  };

  if (!currentUser) {
    return (
      <div id="header" className="not-connected">
        <div id="header-main-bar">
          <h1>
            <a href="/" className="wekan-logo">
              <img src="/logo-header.png" alt={t('productName')} title={t('productName')} />
            </a>
          </h1>
          <div className="board-header-btns right">
            <a href="/signin" className="board-header-btn">
              <i className="fa fa-sign-in"></i>
              <span>{t('signin')}</span>
            </a>
            <a href="/signup" className="board-header-btn">
              <i className="fa fa-user-plus"></i>
              <span>{t('signup')}</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Quick Access Bar */}
      <div id="header-quick-access" className={currentBoard?.colorClass}>
        {isMiniScreen ? (
          <>
            <span>
              <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                <span className="fa fa-home"></span>
              </a>
            </span>
            <ul className="header-quick-access-list">
              {currentList ? (
                currentBoard?.lists?.map((list) => (
                  <li key={list._id} className={Session.equals('currentList', list._id) ? 'current' : ''}>
                    <a className="js-select-list" onClick={() => handleSelectList(list._id)}>
                      {list.title}
                    </a>
                  </li>
                ))
              ) : (
                currentUser?.starredBoards?.map((board) => (
                  <li key={board._id} className={Session.equals('currentBoard', board._id) ? 'current' : ''}>
                    <a href={`/board/${board._id}/${board.slug}`}>
                      {board.title}
                    </a>
                  </li>
                ))
              )}
            </ul>
            <a 
              className="js-toggle-desktop-drag-handles" 
              title={t('show-desktop-drag-handles')} 
              alt={t('show-desktop-drag-handles')}
              onClick={handleToggleDesktopDragHandles}
            >
              <i className="fa fa-arrows"></i>
              {showDesktopDragHandles ? (
                <i className="fa fa-check-square-o"></i>
              ) : (
                <i className="fa fa-ban"></i>
              )}
            </a>
            <div id="header-new-board-icon"></div>
          </>
        ) : (
          <>
            {/* 
              On sandstorm, the logo shouldn't be clickable, because we only have one
              page/document on it, and we don't want to see the home page containing
              the list of all boards.
            */}
            {!currentSetting?.hideLogo && (
              currentSetting?.customTopLeftCornerLogoImageUrl ? (
                currentSetting.customTopLeftCornerLogoLinkUrl ? (
                  <a href={currentSetting.customTopLeftCornerLogoLinkUrl} alt={t('productName')} title={t('productName')}>
                    <img 
                      src={currentSetting.customTopLeftCornerLogoImageUrl} 
                      height={currentSetting.customTopLeftCornerLogoHeight || 27} 
                      width="auto" 
                      style={{ margin: 0, padding: 0 }}
                      alt={t('productName')}
                    />
                  </a>
                ) : (
                  <img 
                    src={currentSetting.customTopLeftCornerLogoImageUrl} 
                    height={currentSetting.customTopLeftCornerLogoHeight || 27} 
                    width="auto" 
                    style={{ margin: 0, padding: 0 }} 
                    alt={t('productName')} 
                    title={t('productName')}
                  />
                )
              ) : (
                <div id="headerIsSettingDatabaseCallDone">
                  <img src="/logo-header.png" alt={t('productName')} title={t('productName')} />
                </div>
              )
            )}
            <span className="allBoards">
              <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                <span className="fa fa-home"></span>
                {t('all-boards')}
              </a>
            </span>
            <ul className="header-quick-access-list">
              {/* Commented out public boards link - uncomment if needed */}
              {/* <li>
                <a href="/public">
                  <span className="fa fa-globe"></span>
                  {t('public')}
                </a>
              </li> */}
              {currentUser?.starredBoards?.map((board) => (
                <li key={board._id} className={Session.equals('currentBoard', board._id) ? 'current' : ''}>
                  <a href={`/board/${board._id}/${board.slug}`}>
                    {board.title}
                  </a>
                </li>
              ))}
              {(!currentUser?.starredBoards || currentUser.starredBoards.length === 0) && (
                <li className="current empty">{t('quick-access-description')}</li>
              )}
            </ul>
            <a 
              className="js-toggle-desktop-drag-handles" 
              title={t('show-desktop-drag-handles')} 
              alt={t('show-desktop-drag-handles')}
              onClick={handleToggleDesktopDragHandles}
            >
              <i className="fa fa-arrows"></i>
              {showDesktopDragHandles ? (
                <i className="fa fa-check-square-o"></i>
              ) : (
                <i className="fa fa-ban"></i>
              )}
            </a>
            <div id="header-new-board-icon"></div>
          </>
        )}

        {/* Next line is used only for spacing at header,
            there is no visible clickable icon. */}
        <div id="header-new-board-icon"></div>
        
        {/* Hide duplicate create board button,
            because it did not show board templates correctly. */}
        {/* <a id="header-new-board-icon js-create-board">
          <i className="fa fa-plus" title="Create a new board"></i>
        </a> */}

        {/* Notifications component would go here */}
        {/* <Notifications /> */}

        {currentSetting?.customHelpLinkUrl && (
          <div id="header-help">
            <a 
              href={currentSetting.customHelpLinkUrl} 
              title={t('help')} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <span className="fa fa-question"></span>
            </a>
          </div>
        )}

        {/* HeaderUserBar component would go here */}
        {/* <HeaderUserBar /> */}
      </div>

              {/* Main Header */}
        <div id="header" className={currentBoard?.colorClass}>
          {/* 
            The main bar is a colorful bar that provide all the meta-data for the
            current page. This bar is contextual based.
            If the user is not connected we display "sign in" and "log in" buttons.
          */}
          <div id="header-main-bar" className={!currentBoard ? 'wrapper' : ''}>
            {/* Page Title */}
            {!currentBoard && (
              <div className="page-title">
                <h1>All Boards</h1>
              </div>
            )}
          </div>
        </div>

      {/* Offline Warning */}
      {appIsOffline && (
        <div className="offline-warning">
          <a href="#" className="app-try-reconnect" onClick={handleReconnect}>
            {t('try-reconnect')}
          </a>
        </div>
      )}

      {/* Announcement */}
      {currentUser?.isBoardMember && hasAnnouncement && (
        <div className="announcement">
          <div className="announcement-content">
            {announcement}
          </div>
          <a className="js-close-announcement" onClick={handleCloseAnnouncement}>
            <i className="fa fa-times"></i>
          </a>
        </div>
      )}
    </>
  );
};

export default Header;
