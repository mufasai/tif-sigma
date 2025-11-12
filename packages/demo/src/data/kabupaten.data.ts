import { Polygon, MultiPolygon } from 'geojson';

export interface KabupatenData {
    id: string;
    name: string;
    provinsi: string;
    type: 'Kabupaten' | 'Kota';
    coordinates: Polygon | MultiPolygon;
    statistics: {
        population: number;
        areaSize: string;
        btsCount: number;
        coverage: string;
    };
    performance: {
        avgThroughput: string;
        availability: string;
        avgLatency: string;
    };
    traffic: {
        data: string;
        voice: string;
        sms: string;
    };
}

// This will be populated from kota-kabupaten.json
export const kabupatenData: { [key: string]: KabupatenData } = {};

// Function to process and format kabupaten data from the JSON file
export const processKabupatenData = (rawData: { features?: Array<{ properties: Record<string, string>; geometry: { type: string; coordinates: unknown } }> }) => {
    const processedData: { [key: string]: KabupatenData } = {};

    if (rawData.features) {
        rawData.features.forEach((feature: { properties: Record<string, string>; geometry: { type: string; coordinates: unknown } }) => {
            const props = feature.properties;
            // Use CC_2 as id since it's unique for each kabupaten
            const id = props.CC_2 || props.GID_2;

            // Skip if we already have this kabupaten
            if (processedData[id]) return;

            processedData[id] = {
                id,
                name: props.NAME_2,
                provinsi: props.NAME_1,
                type: (props.TYPE_2 === 'Kota' ? 'Kota' : 'Kabupaten') as 'Kabupaten' | 'Kota',
                coordinates: {
                    type: feature.geometry.type,
                    coordinates: feature.geometry.coordinates
                } as Polygon | MultiPolygon,
                statistics: {
                    population: Math.floor(Math.random() * 1000000) + 100000,
                    areaSize: `${Math.floor(Math.random() * 1000) + 100} km²`,
                    btsCount: Math.floor(Math.random() * 100) + 10,
                    coverage: `${(Math.random() * 20 + 80).toFixed(1)}%`
                },
                performance: {
                    avgThroughput: `${Math.floor(Math.random() * 300 + 400)} Mbps`,
                    availability: `${(Math.random() * 5 + 95).toFixed(1)}%`,
                    avgLatency: `${Math.floor(Math.random() * 20 + 20)}ms`
                },
                traffic: {
                    data: `${Math.floor(Math.random() * 500 + 100)} GB`,
                    voice: `${Math.floor(Math.random() * 300000 + 100000)}`,
                    sms: `${Math.floor(Math.random() * 200000 + 50000)}`
                }
            };
        });
    }

    return processedData;
};

// Function to get kabupaten by province
export const getKabupatenByProvinsi = (provinsi: string) => {
    return Object.values(kabupatenData).filter(kab => kab.provinsi === provinsi);
};
