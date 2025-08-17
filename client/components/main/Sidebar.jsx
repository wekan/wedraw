import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { TAPi18n } from '/imports/i18n';
import './BoardsSidebar.css';

const Sidebar = ({ onBoardSelect, selectedBoardId }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAddingWorkspace, setIsAddingWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [expandedWorkspaces, setExpandedWorkspaces] = useState(new Set());
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(null);
  
  // Stable callback for setting workspace menu open
  const setWorkspaceMenuOpenStable = useCallback((value) => {
    setWorkspaceMenuOpen(value);
  }, []);
  
  
  const [newSubWorkspaceName, setNewSubWorkspaceName] = useState('');
  const [addingSubWorkspaceTo, setAddingSubWorkspaceTo] = useState(null);
  const [renamingWorkspace, setRenamingWorkspace] = useState(null);
  const [renameWorkspaceName, setRenameWorkspaceName] = useState('');
  

  const [showCopySuccess, setShowCopySuccess] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (workspaceMenuOpen && !event.target.closest('.workspace-menu-btn')) {
        setWorkspaceMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [workspaceMenuOpen]);

  // Track current user and their data
  const { currentUser, userWorkspaces, unassignedBoards } = useTracker(() => {
    const user = Meteor.user();
    if (!user) return { currentUser: null, userWorkspaces: [], unassignedBoards: [] };

    // Get user's workspaces from profile
    const workspaces = user.profile?.workspaces || [];
    
    // Temporarily use empty array for boards until Boards collection is fixed
    const userBoards = [];
    
    // Filter boards that are not assigned to any workspace
    const unassigned = userBoards.filter(board => 
      !workspaces.some(ws => ws.boards.includes(board._id))
    );

    return {
      currentUser: user,
      userWorkspaces: workspaces,
      unassignedBoards: unassigned
    };
  });

  // Use userWorkspaces directly instead of maintaining separate local state
  const localWorkspaces = userWorkspaces || [];

  // Helper function to get translations
  const t = (key) => {
    try {
      return TAPi18n && TAPi18n.__ ? TAPi18n.__(key) : key;
    } catch (error) {
      console.warn('Translation error:', error);
      return key;
    }
  };

  // Toggle sidebar collapse state
  const toggleSidebar = useCallback(() => {
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed]);

  // Add new workspace
  const addWorkspace = useCallback(async (workspaceName = null) => {
    const name = workspaceName || newWorkspaceName.trim();
    if (!name) return;

    try {
      const newWorkspaceId = await Meteor.call('users.addWorkspace', name);
      setNewWorkspaceName('');
      setIsAddingWorkspace(false);
      
      // Note: Workspace will be automatically added to userWorkspaces via useTracker
      // No need to manually update local state
    } catch (error) {
      console.error('Error adding workspace:', error);
    }
  }, []);

  // Add sub-workspace
  const addSubWorkspace = useCallback(async (parentWorkspaceId, name) => {
    if (!name.trim()) return;

    try {
      const newSubWorkspaceId = await Meteor.call('users.addSubWorkspace', parentWorkspaceId, name.trim());
      setNewSubWorkspaceName('');
      setAddingSubWorkspaceTo(null);
      
      // Note: Sub-workspace will be automatically added to userWorkspaces via useTracker
      // No need to manually update local state
    } catch (error) {
      console.error('Error adding sub-workspace:', error);
    }
  }, []);

  // Rename workspace
  const renameWorkspace = useCallback(async (workspaceId, newName) => {
    if (!newName.trim()) return;

    try {
      await Meteor.call('users.renameWorkspace', workspaceId, newName.trim());
      
      setRenameWorkspaceName('');
      setRenamingWorkspace(null);
      setWorkspaceMenuOpen(null);
      
      // Note: Workspace name will be automatically updated in userWorkspaces via useTracker
      // No need to manually update local state
    } catch (error) {
      console.error('Error renaming workspace:', error);
    }
  }, []);

  // Toggle workspace expansion
  const toggleWorkspaceExpansion = useCallback((workspaceId) => {
    setExpandedWorkspaces(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workspaceId)) {
        newSet.delete(workspaceId);
      } else {
        newSet.add(workspaceId);
      }
      return newSet;
    });
  }, []);

  // Handle workspace menu operations
  const handleWorkspaceAction = useCallback(async (workspaceId, action) => {
    try {
      switch (action) {
        case 'rename':
          const workspaceToRename = localWorkspaces.find(ws => ws.id === workspaceId);
          setRenamingWorkspace(workspaceId);
          setRenameWorkspaceName(workspaceToRename?.name || '');
          break;
        case 'copy-link':
          const workspace = localWorkspaces.find(ws => ws.id === workspaceId);
          if (workspace) {
            const link = `${window.location.origin}/workspace/${workspaceId}`;
            navigator.clipboard.writeText(link).then(() => {
              // Show a temporary success message
              setShowCopySuccess(true);
              setTimeout(() => setShowCopySuccess(false), 2000);
          
            }).catch(err => {
              console.error('Failed to copy link:', err);
            });
          }
          break;
        case 'create-folder':
          setAddingSubWorkspaceTo(workspaceId);
          break;
        case 'color':
          // For now, just log - color functionality can be implemented later
      
          // TODO: Implement color picker for workspace colors
          break;
        case 'duplicate':
          const workspaceToDuplicate = localWorkspaces.find(ws => ws.id === workspaceId);
          if (workspaceToDuplicate) {
            const newName = `${workspaceToDuplicate.name} (Copy)`;
            // Add the duplicated workspace
            addWorkspace(newName);
          }
          break;
        case 'archive':
          // For now, just log - archive functionality can be implemented later
      
          // TODO: Implement archive functionality - move to archived workspaces
          break;
        case 'delete':
          if (confirm(`Are you sure you want to delete the workspace "${localWorkspaces.find(ws => ws.id === workspaceId)?.name}"?`)) {
            try {
              await Meteor.call('users.deleteWorkspace', workspaceId);
              // Note: Workspace will be automatically removed from userWorkspaces via useTracker
              // No need to manually update local state
            } catch (error) {
              console.error('Error deleting workspace:', error);
            }
          }
          break;
        default:
          break;
      }
      setWorkspaceMenuOpen(null);
    } catch (error) {
      console.error('Error handling workspace action:', error);
    }
  }, [localWorkspaces, addWorkspace]);

  // Handle drag start for boards
  const handleDragStart = useCallback((e, boardId) => {
    e.dataTransfer.setData('boardId', boardId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);



  // Handle drop on workspace
  const handleDrop = useCallback(async (e, targetWorkspaceId) => {
    e.preventDefault();
    const boardId = e.dataTransfer.getData('boardId');
    const workspaceId = e.dataTransfer.getData('workspaceId');
    
    if (boardId) {
      // Moving a board to a workspace
      try {
        await Meteor.call('users.moveBoardToWorkspace', boardId, targetWorkspaceId);
      } catch (error) {
        console.error('Error moving board to workspace:', error);
      }
    } else if (workspaceId) {
      // Workspace reordering is disabled - no drop zones for reordering
  
    }
    
    // Reset dragged state
    setDraggedWorkspaceId(null);
  }, []);



  // Handle drag over for drop zones
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  // Remove board from workspace (move back to unassigned)
  const removeBoardFromWorkspace = useCallback(async (boardId, workspaceId) => {
    try {
      await Meteor.call('users.removeBoardFromWorkspace', boardId, workspaceId);
    } catch (error) {
      console.error('Error removing board from workspace:', error);
    }
  }, []);

  if (!currentUser) return null;

  // Sidebar container styles
  const sidebarStyle = {
    width: isCollapsed ? '60px' : '280px',
    backgroundColor: '#f8f9fa',
    borderRight: '1px solid #e9ecef',
    position: 'relative',
    height: '100%',
    zIndex: 1
  };

  return (
    <div 
      style={sidebarStyle}
      className={`boards-sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}
    >
      {/* Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="sidebar-toggle"
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {isCollapsed ? '→' : '←'}
      </button>

      {/* Copy Success Message */}
      {showCopySuccess && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          zIndex: 10001,
          fontSize: '14px'
        }}>
          Link copied to clipboard! ✨
        </div>
      )}

      {/* Sidebar Content */}
      <div className="sidebar-content">
        {/* Boards Section */}
        <div style={{ marginBottom: '30px' }}>
          <div className="sidebar-section-header">
            <span>{t('boards')}</span>
            <span className="sidebar-section-count">
              {unassignedBoards.length}
            </span>
          </div>
          
          {/* Unassigned Boards */}
          {unassignedBoards.map(board => (
            <div
              key={board._id}
              className={`sidebar-board-item ${selectedBoardId === board._id ? 'selected' : ''}`}
              onClick={() => onBoardSelect(board._id)}
              draggable
              onDragStart={(e) => handleDragStart(e, board._id)}
              onDragEnd={handleDragEnd}
              title={board.title}
            >
              <span className="sidebar-board-icon">📋</span>
              {!isCollapsed && (
                <span className="sidebar-board-title">
                  {board.title}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Workspaces Section */}
        <div style={{ marginBottom: '30px' }}>
          <div className="sidebar-section-header">
            <span>{t('workspaces')}</span>
            {!isCollapsed && (
              <button
                onClick={() => setIsAddingWorkspace(true)}
                className="sidebar-add-workspace-btn-add"
                title={t('add-workspace')}
              >
                +
              </button>
            )}
          </div>

          {/* Add Workspace Form */}
          {isAddingWorkspace && (
            <div className="sidebar-add-workspace-form">
              <input
                type="text"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder={t('workspace-name')}
                className="sidebar-add-workspace-input"
                onKeyPress={(e) => e.key === 'Enter' && addWorkspace()}
                autoFocus
              />
              <div className="sidebar-add-workspace-buttons">
                <button
                  onClick={addWorkspace}
                  className="sidebar-add-workspace-btn"
                >
                  {t('add')}
                </button>
                <button
                  onClick={() => {
                    setIsAddingWorkspace(false);
                    setNewWorkspaceName('');
                  }}
                  className="sidebar-add-workspace-btn cancel"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Workspace List */}
          {localWorkspaces.map((workspace, index) => (
            <WorkspaceItem 
              key={workspace.id}
              workspace={workspace}
              level={0}
              isCollapsed={isCollapsed}
              expandedWorkspaces={expandedWorkspaces}
              onToggleExpansion={toggleWorkspaceExpansion}
              onWorkspaceAction={handleWorkspaceAction}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              workspaceMenuOpen={workspaceMenuOpen}
              setWorkspaceMenuOpen={setWorkspaceMenuOpenStable}
              addingSubWorkspaceTo={addingSubWorkspaceTo}
              setAddingSubWorkspaceTo={setAddingSubWorkspaceTo}
              newSubWorkspaceName={newSubWorkspaceName}
              setNewSubWorkspaceName={setNewSubWorkspaceName}
              addSubWorkspace={addSubWorkspace}
              t={t}
              onBoardSelect={onBoardSelect}
              selectedBoardId={selectedBoardId}
              removeBoardFromWorkspace={removeBoardFromWorkspace}
              renamingWorkspace={renamingWorkspace}
              setRenamingWorkspace={setRenamingWorkspace}
              renameWorkspaceName={renameWorkspaceName}
              setRenameWorkspaceName={setRenameWorkspaceName}
              renameWorkspace={renameWorkspace}
            />
          ))}

          {/* Shared Templates Section - Now below Workspaces */}
          <div style={{ marginTop: '7.5px', marginBottom: '30px' }}>
            <div className="sidebar-section-header">
              <span></span>
            </div>
            <div className="sidebar-workspace-item">
              {!isCollapsed && 'Shared Templates'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Recursive WorkspaceItem component for tree structure
const WorkspaceItem = ({ 
  workspace, 
  level, 
  isCollapsed, 
  expandedWorkspaces, 
  onToggleExpansion, 
  onWorkspaceAction, 
  onDrop, 
  onDragOver, 
  workspaceMenuOpen, 
  setWorkspaceMenuOpen, 
  addingSubWorkspaceTo, 
  setAddingSubWorkspaceTo, 
  newSubWorkspaceName, 
  setNewSubWorkspaceName, 
  addSubWorkspace,
  t,
  onBoardSelect,
  selectedBoardId,
  removeBoardFromWorkspace,
  renamingWorkspace,
  setRenamingWorkspace,
  renameWorkspaceName,
  setRenameWorkspaceName,
  renameWorkspace
}) => {
  const hasSubWorkspaces = workspace.subWorkspaces && workspace.subWorkspaces.length > 0;
  const isExpanded = expandedWorkspaces.has(workspace.id);
  const isAddingSub = addingSubWorkspaceTo === workspace.id;

  return (
    <div style={{ position: 'relative' }}>
      {/* Workspace Header */}
      <div 
        className="sidebar-workspace-item sidebar-drop-zone"
        onDragOver={(e) => onDragOver(e)}
        onDrop={(e) => onDrop(e, workspace.id)}
        title={t('drop-board-here')}
        style={{ 
          cursor: 'default',
          marginBottom: '7.5px',
          marginLeft: `${level * 6}px`
        }}
      >
        {!isCollapsed && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              {/* Collapse/Expand Triangle */}
              {hasSubWorkspaces && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpansion(workspace.id);
                  }}
                  className="workspace-expand-btn"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    marginRight: '6px',
                    fontSize: '12px',
                    color: '#666'
                  }}
                >
                  {isExpanded ? '▼' : '▶'}
                </button>
              )}
              {!hasSubWorkspaces && (
                <span style={{ width: '18px', marginRight: '6px' }}></span>
              )}
              
              {/* Workspace Name */}
              {renamingWorkspace === workspace.id ? (
                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <input
                    type="text"
                    value={renameWorkspaceName}
                    onChange={(e) => setRenameWorkspaceName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        renameWorkspace(workspace.id, renameWorkspaceName);
                      } else if (e.key === 'Escape') {
                        setRenamingWorkspace(null);
                        setRenameWorkspaceName('');
                      }
                    }}
                    onBlur={() => {
                      if (renameWorkspaceName.trim()) {
                        renameWorkspace(workspace.id, renameWorkspaceName);
                      } else {
                        setRenamingWorkspace(null);
                        setRenameWorkspaceName('');
                      }
                    }}
                    style={{
                      flex: 1,
                      border: '1px solid #0079BF',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    autoFocus
                  />
                </div>
              ) : (
                <span style={{ flex: 1 }}>{workspace.name}</span>
              )}
            </div>
            
            {/* Board Count */}
            <span className="sidebar-section-count" style={{ marginRight: '8px' }}>
              {workspace.boards?.length || 0}
            </span>
            
            {/* Three Dots Menu Button */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newState = workspaceMenuOpen === workspace.id ? null : workspace.id;
                  setWorkspaceMenuOpen(newState);
                }}
                className="workspace-menu-btn"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  fontSize: '16px',
                  color: '#666',
                  borderRadius: '4px'
                }}
              >
                ⋯
              </button>
              
              {/* Workspace Menu Popup */}
              {workspaceMenuOpen === workspace.id && !isCollapsed && (
                <div className="workspace-menu-popup" style={{
                  position: 'absolute',
                  right: '0px',
                  top: '100%',
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 10000,
                  minWidth: '180px',
                  padding: '8px 0',
                  marginTop: '4px'
                }}>
                  <div className="menu-item" onClick={() => onWorkspaceAction(workspace.id, 'rename')}>
                    <span style={{ marginRight: '8px' }}>✏️</span>
                    Rename
                  </div>
                  <div className="menu-item" onClick={() => onWorkspaceAction(workspace.id, 'copy-link')}>
                    <span style={{ marginRight: '8px' }}>🔗</span>
                    Copy Link
                  </div>
                  <div className="menu-item" onClick={() => onWorkspaceAction(workspace.id, 'create-folder')}>
                    <span style={{ marginRight: '8px' }}>📁</span>
                    Create new folder
                  </div>
                  <div className="menu-item" onClick={() => onWorkspaceAction(workspace.id, 'color')}>
                    <span style={{ marginRight: '8px' }}>🎨</span>
                    Color
                  </div>
                  <div className="menu-item" onClick={() => onWorkspaceAction(workspace.id, 'duplicate')}>
                    <span style={{ marginRight: '8px' }}>📋</span>
                    Duplicate
                  </div>
                  <div className="menu-item" onClick={() => onWorkspaceAction(workspace.id, 'archive')}>
                    <span style={{ marginRight: '8px' }}>📦</span>
                    Archive
                  </div>
                  <div className="menu-item" onClick={() => onWorkspaceAction(workspace.id, 'delete')}>
                    <span style={{ marginRight: '8px' }}>🗑️</span>
                    Delete
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>



      {/* Add Sub-Workspace Form */}
      {isAddingSub && !isCollapsed && (
        <div style={{ marginLeft: `${(level + 1) * 6}px`, marginBottom: '7.5px' }}>
          <input
            type="text"
            value={newSubWorkspaceName}
            onChange={(e) => setNewSubWorkspaceName(e.target.value)}
            placeholder={t('workspace-name')}
            className="sidebar-add-workspace-input"
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '13px'
            }}
            autoFocus
          />
          <div className="sidebar-add-workspace-buttons" style={{ marginTop: '6px' }}>
            <button
              onClick={() => addSubWorkspace(workspace.id, newSubWorkspaceName)}
              className="sidebar-add-workspace-btn"
              style={{ fontSize: '11px', padding: '4px 8px' }}
            >
              {t('add')}
            </button>
            <button
              onClick={() => {
                setAddingSubWorkspaceTo(null);
                setNewSubWorkspaceName('');
              }}
              className="sidebar-add-workspace-btn cancel"
              style={{ fontSize: '11px', padding: '4px 8px' }}
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Sub-Workspaces */}
      {isExpanded && hasSubWorkspaces && !isCollapsed && (
        <div>
          {workspace.subWorkspaces.map(subWorkspace => (
            <WorkspaceItem
              key={subWorkspace.id}
              workspace={subWorkspace}
              level={level + 1}
              isCollapsed={isCollapsed}
              expandedWorkspaces={expandedWorkspaces}
              onToggleExpansion={onToggleExpansion}
              onWorkspaceAction={onWorkspaceAction}
              onDrop={onDrop}
              onDragOver={onDragOver}
              workspaceMenuOpen={workspaceMenuOpen}
              setWorkspaceMenuOpen={setWorkspaceMenuOpen}
              addingSubWorkspaceTo={addingSubWorkspaceTo}
              setAddingSubWorkspaceTo={setAddingSubWorkspaceTo}
              newSubWorkspaceName={newSubWorkspaceName}
              setNewSubWorkspaceName={setNewSubWorkspaceName}
              addSubWorkspace={addSubWorkspace}
              t={t}
              onBoardSelect={onBoardSelect}
              selectedBoardId={selectedBoardId}
              removeBoardFromWorkspace={removeBoardFromWorkspace}
            />
          ))}
        </div>
      )}

      {/* Workspace Boards */}
      {workspace.boards?.map(boardId => {
        // Temporarily use placeholder data until Boards collection is fixed
        const board = { _id: boardId, title: `Board ${boardId.substring(0, 8)}` };
        if (!board) return null;

        return (
          <div
            key={boardId}
            className={`sidebar-board-item ${selectedBoardId === boardId ? 'selected' : ''}`}
            style={{ 
              marginLeft: `${(level + 1) * 6 + 15}px`,
              marginBottom: '4px'
            }}
            onClick={() => onBoardSelect(boardId)}
            title={board.title}
          >
            <span className="sidebar-board-icon">📋</span>
            {!isCollapsed && (
              <>
                <span className="sidebar-board-title">
                  {board.title}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBoardFromWorkspace(boardId, workspace.id);
                  }}
                  className="sidebar-remove-board-btn"
                  title={t('remove-from-workspace')}
                >
                  ×
                </button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Sidebar;
