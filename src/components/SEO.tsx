import { Helmet } from 'react-helmet';

interface SEOProps {
    title: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    canonical?: string;
    schema?: object;
    type?: string;
}

const SEO = ({
    title,
    description = "BeeYield - Your Partner in Pollination. Premium precision pollination services, sustainable beekeeping, and traceable raw honey from Kenya to the World.",
    keywords = "precision pollination, honey traceability, sustainable beekeeping, Kibwezi, Makueni, Kenya honey, African agriculture, IoT bees",
    image = "/logo.png",
    url,
    canonical,
    schema,
    type = "website"
}: SEOProps) => {
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://beeyield.com';
    const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
    const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;
    const canonicalUrl = canonical || fullUrl;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{title} | BeeYield — Your Partner in Pollination</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <link rel="canonical" href={canonicalUrl} />

            {/* GEO Metadata - Targeted at Honey Origin (Kibwezi, Kenya) */}
            <meta name="geo.region" content="KE" />
            <meta name="geo.placename" content="Kibwezi, Makueni County, Kenya" />
            <meta name="geo.position" content="-2.4214;37.9545" />
            <meta name="ICBM" content="-2.4214, 37.9545" />

            {/* Answer Engine Optimization (AEO) hints */}
            <meta name="search-engine" content="beeyield-aeo" />
            <meta name="audience" content="farmers, apiarists, sustainable consumers, global researchers" />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={`${title} | BeeYield`} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={fullImage} />
            <meta property="og:locale" content="en_KE" />
            <meta property="og:site_name" content="BeeYield" />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={fullUrl} />
            <meta property="twitter:title" content={`${title} | BeeYield`} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={fullImage} />
            <meta name="twitter:label1" content="Region" />
            <meta name="twitter:data1" content="Kenya, Africa" />
            <meta name="twitter:label2" content="Expertise" />
            <meta name="twitter:data2" content="Precision Pollination & IoT IoT" />

            {/* Structured Data (Schema.org / JSON-LD) */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
