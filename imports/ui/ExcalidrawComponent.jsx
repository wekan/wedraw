import React from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';

export const ExcalidrawComponent = () => {
  const onChange = (elements, state) => {
    console.log("Elements:", elements);
    console.log("State:", state);
  };

  return (
    <div className="excalidraw-wrapper">
      <Excalidraw
        onChange={onChange}
        UIOptions={{
          canvasActions: {
            loadScene: false,
            export: false,
            saveAsImage: true,
          }
        }}
      />
    </div>
  );
};

export const App = () => (
  <div className="app-container">
    <h1>Meteor Excalidraw</h1>
    <ExcalidrawComponent />
  </div>
);