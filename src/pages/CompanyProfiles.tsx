import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, Building2, Globe, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CompanyProfileForm from "@/components/CompanyProfileForm";
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<CompanyProfile | null>(null);
  const {
    toast
  } = useToast();
  useEffect(() => {
    checkAdminAccess();
    fetchProfiles();
  }, []);
  const checkAdminAccess = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (user) {
        const {
          data
        } = await supabase.rpc('verify_admin_access');
        setIsAdmin(data || false);
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
    }
  };
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
  const handleEdit = (profile: CompanyProfile) => {
    setEditingProfile(profile);
    setShowForm(true);
  };
  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit bedrijfsprofiel wilt verwijderen?')) return;
    try {
      const {
        error
      } = await supabase.from('company_profiles').delete().eq('id', id);
      if (error) throw error;
      toast({
        title: "Succes",
        description: "Bedrijfsprofiel succesvol verwijderd."
      });
      fetchProfiles();
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast({
        title: "Fout",
        description: "Kon bedrijfsprofiel niet verwijderen.",
        variant: "destructive"
      });
    }
  };
  const handleFormClose = () => {
    setShowForm(false);
    setEditingProfile(null);
  };
  const handleFormSuccess = () => {
    fetchProfiles();
    handleFormClose();
  };
  if (loading) {
    return <div className="min-h-screen bg-background pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Bedrijfsprofielen
            </h1>
            <p className="text-muted-foreground text-lg">
              Ontdek bedrijven die bouwen met respect
            </p>
          </div>
          {isAdmin}
        </div>

        {profiles.length === 0 ? <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Geen bedrijfsprofielen gevonden</h3>
            <p className="text-muted-foreground">
              {isAdmin ? "Voeg het eerste bedrijfsprofiel toe om te beginnen." : "Er zijn nog geen bedrijfsprofielen toegevoegd."}
            </p>
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map(profile => <Card key={profile.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
<<<<<<< HEAD
                      {profile.logo_url ? (
                        <img
                          src={profile.logo_url}
                          alt={`${profile.name} logo`}
                          className="w-16 h-16 object-contain rounded-lg border bg-white p-2"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
=======
                      {profile.logo_url ? <img src={profile.logo_url} alt={`${profile.name} logo`} className="w-12 h-12 object-contain rounded-lg border" /> : <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-muted-foreground" />
                        </div>}
>>>>>>> 1938a7ebfe348ce4956864894ac01779759c9b11
                      <div>
                        <CardTitle className="text-lg">{profile.name}</CardTitle>
                        {profile.industry && <Badge variant="secondary" className="mt-1">
                            {profile.industry}
                          </Badge>}
                      </div>
                    </div>
                    {profile.is_featured && <Badge variant="default">Featured</Badge>}
                  </div>
                </CardHeader>
<<<<<<< HEAD
                <CardContent className="pt-4">
                  {profile.description && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-foreground mb-2">Beschrijving</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {profile.description}
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-3 mb-4">
                    {profile.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-primary flex-shrink-0" />
                        <div>
                          <span className="text-xs text-muted-foreground block">Website</span>
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline truncate"
                          >
                            {profile.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      </div>
                    )}
                    {profile.contact_email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                        <div>
                          <span className="text-xs text-muted-foreground block">Email</span>
                          <a
                            href={`mailto:${profile.contact_email}`}
                            className="text-primary hover:underline truncate"
                          >
                            {profile.contact_email}
                          </a>
                        </div>
                      </div>
                    )}
                    {profile.contact_phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                        <div>
                          <span className="text-xs text-muted-foreground block">Telefoon</span>
                          <a
                            href={`tel:${profile.contact_phone}`}
                            className="text-primary hover:underline"
                          >
                            {profile.contact_phone}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* NO EDIT BUTTONS - ONLY VIEW */}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
=======
                
              </Card>)}
          </div>}
>>>>>>> 1938a7ebfe348ce4956864894ac01779759c9b11

        <CompanyProfileForm open={showForm} onOpenChange={handleFormClose} onSuccess={handleFormSuccess} editingProfile={editingProfile} />
      </div>
    </div>;
};
export default CompanyProfiles;