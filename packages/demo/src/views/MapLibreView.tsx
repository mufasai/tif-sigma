import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../styles/maplibre-view.css';
import { CSVUploadModal } from '../components/CSVUploadModal';
import {
  parseMapData,
  NodeData,
} from '../utils/maplibreCSVParser';
import { FiUpload, FiX, FiMapPin } from 'react-icons/fi';

interface MapLibreViewProps {
  onClose: () => void;
}

interface ClusterPoint {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    node: string;
    sto: string;
    witel: string;
    reg: string;
    types: string;
    platform: string;
    latitude: number;
    longitude: number;
  };
}

export const MapLibreView: React.FC<MapLibreViewProps> = ({ onClose }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLoadingDefault, setIsLoadingDefault] = useState(true);

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
        console.error('Error loading default data:', error);
      } finally {
        setIsLoadingDefault(false);
      }
    };

    loadDefaultData();
  }, []);

  // Initialize map
  useEffect(() => {
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

    return () => {
      map.current?.remove();
    };
  }, []);

  // Update map with clustering
  const updateMapData = (newNodes: NodeData[]) => {
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

      // Validate nodes data
      if (!newNodes || newNodes.length === 0) {
        console.warn('No valid nodes to display');
        return;
      }

      // Convert nodes to GeoJSON features
      const features: ClusterPoint[] = newNodes
        .filter((node) => node.longitude && node.latitude && 
                !isNaN(node.longitude) && !isNaN(node.latitude))
        .map((node) => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [node.longitude, node.latitude] as [number, number],
          },
          properties: {
            node: node.node || 'Unknown',
            sto: node.sto_l || node.sto || '-',
            witel: node.witel || '-',
            reg: node.reg || '-',
            types: node.types || '-',
            platform: node.platform || '-',
            latitude: node.latitude,
            longitude: node.longitude,
          },
        }));

      if (features.length === 0) {
        console.warn('No valid features to display');
        return;
      }

      // Add source with clustering
      map.current.addSource('nodes', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: features,
        },
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50, // Radius of each cluster when clustering points
      });

      // Add cluster circles layer
      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'nodes',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6', // Color for clusters with < 100 points
            100,
            '#f1f075', // Color for clusters with 100-750 points
            750,
            '#f28cb1', // Color for clusters with > 750 points
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20, // Radius for clusters with < 100 points
            100,
            30, // Radius for clusters with 100-750 points
            750,
            40, // Radius for clusters with > 750 points
          ],
        },
      });

      // Add cluster count labels
      map.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'nodes',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: {
          'text-color': '#ffffff',
        },
      });

      // Add unclustered points layer
      map.current.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'nodes',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#e22653',
          'circle-radius': 6,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      // Click event for clusters - zoom in
      map.current.on('click', 'clusters', async (e) => {
        const features = map.current!.queryRenderedFeatures(e.point, {
          layers: ['clusters'],
        });

        if (features.length > 0) {
          const clusterId = features[0].properties?.cluster_id;
          const source = map.current!.getSource('nodes') as maplibregl.GeoJSONSource;
          
          try {
            const zoom = await source.getClusterExpansionZoom(clusterId);
            const coordinates = (features[0].geometry as any).coordinates;
            map.current!.easeTo({
              center: coordinates,
              zoom: zoom,
            });
          } catch (err) {
            console.error('Error getting cluster expansion zoom:', err);
          }
        }
      });

      // Click event for unclustered points - show popup
      map.current.on('click', 'unclustered-point', (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const props = feature.properties;
          const coordinates = (feature.geometry as any).coordinates.slice();

          new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
              <div style="font-size: 12px;">
                <strong>${props?.node || 'Unknown'}</strong><br/>
                <strong>STO:</strong> ${props?.sto || '-'}<br/>
                <strong>Witel:</strong> ${props?.witel || '-'}<br/>
                <strong>Region:</strong> ${props?.reg || '-'}<br/>
                <strong>Type:</strong> ${props?.types || '-'}<br/>
                <strong>Platform:</strong> ${props?.platform || '-'}<br/>
                <strong>Coordinates:</strong> ${props?.latitude?.toFixed(4)}, ${props?.longitude?.toFixed(4)}
              </div>
            `)
            .addTo(map.current!);
        }
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'clusters', () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', 'clusters', () => {
        map.current!.getCanvas().style.cursor = '';
      });

      map.current.on('mouseenter', 'unclustered-point', () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', 'unclustered-point', () => {
        map.current!.getCanvas().style.cursor = '';
      });

      // Fit map to bounds
      if (features.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        features.forEach((feature) => {
          bounds.extend(feature.geometry.coordinates);
        });
        map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
      }
    } catch (error) {
      console.error('Error updating map data:', error);
      alert('Terjadi kesalahan saat memperbarui peta. Silakan coba lagi.');
    }
  };

  // Handle CSV upload
  const handleCSVUpload = async (csvContent: string) => {
    try {
      const parsedData = await parseMapData(csvContent);
      setNodes(parsedData.nodes);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert('Gagal memproses file CSV. Pastikan format file sudah benar dan memiliki kolom: node, latitude, longitude');
    }
  };

  // Update map when nodes change
  useEffect(() => {
    if (mapLoaded && nodes.length > 0) {
      updateMapData(nodes);
    }
  }, [nodes, mapLoaded]);

  return (
    <div className="maplibre-view">
      <div className="maplibre-header">
        <div className="header-left">
          <FiMapPin />
          <h2>MapLibre - Visualisasi STO Indonesia</h2>
        </div>
        <div className="header-actions">
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
        {isLoadingDefault && (
          <div className="stat-item" style={{ color: '#e22653' }}>
            Loading default data...
          </div>
        )}
      </div>

      <div ref={mapContainer} className="map-container" />

      <CSVUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleCSVUpload}
      />
    </div>
  );
};
