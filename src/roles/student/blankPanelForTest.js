import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';


const LoadingWheelPanel = () => {
  return (
    <div style={{  display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <CircularProgress color="inherit" size={70} />
    </div>
  );
};

export default LoadingWheelPanel;
