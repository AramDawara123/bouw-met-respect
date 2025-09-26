import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Package, Calendar, MapPin, Shield } from 'lucide-react';
import QRCode from 'qrcode';

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
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

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
          // Generate QR code for verification URL
          if (data.payment_status === 'paid') {
            const verificationUrl = `${window.location.origin}/order-verification/${data.id}`;
            const qrUrl = await QRCode.toDataURL(verificationUrl, {
              width: 64,
              margin: 1,
              color: {
                dark: '#059669', // emerald-600
                light: '#ffffff'
              }
            });
            setQrCodeUrl(qrUrl);
          }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-green-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Bestelling verificatie</h3>
            <p className="text-gray-600">Even geduld, we controleren de authenticiteit...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Bestelling niet gevonden</h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Geen bestelling gevonden</h2>
            <p className="text-gray-600">De bestelling kon niet worden geladen.</p>
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 mt-16">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-4 border border-white/30">
              <Shield className="w-6 h-6" />
              <h1 className="text-xl font-semibold">Officiële Verificatie</h1>
            </div>
            <p className="text-primary-foreground/90 text-lg">
              Gecontroleerd door Bouw met Respect
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-4">
        {/* Verification Status Card */}
        <Card className="mb-8 border-0 shadow-xl bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-l-emerald-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-full">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-800 mb-1">Geverifieerd Product</h2>
                <p className="text-emerald-700">Dit product is officieel gekocht bij Bouw met Respect</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order ID Card */}
        <Card className="mb-8 shadow-lg border-0">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Package className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Bestelling Identificatie
                </span>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg border-2 border-dashed border-muted-foreground/20">
                <p className="font-mono text-xl font-bold text-foreground tracking-wider">
                  {order.id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Information Card */}
          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                Bestelling Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Besteldatum</p>
                  <p className="font-semibold text-foreground">
                    {new Date(order.created_at).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Tijd</p>
                  <p className="font-semibold text-foreground">
                    {new Date(order.created_at).toLocaleTimeString('nl-NL', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                <div>
                  <p className="text-sm font-medium text-emerald-700 mb-1">Betalingstatus</p>
                  <Badge 
                    variant={order.payment_status === 'paid' ? 'default' : 
                            order.payment_status === 'pending' ? 'secondary' : 'destructive'}
                    className="px-3 py-1"
                  >
                    {getStatusText(order.payment_status)}
                  </Badge>
                </div>
                {order.payment_status === 'paid' && qrCodeUrl && (
                  <div className="text-center">
                    <p className="text-xs text-emerald-700 mb-2 font-medium">QR Verificatie</p>
                    <div className="bg-white p-2 rounded-lg border shadow-sm">
                      <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16" />
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg border border-primary/20">
                <p className="text-sm font-medium text-muted-foreground mb-1">Totaalbedrag</p>
                <p className="text-2xl font-bold text-primary">{formatPrice(order.total)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information Card */}
          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                Klant & Leveringsadres
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Customer Details */}
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Naam</p>
                  <p className="font-semibold text-foreground text-lg">
                    {order.customer_first_name} {order.customer_last_name}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                    <p className="text-foreground">{order.customer_email}</p>
                  </div>
                  {order.customer_phone && (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Telefoon</p>
                      <p className="text-foreground">{order.customer_phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Address Information */}
              {(order.address_street || order.address_city) && (
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm font-medium text-orange-700 mb-3">Leveringsadres</p>
                  <div className="space-y-1 text-foreground">
                    <p className="font-medium">{order.address_street} {order.address_house_number}</p>
                    <p>{order.address_postcode} {order.address_city}</p>
                    <p className="text-muted-foreground">{order.address_country}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Products Section */}
        {items.length > 0 && (
          <Card className="mt-8 shadow-lg border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="bg-green-500 p-2 rounded-lg">
                  <Package className="w-5 h-5 text-white" />
                </div>
                Bestelde Producten
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-5 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border hover:shadow-md transition-shadow duration-200">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-foreground mb-1">
                        {item.name || 'Product'}
                      </h4>
                      <div className="flex items-center gap-4">
                        <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                          {item.quantity || 1}x
                        </span>
                        <span className="text-muted-foreground">
                          {formatPrice(item.price || 0)} per stuk
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">
                        {formatPrice((item.price || 0) * (item.quantity || 1))}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Total Section */}
                <div className="border-t-2 border-primary/20 pt-4 mt-6">
                  <div className="flex justify-between items-center p-5 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border-2 border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary p-2 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <span className="text-xl font-bold text-foreground">Totaalbedrag</span>
                    </div>
                    <p className="text-3xl font-bold text-primary">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Verification Section */}
        <Card className="mt-8 mb-8 shadow-xl border-0 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground overflow-hidden">
          <CardContent className="p-8 text-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Bouw met Respect</h3>
                  <p className="text-primary-foreground/90">Officiële Webshop Verificatie</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-emerald-300" />
                  <p className="text-lg font-semibold">Deze bestelling is geverifieerd en authentiek</p>
                </div>
                <p className="text-primary-foreground/90">
                  Alle producten zijn echt en worden geleverd conform onze kwaliteitsstandaarden. 
                  Voor vragen over deze bestelling kunt u contact opnemen via onze klantenservice.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderVerification;