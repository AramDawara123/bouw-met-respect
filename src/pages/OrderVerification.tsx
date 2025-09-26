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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-green-600 text-white px-6 py-3 rounded-lg mb-4">
            <CheckCircle className="w-6 h-6" />
            <h1 className="text-xl font-semibold">Order Geverifieerd</h1>
          </div>
          <p className="text-gray-600">
            Dit product is officieel gekocht bij Bouw met Respect
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Package className="w-6 h-6" />
              Bestelling Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 mb-1">Bestelling ID</p>
              <p className="font-mono text-lg font-semibold">{order.id}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Order Informatie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Besteldatum</p>
                <p className="font-semibold">
                  {new Date(order.created_at).toLocaleDateString('nl-NL')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge 
                  variant={order.payment_status === 'paid' ? 'default' : 
                          order.payment_status === 'pending' ? 'secondary' : 'destructive'}
                >
                  {getStatusText(order.payment_status)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Totaal</p>
                <p className="text-xl font-bold">{formatPrice(order.total)}</p>
              </div>
              {order.payment_status === 'paid' && qrCodeUrl && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">QR Verificatie</p>
                  <img src={qrCodeUrl} alt="QR Code" className="mx-auto" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Klant & Adres
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Naam</p>
                <p className="font-semibold">{order.customer_first_name} {order.customer_last_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p>{order.customer_email}</p>
              </div>
              {order.customer_phone && (
                <div>
                  <p className="text-sm text-gray-600">Telefoon</p>
                  <p>{order.customer_phone}</p>
                </div>
              )}
              {(order.address_street || order.address_city) && (
                <div>
                  <p className="text-sm text-gray-600">Adres</p>
                  <div className="text-sm">
                    <p>{order.address_street} {order.address_house_number}</p>
                    <p>{order.address_postcode} {order.address_city}</p>
                    <p>{order.address_country}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {items.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Bestelde Producten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">{item.name || 'Product'}</h4>
                      <p className="text-sm text-gray-600">
                        {item.quantity || 1}x × {formatPrice(item.price || 0)}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatPrice((item.price || 0) * (item.quantity || 1))}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center mt-8 p-6 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800">Bouw met Respect</span>
          </div>
          <p className="text-sm text-green-700">
            Deze bestelling is geverifieerd en authentiek.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderVerification;