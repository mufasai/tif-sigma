// Test utility to verify province data structure
import { provincesData } from '../data/provinces.data';


// Create a valid GeoJSON FeatureCollection for testing
export const createProvinceGeoJSON = () => {
  const features = Object.values(provincesData).map((province) => ({
    type: 'Feature' as const,
    properties: {
      id: province.id,
      name: province.name,
      color: province.color,
      population: province.statistics?.population || 0,
      areaSize: province.statistics?.areaSize || '',
      btsCount: province.statistics?.btsCount || 0,
      coverage: province.statistics?.coverage || ''
    },
    geometry: {
      type: 'Polygon' as const,
      coordinates: province.coordinates
    }
  }));

  return {
    type: 'FeatureCollection' as const,
    features
  };
};
