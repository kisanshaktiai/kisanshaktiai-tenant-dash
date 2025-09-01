
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Card>
      <CardHeader>
        <CardTitle>Product List</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Search term: {searchTerm}</p>
        <p>Selected products: {selectedProducts.length}</p>
        <p>Product list functionality coming soon...</p>
      </CardContent>
    </Card>
  );
};

export default ProductList;
