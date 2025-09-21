import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ShoppingCart, Coffee, Edit3, ArrowLeft, Plus, Minus, X, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useToast } from "@/hooks/use-toast";
import { MarqueeAnimation } from "@/components/ui/marquee-effect";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
const Webshop = () => {
  const {
    ref: headerRef,
    isVisible: headerVisible
  } = useScrollAnimation(0.2);
  const {
    ref: productsRef,
    isVisible: productsVisible
  } = useScrollAnimation(0.1);
  const [cart, setCart] = useState<{
    [key: string]: number;
  }>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    houseNumber: "",
    postcode: "",
    city: "",
    country: "Nederland"
  });
  const {
    toast
  } = useToast();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    if (status === 'paid') {
      toast({
        title: "Bedankt!",
        description: "Je betaling is ontvangen."
      });
      const url = new URL(window.location.href);
      url.searchParams.delete('status');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('🔄 Fetching webshop products...');
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('in_stock', true) // Only show products that are in stock
          .order('category', { ascending: true })
          .order('name', { ascending: true });

        if (error) {
          console.error('❌ Error fetching products:', error);
          // Fallback to hardcoded products if database fails
          setProducts([{
            id: "koffiebeker-keramiek",
            name: "Bouw met Respect Koffiebeker",
            description: "Hoogwaardige keramische koffiebeker met ons logo. Perfect voor op kantoor of de bouwkeet.",
            price: 12.95,
            image_url: "/lovable-uploads/132795ea-2daa-4305-a106-02650a9bf06c.png",
            category: "Drinkbekers",
            in_stock: true,
            features: ["Keramiek", "Vaatwasserbestendig", "350ml inhoud"]
          }, {
            id: "koffiebeker-rvs",
            name: "RVS Thermosbeker",
            description: "Robuuste roestvrijstalen thermosbeker die je koffie urenlang warm houdt. Ideaal voor bouwplaatsen.",
            price: 18.95,
            image_url: "/lovable-uploads/2a13d9d8-47a2-4787-9cba-80dfe398fd9e.png",
            category: "Drinkbekers",
            in_stock: true,
            features: ["Dubbelwandige isolatie", "Lekvrij", "500ml inhoud"]
          }, {
            id: "pen-set",
            name: "Bouw met Respect Pen Set",
            description: "Set van 3 hoogwaardige balpennen met ons logo. Ideaal voor het tekenen van contracten en plannen.",
            price: 8.95,
            image_url: "/lovable-uploads/370194bf-f017-421b-ab19-49ae1435a82e.png",
            category: "Schrijfwaren",
            in_stock: true,
            features: ["Set van 3 stuks", "Blauwe inkt", "Herbruikbaar"]
          }, {
            id: "pen-premium",
            name: "Premium Metalen Pen",
            description: "Elegante metalen pen met gegraveerd logo. Perfect voor belangrijke ondertekeningen.",
            price: 15.95,
            image_url: "/lovable-uploads/6a653db4-1d30-46c2-83c1-760e5459fb7d.png",
            category: "Schrijfwaren",
            in_stock: true,
            features: ["Metalen behuizing", "Gegraveerd logo", "Geschenkdoosje"]
          }]);
        } else {
          console.log('✅ Products loaded from database:', data);
          // Transform database products to match webshop format
          const transformedProducts = data.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description || "",
            price: product.price / 100, // Convert from cents to euros
            image: product.image_url || "/placeholder.svg",
            category: product.category || "Overig",
            inStock: product.in_stock,
            features: product.features || []
          }));
          setProducts(transformedProducts);
        }
      } catch (error) {
        console.error('💥 Unexpected error:', error);
        // Fallback to empty array
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);
  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
    const product = products.find(p => p.id === productId);
    toast({
      title: "Toegevoegd aan winkelwagen",
      description: `${product?.name} is toegevoegd aan je winkelwagen.`
    });
  };
  const increaseQuantity = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };
  const decreaseQuantity = (productId: string) => {
    setCart(prev => {
      const newCart = {
        ...prev
      };
      if (newCart[productId] > 1) {
        newCart[productId] = newCart[productId] - 1;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };
  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = {
        ...prev
      };
      delete newCart[productId];
      return newCart;
    });
    const product = products.find(p => p.id === productId);
    toast({
      title: "Verwijderd uit winkelwagen",
      description: `${product?.name} is verwijderd uit je winkelwagen.`
    });
  };
  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return total + (product?.price || 0) * quantity;
    }, 0);
  };
  const getCartItemCount = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };
  const validateCustomer = () => {
    const missing: string[] = [];
    if (!customer.firstName) missing.push("voornaam");
    if (!customer.lastName) missing.push("achternaam");
    if (!customer.email) missing.push("e-mail");
    if (!customer.phone) missing.push("telefoon");
    if (!customer.street) missing.push("straat");
    if (!customer.houseNumber) missing.push("huisnummer");
    if (!customer.postcode) missing.push("postcode");
    if (!customer.city) missing.push("plaats");
    return missing;
  };
  const checkout = async () => {
    try {
      console.log('[Webshop] Checkout clicked');
      setIsCheckingOut(true);
      const items = Object.entries(cart).map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        if (!product) return null;
        return {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity
        };
      }).filter(Boolean);
      if (!items.length) {
        toast({
          title: "Winkelwagen leeg",
          description: "Voeg eerst producten toe.",
          variant: "destructive"
        });
        console.warn('[Webshop] No items to checkout');
        return;
      }
      const missing = validateCustomer();
      if (missing.length) {
        toast({
          title: "Gegevens incompleet",
          description: `Vul nog in: ${missing.join(', ')}`,
          variant: "destructive"
        });
        return;
      }
      const {
        data,
        error
      } = await supabase.functions.invoke('create-shop-order', {
        body: {
          items,
          customer
        }
      });
      console.log('[Webshop] create-shop-order response', {
        data,
        error
      });
      if (error || (data as any)?.error) {
        throw new Error(error?.message || (data as any)?.error || 'Afrekenen mislukt');
      }
      const paymentUrl = (data as any)?.paymentUrl;
      if (!paymentUrl) {
        console.error('[Webshop] No paymentUrl in response');
        toast({
          title: "Afrekenen mislukt",
          description: "Geen betaal-link ontvangen van server.",
          variant: "destructive"
        });
        return;
      }
      window.location.href = paymentUrl;
    } catch (e: any) {
      toast({
        title: "Afrekenen mislukt",
        description: e.message || String(e),
        variant: "destructive"
      });
      console.error('[Webshop] Checkout error', e);
    } finally {
      setIsCheckingOut(false);
    }
  };
  return <div className="min-h-screen sticky w-full overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/98 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 transition-all duration-300 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 text-primary hover:text-primary/80 transition-all duration-300 group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-semibold text-lg">Terug naar website</span>
            </Link>
            <div className="flex items-center space-x-6">
              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="relative group p-3 rounded-2xl transition-all duration-300 hover:bg-primary/10">
                    <div className={`transition-all duration-300 ${getCartItemCount() > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    {getCartItemCount() > 0 && <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {getCartItemCount()}
                        </span>
                      </div>}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-lg">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Winkelwagen ({getCartItemCount()} items)
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4 max-h-[70vh] sm:max-h-[75vh] overflow-y-auto scroll-smooth pb-40" style={{
                  scrollBehavior: 'smooth',
                  scrollbarWidth: 'thin'
                }}>
                    {Object.entries(cart).length === 0 ? <div className="text-center py-8">
                        <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Je winkelwagen is leeg</p>
                      </div> : Object.entries(cart).map(([productId, quantity]) => {
                    const product = products.find(p => p.id === productId);
                    if (!product) return null;
                    return <div key={productId} className="flex items-center space-x-4 p-4 border rounded-lg">
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="w-16 h-16 object-cover rounded-lg" 
                              loading="lazy"
                              decoding="async"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{product.name}</h4>
                              <p className="text-sm text-muted-foreground">€{product.price.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm" onClick={() => decreaseQuantity(productId)} className="w-8 h-8 p-0">
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center font-semibold">{quantity}</span>
                              <Button variant="outline" size="sm" onClick={() => increaseQuantity(productId)} className="w-8 h-8 p-0">
                                <Plus className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => removeFromCart(productId)} className="w-8 h-8 p-0 text-destructive hover:bg-destructive/10">
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>;
                  })}

                    {getCartItemCount() > 0 && <div className="mt-6 space-y-4 border-t pt-4">
                        {/* Customer details form */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">Voornaam</Label>
                            <Input id="firstName" value={customer.firstName} onChange={e => setCustomer({
                          ...customer,
                          firstName: e.target.value
                        })} placeholder="Jan" />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Achternaam</Label>
                            <Input id="lastName" value={customer.lastName} onChange={e => setCustomer({
                          ...customer,
                          lastName: e.target.value
                        })} placeholder="Jansen" />
                          </div>
                          <div className="sm:col-span-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input id="email" type="email" value={customer.email} onChange={e => setCustomer({
                          ...customer,
                          email: e.target.value
                        })} placeholder="jan@voorbeeld.nl" />
                          </div>
                          <div className="sm:col-span-2">
                            <Label htmlFor="phone">Telefoon</Label>
                            <Input id="phone" value={customer.phone} onChange={e => setCustomer({
                          ...customer,
                          phone: e.target.value
                        })} placeholder="0612345678" />
                          </div>
                          <div className="sm:col-span-2">
                            <Label htmlFor="street">Straat</Label>
                            <Input id="street" value={customer.street} onChange={e => setCustomer({
                          ...customer,
                          street: e.target.value
                        })} placeholder="Hoofdstraat" />
                          </div>
                          <div>
                            <Label htmlFor="houseNumber">Huisnummer</Label>
                            <Input id="houseNumber" value={customer.houseNumber} onChange={e => setCustomer({
                          ...customer,
                          houseNumber: e.target.value
                        })} placeholder="12A" />
                          </div>
                          <div>
                            <Label htmlFor="postcode">Postcode</Label>
                            <Input id="postcode" value={customer.postcode} onChange={e => setCustomer({
                          ...customer,
                          postcode: e.target.value
                        })} placeholder="1234 AB" />
                          </div>
                          <div className="sm:col-span-2">
                            <Label htmlFor="city">Plaats</Label>
                            <Input id="city" value={customer.city} onChange={e => setCustomer({
                          ...customer,
                          city: e.target.value
                        })} placeholder="Amsterdam" />
                          </div>
                          <div className="sm:col-span-2">
                            <Label htmlFor="country">Land</Label>
                            <Input id="country" value={customer.country} onChange={e => setCustomer({
                          ...customer,
                          country: e.target.value
                        })} placeholder="Nederland" />
                          </div>
                        </div>
                      </div>}
                  </div>

                  {getCartItemCount() > 0 && <div className="sticky bottom-0 left-0 right-0 -mx-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t border-border p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotaal:</span>
                          <span>€{getCartTotal().toFixed(2)}</span>
                        </div>
                        {getCartTotal() < 50 && (
                          <div className="flex justify-between text-sm">
                            <span>Verzendkosten:</span>
                            <span>€5.00</span>
                          </div>
                        )}
                        {getCartTotal() >= 50 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Verzending:</span>
                            <span>Gratis</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Totaal:</span>
                          <span>€{(getCartTotal() + (getCartTotal() >= 50 ? 0 : 5.00)).toFixed(2)}</span>
                        </div>
                      </div>
                      <Button className="w-full mt-4" size="lg" onClick={checkout} disabled={isCheckingOut}>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {isCheckingOut ? 'Bezig met afrekenen...' : 'Naar afrekenen'}
                      </Button>
                    </div>}
                </SheetContent>
              </Sheet>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">
                  €{(getCartTotal() + (getCartTotal() >= 50 ? 0 : 5.00)).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {getCartItemCount() > 0 ? `${getCartItemCount()} items` : 'Winkelwagen leeg'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-32 hero-gradient overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[url('/src/assets/webshop-hero-bg.jpg')] bg-cover bg-center bg-no-repeat opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/80"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-3xl opacity-30"></div>
        
        <div className="container mx-auto px-4 relative">
          <div ref={headerRef} className={`text-center transition-all duration-500 ${headerVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-sm rounded-full text-primary font-semibold text-sm mb-8 border border-primary/20">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Bouw met Respect Shop
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 text-foreground leading-tight">
              Merchandise voor een <br/>
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                respectvolle bouwplaats
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-12">
              Laat zien dat je onderdeel bent van de beweging. Koop hoogwaardige merchandise 
              en draag bij aan bewustwording voor een respectvolle bouwsector.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Gratis verzending vanaf €50
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full border border-accent/20">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                Hoogwaardige kwaliteit
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full border border-secondary/20">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                Steun de beweging
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <section className="bg-primary overflow-hidden">
        <MarqueeAnimation direction="left" baseVelocity={-1} className="bg-primary text-white py-6 text-4xl md:text-6xl">
          Bouw met Respect • Respectvolle Bouwplaats • Hoogwaardige Merchandise • Steun de Beweging • Premium Kwaliteit • Samen Bouwen aan Respect
        </MarqueeAnimation>
      </section>
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-primary/3 via-background to-secondary/3">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-background to-accent/3"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-3xl opacity-50"></div>
        
        <div className="container mx-auto px-4 relative">
          <div ref={productsRef} className={`transition-all duration-500 ${productsVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-sm rounded-full text-primary font-semibold text-sm mb-8 border border-primary/20">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Premium Merchandise
              </div>
              <h2 className="text-5xl md:text-6xl font-bold mb-8 text-foreground leading-tight">
                Onze <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">exclusieve</span> collectie
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Hoogwaardige merchandise om je steun voor de beweging te tonen. 
                Elke aankoop draagt bij aan een respectvolle bouwsector.
              </p>
            </div>

            {/* Products count indicator */}
            {!productsLoading && products.length > 0 && (
              <div className="text-center mb-8">
                <div className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-full font-semibold shadow-lg">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                  {products.length} {products.length === 1 ? 'product beschikbaar' : 'producten beschikbaar'}
                </div>
              </div>
            )}

            <div className={`grid gap-8 mx-auto px-4 justify-items-center transition-all duration-500 ${
              productsLoading ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 max-w-8xl' :
              products.length === 1 ? 'grid-cols-1 max-w-md' :
              products.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl' :
              products.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl' :
              'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 max-w-8xl'
            }`}>
              {productsLoading && (
                Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="group relative overflow-hidden bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm border-2 border-border/30 flex flex-col h-full animate-pulse w-full max-w-sm">
                    <CardHeader className="relative p-6">
                      <div className="aspect-square bg-muted rounded-3xl mb-6"></div>
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-6 bg-muted rounded"></div>
                    </CardHeader>
                    <CardContent className="relative space-y-6 p-6 pt-0 flex-1">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))
              )}
              
              {!productsLoading && products.length === 0 && (
                <div className="col-span-full text-center py-20">
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingCart className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">Geen producten beschikbaar</h3>
                  <p className="text-lg text-muted-foreground max-w-md mx-auto">
                    Er zijn momenteel geen producten beschikbaar in de webshop.
                  </p>
                </div>
              )}
              
              {!productsLoading && products.length > 0 && products.map((product, index) => (
                <Card key={product.id} className={`group relative overflow-hidden bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm border-2 border-border/30 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-700 hover:scale-[1.02] flex flex-col h-full w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 ${productsVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`} style={{
              transitionDelay: productsVisible ? `${index * 150}ms` : '0ms'
            }}>
                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  
                  {/* Floating elements */}
                  <div className="absolute top-4 right-4 w-3 h-3 bg-primary/30 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
                  <div className="absolute top-6 right-8 w-2 h-2 bg-secondary/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse" style={{
                animationDelay: '0.3s'
              }}></div>
                  
                  <CardHeader className="relative p-6">
                    <div className="aspect-square bg-gradient-to-br from-muted/50 to-muted/80 rounded-3xl overflow-hidden mb-6 shadow-xl group-hover:shadow-2xl transition-all duration-300 relative">
                      {/* Image glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                      
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" 
                        loading="lazy"
                        decoding="async"
                      />
                      
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 ease-out"></div>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <Badge className="bg-primary/15 text-primary border-primary/30 font-semibold px-3 py-1.5 text-sm rounded-full group-hover:bg-primary/25 transition-colors duration-300">
                        {product.category}
                      </Badge>
                      {product.inStock && <Badge className="bg-green-500/15 text-green-600 border-green-500/30 font-semibold text-sm rounded-full flex items-center gap-1.5 px-3 py-1.5 group-hover:bg-green-500/25 transition-colors duration-300">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          Op voorraad
                        </Badge>}
                    </div>
                    
                    <CardTitle className="text-xl lg:text-2xl font-bold group-hover:text-primary transition-all duration-300 leading-tight mb-1">
                      {product.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="relative space-y-6 p-6 pt-0 flex-1">
                    <p className="text-muted-foreground leading-relaxed text-base group-hover:text-foreground/80 transition-colors duration-300">
                      {product.description}
                    </p>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider text-primary/80">Kenmerken</h4>
                      {product.features.map((feature, idx) => <div key={idx} className="flex items-center text-muted-foreground group-hover:text-foreground/90 transition-all duration-300">
                          <div className="w-6 h-6 bg-primary/15 rounded-full flex items-center justify-center mr-3 flex-shrink-0 group-hover:bg-primary/25 group-hover:scale-110 transition-all duration-300">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          </div>
                          <span className="font-medium text-sm">{feature}</span>
                        </div>)}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between pt-6 border-t border-border/50 gap-4 mt-auto">
                      <div className="flex-1">
                        <span className="text-3xl font-bold text-primary block group-hover:scale-105 transition-transform duration-300 origin-left">
                          €{product.price.toFixed(2)}
                        </span>
                        <p className="text-sm text-muted-foreground">Incl. BTW</p>
                      </div>
                      {cart[product.id] > 0 && <div className="flex-shrink-0">
                          <div className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-primary/15 to-secondary/15 rounded-full border border-primary/20">
                            <ShoppingCart className="w-3 h-3 mr-2 text-primary" />
                            <span className="text-sm font-semibold text-primary">
                              {cart[product.id]}× in wagen
                            </span>
                          </div>
                        </div>}
                    </div>
                  </CardContent>

                  <CardFooter className="relative pt-0 p-6 mt-auto">
                    <Button onClick={() => addToCart(product.id)} className="w-full h-14 text-base font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-blue-900 shadow-lg hover:shadow-xl hover:shadow-yellow-400/30 transition-all duration-300 hover:scale-105 transform-gpu border-2 border-yellow-300 hover:border-yellow-400 rounded-xl" disabled={!product.inStock} size="lg">
                      <ShoppingCart className="w-5 h-5 mr-2 flex-shrink-0 group-hover:rotate-12 transition-transform duration-300" />
                      <span className="hidden sm:inline">In Winkelwagen</span>
                      <span className="sm:hidden">In Winkelwagen</span>
                    </Button>
                  </CardFooter>
                  
                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Card>
              ))}
            </div>
            
            {/* Floating call-to-action */}
            <div className="text-center mt-16">
              <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 backdrop-blur-sm rounded-2xl border border-primary/20 shadow-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
                <span className="text-foreground font-semibold">Alle producten zijn direct leverbaar</span>
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse ml-3"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-24 bg-gradient-to-br from-muted/30 via-background to-muted/30 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]"></div>
        
        <div className="container mx-auto px-4 text-center relative">
          {/* Decorative elements */}
          <div className="absolute top-10 left-1/4 w-32 h-32 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-1/4 w-24 h-24 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-2xl"></div>
          
          <div className="max-w-4xl mx-auto mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm rounded-full text-primary font-semibold text-sm mb-8 border border-primary/20">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Waarom Bouw met Respect
            </div>
            <h3 className="text-5xl md:text-6xl font-bold mb-8 text-foreground leading-tight">
              Waarom onze <br/>
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                merchandise kopen?
              </span>
            </h3>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              Elke aankoop draagt bij aan een betere toekomst voor de bouwsector.<br/>
              <span className="text-primary font-semibold">Samen bouwen we aan respect.</span>
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="group">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/30 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                <Coffee className="w-10 h-10 text-primary" />
              </div>
              <h4 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">
                Premium Kwaliteit
              </h4>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Hoogwaardige materialen die bestand zijn tegen dagelijks gebruik op de bouwplaats en kantoor
              </p>
            </div>
            
            <div className="group">
              <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-accent/30 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                <Edit3 className="w-10 h-10 text-accent" />
              </div>
              <h4 className="text-2xl font-bold mb-4 group-hover:text-accent transition-colors duration-300">
                Bewustwording
              </h4>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Draag bij aan bewustwording voor een respectvolle bouwsector en laat anderen zien waar je voor staat
              </p>
            </div>
            
            <div className="group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-600/30 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                <ShoppingCart className="w-10 h-10 text-green-600" />
              </div>
              <h4 className="text-2xl font-bold mb-4 group-hover:text-green-600 transition-colors duration-300">
                Steun de Beweging
              </h4>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Opbrengsten worden gebruikt om de beweging te versterken en meer bedrijven te bereiken
              </p>
            </div>
          </div>
          
          <div className="mt-16 p-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-left">
                <h4 className="text-2xl font-bold mb-2 text-foreground">Gratis verzending vanaf €50</h4>
                <p className="text-muted-foreground">
                  Bestel voor meer dan €50 en we verzenden gratis naar heel Nederland
                </p>
              </div>
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-semibold text-lg">Binnen 2-3 werkdagen geleverd</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full blur-3xl opacity-60"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-8 py-4 bg-white/80 backdrop-blur-md rounded-full text-blue-700 font-bold text-base mb-10 border border-blue-200 shadow-lg">
              ❓ Veelgestelde Vragen
            </div>
            <h3 className="text-5xl md:text-6xl font-bold mb-8 text-gray-900 leading-tight">
              Alles wat je wilt <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">weten</span>
            </h3>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Vind snel antwoorden op de meest gestelde vragen over onze merchandise en het bestelproces
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="bg-white/80 backdrop-blur-sm rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <AccordionTrigger className="px-8 py-6 text-left hover:no-underline group">
                  <div className="flex items-center gap-4">
                    
                    <span className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                      Hoe lang duurt de levering?
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-6">
                  <div className="pl-16">
                    <p className="text-gray-700 text-lg leading-relaxed">
                      We leveren binnen <span className="font-semibold text-blue-600">2-3 werkdagen</span> in heel Nederland. 
                      Bij bestellingen boven <span className="font-semibold text-green-600">€50</span> is de verzending gratis!
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="bg-white/80 backdrop-blur-sm rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <AccordionTrigger className="px-8 py-6 text-left hover:no-underline group">
                  <div className="flex items-center gap-4">
                    
                    <span className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors duration-300">
                      Kan ik mijn bestelling retourneren?
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-6">
                  <div className="pl-16">
                    <p className="text-gray-700 text-lg leading-relaxed">
                      Ja, je hebt <span className="font-semibold text-green-600">30 dagen retourrecht</span>. 
                      Stuur ons een email en we regelen de retour voor je. Geen vragen gesteld!
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="bg-white/80 backdrop-blur-sm rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <AccordionTrigger className="px-8 py-6 text-left hover:no-underline group">
                  <div className="flex items-center gap-4">
                    
                    <span className="text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors duration-300">
                      Zijn de producten van goede kwaliteit?
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-6">
                  <div className="pl-16">
                    <p className="text-gray-700 text-lg leading-relaxed">
                      Absoluut! We werken alleen met <span className="font-semibold text-purple-600">hoogwaardige materialen</span> 
                      die bestand zijn tegen dagelijks gebruik op de bouwplaats en in het kantoor.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="bg-white/80 backdrop-blur-sm rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <AccordionTrigger className="px-8 py-6 text-left hover:no-underline group">
                  <div className="flex items-center gap-4">
                    
                    <span className="text-xl font-bold text-gray-900 group-hover:text-orange-700 transition-colors duration-300">
                      Waarvoor worden de opbrengsten gebruikt?
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-6">
                  <div className="pl-16">
                    <p className="text-gray-700 text-lg leading-relaxed">
                      Alle opbrengsten worden gebruikt om de <span className="font-semibold text-orange-600">Bouw met Respect beweging</span> 
                      te versterken en meer bedrijven te bereiken voor een respectvolle bouwsector.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="bg-white/80 backdrop-blur-sm rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <AccordionTrigger className="px-8 py-6 text-left hover:no-underline group">
                  <div className="flex items-center gap-4">
                    
                    <span className="text-xl font-bold text-gray-900 group-hover:text-cyan-700 transition-colors duration-300">
                      Kan ik betalen met iDEAL?
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-6">
                  <div className="pl-16">
                    <p className="text-gray-700 text-lg leading-relaxed">
                      Ja, we accepteren alle gangbare betaalmethoden waaronder <span className="font-semibold text-cyan-600">iDEAL, creditcard en bankoverschrijving</span> 
                      via ons veilige Mollie payment platform.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="bg-white/80 backdrop-blur-sm rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <AccordionTrigger className="px-8 py-6 text-left hover:no-underline group">
                  <div className="flex items-center gap-4">
                    
                    <span className="text-xl font-bold text-gray-900 group-hover:text-yellow-700 transition-colors duration-300">
                      Krijg ik een factuur voor mijn bestelling?
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-6">
                  <div className="pl-16">
                    <p className="text-gray-700 text-lg leading-relaxed">
                      Ja, na je bestelling ontvang je automatisch een <span className="font-semibold text-yellow-600">factuur per email</span> 
                      die je kunt gebruiken voor je administratie en eventuele belastingaftrek.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Special Offer Section */}
      

      {/* Trust Badges Section */}
      
      
      <Footer />
    </div>;
};
export default Webshop;