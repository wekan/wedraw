import React from 'react';

const SpinnerComponent = ({ type = 'wave', size = 'medium', className = '' }) => {
  const containerStyle = {
    display: 'inline-block',
    transform: size === 'small' ? 'scale(0.5)' : size === 'large' ? 'scale(1.5)' : 'scale(1)'
  };

  const renderSpinner = () => {
    switch (type) {
      case 'wave':
        return (
          <div style={{
            margin: '100px auto',
            textAlign: 'center',
            fontSize: '10px'
          }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{
                backgroundColor: '#333',
                height: '100%',
                width: '6px',
                display: 'inline-block',
                animation: 'sk-stretchdelay 1.2s infinite ease-in-out',
                animationDelay: `${-1.2 + i * 0.1}s`
              }}></div>
            ))}
          </div>
        );
      
      case 'dot':
        return (
          <div style={{
            margin: '100px auto',
            textAlign: 'center',
            fontSize: '10px'
          }}>
            {[1, 2].map((i) => (
              <div key={i} style={{
                backgroundColor: '#333',
                borderRadius: '100%',
                display: 'inline-block',
                width: '12px',
                height: '12px',
                margin: '0 3px',
                animation: 'sk-bouncedelay 1.4s infinite ease-in-out both',
                animationDelay: `${-0.32 + i * 0.16}s`
              }}></div>
            ))}
          </div>
        );
      
      default:
        return (
          <div style={{
            margin: '100px auto',
            textAlign: 'center',
            fontSize: '10px'
          }}>
            <div style={{
              backgroundColor: '#333',
              height: '100%',
              width: '6px',
              display: 'inline-block',
              animation: 'sk-stretchdelay 1.2s infinite ease-in-out'
            }}></div>
          </div>
        );
    }
  };

  return (
    <div style={containerStyle}>
      {renderSpinner()}
    </div>
  );
};

export default SpinnerComponent;
