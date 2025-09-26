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
  const { toast } = useToast();
  const { profiles, loading, error } = useCompanyProfiles({ enableRealtime: true });
  const { pricingData, loading: pricingLoading } = useActionItemsPricing();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Terug
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-foreground">Onze Partners</h1>
            <p className="text-muted-foreground">
              Ontdek bedrijven die samen met ons werken aan een respectvolle bouwsector
            </p>
          </div>
        </div>

        {/* Pricing Selector */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actie-items Prijzen</CardTitle>
              <CardDescription>
                Bekijk onze tarieven voor verschillende bedrijfsgroottes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pricingLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="ml-2 text-muted-foreground">Laden...</span>
                </div>
              ) : pricingData.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-yellow-800">Geen prijsgegevens beschikbaar</p>
                  <p className="text-sm text-yellow-600 mt-1">
                    Controleer of de Action Items Pricing Manager in de dashboard correct is ingesteld.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-green-800 font-medium">
                      ✅ {pricingData.length} prijsopties geladen
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Laatste update: {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecteer bedrijfsgrootte" />
                    </SelectTrigger>
                    <SelectContent>
                      {pricingData.map((pricing) => (
                        <SelectItem key={pricing.id} value={pricing.id}>
                          <div className="flex items-center gap-2">
                            <span>
                              {pricing.employees_range} - {pricing.price_display}
                            </span>
                            {pricing.is_popular && (
                              <Badge variant="default" className="text-xs">
                                Populair
                              </Badge>
                            )}
                            {pricing.is_quote && (
                              <Badge variant="secondary" className="text-xs">
                                Offerte
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Profielen laden...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Fout bij laden</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
              </div>
            ) : profiles.length === 0 ? (
              <div className="text-center py-16">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nog geen partners</h3>
                <p className="text-muted-foreground mb-4">
                  Er zijn nog geen bedrijfsprofielen beschikbaar.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profiles.map((profile) => (
                  <CompanyProfileCard
                    key={profile.id}
                    profile={profile}
                    showFeaturedBadge={true}
                    className="h-full"
                  />
                ))}
              </div>
            )}
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
                <Button 
                  onClick={() => setShowPartnerForm(true)}
                  className="w-full"
                >
                  Partner Worden
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
      
      <PartnerSignupForm 
        open={showPartnerForm}
        onOpenChange={setShowPartnerForm}
      />
    </div>
  );
};

export default CompanyProfiles;