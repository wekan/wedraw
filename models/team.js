import { Mongo } from 'meteor/mongo';
import { ReactiveCache } from '/imports/reactiveCache';

// Global collection definition
Team = new Mongo.Collection('team');

/**
 * A Team in Wekan. Organization in Trello.
 */
// Note: jam:easy-schema uses plain objects for schemas
Team.schema = {
  teamDisplayName: {
    /**
     * the name to display for the team
     */
    type: String,
    optional: true,
  },
  teamDesc: {
    /**
     * the description the team
     */
    type: String,
    optional: true,
    max: 190,
  },
  teamShortName: {
    /**
     * short name of the team
     */
    type: String,
    optional: true,
    max: 255,
  },
  teamWebsite: {
    /**
     * website of the team
     */
    type: String,
    optional: true,
    max: 255,
  },
  teamIsActive: {
    /**
     * status of the team
     */
    type: Boolean,
    optional: true,
  },
  createdAt: {
    /**
     * creation date of the team
     */
    type: Date,
    optional: true,
  },
  modifiedAt: {
    type: Date,
    optional: true,
  },
};

// Note: Meteor 3 doesn't support allow/deny
// Use built-in Meteor 3 roles for authorization instead

  Meteor.methods({
    setCreateTeam(
      teamDisplayName,
      teamDesc,
      teamShortName,
      teamWebsite,
      teamIsActive,
    ) {
      if (ReactiveCache.getCurrentUser()?.isAdmin) {
        check(teamDisplayName, String);
        check(teamDesc, String);
        check(teamShortName, String);
        check(teamWebsite, String);
        check(teamIsActive, Boolean);

        const nTeamNames = ReactiveCache.getTeams({ teamShortName }).length;
        if (nTeamNames > 0) {
          throw new Meteor.Error('teamname-already-taken');
        } else {
          Team.insert({
            teamDisplayName,
            teamDesc,
            teamShortName,
            teamWebsite,
            teamIsActive,
          });
        }
      }
    },
    setCreateTeamFromOidc(
      teamDisplayName,
      teamDesc,
      teamShortName,
      teamWebsite,
      teamIsActive,
    ) {
      check(teamDisplayName, String);
      check(teamDesc, String);
      check(teamShortName, String);
      check(teamWebsite, String);
      check(teamIsActive, Boolean);
      const nTeamNames = ReactiveCache.getTeams({ teamShortName }).length;
      if (nTeamNames > 0) {
        throw new Meteor.Error('teamname-already-taken');
      } else {
        Team.insert({
          teamDisplayName,
          teamDesc,
          teamShortName,
          teamWebsite,
          teamIsActive,
        });
      }
    },
    setTeamDisplayName(team, teamDisplayName) {
      if (ReactiveCache.getCurrentUser()?.isAdmin) {
        check(team, Object);
        check(teamDisplayName, String);
        Team.update(team, {
          $set: { teamDisplayName: teamDisplayName },
        });
        Meteor.call('setUsersTeamsTeamDisplayName', team._id, teamDisplayName);
      }
    },

    setTeamDesc(team, teamDesc) {
      if (ReactiveCache.getCurrentUser()?.isAdmin) {
        check(team, Object);
        check(teamDesc, String);
        Team.update(team, {
          $set: { teamDesc: teamDesc },
        });
      }
    },

    setTeamShortName(team, teamShortName) {
      if (ReactiveCache.getCurrentUser()?.isAdmin) {
        check(team, Object);
        check(teamShortName, String);
        Team.update(team, {
          $set: { teamShortName: teamShortName },
        });
      }
    },

    setTeamIsActive(team, teamIsActive) {
      if (ReactiveCache.getCurrentUser()?.isAdmin) {
        check(team, Object);
        check(teamIsActive, Boolean);
        Team.update(team, {
          $set: { teamIsActive: teamIsActive },
        });
      }
    },
    setTeamAllFieldsFromOidc(
      team,
      teamDisplayName,
      teamDesc,
      teamShortName,
      teamWebsite,
      teamIsActive,
    ) {
      check(team, Object);
      check(teamDisplayName, String);
      check(teamDesc, String);
      check(teamShortName, String);
      check(teamWebsite, String);
      check(teamIsActive, Boolean);
      Team.update(team, {
        $set: {
          teamDisplayName: teamDisplayName,
          teamDesc: teamDesc,
          teamShortName: teamShortName,
          teamWebsite: teamWebsite,
          teamIsActive: teamIsActive,
        },
      });
      Meteor.call('setUsersTeamsTeamDisplayName', team._id, teamDisplayName);
    },
    setTeamAllFields(
      team,
      teamDisplayName,
      teamDesc,
      teamShortName,
      teamWebsite,
      teamIsActive,
    ) {
      if (ReactiveCache.getCurrentUser()?.isAdmin) {
        check(team, Object);
        check(teamDisplayName, String);
        check(teamDesc, String);
        check(teamShortName, String);
        check(teamWebsite, String);
        check(teamIsActive, Boolean);
        Team.update(team, {
          $set: {
            teamDisplayName: teamDisplayName,
            teamDesc: teamDesc,
            teamShortName: teamShortName,
            teamWebsite: teamWebsite,
            teamIsActive: teamIsActive,
          },
        });
        Meteor.call('setUsersTeamsTeamDisplayName', team._id, teamDisplayName);
      }
    },
  });
}

if (Meteor.isServer) {
  // Index for Team name.
  Meteor.startup(() => {
    Team._collection.createIndex({ teamDisplayName: 1 });
  });
}

export default Team;
