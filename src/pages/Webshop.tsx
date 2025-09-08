import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Coffee, Edit3, ArrowLeft, Plus, Minus, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useToast } from "@/hooks/use-toast";

const Webshop = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation(0.2);
  const { ref: productsRef, isVisible: productsVisible } = useScrollAnimation(0.1);
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const { toast } = useToast();

  const products = [
    {
      id: "koffiebeker-keramiek",
      name: "Bouw met Respect Koffiebeker",
      description: "Hoogwaardige keramische koffiebeker met ons logo. Perfect voor op kantoor of de bouwkeet.",
      price: 12.95,
      image: "/lovable-uploads/132795ea-2daa-4305-a106-02650a9bf06c.png",
      category: "Drinkbekers",
      inStock: true,
      features: ["Keramiek", "Vaatwasserbestendig", "350ml inhoud"]
    },
    {
      id: "koffiebeker-rvs",
      name: "RVS Thermosbeker",
      description: "Robuuste roestvrijstalen thermosbeker die je koffie urenlang warm houdt. Ideaal voor bouwplaatsen.",
      price: 18.95,
      image: "/lovable-uploads/2a13d9d8-47a2-4787-9cba-80dfe398fd9e.png",
      category: "Drinkbekers",
      inStock: true,
      features: ["Dubbelwandige isolatie", "Lekvrij", "500ml inhoud"]
    },
    {
      id: "pen-set",
      name: "Bouw met Respect Pen Set",
      description: "Set van 3 hoogwaardige balpennen met ons logo. Ideaal voor het tekenen van contracten en plannen.",
      price: 8.95,
      image: "/lovable-uploads/370194bf-f017-421b-ab19-49ae1435a82e.png",
      category: "Schrijfwaren",
      inStock: true,
      features: ["Set van 3 stuks", "Blauwe inkt", "Herbruikbaar"]
    },
    {
      id: "pen-premium",
      name: "Premium Metalen Pen",
      description: "Elegante metalen pen met gegraveerd logo. Perfect voor belangrijke ondertekeningen.",
      price: 15.95,
      image: "/lovable-uploads/6a653db4-1d30-46c2-83c1-760e5459fb7d.png",
      category: "Schrijfwaren",
      inStock: true,
      features: ["Metalen behuizing", "Gegraveerd logo", "Geschenkdoosje"]
    }
  ];

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
      const newCart = { ...prev };
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
      const newCart = { ...prev };
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

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 text-primary hover:text-primary/80 transition-all duration-300 group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-semibold text-lg">Terug naar website</span>
            </Link>
            <div className="flex items-center space-x-6">
              <div className="relative group">
                <div className={`p-3 rounded-2xl transition-all duration-300 ${
                  getCartItemCount() > 0 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}>
                  <ShoppingCart className="w-6 h-6" />
                </div>
                {getCartItemCount() > 0 && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-xs font-bold text-white">
                      {getCartItemCount()}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">
                  €{(getCartTotal() + (getCartTotal() >= 25 ? 0 : 4.95)).toFixed(2)}
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
      <section className="relative py-24 bg-gradient-to-br from-primary/10 via-background to-secondary/10 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-white/[0.08] bg-[size:60px_60px] animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl opacity-30"></div>
        
        <div className="container mx-auto px-4 relative">
          <div 
            ref={headerRef}
            className={`text-center transition-all duration-1000 ${
              headerVisible 
                ? 'opacity-100 transform translate-y-0' 
                : 'opacity-0 transform translate-y-8'
            }`}
          >
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-sm rounded-full text-primary font-semibold text-sm mb-8 border border-primary/20">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Bouw met Respect Shop
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 text-foreground leading-tight">
              Merchandise voor een <br/>
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                respectvolle bouwplaats
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-12">
              Laat zien dat je onderdeel bent van de beweging. Koop hoogwaardige merchandise 
              en draag bij aan bewustwording voor een respectvolle bouwsector.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Gratis verzending vanaf €25
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Hoogwaardige kwaliteit
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Steun de beweging
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div 
            ref={productsRef}
            className={`transition-all duration-1000 ${
              productsVisible 
                ? 'opacity-100 transform translate-y-0' 
                : 'opacity-0 transform translate-y-8'
            }`}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">Onze producten</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Hoogwaardige merchandise om je steun voor de beweging te tonen. 
                Elke aankoop draagt bij aan een respectvolle bouwsector.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10 xl:gap-8 max-w-7xl mx-auto px-4 relative">
              {/* Background decoration for the grid */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/2 to-secondary/2 rounded-3xl opacity-50 -z-10"></div>
              <div className="absolute inset-0 bg-grid-white/[0.01] bg-[size:40px_40px] rounded-3xl -z-10"></div>
              {products.map((product, index) => (
                <Card 
                  key={product.id}
                  className={`group relative overflow-hidden bg-gradient-to-br from-card to-card/50 border-2 border-border hover:border-primary/50 hover:shadow-2xl transition-all duration-700 hover:scale-[1.03] ${
                    productsVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
                  }`}
                  style={{ 
                    transitionDelay: productsVisible ? `${index * 200}ms` : '0ms'
                  }}
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <CardHeader className="relative">
                    <div className="aspect-square bg-gradient-to-br from-muted to-muted/80 rounded-2xl overflow-hidden mb-6 shadow-lg">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                     <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
                       <Badge className="bg-primary/10 text-primary border-primary/20 font-medium px-2 sm:px-3 py-1 text-xs sm:text-sm">
                         {product.category}
                       </Badge>
                       {product.inStock && (
                         <Badge className="bg-green-500/10 text-green-600 border-green-500/20 font-medium text-xs sm:text-sm">
                           ✓ Op voorraad
                         </Badge>
                       )}
                     </div>
                     <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold group-hover:text-primary transition-colors duration-300 leading-tight">
                       {product.name}
                     </CardTitle>
                  </CardHeader>

                   <CardContent className="relative space-y-4 sm:space-y-6 p-4 sm:p-6">
                     <p className="text-muted-foreground leading-relaxed text-sm sm:text-base lg:text-lg">
                       {product.description}
                     </p>
                     
                     <div className="space-y-2 sm:space-y-3">
                       <h4 className="font-semibold text-foreground text-xs sm:text-sm uppercase tracking-wide">Kenmerken</h4>
                       {product.features.map((feature, idx) => (
                         <div key={idx} className="flex items-center text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                           <div className="w-4 h-4 sm:w-6 sm:h-6 bg-primary/20 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0 group-hover:bg-primary/30 transition-colors duration-300">
                             <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full"></div>
                           </div>
                           <span className="font-medium text-xs sm:text-sm lg:text-base">{feature}</span>
                         </div>
                       ))}
                     </div>

                     <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-border gap-3 sm:gap-4">
                       <div className="flex-1">
                         <span className="text-2xl sm:text-3xl font-bold text-primary block">
                           €{product.price.toFixed(2)}
                         </span>
                         <p className="text-xs sm:text-sm text-muted-foreground">Incl. BTW</p>
                       </div>
                       {cart[product.id] > 0 && (
                         <div className="flex-shrink-0">
                           <div className="inline-flex items-center px-2 sm:px-3 py-1 bg-primary/10 rounded-full">
                             <span className="text-xs sm:text-sm font-medium text-primary">
                               {cart[product.id]} × in winkelwagen
                             </span>
                           </div>
                         </div>
                       )}
                     </div>
                   </CardContent>

                   <CardFooter className="relative pt-0 p-4 sm:p-6">
                     <Button 
                       onClick={() => addToCart(product.id)}
                       className="w-full h-10 sm:h-12 lg:h-14 text-sm sm:text-base lg:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation"
                       disabled={!product.inStock}
                       size="lg"
                     >
                       <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                       <span className="hidden xs:inline">Toevoegen aan winkelwagen</span>
                       <span className="xs:hidden">Toevoegen</span>
                     </Button>
                   </CardFooter>
                </Card>
              ))}
            </div>

            {/* Cart Summary */}
            {getCartItemCount() > 0 && (
              <div className="mt-20">
                <Card className="w-full max-w-2xl mx-auto border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 shadow-2xl">
                  <CardHeader className="text-center border-b border-primary/10 p-4 sm:p-6">
                    <CardTitle className="flex items-center justify-center gap-2 sm:gap-3 text-xl sm:text-2xl">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      <span className="truncate">Winkelwagen ({getCartItemCount()} items)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                    {Object.entries(cart).map(([productId, quantity]) => {
                      const product = products.find(p => p.id === productId);
                      if (!product || quantity === 0) return null;
                      
                      return (
                        <div key={productId} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-background/50 rounded-lg border border-border group hover:shadow-md transition-all duration-300 space-y-3 sm:space-y-0">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground text-sm sm:text-lg truncate">{product.name}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground">€{product.price.toFixed(2)} per stuk</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-1 sm:space-x-2 bg-muted/50 rounded-lg p-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => decreaseQuantity(productId)}
                                className="w-8 h-8 sm:w-10 sm:h-10 p-0 hover:bg-primary/10 touch-manipulation"
                              >
                                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <span className="w-8 sm:w-10 text-center font-semibold text-sm sm:text-base text-foreground">
                                {quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => increaseQuantity(productId)}
                                className="w-8 h-8 sm:w-10 sm:h-10 p-0 hover:bg-primary/10 touch-manipulation"
                              >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                            
                            {/* Price and Remove Button */}
                            <div className="flex items-center space-x-2 sm:space-x-4">
                              <div className="text-right">
                                <p className="font-bold text-base sm:text-lg text-primary">
                                  €{(product.price * quantity).toFixed(2)}
                                </p>
                              </div>
                              
                              {/* Remove Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromCart(productId)}
                                className="w-8 h-8 sm:w-10 sm:h-10 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 touch-manipulation"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="border-t pt-4 sm:pt-6 mt-4 sm:mt-6">
                      <div className="flex justify-between items-center mb-2 text-sm sm:text-base">
                        <span className="text-muted-foreground">Subtotaal:</span>
                        <span className="font-semibold">€{getCartTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2 text-sm sm:text-base">
                        <span className="text-muted-foreground">Verzendkosten:</span>
                        <span className="font-semibold text-green-600">
                          {getCartTotal() >= 25 ? 'Gratis' : '€4.95'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-lg sm:text-xl font-bold pt-4 border-t">
                        <span>Totaal:</span>
                        <span className="text-primary">
                          €{(getCartTotal() + (getCartTotal() >= 25 ? 0 : 4.95)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 sm:p-6 pt-0">
                    <Button className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation" size="lg">
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Naar afrekenen
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-24 bg-gradient-to-br from-muted/30 via-background to-muted/30 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]"></div>
        
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-3xl mx-auto mb-16">
            <h3 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Waarom onze merchandise kopen?
            </h3>
            <p className="text-xl text-muted-foreground">
              Elke aankoop draagt bij aan een betere toekomst voor de bouwsector
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
              <div className="w-20 h-20 bg-gradient-to-br from-secondary/20 to-secondary/30 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                <Edit3 className="w-10 h-10 text-secondary" />
              </div>
              <h4 className="text-2xl font-bold mb-4 group-hover:text-secondary transition-colors duration-300">
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
          
          <div className="mt-16 p-8 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-primary/20 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-left">
                <h4 className="text-2xl font-bold mb-2 text-foreground">Gratis verzending vanaf €25</h4>
                <p className="text-muted-foreground">
                  Bestel voor meer dan €25 en we verzenden gratis naar heel Nederland
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
    </div>
  );
};

export default Webshop;