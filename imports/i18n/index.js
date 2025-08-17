import { TAPi18n } from './tap';
import './moment';

// Removed accounts import since we're not using useraccounts anymore
// Removed Blaze import since we're using React

export { TAPi18n };

// Initialize TAPi18n immediately and handle errors
(async () => {
  try {
    await TAPi18n.init();
    console.log('TAPi18n initialized successfully');
  } catch (error) {
    console.error('Failed to initialize TAPi18n:', error);
    // Fallback to ensure basic functionality
    TAPi18n.current.set('en');
    TAPi18n.currentRTL.set(false);
  }
})();

