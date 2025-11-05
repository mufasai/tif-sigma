import { useSigma } from "@react-sigma/core";
import { keyBy, mapValues, sortBy, values } from "lodash";
import { FC, useEffect, useMemo, useState } from "react";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import { MdDeviceHub } from "react-icons/md";

import { FiltersState } from "../types";
import Panel from "./Panel";

// Color map for different models
const MODEL_COLORS = {
  "7050X3": "#FF7F50",
  "S5720": "#87CEEB", 
  "MX480": "#DDA0DD",
  "CCR1036": "#98FB98",
  "Nexus9000": "#F0E68C"
};

const ModelPanel: FC<{
  models: string[];
  filters: FiltersState;
  toggleModel: (model: string) => void;
  setModels: (models: Record<string, boolean>) => void;
}> = ({ models, filters, toggleModel, setModels }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();

  const nodesPerModel = useMemo(() => {
    const index: Record<string, number> = {};
    graph.forEachNode((_, { model }) => (index[model] = (index[model] || 0) + 1));
    return index;
  }, [graph]);

  const maxNodesPerModel = useMemo(() => Math.max(...values(nodesPerModel)), [nodesPerModel]);
  const visibleModelsCount = useMemo(() => Object.keys(filters.models).length, [filters]);

  const [visibleNodesPerModel, setVisibleNodesPerModel] = useState<Record<string, number>>(nodesPerModel);
  useEffect(() => {
    // To ensure the graphology instance has up to date "hidden" values for
    // nodes, we wait for next frame before reindexing. This won't matter in the
    // UX, because of the visible nodes bar width transition.
    requestAnimationFrame(() => {
      const index: Record<string, number> = {};
      graph.forEachNode((_, { model, hidden }) => !hidden && (index[model] = (index[model] || 0) + 1));
      setVisibleNodesPerModel(index);
    });
  }, [filters, graph]);

  const sortedModels = useMemo(
    () => sortBy(models, (model) => -nodesPerModel[model]),
    [models, nodesPerModel],
  );

  return (
    <Panel
      title={
        <>
          <MdDeviceHub className="text-muted" /> Models
          {visibleModelsCount < models.length ? (
            <span className="text-muted text-small">
              {" "}
              ({visibleModelsCount} / {models.length})
            </span>
          ) : (
            ""
          )}
        </>
      }
    >
      <p>
        <i className="text-muted">Click a model to show/hide related switches from the network.</i>
      </p>
      <p className="buttons">
        <button className="btn" onClick={() => setModels(mapValues(keyBy(models, m => m), () => true))}>
          <AiOutlineCheckCircle /> Check all
        </button>{" "}
        <button className="btn" onClick={() => setModels({})}>
          <AiOutlineCloseCircle /> Uncheck all
        </button>
      </p>
      <ul>
        {sortedModels.map((model) => {
          const nodesCount = nodesPerModel[model];
          const visibleNodesCount = visibleNodesPerModel[model] || 0;
          const color = MODEL_COLORS[model as keyof typeof MODEL_COLORS] || "#999999";
          return (
            <li
              className="caption-row"
              key={model}
              title={`${nodesCount} switch${nodesCount > 1 ? "es" : ""} with model ${model}${
                visibleNodesCount !== nodesCount
                  ? visibleNodesCount > 0
                    ? ` (only ${visibleNodesCount > 1 ? `${visibleNodesCount} are` : "one is"} visible)`
                    : " (all hidden)"
                  : ""
              }`}
            >
              <input
                type="checkbox"
                checked={filters.models[model] || false}
                onChange={() => toggleModel(model)}
                id={`model-${model}`}
              />
              <label htmlFor={`model-${model}`}>
                <span className="circle" style={{ background: color, borderColor: color }} />{" "}
                <div className="node-label">
                  <span>{model}</span>
                  <div className="bar" style={{ width: (100 * nodesCount) / maxNodesPerModel + "%" }}>
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

export default ModelPanel;