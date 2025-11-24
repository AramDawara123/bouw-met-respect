import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  keywords?: string;
}

const SEO = ({ 
  title = 'Bouw met Respect | Beweging voor een Veilige Bouwsector',
  description = 'Sluit je aan bij de beweging tegen grensoverschrijdend gedrag in de bouw. Voor een veiligere, respectvolle werkplek en aantrekkelijke sector voor jong talent.',
  image = '/lovable-uploads/e076c99e-b1ef-46db-9f73-10e463d8e7f7.png',
  url = 'https://bouwmetrespect.nl',
  type = 'website',
  keywords = 'grensoverschrijdend gedrag bouw, veilige bouwsector, respect bouwplaats, sociale veiligheid bouw, bouwbedrijven respect'
}: SEOProps) => {
  const fullUrl = url.startsWith('http') ? url : `https://bouwmetrespect.nl${url}`;
  const fullImageUrl = image.startsWith('http') ? image : `https://bouwmetrespect.nl${image}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImageUrl} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
    </Helmet>
  );
};

export default SEO;
