import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { ReactiveCache } from '/imports/reactiveCache';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * InformationBody Component
 * 
 * Replaces the original Blaze informationBody component with a React component.
 * This component displays system information and statistics for administrators.
 * 
 * Original Blaze component had:
 * - information: Main information display component
 * - statistics: System statistics table
 * - Various system metrics and version information
 */
const InformationBody = ({ onClose, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentUser, isAdmin, statistics, isSandstorm } = useTracker(() => {
    const user = ReactiveCache.getCurrentUser();
    if (!user) return { 
      currentUser: null, 
      isAdmin: false, 
      statistics: null, 
      isSandstorm: false 
    };

    const adminStatus = user.isAdmin();
    
    // Check if running on Sandstorm
    const sandstormStatus = window.location.hostname.includes('sandstorm') || 
                           window.location.hostname.includes('sandcats');

    return {
      currentUser: user,
      isAdmin: adminStatus,
      statistics: null, // Will be fetched via Meteor method
      isSandstorm: sandstormStatus,
    };
  }, []);

  // Fetch statistics
  useEffect(() => {
    if (isAdmin) {
      setIsLoading(true);
      Meteor.call('getStatistics', (err, result) => {
        setIsLoading(false);
        if (err) {
          setError(err.message);
        }
      });
    }
  }, [isAdmin]);

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper function to format human readable time
  const formatUptime = (seconds) => {
    if (!seconds) return '0s';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    if (secs > 0) result += `${secs}s`;
    
    return result.trim();
  };

  // Helper function to format number
  const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A';
    return parseFloat(num).toFixed(2);
  };

  if (!currentUser || !isAdmin) {
    return (
      <div className="information-body error">
        <div className="error-message">
          <i className="fa fa-exclamation-triangle"></i>
          {t('error-notAuthorized')}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="information-body loading">
        <div className="loading-spinner">
          <i className="fa fa-spinner fa-spin"></i>
          {t('loading-statistics')}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="information-body error">
        <div className="error-message">
          <i className="fa fa-exclamation-triangle"></i>
          {t('error-loading-statistics')}: {error}
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="setting-content js-information-body">
      <div className="content-title">
        <span>
          <i className="fa fa-info-circle"></i>
          {t('info')}
        </span>
        
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
              <a className="js-setting-menu" data-id="information-display">
                <i className="fa fa-info-circle"></i>
                {t('info')}
              </a>
            </li>
          </ul>
        </div>
        
        <div className="main-body">
          <Statistics 
            statistics={statistics}
            isSandstorm={isSandstorm}
            formatFileSize={formatFileSize}
            formatUptime={formatUptime}
            formatNumber={formatNumber}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Statistics Component
 * 
 * Displays system statistics in a table format
 */
const Statistics = ({ statistics, isSandstorm, formatFileSize, formatUptime, formatNumber }) => {
  const t = (key) => enTranslations[key] || key;

  if (!statistics) {
    return (
      <div className="statistics-placeholder">
        <p>{t('statistics-not-available')}</p>
      </div>
    );
  }

  return (
    <div className="statistics js-statistics">
      <table className="statistics-table">
        <tbody>
          <tr>
            <th>WeKan ® {t('info')}</th>
            <td>{statistics.version || 'N/A'}</td>
          </tr>
          
          <tr>
            <th>{t('Meteor_version')}</th>
            <td>{statistics.meteor?.meteorVersion || 'N/A'}</td>
          </tr>
          
          <tr>
            <th>{t('Node_version')}</th>
            <td>{statistics.process?.nodeVersion || 'N/A'}</td>
          </tr>
          
          <tr>
            <th>{t('MongoDB_version')}</th>
            <td>{statistics.mongo?.mongoVersion || 'N/A'}</td>
          </tr>
          
          <tr>
            <th>{t('MongoDB_storage_engine')}</th>
            <td>{statistics.mongo?.mongoStorageEngine || 'N/A'}</td>
          </tr>
          
          <tr>
            <th>{t('MongoDB_Oplog_enabled')}</th>
            <td>{statistics.mongo?.mongoOplogEnabled ? t('yes') : t('no')}</td>
          </tr>
          
          <tr>
            <th>{t('OS_Type')}</th>
            <td>{statistics.os?.type || 'N/A'}</td>
          </tr>
          
          <tr>
            <th>{t('OS_Platform')}</th>
            <td>{statistics.os?.platform || 'N/A'}</td>
          </tr>
          
          <tr>
            <th>{t('OS_Arch')}</th>
            <td>{statistics.os?.arch || 'N/A'}</td>
          </tr>
          
          <tr>
            <th>{t('OS_Release')}</th>
            <td>{statistics.os?.release || 'N/A'}</td>
          </tr>
          
          <tr>
            <th>{t('OS_Uptime')}</th>
            <td>{formatUptime(statistics.os?.uptime)}</td>
          </tr>
          
          <tr>
            <th>{t('OS_Loadavg')}</th>
            <td>
              {formatNumber(statistics.os?.loadavg?.[0])}, 
              {formatNumber(statistics.os?.loadavg?.[1])}, 
              {formatNumber(statistics.os?.loadavg?.[2])}
            </td>
          </tr>
          
          <tr>
            <th>{t('OS_Totalmem')}</th>
            <td>{formatFileSize(statistics.os?.totalmem)}</td>
          </tr>
          
          <tr>
            <th>{t('OS_Freemem')}</th>
            <td>{formatFileSize(statistics.os?.freemem)}</td>
          </tr>
          
          <tr>
            <th>{t('OS_Cpus')}</th>
            <td>{statistics.os?.cpus?.length || 0}</td>
          </tr>
          
          {!isSandstorm && (
            <>
              <tr>
                <th>{t('Node_heap_total_heap_size')}</th>
                <td>{formatFileSize(statistics.nodeHeapStats?.totalHeapSize)}</td>
              </tr>
              
              <tr>
                <th>{t('Node_heap_total_heap_size_executable')}</th>
                <td>{formatFileSize(statistics.nodeHeapStats?.totalHeapSizeExecutable)}</td>
              </tr>
              
              <tr>
                <th>{t('Node_heap_total_physical_size')}</th>
                <td>{formatFileSize(statistics.nodeHeapStats?.totalPhysicalSize)}</td>
              </tr>
              
              <tr>
                <th>{t('Node_heap_total_available_size')}</th>
                <td>{formatFileSize(statistics.nodeHeapStats?.totalAvailableSize)}</td>
              </tr>
              
              <tr>
                <th>{t('Node_heap_used_heap_size')}</th>
                <td>{formatFileSize(statistics.nodeHeapStats?.usedHeapSize)}</td>
              </tr>
              
              <tr>
                <th>{t('Node_heap_heap_size_limit')}</th>
                <td>{formatFileSize(statistics.nodeHeapStats?.heapSizeLimit)}</td>
              </tr>
              
              <tr>
                <th>{t('Node_heap_malloced_memory')}</th>
                <td>{formatFileSize(statistics.nodeHeapStats?.mallocedMemory)}</td>
              </tr>
              
              <tr>
                <th>{t('Node_heap_peak_malloced_memory')}</th>
                <td>{formatFileSize(statistics.nodeHeapStats?.peakMallocedMemory)}</td>
              </tr>
              
              <tr>
                <th>{t('Node_heap_does_zap_garbage')}</th>
                <td>{statistics.nodeHeapStats?.doesZapGarbage ? t('yes') : t('no')}</td>
              </tr>
              
              <tr>
                <th>{t('Node_heap_number_of_native_contexts')}</th>
                <td>{statistics.nodeHeapStats?.numberOfNativeContexts || 0}</td>
              </tr>
              
              <tr>
                <th>{t('Node_heap_number_of_detached_contexts')}</th>
                <td>{statistics.nodeHeapStats?.numberOfDetachedContexts || 0}</td>
              </tr>
              
              <tr>
                <th>{t('Node_memory_usage_rss')}</th>
                <td>{formatFileSize(statistics.nodeMemoryUsage?.rss)}</td>
              </tr>
              
              <tr>
                <th>{t('Node_memory_usage_heap_total')}</th>
                <td>{formatFileSize(statistics.nodeMemoryUsage?.heapTotal)}</td>
              </tr>
              
              <tr>
                <th>{t('Node_memory_usage_heap_used')}</th>
                <td>{formatFileSize(statistics.nodeMemoryUsage?.heapUsed)}</td>
              </tr>
              
              <tr>
                <th>{t('Node_memory_usage_external')}</th>
                <td>{formatFileSize(statistics.nodeMemoryUsage?.external)}</td>
              </tr>
              
              <tr>
                <th>{t('Mongo_sessions_count')}</th>
                <td>{statistics.session?.sessionsCount || 0}</td>
              </tr>
            </>
          )}
        </tbody>
      </table>
      
      <div className="statistics-footer">
        <p className="statistics-note">
          <i className="fa fa-info-circle"></i>
          {t('statistics-updated')}: {new Date().toLocaleString()}
        </p>
        
        <button 
          className="btn btn-secondary"
          onClick={() => window.location.reload()}
        >
          <i className="fa fa-refresh"></i>
          {t('refresh-statistics')}
        </button>
      </div>
    </div>
  );
};

export default InformationBody;
