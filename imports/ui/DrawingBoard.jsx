import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Excalidraw } from '@excalidraw/excalidraw';
import { useTracker } from 'meteor/react-meteor-data';
import { ReactiveCache } from '/imports/reactiveCache';

export const DrawingBoard = () => {
  const { boardId } = useParams();
  const [elements, setElements] = useState([]);
  
  // Subscribe to board data
  const { board, lists, cards, isLoading } = useTracker(() => {
    const board = ReactiveCache.getBoard(boardId);
    const lists = ReactiveCache.getLists({ boardId: boardId });
    const cards = ReactiveCache.getCards({ boardId: boardId });

    return {
      board,
      lists,
      cards,
      isLoading: !board || !lists || !cards
    };
  });

  useEffect(() => {
    if (!isLoading) {
      // Transform cards into Excalidraw elements
      const cardElements = [];
      const CARD_WIDTH = 200;
      const CARD_HEIGHT = 100;
      const MARGIN = 20;
      
      lists.forEach((list, listIndex) => {
        const listCards = cards.filter(card => card.listId === list._id);
        
        listCards.forEach((card, cardIndex) => {
          const x = listIndex * (CARD_WIDTH + MARGIN) + 50;
          const y = cardIndex * (CARD_HEIGHT + MARGIN) + 50;
          
          // Create rectangle element for card
          cardElements.push({
            id: card._id,
            type: "rectangle",
            x,
            y,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            backgroundColor: card.color || "#ffffff",
            strokeColor: "#000000",
            fillStyle: "solid",
            strokeWidth: 1,
            roundness: {
              type: 2
            },
            label: {
              text: card.title,
              fontSize: 14
            }
          });
        });
      });
      
      setElements(cardElements);
    }
  }, [isLoading, board, lists, cards]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="drawing-board">
      <h1>{board.title} - Drawing Mode</h1>
      <div className="excalidraw-wrapper">
        <Excalidraw
          initialData={{
            elements,
            appState: {
              viewBackgroundColor: "#f5f5f5"
            }
          }}
          onChange={(elements, state) => {
            setElements(elements);
          }}
        />
      </div>
    </div>
  );
};
