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