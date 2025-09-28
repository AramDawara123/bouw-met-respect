import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bell, Euro } from "lucide-react";

interface Order {
  id: string;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_email?: string;
  total: number;
  items: any[];
  payment_status: string;
  created_at: string;
}

interface OrderNotificationsProps {
  onNewOrder?: (order: Order) => void;
}

export const OrderNotifications = ({ onNewOrder }: OrderNotificationsProps) => {
  const { toast } = useToast();

  const formatPrice = (cents: number) => {
    return `€${(cents / 100).toFixed(2)}`;
  };

  const generateOrderNumber = (order: Order) => {
    if (order.id) {
      return order.id.split('-')[0].toUpperCase();
    }
    return 'N/A';
  };

  useEffect(() => {
    // Listen for new orders in real-time
    const channel = supabase
      .channel('order-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          const newOrder = payload.new as Order;
          
          // Show shopify-style money notification toast
          toast({
            title: "💰 Cha-ching! Nieuwe Bestelling!",
            description: (
              <div className="flex flex-col gap-2 p-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Euro className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">
                        Bestelling #{generateOrderNumber(newOrder)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {newOrder.customer_first_name && newOrder.customer_last_name
                          ? `${newOrder.customer_first_name} ${newOrder.customer_last_name}`
                          : newOrder.customer_email || 'Onbekende klant'
                        }
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {formatPrice(newOrder.total)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Array.isArray(newOrder.items) ? newOrder.items.length : 0} items
                    </div>
                  </div>
                </div>
              </div>
            ),
            duration: 10000,
          });

          // Call callback if provided
          if (onNewOrder) {
            onNewOrder(newOrder);
          }

          // Play custom order sound
          try {
            const audio = new Audio('/order-sound.mp4');
            audio.volume = 0.6;
            audio.play().catch(() => {
              // Ignore audio play errors - browser might block autoplay
            });
          } catch (error) {
            // Ignore audio errors
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast, onNewOrder]);

  return null; // This component doesn't render anything visible
};