import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Edit, Plus, Trash2 } from "lucide-react";
import CompanyProfileForm from "./CompanyProfileForm";
import CompanyProfileCard from "./CompanyProfileCard";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import type { CompanyProfile } from "@/types/companyProfile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CompanyProfileManagerProps {
  partnerMembershipId?: string;
  isPartnerDashboard?: boolean;
  showCreateButton?: boolean;
  showDeleteButton?: boolean;
  className?: string;
}

const CompanyProfileManager = ({
  partnerMembershipId,
  isPartnerDashboard = false,
  showCreateButton = true,
  showDeleteButton = false,
  className = "",
}: CompanyProfileManagerProps) => {
  const [showForm, setShowForm] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);
  
  const { profile, loading, deleteProfile } = useCompanyProfile(
    undefined, 
    partnerMembershipId
  );

  const handleEdit = () => {
    setShowForm(true);
  };

  const handleCreate = () => {
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
  };

  const handleDeleteClick = (profileId: string) => {
    setProfileToDelete(profileId);
  };

  const handleDeleteConfirm = async () => {
    if (profileToDelete) {
      try {
        await deleteProfile(profileToDelete);
        setProfileToDelete(null);
      } catch (error) {
        console.error('Error deleting profile:', error);
      }
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bedrijfsprofiel</CardTitle>
              <CardDescription>
                {profile 
                  ? "Beheer je bedrijfsprofiel dat zichtbaar is voor bezoekers" 
                  : "Maak je bedrijfsprofiel aan om zichtbaar te zijn voor bezoekers"
                }
              </CardDescription>
            </div>
            {profile ? (
              <div className="flex items-center gap-2">
                <Button onClick={handleEdit} className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Bewerken
                </Button>
                {showDeleteButton && (
                  <Button 
                    onClick={() => handleDeleteClick(profile.id)}
                    variant="outline"
                    className="flex items-center gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                    Verwijderen
                  </Button>
                )}
              </div>
            ) : showCreateButton ? (
              <Button onClick={handleCreate} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Profiel Aanmaken
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          {profile ? (
            <CompanyProfileCard 
              profile={profile}
              showFeaturedBadge={!isPartnerDashboard}
              className="border-0 shadow-none p-0"
            />
          ) : (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Je hebt nog geen bedrijfsprofiel aangemaakt. Maak er één aan om zichtbaar te zijn voor potentiële klanten.
              </p>
              {showCreateButton && (
                <Button onClick={handleCreate} className="flex items-center gap-2 mx-auto">
                  <Plus className="w-4 h-4" />
                  Profiel Aanmaken
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <CompanyProfileForm
        open={showForm}
        onOpenChange={setShowForm}
        onSuccess={handleFormSuccess}
        profile={profile}
        partnerMembershipId={partnerMembershipId}
        isPartnerDashboard={isPartnerDashboard}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!profileToDelete} onOpenChange={() => setProfileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bedrijfsprofiel verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Deze actie kan niet ongedaan worden gemaakt. Het bedrijfsprofiel wordt permanent verwijderd.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CompanyProfileManager;