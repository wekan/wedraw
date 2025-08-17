import { ReactiveCache } from '/imports/reactiveCache';

Meteor.startup(() => {
  // Node Fibers 100% CPU usage issue - FIXED by removing fibers dependency
  // https://github.com/wekan/wekan-mongodb/issues/2#issuecomment-381453161
  // https://github.com/meteor/meteor/issues/9796#issuecomment-381676326
  // https://github.com/sandstorm-io/sandstorm/blob/0f1fec013fe7208ed0fd97eb88b31b77e3c61f42/shell/server/00-startup.js#L99-L129
  // Note: Fibers.poolSize is no longer needed in Meteor 3 with async/await

  Accounts.validateLoginAttempt(function(options) {
    const user = options.user || {};
    return !user.loginDisabled;
  });

  Authentication = {};

  Authentication.checkUserId = function(userId) {
    if (userId === undefined) {
      const error = new Meteor.Error('Unauthorized', 'Unauthorized');
      error.statusCode = 401;
      throw error;
    }
    const admin = ReactiveCache.getUser({ _id: userId, isAdmin: true });

    if (admin === undefined) {
      const error = new Meteor.Error('Forbidden', 'Forbidden');
      error.statusCode = 403;
      throw error;
    }
  };

  // This will only check if the user is logged in.
  // The authorization checks for the user will have to be done inside each API endpoint
  Authentication.checkLoggedIn = function(userId) {
    if (userId === undefined) {
      const error = new Meteor.Error('Unauthorized', 'Unauthorized');
      error.statusCode = 401;
      throw error;
    }
  };

  // An admin should be authorized to access everything, so we use a separate check for admins
  // This throws an error if otherReq is false and the user is not an admin
  Authentication.checkAdminOrCondition = function(userId, otherReq) {
    if (otherReq) return;
    const admin = ReactiveCache.getUser({ _id: userId, isAdmin: true });
    if (admin === undefined) {
      const error = new Meteor.Error('Forbidden', 'Forbidden');
      error.statusCode = 403;
      throw error;
    }
  };

  // Helper function. Will throw an error if the user is not active BoardAdmin or active Normal user of the board.
  Authentication.checkBoardAccess = function(userId, boardId) {
    Authentication.checkLoggedIn(userId);
    const board = ReactiveCache.getBoard(boardId);
    const normalAccess = board.members.some(e => e.userId === userId && e.isActive && !e.isNoComments && !e.isCommentOnly && !e.isWorker);
    Authentication.checkAdminOrCondition(userId, normalAccess);
  };

  if (Meteor.isServer) {
    if (
      process.env.ORACLE_OIM_ENABLED === 'true' ||
      process.env.ORACLE_OIM_ENABLED === true
    ) {
      ServiceConfiguration.configurations.upsert(
        // eslint-disable-line no-undef
        { service: 'oidc' },
        {
          $set: {
            loginStyle: process.env.OAUTH2_LOGIN_STYLE,
            clientId: process.env.OAUTH2_CLIENT_ID,
            secret: process.env.OAUTH2_SECRET,
            serverUrl: process.env.OAUTH2_SERVER_URL,
            authorizationEndpoint: process.env.OAUTH2_AUTH_ENDPOINT,
            userinfoEndpoint: process.env.OAUTH2_USERINFO_ENDPOINT,
            tokenEndpoint: process.env.OAUTH2_TOKEN_ENDPOINT,
            idTokenWhitelistFields:
              process.env.OAUTH2_ID_TOKEN_WHITELIST_FIELDS || [],
            requestPermissions: process.env.OAUTH2_REQUEST_PERMISSIONS,
          },
        },
      );
    } else if (
      process.env.OAUTH2_ENABLED === 'true' ||
      process.env.OAUTH2_ENABLED === true
    ) {
      ServiceConfiguration.configurations.upsert(
        // eslint-disable-line no-undef
        { service: 'oidc' },
        {
          $set: {
            loginStyle: process.env.OAUTH2_LOGIN_STYLE,
            clientId: process.env.OAUTH2_CLIENT_ID,
            secret: process.env.OAUTH2_SECRET,
            serverUrl: process.env.OAUTH2_SERVER_URL,
            authorizationEndpoint: process.env.OAUTH2_AUTH_ENDPOINT,
            userinfoEndpoint: process.env.OAUTH2_USERINFO_ENDPOINT,
            tokenEndpoint: process.env.OAUTH2_TOKEN_ENDPOINT,
            idTokenWhitelistFields:
              process.env.OAUTH2_ID_TOKEN_WHITELIST_FIELDS || [],
            requestPermissions: process.env.OAUTH2_REQUEST_PERMISSIONS,
          },
        },
      );
    }
  }
});
