import { supabase } from '@/integrations/supabase/client';

export interface PaymentIntentData {
  tenantId?: string;
  farmerId?: string;
  userId: string;
  subscriptionType: 'tenant' | 'farmer';
  planId: string;
  amount: number;
  currency?: string;
  billingInterval: 'monthly' | 'quarterly' | 'annually';
}

export interface DummyPaymentMethod {
  type: 'card' | 'upi' | 'netbanking' | 'wallet';
  data: {
    cardNumber?: string;
    upiId?: string;
    bankName?: string;
    walletName?: string;
  };
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  intentId: string;
  error?: string;
}

export class PaymentService {
  static async createPaymentIntent(data: PaymentIntentData) {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const { data: intent, error } = await supabase
      .from('payment_intents')
      .insert({
        tenant_id: data.tenantId,
        farmer_id: data.farmerId,
        user_id: data.userId,
        subscription_type: data.subscriptionType,
        plan_id: data.planId,
        amount: data.amount,
        currency: data.currency || 'INR',
        status: 'pending',
        expires_at: expiresAt.toISOString(),
      } as any)
      .select()
      .single();

    if (error) throw error;
    return intent;
  }

  static async getPaymentIntent(intentId: string) {
    const { data, error } = await supabase
      .from('payment_intents')
      .select('*')
      .eq('id', intentId)
      .single();

    if (error) throw error;
    return data;
  }

  static async processDummyPayment(
    intentId: string,
    paymentMethod: DummyPaymentMethod
  ): Promise<PaymentResult> {
    await this.simulateDelay(1500, 3000);

    const intent = await this.getPaymentIntent(intentId);
    if (!intent) throw new Error('Payment intent not found');

    if (new Date(intent.expires_at) < new Date()) {
      await this.updatePaymentIntent(intentId, {
        status: 'cancelled',
        error_message: 'Payment intent expired',
      });
      return { success: false, intentId, error: 'Payment intent expired. Please try again.' };
    }

    const isSuccess = this.shouldPaymentSucceed(paymentMethod);
    
    if (isSuccess) {
      const transactionId = this.generateTransactionId();
      
      await this.updatePaymentIntent(intentId, {
        status: 'succeeded',
        payment_method: paymentMethod.type,
        transaction_id: transactionId,
        dummy_payment_data: paymentMethod.data,
      });

      await this.recordTransaction({
        intentId,
        tenantId: intent.tenant_id,
        farmerId: intent.farmer_id,
        amount: intent.amount,
        transactionId,
        paymentMethod: paymentMethod.type,
        subscriptionType: intent.subscription_type,
        planId: intent.plan_id,
      });

      return { success: true, transactionId, intentId };
    } else {
      const errorMessage = this.getRandomPaymentError();
      
      await this.updatePaymentIntent(intentId, {
        status: 'failed',
        payment_method: paymentMethod.type,
        error_message: errorMessage,
        dummy_payment_data: paymentMethod.data,
      });

      return { success: false, intentId, error: errorMessage };
    }
  }

  private static async updatePaymentIntent(intentId: string, updates: any) {
    const { error } = await supabase
      .from('payment_intents')
      .update(updates)
      .eq('id', intentId);

    if (error) throw error;
  }

  private static async recordTransaction(data: any) {
    const { error } = await supabase
      .from('payment_transactions')
      .insert({
        tenant_id: data.tenantId,
        type: 'subscription_payment' as any,
        status: 'completed',
        amount: data.amount,
        currency: 'INR',
        payment_method: data.paymentMethod as any,
        transaction_reference: data.transactionId,
        metadata: {
          payment_intent_id: data.intentId,
          subscription_type: data.subscriptionType,
        } as any,
      } as any);

    if (error) throw error;
  }

  private static async simulateDelay(minMs: number, maxMs: number) {
    const delay = minMs + Math.random() * (maxMs - minMs);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  private static shouldPaymentSucceed(method: DummyPaymentMethod): boolean {
    if (method.type === 'card' && method.data.cardNumber === '4000000000000002') return false;
    if (method.type === 'upi' && method.data.upiId?.includes('failure')) return false;
    return Math.random() > 0.1;
  }

  private static generateTransactionId(): string {
    const prefix = 'TXN';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}_${timestamp}_${random}`;
  }

  private static getRandomPaymentError(): string {
    const errors = [
      'Insufficient funds in account',
      'Payment declined by bank',
      'Card expired',
      'Invalid UPI PIN',
      'Transaction timeout',
    ];
    return errors[Math.floor(Math.random() * errors.length)];
  }

  static async savePaymentMethod(userId: string, method: any) {
    const { data, error } = await supabase
      .from('payment_methods')
      .insert({
        user_id: userId,
        type: method.type,
        last_four: method.details.lastFour,
        is_default: method.isDefault || false,
      } as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async generateInvoice(data: any) {
    const invoiceNumber = `INV-${Date.now()}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15);

    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        tenant_id: data.tenantId,
        subscription_id: data.subscriptionId,
        invoice_number: invoiceNumber,
        amount: data.amount,
        currency: data.currency,
        status: 'paid' as any,
        due_date: dueDate.toISOString(),
        paid_date: new Date().toISOString(),
        description: data.description,
      } as any)
      .select()
      .single();

    if (error) throw error;
    return invoice;
  }
}
