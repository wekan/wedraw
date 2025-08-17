import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { App } from '../App.jsx';
import { DrawingBoard } from '../DrawingBoard.jsx';
import { DrawingBoard } from '../DrawingBoard.jsx';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
      children: [
        {
          index: true,
          element: <DrawingBoard />
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
