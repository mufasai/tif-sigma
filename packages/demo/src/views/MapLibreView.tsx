import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../styles/maplibre-view.css';
import { CSVUploadModal } from '../components/CSVUploadModal';
import {
  parseMapData,
  NodeData,
} from '../utils/maplibreCSVParser';
import { FiUpload, FiX, FiMapPin, FiLayers } from 'react-icons/fi';
import { testProvinceData, createProvinceGeoJSON } from '../utils/testProvinceData';
// eslint-disable-next-line import/extensions
import { kabupatenData } from '../data/kabupaten.data';
// eslint-disable-next-line import/extensions
import { loadKabupatenData } from '../services/kabupaten.service';
import { latlngToGraph } from '@sigma/layer-maplibre';
import Graph from 'graphology';
import { SerializedGraph } from 'graphology-types';
import Sigma from 'sigma';

// interface PointGeometry {
//   type: 'Point';
//   coordinates: [number, number];
// }

interface MapLibreViewProps {
  onClose: () => void;
}

// interface ClusterPoint {
//   type: 'Feature';
//   geometry: {
//     type: 'Point';
//     coordinates: [number, number];
//   };
//   properties: {
//     node: string;
//     sto: string;
//     witel: string;
//     reg: string;
//     types: string;
//     platform: string;
//     latitude: number;
//     longitude: number;
//   };
// }

