import React from 'react';

interface StructuredDataProps {
  type?: 'organization' | 'faq' | 'article';
  data?: any;
}

const StructuredData: React.FC<StructuredDataProps> = ({ type = 'organization', data }) => {
  const getStructuredData = () => {
    switch (type) {
      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Bouw met Respect",
          "alternateName": "BMR Community",
          "url": "https://bouwmetrespect.nl",
          "description": "Community voor een veilige bouwsector. Samen doorbreken we de cirkel van grensoverschrijdend gedrag op bouwplaatsen.",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "NL"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "availableLanguage": "Dutch"
          },
          "sameAs": [
            "https://www.linkedin.com/company/bouw-met-respect",
            "https://www.instagram.com/bouwmetrespect",
            "https://www.facebook.com/bouwmetrespect"
          ],
          "keywords": "bouwsector veiligheid, grensoverschrijdend gedrag bouw, jong talent bouwsector, sociale veiligheid bouwsector",
          "areaServed": "Netherlands",
          "founder": {
            "@type": "Organization",
            "name": "Bouw met Respect"
          },
          "mission": "Het doorbreken van de cirkel van grensoverschrijdend gedrag op bouwplaatsen voor een veilige, respectvolle sector die jong talent verwelkomt."
        };
      
      case 'faq':
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Wat is Bouw met Respect?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Bouw met Respect is een community die zich inzet voor een veilige en respectvolle bouwsector. We doorbreken samen de cirkel van grensoverschrijdend gedrag op bouwplaatsen."
              }
            },
            {
              "@type": "Question", 
              "name": "Hoe kan ik lid worden?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Je kunt lid worden door je aan te sluiten bij onze beweging via het aanmeldformulier op onze website. Lidmaatschap geeft toegang tot coaching, netwerk en het keurmerk."
              }
            },
            {
              "@type": "Question",
              "name": "Wat biedt het keurmerk?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Het Bouw met Respect keurmerk toont dat je bedrijf zich inzet voor een veilige en respectvolle werkplek. Het helpt bij het aantrekken van jong talent en het verbeteren van de bedrijfscultuur."
              }
            }
          ]
        };
      
      default:
        return data || {};
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData())
      }}
    />
  );
};

export default StructuredData;