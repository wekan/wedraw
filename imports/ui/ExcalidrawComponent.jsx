import React from 'react';
import { Excalidraw, MainMenu, WelcomeScreen } from '@excalidraw/excalidraw';

export const ExcalidrawComponent = () => {
  const onChange = (elements, state) => {
    // Handle changes here
  };

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Excalidraw
        onChange={onChange}
        UIOptions={{
          canvasActions: {
            loadScene: false,
            export: false,
            saveAsImage: true,
          }
        }}
        renderTopRightUI={(isMobile) => (
          <MainMenu />
        )}
      >
        <WelcomeScreen />
      </Excalidraw>
    </div>
  );
};