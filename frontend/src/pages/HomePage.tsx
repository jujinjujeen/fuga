import { useState } from 'react';
import { ControlBar } from '../components/ControlBar';
import { Sidebar } from '../components/UI/Sidebar';
import { ProductForm } from '../components/Sidebar/ProductForm';
import { ProductList } from '../components/ProductList';
import { PageLayout } from '../layouts/PageLayout';

export const HomePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleProductCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <PageLayout>
      <ControlBar onAdd={() => setIsOpen(true)} />
      <ProductList refreshTrigger={refreshTrigger} />

      {/* Generic Sidebar with ProductForm as children */}
      <Sidebar isOpen={isOpen} onClose={handleClose} ariaLabel="Product form">
        <ProductForm
          mode="create"
          onSuccess={handleProductCreated}
          onClose={handleClose}
        />
      </Sidebar>
    </PageLayout>
  );
};

export default HomePage;
