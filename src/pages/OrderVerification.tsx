import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Package, Calendar, MapPin, Shield, Verified, Star, Clock } from 'lucide-react';

interface Order {
  id: string;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_email?: string;
  customer_phone?: string;
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

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        if (!data) {
          setError('Bestelling niet gevonden');
        } else {
          setOrder(data);
        }
      } catch (error: any) {
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
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-primary/20 shadow-2xl animate-fade-in">
          <CardContent className="p-8 text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto mb-6"></div>
              <div className="absolute inset-0 rounded-full h-12 w-12 border-2 border-primary/10 mx-auto animate-pulse"></div>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Bestelling verificatie</h3>
            <p className="text-muted-foreground">Even geduld, we controleren de authenticiteit...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-destructive/5 via-background to-muted/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive/20 shadow-2xl animate-fade-in">
          <CardContent className="p-8 text-center">
            <div className="bg-destructive/10 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Package className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-xl font-bold mb-3 text-foreground">Verificatie Mislukt</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                Controleer of de QR-code correct is gescand of neem contact op met onze klantenservice.
              </p>
            </div>
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 p-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary to-primary-foreground text-white px-8 py-4 rounded-2xl shadow-xl mb-6 animate-scale-in">
              <Shield className="w-8 h-8" />
              <div className="text-left">
                <h1 className="text-2xl font-bold">Officiële Verificatie</h1>
                <p className="text-primary-foreground/90 text-sm">Gecontroleerd door Bouw met Respect</p>
              </div>
              <Verified className="w-6 h-6 text-green-400" />
            </div>
          </div>

          {/* Main Verification Card */}
          <Card className="border-2 border-primary/20 shadow-2xl bg-gradient-to-br from-background to-muted/20 animate-fade-in">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary-foreground/10 rounded-t-lg border-b border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500 p-2 rounded-full">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-foreground">Geverifieerd Product</CardTitle>
                    <p className="text-muted-foreground mt-1">
                      Dit product is officieel gekocht bij Bouw met Respect
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="bg-muted/30 rounded-xl p-4 mb-6 border border-muted">
                <div className="flex items-center justify-center gap-2 text-center">
                  <p className="text-sm text-muted-foreground">Bestelling ID</p>
                </div>
                <p className="font-mono text-lg bg-background px-4 py-2 rounded-lg mt-2 text-center border">
                  {order.id}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Details Card */}
            <Card className="border border-muted shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in">
              <CardHeader className="bg-gradient-to-r from-muted/30 to-muted/10">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  Bestelling Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Clock className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Besteldatum</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('nl-NL', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleTimeString('nl-NL')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm font-medium text-foreground mb-2">Status</p>
                      <Badge 
                        variant={order.payment_status === 'paid' ? 'default' : 
                                order.payment_status === 'pending' ? 'secondary' : 'destructive'}
                        className="text-sm px-3 py-1"
                      >
                        {getStatusText(order.payment_status)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 text-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Klantgegevens
                    </h4>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Naam:</span> {order.customer_first_name} {order.customer_last_name}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Email:</span> {order.customer_email}
                      </p>
                      {order.customer_phone && (
                        <p className="text-sm">
                          <span className="font-medium">Telefoon:</span> {order.customer_phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {(order.address_street || order.address_city) && (
                  <div className="border-t pt-4">
                    <div className="bg-muted/30 rounded-lg p-4">
                      <h4 className="font-semibold mb-3 text-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        Verzendadres
                      </h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>{order.address_street} {order.address_house_number}</p>
                        <p>{order.address_postcode} {order.address_city}</p>
                        <p>{order.address_country}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Products Card */}
            {items.length > 0 && (
              <Card className="border border-muted shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in">
                <CardHeader className="bg-gradient-to-r from-muted/30 to-muted/10">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    Bestelde Producten
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {items.map((item: any, index: number) => (
                      <div key={index} className="bg-muted/30 rounded-xl p-4 border border-muted/50 hover:bg-muted/40 transition-colors duration-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground text-lg mb-2">
                              {item.name || 'Onbekend product'}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="bg-background px-3 py-1 rounded-full border">
                                {item.quantity || 1}x
                              </span>
                              <span>€{((item.price || 0) / 100).toFixed(2)} per stuk</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-primary">
                              €{(((item.price || 0) * (item.quantity || 1)) / 100).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t-2 border-primary/20 pt-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <p className="text-xl font-bold text-foreground">Totaalbedrag:</p>
                        <p className="text-2xl font-bold text-primary">€{((order.total) / 100).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Company Branding Card */}
          <Card className="bg-gradient-to-r from-primary/10 via-background to-primary/5 border-2 border-primary/20 shadow-2xl animate-fade-in">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="bg-primary p-3 rounded-full">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary mb-1">Bouw met Respect</h3>
                  <p className="text-muted-foreground">Officiële Webshop Verificatie</p>
                </div>
                <div className="bg-green-500 p-2 rounded-full">
                  <Verified className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="bg-background/50 rounded-xl p-6 border border-primary/10">
                <p className="text-foreground mb-2 font-medium">
                  ✅ Deze bestelling is geverifieerd en afkomstig van onze officiële webshop
                </p>
                <p className="text-sm text-muted-foreground">
                  Alle producten zijn authentiek en worden geleverd conform onze kwaliteitsstandaarden. 
                  Voor vragen over deze bestelling kunt u contact opnemen via onze klantenservice.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderVerification;