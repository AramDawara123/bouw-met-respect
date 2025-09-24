import { supabase } from "@/integrations/supabase/client";

interface DiscountCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  minimum_order_amount: number;
  usage_limit?: number | null;
  used_count: number;
  active: boolean;
  applies_to: 'products' | 'memberships' | 'partners';
  starts_at: string;
  expires_at?: string | null;
}

export interface DiscountValidationResult {
  valid: boolean;
  discount?: DiscountCode;
  error?: string;
}

export const validateDiscountCode = async (
  code: string, 
  appliesTo: 'products' | 'memberships' | 'partners',
  orderAmount: number // in cents
): Promise<DiscountValidationResult> => {
  if (!code.trim()) {
    return { valid: false, error: "Voer een kortingscode in" };
  }

  try {
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('applies_to', appliesTo)
      .single();

    if (error || !data) {
      return { valid: false, error: "Ongeldige kortingscode" };
    }

    const discount = data as DiscountCode;

    // Check if code is active
    if (!discount.active) {
      return { valid: false, error: "Deze kortingscode is niet actief" };
    }

    // Check if code has expired
    if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
      return { valid: false, error: "Deze kortingscode is verlopen" };
    }

    // Check if code has reached usage limit
    if (discount.usage_limit && discount.used_count >= discount.usage_limit) {
      return { valid: false, error: "Deze kortingscode is al opgebruikt" };
    }

    // Check if order meets minimum amount
    if (orderAmount < discount.minimum_order_amount) {
      const minAmount = (discount.minimum_order_amount / 100).toFixed(2);
      return { 
        valid: false, 
        error: `Minimale bestelling van €${minAmount} vereist voor deze kortingscode` 
      };
    }

    return { valid: true, discount };
  } catch (error) {
    console.error('Error validating discount code:', error);
    return { valid: false, error: "Kon kortingscode niet controleren" };
  }
};

export const calculateDiscount = (
  discount: DiscountCode, 
  orderAmount: number // in cents
): number => {
  if (discount.discount_type === 'percentage') {
    return Math.round((orderAmount * discount.discount_value) / 100);
  } else {
    return Math.min(discount.discount_value, orderAmount);
  }
};

export const formatDiscountDisplay = (discount: DiscountCode): string => {
  if (discount.discount_type === 'percentage') {
    return `${discount.discount_value}% korting`;
  } else {
    return `€${(discount.discount_value / 100).toFixed(2)} korting`;
  }
};