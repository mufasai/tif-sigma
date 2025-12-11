import { FullScreenControl, SigmaContainer, ZoomControl } from "@react-sigma/core";
import { DirectedGraph } from "graphology";
import forceAtlas2 from "graphology-layout-forceatlas2";
import { groupBy, mapValues, uniq } from "lodash";
import { FC, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiBookContent, BiRadioCircleMarked } from "react-icons/bi";
import { BsArrowsFullscreen, BsFullscreenExit, BsZoomIn, BsZoomOut } from "react-icons/bs";
import { GrClose } from "react-icons/gr";
import { MdAdd } from "react-icons/md";
import { FiMap } from "react-icons/fi";
import { AiOutlineMergeCells } from "react-icons/ai";
import { drawHover, drawLabel } from "../canvas-utils";
import { FiltersState, GraphInputData, NodeData } from "../types";
import Toast, { ToastType } from "../components/Toast";
import DataInputModal from "./DataInputModal";
import DescriptionPanel from "./DescriptionPanel";
import GraphDataController from "./GraphDataController";
import GraphEventsController from "./GraphEventsController";
import GraphSettingsController from "./GraphSettingsController";
import GraphTitle from "./GraphTitle";
import ManufacturerPanel from "./ManufacturerPanel";
import ModelPanel from "./ModelPanel";
import RegionPanel from "./RegionPanel";
import SearchField from "./SearchField";
import { CsvJoinView } from "./CsvJoinView";

// Color map for different manufacturers
const MANUFACTURER_COLORS = {
  Cisco: "#1ba1e2",
  Huawei: "#e51400",
  Arista: "#60a917",
  Juniper: "#f09609",
  MikroTik: "#d80073"
};

