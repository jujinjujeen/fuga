import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { ControlBar, ProductList } from '../features/products/components';
import { PageLayout } from '../layouts/PageLayout';
import type { Product } from '@f/types/api-schemas';
import { useDebounce } from '../hooks/useDebounce';

export const HomePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // Only search if query has 3+ characters or is empty (to show all products)
  const searchQuery =
    debouncedSearch.length >= 3 || debouncedSearch.length === 0
      ? debouncedSearch
      : undefined;

  const handleAddProduct = () => {
    navigate('create');
  };

  const handleProductClick = (product: Product) => {
    navigate(`edit/${product.id}`);
  };

  return (
    <PageLayout>
      <ControlBar
        onAdd={handleAddProduct}
        search={search}
        onSearchChange={setSearch}
      />
      <ProductList search={searchQuery} onProductClick={handleProductClick} />

      {/* Child routes (modals) render here as overlay */}
      <Outlet />
    </PageLayout>
  );
};

export default HomePage;
