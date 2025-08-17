import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { ReactiveCache } from '/imports/reactiveCache';
import { Session } from 'meteor/session';
import { Random } from 'meteor/random';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * SidebarCustomFields Component
 * 
 * Replaces the original Blaze sidebarCustomFields component with a React component.
 * This component manages custom fields in the sidebar, including:
 * - Custom field display and management
 * - Field creation and editing
 * - Field type configuration
 * - Field settings and options
 * - Board-specific custom fields
 * 
 * Original Blaze component had:
 * - customFieldsSidebar: Main custom fields sidebar
 * - CreateCustomFieldPopup: Field creation interface
 * - EditCustomFieldPopup: Field editing interface
 * - Field type management and settings
 */
const SidebarCustomFields = ({ onClose, onFieldUpdate }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentUser, currentBoard, customFields, isBoardAdmin } = useTracker(() => {
    const user = ReactiveCache.getCurrentUser();
    if (!user) return { 
      currentUser: null, 
      currentBoard: null, 
      customFields: [], 
      isBoardAdmin: false 
    };

    const boardId = Session.get('currentBoard');
    const board = boardId ? ReactiveCache.getBoard(boardId) : null;
    const adminStatus = board ? board.hasAdmin(user._id) : false;
    
    const fields = ReactiveCache.getCustomFields({
      boardIds: { $in: [boardId] },
    });

    return {
      currentUser: user,
      currentBoard: board,
      customFields: fields,
      isBoardAdmin: adminStatus,
    };
  }, []);

  // Handle create custom field
  const handleCreateField = useCallback(() => {
    setEditingField(null);
    setIsCreateOpen(true);
  }, []);

  // Handle edit custom field
  const handleEditField = useCallback((field) => {
    setEditingField(field);
    setIsEditOpen(true);
  }, []);

  // Handle close forms
  const handleCloseForms = useCallback(() => {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setEditingField(null);
  }, []);

  // Handle field update
  const handleFieldUpdate = useCallback(() => {
    if (onFieldUpdate) {
      onFieldUpdate();
    }
    handleCloseForms();
  }, [onFieldUpdate, handleCloseForms]);

  // Render custom field item
  const renderCustomField = (field) => {
    const getFieldTypeIcon = (type) => {
      const iconMap = {
        text: 'fa-font',
        number: 'fa-hashtag',
        date: 'fa-calendar',
        dropdown: 'fa-list',
        currency: 'fa-money',
        checkbox: 'fa-check-square-o',
        stringtemplate: 'fa-code',
      };
      
      return iconMap[type] || 'fa-tag';
    };

    const getFieldTypeLabel = (type) => {
      return t(`custom-field-${type}`) || type;
    };

    return (
      <div key={field._id} className="custom-field-item">
        <div className="field-info">
          <div className="field-icon">
            <i className={`fa ${getFieldTypeIcon(field.type)}`}></i>
          </div>
          
          <div className="field-details">
            <div className="field-name">{field.name}</div>
            <div className="field-type">{getFieldTypeLabel(field.type)}</div>
            
            {field.settings && (
              <div className="field-settings">
                {field.type === 'currency' && field.settings.currencyCode && (
                  <span className="setting-item">
                    {field.settings.currencyCode}
                  </span>
                )}
                {field.type === 'dropdown' && field.settings.dropdownItems && (
                  <span className="setting-item">
                    {field.settings.dropdownItems.length} {t('options')}
                  </span>
                )}
                {field.type === 'stringtemplate' && field.settings.stringtemplateFormat && (
                  <span className="setting-item">
                    {t('template')}: {field.settings.stringtemplateFormat}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="field-actions">
          <button 
            className="btn btn-sm btn-primary js-edit-custom-field"
            onClick={() => handleEditField(field)}
            title={t('edit-field')}
          >
            <i className="fa fa-pencil"></i>
          </button>
          
          {isBoardAdmin && (
            <button 
              className="btn btn-sm btn-danger js-delete-custom-field"
              onClick={() => handleDeleteField(field)}
              title={t('delete-field')}
            >
              <i className="fa fa-trash"></i>
            </button>
          )}
        </div>
      </div>
    );
  };

  // Handle delete custom field
  const handleDeleteField = useCallback(async (field) => {
    if (!confirm(t('confirm-delete-custom-field'))) return;

    try {
      const customField = ReactiveCache.getCustomField(field._id);
      if (customField.boardIds.length > 1) {
        await Meteor.call('customFields.update', customField._id, {
          $pull: {
            boardIds: Session.get('currentBoard'),
          },
        });
      } else {
        await Meteor.call('customFields.remove', customField._id);
      }
      
      handleFieldUpdate();
    } catch (error) {
      console.error('Error deleting custom field:', error);
    }
  }, [handleFieldUpdate, t]);

  if (!currentBoard) {
    return (
      <div className="sidebar-custom-fields no-board">
        <div className="no-board-message">
          <i className="fa fa-exclamation-triangle"></i>
          <p>{t('no-board-selected')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar-custom-fields js-sidebar-custom-fields">
      <div className="custom-fields-header">
        <h3>
          <i className="fa fa-tags"></i>
          {t('custom-fields')} ({customFields.length})
        </h3>
        
        <div className="custom-fields-actions">
          {isBoardAdmin && (
            <button 
              className="btn btn-sm btn-primary js-open-create-custom-field"
              onClick={handleCreateField}
            >
              <i className="fa fa-plus"></i>
              {t('add-custom-field')}
            </button>
          )}
          
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
      
      <div className="custom-fields-content">
        {customFields.length > 0 ? (
          <div className="custom-fields-list">
            {customFields.map(renderCustomField)}
          </div>
        ) : (
          <div className="no-custom-fields">
            <p>{t('no-custom-fields')}</p>
            {isBoardAdmin && (
              <button 
                className="btn btn-primary"
                onClick={handleCreateField}
              >
                <i className="fa fa-plus"></i>
                {t('create-first-custom-field')}
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Custom Field Forms */}
      {(isCreateOpen || isEditOpen) && (
        <CustomFieldForm
          field={editingField}
          isEdit={isEditOpen}
          onClose={handleCloseForms}
          onSave={handleFieldUpdate}
          boardId={currentBoard._id}
        />
      )}
      
      <div className="custom-fields-footer">
        <p className="note">
          <i className="fa fa-info-circle"></i>
          {t('custom-fields-note')}
        </p>
      </div>
    </div>
  );
};

/**
 * CustomFieldForm Component
 * 
 * Form component for creating and editing custom fields
 */
const CustomFieldForm = ({ field, isEdit, onClose, onSave, boardId }) => {
  const [formData, setFormData] = useState({
    name: field?.name || '',
    type: field?.type || 'text',
    settings: field?.settings || {},
    showOnCard: field?.showOnCard || false,
    showLabelOnMiniCard: field?.showLabelOnMiniCard || false,
    automaticallyOnCard: field?.automaticallyOnCard || false,
    alwaysOnCard: field?.alwaysOnCard || false,
    showSumAtTopOfList: field?.showSumAtTopOfList || false,
  });

  const [dropdownItems, setDropdownItems] = useState(
    field?.settings?.dropdownItems || []
  );
  const [newDropdownItem, setNewDropdownItem] = useState('');

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Field types configuration
  const fieldTypes = [
    'text',
    'number',
    'date',
    'dropdown',
    'currency',
    'checkbox',
    'stringtemplate',
  ];

  // Currency list
  const currencyList = [
    { name: 'US Dollar', code: 'USD' },
    { name: 'Euro', code: 'EUR' },
    { name: 'Yen', code: 'JPY' },
    { name: 'Pound Sterling', code: 'GBP' },
    { name: 'Australian Dollar', code: 'AUD' },
    { name: 'Canadian Dollar', code: 'CAD' },
    { name: 'Swiss Franc', code: 'CHF' },
    { name: 'Yuan Renminbi', code: 'CNY' },
    { name: 'Hong Kong Dollar', code: 'HKD' },
    { name: 'New Zealand Dollar', code: 'NZD' },
  ];

  // Handle form input changes
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handle settings changes
  const handleSettingsChange = useCallback((key, value) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }));
  }, []);

  // Handle dropdown item addition
  const handleAddDropdownItem = useCallback(() => {
    if (newDropdownItem.trim()) {
      const newItem = {
        _id: Random.id(6),
        name: newDropdownItem.trim()
      };
      setDropdownItems(prev => [...prev, newItem]);
      setNewDropdownItem('');
    }
  }, [newDropdownItem]);

  // Handle dropdown item removal
  const handleRemoveDropdownItem = useCallback((itemId) => {
    setDropdownItems(prev => prev.filter(item => item._id !== itemId));
  }, []);

  // Handle dropdown item name change
  const handleDropdownItemChange = useCallback((itemId, newName) => {
    setDropdownItems(prev => 
      prev.map(item => 
        item._id === itemId ? { ...item, name: newName } : item
      )
    );
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    
    if (!formData.name.trim()) return;

    try {
      // Prepare settings based on field type
      let settings = {};
      
      switch (formData.type) {
        case 'currency':
          settings.currencyCode = formData.settings.currencyCode || currencyList[0].code;
          break;
        case 'dropdown':
          settings.dropdownItems = dropdownItems.filter(item => item.name.trim());
          break;
        case 'stringtemplate':
          settings.stringtemplateFormat = formData.settings.stringtemplateFormat || '';
          settings.stringtemplateSeparator = formData.settings.stringtemplateSeparator || '';
          break;
      }

      const data = {
        name: formData.name.trim(),
        type: formData.type,
        settings,
        showOnCard: formData.showOnCard,
        showLabelOnMiniCard: formData.showLabelOnMiniCard,
        automaticallyOnCard: formData.automaticallyOnCard,
        alwaysOnCard: formData.alwaysOnCard,
        showSumAtTopOfList: formData.showSumAtTopOfList,
      };

      if (isEdit && field) {
        await Meteor.call('customFields.update', field._id, { $set: data });
      } else {
        data.boardIds = [boardId];
        await Meteor.call('customFields.insert', data);
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving custom field:', error);
    }
  }, [formData, dropdownItems, isEdit, field, boardId, onSave, currencyList]);

  // Render field type specific settings
  const renderFieldSettings = () => {
    switch (formData.type) {
      case 'currency':
        return (
          <div className="form-group">
            <label htmlFor="currencyCode">{t('currency-code')}</label>
            <select
              id="currencyCode"
              className="form-control js-field-currency"
              value={formData.settings.currencyCode || currencyList[0].code}
              onChange={(e) => handleSettingsChange('currencyCode', e.target.value)}
            >
              {currencyList.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
        );

      case 'dropdown':
        return (
          <div className="form-group">
            <label>{t('dropdown-options')}</label>
            <div className="dropdown-items">
              {dropdownItems.map(item => (
                <div key={item._id} className="dropdown-item">
                  <input
                    type="text"
                    className="form-control"
                    value={item.name}
                    onChange={(e) => handleDropdownItemChange(item._id, e.target.value)}
                    placeholder={t('option-name')}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => handleRemoveDropdownItem(item._id)}
                    title={t('remove-option')}
                  >
                    <i className="fa fa-times"></i>
                  </button>
                </div>
              ))}
              <div className="add-dropdown-item">
                <input
                  type="text"
                  className="form-control js-dropdown-item last"
                  value={newDropdownItem}
                  onChange={(e) => setNewDropdownItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddDropdownItem()}
                  placeholder={t('add-new-option')}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={handleAddDropdownItem}
                >
                  <i className="fa fa-plus"></i>
                </button>
              </div>
            </div>
          </div>
        );

      case 'stringtemplate':
        return (
          <>
            <div className="form-group">
              <label htmlFor="stringtemplateFormat">{t('template-format')}</label>
              <input
                id="stringtemplateFormat"
                type="text"
                className="form-control js-field-stringtemplate-format"
                value={formData.settings.stringtemplateFormat || ''}
                onChange={(e) => handleSettingsChange('stringtemplateFormat', e.target.value)}
                placeholder={t('template-format-placeholder')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="stringtemplateSeparator">{t('template-separator')}</label>
              <input
                id="stringtemplateSeparator"
                type="text"
                className="form-control js-field-stringtemplate-separator"
                value={formData.settings.stringtemplateSeparator || ''}
                onChange={(e) => handleSettingsChange('stringtemplateSeparator', e.target.value)}
                placeholder={t('template-separator-placeholder')}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="custom-field-form-overlay">
      <div className="custom-field-form">
        <div className="form-header">
          <h3>
            {isEdit ? t('edit-custom-field') : t('create-custom-field')}
          </h3>
          <button 
            className="btn btn-sm btn-close"
            onClick={onClose}
            title={t('close')}
          >
            <i className="fa fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fieldName">{t('field-name')}</label>
            <input
              id="fieldName"
              type="text"
              className="form-control js-field-name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={t('field-name-placeholder')}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="fieldType">{t('field-type')}</label>
            <select
              id="fieldType"
              className="form-control js-field-type"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
            >
              {fieldTypes.map(type => (
                <option key={type} value={type}>
                  {t(`custom-field-${type}`)}
                </option>
              ))}
            </select>
          </div>
          
          {renderFieldSettings()}
          
          <div className="form-group">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={formData.showOnCard}
                onChange={(e) => handleInputChange('showOnCard', e.target.checked)}
              />
              <span className="checkbox-label">{t('show-on-card')}</span>
            </label>
          </div>
          
          <div className="form-group">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={formData.showLabelOnMiniCard}
                onChange={(e) => handleInputChange('showLabelOnMiniCard', e.target.checked)}
              />
              <span className="checkbox-label">{t('show-label-on-mini-card')}</span>
            </label>
          </div>
          
          <div className="form-group">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={formData.automaticallyOnCard}
                onChange={(e) => handleInputChange('automaticallyOnCard', e.target.checked)}
              />
              <span className="checkbox-label">{t('automatically-on-card')}</span>
            </label>
          </div>
          
          <div className="form-group">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={formData.alwaysOnCard}
                onChange={(e) => handleInputChange('alwaysOnCard', e.target.checked)}
              />
              <span className="checkbox-label">{t('always-on-card')}</span>
            </label>
          </div>
          
          <div className="form-group">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={formData.showSumAtTopOfList}
                onChange={(e) => handleInputChange('showSumAtTopOfList', e.target.checked)}
              />
              <span className="checkbox-label">{t('show-sum-at-top-of-list')}</span>
            </label>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary primary"
              disabled={!formData.name.trim()}
            >
              {isEdit ? t('update') : t('create')}
            </button>
            
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onClose}
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SidebarCustomFields;
