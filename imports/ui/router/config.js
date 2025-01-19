import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { App } from '../App.jsx';
import { DrawingBoard } from '../DrawingBoard.jsx';
import { ExcalidrawComponent } from '../ExcalidrawComponent.jsx';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
      children: [
        {
          index: true,
          element: <ExcalidrawComponent />
        },
        {
          path: 'draw/:boardId',
          element: <DrawingBoard />
        }
      ]
    }
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);
