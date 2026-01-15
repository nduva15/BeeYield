import { Helmet } from 'react-helmet';

interface SEOProps {
    title: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
}

const SEO = ({
    title,
    description = "BeeYield - Your Partner in Pollination. Precision pollination services, sustainable beekeeping, and traceable honey.",
    keywords = "pollination, beekeeping, honey, sustainable agriculture, Kenya, Africa, bee farming",
    image = "/logo.png", // Ensure you have a default OG image in public folder or change this
    url
}: SEOProps) => {
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://beeyield.com'; // Fallback
    const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
    const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

    return (
        <Helmet>
            <title>{title} | BeeYield</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={fullImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={fullUrl} />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={fullImage} />
        </Helmet>
    );
};

export default SEO;
