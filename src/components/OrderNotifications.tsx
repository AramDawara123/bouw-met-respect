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

          // Play "cha-ching" cash register sound like Shopify
          try {
            // Create a better cash register sound using Web Audio API
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator1 = audioContext.createOscillator();
            const oscillator2 = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            // Configure the "cha" part (higher pitched)
            oscillator1.type = 'sine';
            oscillator1.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator1.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
            
            // Configure the "ching" part (bell-like)
            oscillator2.type = 'triangle';
            oscillator2.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1);
            oscillator2.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3);
            
            // Volume envelope
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            // Connect nodes
            oscillator1.connect(gainNode);
            oscillator2.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Play the sound
            oscillator1.start(audioContext.currentTime);
            oscillator1.stop(audioContext.currentTime + 0.15);
            oscillator2.start(audioContext.currentTime + 0.1);
            oscillator2.stop(audioContext.currentTime + 0.5);
            
          } catch (error) {
            // Fallback to simple beep if Web Audio API fails
            try {
              const audio = new Audio('data:audio/wav;base64,UklGRvIBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YU4BAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkaFJTI7N6VOAoVYrfp76JQDwxBp+DyvmkaEzi/ydyQOgkUYrjx7aJUEgpBod7wuWMcBjiR1/LMeSwFJHfH8N2QQAkUXrTp66hWFAlGn+DyvmkaFJTI7N6VOAoVYrfq7aJQDwxBp+DyvmkaEzi/ydyQOgkUYrjx7aJUEgpBod7wuWQcBjiR1/LMeSwE=');
              audio.volume = 0.4;
              audio.play().catch(() => {});
            } catch (fallbackError) {
              // Ignore all audio errors
            }
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