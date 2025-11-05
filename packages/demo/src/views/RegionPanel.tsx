import { useSigma } from "@react-sigma/core";
import { keyBy, mapValues, sortBy, values } from "lodash";
import { FC, useEffect, useMemo, useState } from "react";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import { MdLocationOn } from "react-icons/md";

import { FiltersState } from "../types";
import Panel from "./Panel";

// Color map for different regions
const REGION_COLORS = {
  Jakarta: "#FF6B6B",
  Yogyakarta: "#4ECDC4", 
  Medan: "#45B7D1",
  Bandung: "#96CEB4",
  Surabaya: "#FFEAA7",
  Makassar: "#DDA0DD",
  Denpasar: "#98D8C8",
  Balikpapan: "#F7DC6F"
};

const RegionPanel: FC<{
  regions: string[];
  filters: FiltersState;
  toggleRegion: (region: string) => void;
  setRegions: (regions: Record<string, boolean>) => void;
}> = ({ regions, filters, toggleRegion, setRegions }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();

  const nodesPerRegion = useMemo(() => {
    const index: Record<string, number> = {};
    graph.forEachNode((_, { region }) => (index[region] = (index[region] || 0) + 1));
    return index;
  }, [graph]);

  const maxNodesPerRegion = useMemo(() => Math.max(...values(nodesPerRegion)), [nodesPerRegion]);
  const visibleRegionsCount = useMemo(() => Object.keys(filters.regions).length, [filters]);

  const [visibleNodesPerRegion, setVisibleNodesPerRegion] = useState<Record<string, number>>(nodesPerRegion);
  useEffect(() => {
    // To ensure the graphology instance has up to date "hidden" values for
    // nodes, we wait for next frame before reindexing. This won't matter in the
    // UX, because of the visible nodes bar width transition.
    requestAnimationFrame(() => {
      const index: Record<string, number> = {};
      graph.forEachNode((_, { region, hidden }) => !hidden && (index[region] = (index[region] || 0) + 1));
      setVisibleNodesPerRegion(index);
    });
  }, [filters, graph]);

  const sortedRegions = useMemo(
    () => sortBy(regions, (region) => -nodesPerRegion[region]),
    [regions, nodesPerRegion],
  );

  return (
    <Panel
      title={
        <>
          <MdLocationOn className="text-muted" /> Regions
          {visibleRegionsCount < regions.length ? (
            <span className="text-muted text-small">
              {" "}
              ({visibleRegionsCount} / {regions.length})
            </span>
          ) : (
            ""
          )}
        </>
      }
    >
      <p>
        <i className="text-muted">Click a region to show/hide related switches from the network.</i>
      </p>
      <p className="buttons">
        <button className="btn" onClick={() => setRegions(mapValues(keyBy(regions, r => r), () => true))}>
          <AiOutlineCheckCircle /> Check all
        </button>{" "}
        <button className="btn" onClick={() => setRegions({})}>
          <AiOutlineCloseCircle /> Uncheck all
        </button>
      </p>
      <ul>
        {sortedRegions.map((region) => {
          const nodesCount = nodesPerRegion[region];
          const visibleNodesCount = visibleNodesPerRegion[region] || 0;
          const color = REGION_COLORS[region as keyof typeof REGION_COLORS] || "#888888";
          return (
            <li
              className="caption-row"
              key={region}
              title={`${nodesCount} switch${nodesCount > 1 ? "es" : ""} in ${region}${
                visibleNodesCount !== nodesCount
                  ? visibleNodesCount > 0
                    ? ` (only ${visibleNodesCount > 1 ? `${visibleNodesCount} are` : "one is"} visible)`
                    : " (all hidden)"
                  : ""
              }`}
            >
              <input
                type="checkbox"
                checked={filters.regions[region] || false}
                onChange={() => toggleRegion(region)}
                id={`region-${region}`}
              />
              <label htmlFor={`region-${region}`}>
                <span className="circle" style={{ background: color, borderColor: color }} />{" "}
                <div className="node-label">
                  <span>{region}</span>
                  <div className="bar" style={{ width: (100 * nodesCount) / maxNodesPerRegion + "%" }}>
                    <div
                      className="inside-bar"
                      style={{
                        width: (100 * visibleNodesCount) / nodesCount + "%",
                      }}
                    />
                  </div>
                </div>
              </label>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
};

export default RegionPanel;