export const MapLibreView: React.FC<MapLibreViewProps> = ({ onClose }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const sigmaContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const sigmaInstance = useRef<Sigma | null>(null);
  const sigmaCleanup = useRef<(() => void) | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLoadingDefault, setIsLoadingDefault] = useState(true);
  const [showKabupatenLayer, setShowKabupatenLayer] = useState(true);
  const [kabupatenLoaded, setKabupatenLoaded] = useState(false);
  const [showCapacityLayer, setShowCapacityLayer] = useState(false);
  const [capacityData, setCapacityData] = useState<Record<string, string>[]>([]);
  const [showSigmaLayer, setShowSigmaLayer] = useState(false);
  const [airportsData, setAirportsData] = useState<SerializedGraph | null>(null);

  // Load default data from joined_data.csv
  useEffect(() => {
    const loadDefaultData = async () => {
      try {
        const response = await fetch('/joined_data.csv');
        if (!response.ok) {
          throw new Error('Failed to load default data');
        }
        const csvContent = await response.text();
        await handleCSVUpload(csvContent);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading default data:', error);
      } finally {
        setIsLoadingDefault(false);
      }
    };

    loadDefaultData();
  }, []);

  // Load kabupaten data
  useEffect(() => {
    const loadKabupaten = async () => {
      const success = await loadKabupatenData();
      setKabupatenLoaded(success);
      if (success) {
        // eslint-disable-next-line no-console
        console.log('Kabupaten data loaded successfully');
      }
    };

    loadKabupaten();
  }, []);

  // Load capacity data
  useEffect(() => {
    const loadCapacityData = async () => {
      try {
        const response = await fetch('/data/capacity_ref_202511101441.csv');
        if (!response.ok) {
          throw new Error('Failed to load capacity data');
        }
        const csvText = await response.text();
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());

        const data = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
            const row: Record<string, string> = {};
            headers.forEach((header, index) => {
              if (values[index]) {
                row[header] = values[index].replace(/^"|"$/g, '').trim();
              }
            });
            return row;
          })
          .filter(row => row.longitude && row.latitude);

        setCapacityData(data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading capacity data:', error);
      }
    };

    loadCapacityData();
  }, []);

  // Load airports data for Sigma layer
  useEffect(() => {
    const loadAirportsData = async () => {
      try {
        const response = await fetch('/data/airports.json');
        if (!response.ok) {
          throw new Error('Failed to load airports data');
        }
        const data = await response.json();
        setAirportsData(data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading airports data:', error);
      }
    };

    loadAirportsData();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Wait for container to be ready
    setTimeout(() => {
      if (!mapContainer.current) return;

      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            'osm-tiles': {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            },
          },
          layers: [
            {
              id: 'osm-tiles-layer',
              type: 'raster',
              source: 'osm-tiles',
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center: [117.4, -0.8], // Center of Indonesia
        zoom: 5,
      });

      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
      map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');

      map.current.on('load', () => {
        setMapLoaded(true);
      });
    }, 0);

    return () => {
      map.current?.remove();
    };
  }, []);

  // Update map with clustering - DISABLED (markers hidden)
  const updateMapData = (_: NodeData[]) => {
    if (!map.current || !mapLoaded) return;

    try {
      // Remove existing layers and sources
      const layersToRemove = ['clusters', 'cluster-count', 'unclustered-point'];
      layersToRemove.forEach((layerId) => {
        if (map.current!.getLayer(layerId)) {
          map.current!.removeLayer(layerId);
        }
      });

      if (map.current.getSource('nodes')) {
        map.current.removeSource('nodes');
      }

      // Markers are now hidden - no layers will be added

    } catch (_) {
      alert('Terjadi kesalahan saat memperbarui peta. Silakan coba lagi.');
    }
  };

  // Handle CSV upload
  const handleCSVUpload = async (csvContent: string) => {
    try {
      const parsedData = await parseMapData(csvContent);
      setNodes(parsedData.nodes);
    } catch (_) {
      alert('Gagal memproses file CSV. Pastikan format file sudah benar dan memiliki kolom: node, latitude, longitude');
    }
  };

  // Add province layer function
  const addProvinceLayer = () => {
    // Test province data
    testProvinceData();

    if (!map.current) {
      return;
    }

    try {
      // Use the test utility to create GeoJSON
      const geojson = createProvinceGeoJSON();

      // Add source
      map.current.addSource('provinces', {
        type: 'geojson',
        data: geojson
      });

      // Add click handler
      map.current.on('click', 'provinces-fill', (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const props = feature.properties;
          const coordinates = e.lngLat;

          new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
              <div style="font-size: 12px; padding: 8px;">
                <strong style="font-size: 14px;">${props?.name || 'Unknown'}</strong><br/>
                <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;"/>
                <strong>Population:</strong> ${(props?.population || 0).toLocaleString()}<br/>
                <strong>Area Size:</strong> ${props?.areaSize || '-'}<br/>
                <strong>BTS Count:</strong> ${props?.btsCount || 0}<br/>
                <strong>Coverage:</strong> ${props?.coverage || '-'}
              </div>
            `)
            .addTo(map.current!);
        }
      });

      // Add hover handler
      map.current.on('mouseenter', 'provinces-fill', (e) => {
        if (e.features && e.features.length > 0) {
          map.current!.setFilter('provinces-hover', ['==', 'id', e.features[0].properties?.id]);
          map.current!.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', 'provinces-fill', () => {
        map.current!.setFilter('provinces-hover', ['==', 'id', '']);
        map.current!.getCanvas().style.cursor = '';
      });

      // Zoom to show all provinces (Indonesia)
      map.current.flyTo({
        center: [118.0, -2.0], // Center of Indonesia
        zoom: 4.5,
        duration: 2000
      });

    } catch (error) {

      alert(`Error adding province layer: ${error}`);
    }
  };

  // Generate random color
  const generateRandomColor = () => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52BE80',
      '#EC7063', '#AF7AC5', '#5DADE2', '#48C9B0', '#F4D03F',
      '#EB984E', '#DC7633', '#CA6F1E', '#BA4A00', '#A04000',
      '#7D3C98', '#6C3483', '#5B2C6F', '#4A235A', '#76448A',
      '#633974', '#1ABC9C', '#16A085', '#138D75', '#117A65',
      '#0E6655', '#0B5345', '#186A3B', '#E74C3C', '#C0392B',
      '#8E44AD', '#9B59B6', '#2980B9', '#3498DB', '#1ABC9C',
      '#16A085', '#27AE60', '#2ECC71', '#F39C12', '#E67E22',
      '#D35400', '#E74C3C', '#C0392B', '#ECF0F1', '#BDC3C7'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Add kabupaten layer function
  const addKabupatenLayer = () => {

    if (!map.current) {
      return;
    }

    if (!kabupatenLoaded || Object.keys(kabupatenData).length === 0) {
      return;
    }

    try {
      // Create GeoJSON features for kabupaten with random colors
      const features = Object.values(kabupatenData).map((kabupaten) => ({
        type: 'Feature' as const,
        properties: {
          id: kabupaten.id,
          name: kabupaten.name,
          provinsi: kabupaten.provinsi,
          type: kabupaten.type,
          population: kabupaten.statistics.population,
          areaSize: kabupaten.statistics.areaSize,
          btsCount: kabupaten.statistics.btsCount,
          coverage: kabupaten.statistics.coverage,
          color: generateRandomColor() // Add random color for each kabupaten
        },
        geometry: kabupaten.coordinates
      }));


      // Remove existing kabupaten layers if they exist
      if (map.current.getLayer('kabupaten-fill')) {
        map.current.removeLayer('kabupaten-fill');
      }
      if (map.current.getLayer('kabupaten-outline')) {
        map.current.removeLayer('kabupaten-outline');
      }
      if (map.current.getLayer('kabupaten-hover')) {
        map.current.removeLayer('kabupaten-hover');
      }
      if (map.current.getSource('kabupaten')) {
        map.current.removeSource('kabupaten');
      }

      // Add source
      map.current.addSource('kabupaten', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: features
        }
      });

      // Add fill layer with random colors
      map.current.addLayer({
        id: 'kabupaten-fill',
        type: 'fill',
        source: 'kabupaten',
        paint: {
          'fill-color': ['get', 'color'], // Use color from properties
          'fill-opacity': 0.5
        }
      });

      // Add outline layer
      map.current.addLayer({
        id: 'kabupaten-outline',
        type: 'line',
        source: 'kabupaten',
        paint: {
          'line-color': '#FFFFFF',
          'line-width': 1.5
        }
      });

      // Add hover effect
      map.current.addLayer({
        id: 'kabupaten-hover',
        type: 'fill',
        source: 'kabupaten',
        paint: {
          'fill-color': ['get', 'color'], // Use same color but darker
          'fill-opacity': 0.7
        },
        filter: ['==', 'id', '']
      });

      // Add click handler
      map.current.on('click', 'kabupaten-fill', (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const props = feature.properties;
          const coordinates = e.lngLat;

          new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
              <div style="font-size: 12px; padding: 8px;">
                <strong style="font-size: 14px;">${props?.type || ''} ${props?.name || 'Unknown'}</strong><br/>
                <strong>Provinsi:</strong> ${props?.provinsi || '-'}<br/>
                <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;"/>
                <strong>Population:</strong> ${(props?.population || 0).toLocaleString()}<br/>
                <strong>Area Size:</strong> ${props?.areaSize || '-'}<br/>
                <strong>BTS Count:</strong> ${props?.btsCount || 0}<br/>
                <strong>Coverage:</strong> ${props?.coverage || '-'}
              </div>
            `)
            .addTo(map.current!);
        }
      });

      // Add hover handler
      map.current.on('mouseenter', 'kabupaten-fill', (e) => {
        if (e.features && e.features.length > 0) {
          map.current!.setFilter('kabupaten-hover', ['==', 'id', e.features[0].properties?.id]);
          map.current!.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', 'kabupaten-fill', () => {
        map.current!.setFilter('kabupaten-hover', ['==', 'id', '']);
        map.current!.getCanvas().style.cursor = '';
      });

    } catch (error) {

      alert(`Error adding kabupaten layer: ${error}`);
    }
  };

  // Toggle kabupaten layer visibility
  const toggleKabupatenLayer = () => {
    if (!map.current) return;

    const newVisibility = !showKabupatenLayer;
    setShowKabupatenLayer(newVisibility);

    if (newVisibility && !map.current.getLayer('kabupaten-fill')) {
      // Add layer if it doesn't exist
      addKabupatenLayer();
    } else {
      // Toggle visibility
      const visibility = newVisibility ? 'visible' : 'none';

      if (map.current.getLayer('kabupaten-fill')) {
        map.current.setLayoutProperty('kabupaten-fill', 'visibility', visibility);
      }
      if (map.current.getLayer('kabupaten-outline')) {
        map.current.setLayoutProperty('kabupaten-outline', 'visibility', visibility);
      }
      if (map.current.getLayer('kabupaten-hover')) {
        map.current.setLayoutProperty('kabupaten-hover', 'visibility', visibility);
      }
    }
  };

  // Parse WKT POLYGON to GeoJSON coordinates
  const parseWKTPolygon = (wkt: string) => {
    try {
      // Remove "POLYGON ((" and "))" and split by coordinates
      const coordsString = wkt
        .replace(/^POLYGON\s*\(\(/i, '')
        .replace(/\)\)$/, '')
        .trim();

      const coords = coordsString.split(',').map(pair => {
        const [lng, lat] = pair.trim().split(/\s+/);
        return [parseFloat(lng), parseFloat(lat)];
      });

      return {
        type: 'Polygon' as const,
        coordinates: [coords]
      };
    } catch (_error) {
      return null;
    }
  };

  // Add capacity layer function
  const addCapacityLayer = () => {
    if (!map.current || capacityData.length === 0) {
      return;
    }

    try {
      // Remove existing capacity layers if they exist
      if (map.current.getLayer('capacity-points')) {
        map.current.removeLayer('capacity-points');
      }
      if (map.current.getLayer('capacity-lines')) {
        map.current.removeLayer('capacity-lines');
      }
      if (map.current.getLayer('capacity-lines-glow')) {
        map.current.removeLayer('capacity-lines-glow');
      }
      if (map.current.getLayer('capacity-boundaries-fill')) {
        map.current.removeLayer('capacity-boundaries-fill');
      }
      if (map.current.getLayer('capacity-boundaries-outline')) {
        map.current.removeLayer('capacity-boundaries-outline');
      }
      if (map.current.getLayer('capacity-boundaries-hover')) {
        map.current.removeLayer('capacity-boundaries-hover');
      }
      if (map.current.getSource('capacity')) {
        map.current.removeSource('capacity');
      }
      if (map.current.getSource('capacity-lines')) {
        map.current.removeSource('capacity-lines');
      }
      if (map.current.getSource('capacity-boundaries')) {
        map.current.removeSource('capacity-boundaries');
      }

      // Group data by STO to get unique boundaries
      const boundaryMap = new Map<string, Record<string, string>>();
      capacityData.forEach((item) => {
        const stoKey = item.code_area || item.sto;
        if (stoKey && item.boundary && !boundaryMap.has(stoKey)) {
          boundaryMap.set(stoKey, item);
        }
      });

      // Create GeoJSON features for boundaries
      const boundaryFeatures = Array.from(boundaryMap.values())
        .map((item) => {
          const geometry = parseWKTPolygon(item.boundary);
          if (!geometry) return null;

          return {
            type: 'Feature' as const,
            properties: {
              id: item.code_area || item.sto,
              name: item.name_area || item.sto_l || 'N/A',
              type: item.type_area || 'STO',
              sto: item.sto || 'N/A',
              witel: item.witel || 'N/A',
              reg: item.reg || 'N/A',
              color: generateRandomColor()
            },
            geometry
          };
        })
        .filter(f => f !== null);

      // Add boundary source and layers
      if (boundaryFeatures.length > 0) {
        map.current.addSource('capacity-boundaries', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: boundaryFeatures
          }
        });

        // Add fill layer
        map.current.addLayer({
          id: 'capacity-boundaries-fill',
          type: 'fill',
          source: 'capacity-boundaries',
          paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': 0.4
          }
        });

        // Add outline layer
        map.current.addLayer({
          id: 'capacity-boundaries-outline',
          type: 'line',
          source: 'capacity-boundaries',
          paint: {
            'line-color': '#FF6B35',
            'line-width': 2
          }
        });

        // Add hover effect
        map.current.addLayer({
          id: 'capacity-boundaries-hover',
          type: 'fill',
          source: 'capacity-boundaries',
          paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': 0.6
          },
          filter: ['==', 'id', '']
        });

        // Add click handler for boundaries
        map.current.on('click', 'capacity-boundaries-fill', (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            const props = feature.properties;
            const coordinates = e.lngLat;

            // Count equipment in this STO
            const equipmentCount = capacityData.filter(
              item => (item.code_area || item.sto) === props?.id
            ).length;

            new maplibregl.Popup()
              .setLngLat(coordinates)
              .setHTML(`
                <div style="font-size: 12px; padding: 8px;">
                  <strong style="font-size: 14px; color: #FF6B35;">${props?.type || ''} ${props?.name || 'Unknown'}</strong><br/>
                  <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;"/>
                  <strong>STO:</strong> ${props?.sto || '-'}<br/>
                  <strong>Witel:</strong> ${props?.witel || '-'}<br/>
                  <strong>Region:</strong> ${props?.reg || '-'}<br/>
                  <strong>Equipment Count:</strong> ${equipmentCount}<br/>
                </div>
              `)
              .addTo(map.current!);
          }
        });

        // Add hover handler for boundaries
        map.current.on('mouseenter', 'capacity-boundaries-fill', (e) => {
          if (e.features && e.features.length > 0) {
            map.current!.setFilter('capacity-boundaries-hover', ['==', 'id', e.features[0].properties?.id]);
            map.current!.getCanvas().style.cursor = 'pointer';
          }
        });

        map.current.on('mouseleave', 'capacity-boundaries-fill', () => {
          map.current!.setFilter('capacity-boundaries-hover', ['==', 'id', '']);
          map.current!.getCanvas().style.cursor = '';
        });
      }

      // Get all coordinates FIRST
      const allCoordinates = capacityData.map((item) => ({
        coords: [parseFloat(item.longitude), parseFloat(item.latitude)] as [number, number],
        hostname: item.hostname || 'N/A',
        sto: item.sto || 'N/A'
      }));

      // Create connecting lines between ALL points
      const lineFeatures: Array<{
        type: 'Feature';
        properties: { from: string; to: string };
        geometry: { type: 'LineString'; coordinates: Array<[number, number]> };
      }> = [];

      // Create lines connecting each point to its nearest neighbors
      allCoordinates.forEach((point, index) => {
        // Calculate distances to all other points
        const distances = allCoordinates
          .map((otherPoint, otherIndex) => {
            if (index === otherIndex) return null;
            const dx = point.coords[0] - otherPoint.coords[0];
            const dy = point.coords[1] - otherPoint.coords[1];
            const distance = Math.sqrt(dx * dx + dy * dy);
            return { index: otherIndex, distance, point: otherPoint };
          })
          .filter(d => d !== null)
          .sort((a, b) => a!.distance - b!.distance);

        // Connect to 2 nearest neighbors
        const neighborsToConnect = Math.min(2, distances.length);
        for (let i = 0; i < neighborsToConnect; i++) {
          const neighbor = distances[i];
          if (neighbor) {
            lineFeatures.push({
              type: 'Feature' as const,
              properties: {
                from: point.hostname,
                to: neighbor.point.hostname
              },
              geometry: {
                type: 'LineString' as const,
                coordinates: [point.coords, neighbor.point.coords]
              }
            });
          }
        }
      });

      // Create GeoJSON features for capacity points
      const pointFeatures = capacityData.map((item) => ({
        type: 'Feature' as const,
        properties: {
          hostname: item.hostname || 'N/A',
          manufacture: item.manufacture || 'N/A',
          version: item.version || 'N/A',
          sto: item.sto || 'N/A',
          sto_l: item.sto_l || 'N/A',
          witel: item.witel || 'N/A',
          reg: item.reg || 'N/A',
          tipe_card: item.tipe_card || 'N/A',
          cap: item.cap || 'N/A',
          port_used: item.port_used || '0',
          port_idle: item.port_idle || '0',
          platform: item.platform || 'N/A',
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [parseFloat(item.longitude), parseFloat(item.latitude)]
        }
      }));

      if (lineFeatures.length > 0) {
        // Validate line features
        const validLineFeatures = lineFeatures.filter(feature => {
          const coords = feature.geometry.coordinates;
          const isValid = coords.length === 2 &&
            coords.every(coord =>
              Array.isArray(coord) &&
              coord.length === 2 &&
              !isNaN(coord[0]) &&
              !isNaN(coord[1]) &&
              Math.abs(coord[0]) <= 180 &&
              Math.abs(coord[1]) <= 90
            );
          if (!isValid) {
            // eslint-disable-next-line no-console
            console.warn('Invalid line feature:', feature);
          }
          return isValid;
        });

        map.current.addSource('capacity-lines', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: validLineFeatures
          }
        });

        // Add glow effect layer FIRST (bottom layer)
        map.current.addLayer({
          id: 'capacity-lines-glow',
          type: 'line',
          source: 'capacity-lines',
          paint: {
            'line-color': '#FFD700', // Gold color for visibility
            'line-width': 8,
            'line-opacity': 0.4,
            'line-blur': 4
          }
        });

        // Add main line layer on top of glow
        map.current.addLayer({
          id: 'capacity-lines',
          type: 'line',
          source: 'capacity-lines',
          paint: {
            'line-color': '#FF0000', // BRIGHT RED for testing
            'line-width': 5,
            'line-opacity': 1.0
          }
        });

      }

      // Add points source AFTER lines
      map.current.addSource('capacity', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: pointFeatures
        }
      });

      // Add circle layer for capacity points (larger size) - on top of lines
      map.current.addLayer({
        id: 'capacity-points',
        type: 'circle',
        source: 'capacity',
        paint: {
          'circle-radius': 10,
          'circle-color': '#FF6B35',
          'circle-stroke-width': 3,
          'circle-stroke-color': '#FFFFFF',
          'circle-opacity': 0.9
        }
      });

      // Add click handler for points
      map.current.on('click', 'capacity-points', (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const props = feature.properties;
          const coordinates = e.lngLat;

          new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
              <div style="font-size: 12px; padding: 8px; max-width: 300px;">
                <strong style="font-size: 14px; color: #FF6B35;">${props?.hostname || 'Unknown'}</strong><br/>
                <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;"/>
                <strong>Manufacture:</strong> ${props?.manufacture || '-'}<br/>
                <strong>Platform:</strong> ${props?.platform || '-'}<br/>
                <strong>Version:</strong> ${props?.version || '-'}<br/>
                <strong>Card Type:</strong> ${props?.tipe_card || '-'}<br/>
                <strong>Capacity:</strong> ${props?.cap || '-'}<br/>
                <strong>Port Used:</strong> ${props?.port_used || '0'}<br/>
                <strong>Port Idle:</strong> ${props?.port_idle || '0'}<br/>
                <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;"/>
                <strong>STO:</strong> ${props?.sto_l || '-'}<br/>
                <strong>Witel:</strong> ${props?.witel || '-'}<br/>
                <strong>Region:</strong> ${props?.reg || '-'}
              </div>
            `)
            .addTo(map.current!);
        }
      });

      // Add hover handler for points
      map.current.on('mouseenter', 'capacity-points', () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', 'capacity-points', () => {
        map.current!.getCanvas().style.cursor = '';
      });


      // Calculate bounds of all points to ensure they're in viewport
      if (allCoordinates.length > 0) {
        const lngs = allCoordinates.map(c => c.coords[0]);
        const lats = allCoordinates.map(c => c.coords[1]);
        const bounds = {
          minLng: Math.min(...lngs),
          maxLng: Math.max(...lngs),
          minLat: Math.min(...lats),
          maxLat: Math.max(...lats)
        };


        // Fit map to show all points and lines
        map.current.fitBounds([
          [bounds.minLng, bounds.minLat],
          [bounds.maxLng, bounds.maxLat]
        ], {
          padding: 50,
          duration: 1000
        });

      }



    } catch (_error) {

      alert(`Error adding capacity layer: ${_error}`);
    }
  };

  // Toggle capacity layer visibility
  const toggleCapacityLayer = () => {
    if (!map.current) return;

    const newVisibility = !showCapacityLayer;
    setShowCapacityLayer(newVisibility);

    if (newVisibility && !map.current.getLayer('capacity-points')) {
      // Add layer if it doesn't exist
      addCapacityLayer();
    } else {
      // Toggle visibility
      const visibility = newVisibility ? 'visible' : 'none';

      if (map.current.getLayer('capacity-points')) {
        map.current.setLayoutProperty('capacity-points', 'visibility', visibility);
      }
      if (map.current.getLayer('capacity-lines')) {
        map.current.setLayoutProperty('capacity-lines', 'visibility', visibility);
      }
      if (map.current.getLayer('capacity-lines-glow')) {
        map.current.setLayoutProperty('capacity-lines-glow', 'visibility', visibility);
      }
      if (map.current.getLayer('capacity-boundaries-fill')) {
        map.current.setLayoutProperty('capacity-boundaries-fill', 'visibility', visibility);
      }
      if (map.current.getLayer('capacity-boundaries-outline')) {
        map.current.setLayoutProperty('capacity-boundaries-outline', 'visibility', visibility);
      }
      if (map.current.getLayer('capacity-boundaries-hover')) {
        map.current.setLayoutProperty('capacity-boundaries-hover', 'visibility', visibility);
      }
    }
  };

  // Helper function: Sync sigma with map (simplified - only one direction)
  const syncSigmaWithMap = (sigma: Sigma) => {
    if (!map.current) return;

    // Compute sigma center
    const center = sigma.viewportToFramedGraph(sigma.graphToViewport(latlngToGraph(map.current, map.current.getCenter())));

    // Compute sigma ratio
    const mapBound = map.current.getBounds();
    const northEast = sigma.graphToViewport(latlngToGraph(map.current, mapBound.getNorthEast()));
    const southWest = sigma.graphToViewport(latlngToGraph(map.current, mapBound.getSouthWest()));
    const viewportBoundDimension = {
      width: Math.abs(northEast.x - southWest.x),
      height: Math.abs(northEast.y - southWest.y),
    };
    const viewportDim = sigma.getDimensions();
    const ratio =
      Math.min(viewportBoundDimension.width / viewportDim.width, viewportBoundDimension.height / viewportDim.height) *
      sigma.getCamera().getState().ratio;

    sigma.getCamera().setState({ ...center, ratio: ratio });
  };

  // Add Sigma layer function
  const addSigmaLayer = () => {
    // Wait for container to be rendered
    if (!sigmaContainer.current) {
      setTimeout(() => addSigmaLayer(), 100);
      return;
    }

    if (!airportsData || sigmaInstance.current || !map.current) {
      return;
    }

    try {
      // Create graph from airports data
      const graph = Graph.from(airportsData);
      // Update node coordinates to match map projection
      graph.updateEachNodeAttributes((_node, attributes) => {
        const coords = latlngToGraph(map.current!, {
          lat: attributes.latitude,
          lng: attributes.longitude
        });
        return {
          ...attributes,
          label: attributes.fullName,
          x: coords.x,
          y: coords.y,
        };
      });

      // Initialize Sigma with transparent background to show map underneath
      const renderer = new Sigma(graph, sigmaContainer.current, {
        labelRenderedSizeThreshold: 20,
        defaultNodeColor: '#e22352',
        defaultEdgeColor: '#ffaeaf',
        minEdgeThickness: 2,
        stagePadding: 0,
        enableCameraRotation: false,
        renderEdgeLabels: false,
        renderLabels: true,
        labelColor: { color: '#000' },
        nodeReducer: (node, attrs) => {
          return {
            ...attrs,
            size: Math.sqrt(graph.degree(node)) * 2,
          };
        },
      });

      // Access WebGL context and set transparent clear color
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gl = (renderer as any).getWebGLContext();
      if (gl) {
        gl.clearColor(0, 0, 0, 0); // RGBA: transparent
      }



      // Function to update graph coordinates when map moves
      const updateGraphCoordinates = () => {
        graph.updateEachNodeAttributes((_node, attrs) => {
          const coords = latlngToGraph(map.current!, {
            lat: attrs.latitude,
            lng: attrs.longitude
          });
          return {
            ...attrs,
            x: coords.x,
            y: coords.y,
          };
        });
      };

      // Simplified approach: Only sync Sigma to follow the map
      // Don't sync map to follow Sigma to avoid infinite loops
      const fnSyncSigmaWithMap = () => {
        if (map.current && !map.current.isMoving()) {
          updateGraphCoordinates();
          syncSigmaWithMap(renderer);
          renderer.refresh();
        }
      };

      // Initial sync
      syncSigmaWithMap(renderer);
      renderer.refresh();



      // Setup event listeners - only listen to map changes
      map.current.on('moveend', fnSyncSigmaWithMap);
      map.current.on('zoomend', fnSyncSigmaWithMap);

      // Cleanup function
      const cleanup = () => {
        if (map.current) {
          map.current.off('moveend', fnSyncSigmaWithMap);
          map.current.off('zoomend', fnSyncSigmaWithMap);
        }
        renderer.kill();
      };

      sigmaInstance.current = renderer;
      sigmaCleanup.current = cleanup;


    } catch (error) {

      alert(`Error adding Sigma layer: ${error}`);
    }
  };

  // Remove Sigma layer function
  const removeSigmaLayer = () => {
    if (sigmaCleanup.current) {
      sigmaCleanup.current();
      sigmaCleanup.current = null;
    }
    // Note: renderer.kill() is already called in cleanup function
    sigmaInstance.current = null;
  };

  // Toggle Sigma layer visibility
  const toggleSigmaLayer = () => {
    const newVisibility = !showSigmaLayer;
    setShowSigmaLayer(newVisibility);

    if (newVisibility) {
      addSigmaLayer();
    } else {
      removeSigmaLayer();
    }
  };

  // Add province layer when map is loaded
  useEffect(() => {
    if (mapLoaded && map.current) {
      addProvinceLayer();
    }
  }, [mapLoaded]);

  // Add kabupaten layer when data is loaded
  useEffect(() => {
    if (mapLoaded && kabupatenLoaded && showKabupatenLayer && map.current) {

      addKabupatenLayer();
    }
  }, [mapLoaded, kabupatenLoaded]);

  // Update map when nodes change
  useEffect(() => {
    if (mapLoaded && nodes.length > 0) {
      updateMapData(nodes);
    }
  }, [nodes, mapLoaded]);

  // Cleanup Sigma layer on unmount
  useEffect(() => {
    return () => {
      removeSigmaLayer();
    };
  }, []);

  return (
    <div className="maplibre-view">
      <div className="maplibre-header">
        <div className="header-left">
          <FiMapPin />
          <h2>MapLibre - Visualisasi STO Indonesia</h2>
        </div>
        <div className="header-actions">
          <button
            className={`button ${showKabupatenLayer ? 'layer-btn-active-kabupaten' : 'layer-btn'}`}
            onClick={toggleKabupatenLayer}
            title={showKabupatenLayer ? 'Hide Kabupaten Layer' : 'Show Kabupaten Layer'}
            disabled={!kabupatenLoaded}
          >
            <FiLayers /> {showKabupatenLayer ? 'Hide' : 'Show'} Kabupaten
          </button>
          <button
            className={`button ${showCapacityLayer ? 'layer-btn-active-kabupaten' : 'layer-btn'}`}
            onClick={toggleCapacityLayer}
            title={showCapacityLayer ? 'Hide Capacity Layer' : 'Show Capacity Layer'}
            disabled={capacityData.length === 0}
          >
            <FiLayers /> {showCapacityLayer ? 'Hide' : 'Show'} Capacity
          </button>
          <button
            className={`button ${showSigmaLayer ? 'layer-btn-active-kabupaten' : 'layer-btn'}`}
            onClick={toggleSigmaLayer}
            title={showSigmaLayer ? 'Hide Sigma Layer' : 'Show Sigma Layer'}
            disabled={!airportsData}
          >
            <FiLayers /> {showSigmaLayer ? 'Hide' : 'Show'} Sigma
          </button>
          <button className="button upload-btn" onClick={() => setIsModalOpen(true)}>
            <FiUpload /> Tambah Data
          </button>
          <button className="button close-btn" onClick={onClose}>
            <FiX /> Tutup
          </button>
        </div>
      </div>

      <div className="map-stats">
        <div className="stat-item">
          <strong>Nodes:</strong> {nodes.length}
        </div>
        <div className="stat-item">
          <strong>Kabupaten/Kota:</strong> {kabupatenLoaded ? Object.keys(kabupatenData).length : 'Loading...'}
        </div>
        <div className="stat-item">
          <strong>Capacity Points:</strong> {capacityData.length}
        </div>
        <div className="stat-item">
          <strong>Airports (Sigma):</strong> {airportsData ? airportsData.nodes.length : 'Loading...'}
        </div>
        {isLoadingDefault && (
          <div className="stat-item" style={{ color: '#e22653' }}>
            Loading default data...
          </div>
        )}
      </div>

      <div className="map-container">
        <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
        <div
          ref={sigmaContainer}
          className="sigma-container"
          style={{
            visibility: showSigmaLayer ? 'visible' : 'hidden',
            pointerEvents: showSigmaLayer ? 'auto' : 'none'
          }}
        />
      </div>

      <CSVUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleCSVUpload}
      />
    </div>
  );
};
