import React, { useMemo, useEffect } from 'react';
import { formatDiscountDisplay } from '@/lib/discountUtils';

interface RealTimeOrderSummaryProps {
  cartTotal: number;
  discountAmount: number; // in cents
  appliedDiscount?: any;
  onFreeOrderRedirect?: () => void;
}

export const RealTimeOrderSummary: React.FC<RealTimeOrderSummaryProps> = ({
  cartTotal,
  discountAmount,
  appliedDiscount,
  onFreeOrderRedirect
}) => {
  const calculations = useMemo(() => {
    const subtotalCents = Math.round(cartTotal * 100); // Convert to cents
    const discountCents = Math.round(discountAmount || 0);
    const subtotalAfterDiscountCents = Math.max(0, subtotalCents - discountCents);
    const isFreeShipping = subtotalAfterDiscountCents >= 5000 || discountCents >= subtotalCents; // 50 EUR = 5000 cents
    const shippingCents = isFreeShipping ? 0 : 500; // 5 EUR = 500 cents
    const totalCents = subtotalAfterDiscountCents + shippingCents;
    
    return {
      subtotal: subtotalCents / 100,
      discount: discountCents / 100,
      subtotalAfterDiscount: subtotalAfterDiscountCents / 100,
      shipping: shippingCents / 100,
      total: totalCents / 100,
      isFreeShipping,
      isFreeOrder: totalCents === 0
    };
  }, [cartTotal, discountAmount]);

  // Auto-redirect when order becomes free
  useEffect(() => {
    if (calculations.isFreeOrder && calculations.total === 0 && onFreeOrderRedirect) {
      console.log('[RealTimeOrderSummary] Free order detected (€0.00), triggering redirect...');
      setTimeout(() => {
        onFreeOrderRedirect();
      }, 500); // Small delay to show the €0.00 total first
    }
  }, [calculations.isFreeOrder, calculations.total, onFreeOrderRedirect]);

  console.log('[RealTimeOrderSummary] Real-time calculation:', calculations);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Subtotaal:</span>
        <span>€{calculations.subtotal.toFixed(2)}</span>
      </div>
      
      {appliedDiscount && calculations.discount > 0 && (
        <div className="flex justify-between text-sm text-green-600">
          <span>Korting ({formatDiscountDisplay(appliedDiscount)}):</span>
          <span>-€{calculations.discount.toFixed(2)}</span>
        </div>
      )}
      
      <div className="flex justify-between text-sm">
        <span>Verzendkosten:</span>
        {calculations.isFreeShipping ? (
          <span className="text-green-600">Gratis</span>
        ) : (
          <span>€{calculations.shipping.toFixed(2)}</span>
        )}
      </div>
      
      <div className="flex justify-between font-bold text-lg border-t pt-2">
        <span>Totaal:</span>
        <span className={calculations.isFreeOrder ? 'text-green-600' : ''}>
          €{calculations.total.toFixed(2)}
        </span>
      </div>
      
      {calculations.isFreeOrder && (
        <div className="text-center p-2 bg-green-50 text-green-800 rounded text-sm">
          🎉 Gratis bestelling! Je wordt zo doorgestuurd...
        </div>
      )}
    </div>
  );
};