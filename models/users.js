import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { ReactiveCache } from '/imports/reactiveCache';
import { SyncedCron } from 'meteor/quave:synced-cron';

// Global collection definition
Users = Meteor.users;

const allowedSortValues = [
  '-modifiedAt',
  'modifiedAt',
  '-title',
  'title',
  '-sort',
  'sort',
];
const defaultSortBy = allowedSortValues[0];

/**
 * A User in wekan
 */
// Note: jam:easy-schema uses plain objects for schemas
// The schema is attached directly to the collection
Users.schema = {
  username: String,
  orgs: [Object],
  teams: [Object],
  emails: [Object],
  createdAt: Date,
  modifiedAt: Date,
  profile: Object,
};

// Note: Meteor 3 doesn't support allow/deny
// Use built-in Meteor 3 roles for authorization instead
// Authorization should be handled in Meteor methods and publications

// Temporarily commented out search index to resolve easy:search dependency
// UserSearchIndex = new Index({ ... });

Users.safeFields = {
  _id: 1,
  username: 1,
  'profile.fullname': 1,
  'profile.avatarUrl': 1,
  'profile.initials': 1,
  orgs: 1,
  teams: 1,
  authenticationMethod: 1,
  lastConnectionDate: 1,
};

// Utility functions (moved from helpers)
Users.parseImportUsernames = (usernamesString) => {
  return usernamesString.trim().split(new RegExp('\\s*[,;]\\s*'));
};

// Note: Users.helpers is not available without aldeed:collection2
// These helper functions should be moved to utility functions or computed properties
// or implemented as static methods on the Users collection

if (Meteor.isServer) {
  Meteor.methods({
    setCreateUser(
      fullname,
      username,
      initials,
      password,
      isAdmin,
      isActive,
      email,
      importUsernames,
      userOrgsArray,
      userTeamsArray,
    ) {
      check(fullname, String);
      check(username, String);
      check(initials, String);
      check(password, String);
      check(isAdmin, String);
      check(isActive, String);
      check(email, String);
      check(importUsernames, Array);
      check(userOrgsArray, Array);
      check(userTeamsArray, Array);
      
      // Prevent Hyperlink Injection https://github.com/wekan/wekan/issues/5176
      if (fullname.includes('/') ||
         username.includes('/') ||
         email.includes('/') ||
         initials.includes('/')) {
         return false;
      }
      
      if (ReactiveCache.getCurrentUser()?.isAdmin) {
        const nUsersWithUsername = ReactiveCache.getUsers({
          username,
        }).length;
        const nUsersWithEmail = ReactiveCache.getUsers({
          email,
        }).length;
        if (nUsersWithUsername > 0) {
          throw new Meteor.Error('username-already-taken');
        } else if (nUsersWithEmail > 0) {
          throw new Meteor.Error('email-already-taken');
        } else {
          Accounts.createUser({
            username,
            password,
            isAdmin,
            isActive,
            email: email.toLowerCase(),
            from: 'admin',
          });
          const user =
            ReactiveCache.getUser(username) ||
            ReactiveCache.getUser({ username });
          if (user) {
            Users.update(user._id, {
              $set: {
                'profile.fullname': fullname,
                importUsernames,
                'profile.initials': initials,
                orgs: userOrgsArray,
                teams: userTeamsArray,
              },
            });
          }
        }
      }
    },
    
    setUsername(username, userId) {
      check(username, String);
      check(userId, String);
      
      // Prevent Hyperlink Injection
      if (username.includes('/') ||
         userId.includes('/')) {
         return false;
      }
      
      if (ReactiveCache.getCurrentUser()?.isAdmin) {
        const nUsersWithUsername = ReactiveCache.getUsers({
          username,
        }).length;
        if (nUsersWithUsername > 0) {
          throw new Meteor.Error('username-already-taken');
        } else {
          Users.update(userId, {
            $set: {
              username,
            },
          });
        }
      }
    },
    
    setEmail(email, userId) {
      check(email, String);
      check(userId, String);
      
      // Prevent Hyperlink Injection
      if (email.includes('/') ||
         userId.includes('/')) {
         return false;
      }
      
      if (ReactiveCache.getCurrentUser()?.isAdmin) {
        const nUsersWithEmail = ReactiveCache.getUsers({
          email,
        }).length;
        if (nUsersWithEmail > 0) {
          throw new Meteor.Error('email-already-taken');
        } else {
          Users.update(userId, {
            $set: {
              'emails.0.address': email.toLowerCase(),
            },
          });
        }
      }
    },
  });
}

// Export for use in other files
export { Users };
