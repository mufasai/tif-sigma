import { useSigma } from "@react-sigma/core";
import { keyBy, mapValues, sortBy, values } from "lodash";
import { FC, useEffect, useMemo, useState } from "react";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import { MdBusiness } from "react-icons/md";

import { FiltersState } from "../types";
import Panel from "./Panel";

// Color map for different manufacturers
const MANUFACTURER_COLORS = {
  Cisco: "#1ba1e2",
  Huawei: "#e51400", 
  Arista: "#60a917",
  Juniper: "#f09609",
  MikroTik: "#d80073"
};

const ManufacturerPanel: FC<{
  manufacturers: string[];
  filters: FiltersState;
  toggleManufacturer: (manufacturer: string) => void;
  setManufacturers: (manufacturers: Record<string, boolean>) => void;
}> = ({ manufacturers, filters, toggleManufacturer, setManufacturers }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();

  const nodesPerManufacturer = useMemo(() => {
    const index: Record<string, number> = {};
    graph.forEachNode((_, { manufacture }) => (index[manufacture] = (index[manufacture] || 0) + 1));
    return index;
  }, [graph]);

  const maxNodesPerManufacturer = useMemo(() => Math.max(...values(nodesPerManufacturer)), [nodesPerManufacturer]);
  const visibleManufacturersCount = useMemo(() => Object.keys(filters.manufactures).length, [filters]);

  const [visibleNodesPerManufacturer, setVisibleNodesPerManufacturer] = useState<Record<string, number>>(nodesPerManufacturer);
  useEffect(() => {
    // To ensure the graphology instance has up to date "hidden" values for
    // nodes, we wait for next frame before reindexing. This won't matter in the
    // UX, because of the visible nodes bar width transition.
    requestAnimationFrame(() => {
      const index: Record<string, number> = {};
      graph.forEachNode((_, { manufacture, hidden }) => !hidden && (index[manufacture] = (index[manufacture] || 0) + 1));
      setVisibleNodesPerManufacturer(index);
    });
  }, [filters, graph]);

  const sortedManufacturers = useMemo(
    () => sortBy(manufacturers, (manufacturer) => -nodesPerManufacturer[manufacturer]),
    [manufacturers, nodesPerManufacturer],
  );

  return (
    <Panel
      title={
        <>
          <MdBusiness className="text-muted" /> Manufacturers
          {visibleManufacturersCount < manufacturers.length ? (
            <span className="text-muted text-small">
              {" "}
              ({visibleManufacturersCount} / {manufacturers.length})
            </span>
          ) : (
            ""
          )}
        </>
      }
    >
      <p>
        <i className="text-muted">Click a manufacturer to show/hide related switches from the network.</i>
      </p>
      <p className="buttons">
        <button className="btn" onClick={() => setManufacturers(mapValues(keyBy(manufacturers, m => m), () => true))}>
          <AiOutlineCheckCircle /> Check all
        </button>{" "}
        <button className="btn" onClick={() => setManufacturers({})}>
          <AiOutlineCloseCircle /> Uncheck all
        </button>
      </p>
      <ul>
        {sortedManufacturers.map((manufacturer) => {
          const nodesCount = nodesPerManufacturer[manufacturer];
          const visibleNodesCount = visibleNodesPerManufacturer[manufacturer] || 0;
          const color = MANUFACTURER_COLORS[manufacturer as keyof typeof MANUFACTURER_COLORS] || "#666666";
          return (
            <li
              className="caption-row"
              key={manufacturer}
              title={`${nodesCount} switch${nodesCount > 1 ? "es" : ""}${
                visibleNodesCount !== nodesCount
                  ? visibleNodesCount > 0
                    ? ` (only ${visibleNodesCount > 1 ? `${visibleNodesCount} are` : "one is"} visible)`
                    : " (all hidden)"
                  : ""
              }`}
            >
              <input
                type="checkbox"
                checked={filters.manufactures[manufacturer] || false}
                onChange={() => toggleManufacturer(manufacturer)}
                id={`manufacturer-${manufacturer}`}
              />
              <label htmlFor={`manufacturer-${manufacturer}`}>
                <span className="circle" style={{ background: color, borderColor: color }} />{" "}
                <div className="node-label">
                  <span>{manufacturer}</span>
                  <div className="bar" style={{ width: (100 * nodesCount) / maxNodesPerManufacturer + "%" }}>
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

export default ManufacturerPanel;