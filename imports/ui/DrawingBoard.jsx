import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { ReactiveCache } from '/imports/reactiveCache';

/**
 * DrawingBoard Component
 * 
 * A simple dependency visualization system that allows users to draw lines
 * between cards to show relationships and dependencies.
 * 
 * Features:
 * - Display cards in a grid layout
 * - Draw dependency lines between cards
 * - Select line colors
 * - Remove dependency lines
 * - Works completely offline
 * - No external dependencies
 */
export const DrawingBoard = () => {
  const { boardId } = useParams();
  const canvasRef = useRef(null);
  const [dependencies, setDependencies] = useState([]);
  const [selectedColor, setSelectedColor] = useState('#ff0000');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startCard, setStartCard] = useState(null);
  const [canvasContext, setCanvasContext] = useState(null);
  
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
    if (!isLoading && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      setCanvasContext(ctx);
      
      // Set canvas size
      canvas.width = window.innerWidth - 40;
      canvas.height = window.innerHeight - 200;
    }
  }, [isLoading]);

  useEffect(() => {
    if (canvasContext) {
      redrawCanvas();
    }
  }, [dependencies, canvasContext, cards]);

  const redrawCanvas = () => {
    if (!canvasContext) return;
    
    // Clear canvas
    canvasContext.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Draw all dependency lines
    dependencies.forEach(dep => {
      const startCard = cards.find(c => c._id === dep.fromCardId);
      const endCard = cards.find(c => c._id === dep.toCardId);
      
      if (startCard && endCard) {
        const startPos = getCardPosition(startCard);
        const endPos = getCardPosition(endCard);
        
        drawLine(startPos, endPos, dep.color);
      }
    });
  };

  const getCardPosition = (card) => {
    // Calculate card position based on list and card index
    const list = lists.find(l => l._id === card.listId);
    const listIndex = lists.findIndex(l => l._id === card.listId);
    const cardIndex = lists[listIndex]?.cards?.findIndex(c => c._id === card._id) || 0;
    
    const x = 50 + listIndex * 250;
    const y = 100 + cardIndex * 120;
    
    return { x, y, width: 200, height: 100 };
  };

  const drawLine = (start, end, color) => {
    if (!canvasContext) return;
    
    canvasContext.strokeStyle = color;
    canvasContext.lineWidth = 3;
    canvasContext.beginPath();
    canvasContext.moveTo(start.x + start.width / 2, start.y + start.height / 2);
    canvasContext.lineTo(end.x + end.width / 2, end.y + end.height / 2);
    canvasContext.stroke();
    
    // Draw arrowhead
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const arrowLength = 15;
    const arrowAngle = Math.PI / 6;
    
    canvasContext.beginPath();
    canvasContext.moveTo(end.x + end.width / 2, end.y + end.height / 2);
    canvasContext.lineTo(
      end.x + end.width / 2 - arrowLength * Math.cos(angle - arrowAngle),
      end.y + end.height / 2 - arrowLength * Math.sin(angle - arrowAngle)
    );
    canvasContext.moveTo(end.x + end.width / 2, end.y + end.height / 2);
    canvasContext.lineTo(
      end.x + end.width / 2 - arrowLength * Math.cos(angle + arrowAngle),
      end.y + end.height / 2 - arrowLength * Math.sin(angle + arrowAngle)
    );
    canvasContext.stroke();
  };

  const handleCardMouseDown = (cardId) => {
    setIsDrawing(true);
    setStartCard(cardId);
  };

  const handleCardMouseUp = (cardId) => {
    if (isDrawing && startCard && startCard !== cardId) {
      // Create new dependency
      const newDependency = {
        id: `${startCard}-${cardId}`,
        fromCardId: startCard,
        toCardId: cardId,
        color: selectedColor,
        createdAt: new Date()
      };
      
      setDependencies(prev => [...prev, newDependency]);
    }
    
    setIsDrawing(false);
    setStartCard(null);
  };

  const removeDependency = (dependencyId) => {
    setDependencies(prev => prev.filter(d => d.id !== dependencyId));
  };

  const clearAllDependencies = () => {
    setDependencies([]);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="drawing-board">
      <div className="drawing-header" style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
        <h1>{board.title} - Dependencies</h1>
        
        <div className="drawing-controls" style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '10px' }}>
          <div className="control-group">
            <label htmlFor="line-color">Line Color: </label>
            <input
              id="line-color"
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              style={{ width: '50px', height: '30px' }}
            />
          </div>
          
          <button
            onClick={clearAllDependencies}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear All Dependencies
          </button>
          
          <div className="instructions" style={{ color: '#666', fontSize: '14px' }}>
            <strong>Instructions:</strong> Click and drag from one card to another to create a dependency line.
          </div>
        </div>
      </div>
      
      <div className="drawing-content" style={{ position: 'relative' }}>
        {/* Canvas for drawing lines */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
        
        {/* Cards grid */}
        <div className="cards-grid" style={{ position: 'relative', zIndex: 2 }}>
          {lists.map((list, listIndex) => (
            <div key={list._id} className="list-column" style={{ 
              display: 'inline-block', 
              verticalAlign: 'top', 
              margin: '0 20px',
              minWidth: '220px'
            }}>
              <h3 className="list-title" style={{ 
                padding: '10px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '4px',
                marginBottom: '10px'
              }}>
                {list.title}
              </h3>
              
              {cards.filter(card => card.listId === list._id).map((card, cardIndex) => (
                <div
                  key={card._id}
                  className="card-item"
                  style={{
                    padding: '15px',
                    margin: '10px 0',
                    backgroundColor: card.color || '#ffffff',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    position: 'relative',
                    minHeight: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  onMouseDown={() => handleCardMouseDown(card._id)}
                  onMouseUp={() => handleCardMouseUp(card._id)}
                >
                  <div className="card-content">
                    <div className="card-title" style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                      {card.title}
                    </div>
                    {card.description && (
                      <div className="card-description" style={{ fontSize: '12px', color: '#666' }}>
                        {card.description.substring(0, 50)}...
                      </div>
                    )}
                  </div>
                  
                  {/* Dependency indicators */}
                  <div className="dependency-indicators" style={{ position: 'absolute', top: '5px', right: '5px' }}>
                    {dependencies.filter(d => d.fromCardId === card._id).length > 0 && (
                      <span style={{ 
                        backgroundColor: '#4CAF50', 
                        color: 'white', 
                        padding: '2px 6px', 
                        borderRadius: '10px', 
                        fontSize: '10px',
                        marginRight: '5px'
                      }}>
                        {dependencies.filter(d => d.fromCardId === card._id).length}
                      </span>
                    )}
                    {dependencies.filter(d => d.toCardId === card._id).length > 0 && (
                      <span style={{ 
                        backgroundColor: '#2196F3', 
                        color: 'white', 
                        padding: '2px 6px', 
                        borderRadius: '10px', 
                        fontSize: '10px'
                      }}>
                        {dependencies.filter(d => d.toCardId === card._id).length}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Dependencies list */}
      <div className="dependencies-list" style={{ padding: '20px', borderTop: '1px solid #eee' }}>
        <h3>Dependencies ({dependencies.length})</h3>
        {dependencies.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No dependencies created yet.</p>
        ) : (
          <div className="dependencies-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '10px' }}>
            {dependencies.map(dep => {
              const fromCard = cards.find(c => c._id === dep.fromCardId);
              const toCard = cards.find(c => c._id === dep.toCardId);
              
              return (
                <div key={dep.id} className="dependency-item" style={{
                  padding: '15px',
                  border: `3px solid ${dep.color}`,
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9',
                  position: 'relative'
                }}>
                  <div className="dependency-content">
                    <div className="dependency-from">
                      <strong>From:</strong> {fromCard?.title || 'Unknown Card'}
                    </div>
                    <div className="dependency-to">
                      <strong>To:</strong> {toCard?.title || 'Unknown Card'}
                    </div>
                    <div className="dependency-color">
                      <strong>Color:</strong> 
                      <span style={{ 
                        display: 'inline-block', 
                        width: '20px', 
                        height: '20px', 
                        backgroundColor: dep.color, 
                        border: '1px solid #ccc',
                        marginLeft: '10px',
                        verticalAlign: 'middle'
                      }}></span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeDependency(dep.id)}
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      padding: '4px 8px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
