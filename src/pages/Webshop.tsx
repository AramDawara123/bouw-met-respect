import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ShoppingCart, Coffee, Edit3, ArrowLeft, Plus, Minus, X, ChevronDown, Tag, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateDiscountCode, calculateDiscount, formatDiscountDisplay } from "@/lib/discountUtils";
import { RealTimeOrderSummary } from '@/components/RealTimeOrderSummary';
import { MarqueeAnimation } from "@/components/ui/marquee-effect";
import { useCart } from "@/hooks/useCart";
const Webshop = () => {
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
  const webshopFaqs = [{
    question: "Hoe lang duurt de levering?",
    answer: "We leveren binnen 2-3 werkdagen in heel Nederland. Bij bestellingen boven €50 is de verzending gratis!"
  }, {
    question: "Kan ik mijn bestelling retourneren?",
    answer: "Ja, je hebt 30 dagen retourrecht. Stuur ons een email en we regelen de retour voor je. Geen vragen gesteld!"
  }, {
    question: "Zijn de producten van goede kwaliteit?",
    answer: "Absoluut! We werken alleen met hoogwaardige materialen die bestand zijn tegen dagelijks gebruik op de bouwplaats en in het kantoor."
  }, {
    question: "Waarvoor worden de opbrengsten gebruikt?",
    answer: "Alle opbrengsten worden gebruikt om de Bouw met Respect beweging te versterken en meer bedrijven te bereiken voor een respectvolle bouwsector."
  }, {
    question: "Kan ik betalen met iDEAL?",
    answer: "Ja, we accepteren alle gangbare betaalmethoden waaronder iDEAL, creditcard en bankoverschrijving via ons veilige Mollie payment platform."
  }, {
    question: "Krijg ik een factuur voor mijn bestelling?",
    answer: "Ja, na je bestelling ontvang je automatisch een factuur per email die je kunt gebruiken voor je administratie en eventuele belastingaftrek."
  }];
  const {
    ref: headerRef,
    isVisible: headerVisible
  } = useScrollAnimation(0.2);
  const {
    ref: productsRef,
    isVisible: productsVisible
  } = useScrollAnimation(0.1);
  
  // Use the cart hook for persistence
  const {
    cart,
    addToCart: addToCartAction,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart: removeFromCartAction,
    clearCart,
    getTotalItemCount
  } = useCart();
  
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
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [discountError, setDiscountError] = useState<string>("");
  const [checkingDiscount, setCheckingDiscount] = useState(false);
  const {
    toast
  } = useToast();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const free = params.get('free');
    
    if (status === 'paid') {
      if (free === 'true') {
        toast({
          title: "Bedankt!",
          description: "Je gratis bestelling is bevestigd."
        });
      } else {
        toast({
          title: "Bedankt!",
          description: "Je betaling is ontvangen."
        });
      }
      
      const url = new URL(window.location.href);
      url.searchParams.delete('status');
      url.searchParams.delete('free');
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
        const {
          data,
          error
        } = await supabase.from('products').select('*').eq('in_stock', true) // Only show products that are in stock
        .order('category', {
          ascending: true
        }).order('name', {
          ascending: true
        });
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
            price: product.price / 100,
            // Convert from cents to euros
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
  // Memoized cart calculations for performance
  const cartTotal = useMemo(() => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return total + (product?.price || 0) * quantity;
    }, 0);
  }, [cart, products]);
  const cartItemCount = useMemo(() => {
    return getTotalItemCount();
  }, [getTotalItemCount]);
  const discountAmount = useMemo(() => {
    if (!appliedDiscount) return 0;
    const discountCents = calculateDiscount(appliedDiscount, cartTotal * 100); // Keep in cents
    console.log('[Webshop] Discount calculation:', { 
      appliedDiscount, 
      cartTotal, 
      cartTotalCents: cartTotal * 100,
      discountInCents: discountCents,
      discountInEuros: discountCents / 100 
    });
    return discountCents; // Return in cents instead of euros
  }, [appliedDiscount, cartTotal]);
  const finalTotal = useMemo(() => {
    const subtotalCents = cartTotal * 100; // Work in cents
    const subtotalAfterDiscountCents = Math.max(0, subtotalCents - discountAmount);
    const isFreeShipping = subtotalAfterDiscountCents >= 5000 || discountAmount >= subtotalCents; // 50 EUR = 5000 cents
    const shippingCents = isFreeShipping ? 0 : 500; // 5 EUR = 500 cents
    const totalCents = subtotalAfterDiscountCents + shippingCents;
    const total = totalCents / 100; // Convert back to euros for display
    
    console.log('[Webshop] Final total calculation:', { 
      cartTotal, 
      cartTotalCents: subtotalCents,
      discountAmountCents: discountAmount,
      discountAmountEuros: discountAmount / 100, 
      subtotalAfterDiscountCents,
      isFreeShipping, 
      shippingCents,
      totalCents,
      finalTotal: total 
    });
    return total;
  }, [cartTotal, discountAmount]);
  const checkDiscountCode = async (code: string) => {
    if (!code.trim()) {
      setAppliedDiscount(null);
      setDiscountError("");
      return;
    }
    setCheckingDiscount(true);
    setDiscountError("");
    const result = await validateDiscountCode(code, 'products', cartTotal * 100);
    if (result.valid && result.discount) {
      setAppliedDiscount(result.discount);
      toast({
        title: "Kortingscode toegepast!",
        description: formatDiscountDisplay(result.discount)
      });
    } else {
      setAppliedDiscount(null);
      setDiscountError(result.error || "Ongeldige kortingscode");
    }
    setCheckingDiscount(false);
  };

  // Wrapper functions to add toast notifications
  const addToCart = useCallback((productId: string) => {
    addToCartAction(productId);
    const product = products.find(p => p.id === productId);
    toast({
      title: "Toegevoegd aan winkelwagen",
      description: `${product?.name} is toegevoegd aan je winkelwagen.`
    });
  }, [addToCartAction, products, toast]);

  const removeFromCart = useCallback((productId: string) => {
    removeFromCartAction(productId);
    const product = products.find(p => p.id === productId);
    toast({
      title: "Verwijderd uit winkelwagen",
      description: `${product?.name} is verwijderd uit je winkelwagen.`
    });
  }, [removeFromCartAction, products, toast]);
  // Auto-redirect handler for free orders
  const handleFreeOrderRedirect = useCallback(() => {
    console.log('[Webshop] Redirecting to order-thank-you for free order');
    clearCart();
    setAppliedDiscount(null);
    window.location.href = '/order-thank-you';
  }, [clearCart, setAppliedDiscount]);
  
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
  const checkout = useCallback(async () => {
    try {
      console.log('[Webshop] Checkout clicked');
      console.log('[Webshop] Cart total:', cartTotal);
      console.log('[Webshop] Discount amount:', discountAmount);
      console.log('[Webshop] Final total:', finalTotal);
      console.log('[Webshop] Applied discount:', appliedDiscount);
      
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

      // Log the current state for debugging
      console.log('[Webshop] Checkout details:', {
        finalTotal,
        cartTotal,
        discountAmount,
        appliedDiscount: appliedDiscount?.code
      });

      // Check if total is 0 (free order due to discount) - handle immediately
      if (finalTotal <= 0) {
        console.log('[Webshop] Free order detected (€0.00), redirecting directly to thank you page');
        clearCart();
        setAppliedDiscount(null);
        window.location.href = '/order-thank-you';
        return;
      }

      const {
        data,
        error
      } = await supabase.functions.invoke('create-shop-order', {
        body: {
          items,
          customer,
          discountCode: appliedDiscount?.code,
          discountAmount: discountAmount // Already in cents, don't convert again
        }
      });
      
      console.log('[Webshop] Sending to backend:', {
        items,
        discountCode: appliedDiscount?.code,
        discountAmount,
        discountAmountEuros: discountAmount / 100,
        finalTotal,
        cartTotal,
        cartTotalCents: cartTotal * 100
      });
      console.log('[Webshop] create-shop-order response', {
        data,
        error,
        finalTotal,
        isSuccess: (data as any)?.success,
        redirectUrl: (data as any)?.redirectUrl,
        paymentUrl: (data as any)?.paymentUrl
      });
      
      if (error || (data as any)?.error) {
        throw new Error(error?.message || (data as any)?.error || 'Afrekenen mislukt');
      }
      
      // Handle free orders from backend
      if ((data as any)?.success && (data as any)?.redirectUrl) {
        const redirectUrl = (data as any)?.redirectUrl;
        console.log('[Webshop] Free order created, redirecting to:', redirectUrl);
        // Clear cart after successful free order
        clearCart();
        setAppliedDiscount(null);
        window.location.href = redirectUrl;
        return;
      }

      const paymentUrl = (data as any)?.paymentUrl;
      const orderId = (data as any)?.orderId;
      if (!paymentUrl) {
        console.error('[Webshop] No paymentUrl in response');
        toast({
          title: "Afrekenen mislukt",
          description: "Geen betaal-link ontvangen van server.",
          variant: "destructive"
        });
        return;
      }

      // Send immediate fallback confirmation email after successful order creation
      try {
        console.log('[Webshop] Sending fallback confirmation email...');
        const shipping = (cartTotal >= 50 || discountAmount >= cartTotal) ? 0 : 500; // Free shipping for 50+ EUR or 100% discount
        const {
          error: emailError
        } = await supabase.functions.invoke('send-order-confirmation', {
          body: {
            orderId: orderId || 'ORDER-' + Date.now(),
            customerEmail: customer.email,
            customerName: `${customer.firstName} ${customer.lastName}`,
            orderItems: items,
            subtotal: cartTotal * 100,
            // Convert to cents
            shipping: shipping,
            total: finalTotal * 100,
            // Convert to cents
            shippingAddress: {
              street: customer.street,
              houseNumber: customer.houseNumber,
              postcode: customer.postcode,
              city: customer.city,
              country: 'Nederland'
            },
            orderDate: new Date().toLocaleDateString('nl-NL')
          }
        });
        if (emailError) {
          console.error('[Webshop] Fallback email failed:', emailError);
        } else {
          console.log('[Webshop] Fallback confirmation email sent successfully');
        }
      } catch (emailError) {
        console.error('[Webshop] Error sending fallback email:', emailError);
      }
      
      // Clear cart after successful order creation
      clearCart();
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
  }, [cart, products, customer, toast]);
  return (
    <div className="min-h-screen w-full">
      {/* Sticky Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 text-primary hover:text-primary/80 transition-colors duration-200 group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="font-semibold text-lg">Terug naar website</span>
            </Link>
            <div className="flex items-center space-x-6">
              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="relative group p-3 rounded-2xl transition-all duration-200 hover:bg-primary/10">
                    <div className={`transition-colors duration-200 ${cartItemCount > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    {cartItemCount > 0 && <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {cartItemCount}
                        </span>
                      </div>}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full max-w-md sm:max-w-lg flex flex-col h-full">
                  <SheetHeader className="pb-4 flex-shrink-0">
                    <SheetTitle className="flex items-center gap-2 text-lg">
                      <ShoppingCart className="w-5 h-5" />
                      Winkelwagen ({cartItemCount} items)
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="flex-1 overflow-y-auto -mx-2 px-2 min-h-0">
                    <div className="space-y-4 pb-4">
                      {Object.entries(cart).length === 0 ? (
                        <div className="text-center py-8">
                          <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">Je winkelwagen is leeg</p>
                        </div>
                      ) : (
                        Object.entries(cart).map(([productId, quantity]) => {
                          const product = products.find(p => p.id === productId);
                          if (!product) return null;
                          return (
                            <div key={productId} className="flex items-center space-x-3 p-3 border border-accent rounded-lg bg-accent/5">
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0" 
                                loading="lazy" 
                                decoding="async" 
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                                <p className="text-sm text-muted-foreground">€{product.price.toFixed(2)}</p>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => decreaseQuantity(productId)} 
                                  className="w-7 h-7 p-0"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-8 text-center font-semibold text-sm">{quantity}</span>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => increaseQuantity(productId)} 
                                  className="w-7 h-7 p-0"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => removeFromCart(productId)} 
                                  className="w-7 h-7 p-0 text-destructive hover:bg-destructive/10 ml-1"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      )}

                      {cartItemCount > 0 && (
                        <div className="space-y-4 border-t pt-4">
                          {/* Customer details form */}
                          <div className="space-y-4">
                            <h3 className="font-semibold text-base">Contactgegevens</h3>
                            <div className="grid gap-4">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label htmlFor="firstName" className="text-sm">Voornaam</Label>
                                  <Input 
                                    id="firstName" 
                                    value={customer.firstName} 
                                    onChange={e => setCustomer({...customer, firstName: e.target.value})} 
                                    placeholder="Jan" 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="lastName" className="text-sm">Achternaam</Label>
                                  <Input 
                                    id="lastName" 
                                    value={customer.lastName} 
                                    onChange={e => setCustomer({...customer, lastName: e.target.value})} 
                                    placeholder="Jansen"
                                    className="mt-1" 
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <Label htmlFor="email" className="text-sm">E-mail</Label>
                                <Input 
                                  id="email" 
                                  type="email" 
                                  value={customer.email} 
                                  onChange={e => setCustomer({...customer, email: e.target.value})} 
                                  placeholder="jan@voorbeeld.nl"
                                  className="mt-1"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="phone" className="text-sm">Telefoon</Label>
                                <Input 
                                  id="phone" 
                                  value={customer.phone} 
                                  onChange={e => setCustomer({...customer, phone: e.target.value})} 
                                  placeholder="0612345678"
                                  className="mt-1"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="street" className="text-sm">Straat</Label>
                                <Input 
                                  id="street" 
                                  value={customer.street} 
                                  onChange={e => setCustomer({...customer, street: e.target.value})} 
                                  placeholder="Hoofdstraat"
                                  className="mt-1"
                                />
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label htmlFor="houseNumber" className="text-sm">Huisnummer</Label>
                                  <Input 
                                    id="houseNumber" 
                                    value={customer.houseNumber} 
                                    onChange={e => setCustomer({...customer, houseNumber: e.target.value})} 
                                    placeholder="12A"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="postcode" className="text-sm">Postcode</Label>
                                  <Input 
                                    id="postcode" 
                                    value={customer.postcode} 
                                    onChange={e => setCustomer({...customer, postcode: e.target.value})} 
                                    placeholder="1234 AB"
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <Label htmlFor="city" className="text-sm">Plaats</Label>
                                <Input 
                                  id="city" 
                                  value={customer.city} 
                                  onChange={e => setCustomer({...customer, city: e.target.value})} 
                                  placeholder="Amsterdam"
                                  className="mt-1"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="country" className="text-sm">Land</Label>
                                <Input 
                                  id="country" 
                                  value={customer.country} 
                                  onChange={e => setCustomer({...customer, country: e.target.value})} 
                                  placeholder="Nederland"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3 pt-4 border-t">
                            <Label htmlFor="discountCode" className="flex items-center gap-2 text-sm">
                              <Tag className="w-4 h-4" />
                              Kortingscode (optioneel)
                            </Label>
                            <Input 
                              id="discountCode" 
                              value={discountCode} 
                              onChange={e => {
                                setDiscountCode(e.target.value.toUpperCase());
                                checkDiscountCode(e.target.value);
                              }} 
                              placeholder="KORTINGSCODE" 
                              className="uppercase"
                            />
                            {discountError && (
                              <p className="text-sm text-destructive">{discountError}</p>
                            )}
                            {appliedDiscount && (
                              <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-600" />
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  {formatDiscountDisplay(appliedDiscount)} toegepast
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {cartItemCount > 0 && (
                    <div className="flex-shrink-0 border-t bg-background p-4 -mx-6 -mb-6 mt-4 safe-area-inset-bottom">
                      <RealTimeOrderSummary
                        cartTotal={cartTotal}
                        discountAmount={discountAmount}
                        appliedDiscount={appliedDiscount}
                        onFreeOrderRedirect={handleFreeOrderRedirect}
                      />
                      <Button 
                        className="w-full mt-4 h-12 text-base font-semibold" 
                        size="lg" 
                        onClick={checkout} 
                        disabled={isCheckingOut || finalTotal <= 0}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {isCheckingOut ? 'Bezig met afrekenen...' : 
                         finalTotal <= 0 ? 'Gratis bestelling verwerken...' : 'Naar afrekenen'}
                      </Button>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
              <div className="text-right">
                
                <p className="text-sm text-muted-foreground">
                  {cartItemCount > 0 ? `${cartItemCount} items` : 'Winkelwagen leeg'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Add top padding to account for fixed header */}
      <section className="relative py-32 pt-44 hero-gradient overflow-hidden">
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
              Merchandise voor een <br />
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
              <div className="text-muted-foreground">•</div>
              <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full border border-accent/20">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                Hoogwaardige kwaliteit
              </div>
              <div className="text-muted-foreground">•</div>
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full border border-secondary/20">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                Steun de beweging
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <section className="py-8 bg-gradient-to-r from-primary to-secondary overflow-hidden">
        <MarqueeAnimation baseVelocity={1} direction="right" className="text-white/90 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-wider">
          Bouw met Respect • Respectvolle Bouwplaats • Hoogwaardige Merchandise • Steun de Beweging • Premium Kwaliteit • Samen Bouwen aan Respect • Bouw met Respect •
        </MarqueeAnimation>
      </section>

      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-primary/3 via-background to-secondary/3">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-background to-accent/3"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-3xl opacity-50"></div>
        
        <div className="container mx-auto px-4 relative">
          <div ref={productsRef}>
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
            {!productsLoading && products.length > 0 && <div className="text-center mb-8">
                <div className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-full font-semibold shadow-lg">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                  {products.length} {products.length === 1 ? 'product beschikbaar' : 'producten beschikbaar'}
                </div>
              </div>}

            <div className={`grid gap-8 mx-auto px-4 justify-items-center ${productsLoading ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 max-w-8xl' : products.length === 1 ? 'grid-cols-1 max-w-md' : products.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl' : products.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 max-w-8xl'}`}>
              {productsLoading && Array.from({
              length: 4
            }).map((_, index) => <Card key={index} className="group relative overflow-hidden bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm border-2 border-border/30 flex flex-col h-full w-full max-w-sm">
                    <CardHeader className="relative p-6">
                      <div className="aspect-square bg-muted rounded-3xl mb-6"></div>
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-6 bg-muted rounded"></div>
                    </CardHeader>
                    <CardContent className="relative space-y-6 p-6 pt-0 flex-1">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </CardContent>
                  </Card>)}
              
              {!productsLoading && products.length === 0 && <div className="col-span-full text-center py-20">
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingCart className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">Geen producten beschikbaar</h3>
                  <p className="text-lg text-muted-foreground max-w-md mx-auto">
                    Er zijn momenteel geen producten beschikbaar in de webshop.
                  </p>
                </div>}
              
              {!productsLoading && products.length > 0 && products.map((product, index) => <Card key={product.id} className="group relative overflow-hidden bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm border-2 border-border/30 flex flex-col h-full w-full max-w-sm">
                  
                  <CardHeader className="relative p-6">
                    <div className="aspect-square bg-gradient-to-br from-muted/50 to-muted/80 rounded-3xl overflow-hidden mb-6 shadow-xl relative">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <Badge className="bg-primary/15 text-primary border-primary/30 font-semibold px-3 py-1.5 text-sm rounded-full">
                        {product.category}
                      </Badge>
                      {product.inStock && <Badge className="bg-green-500/15 text-green-600 border-green-500/30 font-semibold text-sm rounded-full flex items-center gap-1.5 px-3 py-1.5">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Op voorraad
                        </Badge>}
                    </div>
                    
                    <CardTitle className="text-xl lg:text-2xl font-bold leading-tight mb-1">
                      {product.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="relative space-y-6 p-6 pt-0 flex-1">
                    <p className="text-muted-foreground leading-relaxed text-base">
                      {product.description}
                    </p>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider text-primary/80">Kenmerken</h4>
                      {product.features.map((feature, idx) => <div key={idx} className="flex items-center text-muted-foreground">
                          <div className="w-6 h-6 bg-primary/15 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          </div>
                          <span className="font-medium text-sm">{feature}</span>
                        </div>)}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between pt-6 border-t border-border/50 gap-4 mt-auto">
                      <div className="flex-1">
                        <span className="text-3xl font-bold text-primary block">
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
                    <Button onClick={() => addToCart(product.id)} className="w-full h-14 text-base font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-blue-900 shadow-lg border-2 border-yellow-300 hover:border-yellow-400 rounded-xl" disabled={!product.inStock} size="lg">
                      <ShoppingCart className="w-5 h-5 mr-2 flex-shrink-0" />
                      <span className="hidden sm:inline">In Winkelwagen</span>
                      <span className="sm:hidden">In Winkelwagen</span>
                    </Button>
                  </CardFooter>
                  
                </Card>)}
            </div>
            
            {/* Floating call-to-action */}
            <div className="text-center mt-16">
              <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 backdrop-blur-sm rounded-2xl border border-primary/20 shadow-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-foreground font-semibold">Alle producten zijn direct leverbaar</span>
                <div className="w-3 h-3 bg-primary rounded-full ml-3"></div>
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
              Waarom onze <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                merchandise kopen?
              </span>
            </h3>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              Elke aankoop draagt bij aan een betere toekomst voor de bouwsector.<br />
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
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-foreground">
                Veelgestelde vragen
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground px-4 sm:px-0">
                Vind snel antwoorden op de meest gestelde vragen over onze merchandise en het bestelproces
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4 md:space-y-5">
              {webshopFaqs.map((faq, index) => <Card key={index} className="border-0 bg-card overflow-hidden">
                  <Button variant="ghost" aria-expanded={faqOpenIndex === index} aria-controls={`faq-panel-${index}`} className="w-full p-4 sm:p-5 md:p-6 h-auto justify-between items-start text-left hover:bg-muted/50 whitespace-normal" onClick={() => setFaqOpenIndex(faqOpenIndex === index ? null : index)}>
                    <span className="flex-1 min-w-0 text-base sm:text-lg md:text-xl font-semibold text-foreground pr-3 sm:pr-4 md:pr-5 leading-snug break-words">
                      {faq.question}
                    </span>
                    {faqOpenIndex === index ? <Minus className="w-5 h-5 md:w-6 md:h-6 text-accent flex-shrink-0 self-start mt-0.5" /> : <Plus className="w-5 h-5 md:w-6 md:h-6 text-accent flex-shrink-0 self-start mt-0.5" />}
                  </Button>
                  
                  {faqOpenIndex === index && <div id={`faq-panel-${index}`} role="region" className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 animate-slide-down">
                        <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>}
                </Card>)}
            </div>
          </div>
        </div>
      </section>

      {/* Special Offer Section */}
      

      {/* Trust Badges Section */}
      
      
      <Footer />
    </div>
  );
};
export default Webshop;