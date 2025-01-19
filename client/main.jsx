import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { startTransition } from 'react';
import { router } from '/imports/ui/router/config';

Meteor.startup(() => {
  const container = document.getElementById('react-target');
  const root = createRoot(container);
  startTransition(() => {
    root.render(<RouterProvider router={router} />);
  });
});
