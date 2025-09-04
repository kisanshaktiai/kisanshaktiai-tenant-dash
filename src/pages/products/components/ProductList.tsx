
import EnhancedProductList from './EnhancedProductList';

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
    <EnhancedProductList
      searchTerm={searchTerm}
      selectedProducts={selectedProducts}
      onSelectedProductsChange={onSelectedProductsChange || (() => {})}
    />
  );
};

export default ProductList;
