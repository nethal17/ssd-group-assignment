import React from 'react';
import { useNavigate } from 'react-router-dom';

const Cancel = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Payment Canceled</h1>
      <button onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );
};

export default Cancel;