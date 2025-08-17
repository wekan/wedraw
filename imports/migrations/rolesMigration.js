import { Meteor } from 'meteor/meteor';
import { Boards } from '/models/boards';
import { 
  WEKAN_ROLES, 
  addUserToBoard, 
  migrateUserRoles 
} from '/imports/roles';

/**
 * Migration script to convert hardcoded boolean role flags to Meteor roles
 * This converts the old system:
 * - isAdmin: true -> BoardAdmin role
 * - isCommentOnly: true -> CommentOnly role  
 * - isNoComments: true -> NoComments role
 * - Default -> Normal role
 */
export const migrateBoardRoles = () => {
  if (!Meteor.isServer) {
    console.log('Migration can only run on server');
    return;
  }

  console.log('Starting board roles migration...');
  
  // Get all boards
  const boards = Boards.find().fetch();
  console.log(`Found ${boards.length} boards to migrate`);
  
  let migratedCount = 0;
  let errorCount = 0;
  
  boards.forEach(board => {
    try {
      if (board.members && board.members.length > 0) {
        console.log(`Migrating board: ${board.title} (${board._id})`);
        
        // Migrate each member's roles
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
          const success = addUserToBoard(userId, board._id, newRole);
          if (success) {
            console.log(`  - User ${userId}: ${member.isAdmin ? 'isAdmin' : member.isCommentOnly ? 'isCommentOnly' : member.isNoComments ? 'isNoComments' : 'Normal'} -> ${newRole}`);
          } else {
            console.error(`  - Failed to migrate user ${userId}`);
            errorCount++;
          }
        });
        
        migratedCount++;
      }
    } catch (error) {
      console.error(`Error migrating board ${board._id}:`, error);
      errorCount++;
    }
  });
  
  console.log(`Migration completed. Successfully migrated ${migratedCount} boards with ${errorCount} errors.`);
};

/**
 * Clean up old boolean flags after migration
 * WARNING: Only run this after confirming the migration was successful
 */
export const cleanupOldRoleFlags = () => {
  if (!Meteor.isServer) {
    console.log('Cleanup can only run on server');
    return;
  }
  
  console.log('Starting cleanup of old role flags...');
  
  // Remove old boolean flags from board members
  const result = Boards.update(
    {},
    {
      $unset: {
        'members.$.isAdmin': '',
        'members.$.isCommentOnly': '',
        'members.$.isNoComments': '',
        'members.$.isWorker': ''
      }
    },
    { multi: true }
  );
  
  console.log(`Cleanup completed. Updated ${result} documents.`);
};

/**
 * Verify migration was successful
 */
export const verifyMigration = () => {
  if (!Meteor.isServer) {
    console.log('Verification can only run on server');
    return;
  }
  
  console.log('Verifying migration...');
  
  const boards = Boards.find().fetch();
  let totalMembers = 0;
  let migratedMembers = 0;
  
  boards.forEach(board => {
    if (board.members) {
      totalMembers += board.members.length;
      
      board.members.forEach(member => {
        // Check if old flags still exist
        if (member.isAdmin !== undefined || 
            member.isCommentOnly !== undefined || 
            member.isNoComments !== undefined || 
            member.isWorker !== undefined) {
          console.log(`  - Board ${board.title}: User ${member.userId} still has old flags`);
        } else {
          migratedMembers++;
        }
      });
    }
  });
  
  console.log(`Migration verification: ${migratedMembers}/${totalMembers} members migrated successfully`);
  
  if (migratedMembers === totalMembers) {
    console.log('✅ All members successfully migrated to new roles system');
  } else {
    console.log('❌ Some members still have old role flags');
  }
};

// Export migration functions
export const RolesMigration = {
  migrate: migrateBoardRoles,
  cleanup: cleanupOldRoleFlags,
  verify: verifyMigration
};
