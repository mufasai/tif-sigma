// Test utility to verify province data structure
import { provincesData } from '../data/provinces.data';

export const testProvinceData = () => {
  console.log('=== Testing Province Data ===');
  
  const provinces = Object.values(provincesData);
  console.log(`Total provinces: ${provinces.length}`);
  
  provinces.forEach((province, index) => {
    console.log(`\n--- Province ${index + 1}: ${province.name} ---`);
    console.log(`ID: ${province.id}`);
    console.log(`Color: ${province.color}`);
    console.log(`Coordinates arrays: ${province.coordinates.length}`);
    console.log(`First ring points: ${province.coordinates[0].length}`);
    console.log(`First point: [${province.coordinates[0][0][0]}, ${province.coordinates[0][0][1]}]`);
    console.log(`Last point: [${province.coordinates[0][province.coordinates[0].length - 1][0]}, ${province.coordinates[0][province.coordinates[0].length - 1][1]}]`);
    
    // Check if polygon is closed (first point === last point)
    const firstPoint = province.coordinates[0][0];
    const lastPoint = province.coordinates[0][province.coordinates[0].length - 1];
    const isClosed = firstPoint[0] === lastPoint[0] && firstPoint[1] === lastPoint[1];
    console.log(`Polygon closed: ${isClosed}`);
    
    if (province.statistics) {
      console.log(`Population: ${province.statistics.population.toLocaleString()}`);
      console.log(`Area: ${province.statistics.areaSize}`);
      console.log(`BTS Count: ${province.statistics.btsCount}`);
      console.log(`Coverage: ${province.statistics.coverage}`);
    }
  });
  
  console.log('\n=== Test Complete ===');
};

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
