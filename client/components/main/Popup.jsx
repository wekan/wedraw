import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const Popup = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  offset = { left: 0, top: 0 }, 
  colorClass = '', 
  depth = 0,
  hasPopupParent = false,
  onBack
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      // Add delay for smooth closing animation
      const timer = setTimeout(() => setIsVisible(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  if (!isVisible) {
    return null;
  }

  const popupContent = (
    <div 
      className={`pop-over js-pop-over ${!title ? 'miniprofile' : ''} ${colorClass} ${!title ? 'no-title' : ''}`}
      style={{ 
        left: `${offset.left}px`, 
        top: `${offset.top}px`,
        display: isOpen ? 'block' : 'none'
      }}
    >
      <div className="header">
        <a 
          className={`back-btn js-back-view ${!hasPopupParent ? 'is-hidden' : ''}`}
          onClick={handleBack}
        >
          <i className="fa fa-chevron-left"></i>
        </a>
        <span className="header-title">{title}</span>
        <a className="close-btn js-close-pop-over" onClick={handleClose}>
          <i className="fa fa-times-thin"></i>
        </a>
      </div>
      
      <div className="content-wrapper">
        <div className={`content-container popup-container-depth-${depth}`}>
          <div className="content">
            {children}
          </div>
        </div>
        <div className="clearfix"></div>
      </div>
    </div>
  );

  // Render to portal to avoid z-index issues
  return createPortal(popupContent, document.body);
};

// Popup Manager Hook
export const usePopup = () => {
  const [popups, setPopups] = useState([]);

  const openPopup = (popupConfig) => {
    const newPopup = {
      id: Date.now(),
      ...popupConfig,
      isOpen: true
    };
    setPopups(prev => [...prev, newPopup]);
    return newPopup.id;
  };

  const closePopup = (popupId) => {
    setPopups(prev => prev.map(popup => 
      popup.id === popupId ? { ...popup, isOpen: false } : popup
    ));
  };

  const closeAllPopups = () => {
    setPopups(prev => prev.map(popup => ({ ...popup, isOpen: false })));
  };

  const getPopup = (popupId) => {
    return popups.find(popup => popup.id === popupId);
  };

  return {
    popups,
    openPopup,
    closePopup,
    closeAllPopups,
    getPopup
  };
};

// Popup Container Component
export const PopupContainer = ({ popups, onClose }) => {
  return (
    <>
      {popups.map((popup) => (
        <Popup
          key={popup.id}
          isOpen={popup.isOpen}
          onClose={() => onClose(popup.id)}
          title={popup.title}
          offset={popup.offset}
          colorClass={popup.colorClass}
          depth={popup.depth}
          hasPopupParent={popup.hasPopupParent}
          onBack={popup.onBack}
        >
          {popup.content}
        </Popup>
      ))}
    </>
  );
};

export default Popup;
