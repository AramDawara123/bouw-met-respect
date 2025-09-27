import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Save, X } from "lucide-react";
import { User } from '@supabase/supabase-js';

interface PartnerAccountSettingsProps {
  partnerMembership: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    company_name: string;
    website: string | null;
    industry: string | null;
    description: string | null;
  };
  user: User;
  onUpdate: () => void;
}

const PartnerAccountSettings: React.FC<PartnerAccountSettingsProps> = ({
  partnerMembership,
  user,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    first_name: partnerMembership.first_name,
    last_name: partnerMembership.last_name,
    email: partnerMembership.email,
    phone: partnerMembership.phone,
    company_name: partnerMembership.company_name,
    website: partnerMembership.website || '',
    industry: partnerMembership.industry || '',
    description: partnerMembership.description || ''
  });

  const [newAuthEmail, setNewAuthEmail] = useState(user.email || '');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('partner_memberships')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          company_name: formData.company_name,
          website: formData.website || null,
          industry: formData.industry || null,
          description: formData.description || null
        })
        .eq('id', partnerMembership.id);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Je accountgegevens zijn bijgewerkt"
      });

      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating partner membership:', error);
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het bijwerken van je gegevens",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: partnerMembership.first_name,
      last_name: partnerMembership.last_name,
      email: partnerMembership.email,
      phone: partnerMembership.phone,
      company_name: partnerMembership.company_name,
      website: partnerMembership.website || '',
      industry: partnerMembership.industry || '',
      description: partnerMembership.description || ''
    });
    setIsEditing(false);
  };

  const handleChangeAuthEmail = async () => {
    if (newAuthEmail === user.email) {
      toast({
        title: "Info",
        description: "Het nieuwe email adres is hetzelfde als het huidige"
      });
      return;
    }

    setEmailChangeLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: newAuthEmail
      });

      if (error) throw error;

      toast({
        title: "Email wijziging gestart",
        description: "We hebben een bevestigingsmail gestuurd naar je nieuwe email adres. Klik op de link in de email om de wijziging te bevestigen.",
        duration: 10000
      });
    } catch (error: any) {
      console.error('Error changing auth email:', error);
      toast({
        title: "Fout",
        description: error.message || "Er ging iets mis bij het wijzigen van je email",
        variant: "destructive"
      });
    } finally {
      setEmailChangeLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Profiel Informatie</CardTitle>
              <CardDescription>
                Beheer je persoonlijke en bedrijfsgegevens
              </CardDescription>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Bewerken
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button onClick={handleSave} disabled={loading} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {loading ? 'Opslaan...' : 'Opslaan'}
                </Button>
                <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                  <X className="w-4 h-4" />
                  Annuleren
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">Voornaam</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="last_name">Achternaam</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="email">Email (profiel)</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefoon</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="company_name">Bedrijfsnaam</Label>
              <Input
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="https://example.com"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="industry">Branche</Label>
              <Input
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="bijv. Bouw, IT, Consultancy"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Beschrijving</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Vertel over je bedrijf..."
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authentication Email */}
      <Card>
        <CardHeader>
          <CardTitle>Inlog Email</CardTitle>
          <CardDescription>
            Wijzig het email adres dat je gebruikt om in te loggen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="current_auth_email">Huidige inlog email</Label>
            <Input
              id="current_auth_email"
              value={user.email || ''}
              disabled
              className="bg-muted"
            />
          </div>
          <div>
            <Label htmlFor="new_auth_email">Nieuwe inlog email</Label>
            <Input
              id="new_auth_email"
              type="email"
              value={newAuthEmail}
              onChange={(e) => setNewAuthEmail(e.target.value)}
              placeholder="nieuw@email.com"
            />
          </div>
          <Button 
            onClick={handleChangeAuthEmail} 
            disabled={emailChangeLoading || !newAuthEmail || newAuthEmail === user.email}
            className="w-full md:w-auto"
          >
            {emailChangeLoading ? 'Wijzigen...' : 'Email Wijzigen'}
          </Button>
          <p className="text-sm text-muted-foreground">
            Na het wijzigen van je email ontvang je een bevestigingsmail. Je moet op de link klikken om de wijziging te bevestigen.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerAccountSettings;