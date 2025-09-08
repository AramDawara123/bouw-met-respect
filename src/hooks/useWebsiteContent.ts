import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WebsiteContent {
  id?: string;
  hero_title: string;
  hero_subtitle: string;
  mission_title: string;
  mission_text: string;
  contact_email: string;
  contact_phone: string;
  primary_color: string;
  secondary_color: string;
  created_at?: string;
  updated_at?: string;
}

const defaultContent: WebsiteContent = {
  hero_title: "Bouw met Respect – De beweging voor een veiligere en menselijkere bouwsector",
  hero_subtitle: "Grensoverschrijdend gedrag en een harde cultuur houden jong talent weg uit de bouw. Onze beweging gelooft dat verandering begint met respect. Sluit je aan en help mee de sector aantrekkelijker te maken voor iedereen.",
  mission_title: "Hoe onze beweging helpt", 
  mission_text: "Van anonieme melding tot keurmerk. Wij bieden concrete hulp om grensoverschrijdend gedrag aan te pakken en de bouwsector veiliger te maken. Samen zorgen we voor cultuurverandering op de bouwplaats.",
  contact_email: "info@bouwmetrespect.nl",
  contact_phone: "+31 6 1234 5678",
  primary_color: "#8B5CF6",
  secondary_color: "#10B981"
};

export const useWebsiteContent = () => {
  const [content, setContent] = useState<WebsiteContent>(defaultContent);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('website_content' as any)
        .select('*')
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setContent(data as unknown as WebsiteContent);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async (updatedContent: WebsiteContent) => {
    try {
      const { data: existingData } = await supabase
        .from('website_content' as any)
        .select('id')
        .maybeSingle();

      if (existingData) {
        const { error } = await supabase
          .from('website_content' as any)
          .update({
            ...updatedContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', (existingData as any).id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('website_content' as any)
          .insert([{
            ...updatedContent,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      setContent(updatedContent);
      return true;
    } catch (error) {
      console.error('Error saving content:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  return {
    content,
    loading,
    saveContent,
    refetch: fetchContent
  };
};