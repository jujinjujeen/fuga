import { useState } from 'react';
import { ControlBar } from '../components/ControlBar';
import { Sidebar } from '../components/UI/Sidebar';
// import { CreateProductForm, EditProductForm } from '../components/ProductForm';

import { ProductList } from '../components/ProductList';
import { PageLayout } from '../layouts/PageLayout';
import { getProductForEdit } from '../api/products';
import type { Product } from '@f/types/api-schemas';
import { CreateProductForm } from '../features/product/components/CreateProductForm';
import { ProductSidebar } from '../features/product/components/ProductSidebar';

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
      const { product: freshProduct, etag: freshEtag } =
        await getProductForEdit(product.id);
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

      {/* Generic Sidebar with separate Create/Edit forms */}
      {/* <Sidebar isOpen={isOpen} onClose={handleClose} ariaLabel="Product form"> */}
      {/* {selectedProduct && etag ? (
          <EditProductForm
            key={`edit-${selectedProduct.id}`}
            product={selectedProduct}
            productId={selectedProduct.id}
            etag={etag}
            onSuccess={handleProductSuccess}
            onClose={handleClose}
          />
        ) : (
          <CreateProductForm
            key="create"
            onSuccess={handleProductSuccess}
            onClose={handleClose}
          />
        )} */}
      {/* <CreateProductForm /> */}
      {/* </Sidebar> */}
      <ProductSidebar isOpen={isOpen} onClose={handleClose} mode={'create'} />
    </PageLayout>
  );
};

export default HomePage;
