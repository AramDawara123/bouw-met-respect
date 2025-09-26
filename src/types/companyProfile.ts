export interface CompanyProfile {
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
  partner_membership_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyProfileFormData {
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  contact_email?: string;
  contact_phone?: string;
  is_featured: boolean;
  display_order: number;
}

export interface CreateCompanyProfileData extends CompanyProfileFormData {
  logo_url?: string | null;
  partner_membership_id?: string | null;
}

export interface UpdateCompanyProfileData extends Partial<CreateCompanyProfileData> {
  id: string;
}

export interface CompanyProfileWithPartner extends CompanyProfile {
  partner_membership?: {
    id: string;
    company_name: string;
    first_name: string;
    last_name: string;
    email: string;
    amount: number;
    currency: string;
    payment_status: string;
    created_at: string;
    updated_at: string;
  };
}