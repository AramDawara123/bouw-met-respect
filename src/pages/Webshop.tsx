import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Coffee, Edit3, ArrowLeft } from "lucide-react";
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
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Terug naar website</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-muted-foreground" />
                {getCartItemCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-xs">
                    {getCartItemCount()}
                  </Badge>
                )}
              </div>
              <span className="font-medium text-foreground">
                €{getCartTotal().toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div 
            ref={headerRef}
            className={`text-center transition-all duration-1000 ${
              headerVisible 
                ? 'opacity-100 transform translate-y-0' 
                : 'opacity-0 transform translate-y-8'
            }`}
          >
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm mb-6">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Bouw met Respect Shop
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              Merchandise voor een <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">respectvolle bouwplaats</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Laat zien dat je onderdeel bent van de beweging. Koop hoogwaardige merchandise 
              en draag bij aan bewustwording voor een respectvolle bouwsector.
            </p>
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
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-foreground">Onze producten</h2>
              <p className="text-muted-foreground">
                Hoogwaardige merchandise om je steun voor de beweging te tonen
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {products.map((product, index) => (
                <Card 
                  key={product.id}
                  className={`group hover:shadow-xl transition-all duration-500 hover:scale-[1.02] ${
                    productsVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
                  }`}
                  style={{ 
                    transitionDelay: productsVisible ? `${index * 150}ms` : '0ms'
                  }}
                >
                  <CardHeader>
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{product.category}</Badge>
                      {product.inStock && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Op voorraad
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{product.name}</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {product.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      {product.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-sm text-muted-foreground">
                          <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                          {feature}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        €{product.price.toFixed(2)}
                      </span>
                      {cart[product.id] > 0 && (
                        <span className="text-sm text-muted-foreground">
                          {cart[product.id]} in winkelwagen
                        </span>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button 
                      onClick={() => addToCart(product.id)}
                      className="w-full"
                      disabled={!product.inStock}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Toevoegen aan winkelwagen
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Cart Summary */}
            {getCartItemCount() > 0 && (
              <div className="mt-16">
                <Card className="max-w-md mx-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Winkelwagen
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.entries(cart).map(([productId, quantity]) => {
                      const product = products.find(p => p.id === productId);
                      if (!product || quantity === 0) return null;
                      
                      return (
                        <div key={productId} className="flex justify-between py-2">
                          <span className="text-sm">
                            {product.name} x{quantity}
                          </span>
                          <span className="text-sm font-medium">
                            €{(product.price * quantity).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Totaal:</span>
                        <span>€{getCartTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" size="lg">
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
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4 text-foreground">
            Waarom onze merchandise kopen?
          </h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coffee className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Kwaliteit</h4>
              <p className="text-sm text-muted-foreground">
                Hoogwaardige materialen die bestand zijn tegen dagelijks gebruik
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit3 className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Bewustwording</h4>
              <p className="text-sm text-muted-foreground">
                Draag bij aan bewustwording voor een respectvolle bouwsector
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Steun de beweging</h4>
              <p className="text-sm text-muted-foreground">
                Opbrengsten worden gebruikt om de beweging te versterken
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Webshop;