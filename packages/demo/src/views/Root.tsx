import { FullScreenControl, SigmaContainer, ZoomControl } from "@react-sigma/core";
import { DirectedGraph } from "graphology";
import { groupBy, mapValues, uniq } from "lodash";
import { FC, useEffect, useMemo, useState } from "react";
import { BiBookContent, BiRadioCircleMarked } from "react-icons/bi";
import { BsArrowsFullscreen, BsFullscreenExit, BsZoomIn, BsZoomOut } from "react-icons/bs";
import { GrClose } from "react-icons/gr";
import { Settings } from "sigma/settings";

import { drawHover, drawLabel } from "../canvas-utils";
import { FiltersState, NodeData } from "../types";
import DescriptionPanel from "./DescriptionPanel";
import GraphDataController from "./GraphDataController";
import GraphEventsController from "./GraphEventsController";
import GraphSettingsController from "./GraphSettingsController";
import GraphTitle from "./GraphTitle";
import ManufacturerPanel from "./ManufacturerPanel";
import ModelPanel from "./ModelPanel";
import RegionPanel from "./RegionPanel";
import SearchField from "./SearchField";

// Color map for different manufacturers
const MANUFACTURER_COLORS = {
  Cisco: "#1ba1e2",
  Huawei: "#e51400", 
  Arista: "#60a917",
  Juniper: "#f09609",
  MikroTik: "#d80073"
};

const Root: FC = () => {
  const graph = useMemo(() => new DirectedGraph(), []);
  const [showContents, setShowContents] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [dataset, setDataset] = useState<NodeData[] | null>(null);
  const [manufacturers, setManufacturersList] = useState<string[]>([]);
  const [regions, setRegionsList] = useState<string[]>([]);
  const [models, setModelsList] = useState<string[]>([]);
  const [filtersState, setFiltersState] = useState<FiltersState>({
    manufactures: {},
    regions: {},
    models: {},
  });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const sigmaSettings: Partial<Settings> = useMemo(
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
            size: Math.max(5, (node.percentage_used / 100) * 20 + 3), // Size based on port usage
            x: (node.longitude + 180) * 2, // Simple projection
            y: -(node.latitude + 90) * 2,   // Simple projection (inverted Y)
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
    </div>
  );
};

export default Root;
