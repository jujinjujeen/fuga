import { useNavigate } from 'react-router';
import { ProductSidebar } from '../features/product/components/ProductSidebar';

export const CreateModal = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  return (
    <ProductSidebar
      isOpen={true}
      onClose={handleClose}
      mode="create"
    />
  );
};

export default CreateModal;
