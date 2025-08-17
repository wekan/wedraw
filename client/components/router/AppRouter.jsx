import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

// Import components
import Header from '../main/Header';
import BoardsList from '../boards/BoardsList';
import Sidebar from '../main/Sidebar';
import MyCards from '../main/MyCards';
import GlobalSearch from '../main/GlobalSearch';
import PopupContainer from '../main/Popup';
import SpinnerComponent from '../main/SpinnerComponent';
import Settings from '../settings/Settings';
import SignIn from '../auth/SignIn';
import SignUp from '../auth/SignUp';
import Profile from '../auth/Profile';
import SettingsPage from '../settings/Settings';

// Import existing components
import { App } from '/imports/ui/App';
import { DrawingBoard } from '/imports/ui/DrawingBoard';
import LoginPage from '../auth/LoginPage';

// Import translations and i18n system
import { TAPi18n } from '/imports/i18n';

// Layout Component
const Layout = ({ children }) => {
  const { currentUser, isLoading, isI18nReady } = useTracker(() => {
    return {
      currentUser: Meteor.user(),
      isLoading: !Meteor.loggingIn() && !Meteor.userId(),
      isI18nReady: TAPi18n && TAPi18n.i18n && TAPi18n.i18n.isInitialized
    };
  }, []);

  if (isLoading || !isI18nReady) {
    return <SpinnerComponent type="wave" size="large" />;
  }

  // If no user, show the login page
  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

// Home Component
const Home = () => {
  const currentUser = useTracker(() => Meteor.user(), []);

  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [isAddBoardOpen, setIsAddBoardOpen] = useState(false);
  
  // Stable callback for board selection
  const handleBoardSelect = useCallback((boardId) => {
    setSelectedBoardId(boardId);
  }, []);
  const [newBoardData, setNewBoardData] = useState({
    title: '',
    description: '',
    color: '#0079BF'
  });
  const [isCreating, setIsCreating] = useState(false);
  const [boards, setBoards] = useState([]);

  // Load existing boards from user profile
  useEffect(() => {
    if (currentUser && currentUser.profile && currentUser.profile.boards) {
      setBoards(currentUser.profile.boards);
    }
  }, [currentUser]);

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="home-page">
      {/* Grey Area with Sidebar and Content */}
      <div className="main-content" style={{ display: 'flex' }}>
        {/* Left Sidebar */}
        {useMemo(() => (
          <Sidebar 
            onBoardSelect={handleBoardSelect}
            selectedBoardId={selectedBoardId}
          />
        ), [handleBoardSelect, selectedBoardId])}
        
        {/* Main Content Area */}
        <div className="main-content-area">
          <div className="boards-list-area">
            {/* Add Board Button */}
            <div style={{ marginBottom: '30px', textAlign: 'right' }}>
              <button 
                className="add-board-btn"
                onClick={() => setIsAddBoardOpen(true)}
              >
                Add Board
              </button>
            </div>
            
            {/* Display existing boards */}
            {boards.length > 0 && (
              <div style={{ marginTop: '30px' }}>
                <h3>Your Boards</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                  {boards.map(board => (
                    <div
                      key={board._id}
                      style={{
                        backgroundColor: board.color || '#0079BF',
                        color: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                      onClick={() => setSelectedBoardId(board._id)}
                    >
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{board.title}</h4>
                      {board.description && (
                        <p style={{ margin: '0 0 15px 0', opacity: 0.9, fontSize: '14px' }}>
                          {board.description}
                        </p>
                      )}
                      <div style={{ fontSize: '12px', opacity: 0.8 }}>
                        Created: {board.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

        {/* Add Board Modal */}
        {isAddBoardOpen && (
          <div className="add-board-modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999
          }}>
            <div className="add-board-modal-content" style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '500px',
              zIndex: 100000,
              position: 'relative'
            }}>
              <h2 style={{ marginTop: 0 }}>Create New Board</h2>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsCreating(true);
                try {
                  const boardId = await new Promise((resolve, reject) => {
                    Meteor.call('createBoard', newBoardData, (error, result) => {
                      if (error) reject(error);
                      else resolve(result);
                    });
                  });
                  const newBoard = {
                    _id: boardId,
                    title: newBoardData.title,
                    description: newBoardData.description,
                    color: newBoardData.color,
                    createdAt: new Date()
                  };
                  setBoards(prev => [...prev, newBoard]);
                  setIsAddBoardOpen(false);
                  setNewBoardData({ title: '', description: '', color: '#0079BF' });
                  alert(`Board "${newBoard.title}" created successfully!`);
                } catch (error) {
                  console.error('Error creating board:', error);
                  alert('Error creating board: ' + error.message);
                } finally {
                  setIsCreating(false);
                }
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Title:
                  </label>
                  <input
                    type="text"
                    value={newBoardData.title}
                    onChange={(e) => setNewBoardData(prev => ({ ...prev, title: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Description:
                  </label>
                  <textarea
                    value={newBoardData.description}
                    onChange={(e) => setNewBoardData(prev => ({ ...prev, description: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      minHeight: '80px'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Color:
                  </label>
                  <input
                    type="color"
                    value={newBoardData.color}
                    onChange={(e) => setNewBoardData(prev => ({ ...prev, color: e.target.value }))}
                    style={{
                      width: '50px',
                      height: '40px',
                      border: 'none',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddBoardOpen(false);
                      setNewBoardData({ title: '', description: '', color: '#0079BF' });
                    }}
                    style={{
                      padding: '10px 20px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#0079BF',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {isCreating ? 'Creating...' : 'Create Board'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Board Component - Simple placeholder
const Board = () => {
  return (
    <div className="board-page">
      <h1>Board View</h1>
      <p>Board functionality coming soon...</p>
    </div>
  );
};

// MyCards Component
const MyCardsPage = () => {
  const { currentUser } = useTracker(() => {
    return {
      currentUser: Meteor.user()
    };
  }, []);

  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <div className="my-cards-page">
      <MyCards />
    </div>
  );
};

// Search Component
const SearchPage = () => {
  const { currentUser } = useTracker(() => {
    return {
      currentUser: Meteor.user()
    };
  }, []);

  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <div className="search-page">
      <GlobalSearch />
    </div>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-page">
          <h1>Something went wrong</h1>
          <p>We're sorry, but something unexpected happened.</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Create the router configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <Layout>
          <Home />
        </Layout>
      </ErrorBoundary>
    ),
  },
  {
    path: '/board/:boardId/:slug',
    element: (
      <ErrorBoundary>
        <Layout>
          <Board />
        </Layout>
      </ErrorBoundary>
    ),
  },
  {
    path: '/my-cards',
    element: (
      <ErrorBoundary>
        <Layout>
          <MyCardsPage />
        </Layout>
      </ErrorBoundary>
    ),
  },
  {
    path: '/search',
    element: (
      <ErrorBoundary>
        <Layout>
          <SearchPage />
        </Layout>
      </ErrorBoundary>
    ),
  },
  {
    path: '/signin',
    element: <SignIn />,
  },
  {
    path: '/sign-in',
    element: <SignIn />,
  },
  {
    path: '/signup',
    element: <SignUp />,
  },
  {
    path: '/sign-up',
    element: <SignUp />,
  },
  {
    path: '/settings',
    element: (
      <ErrorBoundary>
        <Layout>
          <SettingsPage />
        </Layout>
      </ErrorBoundary>
    ),
  },
  {
    path: '/profile',
    element: (
      <ErrorBoundary>
        <Layout>
          <Profile />
        </Layout>
      </ErrorBoundary>
    ),
  },
  {
    path: '/draw',
    element: (
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    ),
    children: [
      {
        index: true,
        element: <DrawingBoard />
      },
      {
        path: ':boardId',
        element: <DrawingBoard />
      }
    ]
  },
  {
    path: '*',
    element: (
      <div className="not-found-page">
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <a href="/">Go Home</a>
      </div>
    ),
  },
]);

// Main Router Component
const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
