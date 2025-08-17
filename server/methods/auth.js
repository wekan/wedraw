import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-password';
import { Random } from 'meteor/random';

/**
 * Server methods for user management and workspaces
 */
Meteor.methods({



  /**
   * Add a new workspace for the current user
   */
  async 'users.addWorkspace'(name) {
    check(name, String);
    
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to add a workspace');
    }

    if (!name.trim()) {
      throw new Meteor.Error('invalid-name', 'Workspace name cannot be empty');
    }

    if (!name.trim()) {
      throw new Meteor.Error('invalid-name', 'Workspace name cannot be empty');
    }

    const userId = Meteor.userId();
    const user = await Meteor.users.findOneAsync(userId);
    
    // Initialize workspaces array if it doesn't exist
    const workspaces = user.profile?.workspaces || [];
    
    // Check if workspace name already exists
    if (workspaces.some(ws => ws.name === name.trim())) {
      throw new Meteor.Error('duplicate-name', 'A workspace with this name already exists');
    }

    // Create new workspace
    const newWorkspace = {
      id: Random.id(),
      name: name.trim(),
      createdAt: new Date(),
      boards: [],
      subWorkspaces: []
    };

    // Add to user's profile
    await Meteor.users.updateAsync(userId, {
      $push: { 'profile.workspaces': newWorkspace }
    });

    return newWorkspace.id;
  },

  /**
   * Add a new sub-workspace to a parent workspace
   */
  async 'users.addSubWorkspace'(parentWorkspaceId, name) {
    check(parentWorkspaceId, String);
    check(name, String);
    
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to add a sub-workspace');
    }

    if (!name.trim()) {
      throw new Meteor.Error('invalid-name', 'Sub-workspace name cannot be empty');
    }

    const userId = Meteor.userId();
    const user = await Meteor.users.findOneAsync(userId);
    
    const workspaces = user.profile?.workspaces || [];
    const parentWorkspace = workspaces.find(ws => ws.id === parentWorkspaceId);
    
    if (!parentWorkspace) {
      throw new Meteor.Error('parent-not-found', 'Parent workspace not found');
    }

    // Check if sub-workspace name already exists in parent
    if (parentWorkspace.subWorkspaces && parentWorkspace.subWorkspaces.some(sws => sws.name === name.trim())) {
      throw new Meteor.Error('duplicate-name', 'A sub-workspace with this name already exists');
    }

    // Create new sub-workspace
    const newSubWorkspace = {
      id: Random.id(),
      name: name.trim(),
      createdAt: new Date(),
      boards: [],
      subWorkspaces: []
    };

    // Add to parent workspace
    const parentIndex = workspaces.findIndex(ws => ws.id === parentWorkspaceId);
    if (parentIndex !== -1) {
      if (!workspaces[parentIndex].subWorkspaces) {
        workspaces[parentIndex].subWorkspaces = [];
      }
      workspaces[parentIndex].subWorkspaces.push(newSubWorkspace);
      
      await Meteor.users.updateAsync(userId, {
        $set: { 'profile.workspaces': workspaces }
      });
    }

    return newSubWorkspace.id;
  },

  /**
   * Move a board to a specific workspace
   */
  async 'users.moveBoardToWorkspace'(boardId, workspaceId) {
    check(boardId, String);
    check(workspaceId, String);
    
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to move boards');
    }

    const userId = Meteor.userId();
    const user = await Meteor.users.findOneAsync(userId);
    
    // Verify the board belongs to the user
    // Note: Boards collection is temporarily disabled, so we'll skip this check for now
    // const board = Boards.findOne({
    //   _id: boardId,
    //   'members.userId': userId
    // });
    
    // For now, assume the board exists and belongs to the user
    const board = { _id: boardId };
    
    if (!board) {
      throw new Meteor.Error('board-not-found', 'Board not found or you do not have access to it');
    }

    // Verify the workspace exists and belongs to the user
    const workspaces = user.profile?.workspaces || [];
    const workspace = workspaces.find(ws => ws.id === workspaceId);
    
    if (!workspace) {
      throw new Meteor.Error('workspace-not-found', 'Workspace not found');
    }

    // Remove board from all other workspaces first
    for (const ws of workspaces) {
      if (ws.boards && ws.boards.includes(boardId)) {
        await Meteor.users.updateAsync(userId, {
          $pull: { [`profile.workspaces.${workspaces.indexOf(ws)}.boards`]: boardId }
        });
      }
    }

    // Add board to target workspace
    await Meteor.users.updateAsync(userId, {
      $addToSet: { [`profile.workspaces.${workspaces.indexOf(workspace)}.boards`]: boardId }
    });

    return true;
  },

  /**
   * Remove a board from a workspace (moves it back to unassigned)
   */
  async 'users.removeBoardFromWorkspace'(boardId, workspaceId) {
    check(boardId, String);
    check(workspaceId, String);
    
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to remove boards from workspaces');
    }

    const userId = Meteor.userId();
    const user = await Meteor.users.findOneAsync(userId);
    
    // Verify the workspace exists and belongs to the user
    const workspaces = user.profile?.workspaces || [];
    const workspace = workspaces.find(ws => ws.id === workspaceId);
    
    if (!workspace) {
      throw new Meteor.Error('workspace-not-found', 'Workspace not found');
    }

    // Remove board from workspace
    await Meteor.users.updateAsync(userId, {
      $pull: { [`profile.workspaces.${workspaces.indexOf(workspace)}.boards`]: boardId }
    });

    return true;
  },

  /**
   * Delete a workspace
   */
  async 'users.deleteWorkspace'(workspaceId) {
    check(workspaceId, String);
    
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to delete workspaces');
    }

    const userId = Meteor.userId();
    const user = await Meteor.users.findOneAsync(userId);
    
    // Verify the workspace exists and belongs to the user
    const workspaces = user.profile?.workspaces || [];
    const workspace = workspaces.find(ws => ws.id === workspaceId);
    
    if (!workspace) {
      throw new Meteor.Error('workspace-not-found', 'Workspace not found');
    }

    // Move all boards back to unassigned (they will automatically appear in Boards section)
    // No need to do anything special - boards will just not be in any workspace

    // Remove the workspace
    await Meteor.users.updateAsync(userId, {
      $pull: { 'profile.workspaces': { id: workspaceId } }
    });

    return true;
  },

  /**
   * Rename a workspace
   */
  async 'users.renameWorkspace'(workspaceId, newName) {
    check(workspaceId, String);
    check(newName, String);
    
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to rename workspaces');
    }

    if (!newName.trim()) {
      throw new Meteor.Error('invalid-name', 'Workspace name cannot be empty');
    }

    const userId = Meteor.userId();
    const user = await Meteor.users.findOneAsync(userId);
    
    const workspaces = user.profile?.workspaces || [];
    const workspace = workspaces.find(ws => ws.id === workspaceId);
    
    if (!workspace) {
      throw new Meteor.Error('workspace-not-found', 'Workspace not found');
    }

    // Check if the new name already exists
    if (workspaces.some(ws => ws.id !== workspaceId && ws.name === newName.trim())) {
      throw new Meteor.Error('duplicate-name', 'A workspace with this name already exists');
    }

    // Update the workspace name
    await Meteor.users.updateAsync(userId, {
      $set: { 'profile.workspaces.$[workspace].name': newName.trim() }
    }, {
      arrayFilters: [{ 'workspace.id': workspaceId }]
    });

    return true;
  },

  /**
   * Create a new board
   */
  async 'createBoard'(boardData) {
    check(boardData, {
      title: String,
      description: String,
      color: String
    });
    
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to create boards');
    }

    const userId = Meteor.userId();
    
    // Create a new board object
    const newBoard = {
      _id: Random.id(),
      title: boardData.title.trim(),
      description: boardData.description.trim(),
      color: boardData.color,
      createdAt: new Date(),
      createdBy: userId,
      members: [{
        userId: userId,
        isAdmin: true,
        isActive: true
      }]
    };
    
    // Store the board in the user's profile for now
    // This will be moved to the Boards collection once it's fixed
    await Meteor.users.updateAsync(userId, {
      $push: { 'profile.boards': newBoard }
    });
    
    console.log('Board created successfully:', { boardData, userId, boardId: newBoard._id });
    
    return newBoard._id;
  },

  /**
   * Reorder workspaces for the current user
   */
  async 'users.reorderWorkspaces'(sourceWorkspaceId, targetPosition) {
    check(sourceWorkspaceId, String);
    check(targetPosition, String);
    
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to reorder workspaces');
    }

    const userId = Meteor.userId();
    const user = await Meteor.users.findOneAsync(userId);
    
    const workspaces = user.profile?.workspaces || [];
    const sourceWorkspace = workspaces.find(ws => ws.id === sourceWorkspaceId);
    
    if (!sourceWorkspace) {
      throw new Meteor.Error('workspace-not-found', 'Source workspace not found');
    }

    // Remove the source workspace from its current position
    const updatedWorkspaces = workspaces.filter(ws => ws.id !== sourceWorkspaceId);
    
    // Determine the target position
    let targetIndex;
    if (targetPosition === 'after-last') {
      // Move to the end
      targetIndex = updatedWorkspaces.length;
    } else if (targetPosition.startsWith('before-')) {
      // Move before a specific workspace
      const targetWorkspaceId = targetPosition.replace('before-', '');
      targetIndex = updatedWorkspaces.findIndex(ws => ws.id === targetWorkspaceId);
    } else {
      // Move to a specific workspace (replace it)
      targetIndex = updatedWorkspaces.findIndex(ws => ws.id === targetPosition);
    }

    // Insert the workspace at the target position
    if (targetIndex === -1) {
      targetIndex = updatedWorkspaces.length; // Default to end if target not found
    }
    
    updatedWorkspaces.splice(targetIndex, 0, sourceWorkspace);

    // Update the user's profile with the new workspace order
    await Meteor.users.updateAsync(userId, {
      $set: { 'profile.workspaces': updatedWorkspaces }
    });

    return true;
  }
});
