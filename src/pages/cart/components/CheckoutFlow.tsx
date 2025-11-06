import { useState } from 'react';
import { useCartQuery, useCartItemsQuery } from '@/hooks/data/useCartQuery';
import { useCreateOrderMutation } from '@/hooks/data/useOrdersQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  CreditCard, 
  Wallet, 
  Building2, 
  MapPin, 
  CheckCircle2,
  Loader2 
} from 'lucide-react';
import { toast } from 'sonner';
import type { CreateOrderRequest } from '@/types/sales';

interface CheckoutFlowProps {
  farmerId: string;
  onBack: () => void;
}

export function CheckoutFlow({ farmerId, onBack }: CheckoutFlowProps) {
  const [step, setStep] = useState<'address' | 'payment' | 'confirm'>('address');
  const [paymentMethod, setPaymentMethod] = useState<string>('upi');
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    landmark: '',
  });
  const [notes, setNotes] = useState('');

  const { data: cart } = useCartQuery(farmerId);
  const { data: cartItems = [] } = useCartItemsQuery(cart?.id);
  const createOrderMutation = useCreateOrderMutation();

  const subtotal = cartItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const taxAmount = subtotal * 0.18;
  const total = subtotal + taxAmount;

  const handlePlaceOrder = async () => {
    if (!cart) {
      toast.error('No active cart found');
      return;
    }

    try {
      const orderData: CreateOrderRequest = {
        farmer_id: farmerId,
        order_type: 'direct_purchase',
        order_source: 'tenant_dashboard',
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
        delivery_address: deliveryAddress,
        payment_method: paymentMethod,
        notes,
      };

      await createOrderMutation.mutateAsync(orderData);
      toast.success('Order placed successfully!');
      onBack();
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    }
  };

  const isAddressValid = deliveryAddress.street && deliveryAddress.city && 
                        deliveryAddress.state && deliveryAddress.postal_code;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Checkout</h2>
          <p className="text-muted-foreground">Complete your order in 3 easy steps</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        {[
          { id: 'address', label: 'Address', icon: MapPin },
          { id: 'payment', label: 'Payment', icon: CreditCard },
          { id: 'confirm', label: 'Confirm', icon: CheckCircle2 },
        ].map((s, idx) => (
          <div key={s.id} className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                  step === s.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted bg-background'
                }`}
              >
                <s.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
            </div>
            {idx < 2 && <div className="h-0.5 w-12 bg-border" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {step === 'address' && (
            <Card>
              <CardHeader>
                <CardTitle>Delivery Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      placeholder="Enter street address"
                      value={deliveryAddress.street}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="Enter city"
                        value={deliveryAddress.city}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        placeholder="Enter state"
                        value={deliveryAddress.state}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, state: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postal">Postal Code</Label>
                      <Input
                        id="postal"
                        placeholder="Enter postal code"
                        value={deliveryAddress.postal_code}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, postal_code: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="landmark">Landmark (Optional)</Label>
                      <Input
                        id="landmark"
                        placeholder="Enter landmark"
                        value={deliveryAddress.landmark}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, landmark: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => setStep('payment')}
                  disabled={!isAddressValid}
                >
                  Continue to Payment
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 'payment' && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    {[
                      { id: 'upi', label: 'UPI', icon: Wallet, desc: 'Pay via UPI apps' },
                      { id: 'card', label: 'Credit/Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
                      { id: 'cod', label: 'Cash on Delivery', icon: Building2, desc: 'Pay when delivered' },
                    ].map((method) => (
                      <label
                        key={method.id}
                        className="flex items-center gap-4 p-4 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
                      >
                        <RadioGroupItem value={method.id} id={method.id} />
                        <method.icon className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <div className="font-medium">{method.label}</div>
                          <div className="text-sm text-muted-foreground">{method.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </RadioGroup>

                <div className="space-y-2">
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any special instructions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep('address')}>
                    Back
                  </Button>
                  <Button className="flex-1" onClick={() => setStep('confirm')}>
                    Review Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'confirm' && (
            <Card>
              <CardHeader>
                <CardTitle>Review & Confirm</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Address Summary */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Delivery Address
                  </h4>
                  <div className="text-sm text-muted-foreground">
                    {deliveryAddress.street}, {deliveryAddress.city}<br />
                    {deliveryAddress.state}, {deliveryAddress.postal_code}<br />
                    {deliveryAddress.country}
                  </div>
                </div>

                <Separator />

                {/* Payment Method */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment Method
                  </h4>
                  <Badge variant="secondary">{paymentMethod.toUpperCase()}</Badge>
                </div>

                {notes && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Order Notes</h4>
                      <p className="text-sm text-muted-foreground">{notes}</p>
                    </div>
                  </>
                )}

                <Separator />

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep('payment')}>
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handlePlaceOrder}
                    disabled={createOrderMutation.isPending}
                  >
                    {createOrderMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.product_id} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      ₹{(item.unit_price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (18%)</span>
                  <span>₹{taxAmount.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
