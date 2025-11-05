import Modern2025ProductInventory from './Modern2025ProductInventory';

export interface ProductListProps {
  searchTerm: string;
  selectedProducts?: string[];
  onSelectedProductsChange?: (products: string[]) => void;
}

const ProductList: React.FC<ProductListProps> = ({ 
  searchTerm, 
  selectedProducts = [], 
  onSelectedProductsChange 
}) => {
  return (
    <Modern2025ProductInventory
      searchTerm={searchTerm}
    />
  );
};

export default ProductList;
