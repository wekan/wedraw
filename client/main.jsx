import React from 'react';
import { createRoot } from 'react-dom/client';
import { Meteor } from 'meteor/meteor';
import AppRouter from './components/router/AppRouter';

// Import models to ensure global collections are available
import './models.js';

// Import and initialize i18n system
import '/imports/i18n';

// Add error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Error: {this.state.error?.message || 'Something went wrong'}</div>;
    }
    return this.props.children;
  }
}

Meteor.startup(async () => {
  try {
    await new Promise(resolve => Meteor.defer(resolve)); // Ensure Meteor is ready
    const container = document.getElementById('react-target');
    if (!container) throw new Error('Target container not found');
    
    const root = createRoot(container);
    root.render(
      <ErrorBoundary>
        <React.StrictMode>
          <AppRouter />
        </React.StrictMode>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('Application initialization failed:', error);
    document.body.innerHTML = `<div>Failed to initialize application: ${error.message}</div>`;
  }
});
