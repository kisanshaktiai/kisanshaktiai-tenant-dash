import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/card';
import { ProductBrowser } from './components/ProductBrowser';
import { CartSummary } from './components/CartSummary';
import { CheckoutFlow } from './components/CheckoutFlow';
import { DndProvider } from './components/DndProvider';
import { ShoppingCart, Package } from 'lucide-react';

export default function CartManagement() {
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>('farmer-1'); // Mock - would come from farmer selector
  const [showCheckout, setShowCheckout] = useState(false);

  return (
    <DndProvider farmerId={selectedFarmerId}>
      <PageLayout maxWidth="none">
        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <ShoppingCart className="h-8 w-8" />
              Cart Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage farmer orders with drag & drop
            </p>
          </div>
        </div>

        {showCheckout ? (
          <CheckoutFlow
            farmerId={selectedFarmerId}
            onBack={() => setShowCheckout(false)}
          />
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Product Browser */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Product Catalog</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Drag products to cart or click to add
                </p>
                <ProductBrowser farmerId={selectedFarmerId} />
              </Card>
            </div>

            {/* Right: Cart Summary */}
            <div className="lg:col-span-1">
              <CartSummary
                farmerId={selectedFarmerId}
                onCheckout={() => setShowCheckout(true)}
              />
            </div>
          </div>
        )}
        </div>
      </PageLayout>
    </DndProvider>
  );
}
