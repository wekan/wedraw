import { Meteor } from 'meteor/meteor';

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

// Legacy compatibility functions - these replace the old boolean flag checks
export const isBoardAdmin = (userId, boardId) => {
  return hasRole(userId, boardId, WEKAN_ROLES.BOARD_ADMIN);
};

export const isCommentOnly = (userId, boardId) => {
  return hasRole(userId, boardId, WEKAN_ROLES.COMMENT_ONLY);
};

export const isNoComments = (userId, boardId) => {
  return hasRole(userId, boardId, WEKAN_ROLES.NO_COMMENTS);
};

export const isNormalUser = (userId, boardId) => {
  return hasRole(userId, boardId, WEKAN_ROLES.NORMAL);
};

// Board member status checks
export const isBoardMember = (userId, boardId) => {
  if (!userId || !boardId) return false;
  
  // Check if user has any role on the board
  const userRoles = getUserRoles(userId, boardId);
  return userRoles.length > 0;
};

export const isActiveBoardMember = (userId, boardId) => {
  return isBoardMember(userId, boardId);
};

// Permission-based checks for common operations
export const canCreateCards = (userId, boardId) => {
  return hasPermission(userId, boardId, 'cards.create');
};

export const canEditCards = (userId, boardId) => {
  return hasPermission(userId, boardId, 'cards.edit');
};

export const canDeleteCards = (userId, boardId) => {
  return hasPermission(userId, boardId, 'cards.delete');
};

export const canCreateComments = (userId, boardId) => {
  return hasPermission(userId, boardId, 'comments.create');
};

export const canEditComments = (userId, boardId) => {
  return hasPermission(userId, boardId, 'comments.edit');
};

export const canDeleteComments = (userId, boardId) => {
  return hasPermission(userId, boardId, 'comments.delete');
};

export const canManageMembers = (userId, boardId) => {
  return hasPermission(userId, boardId, 'members.manage');
};

export const canManageRules = (userId, boardId) => {
  return hasPermission(userId, boardId, 'rules.manage');
};

export const canManageSettings = (userId, boardId) => {
  return hasPermission(userId, boardId, 'settings.manage');
};
