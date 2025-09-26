import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Edit, ExternalLink, Globe, Mail, Phone, Trash2 } from "lucide-react";
import type { CompanyProfile } from "@/types/companyProfile";

interface CompanyProfileCardProps {
  profile: CompanyProfile;
  onEdit?: (profile: CompanyProfile) => void;
  onDelete?: (profileId: string) => void;
  showActions?: boolean;
  showFeaturedBadge?: boolean;
  className?: string;
}

const CompanyProfileCard = ({
  profile,
  onEdit,
  onDelete,
  showActions = false,
  showFeaturedBadge = true,
  className = ""
}: CompanyProfileCardProps) => {
  return (
    <Card className={`hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <CardContent className="p-6">
        {/* Header with logo and basic info */}
        <div className="flex items-start gap-4 mb-4">
          {profile.logo_url ? (
            <img 
              src={profile.logo_url} 
              alt={`${profile.name} logo`}
              className="w-16 h-16 object-cover rounded-lg border-2 border-border flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold truncate">{profile.name}</h3>
                {profile.industry && (
                  <Badge variant="outline" className="mt-1">
                    {profile.industry}
                  </Badge>
                )}
              </div>
              
              {showFeaturedBadge && profile.is_featured && (
                <Badge className="bg-yellow-100 text-yellow-800 flex-shrink-0">
                  Uitgelicht
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {profile.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {profile.description}
          </p>
        )}

        {/* Contact info */}
        <div className="space-y-2 mb-4">
          {profile.website && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <a 
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate"
              >
                {profile.website}
              </a>
              <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            </div>
          )}
          
          {profile.contact_email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <a 
                href={`mailto:${profile.contact_email}`}
                className="text-primary hover:underline truncate"
              >
                {profile.contact_email}
              </a>
            </div>
          )}
          
          {profile.contact_phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <a 
                href={`tel:${profile.contact_phone}`}
                className="text-primary hover:underline"
              >
                {profile.contact_phone}
              </a>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (onEdit || onDelete) && (
          <div className="flex items-center gap-2 pt-2 border-t">
            {onEdit && (
              <Button
                onClick={() => onEdit(profile)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Bewerken
              </Button>
            )}
            
            {onDelete && (
              <Button
                onClick={() => onDelete(profile.id)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                Verwijderen
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompanyProfileCard;