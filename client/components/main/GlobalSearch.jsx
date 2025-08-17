import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import SpinnerComponent from './SpinnerComponent';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

const GlobalSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const {
    currentUser,
    searching,
    hasResults,
    results,
    resultsHeading,
    hasPreviousPage,
    hasNextPage,
    hasQueryErrors,
    errorMessages,
    serverError,
    myBoardNames,
    myLists,
    labelColors,
    myLabelNames,
    debug
  } = useTracker(() => {
    // Subscribe to necessary data
    Meteor.subscribe('globalSearch');

    return {
      currentUser: Meteor.user(),
      searching: Session.get('searching') || false,
      hasResults: Session.get('hasResults') || false,
      results: Session.get('results') || [],
      resultsHeading: Session.get('resultsHeading') || '',
      hasPreviousPage: Session.get('hasPreviousPage') || false,
      hasNextPage: Session.get('hasNextPage') || false,
      hasQueryErrors: Session.get('hasQueryErrors') || false,
      errorMessages: Session.get('errorMessages') || [],
      serverError: Session.get('serverError') || false,
      myBoardNames: Session.get('myBoardNames') || [],
      myLists: Session.get('myLists') || [],
      labelColors: Session.get('labelColors') || [],
      myLabelNames: Session.get('myLabelNames') || [],
      debug: Session.get('debug') || { show: false, showSelector: false, showProjection: false }
    };
  }, []);

  useEffect(() => {
    // Set initial query from session
    const query = Session.get('query');
    if (query) {
      setSearchQuery(query);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    Session.set('query', searchQuery);
    Session.set('currentPage', 1);
    // Trigger search
    Meteor.call('globalSearch', searchQuery, 1);
  };

  const handleNewSearch = () => {
    setSearchQuery('');
    Session.set('query', '');
    Session.set('results', []);
    Session.set('hasResults', false);
  };

  const handlePreviousPage = () => {
    const newPage = currentPage - 1;
    setCurrentPage(newPage);
    Session.set('currentPage', newPage);
    Meteor.call('globalSearch', searchQuery, newPage);
  };

  const handleNextPage = () => {
    const newPage = currentPage + 1;
    setCurrentPage(newPage);
    Session.set('currentPage', newPage);
    Meteor.call('globalSearch', searchQuery, newPage);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      // Show success message
      console.log(`${type} copied to clipboard`);
    });
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="global-search">
      {/* Header Bar */}
      <div className="global-search-header-bar">
        <h1>
          <i className="fa fa-search"></i>
          {t('globalSearch-title')}
        </h1>
      </div>

      <div className="wrapper">
        {/* Search Form */}
        <form className="global-search-page js-search-query-form" onSubmit={handleSearch}>
          <input
            className="global-search-query-input"
            style={{ display: hasResults ? 'inline-block' : 'none' }}
            id="global-search-input"
            type="text"
            name="searchQuery"
            placeholder={t('search-example')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            dir="auto"
          />
          <a className="js-new-search fa fa-eraser" onClick={handleNewSearch}></a>
        </form>

        {/* Debug Information */}
        {debug.show && (
          <div className="debug-section">
            <h1>Debug</h1>
            {debug.showSelector && (
              <div>
                <h2>Selector</h2>
                <button 
                  className="js-copy-debug-selector"
                  onClick={() => copyToClipboard(Session.get('sessionData')?.selector, 'Selector')}
                >
                  Copy
                </button>
                <pre id="debug-selector">
                  {Session.get('sessionData')?.selector}
                </pre>
              </div>
            )}
            {debug.showProjection && (
              <div>
                <h2>Projection</h2>
                <button 
                  className="js-copy-debug-projection"
                  onClick={() => copyToClipboard(Session.get('sessionData')?.projection, 'Projection')}
                >
                  Copy
                </button>
                <pre id="debug-projection">
                  {Session.get('sessionData')?.projection}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Loading Spinner */}
        {searching && <SpinnerComponent type="wave" />}

        {/* Search Results */}
        {!searching && hasResults && (
          <div className="global-search-results-list-wrapper">
            {hasQueryErrors && (
              <ul>
                {errorMessages.map((msg, index) => (
                  <li key={index} className="global-search-error-messages">
                    {msg}
                  </li>
                ))}
              </ul>
            )}
            
            {/* Results Paged */}
            <div className="results-paged">
              {resultsHeading && (
                <h1>
                  {resultsHeading}
                  <a 
                    className="fa fa-link" 
                    title={t('link-to-search')} 
                    href={Session.get('getSearchHref')}
                  ></a>
                </h1>
              )}
              
              {results.map((card) => (
                <ResultCard key={card._id} card={card} />
              ))}
              
              <table className="global-search-footer">
                <tbody>
                  <tr>
                    <td className="global-search-previous-page">
                      {hasPreviousPage && (
                        <button className="js-previous-page" onClick={handlePreviousPage}>
                          {t('previous-page')}
                        </button>
                      )}
                    </td>
                    <td className="global-search-next-page" style={{ textAlign: 'right' }}>
                      {hasNextPage && (
                        <button className="js-next-page" onClick={handleNextPage}>
                          {t('next-page')}
                        </button>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Server Error */}
        {!searching && serverError && (
          <div className="global-search-page">
            <div className="global-search-help">
              <h1>{t('server-error')}</h1>
              <div>{t('server-error-troubleshooting')}</div>
            </div>
          </div>
        )}

        {/* Help Section */}
        {!searching && !hasResults && !serverError && (
          <div className="global-search-page">
            <div className="global-search-help">
              <h2>{t('boards')}</h2>
              <div className="lists-wrapper">
                {myBoardNames.map((title, index) => (
                  <span key={index} className="card-label list-title js-board-title">
                    {title}
                  </span>
                ))}
              </div>
              
              <h2>{t('lists')}</h2>
              <div className="lists-wrapper">
                {myLists.map((title, index) => (
                  <span key={index} className="card-label list-title js-list-title">
                    {title}
                  </span>
                ))}
              </div>
              
              <h2>{t('label-colors')}</h2>
              <div className="palette-colors">
                {labelColors.map((label) => (
                  <span 
                    key={label._id} 
                    className={`card-label palette-color js-label-color card-label-${label.color}`}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
              
              {myLabelNames.length > 0 && (
                <>
                  <h2>{t('label-names')}</h2>
                  <div className="lists-wrapper">
                    {myLabelNames.map((name, index) => (
                      <span key={index} className="card-label list-title js-label-name">
                        {name}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Result Card Component
const ResultCard = ({ card }) => {
  return (
    <div className="result-card">
      <div className="result-card-title">
        <a href={card.originRelativeUrl}>
          {card.title}
        </a>
      </div>
      <div className="result-card-meta">
        <span className="result-card-board">{card.boardTitle}</span>
        <span className="result-card-list">{card.listTitle}</span>
      </div>
    </div>
  );
};

export default GlobalSearch;
