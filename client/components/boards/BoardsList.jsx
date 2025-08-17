import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { useNavigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { ReactiveCache } from '/imports/reactiveCache';

// Import global collections
// import { Boards } from '/models/boards';
// import { Teams } from '/models/team';
// import { Organizations } from '/models/org';

// Import components
import './BoardsList.css';

// Import translations and i18n system
import { TAPi18n } from '/imports/i18n';

const BoardsList = () => {
  const navigate = useNavigate();
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedOrgs, setSelectedOrgs] = useState([]);
  const [filteredBoards, setFilteredBoards] = useState([]);
  const [isAddBoardOpen, setIsAddBoardOpen] = useState(false);
  const [newBoardData, setNewBoardData] = useState({
    title: '',
    description: '',
    color: '#0079BF'
  });
  const [isCreating, setIsCreating] = useState(false);

  // Helper function to get translations
  const t = (key) => {
    try {
      return TAPi18n && TAPi18n.__ ? TAPi18n.__(key) : key;
    } catch (error) {
      console.warn('Translation error:', error);
      return key;
    }
  };

  // Track reactive data
  const {
    currentUser,
    boards,
    teamsDatas,
    orgsDatas,
    userHasTeams,
    userHasOrgs,
    userHasOrgsOrTeams,
    currentSetting
  } = useTracker(() => {
    // Subscribe to necessary data
    // Meteor.subscribe('boards');
    // Meteor.subscribe('teams');
    // Meteor.subscribe('organizations');
    Meteor.subscribe('setting');

    return {
      currentUser: Meteor.user(),
      boards: [], // Temporarily empty
      teamsDatas: [], // Temporarily empty
      orgsDatas: [], // Temporarily empty
      userHasTeams: false, // Temporarily false
      userHasOrgs: false, // Temporarily false
      userHasOrgsOrTeams: false, // Temporarily false
      currentSetting: null // Temporarily disabled
    };
  }, []);

  useEffect(() => {
    // Apply filters when selections change
    applyFilters();
  }, [selectedTeams, selectedOrgs, boards]);

  const applyFilters = () => {
    let filtered = [...boards];

    if (selectedTeams.length > 0 && !selectedTeams.includes('-1')) {
      filtered = filtered.filter(board => 
        selectedTeams.includes(board.teamId)
      );
    }

    if (selectedOrgs.length > 0 && !selectedOrgs.includes('-1')) {
      filtered = filtered.filter(board => 
        selectedOrgs.includes(board.orgId)
      );
    }

    setFilteredBoards(filtered);
  };

  const handleTeamChange = (e) => {
    const values = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedTeams(values);
  };

  const handleOrgChange = (e) => {
    const values = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedOrgs(values);
  };

  const handleFilter = () => {
    applyFilters();
  };

  const handleReset = () => {
    setSelectedTeams([]);
    setSelectedOrgs([]);
    setFilteredBoards([...boards]);
  };

  const handleAddBoard = () => {
    setIsAddBoardOpen(true);
  };

  const handleCloseAddBoard = () => {
    setIsAddBoardOpen(false);
    setNewBoardData({ title: '', description: '', color: '#0079BF' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBoardData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    
    if (!newBoardData.title.trim()) {
      return;
    }

    setIsCreating(true);
    
    try {
      // Create the board using Meteor method
      const boardId = await new Promise((resolve, reject) => {
        Meteor.call('createBoard', {
          title: newBoardData.title.trim(),
          description: newBoardData.description.trim(),
          color: newBoardData.color
        }, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });

      // Close the popup and reset form
      handleCloseAddBoard();
      
      // Navigate to the new board
      if (boardId) {
        navigate(`/board/${boardId}/board`);
      }
    } catch (error) {
      console.error('Error creating board:', error);
      // You could add error handling here (show error message to user)
    } finally {
      setIsCreating(false);
    }
  };

  const handleStarBoard = (boardId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (Meteor.user()) {
      Meteor.call('starBoard', boardId);
    }
  };

  const handleAcceptInvite = (boardId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    Meteor.call('acceptBoardInvite', boardId);
  };

  const handleDeclineInvite = (boardId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    Meteor.call('declineBoardInvite', boardId);
  };

  const handleCloneBoard = (boardId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    Meteor.call('cloneBoard', boardId);
  };

  const handleArchiveBoard = (boardId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm(t('archive-board-confirm'))) {
      Meteor.call('archiveBoard', boardId);
    }
  };

  const handleBoardClick = (boardId, slug) => {
    navigate(`/board/${boardId}/${slug}`);
  };

  const renderBoardItem = (board) => {
    const isStarred = board.isStarred;
    const isInvited = board.isInvited;
    const isTemplateContainer = board.type === 'template-container';
    const isAdministrable = board.isAdministrable;
    const isSandstorm = Meteor.settings.public?.sandstorm;

    if (isInvited) {
      return (
        <li key={board._id} className={`${board._id} js-board`}>
          <div className="board-list-item">
            <span className="details">
              <span className="board-list-item-name">{board.title}</span>
              <i 
                className={`fa js-star-board fa-star${isStarred ? ' is-star-active' : '-o'}`}
                title={t('star-board-title')}
                onClick={(e) => handleStarBoard(board._id, e)}
              ></i>
              <p className="board-list-item-desc">{t('just-invited')}</p>
              <button 
                className="js-accept-invite primary"
                onClick={(e) => handleAcceptInvite(board._id, e)}
              >
                {t('accept')}
              </button>
              <button 
                className="js-decline-invite"
                onClick={(e) => handleDeclineInvite(board._id, e)}
              >
                {t('decline')}
              </button>
            </span>
          </div>
        </li>
      );
    }

    return (
      <li key={board._id} className={`${board._id} ${isStarred ? 'starred' : ''} ${board.colorClass} js-board`}>
        <a 
          className={`js-open-board board-list-item ${isTemplateContainer ? 'template-container' : ''}`}
          href={`/board/${board._id}/${board.slug}`}
          onClick={(e) => {
            e.preventDefault();
            handleBoardClick(board._id, board.slug);
          }}
        >
          <span className="details">
            <span 
              className="board-list-item-name" 
              title={isTemplateContainer ? t('template-container') : t('board-drag-drop-reorder-or-click-open')}
            >
              {board.title}
            </span>
            <i 
              className={`fa js-star-board fa-star${isStarred ? ' is-star-active' : '-o'}`}
              title={t('star-board-title')}
              onClick={(e) => handleStarBoard(board._id, e)}
            ></i>
            
            {board.description && (
              <p className="board-list-item-desc">{board.description}</p>
            )}

            {board.hasSpentTimeCards && (
              <i 
                className={`fa js-has-spenttime-cards fa-circle${board.hasOvertimeCards ? ' has-overtime-card-active' : ' no-overtime-card-active'}`}
                title={board.hasOvertimeCards ? t('has-overtime-cards') : t('has-spenttime-cards')}
              ></i>
            )}

            {/* Board actions */}
            {board.isTouchScreenOrShowDesktopDragHandles ? (
              <i 
                className="fa board-handle fa-arrows"
                title={t('drag-board')}
              ></i>
            ) : (
              <>
                {isSandstorm ? (
                  <>
                    <i 
                      className="fa js-clone-board fa-clone"
                      title={t('duplicate-board')}
                      onClick={(e) => handleCloneBoard(board._id, e)}
                    ></i>
                    <i 
                      className="fa js-archive-board fa-archive"
                      title={t('archive-board')}
                      onClick={(e) => handleArchiveBoard(board._id, e)}
                    ></i>
                  </>
                ) : isAdministrable || currentUser?.isAdmin ? (
                  <>
                    <i 
                      className="fa js-clone-board fa-clone"
                      title={t('duplicate-board')}
                      onClick={(e) => handleCloneBoard(board._id, e)}
                    ></i>
                    <i 
                      className="fa js-archive-board fa-archive"
                      title={t('archive-board')}
                      onClick={(e) => handleArchiveBoard(board._id, e)}
                    ></i>
                  </>
                ) : null}
              </>
            )}

            {/* Board members */}
            {board.allowsBoardMemberList && (
              <div className="minicard-members">
                {board.boardMembers?.map((member) => (
                  <div key={member._id} className="minicard-member">
                    {/* UserAvatar component would go here */}
                    <span className="user-avatar">{member.username}</span>
                  </div>
                ))}
              </div>
            )}
          </span>
        </a>
      </li>
    );
  };

  return (
    <div className="wrapper">
      {/* Filters */}
      <ul className="AllBoardTeamsOrgs">
        {userHasTeams && (
          <li className="AllBoardTeams">
            <select 
              className="js-AllBoardTeams" 
              id="jsAllBoardTeams" 
              multiple
              value={selectedTeams}
              onChange={handleTeamChange}
            >
              <option value="-1">{t('teams')} :</option>
              {teamsDatas.map((team) => (
                <option key={team._id} value={team.teamId}>
                  {t(team.teamDisplayName)}
                </option>
              ))}
            </select>
          </li>
        )}

        {userHasOrgs && (
          <li className="AllBoardOrgs">
            <select 
              className="js-AllBoardOrgs" 
              id="jsAllBoardOrgs" 
              multiple
              value={selectedOrgs}
              onChange={handleOrgChange}
            >
              <option value="-1">{t('organizations')} :</option>
              {orgsDatas.map((org) => (
                <option key={org._id} value={org.orgId}>
                  {org.orgDisplayName}
                </option>
              ))}
            </select>
          </li>
        )}

        <li className="AllBoardBtns">
          <div className="AllBoardButtonsContainer">
            {userHasOrgsOrTeams && (
              <>
                <i className="fa fa-filter"></i>
                <input 
                  id="filterBtn" 
                  type="button" 
                  value={t('filter')}
                  onClick={handleFilter}
                />
                <input 
                  id="resetBtn" 
                  type="button" 
                  value={t('filter-clear')}
                  onClick={handleReset}
                />
              </>
            )}
          </div>
        </li>
      </ul>

      {/* Boards List */}
      <ul className="board-list clearfix js-boards">
        <li className="js-add-board">
          <a 
            className="board-list-item label" 
            title={t('add-board')}
            onClick={handleAddBoard}
          >
            {t('add-board')}
          </a>
        </li>
        
        {filteredBoards.map(renderBoardItem)}
      </ul>

      {/* Add Board Modal - Temporarily simplified */}
      {isAddBoardOpen && (
        <div className="add-board-modal" style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          zIndex: 1000,
          minWidth: '400px'
        }}>
          <h3>Add New Board</h3>
          <form onSubmit={handleCreateBoard}>
            <div style={{ marginBottom: '15px' }}>
              <label>Title:</label>
              <input
                type="text"
                value={newBoardData.title}
                onChange={(e) => setNewBoardData(prev => ({ ...prev, title: e.target.value }))}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Description:</label>
              <textarea
                value={newBoardData.description}
                onChange={(e) => setNewBoardData(prev => ({ ...prev, description: e.target.value }))}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                rows="3"
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label>Color:</label>
              <input
                type="color"
                value={newBoardData.color}
                onChange={(e) => setNewBoardData(prev => ({ ...prev, color: e.target.value }))}
                style={{ marginLeft: '10px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleCloseAddBoard}
                style={{ padding: '8px 16px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                style={{ padding: '8px 16px', backgroundColor: '#0079BF', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                {isCreating ? 'Creating...' : 'Create Board'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BoardsList;
