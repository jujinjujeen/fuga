import { Route, Routes } from 'react-router';
import './App.css';
import React from 'react';

const HomePage = React.lazy(() => import('./pages/HomePage'));

function App() {
  return (
    <Routes>
      <Route index element={<HomePage />} />
    </Routes>
  );
}

export default App;
