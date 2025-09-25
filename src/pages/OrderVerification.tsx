import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Package, Calendar, MapPin, Shield, Verified, Star, Clock } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Enhanced Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-60 -right-60 w-96 h-96 bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-60 -left-60 w-96 h-96 bg-gradient-to-br from-green-100/40 to-blue-100/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 p-6 py-12">
        <div className="max-w-5xl mx-auto space-y-10 animate-fade-in">
          {/* Enhanced Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-4 bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 text-white px-10 py-6 rounded-3xl shadow-2xl mb-8 animate-scale-in backdrop-blur-sm border border-white/20">
              <div className="bg-white/20 p-3 rounded-full">
                <Shield className="w-10 h-10" />
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold tracking-tight">Officiële Verificatie</h1>
                <p className="text-white/90 text-base font-medium">Gecontroleerd door Bouw met Respect</p>
              </div>
              <div className="bg-emerald-500/80 p-2 rounded-full">
                <Verified className="w-8 h-8 text-white" />
              </div>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Dit product is officieel geverifieerd en afkomstig van onze geautoriseerde webshop
            </p>
          </div>

          {/* Enhanced Main Verification Card */}
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-slate-50/50 to-white backdrop-blur-md animate-fade-in overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-50 via-blue-50 to-purple-50 rounded-t-lg border-b-2 border-gradient-to-r from-emerald-200 to-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-3 rounded-2xl shadow-lg">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold text-slate-800 tracking-tight">Geverifieerd Product</CardTitle>
                    <p className="text-slate-600 mt-2 text-lg">
                      Dit product is officieel gekocht bij Bouw met Respect
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="bg-gradient-to-br from-amber-100 to-yellow-100 p-3 rounded-xl border border-amber-200">
                    <Star className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10">
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border-2 border-slate-100 shadow-inner">
                <div className="flex items-center justify-center gap-3 text-center mb-4">
                  <Package className="w-5 h-5 text-slate-500" />
                  <p className="text-sm font-semibold text-slate-600 tracking-wide uppercase">Bestelling Identificatie</p>
                </div>
                <p className="font-mono text-xl bg-white px-6 py-4 rounded-xl text-center border-2 border-slate-200 shadow-sm text-slate-800 tracking-wider">
                  {order.id}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Enhanced Order Details Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 animate-fade-in overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b-2 border-blue-100">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-800">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  Bestelling Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-sm">
                      <div className="bg-blue-500 p-2 rounded-lg">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-700 mb-1">Besteldatum</p>
                        <p className="text-base font-semibold text-slate-800">
                          {new Date(order.created_at).toLocaleDateString('nl-NL', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          {new Date(order.created_at).toLocaleTimeString('nl-NL')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-5 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-100 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-700 mb-3">Betalingstatus</p>
                          <Badge 
                            variant={order.payment_status === 'paid' ? 'default' : 
                                    order.payment_status === 'pending' ? 'secondary' : 'destructive'}
                            className="text-sm px-4 py-2 font-semibold rounded-xl"
                          >
                            {getStatusText(order.payment_status)}
                          </Badge>
                        </div>
                        {order.payment_status === 'paid' && qrCodeUrl && (
                          <div className="flex flex-col items-center gap-2">
                            <div className="bg-white p-2 rounded-lg border-2 border-emerald-200 shadow-sm">
                              <img 
                                src={qrCodeUrl} 
                                alt="QR Verificatie Code" 
                                className="w-16 h-16 rounded"
                              />
                            </div>
                            <p className="text-xs text-emerald-700 font-medium text-center">QR Verificatie</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t-2 border-slate-100 pt-6">
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h4 className="font-bold mb-4 text-slate-800 flex items-center gap-3 text-lg">
                      <div className="bg-slate-500 p-2 rounded-lg">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      Klantgegevens
                    </h4>
                    <div className="space-y-3">
                      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <p className="text-sm font-semibold text-slate-600 mb-1">Naam</p>
                        <p className="text-base text-slate-800">{order.customer_first_name} {order.customer_last_name}</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <p className="text-sm font-semibold text-slate-600 mb-1">Email</p>
                        <p className="text-base text-slate-800">{order.customer_email}</p>
                      </div>
                      {order.customer_phone && (
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                          <p className="text-sm font-semibold text-slate-600 mb-1">Telefoon</p>
                          <p className="text-base text-slate-800">{order.customer_phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {(order.address_street || order.address_city) && (
                  <div className="border-t-2 border-slate-100 pt-6">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 shadow-sm">
                      <h4 className="font-bold mb-4 text-slate-800 flex items-center gap-3 text-lg">
                        <div className="bg-amber-500 p-2 rounded-lg">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        Verzendadres
                      </h4>
                      <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                        <div className="text-base text-slate-800 space-y-1 leading-relaxed">
                          <p className="font-medium">{order.address_street} {order.address_house_number}</p>
                          <p>{order.address_postcode} {order.address_city}</p>
                          <p className="text-slate-600">{order.address_country}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Products Card */}
            {items.length > 0 && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 animate-fade-in overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 border-b-2 border-purple-100">
                  <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-800">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-2xl shadow-lg">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    Bestelde Producten
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {items.map((item: any, index: number) => (
                      <div key={index} className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border-2 border-slate-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300 group">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800 text-xl mb-3 group-hover:text-purple-700 transition-colors">
                              {item.name || 'Onbekend product'}
                            </h4>
                            <div className="flex items-center gap-6 text-sm">
                              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full font-semibold shadow-sm">
                                {item.quantity || 1}x stuks
                              </div>
                              <div className="bg-slate-100 px-4 py-2 rounded-full text-slate-700 font-medium border border-slate-200">
                                €{((item.price || 0) / 100).toFixed(2)} per stuk
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-6">
                            <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white px-4 py-2 rounded-2xl shadow-lg">
                              <p className="text-xl font-bold">
                                €{(((item.price || 0) * (item.quantity || 1)) / 100).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t-4 border-gradient-to-r from-emerald-300 to-blue-300 pt-6 bg-gradient-to-r from-emerald-50 via-blue-50 to-purple-50 rounded-2xl p-6 shadow-inner border-2 border-emerald-200">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-2 rounded-lg">
                            <Star className="w-5 h-5 text-white" />
                          </div>
                          <p className="text-2xl font-bold text-slate-800">Totaalbedrag</p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white px-6 py-3 rounded-2xl shadow-xl">
                          <p className="text-3xl font-bold">€{((order.total) / 100).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Enhanced Company Branding Card */}
          <Card className="bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 border-0 shadow-2xl animate-fade-in overflow-hidden">
            <CardContent className="p-10 text-center">
              <div className="flex items-center justify-center gap-6 mb-8">
                <div className="bg-gradient-to-br from-emerald-500 via-blue-600 to-purple-600 p-4 rounded-3xl shadow-2xl">
                  <Shield className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h3 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Bouw met Respect
                  </h3>
                  <p className="text-xl text-slate-600 font-medium">Officiële Webshop Verificatie</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-3 rounded-2xl shadow-lg">
                  <Verified className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border-2 border-emerald-100 shadow-inner">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-emerald-500 p-2 rounded-full flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-slate-800 text-lg font-semibold text-left leading-relaxed">
                    Deze bestelling is geverifieerd en afkomstig van onze officiële webshop
                  </p>
                </div>
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200">
                  <p className="text-base text-slate-700 leading-relaxed">
                    Alle producten zijn authentiek en worden geleverd conform onze kwaliteitsstandaarden. 
                    Voor vragen over deze bestelling kunt u contact opnemen via onze klantenservice.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderVerification;