import { Session } from 'meteor/session';
import { ReactiveCache } from '/imports/reactiveCache';

/**
 * Utils module providing common utility functions for the WeKan application
 */
export const Utils = {
  /**
   * Check if the current screen is a mini screen
   * @returns {boolean} True if mini screen
   */
  isMiniScreen() {
    return window.innerWidth < 768;
  },

  /**
   * Get the current board from session
   * @returns {Object|null} Current board object or null
   */
  getCurrentBoard() {
    return Session.get('currentBoard');
  },

  /**
   * Get the current card from session
   * @returns {Object|null} Current card object or null
   */
  getCurrentCard() {
    return Session.get('currentCard');
  },

  /**
   * Get the current list from session
   * @returns {Object|null} Current list object or null
   */
  getCurrentList() {
    return Session.get('currentList');
  },

  /**
   * Navigate to a specific board
   * @param {string} boardId - Board ID to navigate to
   */
  goBoardId(boardId) {
    Session.set('currentBoard', boardId);
    Session.set('currentList', null);
    Session.set('currentCard', null);
  },

  /**
   * Navigate to a specific card
   * @param {string} cardId - Card ID to navigate to
   */
  goCardId(cardId) {
    Session.set('currentCard', cardId);
  },

  /**
   * Show copied notification
   * @param {Promise} promise - Promise to handle
   * @param {string} tooltip - Tooltip text
   */
  showCopied(promise, tooltip) {
    // TODO: Implement copy notification
    console.log('Copy notification:', tooltip);
  },

  /**
   * Calculate index data for sorting
   * @param {Object} prevItem - Previous item
   * @param {Object} nextItem - Next item
   * @returns {Object} Index data with base property
   */
  calculateIndexData(prevItem, nextItem) {
    let base = 0;
    
    if (prevItem && nextItem) {
      base = (prevItem.sort + nextItem.sort) / 2;
    } else if (prevItem) {
      base = prevItem.sort + 1;
    } else if (nextItem) {
      base = nextItem.sort - 1;
    } else {
      base = 0;
    }
    
    return { base };
  },

  /**
   * Get common attachment metadata from a card
   * @param {Object} card - Card object
   * @returns {Object} Attachment metadata
   */
  getCommonAttachmentMetaFrom(card) {
    return {
      cardId: card._id,
      boardId: card.boardId,
      listId: card.listId,
      swimlaneId: card.swimlaneId
    };
  },

  /**
   * Format moment date
   * @param {Date|string} date - Date to format
   * @param {string} format - Format string
   * @returns {string} Formatted date string
   */
  moment(date, format) {
    // TODO: Implement proper moment formatting
    if (!date) return '';
    
    try {
      const d = new Date(date);
      if (format === 'LLL') {
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
      }
      return d.toLocaleDateString();
    } catch (e) {
      return String(date);
    }
  },

  /**
   * Manage custom UI elements
   */
  manageCustomUI() {
    // TODO: Implement custom UI management
    console.log('Managing custom UI');
  },

  /**
   * Manage Matomo analytics
   */
  manageMatomo() {
    // TODO: Implement Matomo management
    console.log('Managing Matomo');
  }
};
