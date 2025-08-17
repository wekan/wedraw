import React from 'react';

const SettingHeaderComponent = () => {
  return (
    <div className="setting-header">
      <div className="setting-header-content">
        <h1 className="setting-header-title">
          <i className="fa fa-cog"></i>
          Admin Panel
        </h1>
        
        <nav className="setting-header-nav">
          <ul className="setting-nav-list">
            <li className="setting-nav-item">
              <a href="/settings" className="setting-nav-link active">
                <i className="fa fa-cog"></i>
                <span>Overview</span>
              </a>
            </li>
            <li className="setting-nav-item">
              <a href="/settings/people" className="setting-nav-link">
                <i className="fa fa-users"></i>
                <span>People</span>
              </a>
            </li>
            <li className="setting-nav-item">
              <a href="/settings/reports" className="setting-nav-link">
                <i className="fa fa-chart-bar"></i>
                <span>Reports</span>
              </a>
            </li>
            <li className="setting-nav-item">
              <a href="/settings/attachments" className="setting-nav-link">
                <i className="fa fa-paperclip"></i>
                <span>Attachments</span>
              </a>
            </li>
            <li className="setting-nav-item">
              <a href="/settings/translation" className="setting-nav-link">
                <i className="fa fa-language"></i>
                <span>Translation</span>
              </a>
            </li>
            <li className="setting-nav-item">
              <a href="/settings/information" className="setting-nav-link">
                <i className="fa fa-info-circle"></i>
                <span>Information</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default SettingHeaderComponent;
