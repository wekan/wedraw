import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { ReactiveCache } from '/imports/reactiveCache';
import { Session } from 'meteor/session';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * SidebarFilters Component
 * 
 * Replaces the original Blaze sidebarFilters component with a React component.
 * This component manages board filtering in the sidebar, including:
 * - List filtering
 * - Card title filtering
 * - Label filtering
 * - Member filtering
 * - Due date filtering
 * - Archive filtering
 * - Custom field filtering
 * - Advanced filtering
 * - Multi-selection operations
 * 
 * Original Blaze component had:
 * - filterSidebar: Main filter sidebar
 * - multiselectionSidebar: Multi-selection operations
 * - Various filter toggle functions
 * - Multi-selection mutations
 */
const SidebarFilters = ({ onClose, onFilterUpdate }) => {
  const [listFilter, setListFilter] = useState('');
  const [titleFilter, setTitleFilter] = useState('');
  const [advancedFilter, setAdvancedFilter] = useState('');
  const [isArchiveFiltered, setIsArchiveFiltered] = useState(false);
  const [hideEmpty, setHideEmpty] = useState(false);
  const [customFieldsFiltered, setCustomFieldsFiltered] = useState(false);

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentUser, currentBoard, labels, members, isBoardAdmin, isCommentOnly } = useTracker(() => {
    const user = ReactiveCache.getCurrentUser();
    if (!user) return { 
      currentUser: null, 
      currentBoard: null, 
      labels: [], 
      members: [], 
      isBoardAdmin: false, 
      isCommentOnly: false 
    };

    const boardId = Session.get('currentBoard');
    const board = boardId ? ReactiveCache.getBoard(boardId) : null;
    const adminStatus = board ? board.hasAdmin(user._id) : false;
    const commentOnlyStatus = user.isCommentOnly();
    
    const boardLabels = board ? ReactiveCache.getLabels({ boardId }) : [];
    const boardMembers = board ? ReactiveCache.getBoardMembers({ boardId }) : [];

    return {
      currentUser: user,
      currentBoard: board,
      labels: boardLabels,
      members: boardMembers,
      isBoardAdmin: adminStatus,
      isCommentOnly: commentOnlyStatus,
    };
  }, []);

  // Apply list filter
  const handleListFilter = useCallback((event) => {
    event.preventDefault();
    if (typeof Filter !== 'undefined' && Filter.lists) {
      Filter.lists.set(listFilter.trim());
      if (onFilterUpdate) onFilterUpdate();
    }
  }, [listFilter, onFilterUpdate]);

  // Apply title filter
  const handleTitleFilter = useCallback((value) => {
    setTitleFilter(value);
    if (typeof Filter !== 'undefined' && Filter.title) {
      Filter.title.set(value.trim());
      Filter.resetExceptions();
      if (onFilterUpdate) onFilterUpdate();
    }
  }, [onFilterUpdate]);

  // Toggle label filter
  const handleToggleLabelFilter = useCallback((labelId) => {
    if (typeof Filter !== 'undefined' && Filter.labelIds) {
      Filter.labelIds.toggle(labelId);
      Filter.resetExceptions();
      if (onFilterUpdate) onFilterUpdate();
    }
  }, [onFilterUpdate]);

  // Toggle member filter
  const handleToggleMemberFilter = useCallback((memberId) => {
    if (typeof Filter !== 'undefined' && Filter.members) {
      Filter.members.toggle(memberId);
      Filter.resetExceptions();
      if (onFilterUpdate) onFilterUpdate();
    }
  }, [onFilterUpdate]);

  // Toggle assignee filter
  const handleToggleAssigneeFilter = useCallback((memberId) => {
    if (typeof Filter !== 'undefined' && Filter.assignees) {
      Filter.assignees.toggle(memberId);
      Filter.resetExceptions();
      if (onFilterUpdate) onFilterUpdate();
    }
  }, [onFilterUpdate]);

  // Toggle due date filters
  const handleToggleDueDateFilter = useCallback((filterType) => {
    if (typeof Filter !== 'undefined' && Filter.dueAt) {
      switch (filterType) {
        case 'noDate':
          Filter.dueAt.noDate();
          break;
        case 'past':
          Filter.dueAt.past();
          break;
        case 'today':
          Filter.dueAt.today();
          break;
        case 'tomorrow':
          Filter.dueAt.tomorrow();
          break;
        case 'thisWeek':
          Filter.dueAt.thisWeek();
          break;
        case 'nextWeek':
          Filter.dueAt.nextWeek();
          break;
        default:
          break;
      }
      Filter.resetExceptions();
      if (onFilterUpdate) onFilterUpdate();
    }
  }, [onFilterUpdate]);

  // Toggle archive filter
  const handleToggleArchiveFilter = useCallback(() => {
    setIsArchiveFiltered(!isArchiveFiltered);
    if (typeof Filter !== 'undefined' && Filter.archive) {
      Filter.archive.toggle();
      Filter.resetExceptions();
      
      // Subscribe to board with archive filter
      const currentBoardId = Session.get('currentBoard');
      if (currentBoardId && typeof subManager !== 'undefined') {
        subManager.subscribe('board', currentBoardId, !isArchiveFiltered);
      }
      
      if (onFilterUpdate) onFilterUpdate();
    }
  }, [isArchiveFiltered, onFilterUpdate]);

  // Toggle hide empty filter
  const handleToggleHideEmptyFilter = useCallback(() => {
    setHideEmpty(!hideEmpty);
    if (typeof Filter !== 'undefined' && Filter.hideEmpty) {
      Filter.hideEmpty.toggle();
      Filter.resetExceptions();
      if (onFilterUpdate) onFilterUpdate();
    }
  }, [hideEmpty, onFilterUpdate]);

  // Toggle custom fields filter
  const handleToggleCustomFieldsFilter = useCallback(() => {
    setCustomFieldsFiltered(!customFieldsFiltered);
    if (typeof Filter !== 'undefined' && Filter.customFields) {
      Filter.customFields.toggle();
      Filter.resetExceptions();
      if (onFilterUpdate) onFilterUpdate();
    }
  }, [customFieldsFiltered, onFilterUpdate]);

  // Apply advanced filter
  const handleAdvancedFilter = useCallback((value) => {
    setAdvancedFilter(value);
    if (typeof Filter !== 'undefined' && Filter.advanced) {
      Filter.advanced.set(value.trim());
      Filter.resetExceptions();
      if (onFilterUpdate) onFilterUpdate();
    }
  }, [onFilterUpdate]);

  // Clear all filters
  const handleClearAllFilters = useCallback(() => {
    if (typeof Filter !== 'undefined') {
      Filter.reset();
      setListFilter('');
      setTitleFilter('');
      setAdvancedFilter('');
      setIsArchiveFiltered(false);
      setHideEmpty(false);
      setCustomFieldsFiltered(false);
      if (onFilterUpdate) onFilterUpdate();
    }
  }, [onFilterUpdate]);

  // Filter to selection
  const handleFilterToSelection = useCallback(() => {
    if (typeof Filter !== 'undefined' && typeof MultiSelection !== 'undefined') {
      const selectedCards = ReactiveCache.getCards(Filter.mongoSelector()).map(c => c._id);
      MultiSelection.add(selectedCards);
    }
  }, []);

  // Check if label is filtered
  const isLabelFiltered = useCallback((labelId) => {
    if (typeof Filter !== 'undefined' && Filter.labelIds) {
      return Filter.labelIds.isSelected(labelId);
    }
    return false;
  }, []);

  // Check if member is filtered
  const isMemberFiltered = useCallback((memberId) => {
    if (typeof Filter !== 'undefined' && Filter.members) {
      return Filter.members.isSelected(memberId);
    }
    return false;
  }, []);

  // Check if assignee is filtered
  const isAssigneeFiltered = useCallback((memberId) => {
    if (typeof Filter !== 'undefined' && Filter.assignees) {
      return Filter.assignees.isSelected(memberId);
    }
    return false;
  }, []);

  if (!currentBoard) {
    return (
      <div className="sidebar-filters no-board">
        <div className="no-board-message">
          <i className="fa fa-exclamation-triangle"></i>
          <p>{t('no-board-selected')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar-filters js-sidebar-filters">
      <div className="filters-header">
        <h3>
          <i className="fa fa-filter"></i>
          {t('filters')}
        </h3>
        
        <div className="filters-actions">
          <button 
            className="btn btn-sm btn-secondary js-clear-all"
            onClick={handleClearAllFilters}
            title={t('clear-all-filters')}
          >
            <i className="fa fa-times"></i>
            {t('clear-all')}
          </button>
          
          {onClose && (
            <button 
              className="btn btn-sm btn-close"
              onClick={onClose}
              title={t('close')}
            >
              <i className="fa fa-times"></i>
            </button>
          )}
        </div>
      </div>
      
      <div className="filters-content">
        {/* List Filter */}
        <div className="filter-section">
          <h4>{t('list-filter')}</h4>
          <form onSubmit={handleListFilter} className="js-list-filter">
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                value={listFilter}
                onChange={(e) => setListFilter(e.target.value)}
                placeholder={t('filter-by-list')}
              />
            </div>
          </form>
        </div>

        {/* Title Filter */}
        <div className="filter-section">
          <h4>{t('title-filter')}</h4>
          <div className="form-group">
            <input
              type="text"
              className="form-control js-field-card-filter"
              value={titleFilter}
              onChange={(e) => handleTitleFilter(e.target.value)}
              placeholder={t('filter-by-title')}
            />
          </div>
        </div>

        {/* Label Filters */}
        {labels.length > 0 && (
          <div className="filter-section">
            <h4>{t('label-filters')}</h4>
            <div className="label-filters">
              {labels.map(label => (
                <button
                  key={label._id}
                  className={`filter-toggle js-toggle-label-filter ${isLabelFiltered(label._id) ? 'active' : ''}`}
                  onClick={() => handleToggleLabelFilter(label._id)}
                  title={label.name}
                >
                  <span 
                    className="label-color" 
                    style={{ backgroundColor: label.color }}
                  ></span>
                  <span className="label-name">{label.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Member Filters */}
        {members.length > 0 && (
          <div className="filter-section">
            <h4>{t('member-filters')}</h4>
            <div className="member-filters">
              {members.map(member => (
                <button
                  key={member._id}
                  className={`filter-toggle js-toggle-member-filter ${isMemberFiltered(member._id) ? 'active' : ''}`}
                  onClick={() => handleToggleMemberFilter(member._id)}
                  title={member.username}
                >
                  <i className="fa fa-user"></i>
                  <span className="member-name">{member.username}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Assignee Filters */}
        {members.length > 0 && (
          <div className="filter-section">
            <h4>{t('assignee-filters')}</h4>
            <div className="assignee-filters">
              {members.map(member => (
                <button
                  key={member._id}
                  className={`filter-toggle js-toggle-assignee-filter ${isAssigneeFiltered(member._id) ? 'active' : ''}`}
                  onClick={() => handleToggleAssigneeFilter(member._id)}
                  title={member.username}
                >
                  <i className="fa fa-user-check"></i>
                  <span className="member-name">{member.username}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Due Date Filters */}
        <div className="filter-section">
          <h4>{t('due-date-filters')}</h4>
          <div className="due-date-filters">
            <button
              className="filter-toggle js-toggle-no-due-date-filter"
              onClick={() => handleToggleDueDateFilter('noDate')}
            >
              <i className="fa fa-calendar-times-o"></i>
              {t('no-due-date')}
            </button>
            
            <button
              className="filter-toggle js-toggle-overdue-filter"
              onClick={() => handleToggleDueDateFilter('past')}
            >
              <i className="fa fa-exclamation-triangle"></i>
              {t('overdue')}
            </button>
            
            <button
              className="filter-toggle js-toggle-due-today-filter"
              onClick={() => handleToggleDueDateFilter('today')}
            >
              <i className="fa fa-calendar-check-o"></i>
              {t('due-today')}
            </button>
            
            <button
              className="filter-toggle js-toggle-due-tomorrow-filter"
              onClick={() => handleToggleDueDateFilter('tomorrow')}
            >
              <i className="fa fa-calendar-plus-o"></i>
              {t('due-tomorrow')}
            </button>
            
            <button
              className="filter-toggle js-toggle-due-this-week-filter"
              onClick={() => handleToggleDueDateFilter('thisWeek')}
            >
              <i className="fa fa-calendar-o"></i>
              {t('due-this-week')}
            </button>
            
            <button
              className="filter-toggle js-toggle-due-next-week-filter"
              onClick={() => handleToggleDueDateFilter('nextWeek')}
            >
              <i className="fa fa-calendar-o"></i>
              {t('due-next-week')}
            </button>
          </div>
        </div>

        {/* Other Filters */}
        <div className="filter-section">
          <h4>{t('other-filters')}</h4>
          <div className="other-filters">
            <button
              className={`filter-toggle js-toggle-archive-filter ${isArchiveFiltered ? 'active' : ''}`}
              onClick={handleToggleArchiveFilter}
            >
              <i className="fa fa-archive"></i>
              {t('archived-items')}
            </button>
            
            <button
              className={`filter-toggle js-toggle-hideEmpty-filter ${hideEmpty ? 'active' : ''}`}
              onClick={handleToggleHideEmptyFilter}
            >
              <i className="fa fa-eye-slash"></i>
              {t('hide-empty-lists')}
            </button>
            
            <button
              className={`filter-toggle js-toggle-custom-fields-filter ${customFieldsFiltered ? 'active' : ''}`}
              onClick={handleToggleCustomFieldsFilter}
            >
              <i className="fa fa-tags"></i>
              {t('custom-fields')}
            </button>
          </div>
        </div>

        {/* Advanced Filter */}
        <div className="filter-section">
          <h4>{t('advanced-filter')}</h4>
          <div className="form-group">
            <input
              type="text"
              className="form-control js-field-advanced-filter"
              value={advancedFilter}
              onChange={(e) => handleAdvancedFilter(e.target.value)}
              placeholder={t('advanced-filter-placeholder')}
            />
          </div>
        </div>

        {/* Filter Actions */}
        <div className="filter-actions">
          <button
            className="btn btn-primary js-filter-to-selection"
            onClick={handleFilterToSelection}
            title={t('filter-to-selection')}
          >
            <i className="fa fa-check-square-o"></i>
            {t('filter-to-selection')}
          </button>
        </div>
      </div>
      
      <div className="filters-footer">
        <p className="note">
          <i className="fa fa-info-circle"></i>
          {t('filters-note')}
        </p>
      </div>
    </div>
  );
};

export default SidebarFilters;