const Root: FC = () => {
  const navigate = useNavigate();
  const graph = useMemo(() => new DirectedGraph(), []);
  const [showContents, setShowContents] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [dataset, setDataset] = useState<NodeData[] | null>(null);
  const [manufacturers, setManufacturersList] = useState<string[]>([]);
  const [regions, setRegionsList] = useState<string[]>([]);
  const [models, setModelsList] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCsvJoin, setShowCsvJoin] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [filtersState, setFiltersState] = useState<FiltersState>({
    manufactures: {},
    regions: {},
    models: {},
  });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sigmaSettings: Record<string, any> = useMemo(
    () => ({
      defaultDrawNodeLabel: drawLabel,
      defaultDrawNodeHover: drawHover,
      defaultNodeType: "circle",
      defaultEdgeType: "arrow",
      labelDensity: 0.07,
      labelGridCellSize: 60,
      labelRenderedSizeThreshold: 15,
      labelFont: "Lato, sans-serif",
      zIndex: true,
    }),
    [],
  );

  // Load data on mount:
  useEffect(() => {
    fetch(`./dataset.json`)
      .then((res) => res.json())
      .then((nodes: NodeData[]) => {
        // Clear existing graph
        graph.clear();

        // Get unique values for filters
        const manufactures = uniq(nodes.map(n => n.manufacture));
        const regions = uniq(nodes.map(n => n.region));
        const models = uniq(nodes.map(n => n.model));

        // Set the lists for the panels
        setManufacturersList(manufactures);
        setRegionsList(regions);
        setModelsList(models);

        // Add nodes to graph
        nodes.forEach((node) => {
          const color = MANUFACTURER_COLORS[node.manufacture as keyof typeof MANUFACTURER_COLORS] || "#666666";

          graph.addNode(node.hostname, {
            ...node,
            label: node.hostname,
            color,
            size: Math.max(5, ((node.percentage_used || 50) / 100) * 20 + 3), // Size based on port usage
            x: ((node.longitude || 0) + 180) * 2, // Simple projection
            y: -((node.latitude || 0) + 90) * 2,   // Simple projection (inverted Y)
          });
        });

        // Create some connections based on proximity or same region (optional)
        // This creates a basic network topology
        const regionGroups = groupBy(nodes, 'region');
        Object.values(regionGroups).forEach(regionNodes => {
          if (regionNodes.length > 1) {
            // Connect nodes in the same region
            for (let i = 0; i < regionNodes.length - 1; i++) {
              for (let j = i + 1; j < regionNodes.length; j++) {
                // Only connect some nodes to avoid too many edges
                if (Math.random() > 0.7) {
                  graph.addEdge(regionNodes[i].hostname, regionNodes[j].hostname, {
                    size: 1,
                    color: "#cccccc"
                  });
                }
              }
            }
          }
        });

        // Set initial filter states
        setFiltersState({
          manufactures: mapValues(groupBy(manufactures, m => m), () => true),
          regions: mapValues(groupBy(regions, r => r), () => true),
          models: mapValues(groupBy(models, m => m), () => true),
        });

        setDataset(nodes);
        requestAnimationFrame(() => setDataReady(true));
      });
  }, [graph]);

  // Function to handle adding new dynamic data
  const handleAddData = (inputData: GraphInputData) => {
    const { nodes: newNodes, edges: newEdges } = inputData;

    // Add new nodes to the graph
    newNodes.forEach((node) => {
      // Skip if node already exists
      if (graph.hasNode(node.hostname)) {
        console.warn(`Node ${node.hostname} already exists, skipping...`);
        return;
      }

      const color = MANUFACTURER_COLORS[node.manufacture as keyof typeof MANUFACTURER_COLORS] || "#666666";

      // Use provided coordinates or generate random position for ForceAtlas2
      const x = node.longitude !== undefined ? (node.longitude + 180) * 2 : Math.random() * 1000;
      const y = node.latitude !== undefined ? -(node.latitude + 90) * 2 : Math.random() * 1000;

      graph.addNode(node.hostname, {
        ...node,
        label: node.hostname,
        color,
        size: Math.max(5, ((node.percentage_used || 50) / 100) * 20 + 3),
        x,
        y,
      });
    });

    // Add new edges to the graph
    if (newEdges && newEdges.length > 0) {
      newEdges.forEach((edge) => {
        // Check if both nodes exist
        if (!graph.hasNode(edge.source)) {
          console.warn(`Source node ${edge.source} not found, skipping edge...`);
          return;
        }
        if (!graph.hasNode(edge.target)) {
          console.warn(`Target node ${edge.target} not found, skipping edge...`);
          return;
        }

        // Skip if edge already exists
        if (graph.hasEdge(edge.source, edge.target)) {

          return;
        }

        graph.addEdge(edge.source, edge.target, {
          size: edge.size || 1,
          color: edge.color || "#cccccc",
          label: edge.label || "",
        });
      });
    }

    // Apply ForceAtlas2 layout to reposition nodes
    const settings = forceAtlas2.inferSettings(graph);
    forceAtlas2.assign(graph, {
      iterations: 100,
      settings: {
        ...settings,
        gravity: 1,
        scalingRatio: 10,
      }
    });

    // Update dataset with new nodes
    const updatedDataset = dataset ? [...dataset, ...newNodes] : newNodes;
    setDataset(updatedDataset);

    // Update filter lists
    const allManufacturers = uniq(updatedDataset.map(n => n.manufacture));
    const allRegions = uniq(updatedDataset.map(n => n.region));
    const allModels = uniq(updatedDataset.map(n => n.model));

    setManufacturersList(allManufacturers);
    setRegionsList(allRegions);
    setModelsList(allModels);

    // Update filters to include new items (set them to visible by default)
    setFiltersState((currentFilters) => ({
      manufactures: {
        ...currentFilters.manufactures,
        ...mapValues(groupBy(allManufacturers.filter(m => !currentFilters.manufactures[m]), m => m), () => true),
      },
      regions: {
        ...currentFilters.regions,
        ...mapValues(groupBy(allRegions.filter(r => !currentFilters.regions[r]), r => r), () => true),
      },
      models: {
        ...currentFilters.models,
        ...mapValues(groupBy(allModels.filter(m => !currentFilters.models[m]), m => m), () => true),
      },
    }));
  };

  const showNotification = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  if (!dataset) return null;

  return (
    <div id="app-root" className={showContents ? "show-contents" : ""}>
      <SigmaContainer graph={graph} settings={sigmaSettings} className="react-sigma">
        <GraphSettingsController hoveredNode={hoveredNode} />
        <GraphEventsController setHoveredNode={setHoveredNode} />
        <GraphDataController filters={filtersState} />

        {dataReady && (
          <>
            <div className="controls">
              <div className="react-sigma-control ico">
                <button
                  type="button"
                  className="show-contents"
                  onClick={() => setShowContents(true)}
                  title="Show caption and description"
                >
                  <BiBookContent />
                </button>
              </div>
              <div className="react-sigma-control ico">
                <button
                  type="button"
                  className="maplibre-view"
                  onClick={() => navigate('/map')}
                  title="Switch to MapLibre view"
                >
                  <FiMap />
                </button>
              </div>
              <div className="react-sigma-control ico">
                <button
                  type="button"
                  className="csv-join-view"
                  onClick={() => setShowCsvJoin(true)}
                  title="CSV Join Tool"
                >
                  <AiOutlineMergeCells />
                </button>
              </div>
              <div className="react-sigma-control ico">
                <button
                  type="button"
                  className="add-data"
                  onClick={() => setIsModalOpen(true)}
                  title="Add dynamic data"
                >
                  <MdAdd />
                </button>
              </div>
              <FullScreenControl className="ico">
                <BsArrowsFullscreen />
                <BsFullscreenExit />
              </FullScreenControl>

              <ZoomControl className="ico">
                <BsZoomIn />
                <BsZoomOut />
                <BiRadioCircleMarked />
              </ZoomControl>
            </div>
            <div className="contents">
              <div className="ico">
                <button
                  type="button"
                  className="ico hide-contents"
                  onClick={() => setShowContents(false)}
                  title="Hide caption and description"
                >
                  <GrClose />
                </button>
              </div>
              <GraphTitle filters={filtersState} />
              <div className="panels">
                <SearchField filters={filtersState} />
                <DescriptionPanel />
                <ManufacturerPanel
                  manufacturers={manufacturers}
                  filters={filtersState}
                  setManufacturers={(manufactures) =>
                    setFiltersState((filters) => ({
                      ...filters,
                      manufactures,
                    }))
                  }
                  toggleManufacturer={(manufacturer) => {
                    setFiltersState((filters) => ({
                      ...filters,
                      manufactures: filters.manufactures[manufacturer]
                        ? { ...filters.manufactures, [manufacturer]: false }
                        : { ...filters.manufactures, [manufacturer]: true },
                    }));
                  }}
                />
                <RegionPanel
                  regions={regions}
                  filters={filtersState}
                  setRegions={(regions) =>
                    setFiltersState((filters) => ({
                      ...filters,
                      regions,
                    }))
                  }
                  toggleRegion={(region) => {
                    setFiltersState((filters) => ({
                      ...filters,
                      regions: filters.regions[region]
                        ? { ...filters.regions, [region]: false }
                        : { ...filters.regions, [region]: true },
                    }));
                  }}
                />
                <ModelPanel
                  models={models}
                  filters={filtersState}
                  setModels={(models) =>
                    setFiltersState((filters) => ({
                      ...filters,
                      models,
                    }))
                  }
                  toggleModel={(model) => {
                    setFiltersState((filters) => ({
                      ...filters,
                      models: filters.models[model]
                        ? { ...filters.models, [model]: false }
                        : { ...filters.models, [model]: true },
                    }));
                  }}
                />
              </div>
            </div>
          </>
        )}
      </SigmaContainer>

      {showCsvJoin && (
        <CsvJoinView onClose={() => setShowCsvJoin(false)} />
      )}

      <DataInputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddData}
        onNotify={showNotification}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Root;
