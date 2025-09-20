import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Building2, Globe, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
<<<<<<< HEAD

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-24">
      <div className="container mx-auto px-4 py-12">
=======
  return <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 py-8">
>>>>>>> 26fd33c9aded7666aba64c9c5d64bece23c5cfe0
        {/* HEADER - NO EDIT BUTTONS */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Onze Partners
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Ontdek de bedrijven die samen met ons bouwen aan een respectvolle en veilige bouwsector
          </p>
<<<<<<< HEAD
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-full shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-blue-700 font-medium">
              Alleen weergave - Bewerken via Dashboard
            </p>
          </div>
        </div>

        {profiles.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <Building2 className="w-16 h-16 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Nog geen partners gevonden</h3>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              We zijn hard bezig om geweldige partners toe te voegen. Kom binnenkort terug!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {profiles.map((profile, index) => (
              <Card key={profile.id} className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-slide-up" style={{animationDelay: `${index * 100}ms`}}>
                {/* Featured ribbon */}
                {profile.is_featured && (
                  <div className="absolute top-4 -right-12 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold py-1 px-12 rotate-45 z-10">
                    Uitgelicht
                  </div>
                )}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <CardHeader className="relative pb-6 pt-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      {profile.logo_url ? (
                        <div className="relative">
                          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-lg border-2 border-white flex items-center justify-center p-3 group-hover:scale-110 transition-transform duration-300">
                            <img
                              src={profile.logo_url}
                              alt={`${profile.name} logo`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Building2 className="w-12 h-12 text-blue-600" />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                        {profile.name}
                      </CardTitle>
                      {profile.industry && (
                        <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 px-4 py-1 text-sm font-medium">
                          {profile.industry}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative px-8 pb-8">
                  {profile.description && (
                    <div className="mb-6">
                      <p className="text-gray-600 leading-relaxed text-center line-clamp-3">
=======
          
        </div>

        {profiles.length === 0 ? <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Geen bedrijfsprofielen gevonden</h3>
            <p className="text-muted-foreground">
              Er zijn nog geen bedrijfsprofielen toegevoegd.
            </p>
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map(profile => <Card key={profile.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {profile.logo_url ? <img src={profile.logo_url} alt={`${profile.name} logo`} className="w-16 h-16 object-contain rounded-lg border bg-white p-2" /> : <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-muted-foreground" />
                        </div>}
                      <div>
                        <CardTitle className="text-xl font-semibold">{profile.name}</CardTitle>
                        {profile.industry && <Badge variant="secondary" className="mt-2 text-sm">
                            {profile.industry}
                          </Badge>}
                      </div>
                    </div>
                    {profile.is_featured && <Badge className="bg-yellow-500 text-white">Uitgelicht</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {profile.description && <div className="mb-4">
                      <h4 className="text-sm font-medium text-foreground mb-2">Beschrijving</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
>>>>>>> 26fd33c9aded7666aba64c9c5d64bece23c5cfe0
                        {profile.description}
                      </p>
                    </div>}
                  
<<<<<<< HEAD
                  <div className="space-y-4">
                    {profile.website && (
                      <div className="group/item flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover/item:shadow-md transition-shadow">
                          <Globe className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Website</p>
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-900 hover:text-blue-700 font-medium truncate block transition-colors duration-200"
                          >
                            {profile.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {profile.contact_email && (
                      <div className="group/item flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-300">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover/item:shadow-md transition-shadow">
                          <Mail className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Email</p>
                          <a
                            href={`mailto:${profile.contact_email}`}
                            className="text-gray-900 hover:text-green-700 font-medium truncate block transition-colors duration-200"
                          >
                            {profile.contact_email}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {profile.contact_phone && (
                      <div className="group/item flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 transition-all duration-300">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover/item:shadow-md transition-shadow">
                          <Phone className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Telefoon</p>
                          <a
                            href={`tel:${profile.contact_phone}`}
                            className="text-gray-900 hover:text-purple-700 font-medium transition-colors duration-200"
                          >
=======
                  <div className="space-y-3 mb-4">
                    {profile.website && <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-primary flex-shrink-0" />
                        <div>
                          <span className="text-xs text-muted-foreground block">Website</span>
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                            {profile.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      </div>}
                    {profile.contact_email && <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                        <div>
                          <span className="text-xs text-muted-foreground block">Email</span>
                          <a href={`mailto:${profile.contact_email}`} className="text-primary hover:underline truncate">
                            {profile.contact_email}
                          </a>
                        </div>
                      </div>}
                    {profile.contact_phone && <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                        <div>
                          <span className="text-xs text-muted-foreground block">Telefoon</span>
                          <a href={`tel:${profile.contact_phone}`} className="text-primary hover:underline">
>>>>>>> 26fd33c9aded7666aba64c9c5d64bece23c5cfe0
                            {profile.contact_phone}
                          </a>
                        </div>
                      </div>}
                  </div>
                  
                  {/* Decorative bottom border */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </CardContent>
              </Card>)}
          </div>}
      </div>
    </div>;
};
export default CompanyProfiles;