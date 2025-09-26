import { supabase } from "@/integrations/supabase/client";
import type { 
  CompanyProfile, 
  CreateCompanyProfileData, 
  UpdateCompanyProfileData,
  CompanyProfileWithPartner 
} from "@/types/companyProfile";

class CompanyProfileService {
  /**
   * Get all company profiles with optional partner information
   */
  async getAllProfiles(includePartnerInfo = false): Promise<CompanyProfile[] | CompanyProfileWithPartner[]> {
    try {
      const { data, error } = includePartnerInfo 
        ? await supabase
            .from('company_profiles')
            .select(`
              *,
              partner_membership:partner_memberships(
                id,
                company_name,
                first_name,
                last_name,
                email
              )
            `)
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false })
        : await supabase
            .from('company_profiles')
            .select('*')
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching company profiles:', error);
        throw new Error(`Failed to fetch company profiles: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Service error in getAllProfiles:', error);
      throw error;
    }
  }

  /**
   * Get company profile by ID
   */
  async getProfileById(id: string): Promise<CompanyProfile | null> {
    try {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching company profile by ID:', error);
        throw new Error(`Failed to fetch company profile: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Service error in getProfileById:', error);
      throw error;
    }
  }

  /**
   * Get company profile by partner membership ID
   */
  async getProfileByPartnerMembershipId(partnerMembershipId: string): Promise<CompanyProfile | null> {
    try {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('partner_membership_id', partnerMembershipId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching company profile by partner membership ID:', error);
        throw new Error(`Failed to fetch company profile: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Service error in getProfileByPartnerMembershipId:', error);
      throw error;
    }
  }

  /**
   * Create a new company profile
   */
  async createProfile(profileData: CreateCompanyProfileData): Promise<CompanyProfile> {
    try {
      const { data, error } = await supabase
        .from('company_profiles')
        .insert([{
          name: profileData.name.trim(),
          description: profileData.description?.trim() || null,
          website: profileData.website?.trim() || null,
          industry: profileData.industry?.trim() || null,
          contact_email: profileData.contact_email?.trim() || null,
          contact_phone: profileData.contact_phone?.trim() || null,
          is_featured: profileData.is_featured || false,
          display_order: profileData.display_order || 0,
          logo_url: profileData.logo_url || null,
          partner_membership_id: profileData.partner_membership_id || null,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating company profile:', error);
        throw new Error(`Failed to create company profile: ${error.message}`);
      }

      // Dispatch custom event for UI updates
      window.dispatchEvent(new CustomEvent('company-profile-updated'));
      
      return data;
    } catch (error) {
      console.error('Service error in createProfile:', error);
      throw error;
    }
  }

  /**
   * Update an existing company profile
   */
  async updateProfile(profileData: UpdateCompanyProfileData): Promise<CompanyProfile> {
    try {
      const { id, ...updateData } = profileData;
      
      // Clean and prepare update data
      const cleanedData: Partial<CreateCompanyProfileData> = {};
      
      if (updateData.name !== undefined) cleanedData.name = updateData.name.trim();
      if (updateData.description !== undefined) cleanedData.description = updateData.description?.trim() || null;
      if (updateData.website !== undefined) cleanedData.website = updateData.website?.trim() || null;
      if (updateData.industry !== undefined) cleanedData.industry = updateData.industry?.trim() || null;
      if (updateData.contact_email !== undefined) cleanedData.contact_email = updateData.contact_email?.trim() || null;
      if (updateData.contact_phone !== undefined) cleanedData.contact_phone = updateData.contact_phone?.trim() || null;
      if (updateData.is_featured !== undefined) cleanedData.is_featured = updateData.is_featured;
      if (updateData.display_order !== undefined) cleanedData.display_order = updateData.display_order;
      if (updateData.logo_url !== undefined) cleanedData.logo_url = updateData.logo_url;
      if (updateData.partner_membership_id !== undefined) cleanedData.partner_membership_id = updateData.partner_membership_id;

      const { data, error } = await supabase
        .from('company_profiles')
        .update(cleanedData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating company profile:', error);
        throw new Error(`Failed to update company profile: ${error.message}`);
      }

      // Dispatch custom event for UI updates
      window.dispatchEvent(new CustomEvent('company-profile-updated'));
      
      return data;
    } catch (error) {
      console.error('Service error in updateProfile:', error);
      throw error;
    }
  }

  /**
   * Delete a company profile
   */
  async deleteProfile(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('company_profiles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting company profile:', error);
        throw new Error(`Failed to delete company profile: ${error.message}`);
      }

      // Dispatch custom event for UI updates
      window.dispatchEvent(new CustomEvent('company-profile-updated'));
    } catch (error) {
      console.error('Service error in deleteProfile:', error);
      throw error;
    }
  }

  /**
   * Upload logo to storage
   */
  async uploadLogo(file: File): Promise<string> {
    try {
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Logo moet kleiner zijn dan 2MB');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `company-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('smb')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading logo:', uploadError);
        throw new Error(`Failed to upload logo: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('smb')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Service error in uploadLogo:', error);
      throw error;
    }
  }

  /**
   * Get featured profiles
   */
  async getFeaturedProfiles(): Promise<CompanyProfile[]> {
    try {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('is_featured', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching featured profiles:', error);
        throw new Error(`Failed to fetch featured profiles: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Service error in getFeaturedProfiles:', error);
      throw error;
    }
  }

  /**
   * Set up real-time subscription for company profiles
   */
  setupRealtimeSubscription(callback: (payload: any) => void) {
    const channel = supabase
      .channel('company-profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'company_profiles'
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

// Export singleton instance
export const companyProfileService = new CompanyProfileService();