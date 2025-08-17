import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { ReactiveCache } from '/imports/reactiveCache';
import { Utils } from '/imports/utils';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * TranslationBody Component
 * 
 * Replaces the original Blaze translation component with a React component.
 * This component provides comprehensive translation management for administrators,
 * including viewing, editing, and creating new translations.
 * 
 * Original Blaze component had:
 * - translation: Main translation management interface
 * - translationGeneral: Translation table display
 * - newTranslationRow: New translation creation
 * - translationRow: Individual translation row
 * - editTranslationPopup: Translation editing popup
 * - newTranslationPopup: New translation creation popup
 * - settingsTranslationPopup: Translation settings and deletion
 */
const TranslationBody = ({ onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [translationSetting, setTranslationSetting] = useState(false);
  const [translationList, setTranslationList] = useState([]);
  const [translationNumber, setTranslationNumber] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewTranslationPopup, setShowNewTranslationPopup] = useState(false);
  const [showEditTranslationPopup, setShowEditTranslationPopup] = useState(false);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const [selectedTranslation, setSelectedTranslation] = useState(null);
  const [newTranslation, setNewTranslation] = useState({
    language: 'en',
    text: '',
    translationText: ''
  });

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentUser, isAdmin, isMiniScreen } = useTracker(() => {
    const user = ReactiveCache.getCurrentUser();
    if (!user) return {
      currentUser: null,
      isAdmin: false,
      isMiniScreen: false
    };

    const adminStatus = user.isAdmin();
    const miniScreenStatus = Utils.isMiniScreen();

    return {
      currentUser: user,
      isAdmin: adminStatus,
      isMiniScreen: miniScreenStatus,
    };
  }, []);

  // Load translation data
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setLoading(true);
        // TODO: Implement translation loading
        // const result = await Meteor.call('getTranslations');
        // setTranslationList(result.translations || []);
        // setTranslationNumber(result.count || 0);
        // setTranslationSetting(true);
        
        // Mock data for now
        setTranslationList([
          { _id: '1', language: 'en', text: 'Welcome', translationText: 'Welcome' },
          { _id: '2', language: 'es', text: 'Welcome', translationText: 'Bienvenido' },
          { _id: '3', language: 'fr', text: 'Welcome', translationText: 'Bienvenue' }
        ]);
        setTranslationNumber(3);
        setTranslationSetting(true);
      } catch (err) {
        console.error('Error loading translations:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      loadTranslations();
    }
  }, [isAdmin]);

  // Handle search
  const handleSearch = useCallback(() => {
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  }, [searchQuery]);

  // Handle new translation creation
  const handleNewTranslation = useCallback(() => {
    setShowNewTranslationPopup(true);
  }, []);

  // Handle edit translation
  const handleEditTranslation = useCallback((translation) => {
    setSelectedTranslation(translation);
    setShowEditTranslationPopup(true);
  }, []);

  // Handle translation settings
  const handleTranslationSettings = useCallback((translation) => {
    setSelectedTranslation(translation);
    setShowSettingsPopup(true);
  }, []);

  // Handle save translation
  const handleSaveTranslation = useCallback(async (translationData) => {
    try {
      setLoading(true);
      // TODO: Implement save translation
      // await Meteor.call('saveTranslation', translationData);
      console.log('Saving translation:', translationData);
      
      if (onUpdate) {
        onUpdate();
      }
      
      setShowNewTranslationPopup(false);
      setShowEditTranslationPopup(false);
      setNewTranslation({ language: 'en', text: '', translationText: '' });
    } catch (err) {
      console.error('Error saving translation:', err);
    } finally {
      setLoading(false);
    }
  }, [onUpdate]);

  // Handle delete translation
  const handleDeleteTranslation = useCallback(async (translationId) => {
    try {
      setLoading(true);
      // TODO: Implement delete translation
      // await Meteor.call('deleteTranslation', translationId);
      console.log('Deleting translation:', translationId);
      
      if (onUpdate) {
        onUpdate();
      }
      
      setShowSettingsPopup(false);
    } catch (err) {
      console.error('Error deleting translation:', err);
    } finally {
      setLoading(false);
    }
  }, [onUpdate]);

  if (!currentUser || !isAdmin) {
    return (
      <div className="translation-body error">
        <div className="error-message">
          <i className="fa fa-exclamation-triangle"></i>
          {t('error-notAuthorized')}
        </div>
      </div>
    );
  }

  return (
    <div className="setting-content js-translation">
      <div className="content-title ext-box">
        <div className="ext-box-left">
          {loading ? (
            <div className="loading-spinner">
              <i className="fa fa-spinner fa-spin"></i>
            </div>
          ) : translationSetting ? (
            <>
              <span>
                <i className="fa fa-font"></i>
                {!isMiniScreen && t('translation')}
              </span>
              
              <input
                id="searchTranslationInput"
                className="search-input"
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              
              <button
                id="searchTranslationButton"
                className="search-button"
                onClick={handleSearch}
              >
                <i className="fa fa-search"></i>
                {t('search')}
              </button>
              
              <div className="ext-box-right">
                {!isMiniScreen && (
                  <span>{t('translation-number')}: {translationNumber}</span>
                )}
              </div>
            </>
          ) : null}
        </div>

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

      <div className="content-body">
        <div className="side-menu">
          <ul>
            <li className="active">
              <a className="js-translation-menu" data-id="translation-setting">
                <i className="fa fa-font"></i>
                {t('translation')}
              </a>
            </li>
          </ul>
        </div>

        <div className="main-body">
          {loading ? (
            <div className="loading-spinner">
              <i className="fa fa-spinner fa-spin"></i>
            </div>
          ) : translationSetting ? (
            <TranslationGeneral
              translationList={translationList}
              onNewTranslation={handleNewTranslation}
              onEditTranslation={handleEditTranslation}
              onTranslationSettings={handleTranslationSettings}
            />
          ) : null}
        </div>
      </div>

      {/* New Translation Popup */}
      {showNewTranslationPopup && (
        <NewTranslationPopup
          translation={newTranslation}
          onSave={handleSaveTranslation}
          onClose={() => setShowNewTranslationPopup(false)}
          onUpdate={(field, value) => setNewTranslation(prev => ({ ...prev, [field]: value }))}
        />
      )}

      {/* Edit Translation Popup */}
      {showEditTranslationPopup && selectedTranslation && (
        <EditTranslationPopup
          translation={selectedTranslation}
          onSave={handleSaveTranslation}
          onClose={() => setShowEditTranslationPopup(false)}
        />
      )}

      {/* Translation Settings Popup */}
      {showSettingsPopup && selectedTranslation && (
        <TranslationSettingsPopup
          translation={selectedTranslation}
          onDelete={handleDeleteTranslation}
          onClose={() => setShowSettingsPopup(false)}
        />
      )}
    </div>
  );
};

