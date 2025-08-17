// Client-side models entry point
// This file imports all the necessary collections to make them available globally

// Import all model files to ensure global collections are available
import '/models/users.js';
// import '/models/boards.js'; // Temporarily commented out due to helper conversion issues
// Temporarily commented out other models to resolve syntax errors
// import '/models/lists.js';
// import '/models/cards.js';
// import '/models/team.js';
// import '/models/org.js';
import '/models/announcements.js';
// import '/models/settings.js';
// import '/models/activities.js';
// import '/models/attachments.js';
// import '/models/checklists.js';
// import '/models/cardComments.js';
// import '/models/swimlanes.js';
// import '/models/customFields.js';
// import '/models/integrations.js';
// import '/models/rules.js';
// import '/models/triggers.js';
// import '/models/actions.js';
// import '/models/accessibilitySettings.js';
// import '/models/accountSettings.js';
// import '/models/translation.js';
// import '/models/avatars.js';
// import '/models/cardCommentReactions.js';
// import '/models/checklistItems.js';
// import '/models/counters.js';
// import '/models/export.js';
// import '/models/exportPDF.js';
// import '/models/exportExcel.js';
// import '/models/exporter.js';
// import '/models/fileValidation.js';
// import '/models/impersonatedUsers.js';
// import '/models/invitationCodes.js';
// import '/models/orgUser.js';
// import '/models/tableVisibilityModeSettings.js';
// import '/models/trelloCreator.js';
// import '/models/unsavedEdits.js';
// import '/models/usersessiondata.js';
// import '/models/wekanCreator.js';
// import '/models/csvCreator.js';
// import '/models/wekanmapper.js';
// import '/models/import.js';
// import '/models/runOnServer.js';
// import '/models/watchable.js';

// Export the global collections for explicit imports if needed
export { 
  Users, Announcements
  // Temporarily commented out other collections to resolve syntax errors
  // Boards, Teams, Organizations, Lists, Cards, Settings, Activities, Attachments, Checklists, CardComments, Swimlanes, CustomFields, Integrations, Rules, Triggers, Actions, AccessibilitySettings, AccountSettings, Translation,
  // Avatars, CardCommentReactions, ChecklistItems, Counters, Export, ExportPDF, ExportExcel, Exporter, FileValidation, ImpersonatedUsers, InvitationCodes, OrgUser, TableVisibilityModeSettings, TrelloCreator, UnsavedEdits, UserSessionData, WekanCreator, CsvCreator, WekanMapper, Import, RunOnServer, Watchable
};
