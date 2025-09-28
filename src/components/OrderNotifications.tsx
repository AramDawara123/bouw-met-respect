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
          
          // Show notification toast
          toast({
            title: "🛒 Nieuwe Bestelling!",
            description: (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  <span className="font-medium">
                    Bestelling #{generateOrderNumber(newOrder)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {newOrder.customer_first_name && newOrder.customer_last_name
                    ? `${newOrder.customer_first_name} ${newOrder.customer_last_name}`
                    : newOrder.customer_email || 'Onbekende klant'
                  }
                </div>
                <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                  <Euro className="w-3 h-3" />
                  {formatPrice(newOrder.total)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {Array.isArray(newOrder.items) ? newOrder.items.length : 0} items
                </div>
              </div>
            ),
            duration: 8000,
          });

          // Call callback if provided
          if (onNewOrder) {
            onNewOrder(newOrder);
          }

          // Play notification sound (optional)
          try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkaFJTI7N6VOAoVYrfp76JQDwxBp+DyvmkaEzi/ydyQOAkUYrjw7qFUEgpBod7wuWMcBjiR1/LMeSwGJHfH8N2QQAoUXrTp66hWFAlGn+DyvmkaFJTI7N6VOAoVYrfq7aJQDwxBp+DyvmkaEzi/ydyQOgkUYrjw7qJUEgpBod7wuWMcBjiR1/LMeSwFJHfH8N2QQAkUXrTp66hWFAlGn+DyvmkaFJTI7N6VOAoVYrfq7aJQDwxBp+DyvmkaEzi/ydyQOgkUYrjx7aJUEgpBod7wuWMcBjiR1/LMeSwFJHfH8N2QQAkUXrTp66hWFAlGn+DyvmkaFJTI7N6VOAoVYrfq7aJQDwxBp+DyvmkaEzi/ydyQOgkUYrjx7aJUEgpBod7wuWMcBjiR1/LMeSwFJHfH8N2QQAkUXrTp66hWFAlGn+DyvmkaFJTI7N6VOAoVYrfq7aJQDwxBp+DyvmkaEzi/ydyQOgkUYrjx7aJUEgpBod7wuWQcBjiR1/LMeSwFJHfH8N2QQAkUXrTp66hWFAlGn+DyvmkaFJTI7N6VOAoVYrfq7aJQDwxBp+DyvmkaEzi/ydyQOgkUYrjx7aJUEgpBod7wuWQcBjiR1/LMeSwFJHfH8N2QQAkUXrTp66hWFAlGn+DyvmkaFJTI7N6VOAoVYrfq7aJQDwxBp+DyvmkaEzi/ydyQOgkUYrjx7aJUEgpBod7wuWQcBjiR1/LMeSwFJHfH8N2QQAkUXrTp66hWFAlGn+DyvmkaFJTI7N6VOAoVYrfq7aJQDwxBp+DyvmkaEzi/ydyQOgkUYrjx7aJUEgpBod7wuWQcBjiR1/LMeSwFJHfH8N2QQAkUXrTp66hWFAlGn+DyvmkaFJTI7N6VOAoVYrfq7aJQDwxBp+DyvmkaEzi/ydyQOgkUYrjx7aJUEgpBod7wuWQcBjiR1/LMeSwFJHfH8N2QQAkUXrTp66hWFAlGn+DyvmkaFJTI7N6VOAoVYrfq7aJQDwxBp+DyvmkaEzi/ydyQOgkUYrjx7aJUEgpBod7wuWQcBjiR1/LMeSw=');
            audio.volume = 0.3;
            audio.play().catch(() => {
              // Ignore audio play errors
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