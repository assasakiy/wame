export interface ChargeResult {
  status: "paid" | "pending" | "failed";
  provider: string;
}

/** Payment gateway port. Implement Midtrans/Xendit/Stripe here and return it from `getPaymentProvider`. */
export interface PaymentProvider {
  charge(input: { tenantId: string; amount: number; description: string }): Promise<ChargeResult>;
}

class SandboxProvider implements PaymentProvider {
  async charge(): Promise<ChargeResult> {
    return { status: "paid", provider: "sandbox" };
  }
}

export const getPaymentProvider = (): PaymentProvider => new SandboxProvider();
