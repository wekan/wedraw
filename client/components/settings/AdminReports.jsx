import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { ReactiveCache } from '/imports/reactiveCache';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * AdminReports Component
 * 
 * Replaces the original Blaze adminReports component with a React component.
 * This component provides comprehensive administrative reporting for WeKan.
 * 
 * Original Blaze component had:
 * - adminReports: Main admin reports component
 * - brokenCardsReport: Broken cards report
 * - rulesReport: Rules report
 * - filesReport: Files report
 * - cardsReport: Cards report
 * - boardsReport: Boards report
 */
const AdminReports = ({ onClose, onUpdate }) => {
  const [currentReport, setCurrentReport] = useState('report-broken');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentUser, isAdmin } = useTracker(() => {
    const user = ReactiveCache.getCurrentUser();
    if (!user) return { 
      currentUser: null, 
      isAdmin: false
    };

    const adminStatus = user.isAdmin();

    return {
      currentUser: user,
      isAdmin: adminStatus,
    };
  }, []);

  // Handle report selection
  const handleReportSelect = useCallback((reportId) => {
    setCurrentReport(reportId);
  }, []);

  if (!currentUser || !isAdmin) {
    return (
      <div className="admin-reports error">
        <div className="error-message">
          <i className="fa fa-exclamation-triangle"></i>
          {t('error-notAuthorized')}
        </div>
      </div>
    );
  }

  return (
    <div className="setting-content admin-reports-content js-admin-reports">
      <div className="content-title">
        <span>
          <i className="fa fa-chart-bar"></i>
          {t('admin-reports')}
        </span>
        
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
            <li className={currentReport === 'report-broken' ? 'active' : ''}>
              <a 
                className="js-report-broken"
                data-id="report-broken"
                onClick={() => handleReportSelect('report-broken')}
              >
                <i className="fa fa-chain-broken"></i>
                {t('broken-cards')}
              </a>
            </li>
            
            <li className={currentReport === 'report-files' ? 'active' : ''}>
              <a 
                className="js-report-files"
                data-id="report-files"
                onClick={() => handleReportSelect('report-files')}
              >
                <i className="fa fa-paperclip"></i>
                {t('filesReportTitle')}
              </a>
            </li>
            
            <li className={currentReport === 'report-rules' ? 'active' : ''}>
              <a 
                className="js-report-rules"
                data-id="report-rules"
                onClick={() => handleReportSelect('report-rules')}
              >
                <i className="fa fa-magic"></i>
                {t('rulesReportTitle')}
              </a>
            </li>
            
            <li className={currentReport === 'report-boards' ? 'active' : ''}>
              <a 
                className="js-report-boards"
                data-id="report-boards"
                onClick={() => handleReportSelect('report-boards')}
              >
                <i className="fa fa-columns"></i>
                {t('boardsReportTitle')}
              </a>
            </li>
            
            <li className={currentReport === 'report-cards' ? 'active' : ''}>
              <a 
                className="js-report-cards"
                data-id="report-cards"
                onClick={() => handleReportSelect('report-cards')}
              >
                <i className="fa fa-credit-card"></i>
                {t('cardsReportTitle')}
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
              {currentReport === 'report-broken' && (
                <BrokenCardsReport onUpdate={onUpdate} />
              )}
              
              {currentReport === 'report-files' && (
                <FilesReport onUpdate={onUpdate} />
              )}
              
              {currentReport === 'report-rules' && (
                <RulesReport onUpdate={onUpdate} />
              )}
              
              {currentReport === 'report-boards' && (
                <BoardsReport onUpdate={onUpdate} />
              )}
              
              {currentReport === 'report-cards' && (
                <CardsReport onUpdate={onUpdate} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * BrokenCardsReport Component
 * 
 * Displays broken cards report
 */
const BrokenCardsReport = ({ onUpdate }) => {
  const t = (key) => enTranslations[key] || key;
  const [results, setResults] = useState([]);
  const [resultsCount, setResultsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBrokenCards = async () => {
      try {
        setIsLoading(true);
        // TODO: Implement broken cards fetching
        // const result = await Meteor.call('getBrokenCards');
        // setResults(result.cards || []);
        // setResultsCount(result.count || 0);
        setResults([]);
        setResultsCount(0);
      } catch (err) {
        console.error('Error fetching broken cards:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrokenCards();
  }, []);

  if (isLoading) {
    return (
      <div className="broken-cards-report loading">
        <div className="loading-spinner">
          <i className="fa fa-spinner fa-spin"></i>
          {t('loading-broken-cards')}
        </div>
      </div>
    );
  }

  return (
    <div className="global-search-results-list-wrapper js-broken-cards-report">
      <h1>{t('broken-cards')}</h1>
      
      {resultsCount > 0 ? (
        <div className="results-paged">
          {/* TODO: Implement results paging component */}
          <p>{t('results-count')}: {resultsCount}</p>
        </div>
      ) : (
        <div className="no-results">
          {t('no-results')}
        </div>
      )}
    </div>
  );
};

/**
 * RulesReport Component
 * 
 * Displays rules report
 */
const RulesReport = ({ onUpdate }) => {
  const t = (key) => enTranslations[key] || key;
  const [results, setResults] = useState([]);
  const [resultsCount, setResultsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRulesReport = async () => {
      try {
        setIsLoading(true);
        // TODO: Implement rules report fetching
        // const result = await Meteor.call('getRulesReport');
        // setResults(result.rules || []);
        // setResultsCount(result.count || 0);
        setResults([]);
        setResultsCount(0);
      } catch (err) {
        console.error('Error fetching rules report:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRulesReport();
  }, []);

  if (isLoading) {
    return (
      <div className="rules-report loading">
        <div className="loading-spinner">
          <i className="fa fa-spinner fa-spin"></i>
          {t('loading-rules-report')}
        </div>
      </div>
    );
  }

  return (
    <div className="rules-report js-rules-report">
      <h1>{t('rulesReportTitle')}</h1>
      
      {resultsCount > 0 ? (
        <table className="rules-table">
          <thead>
            <tr>
              <th>{t('rule-title')}</th>
              <th>{t('board-title')}</th>
              <th>{t('action-type')}</th>
              <th>{t('activity-type')}</th>
            </tr>
          </thead>
          <tbody>
            {results.map(rule => (
              <tr key={rule._id}>
                <td>{rule.title}</td>
                <td>{rule.boardTitle}</td>
                <td>{rule.action?.actionType}</td>
                <td>{rule.trigger?.activityType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-results">
          {t('no-results')}
        </div>
      )}
    </div>
  );
};

/**
 * FilesReport Component
 * 
 * Displays files report
 */
const FilesReport = ({ onUpdate }) => {
  const t = (key) => enTranslations[key] || key;
  const [results, setResults] = useState([]);
  const [resultsCount, setResultsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFilesReport = async () => {
      try {
        setIsLoading(true);
        // TODO: Implement files report fetching
        // const result = await Meteor.call('getFilesReport');
        // setResults(result.files || []);
        // setResultsCount(result.count || 0);
        setResults([]);
        setResultsCount(0);
      } catch (err) {
        console.error('Error fetching files report:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilesReport();
  }, []);

  const formatFileSize = (size) => {
    if (!size) return '0 kB';
    return `${Math.round(size / 1024)} kB`;
  };

  if (isLoading) {
    return (
      <div className="files-report loading">
        <div className="loading-spinner">
          <i className="fa fa-spinner fa-spin"></i>
          {t('loading-files-report')}
        </div>
      </div>
    );
  }

  return (
    <div className="files-report js-files-report">
      <h1>{t('filesReportTitle')}</h1>
      
      {resultsCount > 0 ? (
        <table className="files-table">
          <thead>
            <tr>
              <th>{t('filename')}</th>
              <th className="right">{t('size-kb')}</th>
              <th>{t('mime-type')}</th>
              <th>{t('attachment-id')}</th>
              <th>{t('board-id')}</th>
              <th>{t('card-id')}</th>
            </tr>
          </thead>
          <tbody>
            {results.map(file => (
              <tr key={file._id}>
                <td>{file.name}</td>
                <td className="right">{formatFileSize(file.size)}</td>
                <td>{file.type}</td>
                <td>{file._id}</td>
                <td>{file.meta?.boardId}</td>
                <td>{file.meta?.cardId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-results">
          {t('no-results')}
        </div>
      )}
    </div>
  );
};

/**
 * CardsReport Component
 * 
 * Displays cards report
 */
const CardsReport = ({ onUpdate }) => {
  const t = (key) => enTranslations[key] || key;
  const [results, setResults] = useState([]);
  const [resultsCount, setResultsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCardsReport = async () => {
      try {
        setIsLoading(true);
        // TODO: Implement cards report fetching
        // const result = await Meteor.call('getCardsReport');
        // setResults(result.cards || []);
        // setResultsCount(result.count || 0);
        setResults([]);
        setResultsCount(0);
      } catch (err) {
        console.error('Error fetching cards report:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCardsReport();
  }, []);

  const abbreviate = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const userNames = (users) => {
    if (!users || users.length === 0) return '-';
    return users.map(user => user.username || user.profile?.fullname || user._id).join(', ');
  };

  if (isLoading) {
    return (
      <div className="cards-report loading">
        <div className="loading-spinner">
          <i className="fa fa-spinner fa-spin"></i>
          {t('loading-cards-report')}
        </div>
      </div>
    );
  }

  return (
    <div className="cards-report js-cards-report">
      <h1>{t('cardsReportTitle')}</h1>
      
      {resultsCount > 0 ? (
        <table className="table cards-table">
          <thead>
            <tr>
              <th>{t('card-title')}</th>
              <th>{t('board')}</th>
              <th>{t('swimlane')}</th>
              <th>{t('list')}</th>
              <th>{t('members')}</th>
              <th>{t('assignees')}</th>
            </tr>
          </thead>
          <tbody>
            {results.map(card => (
              <tr key={card._id}>
                <td>{abbreviate(card.title)}</td>
                <td>{abbreviate(card.board?.title)}</td>
                <td>{abbreviate(card.swimlane?.title)}</td>
                <td>{abbreviate(card.list?.title)}</td>
                <td>{userNames(card.members)}</td>
                <td>{userNames(card.assignees)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-results">
          {t('no-results')}
        </div>
      )}
    </div>
  );
};

/**
 * BoardsReport Component
 * 
 * Displays boards report
 */
const BoardsReport = ({ onUpdate }) => {
  const t = (key) => enTranslations[key] || key;
  const [results, setResults] = useState([]);
  const [resultsCount, setResultsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBoardsReport = async () => {
      try {
        setIsLoading(true);
        // TODO: Implement boards report fetching
        // const result = await Meteor.call('getBoardsReport');
        // setResults(result.boards || []);
        // setResultsCount(result.count || 0);
        setResults([]);
        setResultsCount(0);
      } catch (err) {
        console.error('Error fetching boards report:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoardsReport();
  }, []);

  const abbreviate = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const yesOrNo = (value) => {
    return value ? t('yes') : t('no');
  };

  const userNames = (users) => {
    if (!users || users.length === 0) return '-';
    return users.map(user => user.username || user.profile?.fullname || user._id).join(', ');
  };

  const orgs = (organizations) => {
    if (!organizations || organizations.length === 0) return '-';
    return organizations.map(org => org.orgDisplayName || org._id).join(', ');
  };

  const teams = (teams) => {
    if (!teams || teams.length === 0) return '-';
    return teams.map(team => team.teamDisplayName || team._id).join(', ');
  };

  if (isLoading) {
    return (
      <div className="boards-report loading">
        <div className="loading-spinner">
          <i className="fa fa-spinner fa-spin"></i>
          {t('loading-boards-report')}
        </div>
      </div>
    );
  }

  return (
    <div className="boards-report js-boards-report">
      <h1>{t('boardsReportTitle')}</h1>
      
      {resultsCount > 0 ? (
        <table className="table boards-table">
          <thead>
            <tr>
              <th>{t('title')}</th>
              <th>{t('id')}</th>
              <th>{t('permission')}</th>
              <th>{t('archived')}</th>
              <th>{t('members')}</th>
              <th>{t('organizations')}</th>
              <th>{t('teams')}</th>
            </tr>
          </thead>
          <tbody>
            {results.map(board => (
              <tr key={board._id}>
                <td>{abbreviate(board.title)}</td>
                <td>{abbreviate(board._id)}</td>
                <td>{board.permission}</td>
                <td>{yesOrNo(board.archived)}</td>
                <td>{userNames(board.members)}</td>
                <td>{orgs(board.orgs)}</td>
                <td>{teams(board.teams)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-results">
          {t('no-results')}
        </div>
      )}
    </div>
  );
};

export default AdminReports;
