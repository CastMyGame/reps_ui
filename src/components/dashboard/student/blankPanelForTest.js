import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const LoadingWheelPanel = () => {
  return (
    <div style={{ height:"50vh",backgroundColor:"white",textAlign: 'center', marginTop: '50px' }}>
      <h1>Loading...</h1>
      <FontAwesomeIcon icon={faSpinner} spin size="3x" style={{ color: 'blue', marginTop: '20px' }} />
    </div>
  );
};

export default LoadingWheelPanel;
