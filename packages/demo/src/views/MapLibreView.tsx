import { latlngToGraph } from "@sigma/layer-maplibre";
import type { FeatureCollection } from "geojson";
import Graph from "graphology";
import { SerializedGraph } from "graphology-types";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import React, { useEffect, useRef, useState } from "react";
// import { FiMapPin, FiUpload, FiX } from "react-icons/fi";
// import { useNavigate } from "react-router-dom";
import Sigma from "sigma";

import { AnalyticsPage } from "../components/AnalyticsPage";
import { CSVUploadModal } from "../components/CSVUploadModal";
import { CompactSearchBar } from "../components/CompactSearchBar";
import { DashboardPanel } from "../components/DashboardPanel";
import { DataTablePanel } from "../components/DataTablePanel";
import { DraggableNetworkHierarchy } from "../components/DraggableNetworkHierarchy";
import { LeftSidebar } from "../components/LeftSidebar";
import { Legend } from "../components/Legend";
import { LinkDetailsPanel } from "../components/LinkDetailsPanel";
import { SettingsPage } from "../components/SettingsPage";
import Toast, { ToastType } from "../components/Toast";
import { TopologyDrawer } from "../components/TopologyDrawer";
// eslint-disable-next-line import/extensions
import { kabupatenData } from "../data/kabupaten.data";
// eslint-disable-next-line import/extensions
import { loadKabupatenData } from "../services/kabupaten.service";
import "../styles/maplibre-view.css";
import { AreaConnection, NetworkElement } from "../types";
import { NodeData, parseMapData } from "../utils/maplibreCSVParser";
import { createProvinceGeoJSON, testProvinceData } from "../utils/testProvinceData";

// import { toast } from 'sonner@2.0.3';

// interface PointGeometry {
//   type: 'Point';
//   coordinates: [number, number];
// }

interface MapLibreViewProps {
  onClose?: () => void;
}

type HierarchyLevel = "national" | "regional" | "witel" | "sto";

interface NavigationPathItem {
  level: HierarchyLevel;
  name: string;
  identifier?: string;
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

export const MapLibreView: React.FC<MapLibreViewProps> = () => {
  // const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const sigmaContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const sigmaInstance = useRef<Sigma | null>(null);
  const sigmaCleanup = useRef<(() => void) | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showKabupatenLayer, setShowKabupatenLayer] = useState(true);
  const [kabupatenLoaded, setKabupatenLoaded] = useState(false);
  const [showCapacityLayer, setShowCapacityLayer] = useState(false);
  const [capacityData, setCapacityData] = useState<Record<string, string>[]>([]);
  const [showSigmaLayer, setShowSigmaLayer] = useState(false);
  const [airportsData, setAirportsData] = useState<SerializedGraph | null>(null);
  const [showSirkitLayer, setShowSirkitLayer] = useState(false);
  const [sirkitData, setSirkitData] = useState<Record<string, string>[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string>("multilayer");
  const [showMultilayerMap, setShowMultilayerMap] = useState(false);
  const [multilayerMapData, setMultilayerMapData] = useState<FeatureCollection | null>(null);
  const [showNodeEdgesLayer, setShowNodeEdgesLayer] = useState(false);
  const [nodeEdgesData, setNodeEdgesData] = useState<{ nodes: any[]; edges: any[] } | null>(null);
  const [isLayerLoading, setIsLayerLoading] = useState(false);
  // Reserved for future topology features (matching App.tsx structure)
  const [_selectedElement, _setSelectedElement] = useState<NetworkElement | null>(null);
  const [_selectedConnection, _setSelectedConnection] = useState<AreaConnection | null>(null);
  const [_showTopologyDrawer, _setShowTopologyDrawer] = useState(true);
  
  // Link and Topology drawer states
  const [showLinkDetails, setShowLinkDetails] = useState(false);
  const [selectedLink, setSelectedLink] = useState<{
    from: string;
    to: string;
    description?: string;
    bandwidth_mbps?: number;
    utilization?: number;
    latency?: number;
    packetLoss?: number;
    linkCount?: number;
    totalCapacity?: string;
    type?: string;
  } | null>(null);
  const [showTopologyDrawer, setShowTopologyDrawer] = useState(false);
  const [topologyConnection, setTopologyConnection] = useState<{ 
    from: string; 
    to: string;
    nodeData?: any;
    topology?: any[];
  } | null>(null);

  // New state for hierarchy and navigation (matching App.tsx)
  const [currentLevel, setCurrentLevel] = useState<HierarchyLevel>("national");
  const [activeMenu, setActiveMenu] = useState<string>("topology");
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>();
  const [selectedWitel, setSelectedWitel] = useState<string | undefined>();
  const [navigationPath, setNavigationPath] = useState<NavigationPathItem[]>([
    { level: "national", name: "Indonesia" },
  ]);
  const [currentZoom, setCurrentZoom] = useState(5);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("info");
  const [_searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<Array<{
    id: string;
    label: string;
    type: string;
    latitude: number;
    longitude: number;
    metadata?: Record<string, any>;
  }>>([]);
  const [platformFilters, setPlatformFilters] = useState<string[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Array<{
    id: string;
    label: string;
    type: string;
    latitude: number;
    longitude: number;
    metadata?: Record<string, any>;
  }>>([]);

  // const handleClose = () => {
  //   if (onClose) {
  //     onClose();
  //   } else {
  //     navigate("/base");
  //   }
  // };

  // Load default data from joined_data.csv
  useEffect(() => {
    const loadDefaultData = async () => {
      try {
        const response = await fetch("/joined_data.csv");
        if (!response.ok) {
          throw new Error("Failed to load default data");
        }
        const csvContent = await response.text();
        await handleCSVUpload(csvContent);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error loading default data:", error);
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
        console.log("Kabupaten data loaded successfully");
      }
    };

    loadKabupaten();
  }, []);

  // Load capacity data (using 1613 version with 'cap' column)
  useEffect(() => {
    const loadCapacityData = async () => {
      try {
        const response = await fetch("/data/cap-1.csv");
        if (!response.ok) {
          throw new Error("Failed to load capacity data");
        }
        const csvText = await response.text();
        const lines = csvText.split("\n");
        const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());

        const data = lines
          .slice(1)
          .filter((line) => line.trim())
          .map((line) => {
            const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
            const row: Record<string, string> = {};
            headers.forEach((header, index) => {
              if (values[index]) {
                row[header] = values[index].replace(/^"|"$/g, "").trim();
              }
            });
            return row;
          })
          .filter((row) => row.longitude && row.latitude);

        setCapacityData(data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error loading capacity data:", error);
      }
    };

    loadCapacityData();
  }, []);

  // Load airports data for Sigma layer
  useEffect(() => {
    const loadAirportsData = async () => {
      try {
        const response = await fetch("/data/airports.json");
        if (!response.ok) {
          throw new Error("Failed to load airports data");
        }
        const data = await response.json();
        setAirportsData(data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error loading airports data:", error);
      }
    };

    loadAirportsData();
  }, []);

  // Load sirkit data
  useEffect(() => {
    const loadSirkitData = async () => {
      try {
        const response = await fetch("/data/list_sirkit_ref_202511101614.csv");
        if (!response.ok) {
          throw new Error("Failed to load sirkit data");
        }
        const csvText = await response.text();
        const lines = csvText.split("\n");
        const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());

        const data = lines
          .slice(1)
          .filter((line) => line.trim())
          .map((line) => {
            const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
            const row: Record<string, string> = {};
            headers.forEach((header, index) => {
              if (values[index]) {
                row[header] = values[index].replace(/^"|"$/g, "").trim();
              }
            });
            return row;
          })
          .filter((row) => row.longitude && row.latitude);

        setSirkitData(data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error loading sirkit data:", error);
      }
    };

    loadSirkitData();
  }, []);

  // Load multilayer map GeoJSON data
  useEffect(() => {
    const loadMultilayerMapData = async () => {
      try {
        const response = await fetch("/data/multilayer_map.geojson");
        if (!response.ok) {
          throw new Error("Failed to load multilayer map data");
        }
        const geojson = await response.json();
        setMultilayerMapData(geojson);
        // eslint-disable-next-line no-console
        console.log("Multilayer map data loaded:", geojson);
        // Show multilayer map by default after loading
        setTimeout(() => {
          setShowMultilayerMap(true);
        }, 1000);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error loading multilayer map data:", error);
      }
    };

    loadMultilayerMapData();
  }, []);

  // Load node edges data from json_sigma.json
  useEffect(() => {
    const loadMultiNodeEdges = async () => {
      try {
        const response = await fetch("/sigma-topology.json");
        if (!response.ok) {
          throw new Error("Failed to load node edges data");
        }
        const data = await response.json();
        setNodeEdgesData(data);
        // eslint-disable-next-line no-console
        console.log("Node edges data loaded:", data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error loading node edges data:", error);
      }
    };

    loadMultiNodeEdges();
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
            "osm-tiles": {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            },
          },
          layers: [
            {
              id: "osm-tiles-layer",
              type: "raster",
              source: "osm-tiles",
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center: [117.4, -0.8], // Center of Indonesia
        zoom: 5,
      });

      map.current.addControl(new maplibregl.NavigationControl(), "top-right");
      map.current.addControl(new maplibregl.FullscreenControl(), "top-right");

      map.current.on("load", () => {
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
      const layersToRemove = ["clusters", "cluster-count", "unclustered-point"];
      layersToRemove.forEach((layerId) => {
        if (map.current!.getLayer(layerId)) {
          map.current!.removeLayer(layerId);
        }
      });

      if (map.current.getSource("nodes")) {
        map.current.removeSource("nodes");
      }

      // Markers are now hidden - no layers will be added
    } catch (_) {
      alert("Terjadi kesalahan saat memperbarui peta. Silakan coba lagi.");
    }
  };

  // Handle CSV upload
  const handleCSVUpload = async (csvContent: string) => {
    try {
      const parsedData = await parseMapData(csvContent);
      setNodes(parsedData.nodes);
    } catch (_) {
      alert("Gagal memproses file CSV. Pastikan format file sudah benar dan memiliki kolom: node, latitude, longitude");
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
      map.current.addSource("provinces", {
        type: "geojson",
        data: geojson,
      });

      // Add click handler
      map.current.on("click", "provinces-fill", (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const props = feature.properties;
          const coordinates = e.lngLat;

          new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(
              `
              <div style="font-size: 12px; padding: 8px;">
                <strong style="font-size: 14px;">${props?.name || "Unknown"}</strong><br/>
                <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;"/>
                <strong>Population:</strong> ${(props?.population || 0).toLocaleString()}<br/>
                <strong>Area Size:</strong> ${props?.areaSize || "-"}<br/>
                <strong>BTS Count:</strong> ${props?.btsCount || 0}<br/>
                <strong>Coverage:</strong> ${props?.coverage || "-"}
              </div>
            `,
            )
            .addTo(map.current!);
        }
      });

      // Add hover handler
      map.current.on("mouseenter", "provinces-fill", (e) => {
        if (e.features && e.features.length > 0) {
          map.current!.setFilter("provinces-hover", ["==", "id", e.features[0].properties?.id]);
          map.current!.getCanvas().style.cursor = "pointer";
        }
      });

      map.current.on("mouseleave", "provinces-fill", () => {
        map.current!.setFilter("provinces-hover", ["==", "id", ""]);
        map.current!.getCanvas().style.cursor = "";
      });

      // Zoom to show all provinces (Indonesia)
      map.current.flyTo({
        center: [118.0, -2.0], // Center of Indonesia
        zoom: 4.5,
        duration: 2000,
      });
    } catch (error) {
      alert(`Error adding province layer: ${error}`);
    }
  };

  // Generate random color
  const generateRandomColor = () => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E2",
      "#F8B739",
      "#52BE80",
      "#EC7063",
      "#AF7AC5",
      "#5DADE2",
      "#48C9B0",
      "#F4D03F",
      "#EB984E",
      "#DC7633",
      "#CA6F1E",
      "#BA4A00",
      "#A04000",
      "#7D3C98",
      "#6C3483",
      "#5B2C6F",
      "#4A235A",
      "#76448A",
      "#633974",
      "#1ABC9C",
      "#16A085",
      "#138D75",
      "#117A65",
      "#0E6655",
      "#0B5345",
      "#186A3B",
      "#E74C3C",
      "#C0392B",
      "#8E44AD",
      "#9B59B6",
      "#2980B9",
      "#3498DB",
      "#1ABC9C",
      "#16A085",
      "#27AE60",
      "#2ECC71",
      "#F39C12",
      "#E67E22",
      "#D35400",
      "#E74C3C",
      "#C0392B",
      "#ECF0F1",
      "#BDC3C7",
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
        type: "Feature" as const,
        properties: {
          id: kabupaten.id,
          name: kabupaten.name,
          provinsi: kabupaten.provinsi,
          type: kabupaten.type,
          population: kabupaten.statistics.population,
          areaSize: kabupaten.statistics.areaSize,
          btsCount: kabupaten.statistics.btsCount,
          coverage: kabupaten.statistics.coverage,
          color: generateRandomColor(), // Add random color for each kabupaten
        },
        geometry: kabupaten.coordinates,
      }));

      // Remove existing kabupaten layers if they exist
      if (map.current.getLayer("kabupaten-fill")) {
        map.current.removeLayer("kabupaten-fill");
      }
      if (map.current.getLayer("kabupaten-outline")) {
        map.current.removeLayer("kabupaten-outline");
      }
      if (map.current.getLayer("kabupaten-hover")) {
        map.current.removeLayer("kabupaten-hover");
      }
      if (map.current.getSource("kabupaten")) {
        map.current.removeSource("kabupaten");
      }

      // Add source
      map.current.addSource("kabupaten", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: features,
        },
      });

