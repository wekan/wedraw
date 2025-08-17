import { Mongo } from 'meteor/mongo';
import { ReactiveCache } from '/imports/reactiveCache';

// Global collection definition
Announcements = new Mongo.Collection('announcements');

// Note: jam:easy-schema uses plain objects for schemas
Announcements.schema = {
  enabled: {
    type: Boolean,
    defaultValue: false,
  },
  title: {
    type: String,
    optional: true,
  },
  body: {
    type: String,
    optional: true,
  },
  sort: {
    type: Number,
    decimal: true,
  },
  createdAt: {
    type: Date,
    optional: true,
  },
  modifiedAt: {
    type: Date,
  },
};

// Note: Meteor 3 doesn't support allow/deny
// Use built-in Meteor 3 roles for authorization instead

if (Meteor.isServer) {
  Meteor.startup(() => {
    Announcements._collection.createIndex({ modifiedAt: -1 });
    const announcements = Announcements.findOne({});
    if (!announcements) {
      Announcements.insert({ enabled: false, sort: 0 });
    }
  });
}

export default Announcements;
