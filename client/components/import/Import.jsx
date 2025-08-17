import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { useNavigate } from 'react-router-dom';
import { ReactiveCache } from '/imports/reactiveCache';
import Papa from 'papaparse';

// Import mappers
import { trelloGetMembersToMap } from './trelloMembersMapper';
import { wekanGetMembersToMap } from './wekanMembersMapper';
import { csvGetMembersToMap } from './csvMembersMapper';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * Import Component
 * 
 * Replaces the original Jade import template with a React component.
 * This component manages board imports from various sources:
 * - Trello export
 * - WeKan export
 * - CSV import
 * - Member mapping
 * - Import validation and processing
 * 
 * Original Jade template had:
 * - Import source selection
 * - Data input (JSON/CSV)
 * - Member mapping interface
 * - Import progress and validation
 * - Error handling and feedback
 */
const Import = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [importedData, setImportedData] = useState(null);
  const [membersToMap, setMembersToMap] = useState([]);
  const [error, setError] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const navigate = useNavigate();

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { importSource, fromBoard, currentUser } = useTracker(() => {
    return {
      importSource: Session.get('importSource'),
      fromBoard: Session.get('fromBoard'),
      currentUser: ReactiveCache.getCurrentUser(),
    };
  }, []);

  const steps = ['importTextarea', 'importMapMembers'];

  const getStepTitle = () => {
    return `import-board-title-${importSource}`;
  };

  const nextStep = () => {
    const nextStepIndex = currentStep + 1;
    if (nextStepIndex >= steps.length) {
      finishImport();
    } else {
      setCurrentStep(nextStepIndex);
    }
  };

  const importData = (evt, dataSource) => {
    evt.preventDefault();
    const input = evt.target.querySelector('.js-import-json')?.value;
    
    if (!input) {
      setError('error-no-input');
      return;
    }

    try {
      let data;
      let membersToMapData;

      if (dataSource === 'csv') {
        const csv = input.indexOf('\t') > 0 ? input.replace(/(\t)/g, ',') : input;
        const result = Papa.parse(csv);
        
        if (result && result.data && result.data.length) {
          data = result.data;
        } else {
          throw new Meteor.Error('error-csv-schema');
        }
        
        membersToMapData = prepareAdditionalData(data);
      } else {
        const dataObject = JSON.parse(input);
        data = dataObject;
        membersToMapData = prepareAdditionalData(dataObject);
      }

      setError('');
      setImportedData(data);
      setMembersToMap(membersToMapData);
      nextStep();
    } catch (e) {
      if (dataSource === 'csv') {
        setError('error-csv-schema');
      } else {
        setError('error-json-malformed');
      }
    }
  };

  const prepareAdditionalData = (data) => {
    switch (importSource) {
      case 'trello':
        return trelloGetMembersToMap(data);
      case 'wekan':
        return wekanGetMembersToMap(data);
      case 'csv':
        return csvGetMembersToMap(data);
      default:
        return [];
    }
  };

  const finishImport = async () => {
    if (!importedData) return;

    setIsImporting(true);
    try {
      const additionalData = {};
      if (membersToMap.length > 0) {
        const mappingById = {};
        membersToMap.forEach(member => {
          if (member.wekanId) {
            mappingById[member.id] = member.wekanId;
          }
        });
        additionalData.membersMapping = mappingById;
      }

      const result = await Meteor.call(
        'importBoard',
        importedData,
        additionalData,
        importSource,
        fromBoard
      );

      // Import successful
      const title = getSlug(importedData.title) || 'imported-board';
      Session.set('fromBoard', null);
      
      // Navigate to the new board
      navigate(`/board/${result}/${title}`);
    } catch (err) {
      setError(err.error);
    } finally {
      setIsImporting(false);
    }
  };

  const getSlug = (title) => {
    if (!title) return '';
    return title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const renderImportTextarea = () => (
    <div className="import-textarea">
      <h3>{t('import-data')}</h3>
      <p>{t('import-instructions')}</p>
      
      <form onSubmit={(evt) => importData(evt, importSource)}>
        <div className="form-group">
          <label htmlFor="importInput">
            {importSource === 'csv' ? t('csv-data') : t('json-data')}
          </label>
          <textarea
            id="importInput"
            className="js-import-json form-control"
            rows={10}
            placeholder={importSource === 'csv' ? t('paste-csv-here') : t('paste-json-here')}
            required
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {t('import')}
          </button>
        </div>
      </form>
      
      {error && (
        <div className="import-error">
          <p className="text-danger">{t(error)}</p>
        </div>
      )}
    </div>
  );

  const renderMemberMapping = () => (
    <div className="import-member-mapping">
      <h3>{t('map-members')}</h3>
      <p>{t('member-mapping-instructions')}</p>
      
      <div className="members-mapping-content">
        {membersToMap.map((member, index) => (
          <div key={member.id || index} className="member-mapping-item">
            <div className="member-info">
              <span className="member-name">{member.username}</span>
              <span className="member-email">{member.email}</span>
            </div>
            
            <div className="member-mapping">
              <select
                value={member.wekanId || ''}
                onChange={(e) => {
                  const newMembers = [...membersToMap];
                  newMembers[index].wekanId = e.target.value || null;
                  setMembersToMap(newMembers);
                }}
              >
                <option value="">{t('select-user')}</option>
                {/* This would populate with available WeKan users */}
              </select>
            </div>
          </div>
        ))}
      </div>
      
      <div className="member-mapping-actions">
        <button 
          className="btn btn-secondary"
          onClick={() => setCurrentStep(0)}
        >
          {t('back')}
        </button>
        <button 
          className="btn btn-primary"
          onClick={finishImport}
          disabled={isImporting}
        >
          {isImporting ? t('importing') : t('finish-import')}
        </button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (steps[currentStep]) {
      case 'importTextarea':
        return renderImportTextarea();
      case 'importMapMembers':
        return renderMemberMapping();
      default:
        return renderImportTextarea();
    }
  };

  if (!currentUser) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="import js-import">
      <div className="import-header">
        <h2>
          <i className="fa fa-download"></i>
          {t(getStepTitle())}
        </h2>
        
        {importSource && (
          <div className="import-source">
            <span className="source-label">{t('import-source')}:</span>
            <span className="source-value">{t(importSource)}</span>
          </div>
        )}
      </div>
      
      <div className="import-content">
        {renderCurrentStep()}
      </div>
      
      <div className="import-progress">
        <div className="step-indicator">
          {steps.map((step, index) => (
            <div 
              key={step}
              className={`step ${index <= currentStep ? 'active' : ''} ${index === currentStep ? 'current' : ''}`}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Import;
