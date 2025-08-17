import { Meteor } from 'meteor/meteor';

// Import server methods
import './methods/auth';

// Temporarily comment out publications to resolve ReactiveCache issues
// We'll address this in a separate step

Meteor.startup(() => {
  console.log('WeKan server started successfully');
});
