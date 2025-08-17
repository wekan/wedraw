import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import SwimlaneHeader from './SwimlaneHeader';
import List from '../lists/List';
import AddListForm from './AddListForm';
import CardDetails from '../cards/CardDetails';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

const Swimlane = ({ 
  swimlane, 
  lists = [], 
  currentList, 
  currentCard,
  collapseSwimlane = false,
  swimlaneHeight = 'auto',
  isMini = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState(collapseSwimlane);

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const {
    currentUser,
    isMiniScreen,
    currentBoard
  } = useTracker(() => {
    return {
      currentUser: Meteor.user(),
      isMiniScreen: Utils?.isMiniScreen ? Utils.isMiniScreen() : false,
      currentBoard: Session.get('currentBoard')
    };
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isCurrentListInThisSwimlane = (swimlaneId) => {
    return currentList && currentList.swimlaneId === swimlaneId;
  };

  const isCurrentCardInThisList = (listId, swimlaneId) => {
    return currentCard && currentCard.listId === listId && currentCard.swimlaneId === swimlaneId;
  };

  const isVisible = (list) => {
    // This would need to be implemented based on list visibility logic
    return true;
  };

  if (isMini) {
    return (
      <div className="swimlane list-group js-lists dragscroll">
        {isMiniScreen ? (
          <>
            {currentList && isCurrentListInThisSwimlane(swimlane._id) ? (
              <List list={currentList} />
            ) : (
              <>
                {currentUser?.isBoardMember && !currentUser?.isCommentOnly && (
                  <AddListForm />
                )}
                {lists.map((list) => (
                  <List key={list._id} list={list} isMini={true} />
                ))}
              </>
            )}
          </>
        ) : (
          <>
            {currentUser?.isBoardMember && !currentUser?.isCommentOnly && (
              <AddListForm />
            )}
            {lists.map((list) => (
              <React.Fragment key={list._id}>
                {isVisible(list) && <List list={list} />}
                {isCurrentCardInThisList(list._id, null) && (
                  <CardDetails card={currentCard} />
                )}
              </React.Fragment>
            ))}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="swimlane nodragscroll">
      <SwimlaneHeader 
        swimlane={swimlane} 
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      
      {!isCollapsed && (
        <div 
          className="swimlane js-lists js-swimlane dragscroll"
          id={`swimlane-${swimlane._id}`}
          style={{ height: swimlaneHeight }}
        >
          {isMiniScreen ? (
            <>
              {isCurrentListInThisSwimlane(swimlane._id) ? (
                <List list={currentList} />
              ) : (
                <>
                  {currentUser?.isBoardMember && !currentUser?.isCommentOnly && (
                    <AddListForm />
                  )}
                  {lists.map((list) => (
                    <List key={list._id} list={list} isMini={true} />
                  ))}
                </>
              )}
            </>
          ) : (
            <>
              {currentUser?.isBoardMember && !currentUser?.isCommentOnly && (
                <AddListForm />
              )}
              {lists.map((list) => (
                <React.Fragment key={list._id}>
                  {isVisible(list) && <List list={list} />}
                  {isCurrentCardInThisList(list._id, swimlane._id) && (
                    <CardDetails card={currentCard} />
                  )}
                </React.Fragment>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

// AddListForm Component
const AddListForm = ({ isMini = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [listName, setListName] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const {
    currentUser,
    currentBoard,
    isMiniScreen
  } = useTracker(() => {
    return {
      currentUser: Meteor.user(),
      currentBoard: Session.get('currentBoard'),
      isMiniScreen: Utils?.isMiniScreen ? Utils.isMiniScreen() : false
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (listName.trim()) {
      Meteor.call('addList', currentBoard._id, listName.trim(), selectedPosition);
      setListName('');
      setSelectedPosition('');
      setIsOpen(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setListName('');
    setSelectedPosition('');
  };

  if (currentUser?.isWorker || currentUser?.isCommentOnly) {
    return null;
  }

  if (isOpen) {
    return (
      <div className={`list list-composer js-list-composer ${isMiniScreen ? 'mini-list' : ''}`}>
        <div className="list-header-add">
          <form onSubmit={handleSubmit}>
            <input
              className="list-name-input full-line"
              type="text"
              placeholder={t('add-list')}
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              autoComplete="off"
              autoFocus
            />
            
            {currentBoard?.getLastList && (
              <div>
                {t('add-after-list')}
                <select
                  className="list-position-input full-line"
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                >
                  {currentBoard.lists?.map((list) => (
                    <option 
                      key={list._id} 
                      value={list._id}
                      selected={list.title === currentBoard.getLastList.title}
                    >
                      {list.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="edit-controls clearfix">
              <button type="submit" className="primary confirm">
                {t('save')}
              </button>
              <span className="fa fa-times-thin js-close-inlined-form" onClick={handleClose}></span>
              
              {!currentBoard?.isTemplatesBoard && !currentBoard?.isTemplateBoard && (
                <span className="quiet">
                  {t('or')}
                  <a className="js-list-template">{t('template')}</a>
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`list list-composer js-list-composer ${isMiniScreen ? 'mini-list' : ''}`}>
      <div className="list-header-add">
        <a 
          className="open-list-composer js-open-inlined-form" 
          title={t('add-list')}
          onClick={() => setIsOpen(true)}
        >
          <i className="fa fa-plus"></i>
        </a>
      </div>
    </div>
  );
};

export default Swimlane;
