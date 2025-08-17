import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import SpinnerComponent from './SpinnerComponent';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * MyCards Component
 * 
 * Replaces the original Jade myCards template with a React component.
 * The original template had three main parts:
 * - myCardsHeaderBar: Header with view change button
 * - myCardsModalTitle: Modal title for my cards
 * - myCards: Main content with board and table views
 */
const MyCards = () => {
  const [myCardsView, setMyCardsView] = useState('boards');
  const [searching, setSearching] = useState(false);

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const {
    currentUser,
    myCardsList,
    isMiniScreen
  } = useTracker(() => {
    // Subscribe to necessary data
    Meteor.subscribe('myCards');

    return {
      currentUser: Meteor.user(),
      myCardsList: [], // This would come from a collection or method
      isMiniScreen: Utils?.isMiniScreen ? Utils.isMiniScreen() : false
    };
  }, []);

  const handleViewChange = () => {
    const newView = myCardsView === 'boards' ? 'table' : 'boards';
    setMyCardsView(newView);
    Session.set('myCardsView', newView);
  };

  if (!currentUser) {
    return null;
  }

  if (searching) {
    return <SpinnerComponent type="wave" />;
  }

  return (
    <div className="my-cards">
      {/* Header Bar - equivalent to myCardsHeaderBar template */}
      <div className="my-cards-header-bar">
        <h1>
          {/* Commented out back button - uncomment if needed */}
          {/* <a className="back-btn" href="/">
            <i className="fa fa-chevron-left"></i>
          </a> */}
          <i className="fa fa-list"></i>
          {t('my-cards')}
        </h1>

        <div className="board-header-btns left">
          <a 
            className="board-header-btn js-my-cards-view-change" 
            title={t('myCardsViewChange-title')}
            onClick={handleViewChange}
          >
            <i className="fa fa-caret-down"></i>
            {myCardsView === 'boards' ? (
              <>
                <i className="fa fa-trello"></i>
                {t('myCardsViewChange-choice-boards')}
              </>
            ) : (
              <>
                <i className="fa fa-table"></i>
                {t('myCardsViewChange-choice-table')}
              </>
            )}
          </a>
        </div>
      </div>

      {/* Content - equivalent to myCards template */}
      {myCardsView === 'boards' ? (
        <div className="wrapper">
          {myCardsList.map((board) => (
            <div key={board._id} className="my-cards-board-wrapper">
              <div className={`my-cards-board-title ${board.colorClass}`} id="header">
                <a href={board.originRelativeUrl}>
                  {board.title}
                </a>
              </div>
              {board.mySwimlanes?.map((swimlane) => (
                <div key={swimlane._id} className="my-cards-swimlane-wrapper">
                  <div className={`my-cards-swimlane-title ${swimlane.colorClass || 'swimlane-default-color'}`}>
                    {swimlane.title}
                  </div>
                  {swimlane.myLists?.map((list) => (
                    <div key={list._id} className="my-cards-list-wrapper">
                      <div className={`my-cards-list-title ${list.colorClass}`}>
                        {list.title}
                      </div>
                      {list.myCards?.map((card) => (
                        <div key={card._id} className="my-cards-card-wrapper">
                          <a className="minicard-wrapper" href={card.originRelativeUrl}>
                            {/* Minicard component would go here */}
                            <div className="minicard">
                              <div className="minicard-title">{card.title}</div>
                            </div>
                          </a>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="wrapper">
          <table className="my-cards-board-table">
            <thead>
              <tr>
                <th>{t('Card')}</th>
                <th>{t('List')}</th>
                <th>{t('Board')}</th>
                <th>{t('Swimlane')}</th>
                {!isMiniScreen && (
                  <>
                    <th>{t('Members')}</th>
                    <th>{t('Labels')}</th>
                    <th>{t('Due Date')}</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {myCardsList.map((board) =>
                board.mySwimlanes?.map((swimlane) =>
                  swimlane.myLists?.map((list) =>
                    list.myCards?.map((card) => (
                      <tr key={card._id}>
                        <td>
                          {!isMiniScreen && (
                            <div className={`my-cards-board-badge ${board.colorClass}`} id="header"></div>
                          )}
                          <div className="my-cards-card-title-table">
                            {card.title}
                            {/* Commented out minicard link - uncomment if needed */}
                            {/* <a className="minicard-wrapper" href={card.originRelativeUrl}>
                              {card.title}
                            </a> */}
                          </div>
                        </td>
                        <td>{list.title}</td>
                        <td>
                          {board.title}
                          {/* Commented out board link - uncomment if needed */}
                          {/* <a href={board.originRelativeUrl}>
                            {board.title}
                          </a> */}
                        </td>
                        <td>{swimlane.title}</td>
                        {!isMiniScreen && (
                          <>
                            <td>
                              <div>
                                {card.members?.map((member) => (
                                  <a key={member._id} className="name">
                                    {/* UserAvatar component would go here */}
                                    <span className="user-avatar">{member.username}</span>
                                  </a>
                                ))}
                              </div>
                            </td>
                            <td>
                              <div>
                                {card.labelIds?.map((labelId) => (
                                  <span 
                                    key={labelId} 
                                    className={`card-label card-label-${labelColor(board, labelId)}`} 
                                    title={labelName(board, labelId)}
                                  >
                                    {labelName(board, labelId)}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td>
                              {card.dueAt && (
                                <span>{moment(card.dueAt).format('LLL')}</span>
                              )}
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Helper functions (these would need to be implemented or imported)
const labelColor = (board, labelId) => {
  // Implementation for getting label color
  return 'default';
};

const labelName = (board, labelId) => {
  // Implementation for getting label name
  return 'Label';
};

export default MyCards;
