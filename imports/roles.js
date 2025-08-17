// Meteor 3 has built-in roles support
// No need to import external package

// WeKan Standard Roles
export const WEKAN_ROLES = {
  BOARD_ADMIN: 'BoardAdmin',
  NORMAL: 'Normal', 
  COMMENT_ONLY: 'CommentOnly',
  NO_COMMENTS: 'NoComments'
};

// Role hierarchy and permissions
export const ROLE_PERMISSIONS = {
  [WEKAN_ROLES.BOARD_ADMIN]: {
    name: 'Board Admin',
    description: 'Full access to the board including settings, members, and all content',
    permissions: [
      'board.admin',
      'board.edit',
      'board.view',
      'cards.create',
      'cards.edit', 
      'cards.delete',
      'lists.create',
      'lists.edit',
      'lists.delete',
      'comments.create',
      'comments.edit',
      'comments.delete',
      'attachments.create',
      'attachments.delete',
      'members.manage',
      'rules.manage',
      'settings.manage'
    ]
  },
  [WEKAN_ROLES.NORMAL]: {
    name: 'Normal',
    description: 'Can edit cards, add comments, and participate fully',
    permissions: [
      'board.view',
      'cards.create',
      'cards.edit',
      'cards.delete',
      'lists.create', 
      'lists.edit',
      'comments.create',
      'comments.edit',
      'comments.delete',
      'attachments.create',
      'attachments.delete'
    ]
  },
  [WEKAN_ROLES.COMMENT_ONLY]: {
    name: 'Comment Only',
    description: 'Can only view and add comments',
    permissions: [
      'board.view',
      'cards.view',
      'comments.create',
      'comments.edit'
    ]
  },
  [WEKAN_ROLES.NO_COMMENTS]: {
    name: 'No Comments',
    description: 'Can only view content, no editing or commenting',
    permissions: [
      'board.view',
      'cards.view'
    ]
  }
};

// Helper function to check if user has a specific permission
export const hasPermission = (userId, boardId, permission) => {
  if (!userId || !boardId) return false;
  
  // Check if user is admin of the board
  if (Meteor.userIsInRole(userId, WEKAN_ROLES.BOARD_ADMIN, boardId)) {
    return true;
  }
  
  // Check specific permission based on user's role
  const userRoles = Meteor.getRolesForUser(userId, boardId);
  
  for (const role of userRoles) {
    const rolePermissions = ROLE_PERMISSIONS[role]?.permissions || [];
    if (rolePermissions.includes(permission)) {
      return true;
    }
  }
  
  return false;
};

// Helper function to check if user has a specific role
export const hasRole = (userId, boardId, role) => {
  if (!userId || !boardId) return false;
  return Meteor.userIsInRole(userId, role, boardId);
};

// Helper function to get user's roles for a board
export const getUserRoles = (userId, boardId) => {
  if (!userId || !boardId) return [];
  return Meteor.getRolesForUser(userId, boardId);
};

// Helper function to add user to board with role
export const addUserToBoard = (userId, boardId, role = WEKAN_ROLES.NORMAL) => {
  if (!userId || !boardId) return false;
  
  try {
    Meteor.addUsersToRoles(userId, role, boardId);
    return true;
  } catch (error) {
    console.error('Error adding user to board:', error);
    return false;
  }
};

// Helper function to remove user from board
export const removeUserFromBoard = (userId, boardId) => {
  if (!userId || !boardId) return false;
  
  try {
    Meteor.removeUsersFromRoles(userId, Object.values(WEKAN_ROLES), boardId);
    return true;
  } catch (error) {
    console.error('Error removing user from board:', error);
    return false;
  }
};

// Helper function to update user's role on board
export const updateUserRole = (userId, boardId, newRole) => {
  if (!userId || !boardId || !newRole) return false;
  
  try {
    // Remove all existing roles
    removeUserFromBoard(userId, boardId);
    // Add new role
    addUserToBoard(userId, boardId, newRole);
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    return false;
  }
};

// Migration helper: convert old boolean flags to new roles
export const migrateUserRoles = (board) => {
  if (!board || !board.members) return;
  
  board.members.forEach(member => {
    const userId = member.userId;
    let newRole = WEKAN_ROLES.NORMAL;
    
    if (member.isAdmin) {
      newRole = WEKAN_ROLES.BOARD_ADMIN;
    } else if (member.isCommentOnly) {
      newRole = WEKAN_ROLES.COMMENT_ONLY;
    } else if (member.isNoComments) {
      newRole = WEKAN_ROLES.NO_COMMENTS;
    }
    
    // Add user to board with new role
    addUserToBoard(userId, board._id, newRole);
  });
};
