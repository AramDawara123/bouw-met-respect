import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Package, Calendar, MapPin } from 'lucide-react';

interface Order {
  id: string;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_email?: string;
  total: number;
  payment_status: string;
  created_at: string;
  items: any;
  address_street?: string;
  address_house_number?: string;
  address_postcode?: string;
  address_city?: string;
  address_country?: string;
}

const OrderVerification = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('Geen bestelling ID gevonden');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          setError('Bestelling niet gevonden');
        } else {
          setOrder(data);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Kon bestelling niet ophalen');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const formatPrice = (amount: number) => `€${(amount / 100).toFixed(2)}`;
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Betaald';
      case 'pending': return 'In behandeling';
      case 'failed': return 'Mislukt';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Bestelling laden...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Package className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Bestelling niet gevonden</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Parse items if they're stored as JSON
  let items = [];
  try {
    items = Array.isArray(order.items) ? order.items : 
            typeof order.items === 'string' ? JSON.parse(order.items) : 
            order.items ? [order.items] : [];
  } catch (e) {
    console.error('Error parsing order items:', e);
    items = [];
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="text-center bg-gradient-to-r from-primary to-primary-foreground text-primary-foreground rounded-t-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-8 h-8" />
              <CardTitle className="text-2xl font-bold">Geverifieerde Bestelling</CardTitle>
            </div>
            <p className="text-primary-foreground/90 text-lg font-semibold">
              Dit product is gekocht bij Bouw met Respect
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Bestelling ID</p>
              <p className="font-mono text-sm bg-muted px-3 py-1 rounded inline-block">
                {order.id}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Bestelling Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Besteldatum:</span>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  {new Date(order.created_at).toLocaleDateString('nl-NL')} om{' '}
                  {new Date(order.created_at).toLocaleTimeString('nl-NL')}
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Status:</p>
                <Badge 
                  variant={order.payment_status === 'paid' ? 'default' : 
                          order.payment_status === 'pending' ? 'secondary' : 'destructive'}
                  className="ml-0"
                >
                  {getStatusText(order.payment_status)}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Klant:</p>
              <p className="text-sm text-muted-foreground">
                {order.customer_first_name} {order.customer_last_name}
              </p>
              <p className="text-sm text-muted-foreground">{order.customer_email}</p>
            </div>

            {(order.address_street || order.address_city) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Verzendadres:</span>
                </div>
                <div className="text-sm text-muted-foreground ml-6">
                  {order.address_street} {order.address_house_number}<br />
                  {order.address_postcode} {order.address_city}<br />
                  {order.address_country}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Products */}
        {items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Bestelde Producten</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.name || 'Onbekend product'}</p>
                      <p className="text-sm text-muted-foreground">
                        Aantal: {item.quantity || 1} × {formatPrice(item.price || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatPrice((item.price || 0) * (item.quantity || 1))}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-3 flex justify-between items-center">
                  <p className="text-lg font-bold">Totaal:</p>
                  <p className="text-lg font-bold text-primary">{formatPrice(order.total)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Company Info */}
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-bold text-primary mb-2">Bouw met Respect</h3>
            <p className="text-sm text-muted-foreground">
              Deze bestelling is geverifieerd en afkomstig van onze officiële webshop.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderVerification;