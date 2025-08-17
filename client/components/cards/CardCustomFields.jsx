import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import moment from 'moment/min/moment-with-locales';
import { DatePicker } from '/client/lib/datepicker';
import { CustomFieldStringTemplate } from '/client/lib/customFields';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * CardCustomFields Component
 * 
 * Replaces the original Blaze cardCustomFields component with a React component.
 * This component manages custom fields on cards, including:
 * - Text custom fields
 * - Number custom fields
 * - Checkbox custom fields
 * - Currency custom fields
 * - Date custom fields
 * - Dropdown custom fields
 * - String template custom fields
 * 
 * Original Blaze component had:
 * - cardCustomField: Base custom field component
 * - Various type-specific implementations
 * - Date picker integration
 * - String template handling
 */
const CardCustomFields = ({ card, customField, onUpdate, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(customField?.value || '');
  const [error, setError] = useState('');

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentUser, customFieldDefinition } = useTracker(() => {
    const user = ReactiveCache.getCurrentUser();
    if (!user || !customField) return { currentUser: null, customFieldDefinition: null };

    const definition = ReactiveCache.getCustomField(customField._id);
    
    return {
      currentUser: user,
      customFieldDefinition: definition,
    };
  }, [customField]);

  // Update local value when customField changes
  useEffect(() => {
    setValue(customField?.value || '');
  }, [customField]);

  // Handle custom field update
  const handleUpdate = useCallback(async (newValue) => {
    try {
      if (onUpdate) {
        await onUpdate(customField._id, newValue);
      } else {
        await Meteor.call('cards.update', card._id, {
          $set: {
            [`customFields.${customField._id}`]: newValue,
          },
        });
      }
      setIsEditing(false);
      setError('');
    } catch (err) {
      console.error('Error updating custom field:', err);
      setError(err.message);
    }
  }, [customField, card, onUpdate]);

  // Handle settings click
  const handleSettings = useCallback(() => {
    if (onClose) onClose();
    // TODO: Navigate to custom fields settings
    // Sidebar.setView('customFields');
  }, [onClose]);

  if (!customField || !customFieldDefinition) {
    return (
      <div className="card-custom-field loading">
        <div className="loading-spinner">
          <i className="fa fa-spinner fa-spin"></i>
        </div>
      </div>
    );
  }

  // Render based on custom field type
  switch (customFieldDefinition.type) {
    case 'text':
      return (
        <TextCustomField
          customField={customField}
          definition={customFieldDefinition}
          value={value}
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onUpdate={handleUpdate}
          onCancel={() => setIsEditing(false)}
          onSettings={handleSettings}
        />
      );

    case 'number':
      return (
        <NumberCustomField
          customField={customField}
          definition={customFieldDefinition}
          value={value}
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onUpdate={handleUpdate}
          onCancel={() => setIsEditing(false)}
          onSettings={handleSettings}
        />
      );

    case 'checkbox':
      return (
        <CheckboxCustomField
          customField={customField}
          definition={customFieldDefinition}
          value={value}
          onUpdate={handleUpdate}
          onSettings={handleSettings}
        />
      );

    case 'currency':
      return (
        <CurrencyCustomField
          customField={customField}
          definition={customFieldDefinition}
          value={value}
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onUpdate={handleUpdate}
          onCancel={() => setIsEditing(false)}
          onSettings={handleSettings}
        />
      );

    case 'date':
      return (
        <DateCustomField
          customField={customField}
          definition={customFieldDefinition}
          value={value}
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onUpdate={handleUpdate}
          onCancel={() => setIsEditing(false)}
          onSettings={handleSettings}
        />
      );

    case 'dropdown':
      return (
        <DropdownCustomField
          customField={customField}
          definition={customFieldDefinition}
          value={value}
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onUpdate={handleUpdate}
          onCancel={() => setIsEditing(false)}
          onSettings={handleSettings}
        />
      );

    case 'stringtemplate':
      return (
        <StringTemplateCustomField
          customField={customField}
          definition={customFieldDefinition}
          value={value}
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onUpdate={handleUpdate}
          onCancel={() => setIsEditing(false)}
          onSettings={handleSettings}
        />
      );

    default:
      return (
        <div className="card-custom-field unknown-type">
          <span className="field-label">{customFieldDefinition.name}</span>
          <span className="field-value">{t('unknown-field-type')}</span>
        </div>
      );
  }
};

