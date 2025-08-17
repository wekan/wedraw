import { EasySchema } from 'meteor/jam:easy-schema';
import { Mongo } from 'meteor/mongo';

const ImpersonatedUsers = new Mongo.Collection('impersonatedUsers');

// Make it globally available for backward compatibility
if (typeof global !== 'undefined') {
  global.ImpersonatedUsers = ImpersonatedUsers;
} else if (typeof window !== 'undefined') {
  window.ImpersonatedUsers = ImpersonatedUsers;
}

/**
 * A Impersonated User in wekan
 */
// Temporarily comment out schema attachment to resolve attachSchema error
// ImpersonatedUsers.schema = 
//   {
//     adminId: {
//       /**
//        * the admin userid that impersonates
//        */
//       type: String,
//       optional: true,
//     },
//     userId: {
//       /**
//        * the userId that is impersonated
//        */
//       type: String,
//       optional: true,
//     },
//     boardId: {
//       /**
//        * the boardId that was exported by anyone that has sometime impersonated
//        */
//       type: String,
//       optional: true,
//     },
//     attachmentId: {
//       /**
//        * the attachmentId that was exported by anyone that has sometime impersonated
//        */
//       type: String,
//       optional: true,
//     },
//     reason: {
//       /**
//        * the reason why impersonated, like exportJSON
//        */
//       type: String,
//       optional: true,
//     },
//     createdAt: {
//       /**
//        * creation date of the impersonation
//        */
//       type: Date,
//       // eslint-disable-next-line consistent-return
//       autoValue() {
//         if (this.isInsert) {
//           return new Date();
//         } else if (this.isUpsert) {
//           return {
//             $setOnInsert: new Date(),
//           };
//         } else {
//           this.unset();
//         }
//       },
//     },
//     modifiedAt: {
//       /**
//        * modified date of the impersonation
//        */
//       type: String,
//       optional: true,
//     },
//   }),
// );

export default ImpersonatedUsers;
