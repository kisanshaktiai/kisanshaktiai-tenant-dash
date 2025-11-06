import { ReactNode } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useCartQuery, useCreateCartMutation, useAddToCartMutation } from '@/hooks/data/useCartQuery';
import { toast } from 'sonner';

interface DndProviderProps {
  children: ReactNode;
  farmerId: string;
}

export function DndProvider({ children, farmerId }: DndProviderProps) {
  const { data: cart } = useCartQuery(farmerId);
  const createCartMutation = useCreateCartMutation();
  const addToCartMutation = useAddToCartMutation();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && over.id === 'cart-drop-zone') {
      const product = active.data.current?.product;
      if (!product) return;

      try {
        let cartId = cart?.id;

        // Create cart if it doesn't exist
        if (!cartId) {
          const newCart = await createCartMutation.mutateAsync({ farmerId });
          cartId = newCart.id;
        }

        await addToCartMutation.mutateAsync({
          cartId,
          farmerId,
          data: {
            product_id: product.id,
            quantity: 1,
          },
        });
      } catch (error: any) {
        toast.error(error.message || 'Failed to add to cart');
      }
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {children}
    </DndContext>
  );
}
