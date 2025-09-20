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

const CompanyProfiles = () => {
  const [profiles, setProfiles] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Fout",
        description: "Kon bedrijfsprofielen niet laden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Bedrijfsprofielen
          </h1>
          <p className="text-muted-foreground text-lg">
            Ontdek bedrijven die bouwen met respect
          </p>
        </div>

        {profiles.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Geen bedrijfsprofielen gevonden</h3>
            <p className="text-muted-foreground">
              Er zijn nog geen bedrijfsprofielen toegevoegd.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <Card key={profile.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {profile.logo_url ? (
                        <img
                          src={profile.logo_url}
                          alt={`${profile.name} logo`}
                          className="w-12 h-12 object-contain rounded-lg border"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-xl font-semibold">{profile.name}</CardTitle>
                        {profile.industry && (
                          <Badge variant="secondary" className="mt-2 text-sm">
                            {profile.industry}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {profile.is_featured && (
                      <Badge className="bg-yellow-500 text-white">Uitgelicht</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {profile.description && (
                    <CardDescription className="mb-4 line-clamp-3 text-sm text-gray-600">
                      {profile.description}
                    </CardDescription>
                  )}
                  
                  <div className="space-y-3">
                    {profile.website && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Globe className="w-4 h-4 text-primary" />
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary truncate"
                        >
                          {profile.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                    {profile.contact_email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4 text-primary" />
                        <a
                          href={`mailto:${profile.contact_email}`}
                          className="hover:text-primary truncate"
                        >
                          {profile.contact_email}
                        </a>
                      </div>
                    )}
                    {profile.contact_phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4 text-primary" />
                        <a
                          href={`tel:${profile.contact_phone}`}
                          className="hover:text-primary"
                        >
                          {profile.contact_phone}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyProfiles;