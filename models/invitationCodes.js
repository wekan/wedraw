import { EasySchema } from 'meteor/jam:easy-schema';

import { ReactiveCache } from '/imports/reactiveCache';

InvitationCodes = new Mongo.Collection('invitation_codes');

InvitationCodes.schema = 
  {
    code: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      regEx: EasySchema.RegEx.Email,
    },
    createdAt: {
      type: Date,
      optional: true,
      // eslint-disable-next-line consistent-return
      autoValue() {
        if (this.isInsert) {
          return new Date();
        } else if (this.isUpsert) {
          return { $setOnInsert: new Date() };
        } else {
          this.unset();
        }
      },
    },
    modifiedAt: {
      type: Date,
      // eslint-disable-next-line consistent-return
      autoValue() {
        if (this.isInsert || this.isUpsert || this.isUpdate) {
          return new Date();
        } else {
          this.unset();
        }
      },
    },
    // always be the admin if only one admin
    authorId: {
      type: String,
    },
    boardsToBeInvited: {
      type: [String],
      optional: true,
    },
    valid: {
      type: Boolean,
      defaultValue: true,
    },
  }),
);

InvitationCodes.helpers({
  author() {
    return ReactiveCache.getUser(this.authorId);
  },
});

// InvitationCodes.before.insert((userId, doc) => {
// doc.createdAt = new Date();
// doc.authorId = userId;
// });

if (Meteor.isServer) {
  Meteor.startup(() => {
    InvitationCodes._collection.createIndex({ modifiedAt: -1 });
  });
  Boards.deny({
    fetch: ['members'],
  });
}

export default InvitationCodes;
