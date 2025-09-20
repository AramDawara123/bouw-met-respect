import { Button } from "@/components/ui/button";
import { Building, Menu, X, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import MembershipForm from "./MembershipForm";
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMembershipFormOpen, setIsMembershipFormOpen] = useState(false);
  const handleMembershipClick = () => {
    setIsMembershipFormOpen(true);
    setIsMenuOpen(false);
  };
  return <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-24">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img src="/lovable-uploads/ed3c3050-db99-4ad7-a365-4fe2ce946578.png" alt="Bouw met Respect logo" className="h-24 w-auto" />
              
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#probleem" className="text-muted-foreground hover:text-foreground transition-colors">
                Het probleem
              </a>
              <a href="#hoe-wij-helpen" className="text-muted-foreground hover:text-foreground transition-colors">
                Hoe wij helpen
              </a>
              <a href="#verhalen" className="text-muted-foreground hover:text-foreground transition-colors">
                Verhalen
              </a>
              <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
              <Link to="/webshop" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ShoppingCart className="w-4 h-4" />
                Webshop
              </Link>
              <Button className="ml-4" onClick={handleMembershipClick}>
                Sluit je aan bij de beweging
              </Button>
            </div>

            {/* Mobile and Tablet Menu Button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-foreground">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile and Tablet Navigation */}
          {isMenuOpen && <div className="lg:hidden py-4 border-t border-border">
              <div className="flex flex-col space-y-4">
                <a href="#probleem" className="text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                  Het probleem
                </a>
                <a href="#hoe-wij-helpen" className="text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                  Hoe wij helpen
                </a>
                <a href="#verhalen" className="text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                  Verhalen
                </a>
                <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                  Contact
                </a>
                <Link to="/webshop" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                  <ShoppingCart className="w-4 h-4" />
                  Winkelwagen
                </Link>
                <Button className="w-full mt-4" onClick={handleMembershipClick}>
                  Sluit je aan bij de beweging
                </Button>
              </div>
            </div>}
        </div>
      </nav>

      <MembershipForm open={isMembershipFormOpen} onOpenChange={setIsMembershipFormOpen} />
    </>;
};
export default Navbar;