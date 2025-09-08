import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WebsiteContent {
  id?: string;
  hero_title: string;
  hero_subtitle: string;
  mission_title: string;
  mission_text: string;
  contact_email: string;
  primary_color: string;
  secondary_color: string;
  created_at?: string;
  updated_at?: string;
}

const defaultContent: WebsiteContent = {
  hero_title: "Bouw met Respect",
  hero_subtitle: "Samen bouwen we aan een betere toekomst voor de bouwsector. Een werkplek waar respect, veiligheid en inclusie centraal staan.",
  mission_title: "Onze Missie", 
  mission_text: "Een werkplek waar respect, veiligheid en inclusie centraal staan.",
  contact_email: "info@bouwmetrespect.nl",
  primary_color: "#8B5CF6",
  secondary_color: "#10B981"
};

export const useWebsiteContent = () => {
  const [content, setContent] = useState<WebsiteContent>(defaultContent);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('website_content')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setContent(data);
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
        .from('website_content')
        .select('id')
        .single();

      if (existingData) {
        const { error } = await supabase
          .from('website_content')
          .update({
            ...updatedContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('website_content')
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