/**
 * TextCustomField Component
 * 
 * Handles text custom fields
 */
const TextCustomField = ({ customField, definition, value, isEditing, onEdit, onUpdate, onCancel, onSettings }) => {
  const [inputValue, setInputValue] = useState(value);
  const t = (key) => enTranslations[key] || key;

  const handleSubmit = (event) => {
    event.preventDefault();
    onUpdate(inputValue);
  };

  if (isEditing) {
    return (
      <div className="card-custom-field text-field editing">
        <form onSubmit={handleSubmit} className="js-card-customfield-text">
          <div className="field-input-group">
            <input
              type="text"
              className="form-control"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={definition.name}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <i className="fa fa-check"></i>
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
              <i className="fa fa-times"></i>
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="card-custom-field text-field">
      <div className="field-header">
        <span className="field-label">{definition.name}</span>
        <div className="field-actions">
          <button className="btn btn-sm btn-link js-select-field" onClick={onEdit}>
            <i className="fa fa-pencil"></i>
          </button>
          <button className="btn btn-sm btn-link js-settings" onClick={onSettings}>
            <i className="fa fa-cog"></i>
          </button>
        </div>
      </div>
      <div className="field-value">{value || t('no-value')}</div>
    </div>
  );
};

/**
 * NumberCustomField Component
 * 
 * Handles number custom fields
 */
const NumberCustomField = ({ customField, definition, value, isEditing, onEdit, onUpdate, onCancel, onSettings }) => {
  const [inputValue, setInputValue] = useState(value);
  const t = (key) => enTranslations[key] || key;

  const handleSubmit = (event) => {
    event.preventDefault();
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue)) {
      onUpdate(numValue);
    }
  };

  if (isEditing) {
    return (
      <div className="card-custom-field number-field editing">
        <form onSubmit={handleSubmit} className="js-card-customfield-number">
          <div className="field-input-group">
            <input
              type="number"
              className="form-control"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={definition.name}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <i className="fa fa-check"></i>
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
              <i className="fa fa-times"></i>
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="card-custom-field number-field">
      <div className="field-header">
        <span className="field-label">{definition.name}</span>
        <div className="field-actions">
          <button className="btn btn-sm btn-link js-select-field" onClick={onEdit}>
            <i className="fa fa-pencil"></i>
          </button>
          <button className="btn btn-sm btn-link js-settings" onClick={onSettings}>
            <i className="fa fa-cog"></i>
          </button>
        </div>
      </div>
      <div className="field-value">{value || t('no-value')}</div>
    </div>
  );
};

/**
 * CheckboxCustomField Component
 * 
 * Handles checkbox custom fields
 */
