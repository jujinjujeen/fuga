import { Route, Routes } from 'react-router';
import HomePage from './pages/HomePage';
import './App.css';
import React from 'react';

const CreateModal = React.lazy(() => import('./pages/CreateModal'));
const EditModal = React.lazy(() => import('./pages/EditModal'));

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />}>
        <Route path="create" element={<CreateModal />} />
        <Route path="edit/:productId" element={<EditModal />} />
      </Route>
    </Routes>
  );
}

export default App;
