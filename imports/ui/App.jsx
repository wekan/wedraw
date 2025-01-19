import React from 'react';
import { Outlet } from 'react-router-dom';

export const App = () => (
  <div className="app-container">
    <Outlet />
  </div>
);
