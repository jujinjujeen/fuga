import { useState } from 'react';
import { ControlBar } from '../components/ControlBar';
import { ProductList } from '../components/ProductList';
import { PageLayout } from '../layouts/PageLayout';
import type { Product } from '@f/types/api-schemas';
import { ProductSidebar } from '../features/product/components/ProductSidebar';
import { getProduct } from '../features/product/api/getProduct';

export const HomePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [etag, setEtag] = useState<string | null>(null);

  const handleClose = () => {
    setIsOpen(false);
    setSelectedProduct(null);
    setEtag(null);
  };

  const handleProductSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setEtag(null);
    setIsOpen(true);
  };

  const handleProductClick = async (product: Product) => {
    try {
      // Fetch product with ETag for optimistic concurrency control
      const { product: freshProduct, etag: freshEtag } = await getProduct(
        product.id
      );
      setSelectedProduct(freshProduct);
      setEtag(freshEtag);
      setIsOpen(true);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      // Fallback: use the product from list (no ETag)
      setSelectedProduct(product);
      setEtag(null);
      setIsOpen(true);
    }
  };

  return (
    <PageLayout>
      <ControlBar onAdd={handleAddProduct} />
      <ProductList
        refreshTrigger={refreshTrigger}
        onProductClick={handleProductClick}
      />

      <ProductSidebar
        isOpen={isOpen}
        onClose={handleClose}
        mode={selectedProduct ? 'edit' : 'create'}
        product={selectedProduct || undefined}
        etag={etag || undefined}
        onSuccess={handleProductSuccess}
      />
    </PageLayout>
  );
};

export default HomePage;
