import { Outlet, useNavigate } from 'react-router';
import { ControlBar, ProductList } from '../features/products/components';
import { PageLayout } from '../layouts/PageLayout';
import type { Product } from '@f/types/api-schemas';

export const HomePage = () => {
  const navigate = useNavigate();

  const handleAddProduct = () => {
    navigate('create');
  };

  const handleProductClick = (product: Product) => {
    navigate(`edit/${product.id}`);
  };

  return (
    <PageLayout>
      <ControlBar onAdd={handleAddProduct} />
      <ProductList onProductClick={handleProductClick} />

      {/* Child routes (modals) render here as overlay */}
      <Outlet />
    </PageLayout>
  );
};

export default HomePage;