/**
 * TranslationGeneral Component
 * 
 * Displays the translation table
 */
const TranslationGeneral = ({ 
  translationList, 
  onNewTranslation, 
  onEditTranslation, 
  onTranslationSettings 
}) => {
  const t = (key) => enTranslations[key] || key;

  return (
    <div className="translation-general js-translation-general">
      <table className="translation-table">
        <thead>
          <tr>
            <th>{t('language')}</th>
            <th>{t('text')}</th>
            <th>{t('translation-text')}</th>
            <th>
              <button
                className="new-translation btn btn-sm btn-primary"
                onClick={onNewTranslation}
              >
                <i className="fa fa-plus-square"></i>
                {t('new')}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {translationList.map(translation => (
            <TranslationRow
              key={translation._id}
              translation={translation}
              onEdit={onEditTranslation}
              onSettings={onTranslationSettings}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * TranslationRow Component
 * 
 * Individual translation row
 */
const TranslationRow = ({ translation, onEdit, onSettings }) => {
  const t = (key) => enTranslations[key] || key;

  return (
    <tr className="translation-row js-translation-row">
      <td>{translation.language}</td>
      <td>{translation.text}</td>
      <td>{translation.translationText}</td>
      <td>
        <button
          className="edit-translation btn btn-sm btn-link"
          onClick={() => onEdit(translation)}
          title={t('edit')}
        >
          <i className="fa fa-edit"></i>
          {t('edit')}
        </button>
        
        <button
          className="more-settings-translation btn btn-sm btn-link"
          onClick={() => onSettings(translation)}
          title={t('more-settings')}
        >
          <i className="fa fa-ellipsis-h"></i>
        </button>
      </td>
    </tr>
  );
};

/**
 * NewTranslationPopup Component
 * 
 * Popup for creating new translations
 */
const NewTranslationPopup = ({ translation, onSave, onClose, onUpdate }) => {
  const t = (key) => enTranslations[key] || key;
  const [formData, setFormData] = useState(translation);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(translation);
  }, [translation]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!formData.language) newErrors.language = t('required');
    if (!formData.text) newErrors.text = t('required');
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
  }, [formData, onSave, t]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
    if (onUpdate) {
      onUpdate(field, value);
    }
  }, [errors, onUpdate]);

  return (
    <div className="new-translation-popup js-new-translation-popup">
      <form onSubmit={handleSubmit}>
        <label className="form-label">
          {t('language')}
          <input
            className="js-translation-language form-control"
            type="text"
            value={formData.language}
            onChange={(e) => handleInputChange('language', e.target.value)}
            required
          />
          {errors.language && <span className="error">{errors.language}</span>}
        </label>

        <label className="form-label">
          {t('text')}
          <span className={`error ${errors.text ? '' : 'hide'}`}>
            {t('error-text-taken')}
          </span>
          <input
            className="js-translation-text form-control"
            type="text"
            value={formData.text}
            onChange={(e) => handleInputChange('text', e.target.value)}
            required
          />
          {errors.text && <span className="error">{errors.text}</span>}
        </label>

        <label className="form-label">
          {t('translation-text')}
          <input
            className="js-translation-translation-text form-control"
            type="text"
            value={formData.translationText}
            onChange={(e) => handleInputChange('translationText', e.target.value)}
          />
        </label>

        <hr />

        <div className="buttonsContainer">
          <input
            className="primary wide btn btn-primary"
            type="submit"
            value={t('save')}
          />
          
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
  );
};

