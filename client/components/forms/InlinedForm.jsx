import React from 'react';

/**
 * InlinedForm Component
 * 
 * Replaces the original Jade inlinedform template with a React component.
 * This component provides a conditional form wrapper that can be shown/hidden.
 * 
 * Original Jade template had:
 * - Conditional form rendering based on isOpen state
 * - Form wrapper with configurable ID and class names
 * - Content blocks for form content and fallback content
 */
const InlinedForm = ({ 
  isOpen, 
  id, 
  className = '', 
  children, 
  fallback = null,
  onSubmit,
  ...props 
}) => {
  if (!isOpen) {
    return fallback;
  }

  const formClasses = `inlined-form js-inlined-form ${className}`.trim();

  const handleSubmit = (event) => {
    if (onSubmit) {
      onSubmit(event);
    }
  };

  return (
    <form
      id={id}
      className={formClasses}
      onSubmit={handleSubmit}
      {...props}
    >
      {children}
    </form>
  );
};

export default InlinedForm;
