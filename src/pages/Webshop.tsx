import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Coffee, Edit3, ArrowLeft, Star, Sparkles } from "lucide-react";
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
      name: "RESPECT KOFFIEBEKER",
      description: "De ultieme koffiebeker voor echte bouwvakkers! Keramiek zo stevig als beton.",
      price: 12.95,
      originalPrice: 17.95,
      image: "/lovable-uploads/132795ea-2daa-4305-a106-02650a9bf06c.png",
      category: "HOT DRINKS",
      inStock: true,
      features: ["Keramiek Power", "Vaatwasser Safe", "350ml Volume"],
      popular: true
    },
    {
      id: "koffiebeker-rvs",
      name: "THERMOS BEAST",
      description: "RVS thermosbeker die je koffie URENLANG warm houdt. Perfecte bouwplaats companion!",
      price: 18.95,
      originalPrice: 24.95,
      image: "/lovable-uploads/2a13d9d8-47a2-4787-9cba-80dfe398fd9e.png",
      category: "THERMAL",
      inStock: true,
      features: ["Dubbel Geïsoleerd", "Lekvrij Design", "500ml Inhoud"],
      popular: false
    },
    {
      id: "pen-set",
      name: "RESPECT PEN TRIO",
      description: "3 super pennen voor contracten, plannen en alles wat respect verdient!",
      price: 8.95,
      originalPrice: 12.95,
      image: "/lovable-uploads/370194bf-f017-421b-ab19-49ae1435a82e.png",
      category: "OFFICE",
      inStock: true,
      features: ["3 Stuks Set", "Blauwe Inkt", "Herbruikbaar"],
      popular: false
    },
    {
      id: "pen-premium",
      name: "PREMIUM METAL PEN",
      description: "Gegraveerde metalen pen voor belangrijke deals. Laat je handtekening KNALLEN!",
      price: 15.95,
      originalPrice: 19.95,
      image: "/lovable-uploads/6a653db4-1d30-46c2-83c1-760e5459fb7d.png",
      category: "PREMIUM",
      inStock: true,
      features: ["Metal Body", "Laser Gravure", "Gift Box"],
      popular: true
    }
  ];

  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
    
    const product = products.find(p => p.id === productId);
    toast({
      title: "BOOM! 💥 Toegevoegd!",
      description: `${product?.name} zit nu in je winkelwagen!`
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
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-background via-secondary/5 to-accent/10">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b-4 border-primary/30 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 text-primary hover:text-secondary transition-all duration-300 group">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ArrowLeft className="w-5 h-5 text-white group-hover:-translate-x-1 transition-transform duration-300" />
              </div>
              <span className="font-black text-xl tracking-wide">TERUG NAAR SITE</span>
            </Link>
            <div className="flex items-center space-x-6">
              <div className="relative group">
                <div className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 ${
                  getCartItemCount() > 0 
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-2xl' 
                    : 'bg-gradient-to-r from-muted to-muted/80 text-muted-foreground hover:from-primary/20 hover:to-secondary/20'
                }`}>
                  <ShoppingCart className="w-6 h-6" />
                </div>
                {getCartItemCount() > 0 && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-accent to-primary rounded-full flex items-center justify-center animate-bounce shadow-lg border-2 border-white">
                    <span className="text-sm font-black text-white">
                      {getCartItemCount()}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-primary bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  €{(getCartTotal() + (getCartTotal() >= 25 ? 0 : 4.95)).toFixed(2)}
                </p>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                  {getCartItemCount() > 0 ? `${getCartItemCount()} ITEMS` : 'WINKELWAGEN LEEG'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-accent/30 to-primary/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-secondary/20 to-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div 
            ref={headerRef}
            className={`text-center transition-all duration-1000 ${
              headerVisible 
                ? 'opacity-100 transform translate-y-0' 
                : 'opacity-0 transform translate-y-8'
            }`}
          >
            <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary to-secondary rounded-full text-white font-black text-lg mb-8 shadow-2xl border-2 border-white/20 hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-6 h-6 mr-3 animate-spin" />
              BOUW MET RESPECT SHOP
              <Sparkles className="w-6 h-6 ml-3 animate-spin" style={{ animationDirection: 'reverse' }} />
            </div>
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
              <span className="block text-foreground drop-shadow-lg">MERCHANDISE</span>
              <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-pulse">
                DIE KNALT!
              </span>
            </h1>
            <p className="text-2xl md:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-12 font-bold">
              Laat IEDEREEN zien dat je onderdeel bent van de beweging! 
              Koop merchandise die zo vet is als onze missie! 🔥
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-lg font-bold">
              <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full text-white shadow-lg hover:scale-105 transition-transform duration-300">
                <Star className="w-5 h-5 fill-current" />
                GRATIS VERZENDING €25+
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full text-white shadow-lg hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-5 h-5 fill-current" />
                PREMIUM KWALITEIT
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full text-white shadow-lg hover:scale-105 transition-transform duration-300">
                <Coffee className="w-5 h-5 fill-current" />
                STEUN DE BEWEGING
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div 
            ref={productsRef}
            className={`transition-all duration-1000 ${
              productsVisible 
                ? 'opacity-100 transform translate-y-0' 
                : 'opacity-0 transform translate-y-8'
            }`}
          >
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-7xl font-black mb-6 text-foreground drop-shadow-lg">
                ONZE <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">PRODUCTEN</span>
              </h2>
              <p className="text-2xl text-muted-foreground max-w-3xl mx-auto font-bold">
                Elke aankoop maakt je cooler EN draagt bij aan een respectvolle bouwsector! 💪
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {products.map((product, index) => (
                <Card 
                  key={product.id}
                  className={`group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border-4 border-transparent hover:border-primary/50 hover:shadow-2xl transition-all duration-700 hover:scale-105 hover:-rotate-1 ${
                    productsVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
                  }`}
                  style={{ 
                    transitionDelay: productsVisible ? `${index * 200}ms` : '0ms',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                  }}
                >
                  {/* Popular Badge */}
                  {product.popular && (
                    <div className="absolute top-4 left-4 z-10">
                      <div className="bg-gradient-to-r from-accent to-primary text-white px-4 py-2 rounded-full font-black text-sm shadow-lg border-2 border-white animate-pulse">
                        🔥 POPULAIR
                      </div>
                    </div>
                  )}

                  {/* Discount Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-gradient-to-r from-green-400 to-green-600 text-white px-3 py-1 rounded-full font-black text-xs shadow-lg">
                      -€{(product.originalPrice - product.price).toFixed(2)}
                    </div>
                  </div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <CardHeader className="relative p-6">
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl overflow-hidden mb-6 shadow-xl border-4 border-white">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <Badge className="bg-gradient-to-r from-secondary/20 to-primary/20 text-secondary border-2 border-secondary/30 font-black px-4 py-2 text-xs uppercase tracking-wider mb-4">
                      {product.category}
                    </Badge>
                    <CardTitle className="text-xl font-black group-hover:text-primary transition-colors duration-300 uppercase tracking-wide leading-tight">
                      {product.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="relative space-y-6 px-6">
                    <p className="text-muted-foreground font-bold text-sm leading-relaxed">
                      {product.description}
                    </p>
                    
                    <div className="space-y-3">
                      <h4 className="font-black text-foreground text-xs uppercase tracking-widest">FEATURES</h4>
                      {product.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                          <div className="w-6 h-6 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full flex items-center justify-center mr-3 flex-shrink-0 group-hover:from-primary/50 group-hover:to-secondary/50 transition-all duration-300">
                            <Star className="w-3 h-3 text-primary fill-current" />
                          </div>
                          <span className="font-bold text-xs uppercase">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-primary">
                            €{product.price.toFixed(2)}
                          </span>
                          <span className="text-sm text-muted-foreground line-through font-bold">
                            €{product.originalPrice.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-bold uppercase">INCL. BTW</p>
                      </div>
                      {cart[product.id] > 0 && (
                        <div className="text-right">
                          <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full border-2 border-primary/30">
                            <span className="text-xs font-black text-primary uppercase">
                              {cart[product.id]}× IN CART
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="relative pt-0 px-6 pb-6">
                    <Button 
                      onClick={() => addToCart(product.id)}
                      className="w-full h-14 text-lg font-black shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-2xl border-4 border-white/20 hover:scale-105 uppercase tracking-wide"
                      disabled={!product.inStock}
                      size="lg"
                    >
                      <ShoppingCart className="w-6 h-6 mr-3" />
                      TOEVOEGEN AAN CART
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Cart Summary */}
            {getCartItemCount() > 0 && (
              <div className="mt-24">
                <Card className="max-w-2xl mx-auto border-4 border-primary/30 bg-gradient-to-br from-white via-primary/5 to-secondary/5 shadow-2xl rounded-3xl overflow-hidden">
                  <CardHeader className="text-center border-b-4 border-primary/20 bg-gradient-to-r from-primary/10 to-secondary/10 p-8">
                    <CardTitle className="flex items-center justify-center gap-4 text-3xl font-black">
                      <div className="w-14 h-14 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center shadow-xl">
                        <ShoppingCart className="w-7 h-7 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        JOUW WINKELWAGEN ({getCartItemCount()} ITEMS)
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-8">
                    {Object.entries(cart).map(([productId, quantity]) => {
                      const product = products.find(p => p.id === productId);
                      if (!product || quantity === 0) return null;
                      
                      return (
                        <div key={productId} className="flex items-center justify-between py-4 px-6 bg-gradient-to-r from-background/80 to-background/60 rounded-2xl border-2 border-border shadow-lg hover:scale-105 transition-transform duration-300">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-muted to-muted/80 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-black text-foreground uppercase text-sm">{product.name}</p>
                              <p className="text-sm text-muted-foreground font-bold">AANTAL: {quantity}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                              €{(product.price * quantity).toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground font-bold">
                              €{product.price.toFixed(2)} PER STUK
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div className="border-t-4 border-primary/20 pt-8 mt-8 bg-gradient-to-r from-muted/30 to-muted/10 rounded-2xl p-6">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-muted-foreground font-bold uppercase text-sm">Subtotaal:</span>
                        <span className="font-black text-xl">€{getCartTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-muted-foreground font-bold uppercase text-sm">Verzendkosten:</span>
                        <span className="font-black text-green-600 text-lg">
                          {getCartTotal() >= 25 ? 'GRATIS! 🎉' : '€4.95'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-2xl font-black pt-6 border-t-2 border-primary/20">
                        <span className="uppercase">TOTAAL:</span>
                        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-3xl">
                          €{(getCartTotal() + (getCartTotal() >= 25 ? 0 : 4.95)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-8 pt-0">
                    <Button className="w-full h-16 text-xl font-black bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 shadow-2xl hover:shadow-3xl transition-all duration-300 text-white rounded-2xl border-4 border-white/30 hover:scale-105 uppercase tracking-wider" size="lg">
                      <ShoppingCart className="w-6 h-6 mr-3" />
                      NAAR AFREKENEN 🚀
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-32 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/6 w-64 h-64 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/6 w-64 h-64 bg-gradient-to-r from-accent/20 to-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto mb-20">
            <h3 className="text-5xl md:text-7xl font-black mb-8 text-foreground drop-shadow-lg">
              WAAROM ONZE <br/>
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                MERCHANDISE?
              </span>
            </h3>
            <p className="text-2xl text-muted-foreground font-bold">
              Elke aankoop maakt de bouw BETER! 💪🏗️
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto">
            <div className="group hover:scale-110 transition-transform duration-300">
              <div className="w-28 h-28 bg-gradient-to-br from-primary/30 to-primary/50 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:shadow-2xl transition-all duration-300 border-4 border-white/50">
                <Coffee className="w-14 h-14 text-white drop-shadow-lg" />
              </div>
              <h4 className="text-3xl font-black mb-6 group-hover:text-primary transition-colors duration-300 uppercase">
                PREMIUM KWALITEIT
              </h4>
              <p className="text-muted-foreground leading-relaxed text-lg font-bold">
                Materialen zo sterk als onze bouwvakkers! Gemaakt om ALTIJD mee te gaan! 🔨
              </p>
            </div>
            
            <div className="group hover:scale-110 transition-transform duration-300">
              <div className="w-28 h-28 bg-gradient-to-br from-secondary/30 to-secondary/50 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:shadow-2xl transition-all duration-300 border-4 border-white/50">
                <Edit3 className="w-14 h-14 text-white drop-shadow-lg" />
              </div>
              <h4 className="text-3xl font-black mb-6 group-hover:text-secondary transition-colors duration-300 uppercase">
                BEWUSTWORDING
              </h4>
              <p className="text-muted-foreground leading-relaxed text-lg font-bold">
                Laat IEDEREEN zien waar je voor staat! Respect op de bouwplaats! ✊
              </p>
            </div>
            
            <div className="group hover:scale-110 transition-transform duration-300">
              <div className="w-28 h-28 bg-gradient-to-br from-accent/30 to-accent/50 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:shadow-2xl transition-all duration-300 border-4 border-white/50">
                <Sparkles className="w-14 h-14 text-white drop-shadow-lg" />
              </div>
              <h4 className="text-3xl font-black mb-6 group-hover:text-accent transition-colors duration-300 uppercase">
                STEUN DE BEWEGING
              </h4>
              <p className="text-muted-foreground leading-relaxed text-lg font-bold">
                Jouw aankoop helpt ons meer bedrijven te bereiken! Samen maken we het verschil! 🚀
              </p>
            </div>
          </div>
          
          <div className="mt-20 p-10 bg-gradient-to-r from-primary/20 via-secondary/15 to-accent/20 rounded-3xl border-4 border-white/30 max-w-5xl mx-auto shadow-2xl hover:scale-105 transition-transform duration-300">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-left">
                <h4 className="text-3xl font-black mb-4 text-foreground uppercase">GRATIS VERZENDING €25+</h4>
                <p className="text-muted-foreground text-lg font-bold">
                  Bestel voor meer dan €25 en we sturen het GRATIS naar je toe! 📦✨
                </p>
              </div>
              <div className="flex items-center space-x-4 text-green-600 bg-white/80 px-8 py-4 rounded-2xl shadow-lg">
                <Star className="w-6 h-6 fill-current animate-spin" />
                <span className="font-black text-xl uppercase">2-3 DAGEN GELEVERD!</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Webshop;