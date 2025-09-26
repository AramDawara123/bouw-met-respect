import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Building2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import PartnerSignupForm from "@/components/PartnerSignupForm";
import { useCompanyProfiles } from "@/hooks/useCompanyProfile";
import { useActionItemsPricing } from "@/hooks/useActionItemsPricing";
import CompanyProfileCard from "@/components/company-profile/CompanyProfileCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
const CompanyProfiles = () => {
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const {
    toast
  } = useToast();
  const {
    profiles,
    loading,
    error
  } = useCompanyProfiles({
    enableRealtime: true
  });
  const {
    pricingData,
    loading: pricingLoading
  } = useActionItemsPricing();
  return <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Terug naar Home
              </Button>
            </Link>
          </div>
          
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-foreground mb-2">Onze Partners</h1>
            <p className="text-muted-foreground mb-6">
              Ontdek de bedrijven die samen met ons bouwen aan een respectvolle en veilige bouwsector
            </p>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 bg-background border-border hover:bg-muted"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Partners gallerij
              </Button>
              <Button 
                onClick={() => setShowPartnerForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6"
              >
                Word Partner
              </Button>
            </div>
          </div>
        </div>

        {/* Pricing Selector */}
        

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {loading ? <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Profielen laden...</p>
              </div> : error ? <div className="text-center py-16">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Fout bij laden</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
              </div> : profiles.length === 0 ? <div className="text-center py-16">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nog geen partners</h3>
                <p className="text-muted-foreground mb-4">
                  Er zijn nog geen bedrijfsprofielen beschikbaar.
                </p>
              </div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profiles.map(profile => <CompanyProfileCard key={profile.id} profile={profile} showFeaturedBadge={true} className="h-full" />)}
              </div>}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Word Partner</CardTitle>
                <CardDescription>
                  Sluit je aan bij onze missie voor een respectvolle bouwsector
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowPartnerForm(true)} className="w-full">
                  Partner Worden
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
      
      <PartnerSignupForm open={showPartnerForm} onOpenChange={setShowPartnerForm} />
    </div>;
};
export default CompanyProfiles;