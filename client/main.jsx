import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { router } from '/imports/ui/router/config';

// Add error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
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
          <RouterProvider router={router} />
        </React.StrictMode>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('Application initialization failed:', error);
    document.body.innerHTML = `<div>Failed to initialize application: ${error.message}</div>`;
  }
});
