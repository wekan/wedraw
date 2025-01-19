import React from 'react';
import { Hello } from './Hello.jsx';
import { Info } from './Info.jsx';
import { ExcalidrawComponent } from './ExcalidrawComponent.jsx';

export const App = () => (
  <div className="app-container">
    <h1>WeKan</h1>
    <Hello/>
    <Info/>
    <ExcalidrawComponent/>
  </div>
);
