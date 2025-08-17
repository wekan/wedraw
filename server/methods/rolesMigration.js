import { Meteor } from 'meteor/meteor';
import { RolesMigration } from '/imports/migrations/rolesMigration';

// Server-side methods for roles migration
Meteor.methods({
  /**
   * Run the board roles migration
   * Only accessible by admin users
   */
  'roles.migrate'() {
    // Check if user is admin
    if (!this.userId || !Meteor.user()?.isAdmin) {
      throw new Meteor.Error('not-authorized', 'Only admin users can run migrations');
    }
    
    try {
      RolesMigration.migrate();
      return { success: true, message: 'Migration completed successfully' };
    } catch (error) {
      console.error('Migration failed:', error);
      throw new Meteor.Error('migration-failed', 'Migration failed: ' + error.message);
    }
  },
  
  /**
   * Clean up old role flags after migration
   * Only accessible by admin users
   */
  'roles.cleanup'() {
    // Check if user is admin
    if (!this.userId || !Meteor.user()?.isAdmin) {
      throw new Meteor.Error('not-authorized', 'Only admin users can run cleanup');
    }
    
    try {
      RolesMigration.cleanup();
      return { success: true, message: 'Cleanup completed successfully' };
    } catch (error) {
      console.error('Cleanup failed:', error);
      throw new Meteor.Error('cleanup-failed', 'Cleanup failed: ' + error.message);
    }
  },
  
  /**
   * Verify migration was successful
   * Only accessible by admin users
   */
  'roles.verify'() {
    // Check if user is admin
    if (!this.userId || !Meteor.user()?.isAdmin) {
      throw new Meteor.Error('not-authorized', 'Only admin users can verify migration');
    }
    
    try {
      RolesMigration.verify();
      return { success: true, message: 'Verification completed successfully' };
    } catch (error) {
      console.error('Verification failed:', error);
      throw new Meteor.Error('verification-failed', 'Verification failed: ' + error.message);
    }
  }
});
