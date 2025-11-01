import { useState } from 'react';
import { ControlBar } from '../components/ControlBar/ControlBar';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { PageLayout } from '../layouts/PageLayout';

export const HomePage = () => {
  const [isOpen, setIsOpen] = useState(false);

  // TODO: move sidebar to the route level
  return (
    <PageLayout>
      <ControlBar
        onAdd={() => {
          setIsOpen(true);
        }}
      />
      <Sidebar
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      />
    </PageLayout>
  );
};

export default HomePage;