      // Add fill layer with random colors
      map.current.addLayer({
        id: "kabupaten-fill",
        type: "fill",
        source: "kabupaten",
        paint: {
          "fill-color": ["get", "color"], // Use color from properties
          "fill-opacity": 0.5,
        },
      });

      // Add outline layer
      map.current.addLayer({
        id: "kabupaten-outline",
        type: "line",
        source: "kabupaten",
        paint: {
          "line-color": "#FFFFFF",
          "line-width": 1.5,
        },
      });

      // Add hover effect
      map.current.addLayer({
        id: "kabupaten-hover",
        type: "fill",
        source: "kabupaten",
        paint: {
          "fill-color": ["get", "color"], // Use same color but darker
          "fill-opacity": 0.7,
        },
        filter: ["==", "id", ""],
      });

      // Add click handler
      map.current.on("click", "kabupaten-fill", (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const props = feature.properties;
          const coordinates = e.lngLat;

          new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(
              `
              <div style="font-size: 12px; padding: 8px;">
                <strong style="font-size: 14px;">${props?.type || ""} ${props?.name || "Unknown"}</strong><br/>
                <strong>Provinsi:</strong> ${props?.provinsi || "-"}<br/>
                <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;"/>
                <strong>Population:</strong> ${(props?.population || 0).toLocaleString()}<br/>
                <strong>Area Size:</strong> ${props?.areaSize || "-"}<br/>
                <strong>BTS Count:</strong> ${props?.btsCount || 0}<br/>
                <strong>Coverage:</strong> ${props?.coverage || "-"}
              </div>
            `,
            )
            .addTo(map.current!);
        }
      });

      // Add hover handler
      map.current.on("mouseenter", "kabupaten-fill", (e) => {
        if (e.features && e.features.length > 0) {
          map.current!.setFilter("kabupaten-hover", ["==", "id", e.features[0].properties?.id]);
          map.current!.getCanvas().style.cursor = "pointer";
        }
      });

      map.current.on("mouseleave", "kabupaten-fill", () => {
        map.current!.setFilter("kabupaten-hover", ["==", "id", ""]);
        map.current!.getCanvas().style.cursor = "";
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

    if (newVisibility && !map.current.getLayer("kabupaten-fill")) {
      // Add layer if it doesn't exist
      addKabupatenLayer();
    } else {
      // Toggle visibility
      const visibility = newVisibility ? "visible" : "none";

      if (map.current.getLayer("kabupaten-fill")) {
        map.current.setLayoutProperty("kabupaten-fill", "visibility", visibility);
      }
      if (map.current.getLayer("kabupaten-outline")) {
        map.current.setLayoutProperty("kabupaten-outline", "visibility", visibility);
      }
      if (map.current.getLayer("kabupaten-hover")) {
        map.current.setLayoutProperty("kabupaten-hover", "visibility", visibility);
      }
    }
  };

  // Parse WKT POLYGON to GeoJSON coordinates
  const parseWKTPolygon = (wkt: string) => {
    try {
      // Remove "POLYGON ((" and "))" and split by coordinates
      const coordsString = wkt
        .replace(/^POLYGON\s*\(\(/i, "")
        .replace(/\)\)$/, "")
        .trim();

      const coords = coordsString.split(",").map((pair) => {
        const [lng, lat] = pair.trim().split(/\s+/);
        return [parseFloat(lng), parseFloat(lat)];
      });

      return {
        type: "Polygon" as const,
        coordinates: [coords],
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
      if (map.current.getLayer("capacity-points")) {
        map.current.removeLayer("capacity-points");
      }
      if (map.current.getLayer("capacity-lines")) {
        map.current.removeLayer("capacity-lines");
      }
      if (map.current.getLayer("capacity-lines-glow")) {
        map.current.removeLayer("capacity-lines-glow");
      }
      if (map.current.getLayer("capacity-boundaries-fill")) {
        map.current.removeLayer("capacity-boundaries-fill");
      }
      if (map.current.getLayer("capacity-boundaries-outline")) {
        map.current.removeLayer("capacity-boundaries-outline");
      }
      if (map.current.getLayer("capacity-boundaries-hover")) {
        map.current.removeLayer("capacity-boundaries-hover");
      }
      if (map.current.getSource("capacity")) {
        map.current.removeSource("capacity");
      }
      if (map.current.getSource("capacity-lines")) {
        map.current.removeSource("capacity-lines");
      }
      if (map.current.getSource("capacity-boundaries")) {
        map.current.removeSource("capacity-boundaries");
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
            type: "Feature" as const,
            properties: {
              id: item.code_area || item.sto,
              name: item.name_area || item.sto_l || "N/A",
              type: item.type_area || "STO",
              sto: item.sto || "N/A",
              witel: item.witel || "N/A",
              reg: item.reg || "N/A",
              color: generateRandomColor(),
            },
            geometry,
          };
        })
        .filter((f) => f !== null);

      // Add boundary source and layers
      if (boundaryFeatures.length > 0) {
        map.current.addSource("capacity-boundaries", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: boundaryFeatures,
          },
        });

        // Add fill layer
        map.current.addLayer({
          id: "capacity-boundaries-fill",
          type: "fill",
          source: "capacity-boundaries",
          paint: {
            "fill-color": ["get", "color"],
            "fill-opacity": 0.4,
          },
        });

        // Add outline layer
        map.current.addLayer({
          id: "capacity-boundaries-outline",
          type: "line",
          source: "capacity-boundaries",
          paint: {
            "line-color": "#FF6B35",
            "line-width": 2,
          },
        });

        // Add hover effect
        map.current.addLayer({
          id: "capacity-boundaries-hover",
          type: "fill",
          source: "capacity-boundaries",
          paint: {
            "fill-color": ["get", "color"],
            "fill-opacity": 0.6,
          },
          filter: ["==", "id", ""],
        });

        // Add click handler for boundaries
        map.current.on("click", "capacity-boundaries-fill", (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            const props = feature.properties;
            const coordinates = e.lngLat;

            // Count equipment in this STO
            const equipmentCount = capacityData.filter((item) => (item.code_area || item.sto) === props?.id).length;

            new maplibregl.Popup()
              .setLngLat(coordinates)
              .setHTML(
                `
                <div style="font-size: 12px; padding: 8px;">
                  <strong style="font-size: 14px; color: #FF6B35;">${props?.type || ""} ${props?.name || "Unknown"}</strong><br/>
                  <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;"/>
                  <strong>STO:</strong> ${props?.sto || "-"}<br/>
                  <strong>Witel:</strong> ${props?.witel || "-"}<br/>
                  <strong>Region:</strong> ${props?.reg || "-"}<br/>
                  <strong>Equipment Count:</strong> ${equipmentCount}<br/>
                </div>
              `,
              )
              .addTo(map.current!);
          }
        });

        // Add hover handler for boundaries
        map.current.on("mouseenter", "capacity-boundaries-fill", (e) => {
          if (e.features && e.features.length > 0) {
            map.current!.setFilter("capacity-boundaries-hover", ["==", "id", e.features[0].properties?.id]);
            map.current!.getCanvas().style.cursor = "pointer";
          }
        });

        map.current.on("mouseleave", "capacity-boundaries-fill", () => {
          map.current!.setFilter("capacity-boundaries-hover", ["==", "id", ""]);
          map.current!.getCanvas().style.cursor = "";
        });
      }

      // Get all coordinates FIRST
      const allCoordinates = capacityData.map((item) => ({
        coords: [parseFloat(item.longitude), parseFloat(item.latitude)] as [number, number],
        hostname: item.hostname || "N/A",
        sto: item.sto || "N/A",
        witel: item.witel || "N/A",
      }));

      // Group points by STO for better connectivity
      const pointsBySTO = new Map<string, typeof allCoordinates>();
      allCoordinates.forEach((point) => {
        const stoKey = point.sto;
        if (!pointsBySTO.has(stoKey)) {
          pointsBySTO.set(stoKey, []);
        }
        pointsBySTO.get(stoKey)!.push(point);
      });

      // Create connecting lines between ALL points
      const lineFeatures: Array<{
        type: "Feature";
        properties: { from: string; to: string; sto: string };
        geometry: { type: "LineString"; coordinates: Array<[number, number]> };
      }> = [];

      // Track which connections we've already made to avoid duplicates
      const connectionSet = new Set<string>();

      // Strategy 1: Connect points within the same STO
      pointsBySTO.forEach((points, sto) => {
        if (points.length > 1) {
          // Sort points by longitude to create a logical path
          const sortedPoints = [...points].sort((a, b) => a.coords[0] - b.coords[0]);

          // Connect consecutive points in the sorted order
          for (let i = 0; i < sortedPoints.length - 1; i++) {
            const point1 = sortedPoints[i];
            const point2 = sortedPoints[i + 1];
            const connectionKey = [point1.hostname, point2.hostname].sort().join("|");

            if (!connectionSet.has(connectionKey)) {
              connectionSet.add(connectionKey);
              lineFeatures.push({
                type: "Feature" as const,
                properties: {
                  from: point1.hostname,
                  to: point2.hostname,
                  sto: sto,
                },
                geometry: {
                  type: "LineString" as const,
                  coordinates: [point1.coords, point2.coords],
                },
              });
            }
          }
        }
      });

      // Strategy 2: Connect each point to its 2-3 nearest neighbors (regardless of STO)
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
          .filter((d) => d !== null)
          .sort((a, b) => a!.distance - b!.distance);

        // Connect to 3 nearest neighbors
        const neighborsToConnect = Math.min(3, distances.length);
        for (let i = 0; i < neighborsToConnect; i++) {
          const neighbor = distances[i];
          if (neighbor) {
            const connectionKey = [point.hostname, neighbor.point.hostname].sort().join("|");

            if (!connectionSet.has(connectionKey)) {
              connectionSet.add(connectionKey);
              lineFeatures.push({
                type: "Feature" as const,
                properties: {
                  from: point.hostname,
                  to: neighbor.point.hostname,
                  sto: point.sto === neighbor.point.sto ? point.sto : "cross-sto",
                },
                geometry: {
                  type: "LineString" as const,
                  coordinates: [point.coords, neighbor.point.coords],
                },
              });
            }
          }
        }
      });

      // Create GeoJSON features for capacity points
      const pointFeatures = capacityData.map((item) => ({
        type: "Feature" as const,
        properties: {
          hostname: item.hostname || "N/A",
          manufacture: item.manufacture || "N/A",
          version: item.version || "N/A",
          sto: item.sto || "N/A",
          sto_l: item.sto_l || "N/A",
          witel: item.witel || "N/A",
          reg: item.reg || "N/A",
          tipe_card: item.tipe_card || "N/A",
          cap: item.cap || "N/A",
          port_used: item.port_used || "0",
          port_idle: item.port_idle || "0",
          platform: item.platform || "N/A",
        },
        geometry: {
          type: "Point" as const,
          coordinates: [parseFloat(item.longitude), parseFloat(item.latitude)],
        },
      }));

      // eslint-disable-next-line no-console
      console.log(`Created ${lineFeatures.length} line connections`);

      // if (lineFeatures.length > 0) {
      //   // Validate line features
      //   const validLineFeatures = lineFeatures.filter((feature) => {
      //     const coords = feature.geometry.coordinates;
      //     const isValid =
      //       coords.length === 2 &&
      //       coords.every(
      //         (coord) =>
      //           Array.isArray(coord) &&
      //           coord.length === 2 &&
      //           !isNaN(coord[0]) &&
      //           !isNaN(coord[1]) &&
      //           Math.abs(coord[0]) <= 180 &&
      //           Math.abs(coord[1]) <= 90,
      //       );
      //     if (!isValid) {
      //       // eslint-disable-next-line no-console
      //       console.warn("Invalid line feature:", feature);
      //     }
      //     return isValid;
      //   });

      //   // eslint-disable-next-line no-console
      //   console.log(`Valid line features: ${validLineFeatures.length}`);

      //   map.current.addSource("capacity-lines", {
      //     type: "geojson",
      //     data: {
      //       type: "FeatureCollection",
      //       features: validLineFeatures,
      //     },
      //   });

      //   // Add glow effect layer FIRST (bottom layer)
      //   map.current.addLayer({
      //     id: "capacity-lines-glow",
      //     type: "line",
      //     source: "capacity-lines",
      //     paint: {
      //       "line-color": [
      //         "case",
      //         ["==", ["get", "sto"], "cross-sto"],
      //         "#FFD700", // Gold for cross-STO connections
      //         "#FF6B35", // Orange for same-STO connections
      //       ],
      //       "line-width": 6,
      //       "line-opacity": 0.3,
      //       "line-blur": 3,
      //     },
      //   });

      //   // Add main line layer on top of glow
      //   map.current.addLayer({
      //     id: "capacity-lines",
      //     type: "line",
      //     source: "capacity-lines",
      //     paint: {
      //       "line-color": [
      //         "case",
      //         ["==", ["get", "sto"], "cross-sto"],
      //         "#FFA500", // Orange for cross-STO connections
      //         "#FF0000", // Red for same-STO connections
      //       ],
      //       "line-width": 2,
      //       "line-opacity": 0.8,
      //     },
      //   });
      // }

      // Add points source AFTER lines
      map.current.addSource("capacity", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: pointFeatures,
        },
      });

      // Add circle layer for capacity points (smaller size) - on top of lines
      map.current.addLayer({
        id: "capacity-points",
        type: "circle",
        source: "capacity",
        paint: {
          "circle-radius": 3, // Reduced from 10 to 6
          "circle-color": "#FF6B35",
          "circle-stroke-width": 1, // Reduced from 3 to 2
          "circle-stroke-color": "#FFFFFF",
          "circle-opacity": 0.9,
        },
      });

      // Add click handler for points - Show popup with details and TopologyDrawer
      map.current.on("click", "capacity-points", (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const props = feature.properties;
          const coordinates = e.lngLat;

          // Show popup with node details
          new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(
              `
              <div style="font-size: 12px; padding: 8px; max-width: 280px;">
                <strong style="font-size: 14px; color: #FF6B35;">📡 ${props?.hostname || "Node"}</strong><br/>
                <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;"/>
                <div style="display: grid; grid-template-columns: auto 1fr; gap: 4px 8px;">
                  <strong>Manufacture:</strong> <span>${props?.manufacture || "N/A"}</span>
                  <strong>Version:</strong> <span>${props?.version || "N/A"}</span>
                  <strong>Platform:</strong> <span>${props?.platform || "N/A"}</span>
                  <strong>STO:</strong> <span>${props?.sto_l || props?.sto || "N/A"}</span>
                  <strong>Witel:</strong> <span>${props?.witel || "N/A"}</span>
                  <strong>Region:</strong> <span>${props?.reg || "N/A"}</span> 
                  <strong>Capacity:</strong> <span>${props?.cap || "N/A"}</span>
                  <strong>Port Used:</strong> <span style="color: #E74C3C;">${props?.port_used || "0"}</span>
                  <strong>Port Idle:</strong> <span style="color: #2ECC71;">${props?.port_idle || "0"}</span>
                </div>
              </div>
            `,
            )
            .addTo(map.current!);

          // Show topology drawer for the node
          const hostname = props?.hostname || "Node";
          setTopologyConnection({ from: hostname, to: "Network" });
          // setShowTopologyDrawer(true);
        }
      });

      // Add click handler for capacity lines - Show LinkDetailsPanel and TopologyDrawer
      map.current.on("click", "capacity-lines", (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const props = feature.properties;

          const from = props?.from || "Node A";
          const to = props?.to || "Node B";

          // Set link details for LinkDetailsPanel
          setSelectedLink({
            from,
            to,
            description: `${from} → ${to}`,
            bandwidth_mbps: 10000, // 10G default
            utilization: 70 + Math.random() * 20,
            latency: 5 + Math.random() * 10,
            packetLoss: Math.random() * 0.1,
            linkCount: 2,
            totalCapacity: "10G",
            type: "L2_AGGREGATION",
          });
          setShowLinkDetails(true);

          // Set topology connection for TopologyDrawer
          setTopologyConnection({ from, to });
          setShowTopologyDrawer(true);
        }
      });

      // Add hover handler for points
      map.current.on("mouseenter", "capacity-points", () => {
        map.current!.getCanvas().style.cursor = "pointer";
      });

      map.current.on("mouseleave", "capacity-points", () => {
        map.current!.getCanvas().style.cursor = "";
      });

      // Calculate bounds of all points to ensure they're in viewport
      if (allCoordinates.length > 0) {
        const lngs = allCoordinates.map((c) => c.coords[0]);
        const lats = allCoordinates.map((c) => c.coords[1]);
        const bounds = {
          minLng: Math.min(...lngs),
          maxLng: Math.max(...lngs),
          minLat: Math.min(...lats),
          maxLat: Math.max(...lats),
        };

        // Fit map to show all points and lines
        map.current.fitBounds(
          [
            [bounds.minLng, bounds.minLat],
            [bounds.maxLng, bounds.maxLat],
          ],
          {
            padding: 50,
            duration: 1000,
          },
        );
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

    if (newVisibility && !map.current.getLayer("capacity-points")) {
      // Add layer if it doesn't exist
      addCapacityLayer();
    } else {
      // Toggle visibility
      const visibility = newVisibility ? "visible" : "none";

      if (map.current.getLayer("capacity-points")) {
        map.current.setLayoutProperty("capacity-points", "visibility", visibility);
      }
      if (map.current.getLayer("capacity-lines")) {
        map.current.setLayoutProperty("capacity-lines", "visibility", visibility);
      }
      if (map.current.getLayer("capacity-lines-glow")) {
        map.current.setLayoutProperty("capacity-lines-glow", "visibility", visibility);
      }
      if (map.current.getLayer("capacity-boundaries-fill")) {
        map.current.setLayoutProperty("capacity-boundaries-fill", "visibility", visibility);
      }
      if (map.current.getLayer("capacity-boundaries-outline")) {
        map.current.setLayoutProperty("capacity-boundaries-outline", "visibility", visibility);
      }
      if (map.current.getLayer("capacity-boundaries-hover")) {
        map.current.setLayoutProperty("capacity-boundaries-hover", "visibility", visibility);
      }
    }
  };

  // Add sirkit layer function with boundaries
  const addSirkitLayer = () => {
    if (!map.current || sirkitData.length === 0) {
      return;
    }

    try {
      // Remove existing sirkit layers if they exist
      const layersToRemove = [
        "sirkit-points",
        "sirkit-boundaries-fill",
        "sirkit-boundaries-outline",
        "sirkit-boundaries-hover",
      ];
      layersToRemove.forEach((layerId) => {
        if (map.current!.getLayer(layerId)) {
          map.current!.removeLayer(layerId);
        }
      });

      if (map.current.getSource("sirkit")) {
        map.current.removeSource("sirkit");
      }
      if (map.current.getSource("sirkit-boundaries")) {
        map.current.removeSource("sirkit-boundaries");
      }

      // Group data by STO to get unique boundaries
      const boundaryMap = new Map<string, Record<string, string>>();
      sirkitData.forEach((item) => {
        const stoKey = item.sto || "unknown";
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
            type: "Feature" as const,
            properties: {
              id: item.sto || "unknown",
              name: item.sto_l || item.sto || "N/A",
              witel: item.witel || "N/A",
              reg: item.reg || "N/A",
              types: item.types || "N/A",
              platform: item.platform || "N/A",
              color: generateRandomColor(),
            },
            geometry,
          };
        })
        .filter((f) => f !== null);

      // Add boundary source and layers
      if (boundaryFeatures.length > 0) {
        map.current.addSource("sirkit-boundaries", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: boundaryFeatures,
          },
        });

        // Add fill layer
        map.current.addLayer({
          id: "sirkit-boundaries-fill",
          type: "fill",
          source: "sirkit-boundaries",
          paint: {
            "fill-color": ["get", "color"],
            "fill-opacity": 0.3,
          },
        });

        // Add outline layer
        map.current.addLayer({
          id: "sirkit-boundaries-outline",
          type: "line",
          source: "sirkit-boundaries",
          paint: {
            "line-color": "#4ECDC4",
            "line-width": 2,
          },
        });

        // Add hover effect
        map.current.addLayer({
          id: "sirkit-boundaries-hover",
          type: "fill",
          source: "sirkit-boundaries",
          paint: {
            "fill-color": ["get", "color"],
            "fill-opacity": 0.5,
          },
          filter: ["==", "id", ""],
        });

        // Add click handler for boundaries
        map.current.on("click", "sirkit-boundaries-fill", (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            const props = feature.properties;
            const coordinates = e.lngLat;

            // Count circuits in this STO
            const circuitCount = sirkitData.filter((item) => item.sto === props?.id).length;

            new maplibregl.Popup()
              .setLngLat(coordinates)
              .setHTML(
                `
                <div style="font-size: 12px; padding: 8px;">
                  <strong style="font-size: 14px; color: #4ECDC4;">STO ${props?.name || "Unknown"}</strong><br/>
                  <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;"/>
                  <strong>Witel:</strong> ${props?.witel || "-"}<br/>
                  <strong>Region:</strong> ${props?.reg || "-"}<br/>
                  <strong>Type:</strong> ${props?.types || "-"}<br/>
                  <strong>Platform:</strong> ${props?.platform || "-"}<br/>
                  <strong>Circuit Count:</strong> ${circuitCount}<br/>
                </div>
              `,
              )
              .addTo(map.current!);
          }
        });

        // Add hover handler for boundaries
        map.current.on("mouseenter", "sirkit-boundaries-fill", (e) => {
          if (e.features && e.features.length > 0) {
            map.current!.setFilter("sirkit-boundaries-hover", ["==", "id", e.features[0].properties?.id]);
            map.current!.getCanvas().style.cursor = "pointer";
          }
        });

        map.current.on("mouseleave", "sirkit-boundaries-fill", () => {
          map.current!.setFilter("sirkit-boundaries-hover", ["==", "id", ""]);
          map.current!.getCanvas().style.cursor = "";
        });
      }

      // Create GeoJSON features for sirkit points
      const pointFeatures = sirkitData.map((item) => ({
        type: "Feature" as const,
        properties: {
          node: item.node || "N/A",
          sto: item.sto || "N/A",
          sto_l: item.sto_l || "N/A",
          witel: item.witel || "N/A",
          reg: item.reg || "N/A",
          types: item.types || "N/A",
          platform: item.platform || "N/A",
          sap_descp: item.sap_descp || "N/A",
          ipadd_v4: item.ipadd_v4 || "N/A",
          me_akses: item.me_akses || "N/A",
          oltname: item.oltname || "N/A",
          manufacture: item.manufacture || "N/A",
        },
        geometry: {
          type: "Point" as const,
          coordinates: [parseFloat(item.longitude), parseFloat(item.latitude)],
        },
      }));

      // Add points source
      map.current.addSource("sirkit", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: pointFeatures,
        },
      });

      // Add circle layer for sirkit points
      map.current.addLayer({
        id: "sirkit-points",
        type: "circle",
        source: "sirkit",
        paint: {
          "circle-radius": 8,
          "circle-color": "#4ECDC4",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#FFFFFF",
          "circle-opacity": 0.9,
        },
      });

      // Add click handler for points - Show TopologyDrawer
      map.current.on("click", "sirkit-points", (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const props = feature.properties;

          // Show topology drawer for the node
          const hostname = props?.node || props?.hostname || "Node";
          setTopologyConnection({ from: hostname, to: "Network" });
          setShowTopologyDrawer(true);
        }
      });

      // Add hover handler for points
      map.current.on("mouseenter", "sirkit-points", () => {
        map.current!.getCanvas().style.cursor = "pointer";
      });

      map.current.on("mouseleave", "sirkit-points", () => {
        map.current!.getCanvas().style.cursor = "";
      });
    } catch (_error) {
      alert(`Error adding sirkit layer: ${_error}`);
    }
  };

  // Toggle sirkit layer visibility
  const toggleSirkitLayer = () => {
    if (!map.current) return;

    const newVisibility = !showSirkitLayer;
    setShowSirkitLayer(newVisibility);

    if (newVisibility && !map.current.getLayer("sirkit-points")) {
      // Add layer if it doesn't exist
      addSirkitLayer();
    } else {
      // Toggle visibility
      const visibility = newVisibility ? "visible" : "none";

      if (map.current.getLayer("sirkit-points")) {
        map.current.setLayoutProperty("sirkit-points", "visibility", visibility);
      }
      if (map.current.getLayer("sirkit-boundaries-fill")) {
        map.current.setLayoutProperty("sirkit-boundaries-fill", "visibility", visibility);
      }
      if (map.current.getLayer("sirkit-boundaries-outline")) {
        map.current.setLayoutProperty("sirkit-boundaries-outline", "visibility", visibility);
      }
      if (map.current.getLayer("sirkit-boundaries-hover")) {
        map.current.setLayoutProperty("sirkit-boundaries-hover", "visibility", visibility);
      }
    }
  };

  // Add multilayer map function
  const addMultilayerMapLayer = () => {
    if (!map.current || !multilayerMapData) {
      return;
    }

    try {
      // Remove existing layers if they exist
      const layersToRemove = [
        "multilayer-points",
        "multilayer-polygons-fill",
        "multilayer-polygons-outline",
        "multilayer-polygons-hover",
        "multilayer-lines",
        "multilayer-lines-glow",
      ];
      layersToRemove.forEach((layerId) => {
        if (map.current!.getLayer(layerId)) {
          map.current!.removeLayer(layerId);
        }
      });

      if (map.current.getSource("multilayer-map")) {
        map.current.removeSource("multilayer-map");
      }

      // Add source with all features
      map.current.addSource("multilayer-map", {
        type: "geojson",
        data: multilayerMapData,
      });

      // Add polygon fill layer (bottom layer)
      map.current.addLayer({
        id: "multilayer-polygons-fill",
        type: "fill",
        source: "multilayer-map",
        filter: ["==", ["geometry-type"], "Polygon"],
        paint: {
          "fill-color": "#9B59B6",
          "fill-opacity": 0.4,
        },
      });

      // Add polygon outline layer
      map.current.addLayer({
        id: "multilayer-polygons-outline",
        type: "line",
        source: "multilayer-map",
        filter: ["==", ["geometry-type"], "Polygon"],
        paint: {
          "line-color": "#8E44AD",
          "line-width": 2,
        },
      });

      // Add line glow layer with status-based colors
      map.current.addLayer({
        id: "multilayer-lines-glow",
        type: "line",
        source: "multilayer-map",
        filter: ["==", ["geometry-type"], "LineString"],
        paint: {
          "line-color": [
            "match",
            ["get", "status"],
            "good",
            "#2ECC71",
            "medium",
            "#F39C12",
            "low",
            "#E74C3C",
            "#3498DB", // default color
          ],
          "line-width": 10,
          "line-opacity": 0.3,
          "line-blur": 6,
        },
      });

      // Add line layer with status-based colors
      map.current.addLayer({
        id: "multilayer-lines",
        type: "line",
        source: "multilayer-map",
        filter: ["==", ["geometry-type"], "LineString"],
        paint: {
          "line-color": [
            "match",
            ["get", "status"],
            "good",
            "#2ECC71",
            "medium",
            "#F39C12",
            "low",
            "#E74C3C",
            "#2980B9", // default color
          ],
          "line-width": 4,
          "line-opacity": 0.8,
        },
      });

      // Add points layer with vendor-based colors (TOP LAYER)
      map.current.addLayer({
        id: "multilayer-points",
        type: "circle",
        source: "multilayer-map",
        filter: ["==", ["geometry-type"], "Point"],
        paint: {
          "circle-radius": 10,
          "circle-color": [
            "match",
            ["get", "vendor"],
            "Cisco",
            "#1BA1E2",
            "Huawei",
            "#E74C3C",
            "Nokia",
            "#27AE60",
            "#999999", // default color
          ],
          "circle-stroke-width": 3,
          "circle-stroke-color": "#FFFFFF",
          "circle-opacity": 0.9,
        },
      });

      // Add polygon hover effect (must be after points to be on top)
      // map.current.addLayer({
      //   id: 'multilayer-polygons-hover',
      //   type: 'fill',
      //   source: 'multilayer-map',
      //   filter: ['all', ['==', ['geometry-type'], 'Polygon'], ['==', ['get', 'hostname'], '']],
      //   paint: {
      //     'fill-color': '#9B59B6',
      //     'fill-opacity': 0.7
      //   }
      // });

      // Add click handler for polygons
      map.current.on("click", "multilayer-polygons-fill", (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const props = feature.properties;
          const coordinates = e.lngLat;

          new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(
              `
              <div style="font-size: 12px; padding: 8px;">
                <strong style="font-size: 14px; color: #9B59B6;">Polygon Area</strong><br/>
                <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;"/>
                <strong>Hostname:</strong> ${props?.hostname || "N/A"}<br/>
                <strong>Witel:</strong> ${props?.witel || "N/A"}<br/>
                <strong>Type Area:</strong> ${props?.type_area || "N/A"}
              </div>
            `,
            )
            .addTo(map.current!);
        }
      });

      // Add click handler for points - Show popup and TopologyDrawer
      // map.current.on("click", "multilayer-points", (e) => {
      //   if (e.features && e.features.length > 0) {
      //     const feature = e.features[0];
      //     const props = feature.properties;
      //     const coordinates = e.lngLat;

      //     // Parse topology data if it exists
      //     let topologyData: any[] | undefined;
      //     try {
      //       if (props?.topology) {
      //         const parsed = typeof props.topology === 'string' 
      //           ? JSON.parse(props.topology) 
      //           : props.topology;
      //         topologyData = Array.isArray(parsed) ? parsed : undefined;
      //       }
      //     } catch (error) {
      //       console.error('Error parsing topology data:', error);
      //     }

      //     // Show popup with all node data except topology
      //     const topologyCount = topologyData ? topologyData.length : 0;
      //     const topologyInfo = topologyCount > 0
      //       ? `<div style="margin-top: 8px; padding: 6px; background: rgba(147, 51, 234, 0.1); border-radius: 4px; font-size: 11px; color: #9333ea;">
      //           <strong>Topology:</strong> ${topologyCount} connections available
      //         </div>` 
      //       : '';

      //     new maplibregl.Popup()
      //       .setLngLat(coordinates)
      //       .setHTML(
      //         `
      //         <div style="font-size: 12px; padding: 8px; max-width: 320px;">
      //           <strong style="font-size: 14px; color: #9333ea;">📡 ${props?.hostname || props?.label || "Node"}</strong><br/>
      //           <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;"/>
      //           <div style="display: grid; grid-template-columns: auto 1fr; gap: 4px 8px;">
      //             <strong>IDSSS:</strong> <span>${props?.id || "N/A"}</span>
      //             <strong>Label:</strong> <span>${props?.label || "N/A"}</span>
      //             <strong>Manufacture:</strong> <span>${props?.manufacture || "N/A"}</span>
      //             <strong>Platform:</strong> <span>${props?.platform || "N/A"}</span>
      //             <strong>Version:</strong> <span>${props?.version || "N/A"}</span>
      //             <strong>Region:</strong> <span>${props?.reg || "N/A"}</span>
      //             <strong>Witel:</strong> <span>${props?.witel || "N/A"}</span>
      //             <strong>STO:</strong> <span>${props?.sto_l || "N/A"}</span>
      //             <strong>Size:</strong> <span>${props?.size || "N/A"}</span>
      //             <strong>Coordinates:</strong> <span>${props?.x || "N/A"}, ${props?.y || "N/A"}</span>
      //           </div>
      //           ${topologyInfo}
      //         </div>
      //       `,
      //       )
      //       .addTo(map.current!);

      //     // Show topology drawer for the node with topology data
      //     const hostname = props?.hostname || props?.label || "Node";
      //     setTopologyConnection({ 
      //       from: hostname, 
      //       to: "Network",
      //       nodeData: props,
      //       topology: topologyData || undefined
      //     });
      //     setShowTopologyDrawer(true);
      //   }
      // });

      // Add hover handlers
      map.current.on("mouseenter", "multilayer-polygons-fill", (e) => {
        if (e.features && e.features.length > 0) {
          map.current!.setFilter("multilayer-polygons-hover", [
            "all",
            ["==", ["geometry-type"], "Polygon"],
            ["==", ["get", "hostname"], e.features[0].properties?.hostname || ""],
          ]);
          map.current!.getCanvas().style.cursor = "pointer";
        }
      });

      map.current.on("mouseleave", "multilayer-polygons-fill", () => {
        map.current!.setFilter("multilayer-polygons-hover", [
          "all",
          ["==", ["geometry-type"], "Polygon"],
          ["==", ["get", "hostname"], ""],
        ]);
        map.current!.getCanvas().style.cursor = "";
      });

      // Add click handler for lines - Show LinkDetailsPanel and TopologyDrawer
      map.current.on("click", "multilayer-lines", (e) => {
        if (e.features && e.features.length > 0) {
          console.log("CLICK TEST")
          console.log("CLICK TEST")
          const feature = e.features[0];
          const props = feature.properties;
            const coordinates = e.lngLat; 

          // Extract from/to from the name or use hostname
          const nameParts = (props?.name || "").split("-");
          const from = nameParts[0] || props?.hostname || "Node A";
          const to = nameParts[1] || "Node B";

           const statusColor = props?.status === 'good' ? '#2ECC71' :
            props?.status === 'medium' ? '#F39C12' :
              props?.status === 'low' ? '#E74C3C' : '#2980B9';

          new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
              <div style="font-size: 12px; padding: 8px;">
                <strong style="font-size: 14px; color: ${statusColor};">🔗 ${props?.name || 'Connection Line'}</strong><br/>
                <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;"/>
                <strong>Status:</strong> <span style="color: ${statusColor}; font-weight: 600; text-transform: uppercase;">${props?.status || 'N/A'}</span><br/>
              </div>
            `)
            .addTo(map.current!);
          
          // Set link details for LinkDetailsPanel
          setSelectedLink({
            from,
            to,
            description: props?.name || `${from} → ${to}`,
            bandwidth_mbps: 10000, // 10G default
            utilization: props?.status === "good" ? 65 : props?.status === "medium" ? 75 : 85,
            latency: 5 + Math.random() * 10,
            packetLoss: Math.random() * 0.1,
            linkCount: 2,
            totalCapacity: "10G",
            type: "L2_AGGREGATION",
          });
          setShowLinkDetails(true);

          // Set topology connection for TopologyDrawer
          setTopologyConnection({ from, to });
          setShowTopologyDrawer(true);
        }
      });

      

      

      map.current.on("mouseenter", "multilayer-points", () => {
        map.current!.getCanvas().style.cursor = "pointer";
      });

      map.current.on("mouseleave", "multilayer-points", () => {
        map.current!.getCanvas().style.cursor = "";
      });

      map.current.on("mouseenter", "multilayer-lines", () => {
        map.current!.getCanvas().style.cursor = "pointer";
      });

      map.current.on("mouseleave", "multilayer-lines", () => {
        map.current!.getCanvas().style.cursor = "";
      });

      // eslint-disable-next-line no-console
      console.log("Multilayer map layer added successfully");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error adding multilayer map layer:", error);
      alert(`Error adding multilayer map layer: ${error}`);
    }
  };

  // Toggle multilayer map visibility
  const toggleMultilayerMapLayer = () => {
    if (!map.current) return;

    const newVisibility = !showMultilayerMap;
    setShowMultilayerMap(newVisibility);

    if (newVisibility && !map.current.getLayer("multilayer-points")) {
      // Add layer if it doesn't exist
      addMultilayerMapLayer();
    } else {
      // Toggle visibility
      const visibility = newVisibility ? "visible" : "none";

      const layers = [
        "multilayer-points",
        "multilayer-polygons-fill",
        "multilayer-polygons-outline",
        "multilayer-polygons-hover",
        "multilayer-lines",
        "multilayer-lines-glow",
      ];

      layers.forEach((layerId) => {
        if (map.current!.getLayer(layerId)) {
          map.current!.setLayoutProperty(layerId, "visibility", visibility);
        }
      });
    }
  };

  // Add node edges layer function
  const addNodeEdgesLayer = () => {
    if (!map.current || !nodeEdgesData) {
      return;
    }

    try {
      // Remove existing layers if they exist
      const layersToRemove = ["node-edges-points", "node-edges-lines", "node-edges-lines-glow"];
      layersToRemove.forEach((layerId) => {
        if (map.current!.getLayer(layerId)) {
          map.current!.removeLayer(layerId);
        }
      });

      if (map.current.getSource("node-edges")) {
        map.current.removeSource("node-edges");
      }

      // Create a map of node IDs to their coordinates
      const nodeMap = new Map<string, { x: number; y: number; label: string; size: number }>();
      nodeEdgesData.nodes.forEach((node) => {
        nodeMap.set(node.id, {
          x: node.x,
          y: node.y,
          label: node.label || node.id,
          size: node.size || 3,
        });
      });

      // Helper function to create curved line with bezier curve
      const createCurvedLine = (
        start: [number, number],
        end: [number, number],
        curvature: number = 0.3
      ): [number, number][] => {
        const points: [number, number][] = [];
        const steps = 20; // Number of points in the curve

        // Calculate midpoint
        const midX = (start[0] + end[0]) / 2;
        const midY = (start[1] + end[1]) / 2;

        // Calculate perpendicular offset for curve
        const dx = end[0] - start[0];
        const dy = end[1] - start[1];
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Perpendicular vector
        const perpX = -dy / distance;
        const perpY = dx / distance;

        // Control point offset (creates the curve)
        const offset = distance * curvature;
        const controlX = midX + perpX * offset;
        const controlY = midY + perpY * offset;

        // Generate points along quadratic bezier curve
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const invT = 1 - t;
          
          // Quadratic bezier formula
          const x = invT * invT * start[0] + 2 * invT * t * controlX + t * t * end[0];
          const y = invT * invT * start[1] + 2 * invT * t * controlY + t * t * end[1];
          
          points.push([x, y]);
        }

        return points;
      };

      // Create GeoJSON features for edges with curves
      const lineFeatures = nodeEdgesData.edges
        .map((edge) => {
          const sourceNode = nodeMap.get(edge.source);
          const targetNode = nodeMap.get(edge.target);

          if (!sourceNode || !targetNode) {
            return null;
          }

          // Create curved line coordinates
          const curvedCoordinates = createCurvedLine(
            [sourceNode.x, sourceNode.y],
            [targetNode.x, targetNode.y],
            0.2 // Curvature factor (adjust for more/less curve)
          );

          return {
            type: "Feature" as const,
            properties: {
              // Include ALL edge properties from the original data
              id: edge.id,
              source: edge.source,
              target: edge.target,
              node_a_platform: edge.node_a_platform || "",
              node_b_platform: edge.node_b_platform || "",
              source_capacity_total: edge.source_capacity_total || 0,
              target_capacity_total: edge.target_capacity_total || 0,
              traffic_in: edge.traffic_in,
              traffic_out: edge.traffic_out,
              size: edge.size || 1,
            },
            geometry: {
              type: "LineString" as const,
              coordinates: curvedCoordinates,
            },
          };
        })
        .filter((feature) => feature !== null);

      // Create GeoJSON features for nodes (points) with smaller size
      const pointFeatures = nodeEdgesData.nodes.map((node) => ({
        type: "Feature" as const,
        properties: {
          // Include ALL node properties from the original data
          id: node.id,
          hostname: node.hostname || node.id,
          label: node.label || node.id,
          manufacture: node.manufacture || "",
          platform: node.platform || "",
          reg: node.reg || "",
          sto_l: node.sto_l || "",
          version: node.version || "",
          witel: node.witel || "",
          x: node.x,
          y: node.y,
          size: (node.size || 3) * 0.9,
          // Serialize topology as JSON string for MapLibre properties
          topology: node.topology ? JSON.stringify(node.topology) : undefined,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [node.x, node.y],
        },
      }));

      // Combine all features
      const allFeatures = [...lineFeatures, ...pointFeatures];

      // Debug: Log features to verify data
      console.log('=== Node Edges Layer Created ===');
      console.log('Total edges:', lineFeatures.length);
      console.log('Total nodes:', pointFeatures.length);
      console.log('Sample edge feature:', lineFeatures[0]);
      console.log('Sample edge properties:', lineFeatures[0]?.properties);
      console.log('Sample node feature:', pointFeatures[0]);
      console.log('Sample node properties:', pointFeatures[0]?.properties);
      console.log('================================');

      // Add source with all features
      map.current.addSource("node-edges", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: allFeatures,
        },
      });

      // Add line glow layer (bottom layer) - thinner
      map.current.addLayer({
        id: "node-edges-lines-glow",
        type: "line",
        source: "node-edges",
        filter: ["==", ["geometry-type"], "LineString"],
        paint: {
          "line-color": "#005873ff",
          "line-width": 1, // Reduced from 8
          "line-opacity": 0.2, // Reduced opacity
          "line-blur": 2, // Reduced blur
        },
      });

      // Add line layer - thinner
      map.current.addLayer({
        id: "node-edges-lines",
        type: "line",
        source: "node-edges",
        filter: ["==", ["geometry-type"], "LineString"],
        paint: {
          "line-color": "#00BFFF",
          "line-width": 0.5, // Reduced from 2
          "line-opacity": 0.7, // Slightly reduced opacity
        },
      });

      // Add points layer (top layer) - smaller
      map.current.addLayer({
        id: "node-edges-points",
        type: "circle",
        source: "node-edges",
        filter: ["==", ["geometry-type"], "Point"],
        paint: {
          "circle-radius": ["*", ["get", "size"], 1.2], // Reduced multiplier from 2 to 1.2
          "circle-color": "#FF6B35",
          "circle-stroke-width": 1.5, // Reduced from 2
          "circle-stroke-color": "#FFFFFF",
          "circle-opacity": 0.9,
        },
      });

      // Add click handler for points
      map.current.on("click", "node-edges-points", (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const props = feature.properties;
          const coordinates = e.lngLat;

          // Debug: Log all properties to console
          console.log('=== Node Point Clicked ===');
          console.log('Full feature:', feature);
          console.log('Properties:', props);
          console.log('All property keys:', Object.keys(props || {}));
          console.log('=========================');

          // Parse topology data if it exists
          let topologyData: any[] | undefined;
          try {
            if (props?.topology) {
              const parsed = typeof props.topology === 'string' 
                ? JSON.parse(props.topology) 
                : props.topology;
              topologyData = Array.isArray(parsed) ? parsed : undefined;
            }
          } catch (error) {
            console.error('Error parsing topology data:', error);
          }

          // Show popup with all node data except topology
          const topologyCount = topologyData ? topologyData.length : 0;
          const topologyInfo = topologyCount > 0
            ? `<div style="margin-top: 8px; padding: 6px; background: rgba(255, 107, 53, 0.1); border-radius: 4px; font-size: 11px; color: #FF6B35;">
                <strong>Topology:</strong> ${topologyCount} connections available
              </div>` 
            : '';

          new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(
              `
              <div style="font-size: 12px; padding: 8px; max-width: 320px;">
                <strong style="font-size: 14px; color: #FF6B35;">📡 ${props?.hostname || props?.label || props?.id || "Node"}</strong><br/>
                <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;"/>
                <div style="display: grid; grid-template-columns: auto 1fr; gap: 4px 8px;">
                <strong>Hostname:</strong> <span>${props?.hostname || "N/A"}</span>
                  <strong>Manufacture:</strong> <span>${props?.manufacture || "N/A"}</span>
                  <strong>Platform:</strong> <span>${props?.platform || "N/A"}</span>
                  <strong>Version:</strong> <span>${props?.version || "N/A"}</span>
                  <strong>Region:</strong> <span>${props?.reg || "N/A"}</span>
                  <strong>Witel:</strong> <span>${props?.witel || "N/A"}</span>
                  <strong>STO:</strong> <span>${props?.sto_l || "N/A"}</span>
                  <strong>Size:</strong> <span>${props?.size || "N/A"}</span>
                  <strong>Coordinates:</strong> <span>${props?.x || "N/A"}, ${props?.y || "N/A"}</span>
                </div>
                ${topologyInfo}
              </div>
            `,
            )
            .addTo(map.current!);

          // Show topology drawer for the node with topology data
          const hostname = props?.hostname || props?.label || props?.id || "Node";
          setTopologyConnection({ 
            from: hostname, 
            to: "Network",
            nodeData: props,
            topology: topologyData || undefined
          });
          setShowTopologyDrawer(true);
        }
      });

      // Add click handler for lines
      map.current.on("click", "node-edges-lines", (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const props = feature.properties;
          const coordinates = e.lngLat;

          // Debug: Log all properties to console
          // console.log('=== Edge Line Clicked ===');
          // console.log('Full feature:', feature);
          // console.log('Properties:', props);
          // console.log('All property keys:', Object.keys(props || {}));
          // console.log('========================');

          const from = props?.source || "Node A";
          const to = props?.target || "Node B";
          
          // Calculate capacities in Gbps
          const sourceCapacityGbps = props?.source_capacity_total 
            ? (props.source_capacity_total / 1000).toFixed(2) 
            : "N/A";
          const targetCapacityGbps = props?.target_capacity_total 
            ? (props.target_capacity_total / 1000).toFixed(2) 
            : "N/A";

          // Show popup with all edge details
          new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(
              `
              <div style="font-size: 12px; padding: 8px; max-width: 320px;">
                <strong style="font-size: 14px; color: #00BFFF;">🔗 ${from} → ${to}</strong><br/>
                <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;"/>
                <div style="display: grid; grid-template-columns: auto 1fr; gap: 4px 8px;">
                  <strong>Edge ID:</strong> <span>${props?.id || "N/A"}</span>
                  <strong>Source:</strong> <span>${from}</span>
                  <strong>Target:</strong> <span>${to}</span>
                   <strong>Source Capacity:</strong> <span style="color: #2ECC71; font-weight: 600;">${sourceCapacityGbps} Gbps</span>
                  <strong>Target Capacity:</strong> <span style="color: #3498DB; font-weight: 600;">${targetCapacityGbps} Gbps</span>
                  <strong>Size:</strong> <span>${props?.size || "N/A"}</span>
                </div> 
              </div>
            `,
            )
            .addTo(map.current!);

          // Set link details for LinkDetailsPanel with actual capacity data
          const sourceCapacityMbps = props?.source_capacity_total || 10000;
          const targetCapacityMbps = props?.target_capacity_total || 10000;
          const avgCapacityMbps = (sourceCapacityMbps + targetCapacityMbps) / 2;
          
          setSelectedLink({
            from,
            to,
            description: `${from} → ${to}`,
            bandwidth_mbps: avgCapacityMbps,
            utilization: 60 + Math.random() * 30,
            latency: 5 + Math.random() * 10,
            packetLoss: Math.random() * 0.1,
            linkCount: 1,
            totalCapacity: `${(avgCapacityMbps / 1000).toFixed(1)}G`,
            type: "L2_AGGREGATION",
          });
          setShowLinkDetails(true);

          // Set topology connection for TopologyDrawer
          // setTopologyConnection({ 
          //   from, 
          //   to,
          //   nodeData: props
          // });
          // setShowTopologyDrawer(true);
        }
      });

      // Add hover handlers
      map.current.on("mouseenter", "node-edges-points", () => {
        map.current!.getCanvas().style.cursor = "pointer";
      });

      map.current.on("mouseleave", "node-edges-points", () => {
        map.current!.getCanvas().style.cursor = "";
      });

      map.current.on("mouseenter", "node-edges-lines", () => {
        map.current!.getCanvas().style.cursor = "pointer";
      });

      map.current.on("mouseleave", "node-edges-lines", () => {
        map.current!.getCanvas().style.cursor = "";
      });

      // Calculate bounds to fit all nodes
      if (nodeEdgesData.nodes.length > 0) {
        const lngs = nodeEdgesData.nodes.map((n) => n.x);
        const lats = nodeEdgesData.nodes.map((n) => n.y);
        const bounds = {
          minLng: Math.min(...lngs),
          maxLng: Math.max(...lngs),
          minLat: Math.min(...lats),
          maxLat: Math.max(...lats),
        };

        // Fit map to show all nodes
        map.current.fitBounds(
          [
            [bounds.minLng, bounds.minLat],
            [bounds.maxLng, bounds.maxLat],
          ],
          {
            padding: 50,
            duration: 1000,
          },
        );
      }

      // eslint-disable-next-line no-console
      console.log("Node edges layer added successfully");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error adding node edges layer:", error);
      alert(`Error adding node edges layer: ${error}`);
    }
  };

  // Toggle node edges layer visibility
  const toggleNodeEdgesLayer = () => {
    if (!map.current) return;

    const newVisibility = !showNodeEdgesLayer;
    setShowNodeEdgesLayer(newVisibility);

    if (newVisibility && !map.current.getLayer("node-edges-points")) {
      // Add layer if it doesn't exist
      addNodeEdgesLayer();
    } else {
      // Toggle visibility
      const visibility = newVisibility ? "visible" : "none";

      const layers = ["node-edges-points", "node-edges-lines", "node-edges-lines-glow"];

      layers.forEach((layerId) => {
        if (map.current!.getLayer(layerId)) {
          map.current!.setLayoutProperty(layerId, "visibility", visibility);
        }
      });
    }
  };

  // Helper function: Sync sigma with map (simplified - only one direction)
  const syncSigmaWithMap = (sigma: Sigma) => {
    if (!map.current) return;

    // Compute sigma center
    const center = sigma.viewportToFramedGraph(
      sigma.graphToViewport(latlngToGraph(map.current, map.current.getCenter())),
    );

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
          lng: attributes.longitude,
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
        defaultNodeColor: "#e22352",
        defaultEdgeColor: "#ffaeaf",
        minEdgeThickness: 2,
        stagePadding: 0,
        enableCameraRotation: false,
        renderEdgeLabels: false,
        renderLabels: true,
        labelColor: { color: "#000" },
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
            lng: attrs.longitude,
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
      map.current.on("moveend", fnSyncSigmaWithMap);
      map.current.on("zoomend", fnSyncSigmaWithMap);

      // Cleanup function
      const cleanup = () => {
        if (map.current) {
          map.current.off("moveend", fnSyncSigmaWithMap);
          map.current.off("zoomend", fnSyncSigmaWithMap);
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

  // Add multilayer map layer when data is loaded
  useEffect(() => {
    if (mapLoaded && multilayerMapData && showMultilayerMap && map.current) {
      addMultilayerMapLayer();
    }
  }, [mapLoaded, multilayerMapData, showMultilayerMap]);

  // Add node edges layer when data is loaded
  useEffect(() => {
    if (mapLoaded && nodeEdgesData && showNodeEdgesLayer && map.current) {
      addNodeEdgesLayer();
    }
  }, [mapLoaded, nodeEdgesData, showNodeEdgesLayer]);

  // Add node edges layer when data is loaded
  useEffect(() => {
    if (mapLoaded && nodeEdgesData && showNodeEdgesLayer && map.current) {
      addNodeEdgesLayer();
    }
  }, [mapLoaded, nodeEdgesData, showNodeEdgesLayer]);

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

  // Menu click handler
  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);

    // Show toast notification
    const menuLabels: Record<string, string> = {
      topology: "Topology View",
      dashboard: "Dashboard",
      layers: "Data Layers",
      analytics: "Analytics",
      settings: "Settings",
    };
    setToastMessage(`Switched to ${menuLabels[menu] || menu}`);
    setToastType("info");
    // setShowToast(true);
    // setShowToast(true);
  };

  // Generate search suggestions from active layer data
  useEffect(() => {
    const suggestions: Array<{
      id: string;
      label: string;
      type: string;
      latitude: number;
      longitude: number;
      metadata?: Record<string, any>;
    }> = [];

    // Add capacity layer suggestions
    if (showCapacityLayer && capacityData.length > 0) {
      capacityData.forEach((item, index) => {
        if (item.hostname && item.latitude && item.longitude) {
          suggestions.push({
            id: `capacity-${index}`,
            label: item.hostname,
            type: 'capacity',
            latitude: parseFloat(item.latitude),
            longitude: parseFloat(item.longitude),
            metadata: {
              manufacture: item.manufacture,
              platform: item.platform,
              witel: item.witel,
              sto: item.sto_l || item.sto,
              reg: item.reg
            }
          });
        }
      });
    }

    // Add sirkit layer suggestions
    if (showSirkitLayer && sirkitData.length > 0) {
      sirkitData.forEach((item, index) => {
        if (item.node && item.latitude && item.longitude) {
          suggestions.push({
            id: `sirkit-${index}`,
            label: item.node,
            type: 'sirkit',
            latitude: parseFloat(item.latitude),
            longitude: parseFloat(item.longitude),
            metadata: {
              witel: item.witel,
              sto: item.sto_l || item.sto,
              reg: item.reg,
              platform: item.platform
            }
          });
        }
      });
    }

    // Add multilayer map suggestions
    if (showMultilayerMap && multilayerMapData) {
      multilayerMapData.features.forEach((feature, index) => {
        if (feature.geometry.type === 'Point' && feature.properties) {
          const coords = feature.geometry.coordinates as [number, number];
          suggestions.push({
            id: `multilayer-${index}`,
            label: feature.properties.hostname || feature.properties.label || `Node ${index}`,
            type: 'multilayer',
            latitude: coords[1],
            longitude: coords[0],
            metadata: {
              manufacture: feature.properties.manufacture,
              platform: feature.properties.platform,
              witel: feature.properties.witel,
              sto: feature.properties.sto_l,
              reg: feature.properties.reg
            }
          });
        }
      });
    }

    // Add node edges suggestions
    if (showNodeEdgesLayer && nodeEdgesData) {
      nodeEdgesData.nodes.forEach((node) => {
        suggestions.push({
          id: `nodeedges-${node.id}`,
          label: node.hostname || node.label || node.id,
          type: 'nodeedges',
          latitude: node.y,
          longitude: node.x,
          metadata: {
            manufacture: node.manufacture,
            platform: node.platform,
            witel: node.witel,
            sto: node.sto_l,
            reg: node.reg
          }
        });
      });
    }

    setSearchSuggestions(suggestions);

    // Extract unique platforms from suggestions
    const platforms = new Set<string>();
    suggestions.forEach(suggestion => {
      if (suggestion.metadata?.platform && suggestion.metadata.platform !== 'N/A') {
        platforms.add(suggestion.metadata.platform);
      }
    });
    setPlatformFilters(Array.from(platforms).sort());
  }, [showCapacityLayer, capacityData, showSirkitLayer, sirkitData, showMultilayerMap, multilayerMapData, showNodeEdgesLayer, nodeEdgesData]);

  // Clear filter handler - removes highligd resets filtered suggestions
  const handleClearFilter = () => {
    // Clear filtered suggestions
    setFilteredSuggestions([]);

    // Remove highlight layer from map
    if (map.current) {
      if (map.current.getLayer('filtered-nodes-highlight')) {
        map.current.removeLayer('filtered-nodes-highlight');
      }
      if (map.current.getSource('filtered-nodes')) {
        map.current.removeSource('filtered-nodes');
      }
    }

    // Show toast notification
    setToastMessage('Filter cleared');
    setToastType('info');
    setShowToast(true);
  };

  // Platform filter click handler
  const handlePlatformFilterClick = (platform: string) => {
    // Filter suggestions by platform
    const filtered = searchSuggestions.filter(suggestion => 
      suggestion.metadata?.platform?.toLowerCase() === platform.toLowerCase()
    );
    
    setFilteredSuggestions(filtered);

    // Show toast with filter results
    setToastMessage(`Found ${filtered.length} nodes with platform: ${platform}`);
    setToastType("info");
    setShowToast(true);

    // If only one result, navigate to it automatically
    if (filtered.length === 1 && map.current) {
      const node = filtered[0];
      setTimeout(() => {
        handleSearch(node.label, node);
      }, 500);
    } else if (filtered.length > 1 && map.current) {
      // Add highlight layer for filtered nodes
      if (map.current.getLayer('filtered-nodes-highlight')) {
        map.current.removeLayer('filtered-nodes-highlight');
      }
      if (map.current.getSource('filtered-nodes')) {
        map.current.removeSource('filtered-nodes');
      }

      // Create GeoJSON for filtered nodes
      const filteredFeatures = filtered.map(node => ({
        type: 'Feature' as const,
        properties: {
          label: node.label,
          platform: node.metadata?.platform || 'N/A'
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [node.longitude, node.latitude]
        }
      }));

      map.current.addSource('filtered-nodes', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: filteredFeatures
        }
      });

      map.current.addLayer({
        id: 'filtered-nodes-highlight',
        type: 'circle',
        source: 'filtered-nodes',
        paint: {
          'circle-radius': 9,
          'circle-color': '#1c9cc3ff',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF',
          'circle-opacity': 0.8
        }
      });

      // Add click handler for highlighted nodes
      map.current.on('click', 'filtered-nodes-highlight', (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const props = feature.properties;
          const coordinates = e.lngLat;

          new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
              <div style="font-size: 12px; padding: 8px;">
                <strong style="font-size: 14px; color: #4F46E5;">📍 ${props?.label || 'Node'}</strong><br/>
                <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;"/>
                <strong>Platform:</strong> ${props?.platform || 'N/A'}<br/>
                <div style="margin-top: 8px; font-size: 11px; color: #6B7280;">
                  Click to view details
                </div>
              </div>
            `)
            .addTo(map.current!);
        }
      });

      map.current.on('mouseenter', 'filtered-nodes-highlight', () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', 'filtered-nodes-highlight', () => {
        map.current!.getCanvas().style.cursor = '';
      });

      // Fit map to show all filtered nodes
      const lngs = filtered.map(n => n.longitude);
      const lats = filtered.map(n => n.latitude);
      const bounds = {
        minLng: Math.min(...lngs),
        maxLng: Math.max(...lngs),
        minLat: Math.min(...lats),
        maxLat: Math.max(...lats),
      };

      map.current.fitBounds(
        [
          [bounds.minLng, bounds.minLat],
          [bounds.maxLng, bounds.maxLat],
        ],
        {
          padding: 100,
          duration: 1500,
        }
      );
    } else if (filtered.length === 0) {
      // Remove highlight layer if no results
      if (map.current && map.current.getLayer('filtered-nodes-highlight')) {
        map.current.removeLayer('filtered-nodes-highlight');
      }
      if (map.current && map.current.getSource('filtered-nodes')) {
        map.current.removeSource('filtered-nodes');
      }
    }
  };

  // Search handler with navigation
  const handleSearch = (query: string, suggestion?: {
    id: string;
    label: string;
    type: string;
    latitude: number;
    longitude: number;
    metadata?: Record<string, any>;
  }) => {
    setSearchQuery(query);

    // Clear filtered suggestions when searching
    if (filteredSuggestions.length > 0) {
      setFilteredSuggestions([]);
      // Remove highlight layer
      if (map.current && map.current.getLayer('filtered-nodes-highlight')) {
        map.current.removeLayer('filtered-nodes-highlight');
      }
      if (map.current && map.current.getSource('filtered-nodes')) {
        map.current.removeSource('filtered-nodes');
      }
    }

    if (suggestion && map.current) {
      // Navigate to the selected node/point
      map.current.flyTo({
        center: [suggestion.longitude, suggestion.latitude],
        zoom: 15,
        duration: 2000,
        essential: true
      });

      // Show a popup at the location
      setTimeout(() => {
        if (map.current) {
          new maplibregl.Popup({
            closeButton: true,
            closeOnClick: false
          })
            .setLngLat([suggestion.longitude, suggestion.latitude])
            .setHTML(`
              <div style="font-size: 12px; padding: 8px; max-width: 280px;">
                <strong style="font-size: 14px; color: #4F46E5;">📍 ${suggestion.label}</strong><br/>
                <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;"/>
                <div style="display: grid; grid-template-columns: auto 1fr; gap: 4px 8px;">
                  <strong>Type:</strong> <span>${suggestion.type}</span>
                  ${suggestion.metadata?.manufacture ? `<strong>Manufacture:</strong> <span>${suggestion.metadata.manufacture}</span>` : ''}
                  ${suggestion.metadata?.platform ? `<strong>Platform:</strong> <span>${suggestion.metadata.platform}</span>` : ''}
                  ${suggestion.metadata?.witel ? `<strong>Witel:</strong> <span>${suggestion.metadata.witel}</span>` : ''}
                  ${suggestion.metadata?.sto ? `<strong>STO:</strong> <span>${suggestion.metadata.sto}</span>` : ''}
                  ${suggestion.metadata?.reg ? `<strong>Region:</strong> <span>${suggestion.metadata.reg}</span>` : ''}
                </div>
              </div>
            `)
            .addTo(map.current);
        }
      }, 2100);

      // Show toast notification
      setToastMessage(`Navigating to ${suggestion.label}`);
      setToastType("success");
      setShowToast(true);
    } else if (query.trim()) {
      // Fallback: search by text in suggestions
      const found = searchSuggestions.find(s => 
        s.label.toLowerCase().includes(query.toLowerCase())
      );
      
      if (found && map.current) {
        handleSearch(query, found);
      } else {
        setToastMessage(`No results found for "${query}"`);
        setToastType("error");
        setShowToast(true);
      }
    }
  };

  // Level change handler
  const handleLevelChange = (level: HierarchyLevel) => {
    setCurrentLevel(level);
    const zoomTargets = {
      national: 4.5,
      regional: 6.5,
      witel: 8.5,
      sto: 11,
    };
    handleZoomToLevel(level, zoomTargets[level]);
  };

  // Navigate back handler
  const handleNavigateBack = (level: HierarchyLevel) => {
    setCurrentLevel(level);
    const zoomTargets = {
      national: 4.5,
      regional: 6.5,
      witel: 8.5,
      sto: 11,
    };
    if (map.current) {
      map.current.flyTo({
        zoom: zoomTargets[level],
        duration: 1000,
      });
    }
  };

  // Zoom to level handler
  const handleZoomToLevel = (level: HierarchyLevel, targetZoom: number) => {
    setCurrentZoom(targetZoom);
    setCurrentLevel(level);
    if (map.current) {
      map.current.flyTo({
        zoom: targetZoom,
        duration: 1000,
      });
    }
  };

  // Track zoom changes
  useEffect(() => {
    if (map.current) {
      const handleZoom = () => {
        const zoom = map.current?.getZoom() || 5;
        setCurrentZoom(zoom);

        // Auto-adjust level based on zoom
        let newLevel: HierarchyLevel = "national";
        if (zoom >= 10) {
          newLevel = "sto";
        } else if (zoom >= 8) {
          newLevel = "witel";
        } else if (zoom >= 6) {
          newLevel = "regional";
        }
        if (newLevel !== currentLevel) {
          setCurrentLevel(newLevel);
        }
      };

      map.current.on("zoom", handleZoom);
      return () => {
        map.current?.off("zoom", handleZoom);
      };
    }
    return undefined;
  }, [currentLevel]);

  // Handle layer change with loading state
  const handleLayerChange = async (value: string) => {
    setSelectedLayer(value);
    setIsLayerLoading(true);

    // Small delay to show loading animation
    await new Promise(resolve => setTimeout(resolve, 800));

    // Turn off all layers first
    if (showCapacityLayer) toggleCapacityLayer();
    if (showSigmaLayer) toggleSigmaLayer();
    if (showSirkitLayer) toggleSirkitLayer();
    if (showMultilayerMap) toggleMultilayerMapLayer();
    if (showNodeEdgesLayer) toggleNodeEdgesLayer();

    // For multilayer, show kabupaten first, then multilayer on top
    if (value === "multilayer") {
      // Show kabupaten layer first if not already shown
      if (!showKabupatenLayer) {
        setShowKabupatenLayer(true);
        if (map.current && !map.current.getLayer("kabupaten-fill")) {
          addKabupatenLayer();
        }
        // Wait for kabupaten to render
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      // Then show multilayer on top
      if (!showMultilayerMap) toggleMultilayerMapLayer();
    } else {
      // For other layers, hide kabupaten automatically
      if (showKabupatenLayer) {
        setShowKabupatenLayer(false);
        if (map.current) {
          const visibility = "none";
          if (map.current.getLayer("kabupaten-fill")) {
            map.current.setLayoutProperty("kabupaten-fill", "visibility", visibility);
          }
          if (map.current.getLayer("kabupaten-outline")) {
            map.current.setLayoutProperty("kabupaten-outline", "visibility", visibility);
          }
          if (map.current.getLayer("kabupaten-hover")) {
            map.current.setLayoutProperty("kabupaten-hover", "visibility", visibility);
          }
        }
      }
      
      // Show the selected layer
      if (value === "capacity" && !showCapacityLayer) toggleCapacityLayer();
      else if (value === "sigma" && !showSigmaLayer) toggleSigmaLayer();
      else if (value === "sirkit" && !showSirkitLayer) toggleSirkitLayer();
      else if (value === "nodeedges" && !showNodeEdgesLayer) toggleNodeEdgesLayer();
    }

    // Additional delay for layer rendering
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsLayerLoading(false);
  };

  return (
    <div className="maplibre-view">
      {/* Left Sidebar */}
      <LeftSidebar
        onMenuClick={handleMenuClick}
        activeMenu={activeMenu}
        showKabupatenLayer={showKabupatenLayer}
        kabupatenLoaded={kabupatenLoaded}
        onToggleKabupaten={toggleKabupatenLayer}
        selectedLayer={selectedLayer}
        onLayerChange={handleLayerChange}
        capacityDataLength={capacityData.length}
        sirkitDataLength={sirkitData.length}
        airportsDataAvailable={!!airportsData}
        multilayerMapDataAvailable={!!multilayerMapData}
        nodeEdgesDataAvailable={!!nodeEdgesData}
        isLayerLoading={isLayerLoading}
      />

      {/* Search Bar */}
      <CompactSearchBar 
        onSearch={handleSearch} 
        suggestions={filteredSuggestions.length > 0 ? filteredSuggestions : searchSuggestions}
        platformFilters={platformFilters}
        onFilterClick={handlePlatformFilterClick}
        onClearFilter={handleClearFilter}
      />

      {/* Draggable Network Hierarchy Panel */}
      <DraggableNetworkHierarchy
        currentLevel={currentLevel}
        navigationPath={navigationPath}
        onLevelChange={handleLevelChange}
        onNavigateBack={handleNavigateBack}
        onZoomToLevel={handleZoomToLevel}
        currentZoom={currentZoom}
        totalNodes={capacityData.length}
        totalLinks={0}
      />

      {/* Selection Info Panel */}
      {(selectedRegion || selectedWitel) && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,240,240,0.9))",
            backdropFilter: "blur(20px)",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.3)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
            padding: "16px",
            minWidth: "280px",
            zIndex: 20,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#1F2937" }}>Current Selection</h3>
            <button
              onClick={() => {
                setSelectedRegion(undefined);
                setSelectedWitel(undefined);
                setNavigationPath([{ level: "national", name: "Indonesia" }]);
                setCurrentLevel("national");
                handleZoomToLevel("national", 4.5);
              }}
              style={{
                fontSize: "11px",
                color: "#6B7280",
                background: "none",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Clear All
            </button>
          </div>

          {selectedRegion && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#3B82F6" }} />
              <span style={{ fontSize: "13px", color: "#374151", fontWeight: "500" }}>
                <strong>Region:</strong> {selectedRegion}
              </span>
              <button
                onClick={() => {
                  setSelectedRegion(undefined);
                  setNavigationPath([{ level: "national", name: "Indonesia" }]);
                  setCurrentLevel("national");
                  handleZoomToLevel("national", 4.5);
                }}
                style={{
                  marginLeft: "auto",
                  fontSize: "11px",
                  color: "#3B82F6",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
          )}

          {selectedWitel && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#10B981" }} />
              <span style={{ fontSize: "13px", color: "#374151", fontWeight: "500" }}>
                <strong>Witel:</strong> {selectedWitel}
              </span>
              <button
                onClick={() => {
                  setSelectedWitel(undefined);
                  setNavigationPath([
                    { level: "national", name: "Indonesia" },
                    { level: "regional", name: selectedRegion || "Regional View" },
                  ]);
                  setCurrentLevel("regional");
                  handleZoomToLevel("regional", 6.5);
                }}
                style={{
                  marginLeft: "auto",
                  fontSize: "11px",
                  color: "#10B981",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
          )}

          <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "8px", fontWeight: "500" }}>
            Showing {capacityData.length} nodes
          </div>
        </div>
      )}

      {/* Enhanced Legend with Level Information */}
      <Legend />

      {/* Conditional Panels based on active menu */}
      {activeMenu === "dashboard" && (
        <DashboardPanel
          kpiData={{
            revenue: { value: "2.4M", change: 12 },
            utilization: {
              value:
                capacityData.length > 0
                  ? `${Math.round(
                    capacityData.reduce((acc, item) => {
                      const util = parseFloat(item.utilization || "0");
                      return acc + (isNaN(util) ? 0 : util);
                    }, 0) / capacityData.length,
                  )}%`
                  : "0%",
              change: 5,
            },
            customerCount: { value: "45.2K", change: 8 },
            bandwidth: {
              value:
                capacityData.length > 0
                  ? `${(
                    capacityData.reduce((acc, item) => {
                      const cap = parseFloat(item.capacity || "0");
                      return acc + (isNaN(cap) ? 0 : cap);
                    }, 0) / 1000
                  ).toFixed(1)}TB`
                  : "0TB",
              change: 15,
            },
            historicalTrend: [
              { month: "May", value: 650 },
              { month: "Jun", value: 720 },
              { month: "Jul", value: 680 },
              { month: "Aug", value: 780 },
              { month: "Sep", value: 850 },
              { month: "Oct", value: 920 },
            ],
          }}
          onClose={() => setActiveMenu("topology")}
        />
      )}

      {activeMenu === "layers" && <DataTablePanel elements={capacityData} onClose={() => setActiveMenu("topology")} />}

      {activeMenu === "analytics" && <AnalyticsPage onClose={() => setActiveMenu("topology")} />}

      {activeMenu === "settings" && <SettingsPage onClose={() => setActiveMenu("topology")} />}

      {/* <div className="maplibre-header">
        <div className="header-left">
          <FiMapPin />
          <h2>MapLibre - Visualisasi STO Indonesia</h2>
        </div>
        <div className="header-actions">
          <button className="button upload-btn" onClick={() => setIsModalOpen(true)}>
            <FiUpload /> Tambah Data
          </button>
          <button className="button close-btn" onClick={handleClose}>
            <FiX /> Tutup
          </button>
        </div>
      </div> */}

      <div className="map-container">
        <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
        <div
          ref={sigmaContainer}
          className="sigma-container"
          style={{
            visibility: showSigmaLayer ? "visible" : "hidden",
            pointerEvents: showSigmaLayer ? "auto" : "none",
          }}
        />

        {/* Legend for Multilayer Map */}
        {/*{showMultilayerMap && (
          <div className="map-legend">
            <h4>📊 Legend</h4>

            <div className="legend-section">
              <div className="legend-section-title">Vendor</div>
              <div className="legend-item">
                <div className="legend-color vendor-cisco"></div>
                <span className="legend-label">Cisco</span>
              </div>
              <div className="legend-item">
                <div className="legend-color vendor-huawei"></div>
                <span className="legend-label">Huawei</span>
              </div>
              <div className="legend-item">
                <div className="legend-color vendor-nokia"></div>
                <span className="legend-label">Nokia</span>
              </div>
            </div>

            <div className="legend-section">
              <div className="legend-section-title">Connection Status</div>
              <div className="legend-item">
                <div className="legend-line status-good"></div>
                <span className="legend-label">Good</span>
              </div>
              <div className="legend-item">
                <div className="legend-line status-medium"></div>
                <span className="legend-label">Medium</span>
              </div>
              <div className="legend-item">
                <div className="legend-line status-low"></div>
                <span className="legend-label">Low</span>
              </div>
            </div>
          </div>
        )}*/}
      </div>

      <CSVUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onUpload={handleCSVUpload} />

      {/* Toast Notifications */}
      {showToast && <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />}

      {/* Link Details Panel */}
      {showLinkDetails && selectedLink && (
        <LinkDetailsPanel
          connection={selectedLink}
          onClose={() => {
            setShowLinkDetails(false);
            setSelectedLink(null);
          }}
        />
      )}

      {/* Topology Drawer */}
      {showTopologyDrawer && topologyConnection && (
        <TopologyDrawer
          connection={topologyConnection}
          onClose={() => {
            setShowTopologyDrawer(false);
            setTopologyConnection(null);
          }}
        />
      )}
    </div>
  );
};
