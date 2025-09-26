import { useState, useEffect, useCallback } from 'react';
import { companyProfileService } from '@/lib/companyProfileService';
import type { 
  CompanyProfile, 
  CreateCompanyProfileData, 
  UpdateCompanyProfileData,
  CompanyProfileWithPartner 
} from '@/types/companyProfile';
import { useToast } from '@/hooks/use-toast';

interface UseCompanyProfilesOptions {
  includePartnerInfo?: boolean;
  enableRealtime?: boolean;
}

export const useCompanyProfiles = (options: UseCompanyProfilesOptions = {}) => {
  const [profiles, setProfiles] = useState<CompanyProfile[] | CompanyProfileWithPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await companyProfileService.getAllProfiles(options.includePartnerInfo);
      setProfiles(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profiles';
      setError(errorMessage);
      console.error('Error fetching profiles:', err);
    } finally {
      setLoading(false);
    }
  }, [options.includePartnerInfo]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  useEffect(() => {
    if (options.enableRealtime) {
      const unsubscribe = companyProfileService.setupRealtimeSubscription(() => {
        fetchProfiles();
      });

      return unsubscribe;
    }
  }, [options.enableRealtime, fetchProfiles]);

  useEffect(() => {
    // Listen for custom events
    const handleProfileUpdate = () => {
      fetchProfiles();
    };

    window.addEventListener('company-profile-updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('company-profile-updated', handleProfileUpdate);
    };
  }, [fetchProfiles]);

  const refresh = useCallback(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return {
    profiles,
    loading,
    error,
    refresh
  };
};

export const useCompanyProfile = (id?: string, partnerMembershipId?: string) => {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProfile = useCallback(async () => {
    if (!id && !partnerMembershipId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let data: CompanyProfile | null = null;
      
      if (id) {
        data = await companyProfileService.getProfileById(id);
      } else if (partnerMembershipId) {
        data = await companyProfileService.getProfileByPartnerMembershipId(partnerMembershipId);
      }
      
      setProfile(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
      setError(errorMessage);
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, [id, partnerMembershipId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    // Listen for custom events
    const handleProfileUpdate = () => {
      fetchProfile();
    };

    window.addEventListener('company-profile-updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('company-profile-updated', handleProfileUpdate);
    };
  }, [fetchProfile]);

  const createProfile = useCallback(async (data: CreateCompanyProfileData): Promise<CompanyProfile> => {
    try {
      const newProfile = await companyProfileService.createProfile(data);
      setProfile(newProfile);
      toast({
        title: "Succes!",
        description: "Bedrijfsprofiel succesvol aangemaakt",
      });
      return newProfile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create profile';
      setError(errorMessage);
      toast({
        title: "Fout",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [toast]);

  const updateProfile = useCallback(async (data: UpdateCompanyProfileData): Promise<CompanyProfile> => {
    try {
      const updatedProfile = await companyProfileService.updateProfile(data);
      setProfile(updatedProfile);
      toast({
        title: "Succes!",
        description: "Bedrijfsprofiel succesvol bijgewerkt",
      });
      return updatedProfile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      toast({
        title: "Fout",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [toast]);

  const deleteProfile = useCallback(async (profileId: string): Promise<void> => {
    try {
      await companyProfileService.deleteProfile(profileId);
      setProfile(null);
      toast({
        title: "Succes!",
        description: "Bedrijfsprofiel succesvol verwijderd",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete profile';
      setError(errorMessage);
      toast({
        title: "Fout",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [toast]);

  const uploadLogo = useCallback(async (file: File): Promise<string> => {
    try {
      const logoUrl = await companyProfileService.uploadLogo(file);
      toast({
        title: "Succes",
        description: "Logo succesvol geüpload",
      });
      return logoUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload logo';
      setError(errorMessage);
      toast({
        title: "Fout",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [toast]);

  const refresh = useCallback(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    createProfile,
    updateProfile,
    deleteProfile,
    uploadLogo,
    refresh
  };
};