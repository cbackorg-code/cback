
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string[];
    canonical?: string;
    ogImage?: string;
    ogType?: string;
    twitterCard?: string;
    structuredData?: object;
}

export default function SEO({
    title,
    description,
    keywords,
    canonical,
    ogImage,
    ogType = 'website',
    twitterCard = 'summary_large_image',
    structuredData,
}: SEOProps) {
    const siteTitle = 'CBack';
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const metaDescription = description || 'Find the best cashback credit cards and offers. Compare rates, verified by the community. Check MCC codes for Swiggy HDFC, SBI Cashback, Amazon ICICI.';
    const metaKeywords = keywords?.join(', ') || 'cashback, credit cards, cback, cashback rate, mccs, mcc, merchant code, swiggy hdfc, sbi cashback, amazon icici, best credit cards, rewards, shopping offers';

    // Ensure canonical uses the Netlify domain
    const baseUrl = 'https://cback.netlify.app';
    const cleanPath = window.location.pathname;
    const defaultCanonical = `${baseUrl}${cleanPath === '/' ? '' : cleanPath}`;
    const currentUrl = canonical || defaultCanonical;
    const defaultOgImage = '/og-image.jpg'; // Ensure this image exists in public folder
    const metaImage = ogImage || defaultOgImage;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />
            <meta name="keywords" content={metaKeywords} />
            <link rel="canonical" href={currentUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />

            {/* Twitter */}
            <meta property="twitter:card" content={twitterCard} />
            <meta property="twitter:url" content={currentUrl} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={metaDescription} />
            <meta property="twitter:image" content={metaImage} />

            {/* Structured Data */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </Helmet>
    );
}