/**
 * EditTranslationPopup Component
 * 
 * Popup for editing existing translations
 */
const EditTranslationPopup = ({ translation, onSave, onClose }) => {
  const t = (key) => enTranslations[key] || key;
  const [formData, setFormData] = useState(translation);

  useEffect(() => {
    setFormData(translation);
  }, [translation]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSave(formData);
  }, [formData, onSave]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className="edit-translation-popup js-edit-translation-popup">
      <form onSubmit={handleSubmit}>
        <label className="form-label">
          {t('language')}
          <input
            className="js-translation-language form-control"
            type="text"
            value={formData.language}
            onChange={(e) => handleInputChange('language', e.target.value)}
            required
            readOnly
          />
        </label>

        <label className="form-label">
          {t('text')}
          <input
            className="js-translation-text form-control"
            type="text"
            value={formData.text}
            onChange={(e) => handleInputChange('text', e.target.value)}
            required
            readOnly
          />
        </label>

        <label className="form-label">
          {t('translation-text')}
          <input
            className="js-translation-translation-text form-control"
            type="text"
            value={formData.translationText}
            onChange={(e) => handleInputChange('translationText', e.target.value)}
          />
        </label>

        <hr />

        <div className="buttonsContainer">
          <input
            className="primary wide btn btn-primary"
            type="submit"
            value={t('save')}
          />
          
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
  );
};

/**
 * TranslationSettingsPopup Component
 * 
 * Popup for translation settings and deletion
 */
const TranslationSettingsPopup = ({ translation, onDelete, onClose }) => {
  const t = (key) => enTranslations[key] || key;

  const handleDelete = useCallback(() => {
    onDelete(translation._id);
  }, [translation._id, onDelete]);

  return (
    <div className="settings-translation-popup js-settings-translation-popup">
      <ul className="pop-over-list">
        <li>
          <form onSubmit={(e) => e.preventDefault()}>
            <label className="form-label">
              {t('delete-translation-confirm-popup')}
            </label>
            <br />
            
            <div className="buttonsContainer">
              <input
                id="deleteButton"
                className="card-details-red right wide btn btn-danger"
                type="button"
                value={t('delete')}
                onClick={handleDelete}
              />
              
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        </li>
      </ul>
    </div>
  );
};

export default TranslationBody;