const CheckboxCustomField = ({ customField, definition, value, onUpdate, onSettings }) => {
  const t = (key) => enTranslations[key] || key;

  const handleToggle = () => {
    onUpdate(!value);
  };

  return (
    <div className="card-custom-field checkbox-field">
      <div className="field-header">
        <span className="field-label">{definition.name}</span>
        <div className="field-actions">
          <button className="btn btn-sm btn-link js-settings" onClick={onSettings}>
            <i className="fa fa-cog"></i>
          </button>
        </div>
      </div>
      <div className="field-value">
        <div className="check-box-container js-checklist-item" onClick={handleToggle}>
          <i className={`fa ${value ? 'fa-check-square-o' : 'fa-square-o'}`}></i>
          <span className="checkbox-label">{value ? t('checked') : t('unchecked')}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * CurrencyCustomField Component
 * 
 * Handles currency custom fields
 */
const CurrencyCustomField = ({ customField, definition, value, isEditing, onEdit, onUpdate, onCancel, onSettings }) => {
  const [inputValue, setInputValue] = useState(value);
  const t = (key) => enTranslations[key] || key;

  const currencyCode = definition.settings?.currencyCode || 'USD';
  const locale = currentUser?.profile?.language || 'en';

  const formattedValue = () => {
    if (typeof value !== 'number') return t('no-value');
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    }).format(value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Replace comma with period for decimal input
    const numValue = Number(inputValue.replace(/,/i, '.'));
    if (!isNaN(numValue)) {
      onUpdate(numValue);
    }
  };

  if (isEditing) {
    return (
      <div className="card-custom-field currency-field editing">
        <form onSubmit={handleSubmit} className="js-card-customfield-currency">
          <div className="field-input-group">
            <input
              type="text"
              className="form-control"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={definition.name}
            />
            <span className="currency-code">{currencyCode}</span>
            <button type="submit" className="btn btn-primary btn-sm">
              <i className="fa fa-check"></i>
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
              <i className="fa fa-times"></i>
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="card-custom-field currency-field">
      <div className="field-header">
        <span className="field-label">{definition.name}</span>
        <div className="field-actions">
          <button className="btn btn-sm btn-link js-select-field" onClick={onEdit}>
            <i className="fa fa-pencil"></i>
          </button>
          <button className="btn btn-sm btn-link js-settings" onClick={onSettings}>
            <i className="fa fa-cog"></i>
          </button>
        </div>
      </div>
      <div className="field-value">{formattedValue()}</div>
    </div>
  );
};

/**
 * DateCustomField Component
 * 
 * Handles date custom fields
 */
const DateCustomField = ({ customField, definition, value, isEditing, onEdit, onUpdate, onCancel, onSettings }) => {
  const [currentDate, setCurrentDate] = useState(moment());
  const t = (key) => enTranslations[key] || key;

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(moment());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const date = value ? moment(value) : null;
  const showWeek = date ? date.week().toString() : '';
  const showWeekOfYear = currentUser?.isShowWeekOfYear();

  const showDate = () => {
    if (!date) return t('no-value');
    return date.calendar(null, {
      sameElse: 'llll',
    });
  };

  const showISODate = () => {
    return date ? date.toISOString() : '';
  };

  const getClasses = () => {
    if (!date) return '';
    if (date.isBefore(currentDate, 'minute') && currentDate.isBefore(value)) {
      return 'current';
    }
    return '';
  };

  const showTitle = () => {
    if (!date) return '';
    return `${t('card-start-on')} ${date.format('LLLL')}`;
  };

  const handleEditDate = () => {
    // TODO: Open date picker popup
    // Popup.open('cardCustomField-date');
  };

  return (
    <div className={`card-custom-field date-field ${getClasses()}`}>
      <div className="field-header">
        <span className="field-label">{definition.name}</span>
        <div className="field-actions">
          <button className="btn btn-sm btn-link js-edit-date" onClick={handleEditDate}>
            <i className="fa fa-calendar"></i>
          </button>
          <button className="btn btn-sm btn-link js-settings" onClick={onSettings}>
            <i className="fa fa-cog"></i>
          </button>
        </div>
      </div>
      <div className="field-value">
        {date && (
          <>
            <div className="date-display" title={showTitle()}>
              {showDate()}
            </div>
            {showWeekOfYear && (
              <div className="week-display">
                {t('week')} {showWeek}
              </div>
            )}
            <div className="iso-date">{showISODate()}</div>
          </>
        )}
        {!date && <span className="no-date">{t('no-date')}</span>}
      </div>
    </div>
  );
};

/**
 * DropdownCustomField Component
 * 
 * Handles dropdown custom fields
 */
const DropdownCustomField = ({ customField, definition, value, isEditing, onEdit, onUpdate, onCancel, onSettings }) => {
  const [selectedValue, setSelectedValue] = useState(value);
  const t = (key) => enTranslations[key] || key;

  const items = definition.settings?.dropdownItems || [];
  const allItems = [
    { _id: '', name: t('custom-field-dropdown-none') },
    ...items,
  ];

  const selectedItem = items.find(item => item._id === value);
  const selectedName = selectedItem ? selectedItem.name : t('custom-field-dropdown-unknown');

  const handleSubmit = (event) => {
    event.preventDefault();
    onUpdate(selectedValue);
  };

  if (isEditing) {
    return (
      <div className="card-custom-field dropdown-field editing">
        <form onSubmit={handleSubmit} className="js-card-customfield-dropdown">
          <div className="field-input-group">
            <select
              className="form-control"
              value={selectedValue}
              onChange={(e) => setSelectedValue(e.target.value)}
            >
              {allItems.map(item => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary btn-sm">
              <i className="fa fa-check"></i>
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
              <i className="fa fa-times"></i>
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="card-custom-field dropdown-field">
      <div className="field-header">
        <span className="field-label">{definition.name}</span>
        <div className="field-actions">
          <button className="btn btn-sm btn-link js-select-field" onClick={onEdit}>
            <i className="fa fa-pencil"></i>
          </button>
          <button className="btn btn-sm btn-link js-settings" onClick={onSettings}>
            <i className="fa fa-cog"></i>
          </button>
        </div>
      </div>
      <div className="field-value">{selectedName}</div>
    </div>
  );
};

/**
 * StringTemplateCustomField Component
 * 
 * Handles string template custom fields
 */
const StringTemplateCustomField = ({ customField, definition, value, isEditing, onEdit, onUpdate, onCancel, onSettings }) => {
  const [items, setItems] = useState(value || []);
  const [newItem, setNewItem] = useState('');
  const t = (key) => enTranslations[key] || key;

  const customFieldInstance = new CustomFieldStringTemplate(definition);
  const formattedValue = customFieldInstance.getFormattedValue(value);

  const handleSubmit = (event) => {
    event.preventDefault();
    const validItems = items.filter(item => !!item.trim());
    onUpdate(validItems);
  };

  const handleAddItem = () => {
    if (newItem.trim()) {
      setItems(prev => [...prev, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleRemoveItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (event.target.value.trim() || event.metaKey || event.ctrlKey) {
        if (event.target.value.trim()) {
          handleAddItem();
        }
        if (event.metaKey || event.ctrlKey) {
          handleSubmit(event);
        }
      }
    }
  };

  if (isEditing) {
    return (
      <div className="card-custom-field stringtemplate-field editing">
        <form onSubmit={handleSubmit} className="js-card-customfield-stringtemplate">
          <div className="field-header">
            <span className="field-label">{definition.name}</span>
            <div className="field-actions">
              <button type="submit" className="btn btn-primary btn-sm">
                <i className="fa fa-check"></i>
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
                <i className="fa fa-times"></i>
              </button>
            </div>
          </div>
          
          <div className="field-items">
            {items.map((item, index) => (
              <div key={index} className="item-row">
                <input
                  type="text"
                  className="form-control js-card-customfield-stringtemplate-item"
                  value={item}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index] = e.target.value;
                    setItems(newItems);
                  }}
                  onKeyDown={handleKeyDown}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => handleRemoveItem(index)}
                >
                  <i className="fa fa-times"></i>
                </button>
              </div>
            ))}
            
            <div className="add-item-row">
              <input
                type="text"
                className="form-control js-card-customfield-stringtemplate-item last"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('add-new-item')}
              />
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={handleAddItem}
              >
                <i className="fa fa-plus"></i>
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="card-custom-field stringtemplate-field">
      <div className="field-header">
        <span className="field-label">{definition.name}</span>
        <div className="field-actions">
          <button className="btn btn-sm btn-link js-select-field" onClick={onEdit}>
            <i className="fa fa-pencil"></i>
          </button>
          <button className="btn btn-sm btn-link js-settings" onClick={onSettings}>
            <i className="fa fa-cog"></i>
          </button>
        </div>
      </div>
      <div className="field-value">
        {formattedValue || t('no-value')}
      </div>
    </div>
  );
};

export default CardCustomFields;
