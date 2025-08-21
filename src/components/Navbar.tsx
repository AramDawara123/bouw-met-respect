
import { Button } from "@/components/ui/button";
import { Building, Menu, X } from "lucide-react";
import { useState } from "react";
import MembershipForm from "./MembershipForm";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMembershipFormOpen, setIsMembershipFormOpen] = useState(false);

  const handleMembershipClick = () => {
    setIsMembershipFormOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Bouw met Respect</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
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
              <Button className="ml-4" onClick={handleMembershipClick}>
                Sluit je aan
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-foreground"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <div className="flex flex-col space-y-4">
                <a 
                  href="#probleem" 
                  className="text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Het probleem
                </a>
                <a 
                  href="#hoe-wij-helpen" 
                  className="text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Hoe wij helpen
                </a>
                <a 
                  href="#verhalen" 
                  className="text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Verhalen
                </a>
                <a 
                  href="#contact" 
                  className="text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </a>
                <Button className="w-full mt-4" onClick={handleMembershipClick}>
                  Sluit je aan
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <MembershipForm 
        open={isMembershipFormOpen} 
        onOpenChange={setIsMembershipFormOpen} 
      />
    </>
  );
};

export default Navbar;
