import { useState } from 'react';
import { ControlBar } from '../components/ControlBar';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { ProductList } from '../components/ProductList';
import { PageLayout } from '../layouts/PageLayout';

export const HomePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleProductCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <PageLayout>
      <ControlBar
        onAdd={() => {
          setIsOpen(true);
        }}
      />
      <ProductList refreshTrigger={refreshTrigger} />
      <Sidebar
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        onProductCreated={handleProductCreated}
      />
    </PageLayout>
  );
};

export default HomePage;
