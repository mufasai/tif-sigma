import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../styles/maplibre-view.css';
import { CSVUploadModal } from '../components/CSVUploadModal';
import {
  parseMapData,
  generateEdgesFromNodes,
  NodeData,
  EdgeData,
} from '../utils/maplibreCSVParser';
import { FiUpload, FiX, FiMapPin } from 'react-icons/fi';

interface MapLibreViewProps {
  onClose: () => void;
}

export const MapLibreView: React.FC<MapLibreViewProps> = ({ onClose }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [edges, setEdges] = useState<EdgeData[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markers = useRef<maplibregl.Marker[]>([]);

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

  // Create arc line GeoJSON
  const createArcLine = (
    lon1: number,
    lat1: number,
    lon2: number,
    lat2: number,
    numPoints: number = 50
  ): number[][] => {
    const points: number[][] = [];
    const height = 0.5; // Arc height factor

    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const lon = lon1 + (lon2 - lon1) * t;
      const lat = lat1 + (lat2 - lat1) * t;

      // Add curvature
      const curve = Math.sin(t * Math.PI) * height;
      const adjustedLat = lat + curve;

      points.push([lon, adjustedLat]);
    }

    return points;
  };

  // Update map with nodes and edges
  const updateMapData = (newNodes: NodeData[], newEdges: EdgeData[]) => {
    if (!map.current || !mapLoaded) return;

    try {
      // Clear existing markers
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];

      // Remove existing layers and sources
      if (map.current.getLayer('edges-layer')) {
        map.current.removeLayer('edges-layer');
      }
      if (map.current.getSource('edges')) {
        map.current.removeSource('edges');
      }

      // Validate nodes data
      if (!newNodes || newNodes.length === 0) {
        console.warn('No valid nodes to display');
        return;
      }

      // Add nodes as markers
      newNodes.forEach((node) => {
        // Validate node data
        if (!node.longitude || !node.latitude || 
            isNaN(node.longitude) || isNaN(node.latitude)) {
          console.warn('Invalid node coordinates:', node);
          return;
        }

        const el = document.createElement('div');
        el.className = 'maplibre-marker';

        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div style="font-size: 12px;">
            <strong>${node.node || 'Unknown'}</strong><br/>
            <strong>STO:</strong> ${node.sto_l || node.sto || '-'}<br/>
            <strong>Witel:</strong> ${node.witel || '-'}<br/>
            <strong>Region:</strong> ${node.reg || '-'}<br/>
            <strong>Type:</strong> ${node.types || '-'}<br/>
            <strong>Platform:</strong> ${node.platform || '-'}<br/>
            <strong>Coordinates:</strong> ${node.latitude.toFixed(4)}, ${node.longitude.toFixed(4)}
          </div>
        `);

        const marker = new maplibregl.Marker(el)
          .setLngLat([node.longitude, node.latitude])
          .setPopup(popup)
          .addTo(map.current!);

        markers.current.push(marker);
      });

      // Add edges as arc lines
      if (newEdges && newEdges.length > 0) {
        const nodeMap = new Map(newNodes.map((n) => [n.node, n]));
        const features = newEdges
          .map((edge) => {
            const sourceNode = nodeMap.get(edge.source);
            const targetNode = nodeMap.get(edge.target);

            if (!sourceNode || !targetNode) return null;

            const arcPoints = createArcLine(
              sourceNode.longitude,
              sourceNode.latitude,
              targetNode.longitude,
              targetNode.latitude
            );

            return {
              type: 'Feature' as const,
              properties: {
                source: edge.source,
                target: edge.target,
                bandwidth: edge.bandwidth || 0,
              },
              geometry: {
                type: 'LineString' as const,
                coordinates: arcPoints,
              },
            };
          })
          .filter((f) => f !== null);

        if (features.length > 0) {
          map.current.addSource('edges', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: features as any,
            },
          });

          map.current.addLayer({
            id: 'edges-layer',
            type: 'line',
            source: 'edges',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#e22653',
              'line-width': 2,
              'line-opacity': 0.6,
            },
          });

          // Add hover effect for edges
          map.current.on('mouseenter', 'edges-layer', () => {
            map.current!.getCanvas().style.cursor = 'pointer';
          });

          map.current.on('mouseleave', 'edges-layer', () => {
            map.current!.getCanvas().style.cursor = '';
          });

          map.current.on('click', 'edges-layer', (e) => {
            if (e.features && e.features.length > 0) {
              const feature = e.features[0];
              const props = feature.properties;
              new maplibregl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(`
                  <div style="font-size: 12px;">
                    <strong>Connection</strong><br/>
                    <strong>From:</strong> ${props?.source}<br/>
                    <strong>To:</strong> ${props?.target}<br/>
                    <strong>Bandwidth:</strong> ${props?.bandwidth?.toFixed(2) || 0} Mbps
                  </div>
                `)
                .addTo(map.current!);
            }
          });
        }
      }

      // Fit map to bounds
      if (newNodes.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        newNodes.forEach((node) => {
          if (node.longitude && node.latitude && 
              !isNaN(node.longitude) && !isNaN(node.latitude)) {
            bounds.extend([node.longitude, node.latitude]);
          }
        });
        map.current.fitBounds(bounds, { padding: 50 });
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
      let finalEdges = parsedData.edges;

      // Generate edges if not provided (always generate for single file upload)
      if (parsedData.nodes.length > 0) {
        finalEdges = generateEdgesFromNodes(parsedData.nodes, 2);
      }

      setNodes(parsedData.nodes);
      setEdges(finalEdges);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert('Gagal memproses file CSV. Pastikan format file sudah benar dan memiliki kolom: node, latitude, longitude');
    }
  };

  // Update map when nodes or edges change
  useEffect(() => {
    if (mapLoaded && nodes.length > 0) {
      updateMapData(nodes, edges);
    }
  }, [nodes, edges, mapLoaded]);

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
        <div className="stat-item">
          <strong>Edges:</strong> {edges.length}
        </div>
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
