import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, Package, Mail, Download, FileText, ArrowLeft, RefreshCw, ShoppingBag, Euro } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface DigitalDownload {
  productName: string;
  pdfUrl: string;
}

interface OrderDetails {
  id: string;
  mollie_payment_id: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  discount_amount: number;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  created_at: string;
}

const OrderThankYou = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [downloads, setDownloads] = useState<DigitalDownload[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const parseItems = (raw: any): OrderItem[] => {
    if (!Array.isArray(raw)) return [];
    return raw.map((item: any) => ({
      id: item.id || '',
      name: item.name || '',
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
    }));
  };

  const fetchDownloads = useCallback(async (items: OrderItem[]) => {
    const ids = items.map(i => i.id).filter(id => id && id.length === 36);
    if (ids.length === 0) return;

    const { data } = await supabase
      .from('products')
      .select('id, name, pdf_url, is_digital')
      .in('id', ids);

    if (!data) return;

    const links: DigitalDownload[] = data
      .filter((p: any) => p.is_digital && p.pdf_url)
      .map((p: any) => ({ productName: p.name, pdfUrl: p.pdf_url }));

    setDownloads(links);
  }, []);

  const loadOrder = useCallback(async (sessionId?: string, orderId?: string) => {
    try {
      let query = supabase.from('orders').select('*');

      if (sessionId) {
        query = query.eq('mollie_payment_id', sessionId);
      } else if (orderId) {
        query = query.eq('id', orderId);
      } else {
        setNotFound(true);
        return;
      }

      const { data, error } = await query.maybeSingle();

      if (error || !data) {
        setNotFound(true);
        return;
      }

      const items = parseItems(data.items);
      setOrder({
        id: data.id,
        mollie_payment_id: data.mollie_payment_id,
        items,
        subtotal: data.subtotal || 0,
        shipping: data.shipping || 0,
        total: data.total || 0,
        discount_amount: data.discount_amount || 0,
        customer_first_name: data.customer_first_name || '',
        customer_last_name: data.customer_last_name || '',
        customer_email: data.customer_email || '',
        created_at: data.created_at,
      });

      await fetchDownloads(items);
    } catch (e) {
      console.error('Error loading order:', e);
      setNotFound(true);
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, [fetchDownloads]);

  useEffect(() => {
    document.title = 'Bedankt voor je bestelling - Bouw met Respect';
    const sessionId = searchParams.get('session_id') || undefined;
    const orderId = searchParams.get('orderId') || undefined;
    loadOrder(sessionId, orderId);
  }, [searchParams, loadOrder]);

  const handleRetry = () => {
    setRetrying(true);
    setNotFound(false);
    const sessionId = searchParams.get('session_id') || undefined;
    const orderId = searchParams.get('orderId') || undefined;
    loadOrder(sessionId, orderId);
  };

  const fmt = (cents: number) => `€${(cents / 100).toFixed(2)}`;
  const isDigitalOrder = downloads.length > 0;

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Bestelling laden…</p>
        </div>
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────
  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Bestelling wordt verwerkt…</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Je betaling is ontvangen. Het kan een moment duren voordat je bestelling zichtbaar is.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={handleRetry} disabled={retrying} className="bg-indigo-600 hover:bg-indigo-700">
              {retrying ? 'Opnieuw laden…' : 'Opnieuw proberen'}
            </Button>
            <Button variant="outline" onClick={() => navigate('/webshop')}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Terug naar winkel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Digital product page ─────────────────────────────────────────────────
  if (isDigitalOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 px-4 py-12">
        <div className="max-w-xl mx-auto space-y-6">

          {/* Hero */}
          <div className="text-center pt-4 pb-2">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur border border-white/20 mb-5">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
              Je download staat klaar!
            </h1>
            <p className="text-indigo-200 text-base">
              {order?.customer_first_name
                ? `Bedankt ${order.customer_first_name}! Je aankoop is bevestigd.`
                : 'Je aankoop is bevestigd.'}
            </p>
          </div>

          {/* Download card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
              <p className="text-white font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
                <Download className="w-4 h-4" /> Jouw downloads
              </p>
            </div>
            <div className="p-6 space-y-4">
              {downloads.map((dl, i) => (
                <div key={i} className="border-2 border-indigo-100 rounded-xl p-5 bg-indigo-50">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{dl.productName}</p>
                      <p className="text-sm text-gray-500 mt-0.5">PDF bestand • Directe download</p>
                    </div>
                  </div>
                  <a
                    href={dl.pdfUrl}
                    download={`${dl.productName}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-indigo-300 text-base no-underline"
                  >
                    <Download className="w-5 h-5" />
                    {dl.productName} downloaden
                  </a>
                </div>
              ))}

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-2">
                <p className="text-amber-800 text-sm">
                  <strong>Tip:</strong> Sla het bestand direct op je apparaat op zodat je het altijd kunt terugvinden.
                </p>
              </div>
            </div>
          </div>

          {/* Order summary */}
          {order && (
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5">
              <p className="text-indigo-200 text-xs uppercase tracking-wide font-semibold mb-3">Besteloverzicht</p>
              <div className="space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-white text-sm">
                    <span>{item.name} × {item.quantity}</span>
                    <span>{fmt(item.price * item.quantity * 100)}</span>
                  </div>
                ))}
                <Separator className="bg-white/20 my-2" />
                <div className="flex justify-between text-white font-bold">
                  <span>Totaal</span>
                  <span>{fmt(order.total)}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-indigo-300 text-xs">
                <Mail className="w-3.5 h-3.5" />
                Bevestiging verstuurd naar {order.customer_email}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pb-8">
            <Button
              onClick={() => navigate('/webshop')}
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
            >
              <ShoppingBag className="w-4 h-4 mr-2" /> Verder winkelen
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="text-indigo-300 hover:text-white hover:bg-white/10"
            >
              Terug naar homepage
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Regular (physical) order page ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-8 px-4">
      <div className="w-full max-w-4xl mx-auto space-y-6">

        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Bedankt voor je bestelling{order?.customer_first_name ? `, ${order.customer_first_name}` : ''}!
          </h1>
          <p className="text-gray-500">Je bestelling is ontvangen en wordt zo snel mogelijk verwerkt.</p>
          {order && (
            <p className="text-sm text-gray-400 mt-2">
              Bestelnummer: <span className="font-mono text-gray-700">{order.id.split('-')[0].toUpperCase()}</span>
            </p>
          )}
        </div>

        {order && order.items.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <ShoppingBag className="w-5 h-5" /> Jouw bestelling
            </h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">Aantal: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-800">{fmt(item.price * item.quantity * 100)}</p>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between font-bold text-lg">
              <span>Totaal</span>
              <span className="flex items-center gap-1"><Euro className="w-4 h-4" />{(order.total / 100).toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <Package className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Verzending</h3>
            <p className="text-sm text-gray-500">Je ontvangt binnen 3–5 werkdagen een verzendbevestiging</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <Mail className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Bevestiging</h3>
            <p className="text-sm text-gray-500">
              E-mail verstuurd naar {order?.customer_email || 'je e-mailadres'}
            </p>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center">
          <p className="text-gray-700 font-medium mb-1">Vragen over je bestelling?</p>
          <p className="text-indigo-600 font-semibold">info@bouwmetrespect.nl</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => navigate('/webshop')} variant="outline" className="flex-1 h-12" size="lg">
            Verder winkelen
          </Button>
          <Button onClick={() => navigate('/')} className="flex-1 h-12" size="lg">
            Terug naar homepage
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderThankYou;
