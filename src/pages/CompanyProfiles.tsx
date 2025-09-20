import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Building2, Globe, Mail, Phone, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
interface CompanyProfile {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  industry: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// READ-ONLY COMPANY PROFILES PAGE - NO EDITING ALLOWED
const CompanyProfiles = () => {
  const [profiles, setProfiles] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  useEffect(() => {
    fetchProfiles();
  }, []);
  const fetchProfiles = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('company_profiles').select('*').order('display_order', {
        ascending: true
      }).order('name', {
        ascending: true
      });
      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Fout",
        description: "Kon bedrijfsprofielen niet laden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <div className="min-h-screen bg-background pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4 py-12">
        {/* HEADER WITH BACK BUTTON */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <Link to="/" className="self-start">
            <Button variant="outline" className="flex items-center gap-2 hover:bg-primary/10 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Terug naar Home
            </Button>
          </Link>
          
          <div className="text-center flex-1">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Onze Partners
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              Ontdek de bedrijven die samen met ons bouwen aan een respectvolle en veilige bouwsector
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm text-blue-700 font-medium">
                Alleen weergave - Bewerken via Dashboard
              </p>
            </div>
          </div>
          
          <div className="w-32 hidden md:block"></div> {/* Spacer for centering */}
        </div>

        {profiles.length === 0 ? <div className="text-center py-20">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Nog geen partners gevonden</h3>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              We zijn hard bezig om geweldige partners toe te voegen. Kom binnenkort terug!
            </p>
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map(profile => <Card key={profile.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                {profile.is_featured && <div className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg absolute top-0 left-0">
                    Uitgelicht
                  </div>}
                
                <CardHeader className="pb-4 pt-6">
                  <div className="flex items-center gap-4">
                    {profile.logo_url ? (
                      <img 
                        src={profile.logo_url} 
                        alt={`${profile.name} logo`} 
                        className="w-16 h-16 object-contain rounded-lg border-2 border-gray-200 bg-white p-2 shadow-sm" 
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          console.log('Logo failed to load:', profile.logo_url);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
                        <Building2 className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                    
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                        {profile.name}
                      </CardTitle>
                      {profile.industry && <Badge className="bg-blue-100 text-blue-800 text-sm">
                          {profile.industry}
                        </Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  {profile.description && <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Beschrijving</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {profile.description}
                      </p>
                    </div>}
                  
                  <div className="space-y-3">
                    {profile.website && <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-blue-600" />
                        <div>
                          <span className="text-xs text-gray-500 block">Website</span>
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {profile.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      </div>}
                    
                    {profile.contact_email && <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-green-600" />
                        <div>
                          <span className="text-xs text-gray-500 block">Email</span>
                          <a href={`mailto:${profile.contact_email}`} className="text-green-600 hover:underline">
                            {profile.contact_email}
                          </a>
                        </div>
                      </div>}
                    
                    {profile.contact_phone && <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-purple-600" />
                        <div>
                          <span className="text-xs text-gray-500 block">Telefoon</span>
                          <a href={`tel:${profile.contact_phone}`} className="text-purple-600 hover:underline">
                            {profile.contact_phone}
                          </a>
                        </div>
                      </div>}
                  </div>
                </CardContent>
              </Card>)}
          </div>}
      </div>
    </div>;
};
export default CompanyProfiles;