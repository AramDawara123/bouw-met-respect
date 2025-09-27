import { useEffect, useState } from 'react';
import { CheckCircle, Package, Mail, Phone, ShoppingBag, Euro } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderDetails {
  id: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  discount_amount: number;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  discount_code?: string;
  created_at: string;
}

const OrderThankYou = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Bedankt voor je bestelling - Bouw met Respect';
    
    const orderId = searchParams.get('orderId');
    if (orderId) {
      fetchOrderDetails(orderId);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
      } else if (data) {
        // Parse and validate the items JSON
        let items: OrderItem[] = [];
        try {
          if (Array.isArray(data.items)) {
            items = (data.items as any[]).map(item => ({
              id: item.id || '',
              name: item.name || '',
              price: item.price || 0,
              quantity: item.quantity || 1
            }));
          }
        } catch (parseError) {
          console.error('Error parsing order items:', parseError);
        }
        
        setOrderDetails({
          id: data.id,
          items,
          subtotal: data.subtotal,
          shipping: data.shipping,
          total: data.total,
          discount_amount: data.discount_amount || 0,
          customer_first_name: data.customer_first_name || '',
          customer_last_name: data.customer_last_name || '',
          customer_email: data.customer_email || '',
          discount_code: data.discount_code,
          created_at: data.created_at
        });
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Bestelling laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-8 px-4">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Success Header */}
        <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-6 w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Bedankt voor je bestelling{orderDetails?.customer_first_name ? `, ${orderDetails.customer_first_name}` : ''}!
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Je bestelling is succesvol ontvangen en wordt verwerkt.
            </CardDescription>
            {orderDetails && (
              <div className="mt-4 text-sm text-muted-foreground">
                Bestelnummer: <span className="font-mono text-foreground">{orderDetails.id.split('-')[0].toUpperCase()}</span>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Order Details */}
        {orderDetails && (
          <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Jouw bestelling
              </CardTitle>
              <CardDescription>
                Geplaatst op {new Date(orderDetails.created_at).toLocaleDateString('nl-NL', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Items */}
              <div className="space-y-3">
                {orderDetails.items.map((item: OrderItem, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">Aantal: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">€{formatPrice(item.price * item.quantity)}</p>
                      <p className="text-xs text-muted-foreground">€{formatPrice(item.price)} per stuk</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Order Summary */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotaal</span>
                  <span className="text-foreground">€{formatPrice(orderDetails.subtotal)}</span>
                </div>
                
                {orderDetails.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Korting {orderDetails.discount_code && `(${orderDetails.discount_code})`}
                    </span>
                    <span className="text-green-600">-€{formatPrice(orderDetails.discount_amount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Verzendkosten</span>
                  <span className="text-foreground">
                    {orderDetails.shipping === 0 ? 'Gratis' : `€${formatPrice(orderDetails.shipping)}`}
                  </span>  
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span className="text-foreground">Totaal</span>
                  <span className="text-foreground flex items-center gap-1">
                    <Euro className="w-4 h-4" />
                    {formatPrice(orderDetails.total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-2 border-dashed border-primary/20 bg-card/95 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Package className="w-8 h-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold text-foreground mb-2">Verzending</h3>
              <p className="text-sm text-muted-foreground">
                Je ontvangt within 3-5 werkdagen een verzendbevestiging met trackingcode
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed border-primary/20 bg-card/95 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Mail className="w-8 h-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold text-foreground mb-2">Bevestiging</h3>
              <p className="text-sm text-muted-foreground">
                Een orderbevestiging is naar {orderDetails?.customer_email || 'je e-mail'} verstuurd
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Info */}
        <Card className="bg-primary/5 border-primary/20 shadow-lg">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold text-foreground mb-2 flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" />
              Vragen over je bestelling?
            </h3>
            <p className="text-muted-foreground mb-4">
              Neem gerust contact met ons op. We helpen je graag verder!
            </p>
            <div className="space-y-1 text-sm">
              <p className="text-foreground font-medium">E-mail: info@bouwmetrespect.nl</p>
              <p className="text-foreground font-medium">Telefoon: +31 6 12345678</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => navigate('/webshop')} 
            variant="outline" 
            className="flex-1 h-12"
            size="lg"
          >
            Verder winkelen
          </Button>
          <Button 
            onClick={() => navigate('/')} 
            className="flex-1 h-12"
            size="lg"
          >
            Terug naar homepage
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">
            © 2024 Bouw met Respect. Bedankt voor het vertrouwen in ons!
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderThankYou;