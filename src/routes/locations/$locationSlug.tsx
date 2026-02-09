import { createFileRoute } from '@tanstack/react-router';
import LocationLandingPage from '@/components/LocationLandingPage';
import { locations } from '@/data/locations';

export const Route = createFileRoute('/locations/$locationSlug')({
    component: LocationComponent,
    loader: ({ params }) => {
        const data = locations.find((l) => l.slug === params.locationSlug);
        if (!data) {
            throw new Error('Location not found');
        }
        return data;
    },
    head: ({ loaderData }) => ({
        meta: [
            { title: `${loaderData.cityName} Precision Pollination & Honey Traceability | BeeYield` },
            { name: 'description', content: `Maximize crop yields in ${loaderData.cityName} with BeeYield's IoT-enabled pollination. Specializing in ${loaderData.crops.join(', ')} for the ${loaderData.regionName} region.` },
            { name: 'keywords', content: `${loaderData.cityName} beekeeping, pollination services ${loaderData.cityName}, raw honey ${loaderData.cityName}` }
        ],
    }),
});

function LocationComponent() {
    const data = Route.useLoaderData();
    return <LocationLandingPage {...data} />;
}
